-- Speed up public catalog pages that filter active products and sort by recency.
CREATE INDEX IF NOT EXISTS idx_products_status_created_at
  ON public.products(status, created_at DESC);

