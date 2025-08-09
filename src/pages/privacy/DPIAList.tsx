import React, { useMemo, useState } from "react";
import { Plus, ShieldAlert, ClipboardList, CheckCircle2, XCircle, Search } from "lucide-react";

export type DpiaStatus = "draft" | "in_review" | "approved" | "rejected";

type DpiaRecord = {
  id: string;
  title: string;
  description?: string;
  owner?: string;
  status: DpiaStatus;
  riskLevel: "low" | "medium" | "high" | "critical";
  createdAt: string;
  updatedAt: string;
};

const seed: DpiaRecord[] = [
  {
    id: "dpia-1",
    title: "Customer Analytics Platform",
    description: "Processing behavioral data for analytics and personalization",
    owner: "Privacy Office",
    status: "in_review",
    riskLevel: "high",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
  },
  {
    id: "dpia-2",
    title: "Employee Monitoring",
    description: "Endpoint telemetry collection for security operations",
    owner: "CISO",
    status: "draft",
    riskLevel: "medium",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
  },
  {
    id: "dpia-3",
    title: "Marketing CRM Migration",
    description: "Data transfer to new marketing platform",
    owner: "Marketing",
    status: "approved",
    riskLevel: "low",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString(),
  },
];

function StatusPill({ status }: { status: DpiaStatus }) {
  const map: Record<DpiaStatus, { text: string; classes: string; Icon: React.ComponentType<any> }> = {
    draft: { text: "Draft", classes: "bg-gray-100 text-gray-800", Icon: ClipboardList },
    in_review: { text: "In Review", classes: "bg-yellow-100 text-yellow-800", Icon: Search },
    approved: { text: "Approved", classes: "bg-green-100 text-green-700", Icon: CheckCircle2 },
    rejected: { text: "Rejected", classes: "bg-red-100 text-red-700", Icon: XCircle },
  };
  const { text, classes, Icon } = map[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${classes}`}>
      <Icon className="w-3.5 h-3.5" /> {text}
    </span>
  );
}

function RiskPill({ level }: { level: DpiaRecord["riskLevel"] }) {
  const classes =
    level === "critical"
      ? "bg-red-100 text-red-800"
      : level === "high"
      ? "bg-orange-100 text-orange-800"
      : level === "medium"
      ? "bg-yellow-100 text-yellow-800"
      : "bg-green-100 text-green-800";
  const text = level.charAt(0).toUpperCase() + level.slice(1);
  return <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${classes}`}>{text}</span>;
}

export default function DPIAList() {
  const [records, setRecords] = useState<DpiaRecord[]>(seed);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | DpiaStatus>("all");
  const [risk, setRisk] = useState<"all" | DpiaRecord["riskLevel"]>("all");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return records.filter((r) => {
      const matchesSearch = !term || r.title.toLowerCase().includes(term) || (r.description || "").toLowerCase().includes(term);
      const matchesStatus = status === "all" || r.status === status;
      const matchesRisk = risk === "all" || r.riskLevel === risk;
      return matchesSearch && matchesStatus && matchesRisk;
    });
  }, [records, search, status, risk]);

  const createNew = () => {
    const id = `dpia-${Math.random().toString(36).slice(2, 8)}`;
    const now = new Date().toISOString();
    setRecords((prev) => [
      {
        id,
        title: "New DPIA",
        description: "Describe the processing activity and risks",
        owner: "",
        status: "draft",
        riskLevel: "medium",
        createdAt: now,
        updatedAt: now,
      },
      ...prev,
    ]);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <ShieldAlert className="w-7 h-7 text-blue-600" /> Privacy Impact Assessments (DPIA)
          </h1>
          <p className="text-gray-600 mt-2">Identify, assess, and document privacy risks for high-risk processing activities.</p>
        </div>
        <button onClick={createNew} className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" /> New DPIA
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 flex flex-wrap gap-3 items-center">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search DPIAs"
            className="pl-9 pr-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as any)}
          className="px-3 py-2 border rounded-md text-sm"
        >
          <option value="all">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="in_review">In Review</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <select
          value={risk}
          onChange={(e) => setRisk(e.target.value as any)}
          className="px-3 py-2 border rounded-md text-sm"
        >
          <option value="all">All Risks</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {filtered.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{r.title}</div>
                  {r.description && <div className="text-xs text-gray-500 mt-1 line-clamp-2">{r.description}</div>}
                </td>
                <td className="px-6 py-4"><StatusPill status={r.status} /></td>
                <td className="px-6 py-4"><RiskPill level={r.riskLevel} /></td>
                <td className="px-6 py-4 text-sm text-gray-900">{r.owner || "-"}</td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <div>Created: {new Date(r.createdAt).toLocaleDateString()}</div>
                  <div className="text-gray-500">Updated: {new Date(r.updatedAt).toLocaleDateString()}</div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-gray-500">No DPIAs match your filters.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
