-- AI Configuration Schema Migration
-- This ensures the database schema matches the application code

-- =============================================================================
-- Drop existing objects if they exist (for clean migration)
-- =============================================================================

DROP TABLE IF EXISTS ai_generation_logs CASCADE;
DROP TABLE IF EXISTS ai_configurations CASCADE;
DROP TYPE IF EXISTS ai_provider_enum CASCADE;

-- =============================================================================
-- Create AI provider enumeration
-- =============================================================================

CREATE TYPE ai_provider_enum AS ENUM ('ollama', 'openai', 'claude', 'gemini');

-- =============================================================================
-- Create AI configurations table
-- =============================================================================

CREATE TABLE public.ai_configurations (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  provider public.ai_provider_enum NOT NULL,
  model_name character varying(100) NOT NULL,
  api_endpoint character varying(500) NULL,
  api_key text NULL,
  max_tokens integer NULL DEFAULT 2000,
  temperature numeric(3, 2) NULL DEFAULT 0.7,
  is_active boolean NULL DEFAULT true,
  created_by uuid NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),

  CONSTRAINT ai_configurations_pkey PRIMARY KEY (id),
  CONSTRAINT fk_ai_config_created_by FOREIGN KEY (created_by) REFERENCES auth.users (id) ON DELETE CASCADE,
  CONSTRAINT ai_config_max_tokens_range CHECK (
    (max_tokens >= 100 AND max_tokens <= 10000)
  ),
  CONSTRAINT ai_config_model_name_not_empty CHECK (
    (length(TRIM(both from model_name)) > 0)
  ),
  CONSTRAINT ai_config_temperature_range CHECK (
    (temperature >= 0.0 AND temperature <= 2.0)
  )
) TABLESPACE pg_default;

-- =============================================================================
-- Create AI generation logs table
-- =============================================================================

CREATE TABLE public.ai_generation_logs (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  user_id uuid NULL,
  provider public.ai_provider_enum NOT NULL,
  model_name character varying(100) NOT NULL,
  prompt text NOT NULL,
  response text NULL,
  tokens_used integer NULL DEFAULT 0,
  request_type character varying(50) NOT NULL,
  entity_type character varying(50) NULL,
  entity_id uuid NULL,
  success boolean NULL DEFAULT true,
  error_message text NULL,
  created_at timestamp with time zone NULL DEFAULT now(),

  CONSTRAINT ai_generation_logs_pkey PRIMARY KEY (id),
  CONSTRAINT fk_ai_log_user_id FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE SET NULL,
  CONSTRAINT ai_log_tokens_used_positive CHECK (tokens_used >= 0)
) TABLESPACE pg_default;

-- =============================================================================
-- Create indexes for performance
-- =============================================================================

-- AI Configurations indexes
CREATE INDEX IF NOT EXISTS idx_ai_config_created_by
ON public.ai_configurations USING btree (created_by) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_ai_config_provider
ON public.ai_configurations USING btree (provider) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_ai_config_active
ON public.ai_configurations USING btree (is_active) TABLESPACE pg_default
WHERE (is_active = true);

-- AI Generation Logs indexes
CREATE INDEX IF NOT EXISTS idx_ai_log_user_id
ON public.ai_generation_logs USING btree (user_id) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_ai_log_provider
ON public.ai_generation_logs USING btree (provider) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_ai_log_created_at
ON public.ai_generation_logs USING btree (created_at DESC) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_ai_log_request_type
ON public.ai_generation_logs USING btree (request_type) TABLESPACE pg_default;

-- =============================================================================
-- Create triggers for updated_at timestamp
-- =============================================================================

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for ai_configurations
CREATE TRIGGER trigger_ai_configurations_updated_at
BEFORE UPDATE ON ai_configurations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- Row Level Security (RLS) Policies
-- =============================================================================

-- Enable RLS on both tables
ALTER TABLE public.ai_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_generation_logs ENABLE ROW LEVEL SECURITY;

-- AI Configurations policies
CREATE POLICY "Users can view their own AI configurations"
ON public.ai_configurations FOR SELECT
USING (auth.uid() = created_by);

CREATE POLICY "Users can insert their own AI configurations"
ON public.ai_configurations FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own AI configurations"
ON public.ai_configurations FOR UPDATE
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can delete their own AI configurations"
ON public.ai_configurations FOR DELETE
USING (auth.uid() = created_by);

-- AI Generation Logs policies
CREATE POLICY "Users can view their own AI generation logs"
ON public.ai_generation_logs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own AI generation logs"
ON public.ai_generation_logs FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admins can view all configurations and logs (optional)
CREATE POLICY "Admins can view all AI configurations"
ON public.ai_configurations FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.raw_user_meta_data->>'role' IN ('admin', 'super_admin')
  )
);

CREATE POLICY "Admins can view all AI generation logs"
ON public.ai_generation_logs FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.raw_user_meta_data->>'role' IN ('admin', 'super_admin')
  )
);

-- =============================================================================
-- Insert sample configurations for testing (optional)
-- =============================================================================

-- Uncomment the following to insert sample configurations:
/*
INSERT INTO public.ai_configurations (
  provider,
  model_name,
  api_endpoint,
  temperature,
  max_tokens,
  created_by,
  is_active
) VALUES
  ('ollama', 'llama2', 'http://localhost:11434', 0.7, 500, auth.uid(), true),
  ('openai', 'gpt-3.5-turbo', null, 0.7, 500, auth.uid(), false);
*/

-- =============================================================================
-- Verification queries
-- =============================================================================

-- Verify tables were created
DO $$
DECLARE
    table_count INTEGER;
    enum_count INTEGER;
BEGIN
    -- Count created tables
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name IN ('ai_configurations', 'ai_generation_logs');

    -- Count created enums
    SELECT COUNT(*) INTO enum_count
    FROM pg_type
    WHERE typname = 'ai_provider_enum';

    -- Report results
    RAISE NOTICE 'Migration completed successfully!';
    RAISE NOTICE 'Tables created: %', table_count;
    RAISE NOTICE 'Enums created: %', enum_count;

    IF table_count < 2 THEN
        RAISE EXCEPTION 'Not all tables were created successfully';
    END IF;

    IF enum_count < 1 THEN
        RAISE EXCEPTION 'ai_provider_enum was not created successfully';
    END IF;
END $$;

-- =============================================================================
-- Usage Examples
-- =============================================================================

/*
-- Example: Insert a new AI configuration
INSERT INTO ai_configurations (
  provider,
  model_name,
  api_endpoint,
  api_key,
  temperature,
  max_tokens,
  created_by
) VALUES (
  'ollama',
  'llama2',
  'http://localhost:11434',
  null,
  0.7,
  500,
  auth.uid()
);

-- Example: Query active configurations
SELECT * FROM ai_configurations
WHERE is_active = true
AND created_by = auth.uid()
ORDER BY created_at DESC;

-- Example: Log a generation request
INSERT INTO ai_generation_logs (
  user_id,
  provider,
  model_name,
  prompt,
  response,
  tokens_used,
  request_type,
  success
) VALUES (
  auth.uid(),
  'ollama',
  'llama2',
  'Generate audit description for...',
  'This audit focuses on...',
  150,
  'description',
  true
);
*/

-- =============================================================================
-- Security Notes
-- =============================================================================

/*
SECURITY CONSIDERATIONS:

1. API Keys are stored as TEXT - consider encryption at rest
2. RLS policies ensure users can only access their own data
3. Foreign key constraints maintain data integrity
4. Indexes improve query performance
5. Constraints validate data ranges and formats

RECOMMENDED ADDITIONAL SECURITY:
- Enable SSL/TLS for database connections
- Regular security audits of stored API keys
- Consider using Supabase Vault for sensitive data
- Monitor generation logs for unusual activity
- Implement rate limiting at application level
*/
