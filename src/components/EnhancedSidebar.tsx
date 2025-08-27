import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
  Globe,
  BookOpen,
  Building2,
  GraduationCap,
  HardDrive,
  Network,
  Layers,
  Target,
  Zap,
  Database,
  Briefcase,
  Palette,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Eye,
  Scale,
  Lock,
  Leaf,
  RefreshCw,
  AlertCircle,
  Gavel,
  ClipboardList,
  FileCheck,
  ShieldAlert,
  TrendingUp,
  Calendar,
  FileSpreadsheet,
  Handshake,
  Monitor,
  Server,
  Key,
  Fingerprint,
  Cloud,
  Activity,
  Award,
  BookMarked,
  CheckCircle,
  AlertOctagon,
  Clock,
  MapPin,
  PieChart,
  BarChart,
  LineChart,
  Cpu,
  Wifi,
  Smartphone,
  Tablet,
  MonitorSmartphone,
  ShieldX,
  ShieldPlus,
  ShieldMinus,
  ShieldOff,
  EyeOff,
  LockKeyhole,
  Unlock,
  KeyRound,
  KeySquare,
  FileKey,
  FileLock,
  FileCode,
  FileImage,
  FileVideo,
  FileAudio,
  FileArchive,
  FileSearch,
  FilePlus,
  FileMinus,
  FileX,
  FileEdit,
  FileType,
  FileDigit,
  FileJson,
  FileSymlink,
  FileHeart,
  FileWarning,
  FileQuestion,
  FileClock,
  FileDown,
  FileUp,
  FileInput,
  FileOutput,
  FileTerminal,
  FileBadge,
  FileBarChart,
  FilePieChart,
  FileLineChart,
  Thermometer,
  X as CloseIcon,
} from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { getUserRoleLabel, getRoleColor } from "../utils";
import { motion, AnimatePresence } from "framer-motion";

interface EnhancedSidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onSwitchToLegacy?: () => void;
}

const EnhancedSidebar: React.FC<EnhancedSidebarProps> = ({
  isCollapsed = false,
  onToggleCollapse,
  onSwitchToLegacy,
}) => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, checkPermission } = useAuthStore();
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  // Memoize menuCategories to prevent unnecessary re-renders
  const menuCategories = useMemo(() => [
    {
      id: "dashboard",
      name: t("navigation.dashboard"),
      icon: Home,
      color: "from-blue-500 to-cyan-500",
      items: [
        {
          name: t("navigation.dashboard"),
          href: "/",
          icon: Home,
          current: location.pathname === "/" || location.pathname === "/dashboard",
          roles: ["viewer", "business_unit_user", "business_unit_manager", "auditor", "reviewer", "supervisor_auditor", "cro", "admin", "super_admin"],
        },
      ],
    },
    {
      id: "risk-management",
      name: t("sidebar.riskManagement"),
      icon: AlertTriangle,
      color: "from-red-500 to-orange-500",
      items: [
        {
          name: t("navigation.risks"),
          href: "/risks",
          icon: AlertTriangle,
          current: location.pathname.startsWith("/risks"),
          roles: ["business_unit_manager", "auditor", "reviewer", "supervisor_auditor", "cro", "admin", "super_admin"],
          children: [
            { name: t("navigation.allRisks"), href: "/risks", current: location.pathname === "/risks" },
            { name: t("navigation.dashboard"), href: "/risks/dashboard", current: location.pathname === "/risks/dashboard" },
            { name: t("navigation.secondDashboard"), href: "/risks/dashboard-2", current: location.pathname === "/risks/dashboard-2" },
            { name: t("navigation.lossEventManagement"), href: "/risks/loss-events", current: location.pathname === "/risks/loss-events" },
            { name: t("navigation.keyIndicatorManagement"), href: "/risks/key-indicators", current: location.pathname === "/risks/key-indicators" },
            { name: t("navigation.operationalRiskManagement"), href: "/risks/operational-risk", current: location.pathname === "/risks/operational-risk" },
            { name: t("common.create"), href: "/risks/create", current: location.pathname === "/risks/create" }
          ]
        },
        {
          name: t("sidebar.thirdPartyRiskManagement"),
          href: "/third-party-risk-management",
          icon: Building2,
          current: location.pathname.startsWith("/third-party-risk-management"),
          roles: ["business_unit_manager", "reviewer", "supervisor_auditor", "cro", "admin", "super_admin"],
          children: [
            { name: t("sidebar.dashboard"), href: "/third-party-risk-management", current: location.pathname === "/third-party-risk-management" },
            { name: t("sidebar.thirdPartyCatalog"), href: "/third-party-risk-management/catalog", current: location.pathname === "/third-party-risk-management/catalog" },
            { name: t("sidebar.createThirdParty"), href: "/third-party-risk-management/create", current: location.pathname === "/third-party-risk-management/create" },
            { name: t("sidebar.assessments"), href: "/third-party-risk-management/assessments", current: location.pathname === "/third-party-risk-management/assessments" },
            { name: t("sidebar.engagements"), href: "/third-party-risk-management/engagements", current: location.pathname.startsWith("/third-party-risk-management/engagements") },
            { name: t("sidebar.incidentManagement"), href: "/third-party-risk-management/incidents", current: location.pathname === "/third-party-risk-management/incidents" },
            { name: t("sidebar.contractManagement"), href: "/third-party-risk-management/contracts", current: location.pathname === "/third-party-risk-management/contracts" },
            { name: t("sidebar.performanceMonitoring"), href: "/third-party-risk-management/performance", current: location.pathname === "/third-party-risk-management/performance" },
            { name: t("sidebar.securityMonitoring"), href: "/third-party-risk-management/security", current: location.pathname === "/third-party-risk-management/security" },
            { name: t("sidebar.dueDiligenceWorkflow"), href: "/third-party-risk-management/due-diligence", current: location.pathname === "/third-party-risk-management/due-diligence" },
          ]
        },
        {
          name: t("sidebar.itSecurityRiskManagement"),
          href: "/it-security",
          icon: Lock,
          current: location.pathname.startsWith("/it-security"),
          roles: ["business_unit_manager", "reviewer", "supervisor_auditor", "cro", "admin", "super_admin"],
          children: [
            { name: t("sidebar.dashboard"), href: "/it-security", current: location.pathname === "/it-security" },
            { name: t("sidebar.securityIncidents"), href: "/it-security/incidents", current: location.pathname.startsWith("/it-security/incidents") },
            { name: t("sidebar.vulnerabilities"), href: "/it-security/vulnerabilities", current: location.pathname.startsWith("/it-security/vulnerabilities") },
            { name: t("sidebar.itControls"), href: "/it-security/controls", current: location.pathname.startsWith("/it-security/controls") },
            { name: t("sidebar.securityPolicies"), href: "/it-security/policies", current: location.pathname.startsWith("/it-security/policies") },
            { name: t("sidebar.pciCompliance"), href: "/it-security/pci", current: location.pathname.startsWith("/it-security/pci") },
            { name: t("sidebar.iso27001"), href: "/it-security/isms", current: location.pathname.startsWith("/it-security/isms") },
            { name: t("sidebar.cmmcManagement"), href: "/it-security/cmmc", current: location.pathname.startsWith("/it-security/cmmc") },
            { name: t("sidebar.securityMonitoring"), href: "/it-security/monitoring", current: location.pathname.startsWith("/it-security/monitoring") },
            { name: t("sidebar.securityAssets"), href: "/it-security/assets", current: location.pathname.startsWith("/it-security/assets") },
          ],
        },
        {
          name: t("sidebar.riskControlMatrix"),
          href: "/risk-control-matrix",
          icon: FileSpreadsheet,
          current: location.pathname.startsWith("/risk-control-matrix"),
          roles: ["business_unit_manager", "auditor", "reviewer", "supervisor_auditor", "cro", "admin", "super_admin"],
        },
        {
          name: t("sidebar.esgManagement"),
          href: "/esg",
          icon: Leaf,
          current: location.pathname.startsWith("/esg"),
          roles: ["business_unit_manager", "reviewer", "supervisor_auditor", "cro", "admin", "super_admin"],
          children: [
            { name: t("sidebar.dashboard"), href: "/esg", current: location.pathname === "/esg" },
            { name: t("sidebar.comprehensiveEsg"), href: "/esg/comprehensive", current: location.pathname === "/esg/comprehensive" },
            { name: t("sidebar.programs"), href: "/esg/programs", current: location.pathname === "/esg/programs" },
            { name: t("sidebar.carbonManagement"), href: "/esg/carbon", current: location.pathname === "/esg/carbon" },
            { name: t("sidebar.disclosures"), href: "/esg/disclosures", current: location.pathname === "/esg/disclosures" },
            { name: t("sidebar.portfolioAssessment"), href: "/esg/portfolio", current: location.pathname === "/esg/portfolio" },
            { name: t("sidebar.goalsManagement"), href: "/esg/goals", current: location.pathname === "/esg/goals" },
            { name: t("sidebar.stakeholderEngagement"), href: "/esg/stakeholders", current: location.pathname === "/esg/stakeholders" },
            { name: t("sidebar.materialityCalculator"), href: "/esg/materiality", current: location.pathname === "/esg/materiality" },
          ],
        },
      ],
    },
    {
      id: "audit-compliance",
      name: t("sidebar.auditCompliance"),
      icon: FileText,
      color: "from-green-500 to-emerald-500",
      items: [
        {
          name: t("navigation.audits"),
          href: "/audits",
          icon: FileText,
          current: location.pathname.startsWith("/audits"),
          roles: ["auditor", "reviewer", "supervisor_auditor", "cro", "admin", "super_admin"],
          children: [
            { name: t("navigation.allAudits"), href: "/audits", current: location.pathname === "/audits" },
            { name: t("navigation.createAudit"), href: "/audits/create", current: location.pathname === "/audits/create" },
            { name: t("navigation.upcomingSchedules"), href: "/audits/schedules", current: location.pathname === "/audits/schedules" },
          ],
        },
        {
          name: t("navigation.auditPlanning"),
          href: "/audit-planning",
          icon: BarChart3,
          current: location.pathname.startsWith("/audit-planning"),
          roles: ["auditor", "reviewer", "supervisor_auditor", "cro", "admin", "super_admin"],
          children: [
            { name: t("navigation.dashboard"), href: "/audit-planning", current: location.pathname === "/audit-planning" },
            { name: t("navigation.auditUniverse"), href: "/audit-planning/universe", current: location.pathname === "/audit-planning/universe" },
            { name: t("navigation.auditPlans"), href: "/audit-planning/plans", current: location.pathname === "/audit-planning/plans" },
            { name: t("navigation.resourceManagement"), href: "/audit-planning/resources", current: location.pathname === "/audit-planning/resources" },
            { name: t("navigation.competencies"), href: "/audit-planning/competencies", current: location.pathname === "/audit-planning/competencies" },
            { name: t("navigation.trainingNeeds"), href: "/audit-planning/training", current: location.pathname === "/audit-planning/training" },
          ],
        },
        {
          name: t("navigation.controls"),
          href: "/controls",
          icon: Shield,
          current: location.pathname.startsWith("/controls"),
          roles: ["auditor", "reviewer", "supervisor_auditor", "cro", "admin", "super_admin"],
        },
        {
          name: t("navigation.compliance"),
          href: "/compliance/frameworks",
          icon: Gavel,
          current: location.pathname.startsWith("/compliance"),
          roles: ["auditor", "reviewer", "supervisor_auditor", "cro", "admin", "super_admin"],
          children: [
            { name: t("navigation.frameworks"), href: "/compliance/frameworks", current: location.pathname === "/compliance/frameworks" },
            { name: t("navigation.requirements"), href: "/compliance/requirements", current: location.pathname === "/compliance/requirements" },
            { name: t("navigation.profiles"), href: "/compliance/profiles", current: location.pathname === "/compliance/profiles" },
            { name: t("navigation.mapping"), href: "/compliance/mapping", current: location.pathname === "/compliance/mapping" },
            { name: t("navigation.importer"), href: "/compliance/import", current: location.pathname === "/compliance/import" },
            { name: t("navigation.importer2"), href: "/compliance/importer-2", current: location.pathname === "/compliance/importer-2" }
          ]
        },
        {
          name: t("navigation.privacy"),
          href: "/privacy/dashboard",
          icon: Eye,
          current: location.pathname.startsWith("/privacy"),
          roles: ["auditor", "reviewer", "supervisor_auditor", "cro", "admin", "super_admin"],
          children: [
            { name: t("navigation.dashboard"), href: "/privacy/dashboard", current: location.pathname === "/privacy/dashboard" },
            { name: t("navigation.dpia"), href: "/privacy/dpia", current: location.pathname === "/privacy/dpia" },
            { name: t("navigation.ropaRegister"), href: "/privacy/ropa", current: location.pathname === "/privacy/ropa" },
          ],
        },
        {
          name: t("navigation.regulations"),
          href: "/regulations",
          icon: Scale,
          current: location.pathname.startsWith("/regulations"),
          roles: ["auditor", "reviewer", "supervisor_auditor", "cro", "admin", "super_admin"],
          children: [
            { name: t("navigation.allRegulations"), href: "/regulations", current: location.pathname === "/regulations" },
            { name: t("navigation.impactDashboard"), href: "/regulations/impact-dashboard", current: location.pathname === "/regulations/impact-dashboard" },
          ]
        },
        {
          name: t("navigation.findings"),
          href: "/findings",
          icon: Search,
          current: location.pathname.startsWith("/findings"),
          roles: ["auditor", "reviewer", "supervisor_auditor", "cro", "admin", "super_admin"],
          children: [
            { name: t("navigation.allFindings"), href: "/findings", current: location.pathname === "/findings" },
            { name: t("navigation.dashboard"), href: "/findings/dashboard", current: location.pathname === "/findings/dashboard" },
            { name: t("common.create"), href: "/findings/create", current: location.pathname === "/findings/create" },
          ],
        },
      ],
    },
    {
      id: "business-processes",
      name: t("sidebar.businessProcesses"),
      icon: Workflow,
      color: "from-purple-500 to-pink-500",
      items: [
        {
          name: t("navigation.workflow"),
          href: "/workflows",
          icon: Workflow,
          current: location.pathname.startsWith("/workflows"),
          roles: ["cro", "admin", "super_admin"],
        },
        {
          name: t("navigation.entityRelationships"),
          href: "/relationships",
          icon: Network,
          current: location.pathname.startsWith("/relationships"),
          roles: ["auditor", "reviewer", "supervisor_auditor", "cro", "admin", "super_admin"],
        },
        {
          name: t("navigation.documentManagement"),
          href: "/documents",
          icon: FileText,
          current: location.pathname.startsWith("/documents"),
          roles: ["auditor", "reviewer", "supervisor_auditor", "cro", "admin", "super_admin"],
        },
        {
          name: t("navigation.policies"),
          href: "/policies",
          icon: BookOpen,
          current: location.pathname.startsWith("/policies"),
          roles: ["business_unit_manager", "auditor", "reviewer", "supervisor_auditor", "cro", "admin", "super_admin"],
          children: [
            { name: t("navigation.allPolicies"), href: "/policies", current: location.pathname === "/policies" },
            { name: t("navigation.createEdit"), href: "/policies", current: location.pathname.startsWith("/policies/") },
          ],
        },
      ],
    },
    {
      id: "ai-analytics",
      name: t("sidebar.aiAnalytics"),
      icon: Bot,
      color: "from-indigo-500 to-blue-500",
      items: [
        {
          name: t("navigation.aiAssistant"),
          href: "/ai",
          icon: Bot,
          current: location.pathname === "/ai" || location.pathname.startsWith("/ai/"),
          roles: ["auditor", "reviewer", "supervisor_auditor", "cro", "admin", "super_admin"],
        },
        {
          name: t("navigation.aiGovernance"),
          href: "/ai-governance",
          icon: Bot,
          current: location.pathname.startsWith("/ai-governance"),
          roles: ["auditor", "reviewer", "supervisor_auditor", "cro", "admin", "super_admin"],
          children: [
            { name: t("navigation.dashboard"), href: "/ai-governance/dashboard", current: location.pathname === "/ai-governance/dashboard" },
            { name: t("navigation.aiModels"), href: "/ai-governance/models", current: location.pathname === "/ai-governance/models" },
            { name: t("navigation.controlsLibrary"), href: "/ai-governance/controls", current: location.pathname === "/ai-governance/controls" },
          ],
        },
        {
          name: t("navigation.advancedAnalytics"),
          href: "/analytics",
          icon: BarChart3,
          current: location.pathname.startsWith("/analytics"),
          roles: ["reviewer", "supervisor_auditor", "cro", "admin", "super_admin"],
        },
      ],
    },
    {
      id: "operational-management",
      name: t("sidebar.operationalManagement"),
      icon: Briefcase,
      color: "from-yellow-500 to-orange-500",
      items: [
        {
          name: t("navigation.resilienceManagement"),
          href: "/resilience",
          icon: Shield,
          current: location.pathname.startsWith("/resilience"),
          roles: ["business_unit_manager", "auditor", "reviewer", "supervisor_auditor", "cro", "admin", "super_admin"],
          children: [
            { name: t("navigation.dashboard"), href: "/resilience", current: location.pathname === "/resilience" },
            { name: t("navigation.incidentManagement"), href: "/resilience/incidents", current: location.pathname === "/resilience/incidents" },
            { name: t("navigation.businessImpactAnalysis"), href: "/resilience/bia", current: location.pathname.startsWith("/resilience/bia") },
            { name: t("navigation.crisisManagement"), href: "/resilience/crisis", current: location.pathname === "/resilience/crisis" },
            { name: t("navigation.scenarioAnalysis"), href: "/resilience/scenarios", current: location.pathname === "/resilience/scenarios" },
            { name: t("navigation.metricsDashboard"), href: "/resilience/metrics", current: location.pathname === "/resilience/metrics" }
          ]
        },
        {
          name: t("navigation.businessContinuityManagement"),
          href: "/bcp",
          icon: RefreshCw,
          current: location.pathname.startsWith("/bcp"),
          roles: ["auditor", "reviewer", "supervisor_auditor", "cro", "admin", "super_admin"],
          children: [
            { name: t("navigation.dashboard"), href: "/bcp", current: location.pathname === "/bcp" },
            { name: t("navigation.createPlan"), href: "/bcp/create", current: location.pathname === "/bcp/create" }
          ]
        },
        {
          name: t("navigation.incidentManagement"),
          href: "/incidents",
          icon: AlertCircle,
          current: location.pathname.startsWith("/incidents"),
          roles: ["auditor", "reviewer", "supervisor_auditor", "cro", "admin", "super_admin"],
        },
        {
          name: t("navigation.trainingCertification"),
          href: "/training",
          icon: GraduationCap,
          current: location.pathname.startsWith("/training"),
          roles: ["business_unit_user", "business_unit_manager", "auditor", "reviewer", "supervisor_auditor", "cro", "admin", "super_admin"],
        },
      ],
    },
    {
      id: "system-management",
      name: t("sidebar.systemManagement"),
      icon: Settings,
      color: "from-gray-500 to-slate-500",
      items: [
        {
          name: t("navigation.governance"),
          href: "/governance",
          icon: Gavel,
          current: location.pathname.startsWith("/governance"),
          roles: ["auditor", "supervisor_auditor", "cro", "admin", "super_admin"],
          children: [
            { name: t("navigation.dashboard"), href: "/governance/dashboard", current: location.pathname === "/governance/dashboard" },
            { name: t("navigation.calendar"), href: "/governance/calendar", current: location.pathname === "/governance/calendar" },
            { name: t("navigation.reporting"), href: "/governance/reporting", current: location.pathname === "/governance/reporting" },
            { name: t("navigation.training"), href: "/governance/training", current: location.pathname === "/governance/training" }
          ],
        },
        {
          name: t("navigation.assetManagement"),
          href: "/assets",
          icon: HardDrive,
          current: location.pathname.startsWith("/assets"),
          roles: ["auditor", "reviewer", "supervisor_auditor", "cro", "admin", "super_admin"],
        },
        {
          name: t("navigation.users"),
          href: "/users",
          icon: Users,
          current: location.pathname === "/users" || location.pathname.startsWith("/users/"),
          roles: ["admin", "super_admin"],
        },
        {
          name: t("navigation.settings"),
          href: "/settings",
          icon: Settings,
          current: location.pathname === "/settings" || location.pathname.startsWith("/settings/"),
          roles: ["admin", "super_admin"],
        },
      ],
    },
    {
      id: "reporting",
      name: t("sidebar.reporting"),
      icon: FileText,
      color: "from-teal-500 to-cyan-500",
      items: [
        {
          name: t("navigation.reportBuilder"),
          href: "/reports/builder",
          icon: FileText,
          current: location.pathname === "/reports/builder",
          roles: ["auditor", "reviewer", "supervisor_auditor", "cro", "admin", "super_admin"],
        },
        {
          name: t("navigation.reportWizard"),
          href: "/reports/wizard",
          icon: Bot,
          current: location.pathname === "/reports/wizard",
          roles: ["auditor", "reviewer", "supervisor_auditor", "cro", "admin", "super_admin"],
        },
        {
          name: t("navigation.reportTemplates"),
          href: "/reports/templates",
          icon: FileText,
          current: location.pathname === "/reports/templates",
          roles: ["auditor", "reviewer", "supervisor_auditor", "cro", "admin", "super_admin"],
        },
        {
          name: t("navigation.generatedReports"),
          href: "/reports/generated",
          icon: FileText,
          current: location.pathname === "/reports/generated",
          roles: ["auditor", "reviewer", "supervisor_auditor", "cro", "admin", "super_admin"],
        },
        {
          name: t("navigation.reportAnalytics"),
          href: "/reports/analytics",
          icon: BarChart3,
          current: location.pathname === "/reports/analytics",
          roles: ["auditor", "reviewer", "supervisor_auditor", "cro", "admin", "super_admin"],
        },
        {
          name: t("navigation.scheduledReports"),
          href: "/reports/scheduled",
          icon: Calendar,
          current: location.pathname === "/reports/scheduled",
          roles: ["auditor", "reviewer", "supervisor_auditor", "cro", "admin", "super_admin"],
        },
      ],
    },
  ], [location.pathname, t]);

  // Optimized useEffect - only run when necessary
  useEffect(() => {
    const currentPath = location.pathname;
    
    // Check if we need to update expanded states
    const newExpandedCategories: string[] = [];
    const newExpandedItems: Record<string, boolean> = {};

    menuCategories.forEach(category => {
      const hasActiveItem = category.items.some(item => {
        const isActive = item.current;
        if (isActive && item.children) {
          newExpandedItems[item.name] = true;
        }
        return isActive;
      });

      if (hasActiveItem) {
        newExpandedCategories.push(category.id);
      }
    });

    // Only update state if there are actual changes
    setExpandedCategories(prev => {
      const hasChanges = JSON.stringify(prev.sort()) !== JSON.stringify(newExpandedCategories.sort());
      return hasChanges ? newExpandedCategories : prev;
    });

    setExpandedItems(prev => {
      const hasChanges = JSON.stringify(prev) !== JSON.stringify(newExpandedItems);
      return hasChanges ? { ...prev, ...newExpandedItems } : prev;
    });
  }, [location.pathname, menuCategories]);

  // Memoize filtered categories with search functionality
  const filteredCategories = useMemo(() => {
    // First filter by permissions
    let categories = menuCategories.map(category => ({
      ...category,
      items: category.items.filter(item =>
        item.roles.some(role => checkPermission(role as any))
      )
    })).filter(category => category.items.length > 0);

    // Then filter by search query if present
    if (!searchQuery.trim()) {
      return categories;
    }

    const query = searchQuery.toLowerCase();

    return categories.map(category => {
      const filteredItems = category.items.filter(item => {
        // Check if item name matches
        const itemMatches = item.name.toLowerCase().includes(query);

        // Check if any children match
        const childrenMatch = item.children?.some(child =>
          child.name.toLowerCase().includes(query)
        );

        // Check if category name matches
        const categoryMatches = category.name.toLowerCase().includes(query);

        return itemMatches || childrenMatch || categoryMatches;
      });

      // Filter children within items
      const itemsWithFilteredChildren = filteredItems.map(item => ({
        ...item,
        children: item.children?.filter(child =>
          child.name.toLowerCase().includes(query)
        )
      }));

      return {
        ...category,
        items: itemsWithFilteredChildren
      };
    }).filter(category => category.items.length > 0);
  }, [menuCategories, checkPermission, searchQuery]);

  // Memoize callback functions
  const toggleCategory = useCallback((categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  }, []);

  const toggleItem = useCallback((itemName: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemName]: !prev[itemName]
    }));
  }, []);

  const handleItemClick = useCallback((href: string) => {
    navigate(href);
  }, [navigate]);


  const clearSearch = useCallback(() => {
    setSearchQuery("");
    setShowSearch(false);
  }, []);

  const toggleSearch = useCallback(() => {
    setShowSearch(prev => !prev);
    if (showSearch) {
      setSearchQuery("");
    }
  }, [showSearch]);

  return (
    <div className={`flex flex-col h-full bg-white border-r border-gray-200 ${
      isCollapsed ? 'w-16' : 'w-80'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
        {!isCollapsed && (
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div className="ml-3">
              <h1 className="text-xl font-bold text-gray-900">{t('navigation.aiAuditor')}</h1>
              <p className="text-xs text-gray-500">{t('navigation.grcPlatform')}</p>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mx-auto">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
        )}

        {/* Toggle buttons */}
        <div className="flex items-center space-x-1">
          <button
            onClick={onToggleCollapse}
            className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          </button>
          {!isCollapsed && (
            <>
              <button
                onClick={toggleSearch}
                className={`p-1.5 rounded-md transition-colors ${
                  showSearch
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                }`}
                title={showSearch ? "Hide search" : "Show search"}
              >
                <Search className="w-4 h-4" />
              </button>
              <button
                onClick={onSwitchToLegacy}
                className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                title="Switch to legacy menu"
              >
                <Palette className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Search Bar */}
      {!isCollapsed && showSearch && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="px-4 py-3 border-b border-gray-200 bg-gray-50"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={t('common.search') || 'Search menu...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className={`w-full pl-10 pr-10 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                isSearchFocused ? 'border-blue-300' : ''
              }`}
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-gray-600"
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        </motion.div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-2 overflow-y-auto">
        {filteredCategories.map((category) => {
          const CategoryIcon = category.icon;
          const isExpanded = expandedCategories.includes(category.id);
          const hasActiveItem = category.items.some(item => item.current);

          return (
            <div key={category.id} className="space-y-1">
              {/* Category Header */}
              <button
                onClick={() => {
                  if (isCollapsed) {
                    // In collapsed mode, show first item of category
                    const firstItem = category.items[0];
                    if (firstItem) {
                      handleItemClick(firstItem.href);
                    }
                  } else {
                    toggleCategory(category.id);
                  }
                }}
                className={`w-full group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  hasActiveItem
                    ? `bg-gradient-to-r ${category.color} text-white shadow-lg`
                    : "text-slate-700 hover:bg-slate-50 hover:text-slate-900 border border-transparent hover:border-slate-200"
                }`}
                title={isCollapsed ? category.name : undefined}
              >
                <div className="flex items-center flex-1">
                  <CategoryIcon
                    className={`${isCollapsed ? 'mx-auto' : 'mr-3'} h-5 w-5 transition-colors ${
                      hasActiveItem
                        ? "text-white"
                        : "text-slate-500 group-hover:text-slate-700"
                    }`}
                  />
                  {!isCollapsed && <span className="flex-1">{category.name}</span>}
                </div>
                {!isCollapsed && (
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${isExpanded ? "transform rotate-180" : ""} ${
                      hasActiveItem ? "text-white" : "text-slate-400 group-hover:text-slate-600"
                    }`}
                  />
                )}
              </button>

              {/* Category Items */}
              {!isCollapsed && isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="pl-4 space-y-1"
                >
                  {category.items.map((item) => {
                    const ItemIcon = item.icon;
                    const hasChildren = item.children && item.children.length > 0;
                    const isItemExpanded = expandedItems[item.name] || item.current;

                    return (
                      <div key={item.name} className="space-y-1">
                        <button
                          onClick={() => {
                            if (!hasChildren) {
                              handleItemClick(item.href);
                            } else {
                              toggleItem(item.name);
                            }
                          }}
                          className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center ${
                            item.current
                              ? "bg-blue-50 text-blue-800 font-medium border-l-2 border-blue-500"
                              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                          }`}
                        >
                          <ItemIcon className="mr-2 h-4 w-4" />
                          <span className="flex-1">{item.name}</span>
                          {hasChildren && (
                            <ChevronDown
                              className={`h-3 w-3 text-slate-400 transition-transform ${isItemExpanded ? "transform rotate-180" : ""}`}
                            />
                          )}
                        </button>

                        {/* Submenu items */}
                        {hasChildren && isItemExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="pl-6 space-y-1"
                          >
                            {item.children.map((child) => (
                              <button
                                key={child.name}
                                onClick={() => handleItemClick(child.href)}
                                className={`w-full text-left px-3 py-1 text-xs rounded-md transition-colors ${
                                  child.current
                                    ? "bg-blue-100 text-blue-800 font-medium"
                                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                                }`}
                              >
                                {child.name}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </div>
                    );
                  })}
                </motion.div>
              )}
            </div>
          );
        })}
      </nav>

      {/* User info at bottom */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                {user?.first_name?.[0]}
                {user?.last_name?.[0]}
              </span>
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
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
      )}
    </div>
  );
};

export default EnhancedSidebar;
