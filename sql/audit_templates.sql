-- Audit Templates Migration
-- This file creates the audit_templates table and related functions

-- Create audit_templates table
CREATE TABLE IF NOT EXISTS public.audit_templates (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name character varying NOT NULL,
  description text,
  audit_type character varying NOT NULL DEFAULT 'internal'::character varying,
  objectives text[] DEFAULT '{}'::text[],
  scope text,
  methodology text,
  is_active boolean DEFAULT true,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT audit_templates_pkey PRIMARY KEY (id),
  CONSTRAINT audit_templates_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_audit_templates_audit_type ON public.audit_templates(audit_type);
CREATE INDEX IF NOT EXISTS idx_audit_templates_is_active ON public.audit_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_audit_templates_created_by ON public.audit_templates(created_by);
CREATE INDEX IF NOT EXISTS idx_audit_templates_created_at ON public.audit_templates(created_at);

-- Enable Row Level Security
ALTER TABLE public.audit_templates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Policy for users to view active templates
CREATE POLICY "Users can view active audit templates" ON public.audit_templates
  FOR SELECT USING (is_active = true);

-- Policy for users to create templates
CREATE POLICY "Users can create audit templates" ON public.audit_templates
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Policy for users to update their own templates
CREATE POLICY "Users can update their own audit templates" ON public.audit_templates
  FOR UPDATE USING (auth.uid() = created_by);

-- Policy for users to delete their own templates (soft delete)
CREATE POLICY "Users can delete their own audit templates" ON public.audit_templates
  FOR UPDATE USING (auth.uid() = created_by);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_audit_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_audit_templates_updated_at
  BEFORE UPDATE ON public.audit_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_audit_templates_updated_at();

-- Create function to get templates by type
CREATE OR REPLACE FUNCTION get_audit_templates_by_type(template_audit_type character varying)
RETURNS TABLE (
  id uuid,
  name character varying,
  description text,
  audit_type character varying,
  objectives text[],
  scope text,
  methodology text,
  is_active boolean,
  created_by uuid,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    at.id,
    at.name,
    at.description,
    at.audit_type,
    at.objectives,
    at.scope,
    at.methodology,
    at.is_active,
    at.created_by,
    at.created_at,
    at.updated_at
  FROM public.audit_templates at
  WHERE at.audit_type = template_audit_type
    AND at.is_active = true
  ORDER BY at.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to create audit from template
CREATE OR REPLACE FUNCTION create_audit_from_template(
  template_id uuid,
  audit_title character varying,
  audit_description text,
  business_unit_id uuid,
  start_date date,
  end_date date,
  planned_hours numeric
)
RETURNS uuid AS $$
DECLARE
  new_audit_id uuid;
  template_data public.audit_templates%ROWTYPE;
BEGIN
  -- Get template data
  SELECT * INTO template_data
  FROM public.audit_templates
  WHERE id = template_id AND is_active = true;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Template not found or inactive';
  END IF;
  
  -- Create new audit
  INSERT INTO public.audits (
    title,
    description,
    audit_type,
    status,
    business_unit_id,
    lead_auditor_id,
    start_date,
    end_date,
    planned_hours,
    objectives,
    scope,
    methodology,
    created_by,
    ai_generated
  ) VALUES (
    audit_title,
    audit_description,
    template_data.audit_type,
    'draft',
    business_unit_id,
    auth.uid(),
    start_date,
    end_date,
    planned_hours,
    template_data.objectives,
    template_data.scope,
    template_data.methodology,
    auth.uid(),
    false
  ) RETURNING id INTO new_audit_id;
  
  RETURN new_audit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert some sample templates
INSERT INTO public.audit_templates (name, description, audit_type, objectives, scope, methodology) VALUES
(
  'IT Security Audit Template',
  'Comprehensive IT security audit template covering network security, access controls, and data protection',
  'it',
  ARRAY[
    'Assess the effectiveness of IT security controls and policies',
    'Evaluate network security infrastructure and configurations',
    'Review access control mechanisms and user management',
    'Examine data protection and backup procedures',
    'Test incident response and disaster recovery capabilities'
  ],
  'This audit covers all IT systems, networks, and security infrastructure including servers, workstations, network devices, and security tools.',
  'The audit will be conducted using a combination of automated security scanning tools, manual testing procedures, and documentation review. Testing will include vulnerability assessments, penetration testing, and compliance verification.'
),
(
  'Financial Controls Audit Template',
  'Standard financial controls audit template for reviewing accounting processes and financial reporting',
  'financial',
  ARRAY[
    'Evaluate the effectiveness of financial control systems',
    'Review accounting policies and procedures',
    'Assess financial reporting accuracy and timeliness',
    'Examine internal control over financial reporting',
    'Test compliance with accounting standards and regulations'
  ],
  'This audit covers all financial processes, accounting systems, and financial reporting mechanisms including general ledger, accounts payable/receivable, and financial statements.',
  'The audit will be conducted through a combination of process walkthroughs, control testing, sample testing, and analytical procedures. Documentation review and interviews with key personnel will be performed.'
),
(
  'Compliance Audit Template',
  'General compliance audit template for regulatory and policy compliance assessments',
  'compliance',
  ARRAY[
    'Assess compliance with applicable laws and regulations',
    'Review policy implementation and effectiveness',
    'Evaluate compliance monitoring and reporting processes',
    'Examine training and awareness programs',
    'Test incident reporting and remediation procedures'
  ],
  'This audit covers all areas subject to regulatory requirements and internal policies including operational processes, documentation, and compliance monitoring activities.',
  'The audit will be conducted through policy review, process analysis, documentation examination, and testing of compliance controls. Regulatory requirements will be mapped to current practices.'
);

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON public.audit_templates TO authenticated;
GRANT EXECUTE ON FUNCTION get_audit_templates_by_type(character varying) TO authenticated;
GRANT EXECUTE ON FUNCTION create_audit_from_template(uuid, character varying, text, uuid, date, date, numeric) TO authenticated;
