import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Users, CheckCircle, Clock, AlertTriangle, Target, TrendingUp, Calendar, FileText, Award, BarChart3, Settings, Plus, Edit, Trash2, Eye, Download, Upload, Filter, RefreshCw } from 'lucide-react';

type Framework = { id: string; code: string; name: string };
type Profile = { id: string; name: string; framework_id: string };
type User = { id: string; first_name?: string | null; last_name?: string | null; email?: string | null };
type GovernancePolicy = { id: string; title: string; category: string; status: string };
type GovernanceKPI = { id: string; name: string; category: string; target_value: number; current_value: number };

type TrainingModule = {
  id: string;
  title: string;
  description?: string | null;
  framework_id?: string | null;
  url?: string | null;
  estimated_minutes?: number | null;
  is_active?: boolean | null;
  created_at?: string;
  governance_category?: string;
  compliance_framework?: string;
  skill_level?: 'beginner' | 'intermediate' | 'advanced';
  prerequisites?: string[];
  learning_objectives?: string[];
  policy_id?: string;
  mandatory_for_roles?: string[];
  expiry_days?: number;
  passing_score?: number;
  max_attempts?: number;
};

type TrainingAssignment = {
  id: string;
  module_id: string;
  assigned_to: string;
  profile_id?: string | null;
  due_date?: string | null;
  status: 'assigned' | 'in_progress' | 'completed' | 'overdue' | 'cancelled' | 'failed';
  completed_at?: string | null;
  created_at?: string;
  score?: number;
  attempts?: number;
  last_attempt_at?: string;
  assigned_by?: string;
  assignment_reason?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
};

type TrainingAnalytics = {
  totalModules: number;
  activeModules: number;
  totalAssignments: number;
  completedAssignments: number;
  overdueAssignments: number;
  completionRate: number;
  averageScore: number;
  topPerformers: Array<{ user: string; completed: number; avgScore: number }>;
};

export default function GovernanceTraining() {
   // Filters and lookups
   const [frameworks, setFrameworks] = useState<Framework[]>([]);
   const [frameworkId, setFrameworkId] = useState<string>('');
   const [profiles, setProfiles] = useState<Profile[]>([]);
   const [profileId, setProfileId] = useState<string>('');

   const [users, setUsers] = useState<User[]>([]);
   const [governancePolicies, setGovernancePolicies] = useState<GovernancePolicy[]>([]);
   const [governanceKPIs, setGovernanceKPIs] = useState<GovernanceKPI[]>([]);

   // Modules CRUD
   const [modules, setModules] = useState<TrainingModule[]>([]);
   const [loadingModules, setLoadingModules] = useState(false);
   const [newModule, setNewModule] = useState<Partial<TrainingModule>>({
     title: '',
     description: '',
     url: '',
     estimated_minutes: 60,
     is_active: true,
     skill_level: 'intermediate',
     governance_category: '',
     compliance_framework: '',
     prerequisites: [],
     learning_objectives: [],
     mandatory_for_roles: [],
     expiry_days: 365,
     passing_score: 80,
     max_attempts: 3,
   });
   const [savingModule, setSavingModule] = useState(false);
   const [editingModule, setEditingModule] = useState<TrainingModule | null>(null);

   // Assignments
   const [assignments, setAssignments] = useState<TrainingAssignment[]>([]);
   const [loadingAssignments, setLoadingAssignments] = useState(false);

   // New assignment form
   const [selectedModuleId, setSelectedModuleId] = useState<string>('');
   const [assigneeId, setAssigneeId] = useState<string>('');
   const [dueDate, setDueDate] = useState<string>('');
   const [assignmentReason, setAssignmentReason] = useState<string>('');
   const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
   const [assigning, setAssigning] = useState(false);

   // Analytics
   const [analytics, setAnalytics] = useState<TrainingAnalytics | null>(null);
   const [loadingAnalytics, setLoadingAnalytics] = useState(false);

   // UI State
   const [activeTab, setActiveTab] = useState<'modules' | 'assignments' | 'analytics' | 'policies'>('modules');
   const [showCreateModule, setShowCreateModule] = useState(false);
   const [showAssignDialog, setShowAssignDialog] = useState(false);
   const [filterStatus, setFilterStatus] = useState<string>('all');
   const [filterCategory, setFilterCategory] = useState<string>('all');

  // Load frameworks
  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.from('compliance_frameworks').select('id,code,name').order('name');
      const list = (data ?? []) as Framework[];
      setFrameworks(list);
      if (!frameworkId && list.length > 0) setFrameworkId(list[0].id);
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load profiles for framework
  useEffect(() => {
    const run = async () => {
      if (!frameworkId) { setProfiles([]); setProfileId(''); return; }
      const { data } = await supabase
        .from('compliance_profiles')
        .select('id,name,framework_id')
        .eq('framework_id', frameworkId)
        .order('name');
      const list = (data ?? []) as Profile[];
      setProfiles(list);
      if (list.length > 0) setProfileId(list[0].id); else setProfileId('');
    };
    run();
  }, [frameworkId]);

  // Load users for assignment
  useEffect(() => {
    const loadUsers = async () => {
      const { data } = await supabase.from('users').select('id,first_name,last_name,email').eq('is_active', true).order('first_name');
      setUsers((data ?? []) as User[]);
    };
    loadUsers();
  }, []);

  // Load governance policies for integration
  useEffect(() => {
    const loadGovernancePolicies = async () => {
      const { data } = await supabase.from('governance_policies').select('id,title,category,status').eq('status', 'approved').order('title');
      setGovernancePolicies((data ?? []) as GovernancePolicy[]);
    };
    loadGovernancePolicies();
  }, []);

  // Load governance KPIs for metrics tracking
  useEffect(() => {
    const loadGovernanceKPIs = async () => {
      const { data } = await supabase.from('governance_kpis').select('id,name,category,target_value,current_value').eq('status', 'active').order('name');
      setGovernanceKPIs((data ?? []) as GovernanceKPI[]);
    };
    loadGovernanceKPIs();
  }, []);

  // Load training analytics
  const loadAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      // Get comprehensive training analytics
      const [modulesResult, assignmentsResult, usersResult] = await Promise.all([
        supabase.from('training_modules').select('id, is_active'),
        supabase.from('training_assignments').select('status, score, assigned_to, due_date'),
        supabase.from('users').select('id, first_name, last_name')
      ]);

      const totalModules = modulesResult.data?.length || 0;
      const activeModules = modulesResult.data?.filter(m => m.is_active).length || 0;
      const totalAssignments = assignmentsResult.data?.length || 0;
      const completedAssignments = assignmentsResult.data?.filter(a => a.status === 'completed').length || 0;
      const overdueAssignments = assignmentsResult.data?.filter(a =>
        a.status !== 'completed' && a.status !== 'cancelled' &&
        new Date(a.due_date || '') < new Date()
      ).length || 0;

      const completionRate = totalAssignments > 0 ? (completedAssignments / totalAssignments) * 100 : 0;
      const scores = assignmentsResult.data?.filter(a => a.score).map(a => a.score) || [];
      const averageScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

      // Calculate top performers
      const userStats = new Map();
      assignmentsResult.data?.forEach(assignment => {
        if (!userStats.has(assignment.assigned_to)) {
          userStats.set(assignment.assigned_to, { completed: 0, totalScore: 0, count: 0 });
        }
        const stats = userStats.get(assignment.assigned_to);
        if (assignment.status === 'completed') {
          stats.completed++;
          if (assignment.score) {
            stats.totalScore += assignment.score;
            stats.count++;
          }
        }
      });

      const topPerformers = Array.from(userStats.entries())
        .map(([userId, stats]) => ({
          user: usersResult.data?.find(u => u.id === userId)?.first_name + ' ' +
                usersResult.data?.find(u => u.id === userId)?.last_name || userId,
          completed: stats.completed,
          avgScore: stats.count > 0 ? stats.totalScore / stats.count : 0
        }))
        .sort((a, b) => b.completed - a.completed)
        .slice(0, 5);

      setAnalytics({
        totalModules,
        activeModules,
        totalAssignments,
        completedAssignments,
        overdueAssignments,
        completionRate,
        averageScore,
        topPerformers
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const loadModules = async () => {
    setLoadingModules(true);
    let q = supabase
      .from('training_modules')
      .select('*')
      .order('created_at', { ascending: false });
    if (frameworkId) q = q.eq('framework_id', frameworkId);
    const { data } = await q;
    setModules((data ?? []) as TrainingModule[]);
    setLoadingModules(false);
  };

  const loadAssignments = async () => {
    setLoadingAssignments(true);
    let q = supabase
      .from('training_assignments')
      .select('*')
      .order('created_at', { ascending: false });
    if (frameworkId) q = q.eq('framework_id', frameworkId as any); // if column exists in view; otherwise filter via module join on client
    if (profileId) q = q.eq('profile_id', profileId);
    const { data } = await q;
    setAssignments((data ?? []) as TrainingAssignment[]);
    setLoadingAssignments(false);
  };

  useEffect(() => {
    loadModules();
    loadAssignments();
    loadAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frameworkId, profileId]);

  const createModule = async () => {
    if (!newModule.title) return;
    setSavingModule(true);
    const { data, error } = await supabase
      .from('training_modules')
      .insert({
        title: newModule.title,
        description: newModule.description ?? '',
        url: newModule.url ?? '',
        estimated_minutes: newModule.estimated_minutes ?? 60,
        is_active: newModule.is_active ?? true,
        framework_id: frameworkId || null,
        governance_category: newModule.governance_category || null,
        compliance_framework: newModule.compliance_framework || null,
        skill_level: newModule.skill_level || 'intermediate',
        prerequisites: newModule.prerequisites || [],
        learning_objectives: newModule.learning_objectives || [],
        policy_id: newModule.policy_id || null,
        mandatory_for_roles: newModule.mandatory_for_roles || [],
        expiry_days: newModule.expiry_days || 365,
        passing_score: newModule.passing_score || 80,
        max_attempts: newModule.max_attempts || 3,
      })
      .select()
      .single();
    setSavingModule(false);
    if (error) {
      alert(error.message); return;
    }
    setNewModule({
      title: '',
      description: '',
      url: '',
      estimated_minutes: 60,
      is_active: true,
      skill_level: 'intermediate',
      governance_category: '',
      compliance_framework: '',
      prerequisites: [],
      learning_objectives: [],
      mandatory_for_roles: [],
      expiry_days: 365,
      passing_score: 80,
      max_attempts: 3,
    });
    setModules(prev => [data as TrainingModule, ...prev]);
    setShowCreateModule(false);
  };

  const updateModule = async () => {
    if (!editingModule || !editingModule.title) return;
    setSavingModule(true);
    const { data, error } = await supabase
      .from('training_modules')
      .update({
        title: editingModule.title,
        description: editingModule.description,
        url: editingModule.url,
        estimated_minutes: editingModule.estimated_minutes,
        is_active: editingModule.is_active,
        governance_category: editingModule.governance_category,
        compliance_framework: editingModule.compliance_framework,
        skill_level: editingModule.skill_level,
        prerequisites: editingModule.prerequisites,
        learning_objectives: editingModule.learning_objectives,
        policy_id: editingModule.policy_id,
        mandatory_for_roles: editingModule.mandatory_for_roles,
        expiry_days: editingModule.expiry_days,
        passing_score: editingModule.passing_score,
        max_attempts: editingModule.max_attempts,
      })
      .eq('id', editingModule.id)
      .select()
      .single();
    setSavingModule(false);
    if (error) {
      alert(error.message); return;
    }
    setModules(prev => prev.map(m => m.id === editingModule.id ? (data as TrainingModule) : m));
    setEditingModule(null);
  };

  const assignModule = async () => {
    if (!selectedModuleId || !assigneeId) return;
    setAssigning(true);
    const { data, error } = await supabase
      .from('training_assignments')
      .insert({
        module_id: selectedModuleId,
        assigned_to: assigneeId,
        profile_id: profileId || null,
        due_date: dueDate || null,
        status: 'assigned',
        assignment_reason: assignmentReason || null,
        priority: priority,
        assigned_by: 'current_user', // This should be the current user's ID
        attempts: 0,
      })
      .select()
      .single();
    setAssigning(false);
    if (error) { alert(error.message); return; }
    setAssignments(prev => [data as TrainingAssignment, ...prev]);
    setAssigneeId('');
    setSelectedModuleId('');
    setDueDate('');
    setAssignmentReason('');
    setPriority('medium');
    setShowAssignDialog(false);
  };

  const updateAssignmentStatus = async (id: string, status: TrainingAssignment['status']) => {
    const { data, error } = await supabase
      .from('training_assignments')
      .update({ status, completed_at: status === 'completed' ? new Date().toISOString() : null })
      .eq('id', id)
      .select()
      .single();
    if (error) { alert(error.message); return; }
    setAssignments(prev => prev.map(a => a.id === id ? (data as TrainingAssignment) : a));
  };

  const modulesForFramework = useMemo(
    () => (frameworkId ? modules.filter(m => !m.framework_id || m.framework_id === frameworkId) : modules),
    [modules, frameworkId]
  );

  const filteredModules = useMemo(() => {
    return modules.filter(module => {
      if (filterCategory !== 'all' && module.governance_category !== filterCategory) return false;
      return true;
    });
  }, [modules, filterCategory]);

  const filteredAssignments = useMemo(() => {
    return assignments.filter(assignment => {
      if (filterStatus !== 'all' && assignment.status !== filterStatus) return false;
      return true;
    });
  }, [assignments, filterStatus]);

  return (
    <motion.div
      className="p-6 space-y-6 bg-gray-50 min-h-screen"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-blue-600" />
            GRC Training Management
          </h1>
          <p className="text-gray-600 mt-1">Comprehensive governance, risk, and compliance training platform</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => { loadModules(); loadAssignments(); loadAnalytics(); }}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh All
          </Button>
          <Button onClick={() => setShowCreateModule(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Create Module
          </Button>
        </div>
      </div>

      {/* Analytics Overview */}
      {analytics && (
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Modules</p>
                <p className="text-2xl font-bold text-blue-600">{analytics.totalModules}</p>
                <p className="text-xs text-green-600">{analytics.activeModules} active</p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold text-green-600">{analytics.completionRate.toFixed(1)}%</p>
                <p className="text-xs text-gray-600">{analytics.completedAssignments}/{analytics.totalAssignments}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Score</p>
                <p className="text-2xl font-bold text-purple-600">{analytics.averageScore.toFixed(1)}%</p>
                <p className="text-xs text-gray-600">passing threshold</p>
              </div>
              <Target className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{analytics.overdueAssignments}</p>
                <p className="text-xs text-red-600">needs attention</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </motion.div>
      )}

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex">
            {[
              { id: 'modules', label: 'Training Modules', icon: BookOpen },
              { id: 'assignments', label: 'Assignments', icon: Users },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
              { id: 'policies', label: 'Policy Integration', icon: FileText }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Modules Tab */}
          {activeTab === 'modules' && (
            <div className="space-y-6">
              {/* Filters */}
              <div className="flex flex-wrap gap-4 items-center justify-between">
                <div className="flex gap-4">
                  <select
                    className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                    value={frameworkId}
                    onChange={(e) => setFrameworkId(e.target.value)}
                  >
                    <option value="">All Frameworks</option>
                    {frameworks.map(f => <option key={f.id} value={f.id}>{f.name} ({f.code})</option>)}
                  </select>
                  <select
                    className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                  >
                    <option value="all">All Categories</option>
                    <option value="governance">Governance</option>
                    <option value="risk">Risk Management</option>
                    <option value="compliance">Compliance</option>
                    <option value="security">Security</option>
                    <option value="ethics">Ethics</option>
                  </select>
                </div>
              </div>

              {/* Modules Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredModules.map((module) => (
                  <motion.div
                    key={module.id}
                    className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2">{module.title}</h3>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{module.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingModule(module)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>{module.estimated_minutes} minutes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-gray-400" />
                        <span className="capitalize">{module.skill_level}</span>
                      </div>
                      {module.governance_category && (
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-400" />
                          <span className="capitalize">{module.governance_category}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <CheckCircle className={`w-4 h-4 ${module.is_active ? 'text-green-500' : 'text-red-500'}`} />
                        <span>{module.is_active ? 'Active' : 'Inactive'}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedModuleId(module.id)}
                        className="w-full"
                      >
                        Assign to Users
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Assignments Tab */}
          {activeTab === 'assignments' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Training Assignments</h3>
                <Button onClick={() => setShowAssignDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Assignment
                </Button>
              </div>

              <div className="flex gap-4 mb-4">
                <select
                  className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="assigned">Assigned</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="overdue">Overdue</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="space-y-3">
                {filteredAssignments.map((assignment) => {
                  const module = modules.find(m => m.id === assignment.module_id);
                  const user = users.find(u => u.id === assignment.assigned_to);

                  return (
                    <div key={assignment.id} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-medium text-gray-900">{module?.title || 'Unknown Module'}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              assignment.status === 'completed' ? 'bg-green-100 text-green-800' :
                              assignment.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                              assignment.status === 'overdue' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {assignment.status.replace('_', ' ')}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              assignment.priority === 'high' ? 'bg-red-100 text-red-800' :
                              assignment.priority === 'critical' ? 'bg-red-200 text-red-900' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {assignment.priority}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            Assigned to: {user?.first_name} {user?.last_name} ({user?.email})
                          </p>
                          {assignment.due_date && (
                            <p className="text-sm text-gray-600">
                              Due: {new Date(assignment.due_date).toLocaleDateString()}
                            </p>
                          )}
                          {assignment.score && (
                            <p className="text-sm text-gray-600">
                              Score: {assignment.score}% (Attempts: {assignment.attempts || 0})
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateAssignmentStatus(assignment.id,
                              assignment.status === 'completed' ? 'assigned' : 'completed'
                            )}
                          >
                            {assignment.status === 'completed' ? 'Mark Incomplete' : 'Mark Complete'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateAssignmentStatus(assignment.id, 'cancelled')}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && analytics && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Training Analytics</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-4">Top Performers</h4>
                  <div className="space-y-3">
                    {analytics.topPerformers.slice(0, 5).map((performer, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{performer.user}</p>
                          <p className="text-sm text-gray-600">{performer.completed} modules completed</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-blue-600">{performer.avgScore.toFixed(1)}%</p>
                          <p className="text-xs text-gray-600">avg score</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-4">Performance Metrics</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Completion Rate</span>
                      <span className="font-medium text-blue-600">{analytics.completionRate.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Average Score</span>
                      <span className="font-medium text-purple-600">{analytics.averageScore.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Overdue Assignments</span>
                      <span className="font-medium text-red-600">{analytics.overdueAssignments}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Active Modules</span>
                      <span className="font-medium text-green-600">{analytics.activeModules}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Policy Integration Tab */}
          {activeTab === 'policies' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Governance Policy Integration</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-4">Linked Policies</h4>
                  <div className="space-y-3">
                    {governancePolicies.map((policy) => (
                      <div key={policy.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{policy.title}</p>
                          <p className="text-sm text-gray-600 capitalize">{policy.category}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          policy.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {policy.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-4">Governance KPIs</h4>
                  <div className="space-y-3">
                    {governanceKPIs.map((kpi) => (
                      <div key={kpi.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{kpi.name}</p>
                          <p className="text-sm text-gray-600 capitalize">{kpi.category}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-blue-600">{kpi.current_value}/{kpi.target_value}</p>
                          <p className="text-xs text-gray-600">current/target</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Module Modal */}
      <AnimatePresence>
        {showCreateModule && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Create Training Module</h2>
                <Button variant="outline" size="sm" onClick={() => setShowCreateModule(false)}>
                  ×
                </Button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={newModule.title || ''}
                      onChange={(e) => setNewModule({ ...newModule, title: e.target.value })}
                      placeholder="Module title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">URL</label>
                    <input
                      type="url"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={newModule.url || ''}
                      onChange={(e) => setNewModule({ ...newModule, url: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    value={newModule.description || ''}
                    onChange={(e) => setNewModule({ ...newModule, description: e.target.value })}
                    placeholder="Module description"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={newModule.estimated_minutes || 60}
                      onChange={(e) => setNewModule({ ...newModule, estimated_minutes: parseInt(e.target.value) || 60 })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Skill Level</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={newModule.skill_level || 'intermediate'}
                      onChange={(e) => setNewModule({ ...newModule, skill_level: e.target.value as any })}
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={newModule.governance_category || ''}
                      onChange={(e) => setNewModule({ ...newModule, governance_category: e.target.value })}
                    >
                      <option value="">Select category</option>
                      <option value="governance">Governance</option>
                      <option value="risk">Risk Management</option>
                      <option value="compliance">Compliance</option>
                      <option value="security">Security</option>
                      <option value="ethics">Ethics</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={newModule.is_active ?? true}
                    onChange={(e) => setNewModule({ ...newModule, is_active: e.target.checked })}
                  />
                  <label htmlFor="is_active" className="text-sm text-gray-700">Active</label>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => setShowCreateModule(false)}>
                    Cancel
                  </Button>
                  <Button onClick={editingModule ? updateModule : createModule} disabled={savingModule}>
                    {savingModule ? 'Saving...' : (editingModule ? 'Update Module' : 'Create Module')}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Assign Dialog */}
      <AnimatePresence>
        {showAssignDialog && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-lg p-6 w-full max-w-lg"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Assign Training Module</h2>
                <Button variant="outline" size="sm" onClick={() => setShowAssignDialog(false)}>
                  ×
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Training Module</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={selectedModuleId}
                    onChange={(e) => setSelectedModuleId(e.target.value)}
                  >
                    <option value="">Select module</option>
                    {modules.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Assign to User</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={assigneeId}
                    onChange={(e) => setAssigneeId(e.target.value)}
                  >
                    <option value="">Select user</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.first_name} {u.last_name} ({u.email})</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Assignment Reason</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    value={assignmentReason}
                    onChange={(e) => setAssignmentReason(e.target.value)}
                    placeholder="Reason for assignment"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => setShowAssignDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={assignModule} disabled={assigning}>
                    {assigning ? 'Assigning...' : 'Assign Module'}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}