import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, Filter, RefreshCcw, XCircle, X, AlarmClock, Search } from "lucide-react";
import { toast } from "react-hot-toast";
import LoadingSpinner from "../../components/LoadingSpinner";
import { schedulingService, UpcomingScheduleView } from "../../services/schedulingService";
import { formatDate } from "../../utils";

export default function UpcomingSchedules() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<UpcomingScheduleView[]>([]);
  const [error, setError] = useState<string | null>(null);

  // filters
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await schedulingService.listUpcoming();
      if (error) throw error;
      setRows(data || []);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load upcoming schedules");
      toast.error(e?.message ?? "Failed to load upcoming schedules");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const q = search.trim().toLowerCase();
      const inSearch =
        q.length === 0 ||
        r.title.toLowerCase().includes(q) ||
        (r.description ?? "").toLowerCase().includes(q) ||
        (r.audit_title ?? "").toLowerCase().includes(q);
      const startOk = !fromDate || new Date(r.start_at) >= new Date(fromDate);
      const endOk = !toDate || new Date(r.start_at) <= new Date(toDate);
      return inSearch && startOk && endOk;
    });
  }, [rows, search, fromDate, toDate]);

  const handleClearFilters = () => {
    setSearch("");
    setFromDate("");
    setToDate("");
  };

  const handleCancel = async (id: string) => {
    if (!confirm("Cancel this schedule?")) return;
    try {
      const { error } = await schedulingService.cancelSchedule(id);
      if (error) throw error;
      toast.success("Schedule cancelled");
      // optimistic update
      setRows((prev) => prev.filter((r) => r.id !== id));
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to cancel schedule");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-red-900 mb-2">Error Loading Schedules</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={load}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Upcoming Audit Schedules</h1>
          <p className="text-gray-600 mt-1">Review and manage all scheduled audits.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={load}
            className="px-3 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2"
            title="Refresh"
          >
            <RefreshCcw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={() => navigate("/audits")}
            className="px-3 py-2 border rounded-lg hover:bg-gray-50"
          >
            Back to Audits
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by schedule title, description, or audit title..."
                className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">From</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">To</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={handleClearFilters}
            className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            Clear filters
          </button>
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="bg-white border rounded-lg p-10 text-center">
          <AlarmClock className="w-10 h-10 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-700">No upcoming schedules.</p>
        </div>
      ) : (
        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Audit</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Title</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Start</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">End</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">TZ</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Recurrence</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <button
                      className="text-blue-600 hover:underline"
                      onClick={() => navigate(`/audits/${row.audit_id}`)}
                    >
                      {row.audit_title}
                    </button>
                    <div className="mt-1 text-xs text-gray-500">{row.audit_status}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{row.title}</div>
                    {row.description && (
                      <div className="text-sm text-gray-600 line-clamp-2">{row.description}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-sm text-gray-800">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {formatDate(row.start_at)}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-sm text-gray-800">
                      <Clock className="w-4 h-4 text-gray-400" />
                      {formatDate(row.end_at)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{row.timezone}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {row.recurrence_rule ? row.recurrence_rule : "-"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCancel(row.id)}
                        className="px-3 py-1.5 border rounded-lg text-red-600 hover:bg-red-50"
                        title="Cancel schedule"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => navigate(`/audits/${row.audit_id}/schedule`)}
                        className="px-3 py-1.5 border rounded-lg hover:bg-gray-50"
                      >
                        Reschedule
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
