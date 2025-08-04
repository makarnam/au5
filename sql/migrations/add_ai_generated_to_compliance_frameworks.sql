-- Migration: add_ai_generated_to_compliance_frameworks
-- Adds ai_generated boolean column to compliance_frameworks for AI provenance

ALTER TABLE public.compliance_frameworks
  ADD COLUMN IF NOT EXISTS ai_generated boolean DEFAULT false;

-- Optional: backfill existing rows to false where null (safety for older rows)
UPDATE public.compliance_frameworks
SET ai_generated = COALESCE(ai_generated, false)
WHERE ai_generated IS NULL;