import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import findingsService, { Finding, FindingStatus, RiskRating } from '../../services/findingsService';
import { supabase } from '../../lib/supabase';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { AlertTriangle, CheckCircle, Clock, Filter, Link as LinkIcon, PieChart as PieChartIcon, Shield, TrendingUp } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';

type DashboardFilters = {
  query: string;
  status: FindingStatus | 'all';
  risk: RiskRating | 'all';
  auditId: string | 'all';
  dueBefore: string;
  controlFailure: 'all' | 'yes' | 'no';
};

const defaultFilters: DashboardFilters = {
  query: '',
  status: 'all',
  risk: 'all',
  auditId: 'all',
  dueBefore: '',
  controlFailure: 'all',
};

type ControlLite = { id: string; title: string; effectiveness?: string | null; control_type?: string | null };

const COLORS = ['#0ea5e9', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#22c55e', '#f97316', '#3b82f6'];

export default function FindingsDashboard() {
  const [filters, setFilters] = useState<DashboardFilters>(defaultFilters);
  const [items, setItems] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(false);
  const [audits, setAudits] = useState<Array<{ id: string; title: string }>>([]);
  const [controlsById, setControlsById] = useState<Record<string, ControlLite>>({});

  useEffect(() => {
    const loadAudits = async () => {
      const { data } = await supabase.from('audits').select('id,title').order('created_at', { ascending: false }).limit(200);
      setAudits(data || []);
    };
    loadAudits();
  }, []);

  const loadFindings = async () => {
    setLoading(true);
    try {
      const { items } = await findingsService.list({
        query: filters.query || undefined,
        status: filters.status === 'all' ? undefined : [filters.status],
        risk: filters.risk === 'all' ? undefined : [filters.risk],
        auditId: filters.auditId === 'all' ? undefined : filters.auditId,
        dueBefore: filters.dueBefore || undefined,
        orderBy: 'created_at' as any,
        orderDir: 'desc',
      });
      const filtered = items.filter((f) => {
        if (filters.controlFailure === 'yes' && !f.control_failure) return false;
        if (filters.controlFailure === 'no' && f.control_failure) return false;
        return true;
      });
      setItems(filtered);
      // Fetch controls referenced by findings for cross-link charts
      const ctrlIds = Array.from(new Set(filtered.map((f) => f.control_id).filter(Boolean))) as string[];
      if (ctrlIds.length) {
        const { data } = await supabase
          .from('controls')
          .select('id,title,effectiveness,control_type')
          .in('id', ctrlIds);
        const map: Record<string, ControlLite> = {};
        (data || []).forEach((c) => { map[c.id] = c as ControlLite; });
        setControlsById(map);
      } else {
        setControlsById({});
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadFindings();   }, []);

  const auditsOptions = useMemo(() => [{ id: 'all', title: 'All Audits' }, ...audits], [audits]);

  // KPI metrics
  const kpi = useMemo(() => {
    const total = items.length;
    const open = items.filter((f) => ['open', 'under_review'].includes(f.workflow_status)).length;
    const criticalOrHighOpen = items.filter((f) => ['open', 'under_review'].includes(f.workflow_status) && (f.risk_rating === 'high' || f.risk_rating === 'critical')).length;
    const now = new Date();
    const overdue = items.filter((f) => f.remediation_due_date && new Date(f.remediation_due_date) < now && f.workflow_status !== 'closed' && f.workflow_status !== 'remediated').length;
    const controlFailures = items.filter((f) => f.control_failure).length;
    return { total, open, criticalOrHighOpen, overdue, controlFailures };
  }, [items]);

  // Charts data
  const byRisk = useMemo(() => {
    const counts: Record<RiskRating, number> = { low: 0, medium: 0, high: 0, critical: 0 };
    items.forEach((f) => { counts[f.risk_rating] = (counts[f.risk_rating] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [items]);

  const byStatus = useMemo(() => {
    const all: FindingStatus[] = ['draft', 'under_review', 'open', 'remediated', 'closed'];
    const counts: Record<FindingStatus, number> = { draft: 0, under_review: 0, open: 0, remediated: 0, closed: 0 };
    items.forEach((f) => { counts[f.workflow_status] = (counts[f.workflow_status] || 0) + 1; });
    return all.map((k) => ({ name: k.replace('_', ' '), value: counts[k] }));
  }, [items]);

  const monthlyTrend = useMemo(() => {
    // group by YYYY-MM
    const map: Record<string, number> = {};
    items.forEach((f) => {
      const d = f.created_at ? new Date(f.created_at) : new Date();
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      map[key] = (map[key] || 0) + 1;
    });
    const keys = Object.keys(map).sort();
    return keys.map((k) => ({ month: k, findings: map[k] }));
  }, [items]);

  const byAudit = useMemo(() => {
    const counts: Record<string, number> = {};
    items.forEach((f) => {
      const ref = f.audit_reference || 'Unknown';
      counts[ref] = (counts[ref] || 0) + 1;
    });
    const arr = Object.entries(counts).map(([name, value]) => ({ name, value }));
    arr.sort((a, b) => b.value - a.value);
    return arr.slice(0, 10);
  }, [items]);

  const byControlEffectiveness = useMemo(() => {
    const counts: Record<string, number> = {};
    items.forEach((f) => {
      if (!f.control_id) return;
      const eff = controlsById[f.control_id]?.effectiveness || 'unknown';
      counts[eff] = (counts[eff] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [items, controlsById]);

  const topControls = useMemo(() => {
    const counts: Record<string, number> = {};
    items.forEach((f) => {
      if (!f.control_id) return;
      counts[f.control_id] = (counts[f.control_id] || 0) + 1;
    });
    const arr = Object.entries(counts)
      .map(([id, value]) => ({ id, value, title: controlsById[id]?.title || id.slice(0, 8) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
    return arr;
  }, [items, controlsById]);

  const riskBadge = (r: RiskRating) => {
    const map: Record<RiskRating, string> = {
      low: 'bg-green-100 text-green-700',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-700',
    };
    return <span className={`px-2 py-1 text-xs rounded ${map[r]}`}>{r}</span>;
  };

  const statusBadge = (s: FindingStatus) => {
    const map: Record<FindingStatus, string> = {
      draft: 'bg-gray-100 text-gray-700',
      under_review: 'bg-blue-100 text-blue-700',
      open: 'bg-purple-100 text-purple-700',
      remediated: 'bg-emerald-100 text-emerald-700',
      closed: 'bg-zinc-200 text-zinc-800',
    };
    return <span className={`px-2 py-1 text-xs rounded ${map[s]}`}>{s.replace('_',' ')}</span>;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Findings Dashboard</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadFindings}><TrendingUp className="w-4 h-4 mr-2"/>Refresh</Button>
          <Link to="/findings"><Button variant="default"><Filter className="w-4 h-4 mr-2"/>Go to List</Button></Link>
        </div>
      </div>

      {/* Filters */}
      <form
        onSubmit={(e) => { e.preventDefault(); loadFindings(); }}
        className="grid grid-cols-1 md:grid-cols-7 gap-3 p-4 border rounded-md bg-white"
      >
        <div className="md:col-span-2">
          <label className="text-xs text-gray-500">Search</label>
          <Input placeholder="Title or description..." value={filters.query} onChange={(e) => setFilters({ ...filters, query: e.target.value })} />
        </div>
        <div>
          <label className="text-xs text-gray-500">Status</label>
          <select className="w-full border rounded h-10 px-2" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}>
            {['all','draft','under_review','open','remediated','closed'].map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500">Risk</label>
          <select className="w-full border rounded h-10 px-2" value={filters.risk} onChange={(e) => setFilters({ ...filters, risk: e.target.value as any })}>
            {['all','low','medium','high','critical'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500">Audit</label>
          <select className="w-full border rounded h-10 px-2" value={filters.auditId} onChange={(e) => setFilters({ ...filters, auditId: e.target.value })}>
            {auditsOptions.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500">Due before</label>
          <Input type="date" value={filters.dueBefore} onChange={(e) => setFilters({ ...filters, dueBefore: e.target.value })} />
        </div>
        <div>
          <label className="text-xs text-gray-500">Control Failure</label>
          <select className="w-full border rounded h-10 px-2" value={filters.controlFailure} onChange={(e) => setFilters({ ...filters, controlFailure: e.target.value as any })}>
            {['all','yes','no'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="md:col-span-7 flex gap-2">
          <Button type="submit" variant="default">Apply</Button>
          <Button type="button" variant="secondary" onClick={() => { setFilters(defaultFilters); setTimeout(loadFindings, 0); }}>Clear</Button>
        </div>
      </form>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Total Findings</span>
            <PieChartIcon className="w-5 h-5 text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-semibold">{kpi.total}</div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Open / Under Review</span>
            <AlertTriangle className="w-5 h-5 text-orange-600" />
          </div>
          <div className="mt-2 text-2xl font-semibold">{kpi.open}</div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">High/Critical Open</span>
            <Shield className="w-5 h-5 text-red-600" />
          </div>
          <div className="mt-2 text-2xl font-semibold">{kpi.criticalOrHighOpen}</div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Overdue</span>
            <Clock className="w-5 h-5 text-rose-600" />
          </div>
          <div className="mt-2 text-2xl font-semibold">{kpi.overdue}</div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Control Failures</span>
            <CheckCircle className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-semibold">{kpi.controlFailures}</div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="bg-white border rounded-lg p-4">
          <div className="font-medium mb-2">By Risk Rating</div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip />
                <Pie data={byRisk} nameKey="name" dataKey="value" outerRadius={90} innerRadius={40}>
                  {byRisk.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-4">
          <div className="font-medium mb-2">By Status</div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byStatus}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-4">
          <div className="font-medium mb-2">Monthly Trend</div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="findings" stroke="#10b981" strokeWidth={3} dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white border rounded-lg p-4">
          <div className="font-medium mb-2">Top Controls with Findings</div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topControls} layout="vertical" margin={{ left: 80 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" allowDecimals={false} />
                <YAxis dataKey="title" type="category" width={180} />
                <Tooltip />
                <Bar dataKey="value" fill="#8b5cf6" radius={[0,4,4,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="font-medium mb-2">Findings by Audit (Top 10)</div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byAudit}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" interval={0} angle={-20} textAnchor="end" height={60} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#f59e0b" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Control Effectiveness vs Findings */}
      <div className="bg-white border rounded-lg p-4">
        <div className="font-medium mb-2">Control Effectiveness Associated with Findings</div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byControlEffectiveness}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#0ea5e9" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Open Findings */}
      <div className="bg-white border rounded-md">
        <div className="p-4 flex items-center justify-between">
          <div className="font-medium">Recent Open Findings</div>
          <Link to="/findings">View all</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left p-3">Title</th>
                <th className="text-left p-3">Risk</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Audit</th>
                <th className="text-left p-3">Control</th>
                <th className="text-right p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="p-4" colSpan={6}>Loading...</td></tr>
              ) : (
                items
                  .filter((f) => ['open', 'under_review'].includes(f.workflow_status))
                  .slice(0, 10)
                  .map((f) => (
                    <tr key={f.id} className="border-t">
                      <td className="p-3">
                        <div className="font-medium"><Link to={`/findings/${f.id}`} className="hover:underline">{f.title}</Link></div>
                        <div className="text-xs text-gray-500 truncate max-w-[520px]">{f.description || ''}</div>
                      </td>
                      <td className="p-3">{riskBadge(f.risk_rating)}</td>
                      <td className="p-3">{statusBadge(f.workflow_status)}</td>
                      <td className="p-3">{f.audit_reference || '-'}</td>
                      <td className="p-3">
                        {f.control_id ? (
                          <Link to={`/controls/${f.control_id}`} className="inline-flex items-center text-blue-600 hover:underline">
                            <LinkIcon className="w-4 h-4 mr-1"/> {controlsById[f.control_id]?.title || f.control_id.slice(0, 8)}
                          </Link>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <Link to={`/findings/${f.id}`} className="text-blue-600 hover:underline mr-3">View</Link>
                        <Link to={`/findings/${f.id}/edit`} className="text-gray-700 hover:underline">Edit</Link>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


