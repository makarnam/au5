export interface Policy {
  id: string;
  name: string;
  description?: string | null;
  owner_id?: string | null;
  is_active: boolean;
  tags?: string[] | null;
  created_by?: string | null;
  created_at?: string;
  updated_at?: string;
}

export type PolicyVersionStatus = 'draft' | 'published' | 'archived';

export interface PolicyVersion {
  id: string;
  policy_id: string;
  version_number: number;
  title: string;
  content: string; // markdown
  status: PolicyVersionStatus;
  ai_generated?: boolean;
  created_by?: string | null;
  created_at?: string;
  updated_at?: string;
}