import { supabase } from '../lib/supabase';

// Types
export interface GovernanceStrategy {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'active' | 'archived';
  version: string;
  effective_date: string | null;
  review_date: string | null;
  objectives: string[];
  strategic_goals: {
    goals: Array<{
      name: string;
      target: number;
      unit: string;
    }>;
  };
  kpis: {
    kpis: Array<{
      name: string;
      target: string;
      frequency: string;
    }>;
  };
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface StrategicInitiative {
  id: string;
  title: string;
  description: string;
  objective: string;
  strategic_alignment: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'planned' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
  start_date: string | null;
  target_completion_date: string | null;
  actual_completion_date: string | null;
  budget_allocated: number | null;
  budget_spent: number | null;
  sponsor: string | null;
  project_manager: string | null;
  stakeholders: string[];
  deliverables: string[];
  risks: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface GovernanceKPI {
  id: string;
  name: string;
  description: string;
  category: string;
  metric_type: 'percentage' | 'count' | 'currency' | 'ratio' | 'index';
  target_value: number | null;
  current_value: number | null;
  unit: string | null;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
  calculation_method: string | null;
  data_source: string | null;
  responsible_person: string | null;
  status: 'active' | 'inactive' | 'archived';
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface StrategyFormData {
  title: string;
  description: string;
  status: 'draft' | 'active' | 'archived';
  version: string;
  effective_date: string;
  review_date: string;
  objectives: string[];
  strategic_goals: {
    goals: Array<{
      name: string;
      target: number;
      unit: string;
    }>;
  };
  kpis: {
    kpis: Array<{
      name: string;
      target: string;
      frequency: string;
    }>;
  };
}

export interface InitiativeFormData {
  title: string;
  description: string;
  objective: string;
  strategic_alignment: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'planned' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
  start_date: string;
  target_completion_date: string;
  budget_allocated: number;
  sponsor: string;
  project_manager: string;
  stakeholders: string[];
  deliverables: string[];
  risks: string[];
}

export interface KPIFormData {
   name: string;
   description: string;
   category: string;
   metric_type: 'percentage' | 'count' | 'currency' | 'ratio' | 'index';
   target_value: number;
   current_value: number;
   unit: string;
   frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
   calculation_method: string;
   data_source: string;
   responsible_person: string;
   status: 'active' | 'inactive' | 'archived';
 }

export interface RegulatoryChange {
   id: string;
   title: string;
   description: string;
   regulatory_body: string;
   regulation_name: string;
   change_type: 'new_regulation' | 'amendment' | 'guidance' | 'deadline' | 'requirement';
   effective_date: string | null;
   compliance_deadline: string | null;
   impact_assessment: string;
   risk_rating: 'low' | 'medium' | 'high' | 'critical';
   affected_business_units: string[];
   required_actions: string[];
   status: 'identified' | 'assessing' | 'implementing' | 'completed' | 'monitoring';
   assigned_to: string | null;
   priority: 'low' | 'medium' | 'high' | 'critical';
   created_by: string;
   created_at: string;
   updated_at: string;
 }

export interface ComplianceMapping {
    id: string;
    regulation_id: string;
    framework_id: string;
    requirement_id: string;
    control_id: string | null;
    mapping_type: 'direct' | 'partial' | 'compensating' | 'not_applicable';
    mapping_evidence: string;
    gap_analysis: string;
    remediation_plan: string;
    status: 'mapped' | 'gap_identified' | 'remediation_planned' | 'implemented';
    created_by: string;
    created_at: string;
    updated_at: string;
  }

// ==================== RISK APPETITE FRAMEWORK ====================

export interface RiskAppetiteFramework {
  id: string;
  name: string;
  description: string;
  risk_categories: {
    categories: string[];
  };
  appetite_levels: {
    levels: {
      low: string;
      moderate: string;
      high: string;
    };
  };
  tolerance_thresholds: {
    thresholds: {
      [key: string]: {
        min: number;
        max: number;
        unit: string;
      };
    };
  };
  review_frequency: string;
  next_review_date: string | null;
  status: 'draft' | 'approved' | 'under_review';
  approved_by: string | null;
  approval_date: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface RiskMeasurement {
  id: string;
  framework_id: string;
  category: string;
  current_value: number;
  threshold_min: number;
  threshold_max: number;
  unit: string;
  status: 'within_appetite' | 'approaching_limit' | 'breached';
  last_updated: string;
  created_by: string;
}

export interface RiskScenario {
  id: string;
  framework_id: string;
  title: string;
  description: string;
  impact_level: 'low' | 'medium' | 'high' | 'critical';
  probability: number;
  potential_loss: number;
  mitigation_plan: string;
  status: 'identified' | 'assessed' | 'mitigated';
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface RiskAppetiteFormData {
  name: string;
  description: string;
  risk_categories: string[];
  appetite_levels: {
    low: string;
    moderate: string;
    high: string;
  };
  tolerance_thresholds: {
    [key: string]: {
      min: number;
      max: number;
      unit: string;
    };
  };
  review_frequency: string;
  next_review_date: string;
  status: 'draft' | 'approved' | 'under_review';
}

export interface RegulatoryChangeFormData {
   title: string;
   description: string;
   regulatory_body: string;
   regulation_name: string;
   change_type: 'new_regulation' | 'amendment' | 'guidance' | 'deadline' | 'requirement';
   effective_date: string;
   compliance_deadline: string;
   impact_assessment: string;
   risk_rating: 'low' | 'medium' | 'high' | 'critical';
   affected_business_units: string[];
   required_actions: string[];
   status: 'identified' | 'assessing' | 'implementing' | 'completed' | 'monitoring';
   assigned_to: string;
   priority: 'low' | 'medium' | 'high' | 'critical';
 }

// Governance Service Class
export class GovernanceService {

  // ==================== GOVERNANCE STRATEGIES ====================

  static async getStrategies(): Promise<GovernanceStrategy[]> {
    const { data, error } = await supabase
      .from('governance_strategy')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching strategies:', error);
      throw error;
    }

    return (data || []) as GovernanceStrategy[];
  }

  static async getStrategyById(id: string): Promise<GovernanceStrategy | null> {
    const { data, error } = await supabase
      .from('governance_strategy')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching strategy:', error);
      return null;
    }

    return data as GovernanceStrategy;
  }

  static async createStrategy(strategyData: StrategyFormData): Promise<GovernanceStrategy> {
    try {
      // First, let's check the current session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      console.log('Session check:', { sessionData, sessionError });

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      console.log('User check:', { user, userError });

      if (!user) throw new Error('User not authenticated');

      console.log('User authenticated:', user.id);
      console.log('Creating strategy with data:', strategyData);

      // Ensure proper data format
      const insertData = {
        title: strategyData.title,
        description: strategyData.description || '',
        status: strategyData.status,
        version: strategyData.version || '1.0',
        effective_date: strategyData.effective_date || null,
        review_date: strategyData.review_date || null,
        objectives: Array.isArray(strategyData.objectives) ? strategyData.objectives : [],
        strategic_goals: strategyData.strategic_goals || { goals: [] },
        kpis: strategyData.kpis || { kpis: [] },
        created_by: user.id
      };

      console.log('Final insert data:', JSON.stringify(insertData, null, 2));

      // Try a simple insert first to test permissions
      console.log('Testing basic insert...');
      const { data: testData, error: testError } = await supabase
        .from('governance_strategy')
        .insert([{
          title: 'Test Strategy',
          description: 'Test Description',
          status: 'draft',
          objectives: ['Test objective'],
          strategic_goals: { goals: [] },
          kpis: { kpis: [] },
          created_by: user.id
        }])
        .select()
        .single();

      if (testError) {
        console.error('Test insert failed:', testError);
        throw new Error(`Permission test failed: ${testError.message}`);
      }

      console.log('Test insert successful, proceeding with actual data...');

      // Now try with the actual data
      const { data, error } = await supabase
        .from('governance_strategy')
        .insert([insertData])
        .select()
        .single();

      if (error) {
        console.error('Supabase error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw new Error(`Failed to create strategy: ${error.message}`);
      }

      console.log('Strategy created successfully:', data);
      return data as GovernanceStrategy;
    } catch (error) {
      console.error('Error in createStrategy:', error);
      throw error;
    }
  }

  static async updateStrategy(id: string, strategyData: Partial<StrategyFormData>): Promise<GovernanceStrategy> {
    try {
      // Check authentication
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      console.log('Update strategy - User check:', { user, userError });

      if (!user) throw new Error('User not authenticated');

      console.log('User authenticated for update:', user.id);
      console.log('Updating strategy ID:', id);
      console.log('Update data:', strategyData);

      // Check if user is admin by querying the users table
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        throw new Error('Unable to verify user permissions');
      }

      const isAdmin = userProfile?.role === 'admin' || userProfile?.role === 'super_admin';
      console.log('User role check:', { role: userProfile?.role, isAdmin });

      // Verify the strategy exists
      const { data: existingStrategy, error: fetchError } = await supabase
        .from('governance_strategy')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) {
        console.error('Error fetching existing strategy:', fetchError);
        throw new Error(`Strategy not found or access denied: ${fetchError.message}`);
      }

      if (!existingStrategy) {
        throw new Error('Strategy not found');
      }

      console.log('Existing strategy found:', existingStrategy);

      // Check permissions: admin can update any strategy, regular users can only update their own
      if (!isAdmin && existingStrategy.created_by && existingStrategy.created_by !== user.id) {
        console.error('User does not own this strategy:', {
          strategyOwner: existingStrategy.created_by,
          currentUser: user.id,
          userRole: userProfile?.role
        });
        throw new Error('You do not have permission to update this strategy');
      }

      // Prepare update data - ensure we don't overwrite critical fields
      const updateData = {
        ...strategyData,
        // Don't allow updating created_by or timestamps
        created_by: undefined,
        created_at: undefined,
        updated_at: undefined
      };

      console.log('Final update data:', JSON.stringify(updateData, null, 2));

      // Perform the update
      const { data, error } = await supabase
        .from('governance_strategy')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Supabase update error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw new Error(`Failed to update strategy: ${error.message}`);
      }

      console.log('Strategy updated successfully:', data);
      return data as GovernanceStrategy;
    } catch (error) {
      console.error('Error in updateStrategy:', error);
      throw error;
    }
  }

  static async deleteStrategy(id: string): Promise<void> {
    const { error } = await supabase
      .from('governance_strategy')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting strategy:', error);
      throw error;
    }
  }

  // ==================== STRATEGIC INITIATIVES ====================

  static async getInitiatives(): Promise<StrategicInitiative[]> {
    const { data, error } = await supabase
      .from('governance_initiatives')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching initiatives:', error);
      throw error;
    }

    return (data || []) as StrategicInitiative[];
  }

  static async getInitiativeById(id: string): Promise<StrategicInitiative | null> {
    const { data, error } = await supabase
      .from('governance_initiatives')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching initiative:', error);
      return null;
    }

    return data as StrategicInitiative;
  }

  static async createInitiative(initiativeData: InitiativeFormData): Promise<StrategicInitiative> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('governance_initiatives')
      .insert([{
        ...initiativeData,
        created_by: user.id
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating initiative:', error);
      throw error;
    }

    return data as StrategicInitiative;
  }

  static async updateInitiative(id: string, initiativeData: Partial<InitiativeFormData>): Promise<StrategicInitiative> {
    try {
      // Check authentication
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      console.log('Update initiative - User check:', { user, userError });

      if (!user) throw new Error('User not authenticated');

      console.log('User authenticated for initiative update:', user.id);
      console.log('Updating initiative ID:', id);
      console.log('Update data:', initiativeData);

      // Check if user is admin by querying the users table
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        throw new Error('Unable to verify user permissions');
      }

      const isAdmin = userProfile?.role === 'admin' || userProfile?.role === 'super_admin';
      console.log('User role check:', { role: userProfile?.role, isAdmin });

      // Verify the initiative exists
      const { data: existingInitiative, error: fetchError } = await supabase
        .from('governance_initiatives')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) {
        console.error('Error fetching existing initiative:', fetchError);
        throw new Error(`Initiative not found or access denied: ${fetchError.message}`);
      }

      if (!existingInitiative) {
        throw new Error('Initiative not found');
      }

      console.log('Existing initiative found:', existingInitiative);

      // Check permissions: admin can update any initiative, regular users can only update their own
      if (!isAdmin && existingInitiative.created_by && existingInitiative.created_by !== user.id) {
        console.error('User does not own this initiative:', {
          initiativeOwner: existingInitiative.created_by,
          currentUser: user.id,
          userRole: userProfile?.role
        });
        throw new Error('You do not have permission to update this initiative');
      }

      // Prepare update data
      const updateData = {
        ...initiativeData,
        created_by: undefined,
        created_at: undefined,
        updated_at: undefined
      };

      console.log('Final update data:', JSON.stringify(updateData, null, 2));

      // Perform the update
      const { data, error } = await supabase
        .from('governance_initiatives')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Supabase update error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw new Error(`Failed to update initiative: ${error.message}`);
      }

      console.log('Initiative updated successfully:', data);
      return data as StrategicInitiative;
    } catch (error) {
      console.error('Error in updateInitiative:', error);
      throw error;
    }
  }

  static async deleteInitiative(id: string): Promise<void> {
    const { error } = await supabase
      .from('governance_initiatives')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting initiative:', error);
      throw error;
    }
  }

  // ==================== GOVERNANCE KPIS ====================

  static async getKPIs(): Promise<GovernanceKPI[]> {
    const { data, error } = await supabase
      .from('governance_kpis')
      .select('*')
      .eq('status', 'active')
      .order('name');

    if (error) {
      console.error('Error fetching KPIs:', error);
      throw error;
    }

    return (data || []) as GovernanceKPI[];
  }

  static async getKPIById(id: string): Promise<GovernanceKPI | null> {
    const { data, error } = await supabase
      .from('governance_kpis')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching KPI:', error);
      return null;
    }

    return data as GovernanceKPI;
  }

  static async createKPI(kpiData: KPIFormData): Promise<GovernanceKPI> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('governance_kpis')
      .insert([{
        ...kpiData,
        created_by: user.id
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating KPI:', error);
      throw error;
    }

    return data as GovernanceKPI;
  }

  static async updateKPI(id: string, kpiData: Partial<KPIFormData>): Promise<GovernanceKPI> {
    try {
      // Check authentication
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      console.log('Update KPI - User check:', { user, userError });

      if (!user) throw new Error('User not authenticated');

      console.log('User authenticated for KPI update:', user.id);
      console.log('Updating KPI ID:', id);
      console.log('Update data:', kpiData);

      // Check if user is admin by querying the users table
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        throw new Error('Unable to verify user permissions');
      }

      const isAdmin = userProfile?.role === 'admin' || userProfile?.role === 'super_admin';
      console.log('User role check:', { role: userProfile?.role, isAdmin });

      // Verify the KPI exists
      const { data: existingKPI, error: fetchError } = await supabase
        .from('governance_kpis')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) {
        console.error('Error fetching existing KPI:', fetchError);
        throw new Error(`KPI not found or access denied: ${fetchError.message}`);
      }

      if (!existingKPI) {
        throw new Error('KPI not found');
      }

      console.log('Existing KPI found:', existingKPI);

      // Check permissions: admin can update any KPI, regular users can only update their own
      if (!isAdmin && existingKPI.created_by && existingKPI.created_by !== user.id) {
        console.error('User does not own this KPI:', {
          kpiOwner: existingKPI.created_by,
          currentUser: user.id,
          userRole: userProfile?.role
        });
        throw new Error('You do not have permission to update this KPI');
      }

      // Prepare update data
      const updateData = {
        ...kpiData,
        created_by: undefined,
        created_at: undefined,
        updated_at: undefined
      };

      console.log('Final update data:', JSON.stringify(updateData, null, 2));

      // Perform the update
      const { data, error } = await supabase
        .from('governance_kpis')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Supabase update error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw new Error(`Failed to update KPI: ${error.message}`);
      }

      console.log('KPI updated successfully:', data);
      return data as GovernanceKPI;
    } catch (error) {
      console.error('Error in updateKPI:', error);
      throw error;
    }
  }

  static async deleteKPI(id: string): Promise<void> {
    const { error } = await supabase
      .from('governance_kpis')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting KPI:', error);
      throw error;
    }
  }

  // ==================== ANALYTICS & METRICS ====================

  static async getStrategyAnalytics() {
    try {
      const [strategiesResult, initiativesResult, kpisResult] = await Promise.all([
        supabase.from('governance_strategy').select('id, status, objectives'),
        supabase.from('governance_initiatives').select('id, status'),
        supabase.from('governance_kpis').select('id, current_value, target_value')
      ]);

      const totalStrategies = strategiesResult.data?.length || 0;
      const activeStrategies = strategiesResult.data?.filter(s => s.status === 'active').length || 0;
      const totalObjectives = strategiesResult.data?.reduce((sum, s) => sum + (s.objectives?.length || 0), 0) || 0;
      const totalInitiatives = initiativesResult.data?.length || 0;
      const initiativesOnTrack = initiativesResult.data?.filter(i => i.status === 'in_progress' || i.status === 'completed').length || 0;

      // Calculate KPI performance
      const kpiData = kpisResult.data?.filter(k => k.current_value && k.target_value) || [];
      const averageKPIPerformance = kpiData.length > 0
        ? kpiData.reduce((sum, k) => sum + ((k.current_value! / k.target_value!) * 100), 0) / kpiData.length
        : 0;

      return {
        totalStrategies,
        activeStrategies,
        completedObjectives: 0, // This would need more complex calculation
        totalObjectives,
        averageKPIPerformance,
        initiativesOnTrack,
        totalInitiatives
      };
    } catch (error) {
      console.error('Error fetching strategy analytics:', error);
      throw error;
    }
  }

  // ==================== UTILITY METHODS ====================

  static async updateKPIMeasurement(kpiId: string, value: number, notes?: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('governance_kpi_measurements')
      .insert([{
        kpi_id: kpiId,
        value,
        notes,
        created_by: user.id
      }]);

    if (error) {
      console.error('Error updating KPI measurement:', error);
      throw error;
    }
  }

  // ==================== REGULATORY CHANGES ====================

  static async getRegulatoryChanges(): Promise<RegulatoryChange[]> {
    const { data, error } = await supabase
      .from('regulatory_changes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching regulatory changes:', error);
      throw error;
    }

    return (data || []) as RegulatoryChange[];
  }

  static async getRegulatoryChangeById(id: string): Promise<RegulatoryChange | null> {
    const { data, error } = await supabase
      .from('regulatory_changes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching regulatory change:', error);
      return null;
    }

    return data as RegulatoryChange;
  }

  static async createRegulatoryChange(changeData: RegulatoryChangeFormData): Promise<RegulatoryChange> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('regulatory_changes')
      .insert([{
        ...changeData,
        created_by: user.id
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating regulatory change:', error);
      throw error;
    }

    return data as RegulatoryChange;
  }

  static async updateRegulatoryChange(id: string, changeData: Partial<RegulatoryChangeFormData>): Promise<RegulatoryChange> {
    try {
      // Check authentication
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      console.log('Update regulatory change - User check:', { user, userError });

      if (!user) throw new Error('User not authenticated');

      console.log('User authenticated for regulatory change update:', user.id);
      console.log('Updating regulatory change ID:', id);
      console.log('Update data:', changeData);

      // Check if user is admin by querying the users table
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        throw new Error('Unable to verify user permissions');
      }

      const isAdmin = userProfile?.role === 'admin' || userProfile?.role === 'super_admin';
      console.log('User role check:', { role: userProfile?.role, isAdmin });

      // Verify the regulatory change exists
      const { data: existingChange, error: fetchError } = await supabase
        .from('regulatory_changes')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) {
        console.error('Error fetching existing regulatory change:', fetchError);
        throw new Error(`Regulatory change not found or access denied: ${fetchError.message}`);
      }

      if (!existingChange) {
        throw new Error('Regulatory change not found');
      }

      console.log('Existing regulatory change found:', existingChange);

      // Check permissions: admin can update any regulatory change, regular users can only update their own
      if (!isAdmin && existingChange.created_by && existingChange.created_by !== user.id) {
        console.error('User does not own this regulatory change:', {
          changeOwner: existingChange.created_by,
          currentUser: user.id,
          userRole: userProfile?.role
        });
        throw new Error('You do not have permission to update this regulatory change');
      }

      // Prepare update data
      const updateData = {
        ...changeData,
        created_by: undefined,
        created_at: undefined,
        updated_at: undefined
      };

      console.log('Final update data:', JSON.stringify(updateData, null, 2));

      // Perform the update
      const { data, error } = await supabase
        .from('regulatory_changes')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Supabase update error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw new Error(`Failed to update regulatory change: ${error.message}`);
      }

      console.log('Regulatory change updated successfully:', data);
      return data as RegulatoryChange;
    } catch (error) {
      console.error('Error in updateRegulatoryChange:', error);
      throw error;
    }
  }

  static async deleteRegulatoryChange(id: string): Promise<void> {
    const { error } = await supabase
      .from('regulatory_changes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting regulatory change:', error);
      throw error;
    }
  }

  // ==================== COMPLIANCE MAPPING ====================

  static async getComplianceMappings(): Promise<ComplianceMapping[]> {
    const { data, error } = await supabase
      .from('compliance_mapping')
      .select(`
        *,
        regulatory_changes(title, regulatory_body, regulation_name),
        compliance_frameworks(name, code),
        compliance_requirements(title)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching compliance mappings:', error);
      throw error;
    }

    return (data || []) as ComplianceMapping[];
  }

  static async getComplianceMappingById(id: string): Promise<ComplianceMapping | null> {
    const { data, error } = await supabase
      .from('compliance_mapping')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching compliance mapping:', error);
      return null;
    }

    return data as ComplianceMapping;
  }

  static async createComplianceMapping(mappingData: Omit<ComplianceMapping, 'id' | 'created_at' | 'updated_at'>): Promise<ComplianceMapping> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('compliance_mapping')
      .insert([{
        ...mappingData,
        created_by: user.id
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating compliance mapping:', error);
      throw error;
    }

    return data as ComplianceMapping;
  }

  static async updateComplianceMapping(id: string, mappingData: Partial<ComplianceMapping>): Promise<ComplianceMapping> {
    try {
      // Check authentication
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      console.log('Update compliance mapping - User check:', { user, userError });

      if (!user) throw new Error('User not authenticated');

      console.log('User authenticated for compliance mapping update:', user.id);
      console.log('Updating compliance mapping ID:', id);
      console.log('Update data:', mappingData);

      // Check if user is admin by querying the users table
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        throw new Error('Unable to verify user permissions');
      }

      const isAdmin = userProfile?.role === 'admin' || userProfile?.role === 'super_admin';
      console.log('User role check:', { role: userProfile?.role, isAdmin });

      // Verify the compliance mapping exists
      const { data: existingMapping, error: fetchError } = await supabase
        .from('compliance_mapping')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) {
        console.error('Error fetching existing compliance mapping:', fetchError);
        throw new Error(`Compliance mapping not found or access denied: ${fetchError.message}`);
      }

      if (!existingMapping) {
        throw new Error('Compliance mapping not found');
      }

      console.log('Existing compliance mapping found:', existingMapping);

      // Check permissions: admin can update any compliance mapping, regular users can only update their own
      if (!isAdmin && existingMapping.created_by && existingMapping.created_by !== user.id) {
        console.error('User does not own this compliance mapping:', {
          mappingOwner: existingMapping.created_by,
          currentUser: user.id,
          userRole: userProfile?.role
        });
        throw new Error('You do not have permission to update this compliance mapping');
      }

      // Prepare update data
      const updateData = {
        ...mappingData,
        created_by: undefined,
        created_at: undefined,
        updated_at: undefined
      };

      console.log('Final update data:', JSON.stringify(updateData, null, 2));

      // Perform the update
      const { data, error } = await supabase
        .from('compliance_mapping')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Supabase update error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw new Error(`Failed to update compliance mapping: ${error.message}`);
      }

      console.log('Compliance mapping updated successfully:', data);
      return data as ComplianceMapping;
    } catch (error) {
      console.error('Error in updateComplianceMapping:', error);
      throw error;
    }
  }

  static async deleteComplianceMapping(id: string): Promise<void> {
    const { error } = await supabase
      .from('compliance_mapping')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting compliance mapping:', error);
      throw error;
    }
  }

  // ==================== COMPLIANCE ANALYTICS ====================

  static async getComplianceAnalytics() {
    try {
      const [regulatoryChanges, complianceMappings, frameworks] = await Promise.all([
        supabase.from('regulatory_changes').select('id, status, risk_rating, priority'),
        supabase.from('compliance_mapping').select('id, status, mapping_type'),
        supabase.from('compliance_frameworks').select('id, name')
      ]);

      const totalRegulations = regulatoryChanges.data?.length || 0;
      const criticalRegulations = regulatoryChanges.data?.filter(r => r.priority === 'critical' || r.risk_rating === 'critical').length || 0;
      const completedMappings = complianceMappings.data?.filter(m => m.status === 'implemented').length || 0;
      const totalMappings = complianceMappings.data?.length || 0;
      const gapMappings = complianceMappings.data?.filter(m => m.status === 'gap_identified').length || 0;

      return {
        totalRegulations,
        criticalRegulations,
        completedMappings,
        totalMappings,
        gapMappings,
        frameworksCount: frameworks.data?.length || 0,
        complianceScore: totalMappings > 0 ? (completedMappings / totalMappings) * 100 : 0
      };
    } catch (error) {
      console.error('Error fetching compliance analytics:', error);
      throw error;
    }
  }

  // ==================== RISK APPETITE FRAMEWORK ====================

  static async getRiskAppetiteFrameworks(): Promise<RiskAppetiteFramework[]> {
    const { data, error } = await supabase
      .from('risk_appetite_framework')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching risk appetite frameworks:', error);
      throw error;
    }

    return (data || []) as RiskAppetiteFramework[];
  }

  static async getRiskAppetiteFrameworkById(id: string): Promise<RiskAppetiteFramework | null> {
    const { data, error } = await supabase
      .from('risk_appetite_framework')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching risk appetite framework:', error);
      return null;
    }

    return data as RiskAppetiteFramework;
  }

  static async createRiskAppetiteFramework(frameworkData: RiskAppetiteFormData): Promise<RiskAppetiteFramework> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('risk_appetite_framework')
      .insert([{
        ...frameworkData,
        risk_categories: { categories: frameworkData.risk_categories },
        appetite_levels: { levels: frameworkData.appetite_levels },
        tolerance_thresholds: { thresholds: frameworkData.tolerance_thresholds },
        created_by: user.id
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating risk appetite framework:', error);
      throw error;
    }

    return data as RiskAppetiteFramework;
  }

  static async updateRiskAppetiteFramework(id: string, frameworkData: Partial<RiskAppetiteFormData>): Promise<RiskAppetiteFramework> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const updateData: any = { ...frameworkData };

    if (frameworkData.risk_categories) {
      updateData.risk_categories = { categories: frameworkData.risk_categories };
    }
    if (frameworkData.appetite_levels) {
      updateData.appetite_levels = { levels: frameworkData.appetite_levels };
    }
    if (frameworkData.tolerance_thresholds) {
      updateData.tolerance_thresholds = { thresholds: frameworkData.tolerance_thresholds };
    }

    const { data, error } = await supabase
      .from('risk_appetite_framework')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating risk appetite framework:', error);
      throw error;
    }

    return data as RiskAppetiteFramework;
  }

  static async deleteRiskAppetiteFramework(id: string): Promise<void> {
    const { error } = await supabase
      .from('risk_appetite_framework')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting risk appetite framework:', error);
      throw error;
    }
  }

  // ==================== RISK MEASUREMENTS ====================

  static async getRiskMeasurements(frameworkId?: string): Promise<RiskMeasurement[]> {
    let query = supabase
      .from('risk_measurements')
      .select('*')
      .order('last_updated', { ascending: false });

    if (frameworkId) {
      query = query.eq('framework_id', frameworkId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching risk measurements:', error);
      throw error;
    }

    return (data || []) as RiskMeasurement[];
  }

  static async createRiskMeasurement(measurementData: Omit<RiskMeasurement, 'id' | 'created_at' | 'updated_at'>): Promise<RiskMeasurement> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('risk_measurements')
      .insert([{
        ...measurementData,
        created_by: user.id
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating risk measurement:', error);
      throw error;
    }

    return data as RiskMeasurement;
  }

  static async updateRiskMeasurement(id: string, measurementData: Partial<RiskMeasurement>): Promise<RiskMeasurement> {
    const { data, error } = await supabase
      .from('risk_measurements')
      .update(measurementData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating risk measurement:', error);
      throw error;
    }

    return data as RiskMeasurement;
  }

  // ==================== RISK SCENARIOS ====================

  static async getRiskScenarios(frameworkId?: string): Promise<RiskScenario[]> {
    let query = supabase
      .from('risk_scenarios')
      .select('*')
      .order('created_at', { ascending: false });

    if (frameworkId) {
      query = query.eq('framework_id', frameworkId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching risk scenarios:', error);
      throw error;
    }

    return (data || []) as RiskScenario[];
  }

  static async createRiskScenario(scenarioData: Omit<RiskScenario, 'id' | 'created_at' | 'updated_at'>): Promise<RiskScenario> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('risk_scenarios')
      .insert([{
        ...scenarioData,
        created_by: user.id
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating risk scenario:', error);
      throw error;
    }

    return data as RiskScenario;
  }

  static async updateRiskScenario(id: string, scenarioData: Partial<RiskScenario>): Promise<RiskScenario> {
    const { data, error } = await supabase
      .from('risk_scenarios')
      .update(scenarioData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating risk scenario:', error);
      throw error;
    }

    return data as RiskScenario;
  }

  static async deleteRiskScenario(id: string): Promise<void> {
    const { error } = await supabase
      .from('risk_scenarios')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting risk scenario:', error);
      throw error;
    }
  }

  // ==================== RISK APPETITE ANALYTICS ====================

  static async getRiskAppetiteAnalytics(frameworkId?: string) {
    try {
      const [frameworks, measurements, scenarios] = await Promise.all([
        frameworkId ? this.getRiskAppetiteFrameworkById(frameworkId) : this.getRiskAppetiteFrameworks(),
        this.getRiskMeasurements(frameworkId),
        this.getRiskScenarios(frameworkId)
      ]);

      const frameworksList = Array.isArray(frameworks) ? frameworks : [frameworks].filter(Boolean);

      const totalCategories = measurements.length;
      const categoriesWithinAppetite = measurements.filter(m => m.status === 'within_appetite').length;
      const categoriesApproachingLimit = measurements.filter(m => m.status === 'approaching_limit').length;
      const categoriesBreached = measurements.filter(m => m.status === 'breached').length;

      let overallAppetiteStatus: 'healthy' | 'warning' | 'critical' = 'healthy';
      if (categoriesBreached > 0) overallAppetiteStatus = 'critical';
      else if (categoriesApproachingLimit > 0) overallAppetiteStatus = 'warning';

      const averageThresholdUtilization = measurements.length > 0
        ? measurements.reduce((sum, m) => {
            const utilization = (m.current_value - m.threshold_min) / (m.threshold_max - m.threshold_min);
            return sum + Math.max(0, Math.min(100, utilization * 100));
          }, 0) / measurements.length
        : 0;

      return {
        totalFrameworks: frameworksList.length,
        totalCategories,
        categoriesWithinAppetite,
        categoriesApproachingLimit,
        categoriesBreached,
        overallAppetiteStatus,
        averageThresholdUtilization,
        totalScenarios: scenarios.length,
        mitigatedScenarios: scenarios.filter(s => s.status === 'mitigated').length,
        upcomingReviews: frameworksList.filter(f => f && f.next_review_date && new Date(f.next_review_date) > new Date()).length
      };
    } catch (error) {
      console.error('Error fetching risk appetite analytics:', error);
      throw error;
    }
  }
}