import Image, { getImageProps } from "next/image"

export default function ProductsHeroSection() {
  const imageAlt =
    "Apindex Pharma Lignodex ampoules, Mebendex suspension, Telmiwell tablets and Kitowell cream displayed on white platforms."
  const {
    props: { srcSet: mobileSrcSet },
  } = getImageProps({
    src: "/products-hero-global-reach-mobile.webp",
    alt: imageAlt,
    width: 1254,
    height: 1254,
    sizes: "100vw",
  })

  return (
    <section
      aria-labelledby="products-hero-heading"
      aria-describedby="products-hero-description"
      className="bg-slate-50 pt-20"
    >
      <h1 id="products-hero-heading" className="sr-only">
        Quality Healthcare. Global Reach.
      </h1>
      <p id="products-hero-description" className="sr-only">
        Explore our range of finished pharmaceutical products for your market.
      </p>
      <picture className="block">
        <source
          media="(max-width: 767px)"
          srcSet={mobileSrcSet}
          sizes="100vw"
          width={1254}
          height={1254}
        />
        <Image
          src="/products-hero-global-reach.webp"
          alt={imageAlt}
          width={2172}
          height={724}
          loading="eager"
          fetchPriority="high"
          sizes="100vw"
          className="block h-auto w-full object-contain"
        />
      </picture>
    </section>
  )
}
