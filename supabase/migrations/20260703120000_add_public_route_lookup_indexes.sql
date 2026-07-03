-- Speed up public product/category route lookups.
CREATE INDEX IF NOT EXISTS idx_products_status_handle
  ON public.products(status, handle);

CREATE INDEX IF NOT EXISTS idx_product_categories_category_product
  ON public.product_categories(category_id, product_id);

CREATE INDEX IF NOT EXISTS idx_categories_handle
  ON public.categories(handle);
