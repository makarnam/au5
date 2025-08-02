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
              onClick={() =>
                toast("Implement add-treatment modal in a follow-up (API already ready).", {
                  icon: "🛠️",
                })
              }
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
              onClick={() =>
                toast("Implement add-assessment modal in a follow-up (API already ready).", {
                  icon: "🛠️",
                })
              }
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
                    <td className="py-2 pr-3 capitalize">{a.assessment_type.replace("_", " ")}</td>
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
              onClick={() =>
                toast("Implement add-incident modal in a follow-up (API already ready).", {
                  icon: "🛠️",
                })
              }
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
              onClick={() =>
                toast("Implement add-review modal in a follow-up (API already ready).", {
                  icon: "🛠️",
                })
              }
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
      <SectionCard title="Linked Controls" action={
        canEdit && (
          <button
            onClick={() =>
              toast("Implement control linking in a follow-up (API already ready).", { icon: "🛠️" })
            }
            className="inline-flex items-center px-2 py-1 text-sm text-blue-600 hover:text-blue-700"
          >
            <LinkIcon className="w-4 h-4 mr-1" />
            Link Control
          </button>
        )
      }>
        <p className="text-sm text-gray-500">
          Display controls linked to this risk (via risk_controls). Implement in follow-up.
        </p>
      </SectionCard>
    </div>
  );
};

export default RiskDetails;
