import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuthStore } from "../../store/authStore";
import riskService, {
  Risk,
  UpdateRiskData,
  RiskLevel,
  RiskStatus,
} from "../../services/riskService";
import LoadingSpinner from "../../components/LoadingSpinner";

const levelOptions: RiskLevel[] = ["low", "medium", "high", "critical"];
const statusOptions: RiskStatus[] = [
  "identified",
  "assessed",
  "treating",
  "monitoring",
  "accepted",
  "transferred",
  "avoided",
  "closed",
];

const EditRiskPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { checkPermission } = useAuthStore();
  const canEdit = checkPermission(["auditor", "supervisor_auditor", "admin", "super_admin"]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [risk, setRisk] = useState<Risk | null>(null);
  const [form, setForm] = useState<UpdateRiskData | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        if (!id) {
          toast.error("Invalid risk id");
          navigate("/risks");
          return;
        }
        const r = await riskService.getRisk(id);
        if (!r) {
          toast.error("Risk not found");
          navigate("/risks");
          return;
        }
        setRisk(r);
        setForm({
          id: r.id,
          title: r.title,
          description: r.description || "",
          category: r.category,
          business_unit_id: r.business_unit_id || undefined,
          probability: r.probability || undefined,
          impact: r.impact || undefined,
          risk_level: r.risk_level,
          mitigation_strategy: r.mitigation_strategy || "",
          owner_id: r.owner_id || undefined,
          status: r.status,
          risk_category_id: r.risk_category_id || undefined,
          risk_matrix_id: r.risk_matrix_id || undefined,
          risk_source: r.risk_source || "",
          likelihood_trend: r.likelihood_trend || "stable",
          impact_trend: r.impact_trend || "stable",
          target_probability: r.target_probability || undefined,
          target_impact: r.target_impact || undefined,
          target_date: r.target_date || undefined,
          escalation_criteria: r.escalation_criteria || "",
          review_frequency: r.review_frequency || "quarterly",
          tags: r.tags || [],
          external_reference: r.external_reference || "",
        });
      } catch (err: any) {
        console.error(err);
        toast.error(err?.message || "Failed to load risk");
        navigate("/risks");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, navigate]);

  const handleChange = (field: keyof UpdateRiskData, value: any) => {
    setForm((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;

    if (!form.title || !form.category) {
      toast.error("Title and Category are required");
      return;
    }

    try {
      setSaving(true);
      const updated = await riskService.updateRisk(form);
      toast.success("Risk updated");
      navigate(`/risks/${updated.id}`);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to update risk");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!risk) return;
    if (
      !window.confirm(
        "Are you sure you want to delete this risk? This action cannot be undone.",
      )
    ) {
      return;
    }
    try {
      await riskService.deleteRisk(risk.id);
      toast.success("Risk deleted");
      navigate("/risks");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to delete risk");
    }
  };

  if (loading || !form) {
    return (
      <div className="p-6">
        <LoadingSpinner size="lg" text="Loading risk..." />
      </div>
    );
  }

  if (!canEdit) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <button
          className="inline-flex items-center text-sm text-gray-600 hover:text-blue-600"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>
        <div className="mt-6 bg-white border border-gray-200 rounded-lg p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You do not have permission to edit risks.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <button
        className="inline-flex items-center text-sm text-gray-600 hover:text-blue-600"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </button>

      <div className="flex items-center justify-between mt-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Edit Risk</h1>
        <button
          onClick={handleDelete}
          className="inline-flex items-center px-3 py-2 text-red-600 hover:text-red-700"
          title="Delete Risk"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => handleChange("title", e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Risk title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Category *</label>
            <input
              type="text"
              value={form.category || ""}
              onChange={(e) => handleChange("category", e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Operational / Compliance / Technology"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Risk Level *</label>
            <select
              value={form.risk_level}
              onChange={(e) => handleChange("risk_level", e.target.value as RiskLevel)}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {levelOptions.map((l) => (
                <option key={l} value={l}>
                  {l.charAt(0).toUpperCase() + l.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Status *</label>
            <select
              value={form.status}
              onChange={(e) => handleChange("status", e.target.value as RiskStatus)}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {s.split("_").map((x) => x[0].toUpperCase() + x.slice(1)).join(" ")}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Probability (1-5)</label>
            <input
              type="number"
              min={1}
              max={5}
              value={form.probability ?? ""}
              onChange={(e) =>
                handleChange("probability", e.target.value ? Number(e.target.value) : undefined)
              }
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Impact (1-5)</label>
            <input
              type="number"
              min={1}
              max={5}
              value={form.impact ?? ""}
              onChange={(e) =>
                handleChange("impact", e.target.value ? Number(e.target.value) : undefined)
              }
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={form.description || ""}
            onChange={(e) => handleChange("description", e.target.value)}
            rows={4}
            className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Describe the risk context, drivers, impact, etc."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Mitigation Strategy</label>
          <textarea
            value={form.mitigation_strategy || ""}
            onChange={(e) => handleChange("mitigation_strategy", e.target.value)}
            rows={3}
            className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Outline planned or existing mitigation actions"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Target Probability (1-5)</label>
            <input
              type="number"
              min={1}
              max={5}
              value={form.target_probability ?? ""}
              onChange={(e) =>
                handleChange(
                  "target_probability",
                  e.target.value ? Number(e.target.value) : undefined,
                )
              }
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Target Impact (1-5)</label>
            <input
              type="number"
              min={1}
              max={5}
              value={form.target_impact ?? ""}
              onChange={(e) =>
                handleChange("target_impact", e.target.value ? Number(e.target.value) : undefined)
              }
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Target Date</label>
            <input
              type="date"
              value={form.target_date ?? ""}
              onChange={(e) => handleChange("target_date", e.target.value || undefined)}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate(`/risks/${id}`)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            disabled={saving}
            type="submit"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditRiskPage;