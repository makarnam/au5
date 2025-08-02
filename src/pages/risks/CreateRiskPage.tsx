import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { toast } from "react-hot-toast";
import { ArrowLeft, Save, Wand2 } from "lucide-react";
import riskService, { CreateRiskData, RiskLevel, RiskStatus } from "../../services/riskService";
import AIGenerator from "../../components/ai/AIGenerator";

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

const CreateRiskPage: React.FC = () => {
  const navigate = useNavigate();
  const { checkPermission } = useAuthStore();
  const canEdit = checkPermission(["auditor", "supervisor_auditor", "admin", "super_admin"]);

  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<CreateRiskData>({
    title: "",
    description: "",
    category: "",
    business_unit_id: undefined,
    probability: 3,
    impact: 3,
    risk_level: "medium",
    mitigation_strategy: "",
    owner_id: undefined,
    status: "identified",
    risk_category_id: undefined,
    risk_matrix_id: undefined,
    risk_source: "",
    likelihood_trend: "stable",
    impact_trend: "stable",
    target_probability: undefined,
    target_impact: undefined,
    target_date: undefined,
    escalation_criteria: "",
    review_frequency: "quarterly",
    tags: [],
    external_reference: "",
  });

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
          <p className="text-gray-600">You do not have permission to create risks.</p>
        </div>
      </div>
    );
  }

  const handleChange = (field: keyof CreateRiskData, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.category) {
      toast.error("Title and Category are required");
      return;
    }
    try {
      setSaving(true);
      const created = await riskService.createRisk(form);
      toast.success("Risk created");
      navigate(`/risks/${created.id}`);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to create risk");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <button
        className="inline-flex items-center text-sm text-gray-600 hover:text-blue-600"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </button>

      <h1 className="text-3xl font-bold text-gray-900 mt-4 mb-6">Create Risk</h1>

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
              value={form.category}
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
              value={form.probability ?? 3}
              onChange={(e) => handleChange("probability", Number(e.target.value))}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Impact (1-5)</label>
            <input
              type="number"
              min={1}
              max={5}
              value={form.impact ?? 3}
              onChange={(e) => handleChange("impact", Number(e.target.value))}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <AIGenerator
              fieldType="description"
              auditData={{
                title: form.title || "Risk",
                audit_type: "risk",
                business_unit: form.category || "General",
                scope: form.risk_source || "",
              }}
              currentValue={form.description}
              onGenerated={(content) => {
                const text = Array.isArray(content) ? content.join("\n") : content;
                handleChange("description", text);
              }}
              className="ml-2"
            />
          </div>
          <textarea
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
            rows={4}
            className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Describe the risk context, drivers, impact, etc."
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">Mitigation Strategy</label>
            <AIGenerator
              fieldType="methodology"
              auditData={{
                title: form.title || "Risk Mitigation",
                audit_type: "risk",
                business_unit: form.category || "General",
                scope: `Mitigation for risk: ${form.title}`,
              }}
              currentValue={form.mitigation_strategy}
              onGenerated={(content) => {
                const text = Array.isArray(content) ? content.join("\n") : content;
                handleChange("mitigation_strategy", text);
              }}
              className="ml-2"
            />
          </div>
          <textarea
            value={form.mitigation_strategy}
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
              onChange={(e) => handleChange("target_probability", e.target.value ? Number(e.target.value) : undefined)}
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
              onChange={(e) => handleChange("target_impact", e.target.value ? Number(e.target.value) : undefined)}
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
            onClick={() => navigate("/risks")}
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
            {saving ? "Saving..." : "Create Risk"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateRiskPage;