import React, { useEffect, useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import AIGenerator from "../../../components/ai/AIGenerator";
import riskService from "../../../services/riskService";

interface TreatmentForm {
  risk_id: string;
  action_plan: string;
  owner_responsibilities: string;
  timeline: string;
}

export default function CreateTreatmentPage() {
  const navigate = useNavigate();
  const { riskId } = useParams<{ riskId: string }>();

  const [riskTitle, setRiskTitle] = useState<string>("");
  const [form, setForm] = useState<TreatmentForm>({
    risk_id: riskId || "",
    action_plan: "",
    owner_responsibilities: "",
    timeline: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadRisk = async () => {
      try {
        if (!riskId) return;
        const r = await riskService.getRisk(riskId);
        if (r) setRiskTitle(r.title);
      } catch (e) {
        console.error(e);
      }
    };
    loadRisk();
  }, [riskId]);

  const handleChange = (field: keyof TreatmentForm, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!riskId) {
      toast.error("Invalid risk");
      return;
    }
    if (!form.action_plan) {
      toast.error("Action plan is required");
      return;
    }
    try {
      setSaving(true);
      // Placeholder: Implement riskService.createTreatment when backend available
      console.log("Creating treatment", form);
      toast.success("Treatment created");
      navigate(`/risks/${riskId}`);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to create treatment");
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

      <h1 className="text-3xl font-bold text-gray-900 mt-4 mb-6">
        Add Treatment {riskTitle ? `for: ${riskTitle}` : ""}
      </h1>

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
        {/* Action Plan */}
        <div>
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">Action Plan *</label>
            <AIGenerator
              fieldType="methodology"
              auditData={{
                title: riskTitle || "Risk",
                audit_type: "risk_treatment",
                business_unit: "Risk Management",
                scope: `Create a concrete treatment plan for risk: ${riskTitle}`,
              }}
              currentValue={form.action_plan}
              onGenerated={(content) => {
                const text = Array.isArray(content) ? content.join("\n") : content;
                handleChange("action_plan", text);
              }}
              className="ml-2"
            />
          </div>
          <textarea
            value={form.action_plan}
            onChange={(e) => handleChange("action_plan", e.target.value)}
            rows={6}
            className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Describe concrete steps to treat this risk"
            required
          />
        </div>

        {/* Owner Responsibilities */}
        <div>
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">Owner Responsibilities</label>
            <AIGenerator
              fieldType="scope"
              auditData={{
                title: `Responsibilities for ${riskTitle || "Risk"}`,
                audit_type: "risk_treatment",
                business_unit: "Risk Management",
                scope: `Define accountable roles and responsibilities to execute the treatment plan for risk: ${riskTitle}`,
              }}
              currentValue={form.owner_responsibilities}
              onGenerated={(content) => {
                const text = Array.isArray(content) ? content.join("\n") : content;
                handleChange("owner_responsibilities", text);
              }}
              className="ml-2"
            />
          </div>
          <textarea
            value={form.owner_responsibilities}
            onChange={(e) => handleChange("owner_responsibilities", e.target.value)}
            rows={4}
            className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Define roles and responsibilities for treatment execution"
          />
        </div>

        {/* Timeline / Milestones */}
        <div>
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">Timeline / Milestones</label>
            <AIGenerator
              fieldType="objectives"
              auditData={{
                title: `Timeline/Milestones for ${riskTitle || "Risk"}`,
                audit_type: "risk_treatment",
                business_unit: "Risk Management",
                scope: `Propose actionable milestones and timeline to reduce the risk level for: ${riskTitle}`,
              }}
              currentValue={form.timeline}
              onGenerated={(content) => {
                const text = Array.isArray(content) ? content.join("\n") : content;
                handleChange("timeline", text);
              }}
              className="ml-2"
            />
          </div>
          <textarea
            value={form.timeline}
            onChange={(e) => handleChange("timeline", e.target.value)}
            rows={4}
            className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Define milestones and target dates"
          />
        </div>

        <div className="flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            disabled={saving}
            type="submit"
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-60"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving..." : "Create Treatment"}
          </button>
        </div>
      </form>
    </div>
  );
}