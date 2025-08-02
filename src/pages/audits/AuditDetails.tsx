import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { motion } from "framer-motion";
import {
  FileText,
  ArrowLeft,
  Edit,
  Share,
  MoreVertical,
  Calendar,
  Clock,
  User,
  Users,
  Target,
  CheckCircle,
  AlertTriangle,
  Shield,
  Search,
  MessageSquare,
  Paperclip,
  Bot,
  PlayCircle,
  PauseCircle,
  StopCircle,
  Download,
  Eye,
  Plus,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { Comment, Control, Audit } from "../../types";
import type { Finding as DbFinding } from "../../services/findingsService";
import { auditService } from "../../services/auditService";
import findingsService from "../../services/findingsService";
import { toast } from "react-hot-toast";
import {
  formatDate,
  formatDateTime,
  getStatusColor,
  getSeverityColor,
  cn,
} from "../../utils";
import { formatUserName } from "../../utils/displayUtils";
import LoadingSpinner from "../../components/LoadingSpinner";
import WorkflowCenter from "../workflows/WorkflowCenter";

const AuditDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { checkPermission } = useAuthStore();
  const [audit, setAudit] = useState<Audit | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [newComment, setNewComment] = useState("");
  const [findings, setFindings] = useState<DbFinding[]>([]);
  
  // Narrow mockControls to include fields required by Control type to satisfy TS
  // Cast mock objects to Control to satisfy structural typing in this demo page.
  const mockControls = [
    {
      id: "ctrl-1",
      control_set_id: "00000000-0000-0000-0000-000000000000",
      audit_id: "00000000-0000-0000-0000-000000000000",
      control_code: "IT-001",
      code: "IT-001",
      title: "Password Policy Control",
      description:
        "Ensures strong password requirements are enforced across all systems",
      control_type: "preventive" as any,
      frequency: "continuous" as any,
      process_area: "Access Management",
      owner_id: "55555555-5555-5555-5555-555555555555" as any,
      testing_procedure:
        "Review password policy settings and test password creation process",
      evidence_requirements: "Password policy documentation; System configuration screenshots",
      effectiveness: "partially_effective" as any,
      last_tested_date: "2024-01-10",
      next_test_date: "2024-04-10",
      is_automated: false,
      is_deleted: false,
      ai_generated: false as any,
      created_by: "11111111-1111-1111-1111-111111111111" as any,
      created_at: "2023-12-01T00:00:00Z" as any,
      updated_at: "2024-01-10T14:30:00Z" as any
    } as unknown as Control,
    {
      id: "ctrl-2",
      control_set_id: "00000000-0000-0000-0000-000000000000",
      audit_id: "00000000-0000-0000-0000-000000000000",
      control_code: "IT-002",
      code: "IT-002",
      title: "Data Backup Verification",
      description: "Verification of data backup completeness and integrity",
      control_type: "detective" as any,
      frequency: "weekly" as any,
      process_area: "Data Management",
      owner_id: "55555555-5555-5555-5555-555555555555" as any,
      testing_procedure: "Test backup restoration and verify data integrity",
      evidence_requirements: "Backup logs; Restoration test results",
      effectiveness: "effective" as any,
      last_tested_date: "2024-01-12",
      next_test_date: "2024-04-12",
      is_automated: true,
      is_deleted: false,
      ai_generated: false as any,
      created_by: "11111111-1111-1111-1111-111111111111" as any,
      created_at: "2023-12-01T00:00:00Z" as any,
      updated_at: "2024-01-12T11:20:00Z" as any
    } as unknown as Control,
  ];

  const mockComments: Comment[] = [
    {
      id: "1",
      entity_type: "audit",
      entity_id: "1",
      user_id: "22222222-2222-2222-2222-222222222222",
      content:
        "Initial fieldwork has been completed. Moving to testing phase next week.",
      is_internal: true,
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z",
    },
    {
      id: "2",
      entity_type: "audit",
      entity_id: "1",
      user_id: "55555555-5555-5555-5555-555555555555",
      content:
        "Please prioritize the password policy finding as it poses significant security risk.",
      is_internal: true,
      created_at: "2024-01-16T14:20:00Z",
      updated_at: "2024-01-16T14:20:00Z",
    },
  ];

  useEffect(() => {
    const load = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const auditData = await auditService.getAudit(id);
        if (!auditData) {
          toast.error("Audit not found");
          navigate("/audits");
          return;
        }
        setAudit(auditData);

        // Load real findings for this audit
        const { items } = await findingsService.list({ auditId: id, orderBy: 'created_at' as any, orderDir: 'desc' });
        setFindings(items as DbFinding[]);
      } catch (error) {
        console.error("Error loading audit:", error);
        toast.error("Failed to load audit details");
        navigate("/audits");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, navigate]);

  const tabs = [
    { id: "overview", label: "Overview", icon: FileText },
    {
      id: "findings",
      label: "Findings",
      icon: Search,
      count: findings.length,
    },
    {
      id: "controls",
      label: "Controls",
      icon: Shield,
      count: mockControls.length,
    },
    { id: "timeline", label: "Timeline", icon: Clock },
    {
      id: "comments",
      label: "Comments",
      icon: MessageSquare,
      count: mockComments.length,
    },
    { id: "documents", label: "Documents", icon: Paperclip },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "in_progress":
        return <PlayCircle className="w-5 h-5 text-blue-500" />;
      case "planning":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case "cancelled":
        return <StopCircle className="w-5 h-5 text-red-500" />;
      default:
        return <PauseCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      // In real app, this would make an API call
      console.log("Adding comment:", newComment);
      setNewComment("");
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (!audit) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">
            Audit not found
          </h2>
          <p className="text-gray-600 mt-2">
            The audit you're looking for doesn't exist.
          </p>
          <button
            onClick={() => navigate("/audits")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Audits
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/audits")}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {audit.title}
                  </h1>
                  <div className="flex items-center space-x-4 mt-1">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(audit.status)}
                      <span
                        className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium",
                          getStatusColor(audit.status),
                        )}
                      >
                        {audit.status
                          .replace("_", " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {audit.audit_type.toUpperCase()} Audit
                    </span>
                    <span className="text-sm text-gray-500">
                      {formatDate(audit.start_date)} -{" "}
                      {formatDate(audit.end_date)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors">
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
              <button className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors">
                <Share className="w-4 h-4 mr-2" />
                Share
              </button>
              {checkPermission([
                "auditor",
                "supervisor_auditor",
                "admin",
                "super_admin",
              ]) && (
                <button
                  onClick={() => navigate(`/audits/${id}/edit`)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </button>
              )}
              <button className="p-2 text-gray-600 hover:text-gray-800 transition-colors">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6">
          <div className="flex space-x-8 border-b border-gray-200">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors",
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.count && (
                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6">
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Description
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {audit.description}
                </p>
              </div>

              {/* Objectives */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Target className="w-5 h-5 mr-2 text-blue-600" />
                  Objectives
                </h3>
                <ul className="space-y-3">
                  {audit.objectives.map((objective, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-gray-700">{objective}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Scope & Methodology */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Scope
                  </h3>
                  <p className="text-gray-700 leading-relaxed">{audit.scope}</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Methodology
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {audit.methodology}
                  </p>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Audit Details */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Audit Details
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type</span>
                    <span className="font-medium">
                      {audit.audit_type.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status</span>
                    <span
                      className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        getStatusColor(audit.status),
                      )}
                    >
                      {audit.status
                        .replace("_", " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration</span>
                    <span className="font-medium">
                      {formatDate(audit.start_date)} -{" "}
                      {formatDate(audit.end_date)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Planned Hours</span>
                    <span className="font-medium">{audit.planned_hours}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Actual Hours</span>
                    <span className="font-medium">
                      {audit.actual_hours || 0}h
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium">
                      {Math.round(
                        ((audit.actual_hours || 0) / audit.planned_hours) * 100,
                      )}
                      %
                    </span>
                  </div>
                </div>
              </div>

              {/* Team */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-blue-600" />
                  Audit Team
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {formatUserName(audit?.lead_auditor)}
                      </p>
                      <p className="text-sm text-gray-500">Lead Auditor</p>
                    </div>
                  </div>
                  {/* Team members would be loaded from audit.team_members if available */}
                  {audit?.team_members && audit.team_members.length > 0 ? (
                    <div className="text-sm text-gray-500">
                      Additional team members: {audit.team_members.length}{" "}
                      members
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">
                      No additional team members assigned
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Quick Stats
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {findings.length}
                    </div>
                    <div className="text-sm text-gray-600">Findings</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {mockControls.length}
                    </div>
                    <div className="text-sm text-gray-600">Controls</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {
                        findings.filter(
                          (f) =>
                            (f as any).severity === "high" || (f as any).severity === "critical" || f.risk_rating === "high" || f.risk_rating === "critical",
                        ).length
                      }
                    </div>
                    <div className="text-sm text-gray-600">High/Critical</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {
                        findings.filter((f) => (f as any).workflow_status === "remediated" || (f as any).status === "resolved").length
                      }
                    </div>
                    <div className="text-sm text-gray-600">Resolved/Remediated</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "findings" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Findings ({findings.length})
              </h2>
              {checkPermission([
                "auditor",
                "supervisor_auditor",
                "admin",
                "super_admin",
              ]) && (
                <button
                  onClick={() => navigate(`/findings/create`)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Finding
                </button>
              )}
            </div>

            <div className="grid gap-6">
              {findings.map((finding, index) => (
                <motion.div
                  key={finding.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4">
                      <div
                        className={cn(
                          "w-12 h-12 rounded-lg flex items-center justify-center",
                          ((finding as any).severity ?? finding.risk_rating) === "critical"
                            ? "bg-red-100"
                            : ((finding as any).severity ?? finding.risk_rating) === "high"
                              ? "bg-orange-100"
                              : ((finding as any).severity ?? finding.risk_rating) === "medium"
                                ? "bg-yellow-100"
                                : "bg-green-100",
                        )}
                      >
                        <AlertTriangle
                          className={cn(
                            "w-6 h-6",
                            ((finding as any).severity ?? finding.risk_rating) === "critical"
                              ? "text-red-600"
                              : ((finding as any).severity ?? finding.risk_rating) === "high"
                                ? "text-orange-600"
                                : ((finding as any).severity ?? finding.risk_rating) === "medium"
                                  ? "text-yellow-600"
                                  : "text-green-600",
                          )}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {finding.title}
                          </h3>
                          <span
                            className={cn(
                              "px-2 py-1 rounded-full text-xs font-medium",
                              getSeverityColor(((finding as any).severity ?? finding.risk_rating) as any),
                            )}
                          >
                            {(((finding as any).severity ?? finding.risk_rating) as string).toUpperCase()}
                          </span>
                          <span
                            className={cn(
                              "px-2 py-1 rounded-full text-xs font-medium",
                              getStatusColor(((finding as any).workflow_status ?? (finding as any).status) as any),
                            )}
                          >
                            {(((finding as any).workflow_status ?? (finding as any).status) as string).replace("_", " ").toUpperCase()}
                          </span>
                          {(finding as any).ai_generated && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              <Bot className="w-3 h-3 mr-1" />
                              AI
                            </span>
                          )}
                        </div>
                        <p className="text-gray-700 mb-4">
                          {finding.description}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-900">
                              Business Impact:
                            </span>
                            <p className="text-gray-600 mt-1">
                              {finding.business_impact}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">
                              Root Cause:
                            </span>
                            <p className="text-gray-600 mt-1">
                              {finding.root_cause}
                            </p>
                          </div>
                          <div className="md:col-span-2">
                            <span className="font-medium text-gray-900">
                              Recommendation:
                            </span>
                            <p className="text-gray-600 mt-1">
                              {finding.recommendation}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => navigate(`/findings/${finding.id}`)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        aria-label="View Finding"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => navigate(`/findings/${finding.id}/edit`)}
                        className="p-1 text-gray-400 hover:text-yellow-600 transition-colors"
                        aria-label="Edit Finding"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <User className="w-4 h-4" />
                        <span>Assigned to Sarah Wilson</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>Due {formatDate(((finding as any).remediation_due_date || (finding as any).due_date) || "")}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {((finding as any).evidence_files as string[] | undefined)?.map((file: string, i: number) => (
                        <button
                          key={i}
                          className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-700"
                        >
                          <Paperclip className="w-3 h-3" />
                          <span>{file}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "controls" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Controls ({mockControls.length})
              </h2>
              {checkPermission([
                "auditor",
                "supervisor_auditor",
                "admin",
                "super_admin",
              ]) && (
                <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Plus className="w-4 h-4 mr-2" />
                  Link Control
                </button>
              )}
            </div>

            <div className="grid gap-6">
              {mockControls.map((control, index) => (
                <motion.div
                  key={control.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Shield className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {control.title}
                          </h3>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {control.code}
                          </span>
                          <span
                            className={cn(
                              "px-2 py-1 rounded-full text-xs font-medium",
                              getStatusColor(control.effectiveness),
                            )}
                          >
                            {control.effectiveness
                              .replace("_", " ")
                              .toUpperCase()}
                          </span>
                          {control.automated && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <Bot className="w-3 h-3 mr-1" />
                              AUTO
                            </span>
                          )}
                        </div>
                        <p className="text-gray-700 mb-4">
                          {control.description}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-900">
                              Type:
                            </span>
                            <p className="text-gray-600 mt-1">
                              {control.control_type.replace("_", " ")}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">
                              Frequency:
                            </span>
                            <p className="text-gray-600 mt-1">
                              {control.frequency}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">
                              Process Area:
                            </span>
                            <p className="text-gray-600 mt-1">
                              {control.process_area}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">
                              Last Tested:
                            </span>
                            <p className="text-gray-600 mt-1">
                              {formatDate(control.last_tested_date || "")}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-yellow-600 transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <User className="w-4 h-4" />
                        <span>Owner: Sarah Wilson</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          Next Test: {formatDate(control.next_test_date || "")}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "comments" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Comments ({mockComments.length})
              </h2>
            </div>

            {/* Add Comment */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                        <Paperclip className="w-4 h-4" />
                      </button>
                    </div>
                    <button
                      onClick={handleAddComment}
                      disabled={!newComment.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Post Comment
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Comments List */}
            <div className="space-y-4">
              {mockComments.map((comment, index) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="font-medium text-gray-900">
                          {comment.user_id ===
                          "22222222-2222-2222-2222-222222222222"
                            ? "John Smith"
                            : "Sarah Wilson"}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatDateTime(comment.created_at)}
                        </span>
                        {comment.is_internal && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            Internal
                          </span>
                        )}
                      </div>
                      <p className="text-gray-700 leading-relaxed">
                        {comment.content}
                      </p>
                      {comment.attachments &&
                        comment.attachments.length > 0 && (
                          <div className="flex items-center space-x-2 mt-3">
                            {comment.attachments.map((attachment, i) => (
                              <button
                                key={i}
                                className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-700"
                              >
                                <Paperclip className="w-3 h-3" />
                                <span>{attachment}</span>
                              </button>
                            ))}
                          </div>
                        )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "timeline" && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Audit Timeline
            </h2>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-1">
                    <h3 className="font-medium text-gray-900">Audit Created</h3>
                    <span className="text-sm text-gray-500">
                      {formatDateTime(audit.created_at)}
                    </span>
                  </div>
                  <p className="text-gray-600">
                    Initial audit plan and scope defined
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <PlayCircle className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-1">
                    <h3 className="font-medium text-gray-900">
                      Fieldwork Started
                    </h3>
                    <span className="text-sm text-gray-500">
                      {formatDateTime(audit.start_date)}
                    </span>
                  </div>
                  <p className="text-gray-600">
                    Audit team began fieldwork activities
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-orange-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-1">
                    <h3 className="font-medium text-gray-900">
                      Findings Identified
                    </h3>
                    <span className="text-sm text-gray-500">Jan 10, 2024</span>
                  </div>
                  <p className="text-gray-600">
                    First finding identified and documented
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "documents" && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Documents</h2>
              <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Plus className="w-4 h-4 mr-2" />
                Upload Document
              </button>
            </div>
            <div className="text-center py-12">
              <Paperclip className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No documents uploaded
              </h3>
              <p className="text-gray-500">
                Upload audit-related documents and evidence files
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Workflow & Approval */}
      <div className="px-6 pb-10">
        {audit?.id ? <WorkflowCenter entityType="audit" entityId={audit.id} /> : null}
      </div>
    </div>
  );
};

export default AuditDetails;
