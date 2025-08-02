-- Demo table and permissive RLS for anon testing (for demo only)
CREATE TABLE IF NOT EXISTS public.test_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.test_items ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'test_items' AND policyname = 'Allow read to anon'
  ) THEN
    CREATE POLICY "Allow read to anon"
    ON public.test_items
    FOR SELECT
    TO anon
    USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'test_items' AND policyname = 'Allow insert to anon'
  ) THEN
    CREATE POLICY "Allow insert to anon"
    ON public.test_items
    FOR INSERT
    TO anon
    WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'test_items' AND policyname = 'Allow update to anon'
  ) THEN
    CREATE POLICY "Allow update to anon"
    ON public.test_items
    FOR UPDATE
    TO anon
    USING (true)
    WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'test_items' AND policyname = 'Allow delete to anon'
  ) THEN
    CREATE POLICY "Allow delete to anon"
    ON public.test_items
    FOR DELETE
    TO anon
    USING (true);
  END IF;
END $$;