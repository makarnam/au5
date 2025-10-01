-- =====================================================================================
-- GOVERNANCE MODULE ENHANCEMENT - Database Schema
-- =====================================================================================
-- This file creates comprehensive governance tables for enterprise GRC applications
-- Includes strategy management, risk appetite, stakeholder management, and board reporting

-- =====================================================================================
-- 1. STRATEGIC GOVERNANCE TABLES
-- =====================================================================================

-- Governance Strategy Framework
CREATE TABLE IF NOT EXISTS governance_strategy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR NOT NULL,
  description TEXT,
  status VARCHAR NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
  version VARCHAR DEFAULT '1.0',
  effective_date DATE,
  review_date DATE,
  objectives TEXT[],
  strategic_goals JSONB DEFAULT '{}',
  kpis JSONB DEFAULT '{}',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Risk Appetite Framework
CREATE TABLE IF NOT EXISTS risk_appetite_framework (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  description TEXT,
  risk_categories JSONB DEFAULT '{}',
  appetite_levels JSONB DEFAULT '{}',
  tolerance_thresholds JSONB DEFAULT '{}',
  review_frequency VARCHAR DEFAULT 'quarterly',
  next_review_date DATE,
  approved_by UUID REFERENCES users(id),
  approval_date DATE,
  status VARCHAR DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'under_review')),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Governance Policies
CREATE TABLE IF NOT EXISTS governance_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR NOT NULL,
  policy_number VARCHAR UNIQUE,
  category VARCHAR NOT NULL,
  description TEXT,
  content TEXT,
  effective_date DATE,
  review_date DATE,
  approval_required BOOLEAN DEFAULT true,
  approved_by UUID REFERENCES users(id),
  approval_date DATE,
  status VARCHAR DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'under_review', 'archived')),
  tags TEXT[],
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Governance Committees
CREATE TABLE IF NOT EXISTS governance_committees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  description TEXT,
  committee_type VARCHAR NOT NULL CHECK (committee_type IN ('board', 'audit', 'risk', 'compliance', 'executive')),
  chair_person UUID REFERENCES users(id),
  members UUID[] DEFAULT '{}',
  meeting_frequency VARCHAR DEFAULT 'quarterly',
  charter TEXT,
  authority TEXT,
  responsibilities TEXT[],
  status VARCHAR DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'dissolved')),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================================
-- 2. STAKEHOLDER MANAGEMENT
-- =====================================================================================

-- Stakeholders
CREATE TABLE IF NOT EXISTS governance_stakeholders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  title VARCHAR,
  organization VARCHAR,
  email VARCHAR,
  phone VARCHAR,
  stakeholder_type VARCHAR NOT NULL CHECK (stakeholder_type IN ('board_member', 'executive', 'regulator', 'customer', 'supplier', 'employee', 'shareholder')),
  influence_level VARCHAR DEFAULT 'medium' CHECK (influence_level IN ('low', 'medium', 'high', 'critical')),
  interest_level VARCHAR DEFAULT 'medium' CHECK (interest_level IN ('low', 'medium', 'high', 'critical')),
  communication_frequency VARCHAR DEFAULT 'quarterly',
  key_concerns TEXT[],
  relationship_status VARCHAR DEFAULT 'active' CHECK (relationship_status IN ('active', 'inactive', 'monitoring')),
  last_contact DATE,
  next_contact DATE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stakeholder Communications
CREATE TABLE IF NOT EXISTS stakeholder_communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stakeholder_id UUID REFERENCES governance_stakeholders(id) ON DELETE CASCADE,
  communication_type VARCHAR NOT NULL CHECK (communication_type IN ('meeting', 'email', 'call', 'presentation', 'report')),
  subject VARCHAR NOT NULL,
  content TEXT,
  date DATE NOT NULL,
  participants TEXT[],
  outcomes TEXT,
  follow_up_required BOOLEAN DEFAULT false,
  follow_up_date DATE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================================
-- 3. REGULATORY ALIGNMENT
-- =====================================================================================

-- Regulatory Change Tracking
DROP TABLE IF EXISTS regulatory_changes CASCADE;
CREATE TABLE regulatory_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR NOT NULL,
  description TEXT,
  regulatory_body VARCHAR NOT NULL,
  regulation_name VARCHAR NOT NULL,
  change_type VARCHAR NOT NULL CHECK (change_type IN ('new_regulation', 'amendment', 'guidance', 'deadline', 'requirement')),
  effective_date DATE,
  compliance_deadline DATE,
  impact_assessment TEXT,
  risk_rating VARCHAR DEFAULT 'medium' CHECK (risk_rating IN ('low', 'medium', 'high', 'critical')),
  affected_business_units TEXT[],
  required_actions TEXT[],
  status VARCHAR DEFAULT 'identified' CHECK (status IN ('identified', 'assessing', 'implementing', 'completed', 'monitoring')),
  assigned_to UUID REFERENCES users(id),
  priority VARCHAR DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Compliance Mapping
CREATE TABLE IF NOT EXISTS compliance_mapping (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  regulation_id UUID REFERENCES regulatory_changes(id),
  framework_id UUID REFERENCES compliance_frameworks(id),
  requirement_id UUID REFERENCES compliance_requirements(id),
  control_id UUID, -- Reference to controls table
  mapping_type VARCHAR NOT NULL CHECK (mapping_type IN ('direct', 'partial', 'compensating', 'not_applicable')),
  mapping_evidence TEXT,
  gap_analysis TEXT,
  remediation_plan TEXT,
  status VARCHAR DEFAULT 'mapped' CHECK (status IN ('mapped', 'gap_identified', 'remediation_planned', 'implemented')),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================================
-- 4. PERFORMANCE & METRICS
-- =====================================================================================

-- Governance KPIs
CREATE TABLE IF NOT EXISTS governance_kpis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  description TEXT,
  category VARCHAR NOT NULL,
  metric_type VARCHAR NOT NULL CHECK (metric_type IN ('percentage', 'count', 'currency', 'ratio', 'index')),
  target_value DECIMAL,
  current_value DECIMAL,
  unit VARCHAR,
  frequency VARCHAR DEFAULT 'quarterly' CHECK (frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'annual')),
  calculation_method TEXT,
  data_source VARCHAR,
  responsible_person UUID REFERENCES users(id),
  status VARCHAR DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- KPI Measurements
CREATE TABLE IF NOT EXISTS governance_kpi_measurements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kpi_id UUID REFERENCES governance_kpis(id) ON DELETE CASCADE,
  measurement_date DATE NOT NULL,
  value DECIMAL NOT NULL,
  target_value DECIMAL,
  variance DECIMAL,
  variance_percentage DECIMAL,
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Strategic Initiatives
CREATE TABLE IF NOT EXISTS governance_initiatives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR NOT NULL,
  description TEXT,
  objective VARCHAR NOT NULL,
  strategic_alignment TEXT,
  priority VARCHAR DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status VARCHAR DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'on_hold', 'completed', 'cancelled')),
  start_date DATE,
  target_completion_date DATE,
  actual_completion_date DATE,
  budget_allocated DECIMAL,
  budget_spent DECIMAL,
  sponsor UUID REFERENCES users(id),
  project_manager UUID REFERENCES users(id),
  stakeholders UUID[] DEFAULT '{}',
  deliverables TEXT[],
  risks TEXT[],
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================================
-- 5. BOARD & EXECUTIVE REPORTING
-- =====================================================================================

-- Board Meetings
CREATE TABLE IF NOT EXISTS board_meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  committee_id UUID REFERENCES governance_committees(id),
  title VARCHAR NOT NULL,
  meeting_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  location VARCHAR,
  meeting_type VARCHAR DEFAULT 'regular' CHECK (meeting_type IN ('regular', 'special', 'emergency')),
  agenda_items JSONB DEFAULT '[]',
  attendees UUID[] DEFAULT '{}',
  absentees UUID[] DEFAULT '{}',
  minutes TEXT,
  decisions TEXT[],
  action_items JSONB DEFAULT '[]',
  status VARCHAR DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Board Reports
CREATE TABLE IF NOT EXISTS board_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR NOT NULL,
  report_type VARCHAR NOT NULL CHECK (report_type IN ('quarterly', 'annual', 'ad_hoc', 'compliance', 'risk', 'performance')),
  period_start DATE,
  period_end DATE,
  executive_summary TEXT,
  key_metrics JSONB DEFAULT '{}',
  significant_issues TEXT[],
  recommendations TEXT[],
  attachments UUID[] DEFAULT '{}', -- File references
  presented_by UUID REFERENCES users(id),
  presentation_date DATE,
  approval_required BOOLEAN DEFAULT true,
  approved_by UUID REFERENCES users(id),
  approval_date DATE,
  status VARCHAR DEFAULT 'draft' CHECK (status IN ('draft', 'reviewed', 'approved', 'presented')),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================================
-- 6. WORKFLOW & APPROVALS
-- =====================================================================================

-- Governance Workflows
CREATE TABLE IF NOT EXISTS governance_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  description TEXT,
  workflow_type VARCHAR NOT NULL CHECK (workflow_type IN ('policy_approval', 'risk_assessment', 'compliance_review', 'strategic_planning')),
  steps JSONB DEFAULT '[]', -- Workflow steps with approvers
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Approval Requests
CREATE TABLE IF NOT EXISTS governance_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES governance_workflows(id),
  request_type VARCHAR NOT NULL,
  title VARCHAR NOT NULL,
  description TEXT,
  content JSONB DEFAULT '{}',
  requested_by UUID REFERENCES users(id),
  current_step INTEGER DEFAULT 1,
  total_steps INTEGER DEFAULT 1,
  approvers UUID[] DEFAULT '{}',
  approvals_received UUID[] DEFAULT '{}',
  status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'approved', 'rejected', 'cancelled')),
  due_date DATE,
  priority VARCHAR DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================================================

-- Governance Strategy
CREATE INDEX IF NOT EXISTS idx_governance_strategy_status ON governance_strategy(status);
CREATE INDEX IF NOT EXISTS idx_governance_strategy_effective_date ON governance_strategy(effective_date);

-- Risk Appetite
CREATE INDEX IF NOT EXISTS idx_risk_appetite_status ON risk_appetite_framework(status);
CREATE INDEX IF NOT EXISTS idx_risk_appetite_next_review ON risk_appetite_framework(next_review_date);

-- Governance Policies
CREATE INDEX IF NOT EXISTS idx_governance_policies_category ON governance_policies(category);
CREATE INDEX IF NOT EXISTS idx_governance_policies_status ON governance_policies(status);
CREATE INDEX IF NOT EXISTS idx_governance_policies_effective_date ON governance_policies(effective_date);

-- Stakeholders
CREATE INDEX IF NOT EXISTS idx_stakeholders_type ON governance_stakeholders(stakeholder_type);
CREATE INDEX IF NOT EXISTS idx_stakeholders_influence ON governance_stakeholders(influence_level);
CREATE INDEX IF NOT EXISTS idx_stakeholders_status ON governance_stakeholders(relationship_status);

-- Regulatory Changes
CREATE INDEX IF NOT EXISTS idx_regulatory_changes_body ON regulatory_changes(regulatory_body);
CREATE INDEX IF NOT EXISTS idx_regulatory_changes_effective_date ON regulatory_changes(effective_date);
CREATE INDEX IF NOT EXISTS idx_regulatory_changes_status ON regulatory_changes(status);

-- Governance KPIs
CREATE INDEX IF NOT EXISTS idx_governance_kpis_category ON governance_kpis(category);
CREATE INDEX IF NOT EXISTS idx_governance_kpis_responsible ON governance_kpis(responsible_person);

-- Board Meetings
CREATE INDEX IF NOT EXISTS idx_board_meetings_date ON board_meetings(meeting_date);
CREATE INDEX IF NOT EXISTS idx_board_meetings_committee ON board_meetings(committee_id);

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
CREATE TRIGGER update_governance_strategy_updated_at BEFORE UPDATE ON governance_strategy FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_risk_appetite_updated_at BEFORE UPDATE ON risk_appetite_framework FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_governance_policies_updated_at BEFORE UPDATE ON governance_policies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_governance_committees_updated_at BEFORE UPDATE ON governance_committees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_governance_stakeholders_updated_at BEFORE UPDATE ON governance_stakeholders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_regulatory_changes_updated_at BEFORE UPDATE ON regulatory_changes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_compliance_mapping_updated_at BEFORE UPDATE ON compliance_mapping FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_governance_kpis_updated_at BEFORE UPDATE ON governance_kpis FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_governance_initiatives_updated_at BEFORE UPDATE ON governance_initiatives FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_board_meetings_updated_at BEFORE UPDATE ON board_meetings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_board_reports_updated_at BEFORE UPDATE ON board_reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_governance_workflows_updated_at BEFORE UPDATE ON governance_workflows FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_governance_approvals_updated_at BEFORE UPDATE ON governance_approvals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================================================

-- Enable RLS on all tables
ALTER TABLE governance_strategy ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_appetite_framework ENABLE ROW LEVEL SECURITY;
ALTER TABLE governance_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE governance_committees ENABLE ROW LEVEL SECURITY;
ALTER TABLE governance_stakeholders ENABLE ROW LEVEL SECURITY;
ALTER TABLE stakeholder_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE regulatory_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE governance_kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE governance_kpi_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE governance_initiatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE governance_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE governance_approvals ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (users can view all records, but only modify their own or assigned)
-- Governance Strategy
CREATE POLICY "Users can view governance strategy" ON governance_strategy FOR SELECT USING (true);
CREATE POLICY "Users can manage governance strategy" ON governance_strategy FOR ALL USING (auth.uid() = created_by OR auth.role() = 'admin');

-- Risk Appetite Framework
CREATE POLICY "Users can view risk appetite framework" ON risk_appetite_framework FOR SELECT USING (true);
CREATE POLICY "Users can manage risk appetite framework" ON risk_appetite_framework FOR ALL USING (auth.uid() = created_by OR auth.role() = 'admin');

-- Governance Policies
CREATE POLICY "Users can view governance policies" ON governance_policies FOR SELECT USING (status = 'approved' OR auth.uid() = created_by);
CREATE POLICY "Users can manage governance policies" ON governance_policies FOR ALL USING (auth.uid() = created_by OR auth.role() = 'admin');

-- Similar policies for other tables...
-- (In a production environment, you'd want more granular policies based on roles and departments)

-- =====================================================================================
-- GRANT PERMISSIONS
-- =====================================================================================

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON governance_strategy TO authenticated;
GRANT SELECT, INSERT, UPDATE ON risk_appetite_framework TO authenticated;
GRANT SELECT, INSERT, UPDATE ON governance_policies TO authenticated;
GRANT SELECT, INSERT, UPDATE ON governance_committees TO authenticated;
GRANT SELECT, INSERT, UPDATE ON governance_stakeholders TO authenticated;
GRANT SELECT, INSERT, UPDATE ON stakeholder_communications TO authenticated;
GRANT SELECT, INSERT, UPDATE ON regulatory_changes TO authenticated;
GRANT SELECT, INSERT, UPDATE ON compliance_mapping TO authenticated;
GRANT SELECT, INSERT, UPDATE ON governance_kpis TO authenticated;
GRANT SELECT, INSERT, UPDATE ON governance_kpi_measurements TO authenticated;
GRANT SELECT, INSERT, UPDATE ON governance_initiatives TO authenticated;
GRANT SELECT, INSERT, UPDATE ON board_meetings TO authenticated;
GRANT SELECT, INSERT, UPDATE ON board_reports TO authenticated;
GRANT SELECT, INSERT, UPDATE ON governance_workflows TO authenticated;
GRANT SELECT, INSERT, UPDATE ON governance_approvals TO authenticated;

-- =====================================================================================
-- SAMPLE DATA INSERTION
-- =====================================================================================

-- Insert sample governance strategy
INSERT INTO governance_strategy (title, description, status, objectives, strategic_goals, kpis) VALUES
(
  'Enterprise Risk Management Strategy 2024',
  'Comprehensive strategy for managing enterprise risks and ensuring organizational resilience',
  'active',
  ARRAY[
    'Establish comprehensive risk management framework',
    'Align risk management with business objectives',
    'Enhance risk awareness across the organization',
    'Ensure regulatory compliance and reporting'
  ],
  '{
    "goals": [
      {"name": "Reduce operational risk incidents by 25%", "target": 25, "unit": "percentage"},
      {"name": "Achieve 95% compliance with regulatory requirements", "target": 95, "unit": "percentage"},
      {"name": "Implement risk management training for all employees", "target": 100, "unit": "percentage"}
    ]
  }'::jsonb,
  '{
    "kpis": [
      {"name": "Risk Incident Rate", "target": "< 5", "frequency": "monthly"},
      {"name": "Compliance Score", "target": "> 95%", "frequency": "quarterly"},
      {"name": "Training Completion Rate", "target": "> 90%", "frequency": "quarterly"}
    ]
  }'::jsonb
) ON CONFLICT DO NOTHING;

-- Insert sample risk appetite framework
INSERT INTO risk_appetite_framework (name, description, risk_categories, appetite_levels, tolerance_thresholds) VALUES
(
  'Corporate Risk Appetite Framework',
  'Defines the organization''s risk appetite across different risk categories',
  '{
    "categories": [
      "Strategic Risk",
      "Operational Risk",
      "Financial Risk",
      "Compliance Risk",
      "Cybersecurity Risk",
      "Reputational Risk"
    ]
  }'::jsonb,
  '{
    "levels": {
      "low": "Accept low levels of risk, conservative approach",
      "moderate": "Accept moderate levels of risk, balanced approach",
      "high": "Accept higher levels of risk, aggressive approach"
    }
  }'::jsonb,
  '{
    "thresholds": {
      "strategic": {"min": 0, "max": 25, "unit": "probability_percentage"},
      "operational": {"min": 0, "max": 15, "unit": "impact_score"},
      "financial": {"min": 0, "max": 50000, "unit": "currency_usd"},
      "compliance": {"min": 0, "max": 5, "unit": "violations_per_quarter"},
      "cybersecurity": {"min": 0, "max": 10, "unit": "breach_probability"},
      "reputational": {"min": 0, "max": 20, "unit": "negative_sentiment_score"}
    }
  }'::jsonb
) ON CONFLICT DO NOTHING;

-- Insert sample governance policies
INSERT INTO governance_policies (title, policy_number, category, description, content, status) VALUES
(
  'Information Security Policy',
  'POL-SEC-001',
  'Security',
  'Comprehensive information security policy governing data protection and cybersecurity measures',
  'This policy establishes the framework for protecting organizational information assets...',
  'approved'
),
(
  'Risk Management Policy',
  'POL-RSK-001',
  'Risk Management',
  'Policy governing the identification, assessment, and management of organizational risks',
  'This policy outlines the organization''s approach to risk management across all business activities...',
  'approved'
) ON CONFLICT DO NOTHING;

-- =====================================================================================
-- END OF GOVERNANCE ENHANCEMENT SCHEMA
-- =====================================================================================