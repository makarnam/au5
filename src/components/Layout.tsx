import React, { useState, useMemo, useCallback } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  BarChart3,
  FileText,
  Shield,
  AlertTriangle,
  Search,
  Users,
  Settings,
  User,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronDown,
  Bot,
  Workflow,
  Home,
  BookOpen,
  Building2,
  GraduationCap,
  HardDrive,
  Network,
  Globe,
} from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { getUserRoleLabel, getRoleColor } from "../utils";
import { motion, AnimatePresence } from "framer-motion";
import ErrorBoundary from "./common/ErrorBoundary";
import NotificationBell from "./notifications/NotificationBell";
import ComposeNotificationModal from "./notifications/ComposeNotificationModal";
import EnhancedSidebar from "./EnhancedSidebar";
import LanguageSelector from "./LanguageSelector";

const Layout: React.FC = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut, checkPermission } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);
  const [useEnhancedSidebar, setUseEnhancedSidebar] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Memoize navigation array to prevent unnecessary re-renders
  const navigation = useMemo(() => [
    {
      name: t("navigation.dashboard"),
      href: "/",
      icon: Home,
      current:
        location.pathname === "/" ||
        location.pathname === "/dashboard",
      roles: [
        "viewer",
        "business_unit_user",
        "business_unit_manager",
        "auditor",
        "reviewer",
        "supervisor_auditor",
        "cro",
        "admin",
        "super_admin",
      ],
    },
    {
      name: t("navigation.audits"),
      href: "/audits",
      icon: FileText,
      current: location.pathname.startsWith("/audits"),
      roles: [
        "auditor",
        "reviewer",
        "supervisor_auditor",
        "cro",
        "admin",
        "super_admin",
      ],
      children: [
        {
          name: t("navigation.allAudits"),
          href: "/audits",
          current: location.pathname === "/audits",
        },
        {
          name: t("navigation.createAudit"),
          href: "/audits/create",
          current: location.pathname === "/audits/create",
        },
        {
          name: t("navigation.upcomingSchedules"),
          href: "/audits/schedules",
          current: location.pathname === "/audits/schedules",
        },
      ],
    },
    {
      name: t("navigation.controls"),
      href: "/controls",
      icon: Shield,
      current: location.pathname.startsWith("/controls"),
      roles: [
        "auditor",
        "reviewer",
        "supervisor_auditor",
        "cro",
        "admin",
        "super_admin",
      ],
    },
    {
      name: t("navigation.auditPlanning"),
      href: "/audit-planning",
      icon: BarChart3,
      current: location.pathname.startsWith("/audit-planning"),
      roles: [
        "auditor",
        "reviewer",
        "supervisor_auditor",
        "cro",
        "admin",
        "super_admin",
      ],
      children: [
        {
          name: t("navigation.dashboard"),
          href: "/audit-planning",
          current: location.pathname === "/audit-planning",
        },
        {
          name: t("navigation.auditUniverse"),
          href: "/audit-planning/universe",
          current: location.pathname === "/audit-planning/universe",
        },
        {
          name: t("navigation.auditPlans"),
          href: "/audit-planning/plans",
          current: location.pathname === "/audit-planning/plans",
        },
        {
          name: t("navigation.resourceManagement"),
          href: "/audit-planning/resources",
          current: location.pathname === "/audit-planning/resources",
        },
        {
          name: t("navigation.competencies"),
          href: "/audit-planning/competencies",
          current: location.pathname === "/audit-planning/competencies",
        },
        {
          name: t("navigation.trainingNeeds"),
          href: "/audit-planning/training",
          current: location.pathname === "/audit-planning/training",
        },
      ],
    },
    {
      name: t("navigation.risks"),
      href: "/risks",
      icon: AlertTriangle,
      current: location.pathname.startsWith("/risks"),
      roles: [
        "business_unit_manager",
        "auditor",
        "reviewer",
        "supervisor_auditor",
        "cro",
        "admin",
        "super_admin",
      ],
      children: [
        {
          name: t("navigation.allRisks") || "All Risks",
          href: "/risks",
          current: location.pathname === "/risks",
        },
        {
          name: t("navigation.dashboard"),
          href: "/risks/dashboard",
          current: location.pathname === "/risks/dashboard",
        },
        {
          name: t("navigation.secondDashboard") || "Second Dashboard",
          href: "/risks/dashboard-2",
          current: location.pathname === "/risks/dashboard-2",
        },
        {
          name: t("navigation.lossEventManagement") || "Loss Event Management",
          href: "/risks/loss-events",
          current: location.pathname === "/risks/loss-events",
        },
        {
          name: t("navigation.keyIndicatorManagement") || "Key Indicator Management",
          href: "/risks/key-indicators",
          current: location.pathname === "/risks/key-indicators",
        },
        {
          name: t("navigation.operationalRiskManagement") || "Operational Risk Management",
          href: "/risks/operational-risk",
          current: location.pathname === "/risks/operational-risk",
        },
        {
          name: t("common.create"),
          href: "/risks/create",
          current: location.pathname === "/risks/create",
        }
      ]
    },
    {
      name: t("navigation.resilienceManagement"),
      href: "/resilience",
      icon: Shield,
      current: location.pathname.startsWith("/resilience"),
      roles: [
        "business_unit_manager",
        "auditor",
        "reviewer",
        "supervisor_auditor",
        "cro",
        "admin",
        "super_admin",
      ],
      children: [
        {
          name: t("navigation.dashboard"),
          href: "/resilience",
          current: location.pathname === "/resilience",
        },
        {
          name: t("navigation.incidentManagement"),
          href: "/resilience/incidents",
          current: location.pathname === "/resilience/incidents",
        },
        {
          name: t("navigation.businessImpactAnalysis"),
          href: "/resilience/bia",
          current: location.pathname.startsWith("/resilience/bia"),
        },
        {
          name: t("navigation.crisisManagement"),
          href: "/resilience/crisis",
          current: location.pathname === "/resilience/crisis",
        },
        {
          name: t("navigation.scenarioAnalysis"),
          href: "/resilience/scenarios",
          current: location.pathname === "/resilience/scenarios",
        },
        {
          name: t("navigation.metricsDashboard"),
          href: "/resilience/metrics",
          current: location.pathname === "/resilience/metrics",
        }
      ]
    },
    {
      name: t("navigation.findings"),
      href: "/findings",
      icon: Search,
      current: location.pathname.startsWith("/findings"),
      roles: [
        "auditor",
        "reviewer",
        "supervisor_auditor",
        "cro",
        "admin",
        "super_admin",
      ],
      children: [
        { name: t("navigation.allFindings"), href: "/findings", current: location.pathname === "/findings" },
        { name: t("navigation.dashboard"), href: "/findings/dashboard", current: location.pathname === "/findings/dashboard" },
        { name: t("common.create"), href: "/findings/create", current: location.pathname === "/findings/create" },
      ],
    },
    {
      name: t("navigation.workflow"),
      href: "/workflows",
      icon: Workflow,
      current: location.pathname.startsWith("/workflows"),
      roles: ["cro", "admin", "super_admin"],
      children: [
        {
          name: t("navigation.workflowTemplates"),
          href: "/workflows/templates",
          current: location.pathname === "/workflows/templates",
        },
        {
          name: t("navigation.approvalInbox"),
          href: "/workflows/approvals",
          current: location.pathname === "/workflows/approvals",
        },
      ],
    },
    {
      name: t("navigation.entityRelationships"),
      href: "/relationships",
      icon: Network,
      current: location.pathname.startsWith("/relationships"),
      roles: [
        "auditor",
        "reviewer",
        "supervisor_auditor",
        "cro",
        "admin",
        "super_admin",
      ],
    },
    {
      name: t("navigation.aiAssistant"),
      // Align with existing AI Assistant page route in the app
      href: "/ai",
      icon: Bot,
      current:
        location.pathname === "/ai" ||
        location.pathname.startsWith("/ai/"),
      roles: [
        "auditor",
        "reviewer",
        "supervisor_auditor",
        "cro",
        "admin",
        "super_admin",
      ],
      // Provide a simple fallback navigate if route exists but page renders empty due to stale state
      onClick: () => navigate("/ai"),
    },
    {
      name: t("navigation.aiGovernance"),
      href: "/ai-governance",
      icon: Bot,
      current: location.pathname.startsWith("/ai-governance"),
      roles: [
        "auditor",
        "reviewer",
        "supervisor_auditor",
        "cro",
        "admin",
        "super_admin",
      ],
      children: [
        {
          name: t("navigation.dashboard"),
          href: "/ai-governance/dashboard",
          current: location.pathname === "/ai-governance/dashboard",
        },
        {
          name: t("navigation.aiModels"),
          href: "/ai-governance/models",
          current: location.pathname === "/ai-governance/models",
        },
        {
          name: t("navigation.controlsLibrary"),
          href: "/ai-governance/controls",
          current: location.pathname === "/ai-governance/controls",
        },
      ],
    },
    {
      name: t("navigation.compliance"),
      href: "/compliance/frameworks",
      icon: Shield,
      current: location.pathname.startsWith("/compliance"),
      roles: [
        "auditor",
        "reviewer",
        "supervisor_auditor",
        "cro",
        "admin",
        "super_admin",
      ],
      children: [
        {
          name: t("navigation.frameworks"),
          href: "/compliance/frameworks",
          current: location.pathname === "/compliance/frameworks",
        },
        {
          name: t("navigation.requirements"),
          href: "/compliance/requirements",
          current: location.pathname === "/compliance/requirements",
        },
        {
          name: t("navigation.profiles"),
          href: "/compliance/profiles",
          current: location.pathname === "/compliance/profiles",
        },
        {
          name: t("navigation.mapping"),
          href: "/compliance/mapping",
          current: location.pathname === "/compliance/mapping",
        },
        {
          name: t("navigation.importer"),
          href: "/compliance/import",
          current: location.pathname === "/compliance/import",
        },
        {
          name: t("navigation.importer2"),
          href: "/compliance/importer-2",
          current: location.pathname === "/compliance/importer-2",
        }
      ]
     },
    {
      name: t("navigation.privacy"),
      href: "/privacy/dashboard",
      icon: Shield,
      current: location.pathname.startsWith("/privacy"),
      roles: [
        "auditor",
        "reviewer",
        "supervisor_auditor",
        "cro",
        "admin",
        "super_admin",
      ],
      children: [
        { name: t("navigation.dashboard"), href: "/privacy/dashboard", current: location.pathname === "/privacy/dashboard" },
        { name: t("navigation.dpia"), href: "/privacy/dpia", current: location.pathname === "/privacy/dpia" },
        { name: t("navigation.ropaRegister"), href: "/privacy/ropa", current: location.pathname === "/privacy/ropa" },
      ],
    },
    {
      name: t("navigation.regulations"),
      href: "/regulations",
      icon: Shield,
      current: location.pathname.startsWith("/regulations"),
      roles: [
        "auditor",
        "reviewer",
        "supervisor_auditor",
        "cro",
        "admin",
        "super_admin",
      ],
      children: [
        { name: t("navigation.allRegulations"), href: "/regulations", current: location.pathname === "/regulations" },
        { name: t("navigation.impactDashboard"), href: "/regulations/impact-dashboard", current: location.pathname === "/regulations/impact-dashboard" },
      ]
    },
    {
      name: t("navigation.governance"),
      href: "/governance",
      icon: Shield,
      current: location.pathname.startsWith("/governance"),
      roles: ["auditor", "supervisor_auditor", "cro", "admin", "super_admin"],
      children: [
        {
          name: t("navigation.dashboard"),
          href: "/governance/dashboard",
          current: location.pathname === "/governance/dashboard",
        },
        {
          name: t("navigation.calendar"),
          href: "/governance/calendar",
          current: location.pathname === "/governance/calendar",
        },
        {
          name: t("navigation.reporting"),
          href: "/governance/reporting",
          current: location.pathname === "/governance/reporting",
        },
        {
          name: t("navigation.training"),
          href: "/governance/training",
          current: location.pathname === "/governance/training",
        }
      ],
    },
    {
      name: t("navigation.businessContinuityManagement"),
      href: "/bcp",
      icon: Building2,
      current: location.pathname.startsWith("/bcp"),
      roles: [
        "auditor",
        "reviewer",
        "supervisor_auditor",
        "cro",
        "admin",
        "super_admin",
      ],
      children: [
        {
          name: t("navigation.dashboard"),
          href: "/bcp",
          current: location.pathname === "/bcp",
        },
        {
          name: t("navigation.createPlan"),
          href: "/bcp/create",
          current: location.pathname === "/bcp/create",
        }
      ]
    },
    {
      name: t("navigation.advancedAnalytics"),
      href: "/analytics",
      icon: BarChart3,
      current: location.pathname.startsWith("/analytics"),
      roles: ["reviewer", "supervisor_auditor", "cro", "admin", "super_admin"],
    },
    {
      name: t("navigation.reporting"),
      href: "/reports",
      icon: FileText,
      current: location.pathname.startsWith("/reports"),
      roles: ["auditor", "reviewer", "supervisor_auditor", "cro", "admin", "super_admin"],
      children: [
        {
          name: t("navigation.reportBuilder"),
          href: "/reports/builder",
          current: location.pathname === "/reports/builder",
        },
        {
          name: t("navigation.reportTemplates"),
          href: "/reports/templates",
          current: location.pathname === "/reports/templates",
        },
        {
          name: t("navigation.generatedReports"),
          href: "/reports/generated",
          current: location.pathname === "/reports/generated",
        },
        {
          name: t("navigation.reportAnalytics"),
          href: "/reports/analytics",
          current: location.pathname === "/reports/analytics",
        },
        {
          name: t("navigation.scheduledReports"),
          href: "/reports/scheduled",
          current: location.pathname === "/reports/scheduled",
        },
      ],
    },
    {
      name: t("navigation.documentManagement"),
      href: "/documents",
      icon: FileText,
      current: location.pathname.startsWith("/documents"),
      roles: [
        "auditor",
        "reviewer",
        "supervisor_auditor",
        "cro",
        "admin",
        "super_admin",
      ],
    },
    {
      name: t("navigation.policies"),
      href: "/policies",
      icon: BookOpen,
      current: location.pathname.startsWith("/policies"),
      roles: [
        "business_unit_manager",
        "auditor",
        "reviewer",
        "supervisor_auditor",
        "cro",
        "admin",
        "super_admin",
      ],
      children: [
        {
          name: t("navigation.allPolicies"),
          href: "/policies",
          current: location.pathname === "/policies",
        },
        {
          name: t("navigation.createEdit"),
          href: "/policies",
          current: location.pathname.startsWith("/policies/"),
        },
      ],
    },
    {
      name: t("navigation.incidentManagement"),
      href: "/incidents",
      icon: AlertTriangle,
      current: location.pathname.startsWith("/incidents"),
      roles: [
        "auditor",
        "reviewer",
        "supervisor_auditor",
        "cro",
        "admin",
        "super_admin",
      ],
    },
    {
      name: t("navigation.thirdPartyRiskManagement"),
      href: "/third-party-risk-management",
      icon: Building2,
      current: location.pathname.startsWith("/third-party-risk-management"),
      roles: [
        "business_unit_manager",
        "reviewer",
        "supervisor_auditor",
        "cro",
        "admin",
        "super_admin",
      ],
      children: [
        {
          name: t("navigation.dashboard"),
          href: "/third-party-risk-management",
          current: location.pathname === "/third-party-risk-management",
        },
        {
          name: t("navigation.thirdPartyCatalog"),
          href: "/third-party-risk-management/catalog",
          current: location.pathname === "/third-party-risk-management/catalog",
        },
        {
          name: t("navigation.createThirdParty"),
          href: "/third-party-risk-management/create",
          current: location.pathname === "/third-party-risk-management/create",
        },
        {
          name: t("navigation.assessments"),
          href: "/third-party-risk-management/assessments",
          current: location.pathname === "/third-party-risk-management/assessments",
        },
        {
          name: t("navigation.engagements"),
          href: "/third-party-risk-management/engagements",
          current: location.pathname.startsWith("/third-party-risk-management/engagements"),
        },
        {
          name: t("navigation.incidentManagement"),
          href: "/third-party-risk-management/incidents",
          current: location.pathname === "/third-party-risk-management/incidents",
        },
        {
          name: t("navigation.contractManagement"),
          href: "/third-party-risk-management/contracts",
          current: location.pathname === "/third-party-risk-management/contracts",
        },
        {
          name: t("navigation.performanceMonitoring"),
          href: "/third-party-risk-management/performance",
          current: location.pathname === "/third-party-risk-management/performance",
        },
        {
          name: t("navigation.securityMonitoring"),
          href: "/third-party-risk-management/security",
          current: location.pathname === "/third-party-risk-management/security",
        },
        {
          name: t("navigation.dueDiligenceWorkflow"),
          href: "/third-party-risk-management/due-diligence",
          current: location.pathname === "/third-party-risk-management/due-diligence",
        },
      ]
    },
    {
      name: t("navigation.itSecurityRiskManagement"),
      href: "/it-security",
      icon: Shield,
      current: location.pathname.startsWith("/it-security"),
      roles: [
        "business_unit_manager",
        "reviewer",
        "supervisor_auditor",
        "cro",
        "admin",
        "super_admin",
      ],
      children: [
        {
          name: t("navigation.dashboard"),
          href: "/it-security",
          current: location.pathname === "/it-security",
        },
        {
          name: t("navigation.securityIncidents"),
          href: "/it-security/incidents",
          current: location.pathname.startsWith("/it-security/incidents"),
        },
        {
          name: t("navigation.vulnerabilities"),
          href: "/it-security/vulnerabilities",
          current: location.pathname.startsWith("/it-security/vulnerabilities"),
        },
        {
          name: t("navigation.itControls"),
          href: "/it-security/controls",
          current: location.pathname.startsWith("/it-security/controls"),
        },
        {
          name: t("navigation.securityPolicies"),
          href: "/it-security/policies",
          current: location.pathname.startsWith("/it-security/policies"),
        },
        {
          name: t("navigation.pciCompliance"),
          href: "/it-security/pci",
          current: location.pathname.startsWith("/it-security/pci"),
        },
        {
          name: t("navigation.iso27001"),
          href: "/it-security/isms",
          current: location.pathname.startsWith("/it-security/isms"),
        },
        {
          name: t("navigation.cmmcManagement"),
          href: "/it-security/cmmc",
          current: location.pathname.startsWith("/it-security/cmmc"),
        },
        {
          name: t("navigation.securityMonitoring"),
          href: "/it-security/monitoring",
          current: location.pathname.startsWith("/it-security/monitoring"),
        },
        {
          name: t("navigation.securityAssets"),
          href: "/it-security/assets",
          current: location.pathname.startsWith("/it-security/assets"),
        },
      ],
    },
    {
      name: t("navigation.esgManagement"),
      href: "/esg",
      icon: Globe,
      current: location.pathname.startsWith("/esg"),
      roles: [
        "business_unit_manager",
        "reviewer",
        "supervisor_auditor",
        "cro",
        "admin",
        "super_admin",
      ],
      children: [
        {
          name: t("navigation.dashboard"),
          href: "/esg",
          current: location.pathname === "/esg",
        },
        {
          name: t("navigation.comprehensiveEsg"),
          href: "/esg/comprehensive",
          current: location.pathname === "/esg/comprehensive",
        },
        {
          name: t("navigation.programs"),
          href: "/esg/programs",
          current: location.pathname === "/esg/programs",
        },
        {
          name: t("navigation.carbonManagement"),
          href: "/esg/carbon",
          current: location.pathname === "/esg/carbon",
        },
        {
          name: t("navigation.disclosures"),
          href: "/esg/disclosures",
          current: location.pathname === "/esg/disclosures",
        },
        {
          name: t("navigation.portfolioAssessment"),
          href: "/esg/portfolio",
          current: location.pathname === "/esg/portfolio",
        },
        {
          name: t("navigation.goalsManagement"),
          href: "/esg/goals",
          current: location.pathname === "/esg/goals",
        },
        {
          name: t("navigation.stakeholderEngagement"),
          href: "/esg/stakeholders",
          current: location.pathname === "/esg/stakeholders",
        },
        {
          name: t("navigation.materialityCalculator"),
          href: "/esg/materiality",
          current: location.pathname === "/esg/materiality",
        },
      ],
    },
    {
      name: t("navigation.trainingCertification"),
      href: "/training",
      icon: GraduationCap,
      current: location.pathname.startsWith("/training"),
      roles: [
        "business_unit_user",
        "business_unit_manager",
        "auditor",
        "reviewer",
        "supervisor_auditor",
        "cro",
        "admin",
        "super_admin",
      ],
    },
    {
      name: t("navigation.assetManagement"),
      href: "/assets",
      icon: HardDrive,
      current: location.pathname.startsWith("/assets"),
      roles: [
        "auditor",
        "reviewer",
        "supervisor_auditor",
        "cro",
        "admin",
        "super_admin",
      ],
    },
    {
      name: t("navigation.users"),
      href: "/users",
      icon: Users,
      current:
        location.pathname === "/users" ||
        location.pathname.startsWith("/users/"),
      roles: ["admin", "super_admin"],
    },
    {
      name: t("navigation.settings"),
      href: "/settings",
      icon: Settings,
      current:
        location.pathname === "/settings" ||
        location.pathname.startsWith("/settings/"),
      roles: ["admin", "super_admin"],
    },
  ], [location.pathname, t, navigate]);


  // Memoize filtered navigation to prevent unnecessary re-renders
  const filteredNavigation = useMemo(() => 
    navigation.filter((item) =>
      item.roles.some((role) => checkPermission(role as any)),
    ),
    [navigation, checkPermission]
  );

  // Memoize callback functions
  const handleSignOut = useCallback(async () => {
    await signOut();
    navigate("/auth/sign-in", { replace: true });
  }, [signOut, navigate]);




  // Create a separate component for the legacy sidebar content
  const LegacySidebarContent = () => {
    return (
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div className="ml-3">
              <h1 className="text-xl font-bold text-gray-900">{t('navigation.aiAuditor')}</h1>
              <p className="text-xs text-gray-500">{t('navigation.grcPlatform')}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {filteredNavigation.map((item) => {
            const Icon = item.icon;
            const hasChildren = item.children && item.children.length > 0;
            const [isExpanded, setIsExpanded] = useState(item.current || false);

            return (
              <div key={item.name} className="space-y-1">
                <button
                  onClick={() => {
                    if (!hasChildren) {
                      navigate(item.href);
                      setSidebarOpen(false);
                    } else {
                      setIsExpanded(!isExpanded);
                    }
                  }}
                  className={`w-full group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    item.current
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <div className="flex items-center flex-1">
                    <Icon
                      className={`mr-3 h-5 w-5 transition-colors ${
                        item.current
                          ? "text-white"
                          : "text-gray-400 group-hover:text-gray-500"
                      }`}
                      aria-hidden="true"
                    />
                    <span className="flex-1">{item.name}</span>
                  </div>
                  {hasChildren && (
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${isExpanded ? "transform rotate-180" : ""} ${
                        item.current ? "text-white" : "text-gray-400"
                      }`}
                    />
                  )}
                </button>

                {/* Submenu items */}
                {hasChildren && isExpanded && (
                  <div className="pl-4 space-y-1">
                    {item.children.map((child) => (
                      <button
                        key={child.name}
                        onClick={() => {
                          navigate(child.href);
                          setSidebarOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                          child.current
                            ? "bg-blue-50 text-blue-700 font-medium"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                      >
                        {child.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* User info at bottom */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                {user?.first_name?.[0]}
                {user?.last_name?.[0]}
              </span>
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">
                {user?.first_name} {user?.last_name}
              </p>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getRoleColor(user?.role || "viewer")}`}
              >
                {getUserRoleLabel(user?.role || "viewer")}
              </span>
            </div>
          </div>
        </div>

        {/* Switch to Enhanced Sidebar Button */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => setUseEnhancedSidebar(true)}
            className="w-full px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors flex items-center justify-center"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            {t("navigation.switchToEnhancedMenu")}
          </button>
        </div>
      </div>
    );
  };



  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className={`flex flex-col ${useEnhancedSidebar && sidebarCollapsed ? 'w-16' : 'w-80'}`}>
          <div className="flex flex-col flex-grow bg-white border-r border-gray-200 overflow-hidden">
            {useEnhancedSidebar ? (
              <EnhancedSidebar
                isCollapsed={sidebarCollapsed}
                onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
                onSwitchToLegacy={() => setUseEnhancedSidebar(false)}
              />
            ) : (
              <LegacySidebarContent />
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <div className="absolute inset-0 bg-gray-600 opacity-75" />
            </motion.div>

            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className={`fixed inset-y-0 left-0 z-50 bg-white lg:hidden ${
                useEnhancedSidebar && sidebarCollapsed ? 'w-16' : 'w-80'
              }`}
            >
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  type="button"
                  className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  onClick={() => setSidebarOpen(false)}
                >
                  <X className="h-6 w-6 text-white" />
                </button>
              </div>
              {useEnhancedSidebar ? (
                <EnhancedSidebar
                  isCollapsed={sidebarCollapsed}
                  onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
                  onSwitchToLegacy={() => setUseEnhancedSidebar(false)}
                />
              ) : (
                <LegacySidebarContent />
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 z-10">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center">
              <button
                type="button"
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </button>
              <div className="ml-4 lg:ml-0">
                <h2 className="text-xl font-semibold text-gray-900">
                  {filteredNavigation.find((item) => item.current)?.name ||
                    t("navigation.dashboard")}
                </h2>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Compose Notification */}
              <div className="hidden md:block">
                <button
                  type="button"
                  className="px-3 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                  onClick={() => setComposeOpen(true)}
                  title="Send notification/message"
                >
                  {t("navigation.newMessage")}
                </button>
              </div>
              {/* Language Selector */}
              <LanguageSelector />

              {/* Notifications */}
              <div className="relative">
                <NotificationBell />
              </div>

              {/* User Menu */}
              <div className="relative">
                <button
                  type="button"
                  className="flex items-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-2">
                    <span className="text-sm font-medium text-white">
                      {user?.first_name?.[0]}
                      {user?.last_name?.[0]}
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50"
                    >
                      <div className="px-4 py-3 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-900">
                          {user?.first_name} {user?.last_name}
                        </p>
                        <p className="text-sm text-gray-500">{user?.email}</p>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-1 ${getRoleColor(user?.role || "viewer")}`}
                        >
                          {getUserRoleLabel(user?.role || "viewer")}
                        </span>
                      </div>
                      <div className="py-1">
                        <button
                          onClick={() => {
                            navigate("/profile");
                            setUserMenuOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        >
                          <User className="h-4 w-4 mr-2" />
                          {t("navigation.profile")}
                        </button>
                        <button
                          onClick={handleSignOut}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          {t("navigation.logout")}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-auto bg-gray-50">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
      {/* Compose Notification Modal */}
      <ComposeNotificationModal
        open={composeOpen}
        onClose={() => setComposeOpen(false)}
        onSent={(count) => {
          // optional: could toast here if a toast util exists
          setComposeOpen(false);
        }}
      />
    </div>
  );
};

export default Layout;
