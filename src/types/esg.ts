// ESG Management Types

export type ESGProgramType = 'environmental' | 'social' | 'governance' | 'integrated';
export type ESGProgramStatus = 'active' | 'inactive' | 'draft' | 'completed';
export type ESGCategory = 'environmental' | 'social' | 'governance';
export type ESGDataType = 'numeric' | 'percentage' | 'currency' | 'text' | 'boolean';
export type ESGFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
export type ESGVerificationStatus = 'pending' | 'verified' | 'rejected' | 'under_review';
export type CarbonScope = 'scope1' | 'scope2' | 'scope3';
export type DataQuality = 'measured' | 'calculated' | 'estimated' | 'unknown';
export type DisclosureType = 'annual_report' | 'sustainability_report' | 'esg_report' | 'regulatory_filing' | 'stakeholder_communication';
export type DisclosureStatus = 'draft' | 'in_review' | 'approved' | 'published' | 'archived';
export type PortfolioType = 'investment' | 'supplier' | 'vendor' | 'asset';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type MaterialityLevel = 'low' | 'medium' | 'high' | 'critical';
export type GoalStatus = 'active' | 'achieved' | 'behind_schedule' | 'at_risk' | 'cancelled';
export type StakeholderType = 'investor' | 'customer' | 'employee' | 'supplier' | 'community' | 'regulator' | 'ngo';
export type EngagementType = 'consultation' | 'partnership' | 'communication' | 'feedback' | 'collaboration';
export type EngagementStatus = 'planned' | 'completed' | 'ongoing' | 'cancelled';

// ESG Program Interface
export interface ESGProgram {
  id: string;
  name: string;
  description?: string;
  program_type: ESGProgramType;
  status: ESGProgramStatus;
  business_unit_id?: string;
  owner_id?: string;
  start_date?: string;
  end_date?: string;
  budget?: number;
  currency: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Joined data
  owner?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  business_unit?: {
    name: string;
    code: string;
  };
}

// ESG Metric Interface
export interface ESGMetric {
  id: string;
  program_id: string;
  metric_name: string;
  metric_code: string;
  description?: string;
  category: ESGCategory;
  subcategory?: string;
  unit_of_measure?: string;
  data_type: ESGDataType;
  frequency: ESGFrequency;
  target_value?: number;
  baseline_value?: number;
  is_required: boolean;
  is_public: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Joined data
  program?: {
    name: string;
    program_type: ESGProgramType;
  };
}

// ESG Data Collection Interface
export interface ESGDataCollection {
  id: string;
  metric_id: string;
  reporting_period: string;
  data_value?: number;
  text_value?: string;
  boolean_value?: boolean;
  currency_value?: number;
  currency_code: string;
  data_source?: string;
  collection_method?: string;
  verification_status: ESGVerificationStatus;
  verified_by?: string;
  verified_at?: string;
  notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Joined data
  metric?: {
    metric_name: string;
    metric_code: string;
    category: ESGCategory;
    unit_of_measure?: string;
  };
  verified_by_user?: {
    first_name: string;
    last_name: string;
  };
}

// Carbon Management Interface
export interface CarbonManagement {
  id: string;
  program_id: string;
  scope: CarbonScope;
  emission_source: string;
  emission_type?: string;
  activity_data?: number;
  emission_factor?: number;
  co2_equivalent?: number;
  reporting_period: string;
  business_unit_id?: string;
  location?: string;
  methodology?: string;
  data_quality: DataQuality;
  verification_status: ESGVerificationStatus;
  verified_by?: string;
  verified_at?: string;
  notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Joined data
  program?: {
    name: string;
    program_type: ESGProgramType;
  };
  business_unit?: {
    name: string;
    code: string;
  };
}

// ESG Disclosure Interface
export interface ESGDisclosure {
  id: string;
  program_id: string;
  disclosure_name: string;
  disclosure_type: DisclosureType;
  framework?: string;
  reporting_period: string;
  status: DisclosureStatus;
  due_date?: string;
  published_date?: string;
  content?: string;
  file_urls?: string[];
  approver_id?: string;
  approved_at?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Joined data
  program?: {
    name: string;
    program_type: ESGProgramType;
  };
  approver?: {
    first_name: string;
    last_name: string;
  };
}

// ESG Portfolio Assessment Interface
export interface ESGPortfolioAssessment {
  id: string;
  portfolio_name: string;
  portfolio_type: PortfolioType;
  assessment_date: string;
  total_value?: number;
  currency: string;
  esg_score?: number;
  environmental_score?: number;
  social_score?: number;
  governance_score?: number;
  risk_level: RiskLevel;
  assessment_methodology?: string;
  assessment_framework?: string;
  notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// Double Materiality Assessment Interface
export interface DoubleMaterialityAssessment {
  id: string;
  topic_name: string;
  topic_category: ESGCategory;
  impact_materiality_score?: number;
  financial_materiality_score?: number;
  combined_materiality_score?: number;
  materiality_level: MaterialityLevel;
  impact_description?: string;
  financial_impact_description?: string;
  stakeholders_affected?: string[];
  business_units_affected?: string[];
  mitigation_strategies?: string;
  monitoring_frequency?: string;
  next_assessment_date?: string;
  assessment_date: string;
  assessor_id?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Joined data
  assessor?: {
    first_name: string;
    last_name: string;
  };
}

// ESG Goal Interface
export interface ESGGoal {
  id: string;
  program_id: string;
  goal_name: string;
  description?: string;
  category: ESGCategory;
  target_value?: number;
  baseline_value?: number;
  current_value?: number;
  unit_of_measure?: string;
  target_year?: number;
  status: GoalStatus;
  progress_percentage?: number;
  owner_id?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Joined data
  program?: {
    name: string;
    program_type: ESGProgramType;
  };
  owner?: {
    first_name: string;
    last_name: string;
  };
}

// ESG Stakeholder Engagement Interface
export interface ESGStakeholderEngagement {
  id: string;
  program_id: string;
  stakeholder_name: string;
  stakeholder_type: StakeholderType;
  engagement_type: EngagementType;
  engagement_date?: string;
  engagement_method?: string;
  key_concerns?: string[];
  commitments_made?: string[];
  follow_up_actions?: string[];
  next_engagement_date?: string;
  status: EngagementStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Joined data
  program?: {
    name: string;
    program_type: ESGProgramType;
  };
}

// Form Data Types
export interface ESGProgramFormData {
  name: string;
  description?: string;
  program_type: ESGProgramType;
  status: ESGProgramStatus;
  business_unit_id?: string;
  owner_id?: string;
  start_date?: string;
  end_date?: string;
  budget?: number;
  currency: string;
}

export interface ESGMetricFormData {
  program_id: string;
  metric_name: string;
  metric_code: string;
  description?: string;
  category: ESGCategory;
  subcategory?: string;
  unit_of_measure?: string;
  data_type: ESGDataType;
  frequency: ESGFrequency;
  target_value?: number;
  baseline_value?: number;
  is_required: boolean;
  is_public: boolean;
}

export interface ESGDataCollectionFormData {
  metric_id: string;
  reporting_period: string;
  data_value?: number;
  text_value?: string;
  boolean_value?: boolean;
  currency_value?: number;
  currency_code: string;
  data_source?: string;
  collection_method?: string;
  notes?: string;
}

export interface CarbonManagementFormData {
  program_id: string;
  scope: CarbonScope;
  emission_source: string;
  emission_type?: string;
  activity_data?: number;
  emission_factor?: number;
  co2_equivalent?: number;
  reporting_period: string;
  business_unit_id?: string;
  location?: string;
  methodology?: string;
  data_quality: DataQuality;
  notes?: string;
}

export interface ESGDisclosureFormData {
  program_id: string;
  disclosure_name: string;
  disclosure_type: DisclosureType;
  framework?: string;
  reporting_period: string;
  status: DisclosureStatus;
  due_date?: string;
  content?: string;
  file_urls?: string[];
}

export interface ESGPortfolioAssessmentFormData {
  portfolio_name: string;
  portfolio_type: PortfolioType;
  assessment_date: string;
  total_value?: number;
  currency: string;
  esg_score?: number;
  environmental_score?: number;
  social_score?: number;
  governance_score?: number;
  risk_level: RiskLevel;
  assessment_methodology?: string;
  assessment_framework?: string;
  notes?: string;
}

export interface DoubleMaterialityAssessmentFormData {
  topic_name: string;
  topic_category: ESGCategory;
  impact_materiality_score?: number;
  financial_materiality_score?: number;
  impact_description?: string;
  financial_impact_description?: string;
  stakeholders_affected?: string[];
  business_units_affected?: string[];
  mitigation_strategies?: string;
  monitoring_frequency?: string;
  next_assessment_date?: string;
  assessment_date: string;
  assessor_id?: string;
}

export interface ESGGoalFormData {
  program_id: string;
  goal_name: string;
  description?: string;
  category: ESGCategory;
  target_value?: number;
  baseline_value?: number;
  current_value?: number;
  unit_of_measure?: string;
  target_year?: number;
  status: GoalStatus;
  owner_id?: string;
}

export interface ESGStakeholderEngagementFormData {
  program_id: string;
  stakeholder_name: string;
  stakeholder_type: StakeholderType;
  engagement_type: EngagementType;
  engagement_date?: string;
  engagement_method?: string;
  key_concerns?: string[];
  commitments_made?: string[];
  follow_up_actions?: string[];
  next_engagement_date?: string;
  status: EngagementStatus;
}

// Dashboard and Analytics Types
export interface ESGDashboardMetrics {
  total_programs: number;
  active_programs: number;
  total_metrics: number;
  data_collection_rate: number;
  carbon_footprint_total: number;
  disclosure_completion_rate: number;
  portfolio_assessments: number;
  materiality_assessments: number;
  goals_on_track: number;
  goals_at_risk: number;
}

export interface ESGCarbonSummary {
  scope1_total: number;
  scope2_total: number;
  scope3_total: number;
  total_emissions: number;
  year_over_year_change: number;
  reduction_target: number;
  progress_percentage: number;
}

export interface ESGMaterialityMatrix {
  topic_name: string;
  impact_score: number;
  financial_score: number;
  combined_score: number;
  materiality_level: MaterialityLevel;
  category: ESGCategory;
}

// Filter and Search Types
export interface ESGFilterOptions {
  program_type?: ESGProgramType[];
  status?: ESGProgramStatus[];
  category?: ESGCategory[];
  business_unit?: string[];
  date_range?: {
    start: string;
    end: string;
  };
  verification_status?: ESGVerificationStatus[];
}

export interface ESGSearchParams {
  query?: string;
  filters?: ESGFilterOptions;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  page?: number;
  page_size?: number;
}
