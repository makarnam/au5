export type UUID = string;

export type RegulationStatus = 'draft' | 'active' | 'deprecated';

export interface Regulation {
  id: UUID;
  code: string;
  title: string;
  description?: string | null;
  jurisdiction?: string | null;
  category?: string | null;
  source_url?: string | null;
  tags?: string[] | null;
  effective_date?: string | null;
  status: RegulationStatus;
  created_by?: UUID | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface Amendment {
  id: UUID;
  regulation_id: UUID;
  amendment_code?: string | null;
  title: string;
  summary?: string | null;
  change_text?: string | null;
  source_url?: string | null;
  published_date?: string | null;
  effective_date?: string | null;
  status?: 'draft' | 'published' | 'effective' | 'retracted' | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export type ImpactTargetType = 'framework' | 'control' | 'policy' | 'risk';
export type ImpactLevel = 'low' | 'medium' | 'high' | 'critical';
export type ImpactStatus = 'pending' | 'in_review' | 'approved' | 'implemented' | 'rejected';

export interface RegulationImpact {
  id: UUID;
  regulation_id: UUID;
  amendment_id?: UUID | null;
  target_type: ImpactTargetType;
  target_id: UUID;
  impact_level: ImpactLevel;
  status: ImpactStatus;
  notes?: string | null;
  created_by?: UUID | null;
  created_at?: string | null;
  updated_at?: string | null;
}



