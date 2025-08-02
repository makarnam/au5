import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Layers,
  Calendar,
  ShieldCheck,
  Activity,
  Link as LinkIcon,
  PlusCircle,
  X as XIcon,
  Save,
} from "lucide-react";
import { toast } from "react-hot-toast";
import LoadingSpinner from "../../components/LoadingSpinner";
import riskService, {
  Risk,
  RiskAssessment,
  RiskIncident,
  RiskReview,
  RiskTreatment,
  RiskLevel,
} from "../../services/riskService";
import { useAuthStore } from "../../store/authStore";
import { cn } from "../../utils";

const levelColors: Record<RiskLevel, string> = {
  low: "text-green-700 bg-green-50 ring-1 ring-green-200",
  medium: "text-yellow-700 bg-yellow-50 ring-1 ring-yellow-200",
  high: "text-orange-700 bg-orange-50 ring-1 ring-orange-200",
  critical: "text-red-700 bg-red-50 ring-1 ring-red-200",
};

const SectionCard: React.FC<{ title: string; children: React.ReactNode; action?: React.ReactNode }> = ({
  title,
  children,
  action,
}) => (
  <div className="bg-white border border-gray-200 rounded-lg">
    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      {action}
    </div>
    <div className="p-4">{children}</div>
  </div>
);

type RiskDetailModalProps = {
  title: string;
  open: boolean;
  onClose: () => void;
  onSubmit: () => Promise<void> | void;
  submitLabel?: string;
  children: React.ReactNode;
  disabled?: boolean;
};

const RiskDetailModal: React.FC<RiskDetailModalProps> = ({
  title,
  open,
  onClose,
  onSubmit,
  submitLabel = "Save",
  children,
  disabled,
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white w-full max-w-2xl rounded-lg border border-gray-200 shadow-xl">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <XIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4">{children}</div>
        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            disabled={!!disabled}
            onClick={() => void onSubmit()}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
          >
            <Save className="w-4 h-4 mr-2" />
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

const RiskDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { checkPermission } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [risk, setRisk] = useState<Risk | null>(null);
  const [assessments, setAssessments] = useState<RiskAssessment[]>([]);
  const [treatments, setTreatments] = useState<RiskTreatment[]>([]);
  const [incidents, setIncidents] = useState<RiskIncident[]>([]);
  const [reviews, setReviews] = useState<RiskReview[]>([]);
  const canEdit = checkPermission(["auditor", "supervisor_auditor", "admin", "super_admin"]);

  // Modals state and form values
  const [treatmentOpen, setTreatmentOpen] = useState(false);
  const [treatmentSaving, setTreatmentSaving] = useState(false);
  const [treatmentForm, setTreatmentForm] = useState<Partial<RiskTreatment>>({
    title: "",
    description: "",
    treatment_type: "mitigate",
    status: "planned",
    priority: "medium",
    target_date: "",
    currency: "USD",
  } as any);

  const [assessmentOpen, setAssessmentOpen] = useState(false);
  const [assessmentSaving, setAssessmentSaving] = useState(false);
  const [assessmentForm, setAssessmentForm] = useState<Partial<RiskAssessment>>({
    assessment_type: "periodic",
    assessment_date: new Date().toISOString().slice(0, 10),
    probability: 3,
    impact: 3,
    risk_score: 9,
    risk_level: "medium",
    confidence_level: "medium",
  } as any);

  const [incidentOpen, setIncidentOpen] = useState(false);
  const [incidentSaving, setIncidentSaving] = useState(false);
  const [incidentForm, setIncidentForm] = useState<Partial<RiskIncident>>({
    incident_title: "",
    incident_description: "",
    incident_date: new Date().toISOString().slice(0, 10),
    severity: "medium",
    status: "open",
    currency: "USD",
  } as any);

  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewSaving, setReviewSaving] = useState(false);
  const [reviewForm, setReviewForm] = useState<Partial<RiskReview>>({
    review_type: "periodic",
    review_date: new Date().toISOString().slice(0, 10),
    review_outcome: "no_change",
  } as any);

  const [linkControlOpen, setLinkControlOpen] = useState(false);
  const [linking, setLinking] = useState(false);
  const [controlId, setControlId] = useState<string>("");

  useEffect(() => {
    const load = async () => {
      try {
        if (!id) {
          toast.error("Invalid risk id");
          navigate("/risks");
          return;
        }
        setLoading(true);
        const [r, a, t, i, v] = await Promise.all([
          riskService.getRisk(id),
          riskService.getAssessments(id),
          riskService.getTreatments(id),
          riskService.getIncidents(id),
          riskService.getReviews(id),
        ]);
        if (!r) {
          toast.error("Risk not found");
          navigate("/risks");
          return;
        }
        setRisk(r);
        setAssessments(a);
        setTreatments(t);
        setIncidents(i);
        setReviews(v);
      } catch (err: any) {
        console.error(err);
        toast.error(err?.message || "Failed to load risk details");
        navigate("/risks");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, navigate]);

  const statusLabel = useMemo(
    () =>
      risk?.status
        ? risk.status
            .split("_")
            .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
            .join(" ")
        : "",
    [risk?.status],
  );

  // Submit handlers
  const submitTreatment = async () => {
    if (!risk) return;
    if (!treatmentForm.title || !treatmentForm.description) {
      toast.error("Title and Description are required");
      return;
    }
    try {
      setTreatmentSaving(true);
      await riskService.addTreatment(risk.id, {
        ...(treatmentForm as any),
        risk_id: risk.id,
      });
      const t = await riskService.getTreatments(risk.id);
      setTreatments(t);
      setTreatmentOpen(false);
      setTreatmentForm({
        title: "",
        description: "",
        treatment_type: "mitigate",
        status: "planned",
        priority: "medium",
        target_date: "",
        currency: "USD",
      } as any);
      toast.success("Treatment added");
    } catch (e: any) {
      toast.error(e?.message || "Failed to add treatment");
    } finally {
      setTreatmentSaving(false);
    }
  };

  const submitAssessment = async () => {
    if (!risk) return;
    try {
      setAssessmentSaving(true);
      await riskService.addAssessment(risk.id, {
        ...(assessmentForm as any),
        risk_id: risk.id,
      });
      const a = await riskService.getAssessments(risk.id);
      setAssessments(a);
      setAssessmentOpen(false);
      setAssessmentForm({
        assessment_type: "periodic",
        assessment_date: new Date().toISOString().slice(0, 10),
        probability: 3,
        impact: 3,
        risk_score: 9,
        risk_level: "medium",
        confidence_level: "medium",
      } as any);
      toast.success("Assessment added");
    } catch (e: any) {
      toast.error(e?.message || "Failed to add assessment");
    } finally {
      setAssessmentSaving(false);
    }
  };

  const submitIncident = async () => {
    if (!risk) return;
    if (!incidentForm.incident_title || !incidentForm.incident_description) {
      toast.error("Title and Description are required");
      return;
    }
    try {
      setIncidentSaving(true);
      await riskService.addIncident(risk.id, {
        ...(incidentForm as any),
        risk_id: risk.id,
      });
      const i = await riskService.getIncidents(risk.id);
      setIncidents(i);
      setIncidentOpen(false);
      setIncidentForm({
        incident_title: "",
        incident_description: "",
        incident_date: new Date().toISOString().slice(0, 10),
        severity: "medium",
        status: "open",
        currency: "USD",
      } as any);
      toast.success("Incident added");
    } catch (e: any) {
      toast.error(e?.message || "Failed to add incident");
    } finally {
      setIncidentSaving(false);
    }
  };

  const submitReview = async () => {
    if (!risk) return;
    try {
      setReviewSaving(true);
      // Ensure reviewer_id (NOT NULL) is set to current user
      const { supabase } = await import("../../lib/supabase");
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error("User not authenticated");
      }

      await riskService.addReview(risk.id, {
        ...(reviewForm as any),
        risk_id: risk.id,
        reviewer_id: user.id,
      });
      const v = await riskService.getReviews(risk.id);
      setReviews(v);
      setReviewOpen(false);
      setReviewForm({
        review_type: "periodic",
        review_date: new Date().toISOString().slice(0, 10),
        review_outcome: "no_change",
      } as any);
      toast.success("Review added");
    } catch (e: any) {
      toast.error(e?.message || "Failed to add review");
    } finally {
      setReviewSaving(false);
    }
  };

  const submitLinkControl = async () => {
    if (!risk) return;
    if (!controlId) {
      toast.error("Enter a valid Control ID");
      return;
    }
    try {
      setLinking(true);
      await riskService.linkControl(risk.id, controlId);
      setLinkControlOpen(false);
      setControlId("");
      toast.success("Control linked");
    } catch (e: any) {
      toast.error(e?.message || "Failed to link control");
    } finally {
      setLinking(false);
    }
  };

  if (loading || !risk) {
    return (
      <div className="p-6">
        <LoadingSpinner size="lg" text="Loading risk..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <button
            className="inline-flex items-center text-sm text-gray-600 hover:text-blue-600"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{risk.title}</h1>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                levelColors[risk.risk_level],
              )}
            >
              {risk.risk_level.toUpperCase()}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              {statusLabel}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 ring-1 ring-blue-200">
              <Layers className="w-3 h-3 mr-1" />
              {risk.category || "Uncategorized"}
            </span>
            {risk.risk_source && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-violet-50 text-violet-700 ring-1 ring-violet-200">
                Source: {risk.risk_source}
              </span>
            )}
          </div>
        </div>

        {canEdit && (
          <button
            onClick={() => navigate(`/risks/${risk.id}/edit`)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </button>
        )}
      </div>

      {/* Top Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center text-gray-900">
            <Activity className="w-5 h-5 text-sky-600 mr-2" />
            Scores
          </div>
          <div className="mt-3 text-sm">
            <div>Inherent: {risk.inherent_risk_score ?? "-"}</div>
            <div>Residual: {risk.residual_risk_score ?? "-"}</div>
            <div className="text-gray-500">
              Target: {risk.target_risk_score ?? "-"} (P{risk.target_probability ?? "-"}×I
              {risk.target_impact ?? "-"})
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center text-gray-900">
            <Calendar className="w-5 h-5 text-amber-600 mr-2" />
            Timeline
          </div>
          <div className="mt-3 text-sm">
            <div>Next Review: {risk.next_review_date ?? "-"}</div>
            <div>Target Date: {risk.target_date ?? "-"}</div>
            <div className="text-gray-500">Last Review: {risk.last_review_date ?? "-"}</div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center text-gray-900">
            <ShieldCheck className="w-5 h-5 text-emerald-600 mr-2" />
            Trends
          </div>
          <div className="mt-3 text-sm">
            <div>Likelihood: {risk.likelihood_trend ?? "-"}</div>
            <div>Impact: {risk.impact_trend ?? "-"}</div>
            <div className="text-gray-500">Review Freq: {risk.review_frequency ?? "-"}</div>
          </div>
        </div>
      </div>

      {/* Description & Mitigation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SectionCard title="Description">
          {risk.description ? (
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{risk.description}</p>
          ) : (
            <p className="text-sm text-gray-500">No description provided.</p>
          )}
        </SectionCard>

        <SectionCard title="Mitigation Strategy">
          {risk.mitigation_strategy ? (
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{risk.mitigation_strategy}</p>
          ) : (
            <p className="text-sm text-gray-500">No mitigation strategy recorded.</p>
          )}
        </SectionCard>
      </div>

      {/* Treatments */}
      <SectionCard
        title="Treatments"
        action={
          canEdit && (
            <button
              onClick={() => setTreatmentOpen(true)}
              className="inline-flex items-center px-2 py-1 text-sm text-blue-600 hover:text-blue-700"
            >
              <PlusCircle className="w-4 h-4 mr-1" />
              Add
            </button>
          )
        }
      >
        {treatments.length === 0 ? (
          <p className="text-sm text-gray-500">No treatments recorded.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="py-2 pr-3">Title</th>
                  <th className="py-2 pr-3">Type</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3">Target</th>
                </tr>
              </thead>
              <tbody>
                {treatments.map((t) => (
                  <tr key={t.id} className="border-b last:border-0">
                    <td className="py-2 pr-3">{t.title}</td>
                    <td className="py-2 pr-3 capitalize">{t.treatment_type}</td>
                    <td className="py-2 pr-3 capitalize">{t.status.replace("_", " ")}</td>
                    <td className="py-2 pr-3">{t.target_date ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {/* Assessments */}
      <SectionCard
        title="Assessments"
        action={
          canEdit && (
            <button
              onClick={() => setAssessmentOpen(true)}
              className="inline-flex items-center px-2 py-1 text-sm text-blue-600 hover:text-blue-700"
            >
              <PlusCircle className="w-4 h-4 mr-1" />
              Add
            </button>
          )
        }
      >
        {assessments.length === 0 ? (
          <p className="text-sm text-gray-500">No assessments recorded.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="py-2 pr-3">Date</th>
                  <th className="py-2 pr-3">Type</th>
                  <th className="py-2 pr-3">Score</th>
                  <th className="py-2 pr-3">Level</th>
                </tr>
              </thead>
              <tbody>
                {assessments.map((a) => (
                  <tr key={a.id} className="border-b last:border-0">
                    <td className="py-2 pr-3">{a.assessment_date}</td>
                    <td className="py-2 pr-3 capitalize">
                      {a.assessment_type.replace("_", " ")}
                    </td>
                    <td className="py-2 pr-3">{a.risk_score}</td>
                    <td className="py-2 pr-3 capitalize">{a.risk_level}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {/* Incidents */}
      <SectionCard
        title="Incidents"
        action={
          canEdit && (
            <button
              onClick={() => setIncidentOpen(true)}
              className="inline-flex items-center px-2 py-1 text-sm text-blue-600 hover:text-blue-700"
            >
              <PlusCircle className="w-4 h-4 mr-1" />
              Add
            </button>
          )
        }
      >
        {incidents.length === 0 ? (
          <p className="text-sm text-gray-500">No risk incidents recorded.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="py-2 pr-3">Date</th>
                  <th className="py-2 pr-3">Title</th>
                  <th className="py-2 pr-3">Severity</th>
                  <th className="py-2 pr-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {incidents.map((i) => (
                  <tr key={i.id} className="border-b last:border-0">
                    <td className="py-2 pr-3">{i.incident_date}</td>
                    <td className="py-2 pr-3">{i.incident_title}</td>
                    <td className="py-2 pr-3 capitalize">{i.severity}</td>
                    <td className="py-2 pr-3 capitalize">{i.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {/* Reviews */}
      <SectionCard
        title="Reviews"
        action={
          canEdit && (
            <button
              onClick={() => setReviewOpen(true)}
              className="inline-flex items-center px-2 py-1 text-sm text-blue-600 hover:text-blue-700"
            >
              <PlusCircle className="w-4 h-4 mr-1" />
              Add
            </button>
          )
        }
      >
        {reviews.length === 0 ? (
          <p className="text-sm text-gray-500">No periodic reviews recorded.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="py-2 pr-3">Date</th>
                  <th className="py-2 pr-3">Type</th>
                  <th className="py-2 pr-3">Outcome</th>
                  <th className="py-2 pr-3">Next Review</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((r) => (
                  <tr key={r.id} className="border-b last:border-0">
                    <td className="py-2 pr-3">{r.review_date}</td>
                    <td className="py-2 pr-3 capitalize">{r.review_type.replace("_", " ")}</td>
                    <td className="py-2 pr-3 capitalize">{r.review_outcome.replace("_", " ")}</td>
                    <td className="py-2 pr-3">{r.next_review_date ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {/* Links */}
      <SectionCard
        title="Linked Controls"
        action={
          canEdit && (
            <button
              onClick={() => setLinkControlOpen(true)}
              className="inline-flex items-center px-2 py-1 text-sm text-blue-600 hover:text-blue-700"
            >
              <LinkIcon className="w-4 h-4 mr-1" />
              Link Control
            </button>
          )
        }
      >
        <p className="text-sm text-gray-500">
          Display controls linked to this risk (via risk_controls). Linking modal available.
        </p>
      </SectionCard>

      {/* Modals */}
      <RiskDetailModal
        title="Add Treatment"
        open={treatmentOpen}
        onClose={() => setTreatmentOpen(false)}
        onSubmit={submitTreatment}
        submitLabel={treatmentSaving ? "Saving..." : "Save"}
        disabled={treatmentSaving}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-700">Title *</label>
            <input
              className="mt-1 w-full border rounded-lg px-3 py-2"
              value={treatmentForm.title || ""}
              onChange={(e) => setTreatmentForm((f) => ({ ...f, title: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700">Type</label>
            <select
              className="mt-1 w-full border rounded-lg px-3 py-2"
              value={(treatmentForm as any).treatment_type || "mitigate"}
              onChange={(e) =>
                setTreatmentForm((f) => ({ ...f, treatment_type: e.target.value as any }))
              }
            >
              <option value="mitigate">Mitigate</option>
              <option value="accept">Accept</option>
              <option value="transfer">Transfer</option>
              <option value="avoid">Avoid</option>
              <option value="monitor">Monitor</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm text-gray-700">Description *</label>
            <textarea
              className="mt-1 w-full border rounded-lg px-3 py-2"
              rows={3}
              value={treatmentForm.description || ""}
              onChange={(e) =>
                setTreatmentForm((f) => ({ ...f, description: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700">Status</label>
            <select
              className="mt-1 w-full border rounded-lg px-3 py-2"
              value={(treatmentForm as any).status || "planned"}
              onChange={(e) => setTreatmentForm((f) => ({ ...f, status: e.target.value as any }))}
            >
              <option value="planned">Planned</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="on_hold">On Hold</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-700">Priority</label>
            <select
              className="mt-1 w-full border rounded-lg px-3 py-2"
              value={(treatmentForm as any).priority || "medium"}
              onChange={(e) => setTreatmentForm((f) => ({ ...f, priority: e.target.value as any }))}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-700">Target Date</label>
            <input
              type="date"
              className="mt-1 w-full border rounded-lg px-3 py-2"
              value={(treatmentForm as any).target_date || ""}
              onChange={(e) => setTreatmentForm((f) => ({ ...f, target_date: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700">Cost</label>
            <input
              type="number"
              className="mt-1 w-full border rounded-lg px-3 py-2"
              value={(treatmentForm as any).cost_estimate || ""}
              onChange={(e) =>
                setTreatmentForm((f) => ({
                  ...f,
                  cost_estimate: e.target.value ? Number(e.target.value) : undefined,
                }))
              }
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700">Currency</label>
            <input
              className="mt-1 w-full border rounded-lg px-3 py-2"
              value={(treatmentForm as any).currency || "USD"}
              onChange={(e) => setTreatmentForm((f) => ({ ...f, currency: e.target.value }))}
            />
          </div>
        </div>
      </RiskDetailModal>

      <RiskDetailModal
        title="Add Assessment"
        open={assessmentOpen}
        onClose={() => setAssessmentOpen(false)}
        onSubmit={submitAssessment}
        submitLabel={assessmentSaving ? "Saving..." : "Save"}
        disabled={assessmentSaving}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-700">Date</label>
            <input
              type="date"
              className="mt-1 w-full border rounded-lg px-3 py-2"
              value={(assessmentForm as any).assessment_date || ""}
              onChange={(e) =>
                setAssessmentForm((f) => ({ ...f, assessment_date: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700">Type</label>
            <select
              className="mt-1 w-full border rounded-lg px-3 py-2"
              value={(assessmentForm as any).assessment_type || "periodic"}
              onChange={(e) =>
                setAssessmentForm((f) => ({ ...f, assessment_type: e.target.value as any }))
              }
            >
              <option value="initial">Initial</option>
              <option value="periodic">Periodic</option>
              <option value="triggered">Triggered</option>
              <option value="ad_hoc">Ad hoc</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-700">Probability</label>
            <input
              type="number"
              min={1}
              max={5}
              className="mt-1 w-full border rounded-lg px-3 py-2"
              value={(assessmentForm as any).probability ?? 3}
              onChange={(e) =>
                setAssessmentForm((f) => ({ ...f, probability: Number(e.target.value) }))
              }
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700">Impact</label>
            <input
              type="number"
              min={1}
              max={5}
              className="mt-1 w-full border rounded-lg px-3 py-2"
              value={(assessmentForm as any).impact ?? 3}
              onChange={(e) =>
                setAssessmentForm((f) => ({ ...f, impact: Number(e.target.value) }))
              }
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700">Score</label>
            <input
              type="number"
              className="mt-1 w-full border rounded-lg px-3 py-2"
              value={(assessmentForm as any).risk_score ?? 9}
              onChange={(e) =>
                setAssessmentForm((f) => ({ ...f, risk_score: Number(e.target.value) }))
              }
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700">Level</label>
            <select
              className="mt-1 w-full border rounded-lg px-3 py-2"
              value={(assessmentForm as any).risk_level || "medium"}
              onChange={(e) =>
                setAssessmentForm((f) => ({ ...f, risk_level: e.target.value as any }))
              }
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm text-gray-700">Notes</label>
            <textarea
              className="mt-1 w-full border rounded-lg px-3 py-2"
              rows={3}
              value={(assessmentForm as any).assessment_notes || ""}
              onChange={(e) =>
                setAssessmentForm((f) => ({ ...f, assessment_notes: e.target.value }))
              }
            />
          </div>
        </div>
      </RiskDetailModal>

      <RiskDetailModal
        title="Add Incident"
        open={incidentOpen}
        onClose={() => setIncidentOpen(false)}
        onSubmit={submitIncident}
        submitLabel={incidentSaving ? "Saving..." : "Save"}
        disabled={incidentSaving}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-700">Title *</label>
            <input
              className="mt-1 w-full border rounded-lg px-3 py-2"
              value={(incidentForm as any).incident_title || ""}
              onChange={(e) =>
                setIncidentForm((f) => ({ ...f, incident_title: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700">Date</label>
            <input
              type="date"
              className="mt-1 w-full border rounded-lg px-3 py-2"
              value={(incidentForm as any).incident_date || ""}
              onChange={(e) =>
                setIncidentForm((f) => ({ ...f, incident_date: e.target.value }))
              }
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm text-gray-700">Description *</label>
            <textarea
              className="mt-1 w-full border rounded-lg px-3 py-2"
              rows={3}
              value={(incidentForm as any).incident_description || ""}
              onChange={(e) =>
                setIncidentForm((f) => ({ ...f, incident_description: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700">Severity</label>
            <select
              className="mt-1 w-full border rounded-lg px-3 py-2"
              value={(incidentForm as any).severity || "medium"}
              onChange={(e) =>
                setIncidentForm((f) => ({ ...f, severity: e.target.value as any }))
              }
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-700">Status</label>
            <select
              className="mt-1 w-full border rounded-lg px-3 py-2"
              value={(incidentForm as any).status || "open"}
              onChange={(e) =>
                setIncidentForm((f) => ({ ...f, status: e.target.value as any }))
              }
            >
              <option value="open">Open</option>
              <option value="investigating">Investigating</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-700">Financial Impact</label>
            <input
              type="number"
              className="mt-1 w-full border rounded-lg px-3 py-2"
              value={(incidentForm as any).financial_impact || ""}
              onChange={(e) =>
                setIncidentForm((f) => ({
                  ...f,
                  financial_impact: e.target.value ? Number(e.target.value) : undefined,
                }))
              }
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700">Currency</label>
            <input
              className="mt-1 w-full border rounded-lg px-3 py-2"
              value={(incidentForm as any).currency || "USD"}
              onChange={(e) => setIncidentForm((f) => ({ ...f, currency: e.target.value }))}
            />
          </div>
        </div>
      </RiskDetailModal>

      <RiskDetailModal
        title="Add Review"
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        onSubmit={submitReview}
        submitLabel={reviewSaving ? "Saving..." : "Save"}
        disabled={reviewSaving}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-700">Date</label>
            <input
              type="date"
              className="mt-1 w-full border rounded-lg px-3 py-2"
              value={(reviewForm as any).review_date || ""}
              onChange={(e) => setReviewForm((f) => ({ ...f, review_date: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700">Type</label>
            <select
              className="mt-1 w-full border rounded-lg px-3 py-2"
              value={(reviewForm as any).review_type || "periodic"}
              onChange={(e) =>
                setReviewForm((f) => ({ ...f, review_type: e.target.value as any }))
              }
            >
              <option value="periodic">Periodic</option>
              <option value="triggered">Triggered</option>
              <option value="incident_based">Incident Based</option>
              <option value="audit_based">Audit Based</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-700">Outcome</label>
            <select
              className="mt-1 w-full border rounded-lg px-3 py-2"
              value={(reviewForm as any).review_outcome || "no_change"}
              onChange={(e) =>
                setReviewForm((f) => ({ ...f, review_outcome: e.target.value as any }))
              }
            >
              <option value="no_change">No Change</option>
              <option value="updated">Updated</option>
              <option value="escalated">Escalated</option>
              <option value="closed">Closed</option>
              <option value="transferred">Transferred</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm text-gray-700">Notes</label>
            <textarea
              className="mt-1 w-full border rounded-lg px-3 py-2"
              rows={3}
              value={(reviewForm as any).review_notes || ""}
              onChange={(e) => setReviewForm((f) => ({ ...f, review_notes: e.target.value }))}
            />
          </div>
        </div>
      </RiskDetailModal>

      <RiskDetailModal
        title="Link Control"
        open={linkControlOpen}
        onClose={() => setLinkControlOpen(false)}
        onSubmit={submitLinkControl}
        submitLabel={linking ? "Linking..." : "Link"}
        disabled={linking}
      >
        <div className="grid grid-cols-1 gap-3">
          <div>
            <label className="block text-sm text-gray-700">Control ID (UUID)</label>
            <input
              className="mt-1 w-full border rounded-lg px-3 py-2"
              value={controlId}
              onChange={(e) => setControlId(e.target.value)}
              placeholder="Paste an existing Control ID"
            />
          </div>
        </div>
      </RiskDetailModal>
    </div>
  );
};

export default RiskDetails;
