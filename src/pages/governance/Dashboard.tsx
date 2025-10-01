import { useEffect, useMemo, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, TrendingUp, TrendingDown, AlertCircle, CheckCircle, Clock, FileText, Users, Target, Calendar, AlertTriangle, BookOpen } from 'lucide-react';

type Framework = { id: string; code: string; name: string };
type Profile = { id: string; name: string; framework_id: string };
type Posture = { status: string; count: number };
type Snapshot = { snapshot_date: string; overall_score: number | null };

export default function GovernanceDashboard() {
    const { t } = useTranslation();
    const [frameworks, setFrameworks] = useState<Framework[]>([]);
    const [frameworkId, setFrameworkId] = useState<string>('');
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [profileId, setProfileId] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const [posture, setPosture] = useState<Posture[]>([]);
    const [snapshots, setSnapshots] = useState<Snapshot[]>([]);

    const [exceptionsCount, setExceptionsCount] = useState<number>(0);
    const [attestationsCount, setAttestationsCount] = useState<number>(0);
    const [tasksCounts, setTasksCounts] = useState<Record<string, number>>({});

    // Governance-specific state
    const [governanceKPIs, setGovernanceKPIs] = useState<any[]>([]);
    const [strategicInitiatives, setStrategicInitiatives] = useState<any[]>([]);
    const [boardMeetings, setBoardMeetings] = useState<any[]>([]);
    const [stakeholderCount, setStakeholderCount] = useState<number>(0);
    const [policyCount, setPolicyCount] = useState<number>(0);
    const [activeStrategies, setActiveStrategies] = useState<number>(0);
    const [regulatoryChanges, setRegulatoryChanges] = useState<any[]>([]);
    const [complianceMapping, setComplianceMapping] = useState<any[]>([]);
    const [trainingAnalytics, setTrainingAnalytics] = useState<any>(null);
    const [riskAppetite, setRiskAppetite] = useState<any>(null);
    const [boardReports, setBoardReports] = useState<any[]>([]);

  useEffect(() => {
    const init = async () => {
      const { data, error } = await supabase.from('compliance_frameworks').select('id,code,name').order('name');
      if (!error) {
        const list = (data ?? []) as Framework[];
        setFrameworks(list);
        if (!frameworkId && list.length > 0) setFrameworkId(list[0].id);
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const run = async () => {
      if (!frameworkId) {
        setProfiles([]); setProfileId('');
        return;
      }
      const { data, error } = await supabase
        .from('compliance_profiles')
        .select('id,name,framework_id')
        .eq('framework_id', frameworkId)
        .order('name');
      if (!error) {
        const list = (data ?? []) as Profile[];
        setProfiles(list);
        if (list.length > 0) setProfileId(list[0].id); else setProfileId('');
      }
    };
    run();
  }, [frameworkId]);

  const load = useCallback(async (showRefreshIndicator = false) => {
    if (!frameworkId) return;

    try {
      if (showRefreshIndicator) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

    // v_requirement_posture summary
    const postureQuery = supabase
      .from('v_requirement_posture')
      .select('status', { count: 'exact', head: false })
      .eq('framework_id', frameworkId);

    const { data: postureRows, error: postureErr } = await supabase
      .from('v_requirement_posture')
      .select('status')
      .eq('framework_id', frameworkId);

    if (!postureErr) {
      const counts: Record<string, number> = {};
      (postureRows ?? []).forEach((r: any) => {
        counts[r.status] = (counts[r.status] || 0) + 1;
      });
      const entries: Posture[] = Object.entries(counts).map(([status, count]) => ({ status, count }));
      setPosture(entries);
    }

    // snapshots trend (limit recent 30)
    const { data: snapRows } = await supabase
      .from('compliance_posture_snapshots')
      .select('snapshot_date,overall_score')
      .eq('framework_id', frameworkId)
      .order('snapshot_date', { ascending: true })
      .limit(30);
    setSnapshots((snapRows ?? []) as Snapshot[]);

    // exceptions count (in_effect or approved)
    const { count: excCount } = await supabase
      .from('compliance_exceptions')
      .select('*', { count: 'exact', head: true })
      .eq('framework_id', frameworkId)
      .in('status', ['approved','in_effect']);
    setExceptionsCount(excCount ?? 0);

    // attestations (in progress/draft this quarter)
    const { count: attCount } = await supabase
      .from('compliance_attestations')
      .select('*', { count: 'exact', head: true })
      .eq('framework_id', frameworkId)
      .in('status', ['draft','in_progress']);
    setAttestationsCount(attCount ?? 0);

    // open tasks by status
    const { data: taskRows } = await supabase
      .from('compliance_tasks')
      .select('status')
      .eq('framework_id', frameworkId)
      .in('status', ['open','in_progress','blocked']);
    const tCounts: Record<string, number> = {};
    (taskRows ?? []).forEach((r: any) => { tCounts[r.status] = (tCounts[r.status] || 0) + 1; });
    setTasksCounts(tCounts);

    // Governance KPIs
    const { data: kpiRows } = await supabase
      .from('governance_kpis')
      .select('*')
      .eq('status', 'active')
      .limit(6);
    setGovernanceKPIs((kpiRows ?? []) as any[]);

    // Strategic Initiatives
    const { data: initiativeRows } = await supabase
      .from('governance_initiatives')
      .select('*')
      .in('status', ['in_progress', 'planned'])
      .limit(5);
    setStrategicInitiatives((initiativeRows ?? []) as any[]);

    // Upcoming Board Meetings
    const { data: meetingRows } = await supabase
      .from('board_meetings')
      .select('*')
      .eq('status', 'scheduled')
      .gte('meeting_date', new Date().toISOString().split('T')[0])
      .order('meeting_date', { ascending: true })
      .limit(3);
    setBoardMeetings((meetingRows ?? []) as any[]);

    // Stakeholder count
    const { count: stakeholderCount } = await supabase
      .from('governance_stakeholders')
      .select('*', { count: 'exact', head: true });
    setStakeholderCount(stakeholderCount ?? 0);

    // Policy count
    const { count: policyCount } = await supabase
      .from('governance_policies')
      .select('*', { count: 'exact', head: true });
    setPolicyCount(policyCount ?? 0);

    // Active strategies count
    const { count: activeStrategiesCount } = await supabase
      .from('governance_strategy')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');
    setActiveStrategies(activeStrategiesCount ?? 0);

    // Regulatory Changes
    const { data: regulatoryData } = await supabase
      .from('regulatory_changes')
      .select('*')
      .in('status', ['identified', 'assessing', 'implementing'])
      .order('created_at', { ascending: false })
      .limit(5);
    setRegulatoryChanges((regulatoryData ?? []) as any[]);

    // Compliance Mapping Summary
    const { data: complianceData } = await supabase
      .from('compliance_mapping')
      .select('status')
      .limit(100);
    setComplianceMapping((complianceData ?? []) as any[]);

    // Training Analytics
    const [trainingModules, trainingAssignments] = await Promise.all([
      supabase.from('training_modules').select('id, is_active'),
      supabase.from('training_assignments').select('status, score')
    ]);

    const totalModules = trainingModules.data?.length || 0;
    const activeModules = trainingModules.data?.filter(m => m.is_active).length || 0;
    const totalAssignments = trainingAssignments.data?.length || 0;
    const completedAssignments = trainingAssignments.data?.filter(a => a.status === 'completed').length || 0;
    const completionRate = totalAssignments > 0 ? (completedAssignments / totalAssignments) * 100 : 0;

    setTrainingAnalytics({
      totalModules,
      activeModules,
      totalAssignments,
      completedAssignments,
      completionRate
    });

    // Risk Appetite Framework
    const { data: riskAppetiteData } = await supabase
      .from('risk_appetite_framework')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(1);
    setRiskAppetite((riskAppetiteData ?? [])[0] || null);

    // Recent Board Reports
    const { data: boardReportsData } = await supabase
      .from('board_reports')
      .select('*')
      .in('status', ['draft', 'reviewed'])
      .order('created_at', { ascending: false })
      .limit(3);
    setBoardReports((boardReportsData ?? []) as any[]);

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading governance data:', error);
      setError('Failed to load governance data. Please try again.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [frameworkId, t]);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frameworkId, profileId]);

  const totalReqs = useMemo(() => posture.reduce((a, b) => a + b.count, 0), [posture]);

  return (
    <motion.div
      className="p-4 space-y-6 bg-gray-50 min-h-screen transition-colors"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Error Banner */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
          >
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <p className="text-sm text-red-600">{error}</p>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-600 hover:text-red-800"
              >
                ×
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("governanceDashboard")}</h1>
          <p className="text-gray-600 mt-1">{t("governanceDashboardDesc", "Monitor compliance posture and governance activities")}</p>
          {lastUpdated && (
            <p className="text-xs text-gray-500 mt-1">
              {t('common.lastUpdated', 'Last updated')}: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
        <Button
          variant="outline"
          onClick={() => load(true)}
          disabled={loading || isRefreshing}
        >
          {(loading || isRefreshing) ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              {t("refreshing", "Refreshing...")}
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              {t("refresh")}
            </>
          )}
        </Button>
      </div>

      {/* Filters */}
      <motion.div
        className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm transition-colors"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="framework-select" className="block text-sm font-medium text-gray-700 mb-2">
              {t("framework")}
            </label>
            <select
              id="framework-select"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              value={frameworkId}
              onChange={(e) => setFrameworkId(e.target.value)}
              disabled={loading}
            >
              {frameworks.map(f => <option key={f.id} value={f.id}>{f.name} ({f.code})</option>)}
              {frameworks.length === 0 && <option value="">{t("noFrameworks")}</option>}
            </select>
          </div>
          <div>
            <label htmlFor="profile-select" className="block text-sm font-medium text-gray-700  mb-2">
              {t("profileOptional")}
            </label>
            <select
              id="profile-select"
              className="w-full px-3 py-2 border border-gray-300  rounded-lg bg-white  text-gray-900  focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              value={profileId}
              onChange={(e) => setProfileId(e.target.value)}
              disabled={loading || profiles.length === 0}
            >
              {profiles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              {profiles.length === 0 && <option value="">{t("noProfiles")}</option>}
            </select>
            <p className="text-xs text-gray-500  mt-1">{t("profileAffectsApplicability")}</p>
          </div>
          <div className="flex items-end">
            {loading && (
              <div className="flex items-center text-sm text-blue-600 ">
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                {t("loading", "Loading...")}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Posture summary */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-6 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {[
          { key: 'compliant', label: t('compliant'), color: 'green', icon: CheckCircle },
          { key: 'partially_compliant', label: t('partiallyCompliant'), color: 'yellow', icon: AlertCircle },
          { key: 'non_compliant', label: t('nonCompliant'), color: 'red', icon: AlertCircle },
          { key: 'not_applicable', label: t('notApplicable'), color: 'gray', icon: FileText },
          { key: 'unknown', label: t('unknown'), color: 'gray', icon: AlertCircle }
        ].map(({ key, label, color, icon: StatusIcon }, index) => {
          const item = posture.find(p => p.status === key);
          const count = item?.count ?? 0;
          const percentage = totalReqs > 0 ? (count / totalReqs * 100).toFixed(1) : '0';

          return (
            <motion.div
              key={key}
              className={`bg-white  border border-gray-200  rounded-lg p-4 hover:shadow-md transition-all duration-200 cursor-pointer`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center justify-between mb-2">
                <StatusIcon className={`w-5 h-5 text-${color}-500`} />
                <span className="text-xs text-gray-500  font-medium">{percentage}%</span>
              </div>
              <div className="text-2xl font-bold text-gray-900  mb-1">{count}</div>
              <div className="text-sm text-gray-600  capitalize">{label}</div>
            </motion.div>
          );
        })}
        <motion.div
          className="bg-gradient-to-br from-blue-50 to-indigo-50 from-blue-900/20 to-indigo-900/20 border border-blue-200 border-blue-800 rounded-lg p-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
        >
          <div className="flex items-center justify-between mb-2">
            <Target className="w-5 h-5 text-blue-600 " />
            <span className="text-xs text-blue-600  font-medium">100%</span>
          </div>
          <div className="text-2xl font-bold text-gray-900  mb-1">{totalReqs}</div>
          <div className="text-sm text-blue-600  font-medium">{t("totalRequirements")}</div>
        </motion.div>
      </motion.div>

      {/* Trend */}
      <motion.div
        className="bg-white  border border-gray-200  rounded-lg p-6 shadow-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900  flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-blue-600 " />
            {t("postureTrend")}
          </h3>
          {snapshots.length > 0 && (
            <div className="text-sm text-gray-500 ">
              {snapshots.length} {t("snapshots", "snapshots")}
            </div>
          )}
        </div>
        <div className="w-full overflow-x-auto">
          {snapshots.length > 0 ? (
            <div className="flex items-end gap-2 h-40 min-w-max">
              {snapshots.map((s, idx) => {
                const score = (s.overall_score ?? 0);
                const height = Math.max(0, Math.min(100, score)) * 1.2;
                return (
                  <motion.div
                    key={idx}
                    className="flex flex-col items-center group"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + idx * 0.05 }}
                  >
                    <motion.div
                      className="bg-gradient-to-t from-blue-600 to-blue-500 from-blue-500 to-blue-400 w-6 rounded-t group-hover:from-blue-700 group-hover:to-blue-600 group-hover:from-blue-600 group-hover:to-blue-500 transition-colors cursor-pointer"
                      style={{ height: `${height}px` }}
                      whileHover={{ scale: 1.1 }}
                      title={`${t("complianceScore")}: ${score}%`}
                    />
                    <div className="text-[10px] mt-2 text-gray-600  font-medium">
                      {new Date(s.snapshot_date).toLocaleDateString()}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-40 text-gray-500 ">
              <div className="text-center">
                <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">{t("noSnapshotData")}</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Enhanced Governance Overview Cards */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Strategies</p>
              <p className="text-2xl font-bold text-blue-600">{activeStrategies}</p>
            </div>
            <Target className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Stakeholders</p>
              <p className="text-2xl font-bold text-green-600">{stakeholderCount}</p>
            </div>
            <Users className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Governance Policies</p>
              <p className="text-2xl font-bold text-purple-600">{policyCount}</p>
            </div>
            <FileText className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Strategic Initiatives</p>
              <p className="text-2xl font-bold text-orange-600">{strategicInitiatives.length}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-orange-600" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Training Completion</p>
              <p className="text-2xl font-bold text-indigo-600">{trainingAnalytics?.completionRate.toFixed(0) || 0}%</p>
            </div>
            <CheckCircle className="w-8 h-8 text-indigo-600" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Regulatory Changes</p>
              <p className="text-2xl font-bold text-red-600">{regulatoryChanges.length}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </motion.div>

      {/* Advanced Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Training Analytics */}
        {trainingAnalytics && (
          <motion.div
            className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
                Training Analytics
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{trainingAnalytics.totalModules}</p>
                <p className="text-sm text-gray-600">Total Modules</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{trainingAnalytics.activeModules}</p>
                <p className="text-sm text-gray-600">Active Modules</p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">{trainingAnalytics.totalAssignments}</p>
                <p className="text-sm text-gray-600">Assignments</p>
              </div>
              <div className="text-center p-3 bg-indigo-50 rounded-lg">
                <p className="text-2xl font-bold text-indigo-600">{trainingAnalytics.completedAssignments}</p>
                <p className="text-sm text-gray-600">Completed</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Regulatory Changes */}
        <motion.div
          className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
              Regulatory Changes
            </h3>
          </div>
          {regulatoryChanges.length > 0 ? (
            <div className="space-y-3">
              {regulatoryChanges.slice(0, 3).map((change, index) => (
                <div key={change.id} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{change.title}</p>
                    <p className="text-sm text-gray-600">{change.regulatory_body} • {change.change_type}</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      change.priority === 'high' ? 'bg-red-100 text-red-800' :
                      change.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {change.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <AlertTriangle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No regulatory changes</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Advanced GRC Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Governance KPIs */}
        <motion.div
          className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Target className="w-5 h-5 mr-2 text-blue-600" />
              Governance KPIs
            </h3>
          </div>
          {governanceKPIs.length > 0 ? (
            <div className="space-y-4">
              {governanceKPIs.slice(0, 4).map((kpi, index) => (
                <div key={kpi.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{kpi.name}</h4>
                    <span className="text-xs text-gray-500 capitalize">{kpi.category}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-xl font-bold text-blue-600">
                      {kpi.current_value ?? kpi.target_value ?? 'N/A'}
                      {kpi.unit && <span className="text-sm text-gray-500 ml-1">{kpi.unit}</span>}
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">Target</div>
                      <div className="text-sm font-medium text-green-600">{kpi.target_value ?? 'N/A'}</div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: kpi.target_value && kpi.current_value
                          ? `${Math.min((kpi.current_value / kpi.target_value) * 100, 100)}%`
                          : '0%'
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No KPIs configured</p>
            </div>
          )}
        </motion.div>

        {/* Risk Appetite Status */}
        <motion.div
          className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-orange-600" />
              Risk Appetite
            </h3>
          </div>
          {riskAppetite ? (
            <div className="space-y-4">
              <div className="p-3 bg-orange-50 rounded-lg">
                <h4 className="font-medium text-gray-900">{riskAppetite.name}</h4>
                <p className="text-sm text-gray-600 mt-1">{riskAppetite.description}</p>
              </div>
              <div className="space-y-2">
                <h5 className="text-sm font-medium text-gray-900">Risk Categories</h5>
                {riskAppetite.risk_categories && Object.keys(riskAppetite.risk_categories.categories || {}).slice(0, 3).map((category, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{category}</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Within Appetite</span>
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Next Review: {riskAppetite.next_review_date ? new Date(riskAppetite.next_review_date).toLocaleDateString() : 'Not scheduled'}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <AlertTriangle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No risk appetite framework</p>
            </div>
          )}
        </motion.div>

        {/* Board Reports Status */}
        <motion.div
          className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-purple-600" />
              Board Reports
            </h3>
          </div>
          {boardReports.length > 0 ? (
            <div className="space-y-3">
              {boardReports.map((report, index) => (
                <div key={report.id} className="p-3 bg-purple-50 rounded-lg">
                  <h4 className="font-medium text-gray-900">{report.title}</h4>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-gray-600">{report.report_type} Report</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      report.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                      report.status === 'reviewed' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {report.status}
                    </span>
                  </div>
                  {report.period_start && report.period_end && (
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(report.period_start).toLocaleDateString()} - {new Date(report.period_end).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No pending board reports</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Strategic Initiatives */}
      {strategicInitiatives.length > 0 && (
        <motion.div
          className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
              Strategic Initiatives
            </h3>
          </div>
          <div className="space-y-3">
            {strategicInitiatives.map((initiative, index) => (
              <div key={initiative.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">{initiative.title}</h4>
                  <p className="text-sm text-gray-600">{initiative.objective}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    initiative.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                    initiative.status === 'planned' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {initiative.status.replace('_', ' ')}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    initiative.priority === 'high' ? 'bg-red-100 text-red-800' :
                    initiative.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {initiative.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Upcoming Board Meetings */}
      {boardMeetings.length > 0 && (
        <motion.div
          className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-purple-600" />
              Upcoming Board Meetings
            </h3>
          </div>
          <div className="space-y-3">
            {boardMeetings.map((meeting, index) => (
              <div key={meeting.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">{meeting.title}</h4>
                  <p className="text-sm text-gray-600">
                    {new Date(meeting.meeting_date).toLocaleDateString()}
                    {meeting.start_time && ` at ${meeting.start_time}`}
                  </p>
                </div>
                <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full font-medium">
                  {meeting.meeting_type}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Exceptions / Attestations / Tasks */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <motion.div
          className="bg-white  border border-gray-200  rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-200"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900  flex items-center">
              <FileText className="w-5 h-5 mr-2 text-orange-600 text-orange-400" />
              {t("activeExceptions")}
            </h4>
            {exceptionsCount > 0 && (
              <span className="px-2 py-1 bg-orange-100 bg-orange-900/30 text-orange-700 text-orange-300 text-xs rounded-full font-medium">
                {exceptionsCount}
              </span>
            )}
          </div>
          <div className="text-3xl font-bold text-gray-900 ">{exceptionsCount}</div>
          <p className="text-sm text-gray-600  mt-1">{t("exceptionsApprovedInEffect", "Approved or in effect")}</p>
        </motion.div>

        <motion.div
          className="bg-white  border border-gray-200  rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-200"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900  flex items-center">
              <Users className="w-5 h-5 mr-2 text-purple-600 text-purple-400" />
              {t("attestationsDraftInProgress")}
            </h4>
            {attestationsCount > 0 && (
              <span className="px-2 py-1 bg-purple-100 bg-purple-900/30 text-purple-700 text-purple-300 text-xs rounded-full font-medium">
                {attestationsCount}
              </span>
            )}
          </div>
          <div className="text-3xl font-bold text-gray-900 ">{attestationsCount}</div>
          <p className="text-sm text-gray-600  mt-1">{t("attestationsThisQuarter", "This quarter")}</p>
        </motion.div>

        <motion.div
          className="bg-white  border border-gray-200  rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-200"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900  flex items-center">
              <Clock className="w-5 h-5 mr-2 text-blue-600 " />
              {t("openComplianceTasks")}
            </h4>
            {Object.values(tasksCounts).reduce((a, b) => a + b, 0) > 0 && (
              <span className="px-2 py-1 bg-blue-100 bg-blue-900/30 text-blue-700 text-blue-300 text-xs rounded-full font-medium">
                {Object.values(tasksCounts).reduce((a, b) => a + b, 0)}
              </span>
            )}
          </div>
          <div className="space-y-3 mt-4">
            {[
              { key: 'open', label: t('open'), color: 'green' },
              { key: 'in_progress', label: t('inProgress'), color: 'yellow' },
              { key: 'blocked', label: t('blocked'), color: 'red' }
            ].map(({ key, label, color }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full bg-${color}-500`} />
                  <span className="text-sm text-gray-600  capitalize">{label}</span>
                </div>
                <span className="font-semibold text-gray-900 ">{tasksCounts[key] ?? 0}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}