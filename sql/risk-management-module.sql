-- =============================================================================
-- ENTERPRISE RISK MANAGEMENT MODULE
-- =============================================================================
-- This script creates a comprehensive risk management system with enhanced
-- features for enterprise-wide risk identification, assessment, and mitigation.
-- =============================================================================

-- Drop existing objects if they exist (for clean setup)
DROP TABLE IF EXISTS risk_treatments CASCADE;
DROP TABLE IF EXISTS risk_assessments CASCADE;
DROP TABLE IF EXISTS risk_controls CASCADE;
DROP TABLE IF EXISTS risk_incidents CASCADE;
DROP TABLE IF EXISTS risk_reviews CASCADE;
DROP TABLE IF EXISTS risk_workflows CASCADE;
DROP TABLE IF EXISTS risk_appetite CASCADE;
DROP TABLE IF EXISTS risk_categories CASCADE;
DROP TABLE IF EXISTS risk_matrices CASCADE;
DROP VIEW IF EXISTS v_risk_dashboard CASCADE;
DROP VIEW IF EXISTS v_risk_heatmap CASCADE;
DROP VIEW IF EXISTS v_risk_trends CASCADE;

-- =============================================================================
-- ENHANCED RISK CATEGORIES TABLE
-- =============================================================================
CREATE TABLE risk_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(7) DEFAULT '#6B7280', -- Hex color for UI
    parent_id UUID REFERENCES risk_categories(id),
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default risk categories
INSERT INTO risk_categories (name, description, color, sort_order) VALUES
('Operational', 'Risks related to day-to-day business operations', '#F59E0B', 1),
('Financial', 'Risks affecting financial performance and stability', '#10B981', 2),
('Compliance', 'Regulatory and legal compliance risks', '#3B82F6', 3),
('Strategic', 'Risks impacting strategic objectives and planning', '#8B5CF6', 4),
('Reputation', 'Risks affecting organizational reputation and brand', '#EF4444', 5),
('Technology', 'IT and cybersecurity related risks', '#06B6D4', 6),
('Human Resources', 'People and talent related risks', '#F97316', 7),
('Environmental', 'Environmental and sustainability risks', '#22C55E', 8),
('Market', 'Market volatility and competitive risks', '#EC4899', 9),
('Credit', 'Credit and counterparty risks', '#6366F1', 10);

-- =============================================================================
-- RISK APPETITE AND TOLERANCE TABLE
-- =============================================================================
CREATE TABLE risk_appetite (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_unit_id UUID REFERENCES business_units(id),
    risk_category_id UUID REFERENCES risk_categories(id),
    appetite_level VARCHAR(20) NOT NULL CHECK (appetite_level IN ('very_low', 'low', 'medium', 'high', 'very_high')),
    tolerance_threshold INTEGER CHECK (tolerance_threshold BETWEEN 1 AND 25), -- Max acceptable risk score
    description TEXT,
    review_frequency VARCHAR(20) DEFAULT 'annually' CHECK (review_frequency IN ('monthly', 'quarterly', 'semi_annually', 'annually')),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    effective_from DATE NOT NULL,
    effective_to DATE,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- RISK SCORING MATRICES TABLE
-- =============================================================================
CREATE TABLE risk_matrices (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    probability_labels JSONB NOT NULL DEFAULT '[
        {"value": 1, "label": "Very Low", "description": "Less than 5% chance"},
        {"value": 2, "label": "Low", "description": "5-25% chance"},
        {"value": 3, "label": "Medium", "description": "25-50% chance"},
        {"value": 4, "label": "High", "description": "50-75% chance"},
        {"value": 5, "label": "Very High", "description": "More than 75% chance"}
    ]',
    impact_labels JSONB NOT NULL DEFAULT '[
        {"value": 1, "label": "Minimal", "description": "Minor operational impact"},
        {"value": 2, "label": "Minor", "description": "Limited operational impact"},
        {"value": 3, "label": "Moderate", "description": "Significant operational impact"},
        {"value": 4, "label": "Major", "description": "Severe operational impact"},
        {"value": 5, "label": "Catastrophic", "description": "Critical operational impact"}
    ]',
    scoring_matrix JSONB NOT NULL DEFAULT '{
        "1": {"1": {"score": 1, "level": "low"}, "2": {"score": 2, "level": "low"}, "3": {"score": 3, "level": "low"}, "4": {"score": 4, "level": "medium"}, "5": {"score": 5, "level": "medium"}},
        "2": {"1": {"score": 2, "level": "low"}, "2": {"score": 4, "level": "medium"}, "3": {"score": 6, "level": "medium"}, "4": {"score": 8, "level": "medium"}, "5": {"score": 10, "level": "high"}},
        "3": {"1": {"score": 3, "level": "low"}, "2": {"score": 6, "level": "medium"}, "3": {"score": 9, "level": "medium"}, "4": {"score": 12, "level": "high"}, "5": {"score": 15, "level": "high"}},
        "4": {"1": {"score": 4, "level": "medium"}, "2": {"score": 8, "level": "medium"}, "3": {"score": 12, "level": "high"}, "4": {"score": 16, "level": "high"}, "5": {"score": 20, "level": "critical"}},
        "5": {"1": {"score": 5, "level": "medium"}, "2": {"score": 10, "level": "high"}, "3": {"score": 15, "level": "high"}, "4": {"score": 20, "level": "critical"}, "5": {"score": 25, "level": "critical"}}
    }',
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default risk matrix
INSERT INTO risk_matrices (name, description, is_default, is_active) VALUES
('Standard 5x5 Risk Matrix', 'Standard enterprise risk assessment matrix with 5 probability and 5 impact levels', true, true);

-- =============================================================================
-- ENHANCED RISKS TABLE (Update existing or create new)
-- =============================================================================
-- First, let's update the existing risks table structure
ALTER TABLE risks DROP CONSTRAINT IF EXISTS risks_category_check;
ALTER TABLE risks ADD COLUMN IF NOT EXISTS risk_category_id UUID REFERENCES risk_categories(id);
ALTER TABLE risks ADD COLUMN IF NOT EXISTS risk_matrix_id UUID REFERENCES risk_matrices(id);
ALTER TABLE risks ADD COLUMN IF NOT EXISTS risk_source VARCHAR(100);
ALTER TABLE risks ADD COLUMN IF NOT EXISTS likelihood_trend VARCHAR(20) DEFAULT 'stable' CHECK (likelihood_trend IN ('increasing', 'decreasing', 'stable'));
ALTER TABLE risks ADD COLUMN IF NOT EXISTS impact_trend VARCHAR(20) DEFAULT 'stable' CHECK (impact_trend IN ('increasing', 'decreasing', 'stable'));
ALTER TABLE risks ADD COLUMN IF NOT EXISTS target_probability INTEGER CHECK (target_probability BETWEEN 1 AND 5);
ALTER TABLE risks ADD COLUMN IF NOT EXISTS target_impact INTEGER CHECK (target_impact BETWEEN 1 AND 5);
ALTER TABLE risks ADD COLUMN IF NOT EXISTS target_risk_score INTEGER;
ALTER TABLE risks ADD COLUMN IF NOT EXISTS target_date DATE;
ALTER TABLE risks ADD COLUMN IF NOT EXISTS escalation_criteria TEXT;
ALTER TABLE risks ADD COLUMN IF NOT EXISTS last_review_date DATE;
ALTER TABLE risks ADD COLUMN IF NOT EXISTS next_review_date DATE;
ALTER TABLE risks ADD COLUMN IF NOT EXISTS review_frequency VARCHAR(20) DEFAULT 'quarterly' CHECK (review_frequency IN ('weekly', 'monthly', 'quarterly', 'semi_annually', 'annually'));
ALTER TABLE risks ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE risks ADD COLUMN IF NOT EXISTS external_reference VARCHAR(100);
ALTER TABLE risks ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]';

-- Update risk status constraint to include more statuses
ALTER TABLE risks DROP CONSTRAINT IF EXISTS risks_status_check;
ALTER TABLE risks ADD CONSTRAINT risks_status_check CHECK (
    status IN ('identified', 'assessed', 'treating', 'monitoring', 'accepted', 'transferred', 'avoided', 'closed')
);

-- =============================================================================
-- RISK ASSESSMENTS TABLE (Historical tracking)
-- =============================================================================
CREATE TABLE risk_assessments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    risk_id UUID NOT NULL REFERENCES risks(id) ON DELETE CASCADE,
    assessment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    assessor_id UUID REFERENCES users(id),
    assessment_type VARCHAR(20) DEFAULT 'periodic' CHECK (assessment_type IN ('initial', 'periodic', 'triggered', 'ad_hoc')),
    probability INTEGER NOT NULL CHECK (probability BETWEEN 1 AND 5),
    impact INTEGER NOT NULL CHECK (impact BETWEEN 1 AND 5),
    risk_score INTEGER NOT NULL,
    risk_level VARCHAR(20) NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    assessment_notes TEXT,
    key_assumptions TEXT,
    data_sources TEXT,
    confidence_level VARCHAR(20) DEFAULT 'medium' CHECK (confidence_level IN ('low', 'medium', 'high')),
    review_trigger VARCHAR(100),
    attachments JSONB DEFAULT '[]',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- RISK TREATMENTS/MITIGATION TABLE
-- =============================================================================
CREATE TABLE risk_treatments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    risk_id UUID NOT NULL REFERENCES risks(id) ON DELETE CASCADE,
    treatment_type VARCHAR(20) NOT NULL CHECK (treatment_type IN ('mitigate', 'accept', 'transfer', 'avoid', 'monitor')),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    treatment_strategy TEXT,
    cost_estimate DECIMAL(15,2),
    currency VARCHAR(3) DEFAULT 'USD',
    assigned_to UUID REFERENCES users(id),
    responsible_department VARCHAR(100),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    status VARCHAR(20) DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled', 'on_hold', 'overdue')),
    start_date DATE,
    target_date DATE,
    completed_date DATE,
    effectiveness_rating INTEGER CHECK (effectiveness_rating BETWEEN 1 AND 5),
    effectiveness_notes TEXT,
    success_criteria TEXT,
    kpis JSONB DEFAULT '[]', -- Key Performance Indicators
    dependencies TEXT,
    constraints_limitations TEXT,
    attachments JSONB DEFAULT '[]',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- RISK CONTROLS MAPPING TABLE
-- =============================================================================
CREATE TABLE risk_controls (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    risk_id UUID NOT NULL REFERENCES risks(id) ON DELETE CASCADE,
    control_id UUID NOT NULL REFERENCES controls(id) ON DELETE CASCADE,
    control_effectiveness VARCHAR(20) DEFAULT 'effective' CHECK (control_effectiveness IN ('effective', 'partially_effective', 'ineffective', 'not_tested')),
    coverage_level VARCHAR(20) DEFAULT 'full' CHECK (coverage_level IN ('full', 'partial', 'minimal')),
    control_type VARCHAR(20) DEFAULT 'mitigating' CHECK (control_type IN ('preventive', 'detective', 'corrective', 'mitigating')),
    relationship_notes TEXT,
    last_tested_date DATE,
    next_test_date DATE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(risk_id, control_id)
);

-- =============================================================================
-- RISK INCIDENTS TABLE
-- =============================================================================
CREATE TABLE risk_incidents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    risk_id UUID NOT NULL REFERENCES risks(id) ON DELETE CASCADE,
    incident_title VARCHAR(255) NOT NULL,
    incident_description TEXT NOT NULL,
    incident_date DATE NOT NULL,
    discovered_date DATE DEFAULT CURRENT_DATE,
    reported_by UUID REFERENCES users(id),
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    actual_impact TEXT,
    financial_impact DECIMAL(15,2),
    currency VARCHAR(3) DEFAULT 'USD',
    lessons_learned TEXT,
    corrective_actions TEXT,
    preventive_measures TEXT,
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'closed')),
    resolution_date DATE,
    attachments JSONB DEFAULT '[]',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- RISK REVIEWS TABLE
-- =============================================================================
CREATE TABLE risk_reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    risk_id UUID NOT NULL REFERENCES risks(id) ON DELETE CASCADE,
    review_date DATE NOT NULL DEFAULT CURRENT_DATE,
    reviewer_id UUID NOT NULL REFERENCES users(id),
    review_type VARCHAR(20) DEFAULT 'periodic' CHECK (review_type IN ('periodic', 'triggered', 'incident_based', 'audit_based')),
    review_outcome VARCHAR(20) DEFAULT 'no_change' CHECK (review_outcome IN ('no_change', 'updated', 'escalated', 'closed', 'transferred')),
    risk_status_before VARCHAR(50),
    risk_status_after VARCHAR(50),
    probability_before INTEGER,
    probability_after INTEGER,
    impact_before INTEGER,
    impact_after INTEGER,
    changes_made TEXT,
    review_notes TEXT,
    recommendations TEXT,
    next_review_date DATE,
    attachments JSONB DEFAULT '[]',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- RISK WORKFLOWS TABLE
-- =============================================================================
CREATE TABLE risk_workflows (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    risk_id UUID NOT NULL REFERENCES risks(id) ON DELETE CASCADE,
    workflow_type VARCHAR(20) NOT NULL CHECK (workflow_type IN ('approval', 'review', 'escalation', 'notification')),
    current_step INTEGER DEFAULT 1,
    total_steps INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'approved', 'rejected', 'cancelled')),
    workflow_data JSONB NOT NULL DEFAULT '{}', -- Store workflow steps and assignments
    initiated_by UUID REFERENCES users(id),
    initiated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_risk_categories_parent ON risk_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_risk_categories_active ON risk_categories(is_active);

CREATE INDEX IF NOT EXISTS idx_risk_appetite_business_unit ON risk_appetite(business_unit_id);
CREATE INDEX IF NOT EXISTS idx_risk_appetite_category ON risk_appetite(risk_category_id);
CREATE INDEX IF NOT EXISTS idx_risk_appetite_active ON risk_appetite(is_active);

CREATE INDEX IF NOT EXISTS idx_risk_matrices_default ON risk_matrices(is_default);
CREATE INDEX IF NOT EXISTS idx_risk_matrices_active ON risk_matrices(is_active);

CREATE INDEX IF NOT EXISTS idx_risks_category_new ON risks(risk_category_id);
CREATE INDEX IF NOT EXISTS idx_risks_matrix ON risks(risk_matrix_id);
CREATE INDEX IF NOT EXISTS idx_risks_status_enhanced ON risks(status);
CREATE INDEX IF NOT EXISTS idx_risks_risk_level ON risks(risk_level);
CREATE INDEX IF NOT EXISTS idx_risks_next_review ON risks(next_review_date);
CREATE INDEX IF NOT EXISTS idx_risks_tags ON risks USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_risk_assessments_risk ON risk_assessments(risk_id);
CREATE INDEX IF NOT EXISTS idx_risk_assessments_date ON risk_assessments(assessment_date);
CREATE INDEX IF NOT EXISTS idx_risk_assessments_assessor ON risk_assessments(assessor_id);
CREATE INDEX IF NOT EXISTS idx_risk_assessments_type ON risk_assessments(assessment_type);

CREATE INDEX IF NOT EXISTS idx_risk_treatments_risk ON risk_treatments(risk_id);
CREATE INDEX IF NOT EXISTS idx_risk_treatments_assigned ON risk_treatments(assigned_to);
CREATE INDEX IF NOT EXISTS idx_risk_treatments_status ON risk_treatments(status);
CREATE INDEX IF NOT EXISTS idx_risk_treatments_target_date ON risk_treatments(target_date);

CREATE INDEX IF NOT EXISTS idx_risk_controls_risk ON risk_controls(risk_id);
CREATE INDEX IF NOT EXISTS idx_risk_controls_control ON risk_controls(control_id);
CREATE INDEX IF NOT EXISTS idx_risk_controls_effectiveness ON risk_controls(control_effectiveness);

CREATE INDEX IF NOT EXISTS idx_risk_incidents_risk ON risk_incidents(risk_id);
CREATE INDEX IF NOT EXISTS idx_risk_incidents_date ON risk_incidents(incident_date);
CREATE INDEX IF NOT EXISTS idx_risk_incidents_severity ON risk_incidents(severity);
CREATE INDEX IF NOT EXISTS idx_risk_incidents_status ON risk_incidents(status);

CREATE INDEX IF NOT EXISTS idx_risk_reviews_risk ON risk_reviews(risk_id);
CREATE INDEX IF NOT EXISTS idx_risk_reviews_date ON risk_reviews(review_date);
CREATE INDEX IF NOT EXISTS idx_risk_reviews_reviewer ON risk_reviews(reviewer_id);

CREATE INDEX IF NOT EXISTS idx_risk_workflows_risk ON risk_workflows(risk_id);
CREATE INDEX IF NOT EXISTS idx_risk_workflows_status ON risk_workflows(status);
CREATE INDEX IF NOT EXISTS idx_risk_workflows_type ON risk_workflows(workflow_type);

-- =============================================================================
-- TRIGGERS FOR AUTOMATED TIMESTAMPS
-- =============================================================================
CREATE TRIGGER update_risk_categories_updated_at
    BEFORE UPDATE ON risk_categories
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_risk_appetite_updated_at
    BEFORE UPDATE ON risk_appetite
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_risk_matrices_updated_at
    BEFORE UPDATE ON risk_matrices
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_risk_assessments_updated_at
    BEFORE UPDATE ON risk_assessments
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_risk_treatments_updated_at
    BEFORE UPDATE ON risk_treatments
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_risk_controls_updated_at
    BEFORE UPDATE ON risk_controls
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_risk_incidents_updated_at
    BEFORE UPDATE ON risk_incidents
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_risk_reviews_updated_at
    BEFORE UPDATE ON risk_reviews
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_risk_workflows_updated_at
    BEFORE UPDATE ON risk_workflows
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- =============================================================================
-- FUNCTIONS FOR RISK CALCULATIONS
-- =============================================================================

-- Function to calculate risk score based on probability and impact
CREATE OR REPLACE FUNCTION calculate_risk_score(
    p_probability INTEGER,
    p_impact INTEGER,
    p_matrix_id UUID DEFAULT NULL
) RETURNS INTEGER AS $$
DECLARE
    v_score INTEGER;
    v_matrix_data JSONB;
BEGIN
    -- Get the scoring matrix (use default if not specified)
    SELECT scoring_matrix INTO v_matrix_data
    FROM risk_matrices
    WHERE (p_matrix_id IS NOT NULL AND id = p_matrix_id)
       OR (p_matrix_id IS NULL AND is_default = true)
    LIMIT 1;

    -- If no matrix found, use simple multiplication
    IF v_matrix_data IS NULL THEN
        RETURN p_probability * p_impact;
    END IF;

    -- Extract score from matrix
    SELECT (v_matrix_data->p_probability::text->p_impact::text->>'score')::INTEGER INTO v_score;

    RETURN COALESCE(v_score, p_probability * p_impact);
END;
$$ LANGUAGE plpgsql;

-- Function to calculate risk level based on score
CREATE OR REPLACE FUNCTION calculate_risk_level(
    p_probability INTEGER,
    p_impact INTEGER,
    p_matrix_id UUID DEFAULT NULL
) RETURNS VARCHAR(20) AS $$
DECLARE
    v_level VARCHAR(20);
    v_matrix_data JSONB;
BEGIN
    -- Get the scoring matrix (use default if not specified)
    SELECT scoring_matrix INTO v_matrix_data
    FROM risk_matrices
    WHERE (p_matrix_id IS NOT NULL AND id = p_matrix_id)
       OR (p_matrix_id IS NULL AND is_default = true)
    LIMIT 1;

    -- If no matrix found, use simple calculation
    IF v_matrix_data IS NULL THEN
        CASE
            WHEN (p_probability * p_impact) <= 4 THEN RETURN 'low';
            WHEN (p_probability * p_impact) <= 9 THEN RETURN 'medium';
            WHEN (p_probability * p_impact) <= 15 THEN RETURN 'high';
            ELSE RETURN 'critical';
        END CASE;
    END IF;

    -- Extract level from matrix
    SELECT v_matrix_data->p_probability::text->p_impact::text->>'level' INTO v_level;

    RETURN COALESCE(v_level, 'medium');
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-calculate risk scores on risks table
CREATE OR REPLACE FUNCTION update_risk_scores() RETURNS TRIGGER AS $$
BEGIN
    -- Only update if probability or impact changed
    IF (TG_OP = 'INSERT') OR
       (OLD.probability IS DISTINCT FROM NEW.probability) OR
       (OLD.impact IS DISTINCT FROM NEW.impact) OR
       (OLD.risk_matrix_id IS DISTINCT FROM NEW.risk_matrix_id) THEN

        NEW.inherent_risk_score := calculate_risk_score(NEW.probability, NEW.impact, NEW.risk_matrix_id);
        NEW.risk_level := calculate_risk_level(NEW.probability, NEW.impact, NEW.risk_matrix_id);

        -- Calculate target risk score if target values are set
        IF NEW.target_probability IS NOT NULL AND NEW.target_impact IS NOT NULL THEN
            NEW.target_risk_score := calculate_risk_score(NEW.target_probability, NEW.target_impact, NEW.risk_matrix_id);
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_risk_scores
    BEFORE INSERT OR UPDATE ON risks
    FOR EACH ROW EXECUTE PROCEDURE update_risk_scores();

-- =============================================================================
-- VIEWS FOR RISK REPORTING AND DASHBOARDS
-- =============================================================================

-- Risk Dashboard Summary View
CREATE OR REPLACE VIEW v_risk_dashboard AS
SELECT
    bu.name AS business_unit,
    rc.name AS category,
    COUNT(*) AS total_risks,
    COUNT(CASE WHEN r.risk_level = 'critical' THEN 1 END) AS critical_risks,
    COUNT(CASE WHEN r.risk_level = 'high' THEN 1 END) AS high_risks,
    COUNT(CASE WHEN r.risk_level = 'medium' THEN 1 END) AS medium_risks,
    COUNT(CASE WHEN r.risk_level = 'low' THEN 1 END) AS low_risks,
    COUNT(CASE WHEN r.status = 'identified' THEN 1 END) AS new_risks,
    COUNT(CASE WHEN r.status IN ('treating', 'monitoring') THEN 1 END) AS active_treatments,
    COUNT(CASE WHEN r.next_review_date < CURRENT_DATE THEN 1 END) AS overdue_reviews,
    ROUND(AVG(r.inherent_risk_score), 2) AS avg_inherent_score,
    ROUND(AVG(r.residual_risk_score), 2) AS avg_residual_score
FROM risks r
LEFT JOIN business_units bu ON r.business_unit_id = bu.id
LEFT JOIN risk_categories rc ON r.risk_category_id = rc.id
WHERE r.status != 'closed'
GROUP BY bu.name, rc.name;

-- Risk Heatmap View
CREATE OR REPLACE VIEW v_risk_heatmap AS
SELECT
    r.probability,
    r.impact,
    COUNT(*) AS risk_count,
    ARRAY_AGG(r.title) AS risk_titles,
    ARRAY_AGG(r.id) AS risk_ids,
    calculate_risk_level(r.probability, r.impact, r.risk_matrix_id) AS risk_level
FROM risks r
WHERE r.status != 'closed'
GROUP BY r.probability, r.impact, r.risk_matrix_id;

-- Risk Trends View (monthly aggregation)
CREATE OR REPLACE VIEW v_risk_trends AS
WITH monthly_risks AS (
    SELECT
        DATE_TRUNC('month', ra.assessment_date) AS assessment_month,
        ra.risk_id,
        ra.risk_level,
        ra.risk_score,
        ROW_NUMBER() OVER (PARTITION BY ra.risk_id, DATE_TRUNC('month', ra.assessment_date) ORDER BY ra.assessment_date DESC) AS rn
    FROM risk_assessments ra
)
SELECT
    assessment_month,
    COUNT(*) AS total_assessments,
    COUNT(CASE WHEN risk_level = 'critical' THEN 1 END) AS critical_count,
    COUNT(CASE WHEN risk_level = 'high' THEN 1 END) AS high_count,
    COUNT(CASE WHEN risk_level = 'medium' THEN 1 END) AS medium_count,
    COUNT(CASE WHEN risk_level = 'low' THEN 1 END) AS low_count,
    ROUND(AVG(risk_score), 2) AS avg_risk_score
FROM monthly_risks
WHERE rn = 1  -- Latest assessment for each risk in each month
GROUP BY assessment_month
ORDER BY assessment_month;

-- Risk Treatment Effectiveness View
CREATE OR REPLACE VIEW v_risk_treatment_effectiveness AS
SELECT
    rt.risk_id,
    r.title AS risk_title,
    rt.treatment_type,
    rt.status AS treatment_status,
    rt.effectiveness_rating,
    rt.cost_estimate,
    CASE
        WHEN rt.target_date < CURRENT_DATE AND rt.status NOT IN ('completed', 'cancelled') THEN 'overdue'
        WHEN rt.target_date <= CURRENT_DATE + INTERVAL '7 days' AND rt.status NOT IN ('completed', 'cancelled') THEN 'due_soon'
        ELSE 'on_track'
    END AS timeline_status,
    bu.name AS business_unit,
    CONCAT(u.first_name, ' ', u.last_name) AS assigned_to_name
FROM risk_treatments rt
JOIN risks r ON rt.risk_id = r.id
LEFT JOIN business_units bu ON r.business_unit_id = bu.id
LEFT JOIN users u ON rt.assigned_to = u.id;

-- Risk Control Coverage View
CREATE OR REPLACE VIEW v_risk_control_coverage AS
SELECT
    r.id AS risk_id,
    r.title AS risk_title,
    r.risk_level,
    COUNT(rc.control_id) AS total_controls,
    COUNT(CASE WHEN rc.control_effectiveness = 'effective' THEN 1 END) AS effective_controls,
    COUNT(CASE WHEN rc.control_effectiveness = 'partially_effective' THEN 1 END) AS partially_effective_controls,
    COUNT(CASE WHEN rc.control_effectiveness = 'ineffective' THEN 1 END) AS ineffective_controls,
    COUNT(CASE WHEN rc.control_effectiveness = 'not_tested' THEN 1 END) AS untested_controls,
    CASE
        WHEN COUNT(rc.control_id) = 0 THEN 'no_coverage'
        WHEN COUNT(CASE WHEN rc.control_effectiveness = 'effective' THEN 1 END)::FLOAT / COUNT(rc.control_id) >= 0.8 THEN 'good_coverage'
        WHEN COUNT(CASE WHEN rc.control_effectiveness = 'effective' THEN 1 END)::FLOAT / COUNT(rc.control_id) >= 0.5 THEN 'adequate_coverage'
        ELSE 'poor_coverage'
    END AS coverage_assessment
FROM risks r
LEFT JOIN risk_controls rc ON r.id = rc.risk_id
WHERE r.status != 'closed'
GROUP BY r.id, r.title, r.risk_level;

-- =============================================================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================================================

-- Enable RLS on all new tables
ALTER TABLE risk_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_appetite ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_matrices ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_workflows ENABLE ROW LEVEL SECURITY;

-- Basic policies for authenticated users
CREATE POLICY "Users can view risk categories" ON risk_categories FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage risk categories" ON risk_categories FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view risk appetite" ON risk_appetite FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage risk appetite" ON risk_appetite FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view risk matrices" ON risk_matrices FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage risk matrices" ON risk_matrices FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view risk assessments" ON risk_assessments FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can manage risk assessments" ON risk_assessments FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view risk treatments" ON risk_
