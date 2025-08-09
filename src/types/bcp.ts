export interface BusinessContinuityPlan {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'active' | 'inactive';
  owner: string;
  version: string;
  created_at: string;
  updated_at: string;
  critical_functions: CriticalFunction[];
  emergency_contacts: EmergencyContact[];
  recovery_time_objectives: RecoveryTimeObjective[];
  // Optional world-class BCM enrichments
  communication_templates?: CommunicationTemplate[];
  exercise_schedule?: ExerciseSchedule[];
  alternate_sites?: AlternateSite[];
  data_backups?: DataBackup[];
  plan_tests?: PlanTestResult[];
  last_exercise_at?: string | null;
}

export interface CriticalFunction {
  id: string;
  name: string;
  description: string;
  dependencies: string[];
  recovery_time: string;
  recovery_priority: 'high' | 'medium' | 'low';
}

export interface EmergencyContact {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
}

export interface RecoveryTimeObjective {
  id: string;
  function_id: string;
  rto_hours: number;
  rpo_hours: number;
  recovery_strategy: string;
}

export interface CommunicationTemplate {
  id: string;
  name: string;
  channel: 'email' | 'sms' | 'phone' | 'other';
  audience: string; // e.g., "All employees", "IT Ops"
  message: string;
  last_used_at?: string | null;
}

export interface ExerciseSchedule {
  id: string;
  name: string;
  type: 'tabletop' | 'simulation' | 'full-scale' | 'drill';
  scheduled_at: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  findings?: string;
}

export interface AlternateSite {
  id: string;
  name: string;
  location: string;
  capacity_notes?: string;
  rto_support_hours?: number; // capability at site
}

export interface DataBackup {
  id: string;
  system_name: string;
  frequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
  last_backup_at?: string | null;
  last_restore_test_at?: string | null;
}

export interface PlanTestResult {
  id: string;
  test_type: 'restore' | 'failover' | 'communications' | 'evacuation' | 'other';
  executed_at: string;
  outcome: 'pass' | 'fail' | 'partial';
  notes?: string;
}

export interface BCPPlanItem {
  id: string;
  plan_id: string;
  item_type: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'high' | 'medium' | 'low';
  assigned_to: string;
  due_date: string;
  completed_at: string;
  created_at: string;
  updated_at: string;
}
