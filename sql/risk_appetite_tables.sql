-- Risk Appetite Management Tables
-- Create missing tables for risk appetite functionality

-- Risk Measurements Table
CREATE TABLE IF NOT EXISTS risk_measurements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  framework_id UUID REFERENCES risk_appetite_framework(id) ON DELETE CASCADE,
  category VARCHAR NOT NULL,
  current_value DECIMAL NOT NULL,
  threshold_min DECIMAL NOT NULL,
  threshold_max DECIMAL NOT NULL,
  unit VARCHAR NOT NULL,
  status VARCHAR DEFAULT 'within_appetite' CHECK (status IN ('within_appetite', 'approaching_limit', 'breached')),
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Risk Scenarios Table
CREATE TABLE IF NOT EXISTS risk_scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  framework_id UUID REFERENCES risk_appetite_framework(id) ON DELETE CASCADE,
  title VARCHAR NOT NULL,
  description TEXT,
  impact_level VARCHAR DEFAULT 'medium' CHECK (impact_level IN ('low', 'medium', 'high', 'critical')),
  probability DECIMAL DEFAULT 25,
  potential_loss DECIMAL DEFAULT 0,
  mitigation_plan TEXT,
  status VARCHAR DEFAULT 'identified' CHECK (status IN ('identified', 'assessed', 'mitigated')),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_risk_measurements_framework ON risk_measurements(framework_id);
CREATE INDEX IF NOT EXISTS idx_risk_measurements_status ON risk_measurements(status);
CREATE INDEX IF NOT EXISTS idx_risk_scenarios_framework ON risk_scenarios(framework_id);
CREATE INDEX IF NOT EXISTS idx_risk_scenarios_status ON risk_scenarios(status);

-- Enable RLS
ALTER TABLE risk_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_scenarios ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view risk measurements" ON risk_measurements FOR SELECT USING (true);
CREATE POLICY "Users can manage risk measurements" ON risk_measurements FOR ALL USING (auth.uid() = created_by OR auth.role() = 'admin');

CREATE POLICY "Users can view risk scenarios" ON risk_scenarios FOR SELECT USING (true);
CREATE POLICY "Users can manage risk scenarios" ON risk_scenarios FOR ALL USING (auth.uid() = created_by OR auth.role() = 'admin');

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON risk_measurements TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON risk_scenarios TO authenticated;