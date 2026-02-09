import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, ChevronRight } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import riskService, { RiskLevel, RiskStatus } from "../../services/riskService";
import AIGenerator from "../../components/ai/AIGenerator";

type WizardStep = 1 | 2 | 3;

type CreateRiskData = {
  title: string;
  description?: string;
  category: string;
  probability?: number;
  impact?: number;
  risk_level: RiskLevel;
  status: RiskStatus;
  mitigation_strategy?: string;
  target_probability?: number;
  target_impact?: number;
  target_date?: string;
};

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

const StepHeader: React.FC<{ current: WizardStep }> = ({ current }) => {
  const steps = [
    { id: 1, label: "Basics" },
    { id: 2, label: "Assessment" },
    { id: 3, label: "Targets" },
  ];
  return (
    <div className="flex items-center gap-3 mb-6">
      {steps.map((s, idx) => (
        <React.Fragment key={s.id}>
          <div
            className={`px-3 py-1 rounded-full text-sm ${
              current === (s.id as WizardStep)
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {s.id}. {s.label}
          </div>
          {idx < steps.length - 1 && <ChevronRight className="w-4 h-4 text-gray-400" />}
        </React.Fragment>
      ))}
    </div>
  );
};

const CreateRiskWizard: React.FC = () => {
  const navigate = useNavigate();
  const { checkPermission } = useAuthStore();
  const canEdit = checkPermission(["auditor", "supervisor_auditor", "admin", "super_admin"]);

  const [step, setStep] = useState<WizardStep>(1);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<CreateRiskData>({
    title: "",
    description: "",
    category: "",
    probability: 3,
    impact: 3,
    risk_level: "medium",
    status: "identified",
    mitigation_strategy: "",
    target_probability: undefined,
    target_impact: undefined,
    target_date: undefined,
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

  const update = (key: keyof CreateRiskData, value: any) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const canContinue =
    (step === 1 && !!form.title && !!form.category) ||
    (step === 2 && form.probability !== undefined && form.impact !== undefined) ||
    step === 3;

  const handleSubmit = async () => {
    if (!form.title || !form.category) return;
    try {
      setSaving(true);
      const createdId = await riskService.createRisk(form);
      
      // Risk oluşturulduktan sonra otomatik olarak workflow başlat
      if (form.risk_level === 'high' || form.risk_level === 'critical') {
        try {
          // Yüksek risk seviyesi için otomatik onay süreci başlat
          const workflows = await import('../../services/workflows');
          const availableWorkflows = await workflows.getWorkflows({ entity_type: 'risk' });
          
          if (availableWorkflows.data && availableWorkflows.data.length > 0) {
            // İlk uygun workflow'u kullan
            const workflow = availableWorkflows.data[0];
            await workflows.startWorkflow({
              entity_type: 'risk',
              entity_id: createdId,
              workflow_id: workflow.id
            });
          }
        } catch (workflowError) {
          console.warn('Workflow başlatılamadı:', workflowError);
          // Workflow hatası risk oluşturmayı engellemez
        }
      }
      
      navigate(`/risks/${createdId}`);
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

      <h1 className="text-3xl font-bold text-gray-900 mt-4 mb-6">Create Risk (Wizard)</h1>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <StepHeader current={step} />

        {step === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
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
                onChange={(e) => update("category", e.target.value)}
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Operational / Compliance / Technology"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Status *</label>
              <select
                value={form.status}
                onChange={(e) => update("status", e.target.value as RiskStatus)}
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {statusOptions.map((s) => (
                  <option key={s} value={s}>
                    {s.split("_").map((x) => x[0].toUpperCase() + x.slice(1)).join(" ")}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <AIGenerator
                  fieldType="description"
                  auditData={{
                    title: form.title || "Risk",
                    audit_type: "risk",
                    business_unit: form.category || "General",
                    scope: form.category || "",
                  }}
                  currentValue={form.description}
                  onGenerated={(content) => {
                    const text = Array.isArray(content) ? content.join("\n") : content;
                    update("description", text);
                  }}
                  className="ml-2"
                />
              </div>
              <textarea
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                rows={4}
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe the risk context, drivers, impact, etc."
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Probability (1-5)</label>
              <input
                type="number"
                min={1}
                max={5}
                value={form.probability ?? 3}
                onChange={(e) => update("probability", Number(e.target.value))}
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
                onChange={(e) => update("impact", Number(e.target.value))}
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Inherent Level</label>
              <select
                value={form.risk_level}
                onChange={(e) => update("risk_level", e.target.value as RiskLevel)}
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {levelOptions.map((l) => (
                  <option key={l} value={l}>
                    {l.charAt(0).toUpperCase() + l.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-3">
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
                    update("mitigation_strategy", text);
                  }}
                  className="ml-2"
                />
              </div>
              <textarea
                value={form.mitigation_strategy}
                onChange={(e) => update("mitigation_strategy", e.target.value)}
                rows={3}
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Outline planned or existing mitigation actions"
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Target Probability (1-5)</label>
              <input
                type="number"
                min={1}
                max={5}
                value={form.target_probability ?? ""}
                onChange={(e) => update("target_probability", e.target.value ? Number(e.target.value) : undefined)}
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
                onChange={(e) => update("target_impact", e.target.value ? Number(e.target.value) : undefined)}
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Target Date</label>
              <input
                type="date"
                value={form.target_date ?? ""}
                onChange={(e) => update("target_date", e.target.value || undefined)}
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        <div className="mt-6 flex items-center justify-between">
          <div />
          <div className="flex items-center gap-3">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep((s) => (Math.max(1, s - 1) as WizardStep))}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Back
              </button>
            )}
            {step < 3 ? (
              <button
                type="button"
                disabled={!canContinue}
                onClick={() => setStep((s) => (Math.min(3, s + 1) as WizardStep))}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void handleSubmit()}
                disabled={saving || !form.title || !form.category}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Saving..." : "Create Risk"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateRiskWizard;