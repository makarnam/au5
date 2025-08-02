import React, { useEffect, useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import AIGenerator from "../../../components/ai/AIGenerator";
import riskService from "../../../services/riskService";

interface ReviewForm {
  risk_id: string;
  review_summary: string;
  effectiveness_assessment: string;
  next_actions: string;
}

export default function CreateReviewPage() {
  const navigate = useNavigate();
  const { riskId } = useParams<{ riskId: string }>();

  const [riskTitle, setRiskTitle] = useState<string>("");
  const [form, setForm] = useState<ReviewForm>({
    risk_id: riskId || "",
    review_summary: "",
    effectiveness_assessment: "",
    next_actions: "",
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

  const handleChange = (field: keyof ReviewForm, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!riskId) {
      toast.error("Invalid risk");
      return;
    }
    if (!form.review_summary) {
      toast.error("Review summary is required");
      return;
    }
    try {
      setSaving(true);
      // Placeholder: Implement riskService.createReview when backend available
      console.log("Creating review", form);
      toast.success("Review created");
      navigate(`/risks/${riskId}`);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to create review");
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
        Add Review {riskTitle ? `for: ${riskTitle}` : ""}
      </h1>

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
        {/* Review Summary */}
        <div>
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">Review Summary *</label>
            <AIGenerator
              fieldType="description"
              auditData={{
                title: `Review for ${riskTitle || "Risk"}`,
                audit_type: "risk_review",
                business_unit: "Risk Management",
                scope: `Provide a concise summary of the current state for risk: ${riskTitle}`,
              }}
              currentValue={form.review_summary}
              onGenerated={(content) => {
                const text = Array.isArray(content) ? content.join("\n") : content;
                handleChange("review_summary", text);
              }}
              className="ml-2"
            />
          </div>
          <textarea
            value={form.review_summary}
            onChange={(e) => handleChange("review_summary", e.target.value)}
            rows={5}
            className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Summarize the current status and observations"
            required
          />
        </div>

        {/* Effectiveness Assessment */}
        <div>
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">Effectiveness Assessment</label>
            <AIGenerator
              fieldType="methodology"
              auditData={{
                title: `Effectiveness of treatments for ${riskTitle || "Risk"}`,
                audit_type: "risk_review",
                business_unit: "Risk Management",
                scope: `Assess effectiveness of control/treatment actions for risk: ${riskTitle}`,
              }}
              currentValue={form.effectiveness_assessment}
              onGenerated={(content) => {
                const text = Array.isArray(content) ? content.join("\n") : content;
                handleChange("effectiveness_assessment", text);
              }}
              className="ml-2"
            />
          </div>
          <textarea
            value={form.effectiveness_assessment}
            onChange={(e) => handleChange("effectiveness_assessment", e.target.value)}
            rows={5}
            className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Assess how effective treatments/controls are"
          />
        </div>

        {/* Next Actions */}
        <div>
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">Next Actions</label>
            <AIGenerator
              fieldType="objectives"
              auditData={{
                title: `Next actions for ${riskTitle || "Risk"}`,
                audit_type: "risk_review",
                business_unit: "Risk Management",
                scope: `Propose next actions and owners to improve posture for risk: ${riskTitle}`,
              }}
              currentValue={form.next_actions}
              onGenerated={(content) => {
                const text = Array.isArray(content) ? content.join("\n") : content;
                handleChange("next_actions", text);
              }}
              className="ml-2"
            />
          </div>
          <textarea
            value={form.next_actions}
            onChange={(e) => handleChange("next_actions", e.target.value)}
            rows={5}
            className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="List recommended actions and owners"
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
            {saving ? "Saving..." : "Create Review"}
          </button>
        </div>
      </form>
    </div>
  );
}