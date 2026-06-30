#!/usr/bin/env python3
"""
Import selected Wellona category data into the Apindex Supabase catalog.

Default mode imports factual catalog fields only. Use
--include-copyrighted-content only when you have permission to reuse the source
descriptions/images.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import time
from dataclasses import dataclass, field
from html import escape, unescape
from html.parser import HTMLParser
from typing import Any
from urllib.parse import urljoin, urlparse
from urllib.robotparser import RobotFileParser

import requests


SOURCE_BASE_URL = "https://wellonapharma.com"
FINISHED_PRODUCTS_INDEX_URL = f"{SOURCE_BASE_URL}/category/finished-products"
SOURCE_CATEGORIES = {
    "anaesthetic": f"{SOURCE_BASE_URL}/category/finished/anaesthetic",
    "analgesic": f"{SOURCE_BASE_URL}/category/finished/analgesic",
    "angiography": f"{SOURCE_BASE_URL}/category/finished/angiography",
}

EXPECTED_COUNTS = {
    "anaesthetic": 12,
    "analgesic": 53,
    "angiography": 1,
}

CANONICAL_SUBCATEGORIES = {
    "tablet": "Tablet",
    "tablets": "Tablet",
    "capsule": "Capsule",
    "capsules": "Capsule",
    "eye / ear drops": "Eye / Ear Drops",
    "eye / ear drop": "Eye / Ear Drops",
    "eye/ear drops": "Eye / Ear Drops",
    "eye/ear drop": "Eye / Ear Drops",
    "eye drops": "Eye / Ear Drops",
    "eye drop": "Eye / Ear Drops",
    "ear drops": "Eye / Ear Drops",
    "ear drop": "Eye / Ear Drops",
    "injection": "Injection",
    "injections": "Injection",
    "creams": "Creams",
    "cream": "Creams",
    "gel": "Creams",
    "suspension/syrup": "Suspension / Syrup",
    "suspension / syrup": "Suspension / Syrup",
    "suspension": "Suspension / Syrup",
    "syrup": "Suspension / Syrup",
    "other": "Other",
}

DETAIL_LABELS = {
    "product name": "product_name",
    "trade name": "trade_name",
    "available strength": "available_strength",
    "available combination": "available_combination",
    "packing": "packing",
    "pack insert/leaflet": "pack_insert_leaflet",
    "pack insert / leaflet": "pack_insert_leaflet",
    "therapeutic use": "therapeutic_use",
    "therapeutic use ": "therapeutic_use",
    "production capacity": "production_capacity",
}

BLOCK_TAGS = {
    "address",
    "article",
    "aside",
    "blockquote",
    "br",
    "div",
    "dl",
    "fieldset",
    "figcaption",
    "figure",
    "footer",
    "form",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "header",
    "hr",
    "li",
    "main",
    "nav",
    "ol",
    "p",
    "section",
    "table",
    "td",
    "th",
    "tr",
    "ul",
}

VOID_TAGS = {
    "area",
    "base",
    "br",
    "col",
    "embed",
    "hr",
    "img",
    "input",
    "link",
    "meta",
    "param",
    "source",
    "track",
    "wbr",
}

NON_TEXT_TAGS = {
    "noscript",
    "script",
    "style",
    "svg",
    "template",
}


@dataclass
class Element:
    tag: str
    attrs: dict[str, str] = field(default_factory=dict)
    children: list["Element | str"] = field(default_factory=list)
    parent: "Element | None" = None

    def text(self, separator: str = " ") -> str:
        parts: list[str] = []

        def walk(node: "Element | str") -> None:
            if isinstance(node, str):
                value = normalize_space(node)
                if value:
                    parts.append(value)
                return

            if node.tag in NON_TEXT_TAGS:
                return

            if node.tag in BLOCK_TAGS and parts and parts[-1] != "\n":
                parts.append("\n")
            for child in node.children:
                walk(child)
            if node.tag in BLOCK_TAGS and parts and parts[-1] != "\n":
                parts.append("\n")

        walk(self)
        text = separator.join(part for part in parts if part != "\n")
        if separator == "\n":
            text = "\n".join(part for part in parts if part and part != "\n")
        return normalize_multiline(text)

    def descendants(self) -> list["Element"]:
        items: list[Element] = []
        for child in self.children:
            if isinstance(child, Element):
                items.append(child)
                items.extend(child.descendants())
        return items

    def next_sibling_elements(self) -> list["Element"]:
        if not self.parent:
            return []
        siblings = self.parent.children
        try:
            index = siblings.index(self)
        except ValueError:
            return []
        return [node for node in siblings[index + 1 :] if isinstance(node, Element)]


class TreeParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.root = Element("document")
        self.stack = [self.root]

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        element = Element(
            tag=tag.lower(),
            attrs={key.lower(): value or "" for key, value in attrs},
            parent=self.stack[-1],
        )
        self.stack[-1].children.append(element)
        if tag.lower() not in VOID_TAGS:
            self.stack.append(element)

    def handle_endtag(self, tag: str) -> None:
        tag = tag.lower()
        for index in range(len(self.stack) - 1, 0, -1):
            if self.stack[index].tag == tag:
                del self.stack[index:]
                return

    def handle_data(self, data: str) -> None:
        if data.strip():
            self.stack[-1].children.append(data)


@dataclass
class ProductSeed:
    category_slug: str
    category_name: str
    category_handle: str
    subcategory: str
    name: str
    handle: str
    source_url: str


@dataclass
class ProductImportRow(ProductSeed):
    details: dict[str, str | bool | None]
    description: str | None
    image_url: str | None
    image_urls: list[str]


def normalize_space(value: str) -> str:
    return unescape(value).replace("\xa0", " ").strip()


def normalize_multiline(value: str) -> str:
    lines = [re.sub(r"\s+", " ", line).strip() for line in value.splitlines()]
    return "\n".join(line for line in lines if line)


def slugify(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return slug or "item"


def normalize_subcategory(value: str) -> str:
    key = normalize_space(value).lower()
    return CANONICAL_SUBCATEGORIES.get(key, "Other")


def parse_html(html: str) -> Element:
    parser = TreeParser()
    parser.feed(html)
    return parser.root


def find_all(root: Element, tag: str | None = None) -> list[Element]:
    return [
        element
        for element in root.descendants()
        if tag is None or element.tag == tag.lower()
    ]


def has_class(element: Element, class_name: str) -> bool:
    return class_name in element.attrs.get("class", "").split()


def first_text(root: Element, tag: str) -> str | None:
    for element in find_all(root, tag):
        text = element.text()
        if text:
            return text
    return None


def load_env(path: str = ".env") -> None:
    if not os.path.exists(path):
        return
    with open(path, "r", encoding="utf-8") as env_file:
        for line in env_file:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


def create_session() -> requests.Session:
    session = requests.Session()
    session.headers.update(
        {
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36"
            ),
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
        }
    )
    return session


def robots_allows(url: str, user_agent: str) -> bool:
    parser = RobotFileParser()
    parser.set_url(urljoin(SOURCE_BASE_URL, "/robots.txt"))
    try:
        parser.read()
    except Exception:
        return True
    return parser.can_fetch(user_agent, url)


def fetch_html(
    session: requests.Session,
    url: str,
    timeout: int = 45,
    retries: int = 4,
    retry_delay: float = 3,
) -> str:
    last_response: requests.Response | None = None
    for attempt in range(retries + 1):
        response = session.get(url, timeout=timeout)
        last_response = response
        if response.status_code not in {429, 500, 502, 503, 504}:
            response.raise_for_status()
            return response.text

        if attempt == retries:
            break

        retry_after = response.headers.get("Retry-After")
        if retry_after and retry_after.isdigit():
            wait_seconds = float(retry_after)
        else:
            wait_seconds = retry_delay * (attempt + 1)
        print(
            f"  Retry {attempt + 1}/{retries} after {response.status_code} "
            f"for {url}; waiting {wait_seconds:.1f}s"
        )
        time.sleep(wait_seconds)

    assert last_response is not None
    last_response.raise_for_status()
    return last_response.text


def discover_finished_categories(session: requests.Session) -> dict[str, str]:
    root = parse_html(fetch_html(session, FINISHED_PRODUCTS_INDEX_URL))
    categories: dict[str, str] = {}

    for link in find_all(root, "a"):
        href = link.attrs.get("href", "")
        if "/category/finished/" not in href:
            continue
        absolute_url = urljoin(SOURCE_BASE_URL, href)
        path = urlparse(absolute_url).path.rstrip("/")
        slug = path.split("/")[-1].strip().lower()
        if not slug or slug == "finished-products":
            continue
        if "/category/finished/" not in path:
            continue
        categories.setdefault(slug, absolute_url)

    return categories


def extract_category_products(root: Element, category_slug: str) -> list[ProductSeed]:
    category_name = first_text(root, "h1") or category_slug.title()
    category_handle = slugify(category_name)
    products: list[ProductSeed] = []

    for heading in find_all(root, "h5"):
        label = heading.text()
        if not label:
            continue

        subcategory = normalize_subcategory(label)
        if subcategory == "Other" and label.lower() not in CANONICAL_SUBCATEGORIES:
            continue

        for sibling in heading.next_sibling_elements():
            if re.fullmatch(r"h[1-6]", sibling.tag):
                break
            for link in find_all(sibling, "a"):
                href = link.attrs.get("href", "")
                if "/product/finished/" not in href:
                    continue
                name = link.text()
                if not name:
                    continue
                source_url = urljoin(SOURCE_BASE_URL, href)
                handle = slugify(urlparse(source_url).path.rstrip("/").split("/")[-1])
                products.append(
                    ProductSeed(
                        category_slug=category_slug,
                        category_name=category_name,
                        category_handle=category_handle,
                        subcategory=subcategory,
                        name=name,
                        handle=handle,
                        source_url=source_url,
                    )
                )

    deduped: dict[str, ProductSeed] = {}
    for product in products:
        deduped[product.handle] = product
    return list(deduped.values())


def parse_pack_insert(value: str | None) -> bool | None:
    if value is None:
        return None
    normalized = value.strip().lower()
    if normalized in {"yes", "true", "available"}:
        return True
    if normalized in {"no", "false", "not available"}:
        return False
    return None


def extract_detail_rows(root: Element) -> dict[str, str | bool | None]:
    details: dict[str, str | bool | None] = {}
    text = root.text(separator="\n")
    pattern = re.compile(
        r"^(Product Name|Trade Name|Available Strength|Available Combination|"
        r"Packing|Pack Insert/Leaflet|Pack Insert / Leaflet|Therapeutic use|"
        r"Therapeutic Use|Production Capacity)\s*:?\s*(.*)$",
        re.IGNORECASE,
    )
    lines = [line.strip() for line in text.splitlines() if line.strip()]

    for index, line in enumerate(lines):
        match = pattern.match(line)
        if not match:
            continue
        key = DETAIL_LABELS.get(match.group(1).strip().lower())
        if not key:
            continue
        value = normalize_space(match.group(2))
        if not value and index + 1 < len(lines):
            value = normalize_space(lines[index + 1])
        if not value:
            continue
        details[key] = parse_pack_insert(value) if key == "pack_insert_leaflet" else value

    return details


def clean_node_text(node: Element | str) -> str:
    parts: list[str] = []

    def walk(child: Element | str) -> None:
        if isinstance(child, str):
            value = normalize_space(child)
            if value:
                parts.append(value)
            return

        if child.tag in NON_TEXT_TAGS:
            return

        style = child.attrs.get("style", "").lower()
        if child.tag == "span" and "font-family: symbol" in style:
            return

        for grandchild in child.children:
            walk(grandchild)

    walk(node)
    text = normalize_space(" ".join(parts))
    text = re.sub(r"^[\u00b7\u2022\.\-\u2013\u2014]\s*", "", text)
    text = re.sub(r"\s+", " ", text).strip()
    return "" if text in {"\u00b7", "\u2022", ".", "-", "\u2013", "\u2014"} else text


def strip_tags(value: str) -> str:
    return normalize_space(re.sub(r"<[^>]+>", "", unescape(value)))


def clean_inline_html(node: Element | str) -> str:
    def walk(child: Element | str) -> str:
        if isinstance(child, str):
            return escape(normalize_space(child))

        if child.tag in NON_TEXT_TAGS:
            return ""

        style = child.attrs.get("style", "").lower()
        if child.tag == "span" and "font-family: symbol" in style:
            return ""
        if child.tag == "br":
            return "<br>"

        inner = " ".join(
            part for part in (walk(grandchild) for grandchild in child.children) if part
        )
        inner = normalize_inline_html(inner)
        if not inner:
            return ""

        is_bold = (
            child.tag in {"strong", "b"}
            or "font-weight: bold" in style
            or "font-weight:bold" in style
            or "font-weight: 700" in style
            or "font-weight:700" in style
        )
        if is_bold:
            return f"<strong>{inner}</strong>"

        return inner

    html = normalize_inline_html(walk(node))
    html = re.sub(r"^(?:&middot;|\u00b7|\u2022|\.|\-|\u2013|\u2014)\s*", "", html)
    return "" if strip_tags(html) in {"", "\u00b7", "\u2022", ".", "-", "\u2013", "\u2014"} else html


def normalize_inline_html(value: str) -> str:
    normalized = re.sub(r"\s+", " ", value).strip()
    normalized = re.sub(r"\s+([,.;:!?])", r"\1", normalized)
    normalized = normalized.replace("<br> ", "<br>").replace(" <br>", "<br>")
    return normalized


def previous_element_sibling(element: Element) -> Element | None:
    if not element.parent:
        return None
    siblings = element.parent.children
    try:
        index = siblings.index(element)
    except ValueError:
        return None

    for sibling in reversed(siblings[:index]):
        if isinstance(sibling, Element):
            return sibling
    return None


def extract_structured_description(
    root: Element, fallback_heading: str | None = None
) -> str | None:
    description_blocks = [
        element for element in find_all(root) if has_class(element, "description-p")
    ]
    if not description_blocks:
        return None

    description_block = description_blocks[0]
    html_parts: list[str] = []
    list_items: list[str] = []

    def flush_list() -> None:
        if not list_items:
            return
        html_parts.append("<ul>")
        html_parts.extend(f"<li>{item}</li>" for item in list_items)
        html_parts.append("</ul>")
        list_items.clear()

    heading_source = previous_element_sibling(description_block)
    if heading_source and has_class(heading_source, "desc"):
        heading_html = clean_inline_html(heading_source)
        if heading_html and strip_tags(heading_html).lower() != "description":
            html_parts.append(f"<h3>{heading_html}</h3>")

    for child in description_block.children:
        if not isinstance(child, Element) or child.tag in NON_TEXT_TAGS:
            continue

        inline_html = clean_inline_html(child)
        if not inline_html:
            continue

        if child.tag in {"h1", "h2", "h3", "h4", "h5", "h6"}:
            flush_list()
            html_parts.append(f"<h3>{inline_html}</h3>")
            continue

        if child.tag in {"ul", "ol"}:
            flush_list()
            tag = child.tag
            items = [
                clean_inline_html(item)
                for item in child.descendants()
                if item.tag == "li"
            ]
            items = [item for item in items if item]
            if items:
                html_parts.append(f"<{tag}>")
                html_parts.extend(f"<li>{item}</li>" for item in items)
                html_parts.append(f"</{tag}>")
            continue

        style = child.attrs.get("style", "").lower()
        if child.tag == "p" and "mso-list" in style:
            list_items.append(inline_html)
            continue

        if (
            child.tag == "p"
            and inline_html.startswith("<strong>")
            and inline_html.endswith("</strong>")
            and len(strip_tags(inline_html)) <= 120
        ):
            flush_list()
            html_parts.append(f"<h3>{inline_html}</h3>")
            continue

        flush_list()
        html_parts.append(f"<p>{inline_html}</p>")

    flush_list()
    if html_parts and not any(part.startswith("<h3>") for part in html_parts):
        heading = f"{fallback_heading.strip()} Overview" if fallback_heading else "Product Overview"
        html_parts.insert(0, f"<h3>{escape(heading)}</h3>")
    return "\n".join(html_parts) if html_parts else None


def extract_description(root: Element, product_name: str | None = None) -> str | None:
    structured_description = extract_structured_description(root, product_name)
    if structured_description:
        return structured_description

    text = root.text(separator="\n")
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    start_index = next(
        (
            index
            for index, line in enumerate(lines)
            if line.strip().lower() == "description"
        ),
        -1,
    )
    if start_index == -1:
        close_indexes = [
            index for index, line in enumerate(lines) if line.strip().lower() == "close"
        ]
        if close_indexes:
            description = "\n".join(lines[close_indexes[-1] + 1 :]).strip()
        else:
            start = text.lower().find("description")
            if start == -1:
                return None

            description = text[start + len("description") :].strip()
    else:
        description = "\n".join(lines[start_index + 1 :]).strip()

    if not description:
        return None

    stop_markers = [
        "\nAddress\n",
        "\nFind Us On Map\n",
        "\nGet in touch\n",
        "\nAdditional Links\n",
        "\nGlobal Certifications\n",
        "\nCopyright ",
        "\n×\n",
        "\n×\nAddress",
    ]
    stop_markers.extend(["\n\u00d7\n", "\n\u00d7\nAddress"])
    for marker in stop_markers:
        stop = description.find(marker)
        if stop != -1:
            description = description[:stop]

    description = normalize_multiline(description)
    return format_description_html(description) if description else None


def legacy_format_description_html(description: str) -> str:
    paragraphs = [
        paragraph.strip()
        for paragraph in re.split(r"\n+", description)
        if paragraph.strip() and paragraph.strip() != "×"
    ]
    if not paragraphs:
        paragraphs = [description.strip()]

    return "\n".join(f"<p>{escape(paragraph)}</p>" for paragraph in paragraphs)


def extract_product_image(root: Element, product_name: str) -> str | None:
    candidates: list[str] = []
    product_words = set(re.findall(r"[a-z0-9]+", product_name.lower()))

    for image in find_all(root, "img"):
        src = image.attrs.get("src", "")
        if not src:
            continue
        absolute_src = urljoin(SOURCE_BASE_URL, src)
        haystack = f"{image.attrs.get('alt', '')} {absolute_src}".lower()
        score = 0
        if "product_actual_img" in haystack:
            score += 5
        if "product_resize_img" in haystack:
            score += 4
        if product_words and any(word in haystack for word in product_words):
            score += 2
        if score > 0:
            candidates.append(f"{score}|{absolute_src}")

    if not candidates:
        return None

    candidates.sort(reverse=True)
    return candidates[0].split("|", 1)[1]


def format_description_html(description: str) -> str:
    raw_lines = [
        line.strip()
        for line in description.splitlines()
        if line.strip() and line.strip() != "\u00d7"
    ]
    lines: list[str] = []
    index = 0
    while index < len(raw_lines):
        line = raw_lines[index]
        if line in {",", ".", ":"}:
            if lines:
                lines[-1] = f"{lines[-1]}{line}"
            index += 1
            continue

        if (
            line.lower() == "as a trusted"
            and index + 4 < len(raw_lines)
            and raw_lines[index + 2] == ","
        ):
            lines.append(
                " ".join(
                    [
                        line,
                        raw_lines[index + 1],
                        raw_lines[index + 2],
                        raw_lines[index + 3],
                        raw_lines[index + 4],
                    ]
                )
                .replace(" ,", ",")
                .strip()
            )
            index += 5
            continue

        lines.append(line)
        index += 1

    if not lines:
        return f"<p>{escape(description.strip())}</p>"

    html_parts: list[str] = []
    list_items: list[str] = []

    def flush_list() -> None:
        if not list_items:
            return
        html_parts.append("<ul>")
        html_parts.extend(f"<li>{item}</li>" for item in list_items)
        html_parts.append("</ul>")
        list_items.clear()

    def is_heading(line: str, index: int) -> bool:
        lower = line.lower().strip()
        if index == 0:
            return True
        heading_starts = (
            "uses of ",
            "side effects",
            "side-effects",
            "why choose",
            "precautions",
            "how to use",
        )
        heading_contains = (
            " mechanism of action",
            " pharmacology",
            " precautions ",
            " - precautions",
            " - side-effects",
            " - side effects",
            " uses",
            " side-effects",
        )
        return (
            lower.endswith("?")
            or lower.startswith(heading_starts)
            or any(token in lower for token in heading_contains)
        )

    def begins_list_context(line: str) -> bool:
        lower = line.lower()
        return (
            lower.endswith("used for:")
            or lower.endswith("symptoms:")
            or "following diseases" in lower
            or "following symptoms" in lower
            or lower.startswith("side effects")
            or lower.startswith("why choose")
        )

    def is_short_list_candidate(line: str) -> bool:
        words = line.split()
        return len(words) <= 9 and not line.endswith(".")

    list_context = False
    index = 0
    while index < len(lines):
        line = lines[index]
        next_line = lines[index + 1] if index + 1 < len(lines) else ""

        if is_heading(line, index):
            flush_list()
            html_parts.append(f"<h3>{escape(line)}</h3>")
            list_context = begins_list_context(line)
            index += 1
            continue

        if re.match(r"^[\-\u2013\u2014\u2022]\s*", line):
            list_items.append(
                escape(re.sub(r"^[\-\u2013\u2014\u2022]\s*", "", line).strip())
            )
            list_context = True
            index += 1
            continue

        if next_line and re.match(r"^[\-\u2013\u2014]\s*", next_line):
            item_text = re.sub(r"^[\-\u2013\u2014]\s*", "", next_line).strip()
            list_items.append(
                f"<strong>{escape(line)}</strong> {escape(item_text)}"
            )
            list_context = True
            index += 2
            continue

        if (
            list_context
            and line.lower() == "leading"
            and next_line.lower().startswith("manufacturer")
        ):
            list_items.append(
                f"<strong>{escape(line)}</strong> {escape(next_line)}"
            )
            index += 2
            continue

        if list_context and is_short_list_candidate(line):
            list_items.append(escape(line))
            index += 1
            continue

        flush_list()
        html_parts.append(f"<p>{escape(line)}</p>")
        list_context = begins_list_context(line)
        index += 1

    flush_list()
    return "\n".join(html_parts)


def extract_product_images(root: Element, product_name: str) -> list[str]:
    product_images: list[str] = []
    seen_product_images: set[str] = set()
    for image in find_all(root, "img"):
        src = image.attrs.get("src", "")
        if not src or "product_img" not in image.attrs.get("class", "").split():
            continue
        absolute_src = urljoin(SOURCE_BASE_URL, src)
        dedupe_key = absolute_src.split("?", 1)[0]
        if dedupe_key in seen_product_images:
            continue
        seen_product_images.add(dedupe_key)
        product_images.append(absolute_src)

    if product_images:
        return product_images

    candidates: list[tuple[int, int, str]] = []
    product_words = set(re.findall(r"[a-z0-9]+", product_name.lower()))

    for order, image in enumerate(find_all(root, "img")):
        src = image.attrs.get("src", "")
        if not src:
            continue
        absolute_src = urljoin(SOURCE_BASE_URL, src)
        css_class = image.attrs.get("class", "")
        haystack = f"{image.attrs.get('alt', '')} {css_class} {absolute_src}".lower()
        score = 0
        if "product_img" in css_class:
            score += 20
        if "thumb_img" in css_class:
            score += 12
        if "product_actual_img" in haystack:
            score += 5
        if "product_resize_img" in haystack:
            score += 4
        if product_words and any(word in haystack for word in product_words):
            score += 2
        if score > 0:
            candidates.append((score, order, absolute_src))

    image_urls: list[str] = []
    seen: set[str] = set()
    for _, _, absolute_src in sorted(candidates, key=lambda item: (-item[0], item[1])):
        dedupe_key = absolute_src.split("?", 1)[0]
        if dedupe_key in seen:
            continue
        seen.add(dedupe_key)
        image_urls.append(absolute_src)

    return image_urls


def fetch_product_detail(
    session: requests.Session,
    seed: ProductSeed,
    include_copyrighted_content: bool,
) -> ProductImportRow:
    html = fetch_html(session, seed.source_url)
    root = parse_html(html)
    details = extract_detail_rows(root)
    name = str(details.get("product_name") or seed.name)
    image_urls = (
        extract_product_images(root, name) if include_copyrighted_content else []
    )

    return ProductImportRow(
        **{
            **seed.__dict__,
            "name": name,
            "details": details,
            "description": extract_description(root, name) if include_copyrighted_content else None,
            "image_url": image_urls[0] if image_urls else None,
            "image_urls": image_urls,
        }
    )


class SupabaseRestClient:
    def __init__(self) -> None:
        supabase_url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "").rstrip("/")
        service_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
        if not supabase_url or not service_key:
            raise RuntimeError(
                "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env"
            )

        self.base_url = f"{supabase_url}/rest/v1"
        self.headers = {
            "apikey": service_key,
            "Authorization": f"Bearer {service_key}",
            "Content-Type": "application/json",
        }

    def upsert(
        self,
        table: str,
        payload: dict[str, Any],
        on_conflict: str,
        select: str = "*",
    ) -> dict[str, Any]:
        headers = {
            **self.headers,
            "Prefer": "resolution=merge-duplicates,return=representation",
        }
        response = requests.post(
            f"{self.base_url}/{table}",
            params={"on_conflict": on_conflict, "select": select},
            headers=headers,
            data=json.dumps(payload),
            timeout=45,
        )
        try:
            response.raise_for_status()
        except requests.HTTPError as error:
            raise RuntimeError(
                f"Supabase upsert failed for {table}: "
                f"{response.status_code} {response.text}"
            ) from error
        data = response.json()
        if not data:
            raise RuntimeError(f"Supabase upsert returned no row for {table}")
        return data[0]


def build_product_payload(row: ProductImportRow, include_copyrighted_content: bool) -> dict[str, Any]:
    pharma_details = {
        "trade_name": row.details.get("trade_name"),
        "available_strength": row.details.get("available_strength"),
        "available_combination": row.details.get("available_combination"),
        "packing": row.details.get("packing"),
        "pack_insert_leaflet": row.details.get("pack_insert_leaflet"),
        "therapeutic_use": row.details.get("therapeutic_use"),
        "production_capacity": row.details.get("production_capacity"),
        "brochure_url": None,
    }
    pharma_details = {
        key: value for key, value in pharma_details.items() if value is not None
    }

    metadata = {
        "product_subcategory": row.subcategory,
        "pharma_details": pharma_details,
        "import_source": "wellona",
        "source_url": row.source_url,
        "source_category": row.category_slug,
    }

    short_description = (
        f"{row.name} listed under {row.category_name} ({row.subcategory})."
    )
    description = (
        row.description
        if include_copyrighted_content and row.description
        else (
            f"{short_description}\n\n"
            f"Imported factual catalog record. Source reference: {row.source_url}"
        )
    )

    return {
        "handle": row.handle,
        "name": row.name,
        "description": description,
        "short_description": short_description,
        "price": 0,
        "currency_code": "inr",
        "image_url": row.image_url,
        "thumbnail": row.image_url,
        "images": row.image_urls,
        "stock_count": 0,
        "metadata": metadata,
        "status": "active",
    }


def import_row(client: SupabaseRestClient, row: ProductImportRow, include_copyrighted_content: bool) -> None:
    category = client.upsert(
        "categories",
        {
            "name": row.category_name,
            "handle": row.category_handle,
            "description": f"Imported therapeutic category from {SOURCE_BASE_URL}.",
            "image_url": None,
        },
        on_conflict="handle",
        select="id,handle",
    )

    product_payload = build_product_payload(row, include_copyrighted_content)
    product_payload["category_id"] = category["id"]
    product = client.upsert(
        "products",
        product_payload,
        on_conflict="handle",
        select="id,handle",
    )

    client.upsert(
        "product_categories",
        {
            "product_id": product["id"],
            "category_id": category["id"],
        },
        on_conflict="product_id,category_id",
        select="product_id,category_id",
    )


def scrape_categories(
    categories: list[str],
    source_categories: dict[str, str],
    include_copyrighted_content: bool,
    delay_seconds: float,
) -> list[ProductImportRow]:
    session = create_session()
    user_agent = session.headers["User-Agent"]
    rows: list[ProductImportRow] = []

    for slug in categories:
        url = source_categories[slug]
        if not robots_allows(url, user_agent):
            raise RuntimeError(f"robots.txt disallows scraping {url}")

        print(f"Fetching category: {slug} -> {url}")
        root = parse_html(fetch_html(session, url))
        seeds = extract_category_products(root, slug)
        expected = EXPECTED_COUNTS.get(slug)
        print(f"  Found {len(seeds)} products" + (f" (expected {expected})" if expected else ""))

        for index, seed in enumerate(seeds, start=1):
            if not robots_allows(seed.source_url, user_agent):
                print(f"  Skipping disallowed product: {seed.source_url}")
                continue
            print(f"  [{index}/{len(seeds)}] {seed.name}")
            rows.append(
                fetch_product_detail(session, seed, include_copyrighted_content)
            )
            if delay_seconds > 0:
                time.sleep(delay_seconds)

    return rows


def print_summary(rows: list[ProductImportRow]) -> None:
    by_category: dict[str, int] = {}
    by_subcategory: dict[str, int] = {}
    for row in rows:
        by_category[row.category_name] = by_category.get(row.category_name, 0) + 1
        key = f"{row.category_name} / {row.subcategory}"
        by_subcategory[key] = by_subcategory.get(key, 0) + 1

    print("\nSummary")
    print(f"  Total products: {len(rows)}")
    for category, count in sorted(by_category.items()):
        print(f"  {category}: {count}")
    print("\nSubcategories")
    for key, count in sorted(by_subcategory.items()):
        print(f"  {key}: {count}")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Import Wellona products into Apindex.")
    parser.add_argument(
        "--categories",
        default="anaesthetic,analgesic,angiography",
        help="Comma-separated source category slugs, or 'all' to discover every finished-products category.",
    )
    parser.add_argument(
        "--exclude-categories",
        default="",
        help="Comma-separated source category slugs to skip after category selection.",
    )
    parser.add_argument("--dry-run", action="store_true", help="Scrape and print without DB writes.")
    parser.add_argument("--commit", action="store_true", help="Write scraped rows into Supabase.")
    parser.add_argument(
        "--include-copyrighted-content",
        action="store_true",
        help="Import source descriptions and images. Use only with permission.",
    )
    parser.add_argument(
        "--delay",
        type=float,
        default=0.25,
        help="Delay in seconds between product detail requests.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    if args.dry_run == args.commit:
        print("Choose exactly one mode: --dry-run or --commit", file=sys.stderr)
        return 2

    load_env()
    category_input = [slug.strip().lower() for slug in args.categories.split(",") if slug.strip()]
    excluded_categories = {
        slug.strip().lower()
        for slug in args.exclude_categories.split(",")
        if slug.strip()
    }
    source_categories = dict(SOURCE_CATEGORIES)
    if category_input == ["all"]:
        session = create_session()
        discovered_categories = discover_finished_categories(session)
        source_categories.update(discovered_categories)
        categories = list(discovered_categories.keys())
        print(
            f"Discovered {len(discovered_categories)} finished-product categories "
            f"from {FINISHED_PRODUCTS_INDEX_URL}"
        )
    else:
        categories = category_input

    if excluded_categories:
        categories = [slug for slug in categories if slug not in excluded_categories]

    unknown = [slug for slug in categories if slug not in source_categories]
    if unknown:
        session = create_session()
        discovered_categories = discover_finished_categories(session)
        source_categories.update(discovered_categories)
        unknown = [slug for slug in categories if slug not in source_categories]
    if unknown:
        print(f"Unknown categories: {', '.join(unknown)}", file=sys.stderr)
        return 2

    rows = scrape_categories(
        categories=categories,
        source_categories=source_categories,
        include_copyrighted_content=args.include_copyrighted_content,
        delay_seconds=args.delay,
    )
    print_summary(rows)

    if args.dry_run:
        print("\nDry run complete. No Supabase rows were changed.")
        return 0

    client = SupabaseRestClient()
    print("\nImporting into Supabase...")
    for index, row in enumerate(rows, start=1):
        print(f"  [{index}/{len(rows)}] {row.category_name} / {row.subcategory} / {row.name}")
        import_row(client, row, args.include_copyrighted_content)

    print("\nImport complete.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
