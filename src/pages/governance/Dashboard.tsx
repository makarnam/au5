import { useEffect, useMemo, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, TrendingUp, TrendingDown, AlertCircle, CheckCircle, Clock, FileText, Users, Target } from 'lucide-react';

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
      className="p-4 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors"
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
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6"
          >
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
              >
                ×
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("governanceDashboard")}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">{t("governanceDashboardDesc", "Monitor compliance posture and governance activities")}</p>
          {lastUpdated && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
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
        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800 shadow-sm transition-colors"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="framework-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("framework")}
            </label>
            <select
              id="framework-select"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              value={frameworkId}
              onChange={(e) => setFrameworkId(e.target.value)}
              disabled={loading}
            >
              {frameworks.map(f => <option key={f.id} value={f.id}>{f.name} ({f.code})</option>)}
              {frameworks.length === 0 && <option value="">{t("noFrameworks")}</option>}
            </select>
          </div>
          <div>
            <label htmlFor="profile-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("profileOptional")}
            </label>
            <select
              id="profile-select"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              value={profileId}
              onChange={(e) => setProfileId(e.target.value)}
              disabled={loading || profiles.length === 0}
            >
              {profiles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              {profiles.length === 0 && <option value="">{t("noProfiles")}</option>}
            </select>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t("profileAffectsApplicability")}</p>
          </div>
          <div className="flex items-end">
            {loading && (
              <div className="flex items-center text-sm text-blue-600 dark:text-blue-400">
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
              className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-all duration-200 cursor-pointer`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center justify-between mb-2">
                <StatusIcon className={`w-5 h-5 text-${color}-500`} />
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{percentage}%</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{count}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 capitalize">{label}</div>
            </motion.div>
          );
        })}
        <motion.div
          className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
        >
          <div className="flex items-center justify-between mb-2">
            <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">100%</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{totalReqs}</div>
          <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">{t("totalRequirements")}</div>
        </motion.div>
      </motion.div>

      {/* Trend */}
      <motion.div
        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
            {t("postureTrend")}
          </h3>
          {snapshots.length > 0 && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
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
                      className="bg-gradient-to-t from-blue-600 to-blue-500 dark:from-blue-500 dark:to-blue-400 w-6 rounded-t group-hover:from-blue-700 group-hover:to-blue-600 dark:group-hover:from-blue-600 dark:group-hover:to-blue-500 transition-colors cursor-pointer"
                      style={{ height: `${height}px` }}
                      whileHover={{ scale: 1.1 }}
                      title={`${t("complianceScore")}: ${score}%`}
                    />
                    <div className="text-[10px] mt-2 text-gray-600 dark:text-gray-400 font-medium">
                      {new Date(s.snapshot_date).toLocaleDateString()}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-40 text-gray-500 dark:text-gray-400">
              <div className="text-center">
                <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">{t("noSnapshotData")}</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Exceptions / Attestations / Tasks */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <motion.div
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-200"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900 dark:text-white flex items-center">
              <FileText className="w-5 h-5 mr-2 text-orange-600 dark:text-orange-400" />
              {t("activeExceptions")}
            </h4>
            {exceptionsCount > 0 && (
              <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs rounded-full font-medium">
                {exceptionsCount}
              </span>
            )}
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">{exceptionsCount}</div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{t("exceptionsApprovedInEffect", "Approved or in effect")}</p>
        </motion.div>

        <motion.div
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-200"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900 dark:text-white flex items-center">
              <Users className="w-5 h-5 mr-2 text-purple-600 dark:text-purple-400" />
              {t("attestationsDraftInProgress")}
            </h4>
            {attestationsCount > 0 && (
              <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded-full font-medium">
                {attestationsCount}
              </span>
            )}
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">{attestationsCount}</div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{t("attestationsThisQuarter", "This quarter")}</p>
        </motion.div>

        <motion.div
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-200"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900 dark:text-white flex items-center">
              <Clock className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
              {t("openComplianceTasks")}
            </h4>
            {Object.values(tasksCounts).reduce((a, b) => a + b, 0) > 0 && (
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full font-medium">
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
                  <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">{label}</span>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">{tasksCounts[key] ?? 0}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}