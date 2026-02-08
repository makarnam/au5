import { supabase } from '../lib/supabase';

export interface TrainingModule {
  id: string;
  title: string;
  description?: string;
  content_type: 'video' | 'document' | 'quiz' | 'interactive' | 'webinar';
  content_url?: string;
  duration_minutes?: number;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  tags?: string[];
  prerequisites?: string[];
  learning_objectives?: string[];
  is_mandatory: boolean;
  compliance_frameworks?: string[];
  expiry_days?: number;
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Certification {
  id: string;
  name: string;
  description?: string;
  issuing_authority: string;
  certification_type: 'internal' | 'external' | 'compliance';
  validity_period_months?: number;
  renewal_required: boolean;
  prerequisites?: string[];
  required_training_modules?: string[];
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

export interface UserCertification {
  id: string;
  user_id: string;
  certification_id: string;
  issue_date: string;
  expiry_date?: string;
  status: 'active' | 'expired' | 'revoked' | 'pending_renewal';
  certificate_number?: string;
  verification_url?: string;
  notes?: string;
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

export interface TrainingAssignment {
  id: string;
  user_id: string;
  training_module_id: string;
  assigned_by: string;
  assigned_date: string;
  due_date?: string;
  completion_date?: string;
  status: 'assigned' | 'in_progress' | 'completed' | 'overdue' | 'cancelled';
  progress_percentage: number;
  score?: number;
  attempts: number;
  last_accessed_at?: string;
  notes?: string;
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  training_modules?: TrainingModule;
  users?: {
    email: string;
    first_name: string;
    last_name: string;
  };
}

export interface LearningPath {
  id: string;
  name: string;
  description?: string;
  category: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  estimated_duration_hours?: number;
  training_modules: string[];
  prerequisites?: string[];
  target_audience?: string[];
  is_active: boolean;
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

export class TrainingService {
  // Training Modules
  async getTrainingModules(filters?: {
    category?: string;
    difficulty_level?: string;
    is_mandatory?: boolean;
    compliance_framework?: string;
  }, page = 1, limit = 10): Promise<{ data: TrainingModule[]; total: number; error: any }> {
    try {
      let query = supabase
        .from('training_modules')
        .select('*', { count: 'exact' });

      if (filters) {
        if (filters.category) {
          query = query.eq('category', filters.category);
        }
        if (filters.difficulty_level) {
          query = query.eq('difficulty_level', filters.difficulty_level);
        }
        if (filters.is_mandatory !== undefined) {
          query = query.eq('is_mandatory', filters.is_mandatory);
        }
        if (filters.compliance_framework) {
          query = query.contains('compliance_frameworks', [filters.compliance_framework]);
        }
      }

      const offset = (page - 1) * limit;
      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      return { data: data || [], total: count || 0, error };
    } catch (error) {
      return { data: [], total: 0, error };
    }
  }

  async getTrainingModule(id: string): Promise<{ data: TrainingModule | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('training_modules')
        .select('*')
        .eq('id', id)
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  async createTrainingModule(module: Omit<TrainingModule, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: TrainingModule | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('training_modules')
        .insert([module])
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  async updateTrainingModule(id: string, updates: Partial<TrainingModule>): Promise<{ data: TrainingModule | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('training_modules')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  async deleteTrainingModule(id: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('training_modules')
        .delete()
        .eq('id', id);

      return { error };
    } catch (error) {
      return { error };
    }
  }

  // Certifications
  async getCertifications(filters?: {
    certification_type?: string;
    issuing_authority?: string;
    renewal_required?: boolean;
  }, page = 1, limit = 10): Promise<{ data: Certification[]; total: number; error: any }> {
    try {
      let query = supabase
        .from('certifications')
        .select('*', { count: 'exact' });

      if (filters) {
        if (filters.certification_type) {
          query = query.eq('certification_type', filters.certification_type);
        }
        if (filters.issuing_authority) {
          query = query.eq('issuing_authority', filters.issuing_authority);
        }
        if (filters.renewal_required !== undefined) {
          query = query.eq('renewal_required', filters.renewal_required);
        }
      }

      const offset = (page - 1) * limit;
      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      return { data: data || [], total: count || 0, error };
    } catch (error) {
      return { data: [], total: 0, error };
    }
  }

  async getCertification(id: string): Promise<{ data: Certification | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('certifications')
        .select('*')
        .eq('id', id)
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  async createCertification(certification: Omit<Certification, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: Certification | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('certifications')
        .insert([certification])
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  async updateCertification(id: string, updates: Partial<Certification>): Promise<{ data: Certification | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('certifications')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  async deleteCertification(id: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('certifications')
        .delete()
        .eq('id', id);

      return { error };
    } catch (error) {
      return { error };
    }
  }

  // User Certifications
  async getUserCertifications(userId?: string, filters?: {
    status?: string;
    certification_id?: string;
    expiry_before?: string;
  }, page = 1, limit = 10): Promise<{ data: UserCertification[]; total: number; error: any }> {
    try {
      let query = supabase
        .from('user_certifications')
        .select('*, certifications(*), users!user_id(email, first_name, last_name)', { count: 'exact' });

      if (userId) {
        query = query.eq('user_id', userId);
      }

      if (filters) {
        if (filters.status) {
          query = query.eq('status', filters.status);
        }
        if (filters.certification_id) {
          query = query.eq('certification_id', filters.certification_id);
        }
        if (filters.expiry_before) {
          query = query.lt('expiry_date', filters.expiry_before);
        }
      }

      const offset = (page - 1) * limit;
      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      return { data: data || [], total: count || 0, error };
    } catch (error) {
      return { data: [], total: 0, error };
    }
  }

  async createUserCertification(certification: Omit<UserCertification, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: UserCertification | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('user_certifications')
        .insert([certification])
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  async updateUserCertification(id: string, updates: Partial<UserCertification>): Promise<{ data: UserCertification | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('user_certifications')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Training Assignments
  async getTrainingAssignments(userId?: string, filters?: {
    status?: string;
    training_module_id?: string;
    overdue?: boolean;
  }, page = 1, limit = 10): Promise<{ data: TrainingAssignment[]; total: number; error: any }> {
    try {
      let query = supabase
        .from('training_assignments')
        .select('*, training_modules(*), users!user_id(email, first_name, last_name), users!assigned_by(email, first_name, last_name)', { count: 'exact' });

      if (userId) {
        query = query.eq('user_id', userId);
      }

      if (filters) {
        if (filters.status) {
          query = query.eq('status', filters.status);
        }
        if (filters.training_module_id) {
          query = query.eq('training_module_id', filters.training_module_id);
        }
        if (filters.overdue) {
          query = query.lt('due_date', new Date().toISOString().split('T')[0]).eq('status', 'assigned');
        }
      }

      const offset = (page - 1) * limit;
      const { data, error, count } = await query
        .order('assigned_date', { ascending: false })
        .range(offset, offset + limit - 1);

      return { data: data || [], total: count || 0, error };
    } catch (error) {
      return { data: [], total: 0, error };
    }
  }

  async createTrainingAssignment(assignment: Omit<TrainingAssignment, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: TrainingAssignment | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('training_assignments')
        .insert([assignment])
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  async updateTrainingAssignment(id: string, updates: Partial<TrainingAssignment>): Promise<{ data: TrainingAssignment | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('training_assignments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Learning Paths
  async getLearningPaths(filters?: {
    category?: string;
    difficulty_level?: string;
    is_active?: boolean;
  }, page = 1, limit = 10): Promise<{ data: LearningPath[]; total: number; error: any }> {
    try {
      let query = supabase
        .from('learning_paths')
        .select('*', { count: 'exact' });

      if (filters) {
        if (filters.category) {
          query = query.eq('category', filters.category);
        }
        if (filters.difficulty_level) {
          query = query.eq('difficulty_level', filters.difficulty_level);
        }
        if (filters.is_active !== undefined) {
          query = query.eq('is_active', filters.is_active);
        }
      }

      const offset = (page - 1) * limit;
      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      return { data: data || [], total: count || 0, error };
    } catch (error) {
      return { data: [], total: 0, error };
    }
  }

  async getLearningPath(id: string): Promise<{ data: LearningPath | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('learning_paths')
        .select('*')
        .eq('id', id)
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  async createLearningPath(path: Omit<LearningPath, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: LearningPath | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('learning_paths')
        .insert([path])
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  async updateLearningPath(id: string, updates: Partial<LearningPath>): Promise<{ data: LearningPath | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('learning_paths')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Analytics methods
  async getTrainingAnalytics(): Promise<{ data: any; error: any }> {
    try {
      // Get total training modules
      const { count: totalModules } = await supabase
        .from('training_modules')
        .select('*', { count: 'exact', head: true });

      // Get total certifications
      const { count: totalCertifications } = await supabase
        .from('certifications')
        .select('*', { count: 'exact', head: true });

      // Get total user certifications
      const { count: totalUserCertifications } = await supabase
        .from('user_certifications')
        .select('*', { count: 'exact', head: true });

      // Get active certifications
      const { count: activeCertifications } = await supabase
        .from('user_certifications')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Get expired certifications
      const { count: expiredCertifications } = await supabase
        .from('user_certifications')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'expired');

      // Get total training assignments
      const { count: totalAssignments } = await supabase
        .from('training_assignments')
        .select('*', { count: 'exact', head: true });

      // Get completed assignments
      const { count: completedAssignments } = await supabase
        .from('training_assignments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed');

      // Get overdue assignments
      const { count: overdueAssignments } = await supabase
        .from('training_assignments')
        .select('*', { count: 'exact', head: true })
        .lt('due_date', new Date().toISOString().split('T')[0])
        .eq('status', 'assigned');

      const completionRate = (totalAssignments || 0) > 0 ? Math.round(((completedAssignments || 0) / (totalAssignments || 0)) * 100) : 0;

      return {
        data: {
          totalModules: totalModules || 0,
          totalCertifications: totalCertifications || 0,
          totalUserCertifications: totalUserCertifications || 0,
          activeCertifications: activeCertifications || 0,
          expiredCertifications: expiredCertifications || 0,
          totalAssignments: totalAssignments || 0,
          completedAssignments: completedAssignments || 0,
          overdueAssignments: overdueAssignments || 0,
          completionRate
        },
        error: null
      };
    } catch (error) {
      return { data: null, error };
    }
  }

  async getComplianceTrainingStatus(): Promise<{ data: any; error: any }> {
    try {
      // Get mandatory training modules
      const { data: mandatoryModules } = await supabase
        .from('training_modules')
        .select('id, title')
        .eq('is_mandatory', true);

      // Get users who haven't completed mandatory training
      const { data: incompleteAssignments } = await supabase
        .from('training_assignments')
        .select('user_id, training_module_id, users!user_id(email, first_name, last_name)')
        .in('training_module_id', mandatoryModules?.map(m => m.id) || [])
        .neq('status', 'completed');

      // Group by user
      const complianceIssues = incompleteAssignments?.reduce((acc: any, assignment: any) => {
        const userId = assignment.user_id;
        if (!acc[userId]) {
          acc[userId] = {
            user: assignment.users,
            incomplete_modules: []
          };
        }
        acc[userId].incomplete_modules.push(assignment.training_module_id);
        return acc;
      }, {}) || {};

      return {
        data: {
          mandatoryModulesCount: mandatoryModules?.length || 0,
          complianceIssuesCount: Object.keys(complianceIssues).length,
          complianceIssues
        },
        error: null
      };
    } catch (error) {
      return { data: null, error };
    }
  }
}

export const trainingService = new TrainingService();