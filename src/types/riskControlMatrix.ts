// Risk Control Matrix Types
export interface RiskControlMatrix {
  id: string;
  name: string;
  description: string;
  matrix_type: "5x5" | "4x4" | "3x3" | "custom";
  risk_levels: RiskLevel[];
  control_effectiveness_levels: ControlEffectivenessLevel[];
  business_unit_id: string;
  framework_id?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface MatrixCell {
  id: string;
  matrix_id: string;
  risk_level: RiskLevel;
  control_effectiveness: ControlEffectivenessLevel;
  position_x: number;
  position_y: number;
  color_code: string;
  description: string;
  action_required: string;
  created_at: string;
}

export interface RiskControlMapping {
  id: string;
  matrix_id: string;
  risk_id: string;
  control_id: string;
  mapping_date: string;
  mapped_by: string;
  effectiveness_rating: number; // 1-5
  coverage_rating: number; // 1-5
  notes: string;
  created_at: string;
}

export interface MatrixTemplate {
  id: string;
  name: string;
  description: string;
  matrix_type: "5x5" | "4x4" | "3x3" | "custom";
  template_data: any;
  industry: string;
  framework: string;
  is_public: boolean;
  created_by: string;
  created_at: string;
}

export type ControlEffectivenessLevel = 
  | "excellent" 
  | "good" 
  | "adequate" 
  | "weak" 
  | "inadequate";

export type RiskLevel = 
  | "low" 
  | "medium" 
  | "high" 
  | "critical";

// Service Types
export interface CreateMatrixData {
  name: string;
  description: string;
  matrix_type: "5x5" | "4x4" | "3x3" | "custom";
  risk_levels: RiskLevel[];
  control_effectiveness_levels: ControlEffectivenessLevel[];
  business_unit_id?: string;
  framework_id?: string;
}

export interface UpdateMatrixData {
  name?: string;
  description?: string;
  matrix_type?: "5x5" | "4x4" | "3x3" | "custom";
  risk_levels?: RiskLevel[];
  control_effectiveness_levels?: ControlEffectivenessLevel[];
  business_unit_id?: string;
  framework_id?: string;
}

export interface CreateMappingData {
  matrix_id: string;
  risk_id: string;
  control_id: string;
  mapping_date: string;
  effectiveness_rating: number;
  coverage_rating: number;
  notes?: string;
}

export interface UpdateMappingData {
  effectiveness_rating?: number;
  coverage_rating?: number;
  notes?: string;
}

export interface UpdateCellData {
  color_code?: string;
  description?: string;
  action_required?: string;
}

export interface MatrixFilter {
  business_unit_id?: string;
  framework_id?: string;
  matrix_type?: string;
  created_by?: string;
}

export interface TemplateFilter {
  industry?: string;
  framework?: string;
  is_public?: boolean;
  matrix_type?: string;
}

export interface CreateTemplateData {
  name: string;
  description: string;
  matrix_type: "5x5" | "4x4" | "3x3" | "custom";
  template_data: any;
  industry: string;
  framework: string;
  is_public: boolean;
}

// AI Integration Types
export interface AIMatrixConfig {
  industry: string;
  business_size: string;
  risk_categories: string[];
  control_frameworks: string[];
  matrix_size: "3x3" | "4x4" | "5x5";
  include_existing_risks: boolean;
  include_existing_controls: boolean;
  generation_focus: "comprehensive" | "focused" | "minimal";
}

export interface GapAnalysis {
  uncovered_risks: string[];
  weak_control_areas: string[];
  over_controlled_areas: string[];
  optimization_opportunities: string[];
  recommended_actions: string[];
}

export interface ControlSuggestion {
  control_id: string;
  control_title: string;
  effectiveness_score: number;
  coverage_score: number;
  reasoning: string;
}

// Analytics Types
export interface MatrixAnalytics {
  total_risks: number;
  total_controls: number;
  mapped_risks: number;
  mapped_controls: number;
  coverage_percentage: number;
  effectiveness_distribution: Record<string, number>;
  risk_distribution: Record<string, number>;
  gap_analysis: GapAnalysis;
}

export type ExportFormat = "pdf" | "excel" | "csv" | "json";

// Component Props Types
export interface DragDropMatrixProps {
  matrix: RiskControlMatrix;
  risks: any[];
  controls: any[];
  mappings: RiskControlMapping[];
  onMappingChange: (mapping: RiskControlMapping) => void;
  onRiskDrop: (riskId: string, cellId: string) => void;
  onControlDrop: (controlId: string, cellId: string) => void;
}

export interface AIMatrixGenerationConfig {
  industry: string;
  business_size: string;
  risk_categories: string[];
  control_frameworks: string[];
  matrix_size: "3x3" | "4x4" | "5x5";
  include_existing_risks: boolean;
  include_existing_controls: boolean;
  generation_focus: "comprehensive" | "focused" | "minimal";
}
