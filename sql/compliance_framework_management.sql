-- =====================================================================================
-- COMPLIANCE FRAMEWORK MANAGEMENT - Database Schema
-- =====================================================================================
-- This file creates comprehensive compliance framework management tables
-- Includes compliance frameworks, requirements, mappings, and assessments

-- =====================================================================================
-- 1. COMPLIANCE REQUIREMENTS TABLE
-- =====================================================================================

CREATE TABLE IF NOT EXISTS compliance_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  framework_id UUID REFERENCES compliance_frameworks(id) ON DELETE CASCADE,
  section_id UUID REFERENCES compliance_sections(id) ON DELETE SET NULL,
  requirement_code VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  text TEXT NOT NULL,
  guidance TEXT,
  category VARCHAR(100),
  priority VARCHAR(20) CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  implementation_level VARCHAR(50) CHECK (implementation_level IN ('basic', 'intermediate', 'advanced')),
  evidence_required TEXT,
  assessment_frequency VARCHAR(50) DEFAULT 'annual',
  is_active BOOLEAN DEFAULT true,
  tags TEXT[],
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique requirement codes within a framework
  UNIQUE(framework_id, requirement_code)
);

-- =====================================================================================
-- 2. COMPLIANCE SECTIONS TABLE (if not exists)
-- =====================================================================================

CREATE TABLE IF NOT EXISTS compliance_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  framework_id UUID REFERENCES compliance_frameworks(id) ON DELETE CASCADE,
  section_code VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  parent_section_id UUID REFERENCES compliance_sections(id) ON DELETE SET NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique section codes within a framework
  UNIQUE(framework_id, section_code)
);

-- =====================================================================================
-- 3. COMPLIANCE MAPPINGS TABLE
-- =====================================================================================

CREATE TABLE IF NOT EXISTS compliance_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requirement_id UUID REFERENCES compliance_requirements(id) ON DELETE CASCADE,
  entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('risk', 'control', 'policy', 'process', 'asset')),
  entity_id UUID NOT NULL,
  mapping_type VARCHAR(50) CHECK (mapping_type IN ('direct', 'indirect', 'supporting', 'compensating')),
  coverage_percentage INTEGER CHECK (coverage_percentage >= 0 AND coverage_percentage <= 100),
  mapping_strength VARCHAR(20) CHECK (mapping_strength IN ('weak', 'moderate', 'strong', 'complete')),
  notes TEXT,
  mapped_by UUID REFERENCES auth.users(id),
  mapped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique mappings
  UNIQUE(requirement_id, entity_type, entity_id)
);

-- =====================================================================================
-- 4. COMPLIANCE ASSESSMENTS TABLE (enhanced)
-- =====================================================================================

CREATE TABLE IF NOT EXISTS compliance_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  framework_id UUID REFERENCES compliance_frameworks(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES compliance_profiles(id) ON DELETE CASCADE,
  requirement_id UUID REFERENCES compliance_requirements(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL CHECK (status IN ('unknown', 'compliant', 'partially_compliant', 'non_compliant', 'not_applicable', 'under_review')),
  justification TEXT,
  evidence_description TEXT,
  evidence_location TEXT,
  target_remediation_date DATE,
  actual_remediation_date DATE,
  owner_id UUID REFERENCES auth.users(id),
  reviewer_id UUID REFERENCES auth.users(id),
  assessment_score INTEGER CHECK (assessment_score >= 0 AND assessment_score <= 100),
  risk_rating VARCHAR(20) CHECK (risk_rating IN ('low', 'medium', 'high', 'critical')),
  last_evaluated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  next_review_date DATE,
  ai_generated BOOLEAN DEFAULT false,
  ai_confidence DECIMAL(3,2) CHECK (ai_confidence >= 0 AND ai_confidence <= 1),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique assessments per requirement per profile
  UNIQUE(profile_id, requirement_id)
);

-- =====================================================================================
-- 5. COMPLIANCE PROFILES TABLE (if not exists)
-- =====================================================================================

CREATE TABLE IF NOT EXISTS compliance_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  framework_id UUID REFERENCES compliance_frameworks(id) ON DELETE CASCADE,
  business_unit_id UUID,
  owner_id UUID REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT true,
  tags TEXT[],
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================================================
-- 6. COMPLIANCE PROFILE REQUIREMENTS TABLE
-- =====================================================================================

CREATE TABLE IF NOT EXISTS compliance_profile_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES compliance_profiles(id) ON DELETE CASCADE,
  requirement_id UUID REFERENCES compliance_requirements(id) ON DELETE CASCADE,
  applicable BOOLEAN DEFAULT true,
  applicability_notes TEXT,
  priority_override VARCHAR(20),
  custom_deadline DATE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique profile-requirement combinations
  UNIQUE(profile_id, requirement_id)
);

-- =====================================================================================
-- 7. COMPLIANCE EXCEPTIONS TABLE
-- =====================================================================================

CREATE TABLE IF NOT EXISTS compliance_exceptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  framework_id UUID REFERENCES compliance_frameworks(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES compliance_profiles(id) ON DELETE CASCADE,
  requirement_id UUID REFERENCES compliance_requirements(id) ON DELETE CASCADE,
  exception_type VARCHAR(50) NOT NULL CHECK (exception_type IN ('temporary', 'permanent', 'compensating')),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  business_justification TEXT,
  risk_assessment TEXT,
  compensating_controls TEXT,
  approval_status VARCHAR(50) DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected', 'expired')),
  approved_by UUID REFERENCES auth.users(id),
  approval_date DATE,
  expiry_date DATE,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================================================
-- 8. COMPLIANCE SNAPSHOTS TABLE
-- =====================================================================================

CREATE TABLE IF NOT EXISTS compliance_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  framework_id UUID REFERENCES compliance_frameworks(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES compliance_profiles(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL,
  overall_score DECIMAL(5,2) CHECK (overall_score >= 0 AND overall_score <= 100),
  compliant_count INTEGER DEFAULT 0,
  partially_compliant_count INTEGER DEFAULT 0,
  non_compliant_count INTEGER DEFAULT 0,
  not_applicable_count INTEGER DEFAULT 0,
  unknown_count INTEGER DEFAULT 0,
  total_requirements INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================================================
-- 9. COMPLIANCE AUDIT TRAIL TABLE
-- =====================================================================================

CREATE TABLE IF NOT EXISTS compliance_audit_trail (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name VARCHAR(100) NOT NULL,
  record_id UUID NOT NULL,
  action VARCHAR(50) NOT NULL CHECK (action IN ('insert', 'update', 'delete')),
  old_values JSONB,
  new_values JSONB,
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

-- =====================================================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================================================

-- Compliance Requirements
CREATE INDEX IF NOT EXISTS idx_compliance_requirements_framework ON compliance_requirements(framework_id);
CREATE INDEX IF NOT EXISTS idx_compliance_requirements_section ON compliance_requirements(section_id);
CREATE INDEX IF NOT EXISTS idx_compliance_requirements_code ON compliance_requirements(requirement_code);
CREATE INDEX IF NOT EXISTS idx_compliance_requirements_category ON compliance_requirements(category);
CREATE INDEX IF NOT EXISTS idx_compliance_requirements_priority ON compliance_requirements(priority);

-- Compliance Sections
CREATE INDEX IF NOT EXISTS idx_compliance_sections_framework ON compliance_sections(framework_id);
CREATE INDEX IF NOT EXISTS idx_compliance_sections_parent ON compliance_sections(parent_section_id);
CREATE INDEX IF NOT EXISTS idx_compliance_sections_sort ON compliance_sections(framework_id, sort_order);

-- Compliance Mappings
CREATE INDEX IF NOT EXISTS idx_compliance_mappings_requirement ON compliance_mappings(requirement_id);
CREATE INDEX IF NOT EXISTS idx_compliance_mappings_entity ON compliance_mappings(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_compliance_mappings_type ON compliance_mappings(mapping_type);

-- Compliance Assessments
CREATE INDEX IF NOT EXISTS idx_compliance_assessments_framework ON compliance_assessments(framework_id);
CREATE INDEX IF NOT EXISTS idx_compliance_assessments_profile ON compliance_assessments(profile_id);
CREATE INDEX IF NOT EXISTS idx_compliance_assessments_requirement ON compliance_assessments(requirement_id);
CREATE INDEX IF NOT EXISTS idx_compliance_assessments_status ON compliance_assessments(status);
CREATE INDEX IF NOT EXISTS idx_compliance_assessments_owner ON compliance_assessments(owner_id);
CREATE INDEX IF NOT EXISTS idx_compliance_assessments_review_date ON compliance_assessments(next_review_date);

-- Compliance Profiles
CREATE INDEX IF NOT EXISTS idx_compliance_profiles_framework ON compliance_profiles(framework_id);
CREATE INDEX IF NOT EXISTS idx_compliance_profiles_owner ON compliance_profiles(owner_id);
CREATE INDEX IF NOT EXISTS idx_compliance_profiles_active ON compliance_profiles(is_active);

-- Compliance Profile Requirements
CREATE INDEX IF NOT EXISTS idx_profile_requirements_profile ON compliance_profile_requirements(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_requirements_requirement ON compliance_profile_requirements(requirement_id);
CREATE INDEX IF NOT EXISTS idx_profile_requirements_applicable ON compliance_profile_requirements(applicable);

-- Compliance Exceptions
CREATE INDEX IF NOT EXISTS idx_compliance_exceptions_framework ON compliance_exceptions(framework_id);
CREATE INDEX IF NOT EXISTS idx_compliance_exceptions_profile ON compliance_exceptions(profile_id);
CREATE INDEX IF NOT EXISTS idx_compliance_exceptions_requirement ON compliance_exceptions(requirement_id);
CREATE INDEX IF NOT EXISTS idx_compliance_exceptions_status ON compliance_exceptions(status);
CREATE INDEX IF NOT EXISTS idx_compliance_exceptions_expiry ON compliance_exceptions(expiry_date);

-- Compliance Snapshots
CREATE INDEX IF NOT EXISTS idx_compliance_snapshots_framework ON compliance_snapshots(framework_id);
CREATE INDEX IF NOT EXISTS idx_compliance_snapshots_profile ON compliance_snapshots(profile_id);
CREATE INDEX IF NOT EXISTS idx_compliance_snapshots_date ON compliance_snapshots(snapshot_date);

-- Compliance Audit Trail
CREATE INDEX IF NOT EXISTS idx_compliance_audit_table ON compliance_audit_trail(table_name);
CREATE INDEX IF NOT EXISTS idx_compliance_audit_record ON compliance_audit_trail(record_id);
CREATE INDEX IF NOT EXISTS idx_compliance_audit_action ON compliance_audit_trail(action);
CREATE INDEX IF NOT EXISTS idx_compliance_audit_date ON compliance_audit_trail(changed_at);

-- =====================================================================================
-- UPDATED_AT TRIGGERS
-- =====================================================================================

-- Function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all tables with updated_at
CREATE TRIGGER update_compliance_requirements_updated_at 
  BEFORE UPDATE ON compliance_requirements 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_compliance_sections_updated_at 
  BEFORE UPDATE ON compliance_sections 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_compliance_assessments_updated_at 
  BEFORE UPDATE ON compliance_assessments 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_compliance_profiles_updated_at 
  BEFORE UPDATE ON compliance_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_compliance_profile_requirements_updated_at 
  BEFORE UPDATE ON compliance_profile_requirements 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_compliance_exceptions_updated_at 
  BEFORE UPDATE ON compliance_exceptions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================================================

-- Enable RLS on all tables
ALTER TABLE compliance_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_profile_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_exceptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_audit_trail ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (users can view all records, but only modify their own or assigned)
-- Compliance Requirements
CREATE POLICY "Users can view compliance requirements" ON compliance_requirements FOR SELECT USING (true);
CREATE POLICY "Users can manage compliance requirements" ON compliance_requirements FOR ALL USING (auth.uid() = created_by OR auth.role() = 'admin');

-- Compliance Sections
CREATE POLICY "Users can view compliance sections" ON compliance_sections FOR SELECT USING (true);
CREATE POLICY "Users can manage compliance sections" ON compliance_sections FOR ALL USING (auth.uid() = created_by OR auth.role() = 'admin');

-- Compliance Mappings
CREATE POLICY "Users can view compliance mappings" ON compliance_mappings FOR SELECT USING (true);
CREATE POLICY "Users can manage compliance mappings" ON compliance_mappings FOR ALL USING (auth.uid() = mapped_by OR auth.role() = 'admin');

-- Compliance Assessments
CREATE POLICY "Users can view compliance assessments" ON compliance_assessments FOR SELECT USING (true);
CREATE POLICY "Users can manage compliance assessments" ON compliance_assessments FOR ALL USING (auth.uid() = owner_id OR auth.uid() = reviewer_id OR auth.role() = 'admin');

-- Compliance Profiles
CREATE POLICY "Users can view compliance profiles" ON compliance_profiles FOR SELECT USING (true);
CREATE POLICY "Users can manage compliance profiles" ON compliance_profiles FOR ALL USING (auth.uid() = owner_id OR auth.uid() = created_by OR auth.role() = 'admin');

-- Compliance Profile Requirements
CREATE POLICY "Users can view profile requirements" ON compliance_profile_requirements FOR SELECT USING (true);
CREATE POLICY "Users can manage profile requirements" ON compliance_profile_requirements FOR ALL USING (auth.uid() = created_by OR auth.role() = 'admin');

-- Compliance Exceptions
CREATE POLICY "Users can view compliance exceptions" ON compliance_exceptions FOR SELECT USING (true);
CREATE POLICY "Users can manage compliance exceptions" ON compliance_exceptions FOR ALL USING (auth.uid() = created_by OR auth.uid() = approved_by OR auth.role() = 'admin');

-- Compliance Snapshots
CREATE POLICY "Users can view compliance snapshots" ON compliance_snapshots FOR SELECT USING (true);
CREATE POLICY "Users can manage compliance snapshots" ON compliance_snapshots FOR ALL USING (auth.uid() = created_by OR auth.role() = 'admin');

-- Compliance Audit Trail
CREATE POLICY "Users can view compliance audit trail" ON compliance_audit_trail FOR SELECT USING (true);
CREATE POLICY "System can manage compliance audit trail" ON compliance_audit_trail FOR ALL USING (auth.role() = 'service_role');

-- =====================================================================================
-- GRANT PERMISSIONS
-- =====================================================================================

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON compliance_requirements TO authenticated;
GRANT SELECT, INSERT, UPDATE ON compliance_sections TO authenticated;
GRANT SELECT, INSERT, UPDATE ON compliance_mappings TO authenticated;
GRANT SELECT, INSERT, UPDATE ON compliance_assessments TO authenticated;
GRANT SELECT, INSERT, UPDATE ON compliance_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON compliance_profile_requirements TO authenticated;
GRANT SELECT, INSERT, UPDATE ON compliance_exceptions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON compliance_snapshots TO authenticated;
GRANT SELECT ON compliance_audit_trail TO authenticated;

-- =====================================================================================
-- UTILITY FUNCTIONS
-- =====================================================================================

-- Function to compute compliance snapshot
CREATE OR REPLACE FUNCTION compute_compliance_snapshot(
  p_framework UUID,
  p_profile UUID DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
  v_compliant_count INTEGER := 0;
  v_partially_compliant_count INTEGER := 0;
  v_non_compliant_count INTEGER := 0;
  v_not_applicable_count INTEGER := 0;
  v_unknown_count INTEGER := 0;
  v_total_requirements INTEGER := 0;
  v_overall_score DECIMAL(5,2) := 0;
BEGIN
  -- Count assessments by status
  SELECT 
    COUNT(*) FILTER (WHERE status = 'compliant'),
    COUNT(*) FILTER (WHERE status = 'partially_compliant'),
    COUNT(*) FILTER (WHERE status = 'non_compliant'),
    COUNT(*) FILTER (WHERE status = 'not_applicable'),
    COUNT(*) FILTER (WHERE status = 'unknown'),
    COUNT(*)
  INTO 
    v_compliant_count,
    v_partially_compliant_count,
    v_non_compliant_count,
    v_not_applicable_count,
    v_unknown_count,
    v_total_requirements
  FROM compliance_assessments ca
  WHERE ca.framework_id = p_framework
    AND (p_profile IS NULL OR ca.profile_id = p_profile);

  -- Calculate overall score
  IF v_total_requirements > 0 THEN
    v_overall_score := (
      (v_compliant_count * 100.0) + 
      (v_partially_compliant_count * 50.0) + 
      (v_non_compliant_count * 0.0) + 
      (v_not_applicable_count * 100.0)
    ) / v_total_requirements;
  END IF;

  -- Build result
  v_result := jsonb_build_object(
    'framework_id', p_framework,
    'profile_id', p_profile,
    'snapshot_date', CURRENT_DATE,
    'overall_score', v_overall_score,
    'compliant_count', v_compliant_count,
    'partially_compliant_count', v_partially_compliant_count,
    'non_compliant_count', v_non_compliant_count,
    'not_applicable_count', v_not_applicable_count,
    'unknown_count', v_unknown_count,
    'total_requirements', v_total_requirements
  );

  -- Insert snapshot record
  INSERT INTO compliance_snapshots (
    framework_id, profile_id, snapshot_date, overall_score,
    compliant_count, partially_compliant_count, non_compliant_count,
    not_applicable_count, unknown_count, total_requirements
  ) VALUES (
    p_framework, p_profile, CURRENT_DATE, v_overall_score,
    v_compliant_count, v_partially_compliant_count, v_non_compliant_count,
    v_not_applicable_count, v_unknown_count, v_total_requirements
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- =====================================================================================
-- SAMPLE DATA INSERTION
-- =====================================================================================

-- Insert sample compliance sections for ISO 27001
INSERT INTO compliance_sections (framework_id, section_code, title, description, sort_order) 
SELECT 
  cf.id,
  'A.5',
  'Information Security Policies',
  'Management direction and support for information security',
  1
FROM compliance_frameworks cf 
WHERE cf.code = 'ISO27001' 
LIMIT 1
ON CONFLICT DO NOTHING;

-- Insert sample compliance requirements
INSERT INTO compliance_requirements (framework_id, section_id, requirement_code, title, description, text, priority, implementation_level)
SELECT 
  cf.id,
  cs.id,
  'A.5.1.1',
  'Policies for Information Security',
  'Policies for information security shall be defined, approved by management, published and communicated to employees and relevant external parties.',
  'Management shall set a clear direction and demonstrate support for, and commitment to, information security through the issuance and maintenance of an information security policy across the organization.',
  'high',
  'basic'
FROM compliance_frameworks cf
JOIN compliance_sections cs ON cs.framework_id = cf.id AND cs.section_code = 'A.5'
WHERE cf.code = 'ISO27001'
LIMIT 1
ON CONFLICT DO NOTHING;

-- =====================================================================================
-- END OF COMPLIANCE FRAMEWORK MANAGEMENT SCHEMA
-- =====================================================================================
