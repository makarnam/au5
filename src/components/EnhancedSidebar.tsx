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

  // Memoize menuCategories to prevent unnecessary re-renders
  const menuCategories = useMemo(() => [
    {
      id: "dashboard",
      name: "Main Dashboard",
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
      name: "Risk Management",
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
            { name: "All Risks", href: "/risks", current: location.pathname === "/risks" },
            { name: "Dashboard", href: "/risks/dashboard", current: location.pathname === "/risks/dashboard" },
            { name: "Second Dashboard", href: "/risks/dashboard-2", current: location.pathname === "/risks/dashboard-2" },
            { name: "Loss Event Management", href: "/risks/loss-events", current: location.pathname === "/risks/loss-events" },
            { name: "Key Indicator Management", href: "/risks/key-indicators", current: location.pathname === "/risks/key-indicators" },
            { name: "Operational Risk Management", href: "/risks/operational-risk", current: location.pathname === "/risks/operational-risk" },
            { name: "Create", href: "/risks/create", current: location.pathname === "/risks/create" }
          ]
        },
        {
          name: "Third Party Risk Management",
          href: "/third-party-risk-management",
          icon: Building2,
          current: location.pathname.startsWith("/third-party-risk-management"),
          roles: ["business_unit_manager", "reviewer", "supervisor_auditor", "cro", "admin", "super_admin"],
          children: [
            { name: "Dashboard", href: "/third-party-risk-management", current: location.pathname === "/third-party-risk-management" },
            { name: "Third Party Catalog", href: "/third-party-risk-management/catalog", current: location.pathname === "/third-party-risk-management/catalog" },
            { name: "Create Third Party", href: "/third-party-risk-management/create", current: location.pathname === "/third-party-risk-management/create" },
            { name: "Assessments", href: "/third-party-risk-management/assessments", current: location.pathname === "/third-party-risk-management/assessments" },
            { name: "Engagements", href: "/third-party-risk-management/engagements", current: location.pathname.startsWith("/third-party-risk-management/engagements") },
            { name: "Incident Management", href: "/third-party-risk-management/incidents", current: location.pathname === "/third-party-risk-management/incidents" },
            { name: "Contract Management", href: "/third-party-risk-management/contracts", current: location.pathname === "/third-party-risk-management/contracts" },
            { name: "Performance Monitoring", href: "/third-party-risk-management/performance", current: location.pathname === "/third-party-risk-management/performance" },
            { name: "Security Monitoring", href: "/third-party-risk-management/security", current: location.pathname === "/third-party-risk-management/security" },
            { name: "Due Diligence Workflow", href: "/third-party-risk-management/due-diligence", current: location.pathname === "/third-party-risk-management/due-diligence" },
          ]
        },
        {
          name: "IT & Security Risk Management",
          href: "/it-security",
          icon: Lock,
          current: location.pathname.startsWith("/it-security"),
          roles: ["business_unit_manager", "reviewer", "supervisor_auditor", "cro", "admin", "super_admin"],
          children: [
            { name: "Dashboard", href: "/it-security", current: location.pathname === "/it-security" },
            { name: "Security Incidents", href: "/it-security/incidents", current: location.pathname.startsWith("/it-security/incidents") },
            { name: "Vulnerabilities", href: "/it-security/vulnerabilities", current: location.pathname.startsWith("/it-security/vulnerabilities") },
            { name: "IT Controls", href: "/it-security/controls", current: location.pathname.startsWith("/it-security/controls") },
            { name: "Security Policies", href: "/it-security/policies", current: location.pathname.startsWith("/it-security/policies") },
            { name: "PCI Compliance", href: "/it-security/pci", current: location.pathname.startsWith("/it-security/pci") },
            { name: "ISO 27001 (ISMS)", href: "/it-security/isms", current: location.pathname.startsWith("/it-security/isms") },
            { name: "CMMC Management", href: "/it-security/cmmc", current: location.pathname.startsWith("/it-security/cmmc") },
            { name: "Security Monitoring", href: "/it-security/monitoring", current: location.pathname.startsWith("/it-security/monitoring") },
            { name: "Security Assets", href: "/it-security/assets", current: location.pathname.startsWith("/it-security/assets") },
          ],
        },
        {
          name: "ESG Management",
          href: "/esg",
          icon: Leaf,
          current: location.pathname.startsWith("/esg"),
          roles: ["business_unit_manager", "reviewer", "supervisor_auditor", "cro", "admin", "super_admin"],
          children: [
            { name: "Dashboard", href: "/esg", current: location.pathname === "/esg" },
            { name: "Comprehensive ESG", href: "/esg/comprehensive", current: location.pathname === "/esg/comprehensive" },
            { name: "Programs", href: "/esg/programs", current: location.pathname === "/esg/programs" },
            { name: "Carbon Management", href: "/esg/carbon", current: location.pathname === "/esg/carbon" },
            { name: "Disclosures", href: "/esg/disclosures", current: location.pathname === "/esg/disclosures" },
            { name: "Portfolio Assessment", href: "/esg/portfolio", current: location.pathname === "/esg/portfolio" },
            { name: "Goals Management", href: "/esg/goals", current: location.pathname === "/esg/goals" },
            { name: "Stakeholder Engagement", href: "/esg/stakeholders", current: location.pathname === "/esg/stakeholders" },
            { name: "Materiality Calculator", href: "/esg/materiality", current: location.pathname === "/esg/materiality" },
          ],
        },
      ],
    },
    {
      id: "audit-compliance",
      name: "Audit & Compliance",
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
            { name: "Upcoming Schedules", href: "/audits/schedules", current: location.pathname === "/audits/schedules" },
          ],
        },
        {
          name: "Audit Planning",
          href: "/audit-planning",
          icon: BarChart3,
          current: location.pathname.startsWith("/audit-planning"),
          roles: ["auditor", "reviewer", "supervisor_auditor", "cro", "admin", "super_admin"],
          children: [
            { name: "Dashboard", href: "/audit-planning", current: location.pathname === "/audit-planning" },
            { name: "Audit Universe", href: "/audit-planning/universe", current: location.pathname === "/audit-planning/universe" },
            { name: "Audit Plans", href: "/audit-planning/plans", current: location.pathname === "/audit-planning/plans" },
            { name: "Resource Management", href: "/audit-planning/resources", current: location.pathname === "/audit-planning/resources" },
            { name: "Competencies", href: "/audit-planning/competencies", current: location.pathname === "/audit-planning/competencies" },
            { name: "Training Needs", href: "/audit-planning/training", current: location.pathname === "/audit-planning/training" },
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
          name: "Compliance",
          href: "/compliance/frameworks",
          icon: Gavel,
          current: location.pathname.startsWith("/compliance"),
          roles: ["auditor", "reviewer", "supervisor_auditor", "cro", "admin", "super_admin"],
          children: [
            { name: "Frameworks", href: "/compliance/frameworks", current: location.pathname === "/compliance/frameworks" },
            { name: "Requirements", href: "/compliance/requirements", current: location.pathname === "/compliance/requirements" },
            { name: "Profiles", href: "/compliance/profiles", current: location.pathname === "/compliance/profiles" },
            { name: "Mapping", href: "/compliance/mapping", current: location.pathname === "/compliance/mapping" },
            { name: "Import", href: "/compliance/import", current: location.pathname === "/compliance/import" },
            { name: "Importer 2", href: "/compliance/importer-2", current: location.pathname === "/compliance/importer-2" }
          ]
        },
        {
          name: "Privacy",
          href: "/privacy/dashboard",
          icon: Eye,
          current: location.pathname.startsWith("/privacy"),
          roles: ["auditor", "reviewer", "supervisor_auditor", "cro", "admin", "super_admin"],
          children: [
            { name: "Dashboard", href: "/privacy/dashboard", current: location.pathname === "/privacy/dashboard" },
            { name: "DPIA", href: "/privacy/dpia", current: location.pathname === "/privacy/dpia" },
            { name: "RoPA Register", href: "/privacy/ropa", current: location.pathname === "/privacy/ropa" },
          ],
        },
        {
          name: "Regulations (RCM)",
          href: "/regulations",
          icon: Scale,
          current: location.pathname.startsWith("/regulations"),
          roles: ["auditor", "reviewer", "supervisor_auditor", "cro", "admin", "super_admin"],
          children: [
            { name: "All Regulations", href: "/regulations", current: location.pathname === "/regulations" },
            { name: "Impact Dashboard", href: "/regulations/impact-dashboard", current: location.pathname === "/regulations/impact-dashboard" },
          ]
        },
        {
          name: t("navigation.findings"),
          href: "/findings",
          icon: Search,
          current: location.pathname.startsWith("/findings"),
          roles: ["auditor", "reviewer", "supervisor_auditor", "cro", "admin", "super_admin"],
          children: [
            { name: "All Findings", href: "/findings", current: location.pathname === "/findings" },
            { name: "Dashboard", href: "/findings/dashboard", current: location.pathname === "/findings/dashboard" },
            { name: "Create", href: "/findings/create", current: location.pathname === "/findings/create" },
          ],
        },
      ],
    },
    {
      id: "business-processes",
      name: "Business Processes",
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
          name: "Entity Relationships",
          href: "/relationships",
          icon: Network,
          current: location.pathname.startsWith("/relationships"),
          roles: ["auditor", "reviewer", "supervisor_auditor", "cro", "admin", "super_admin"],
        },
        {
          name: "Document Management",
          href: "/documents",
          icon: FileText,
          current: location.pathname.startsWith("/documents"),
          roles: ["auditor", "reviewer", "supervisor_auditor", "cro", "admin", "super_admin"],
        },
        {
          name: "Policies",
          href: "/policies",
          icon: BookOpen,
          current: location.pathname.startsWith("/policies"),
          roles: ["business_unit_manager", "auditor", "reviewer", "supervisor_auditor", "cro", "admin", "super_admin"],
          children: [
            { name: "All Policies", href: "/policies", current: location.pathname === "/policies" },
            { name: "Create / Edit", href: "/policies", current: location.pathname.startsWith("/policies/") },
          ],
        },
      ],
    },
    {
      id: "ai-analytics",
      name: "AI & Analytics",
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
          name: "AI Governance",
          href: "/ai-governance",
          icon: Bot,
          current: location.pathname.startsWith("/ai-governance"),
          roles: ["auditor", "reviewer", "supervisor_auditor", "cro", "admin", "super_admin"],
          children: [
            { name: "Dashboard", href: "/ai-governance/dashboard", current: location.pathname === "/ai-governance/dashboard" },
            { name: "AI Models", href: "/ai-governance/models", current: location.pathname === "/ai-governance/models" },
            { name: "Controls Library", href: "/ai-governance/controls", current: location.pathname === "/ai-governance/controls" },
          ],
        },
        {
          name: "Advanced Analytics",
          href: "/analytics",
          icon: BarChart3,
          current: location.pathname.startsWith("/analytics"),
          roles: ["reviewer", "supervisor_auditor", "cro", "admin", "super_admin"],
        },
      ],
    },
    {
      id: "operational-management",
      name: "Operational Management",
      icon: Briefcase,
      color: "from-yellow-500 to-orange-500",
      items: [
        {
          name: "Resilience Management",
          href: "/resilience",
          icon: Shield,
          current: location.pathname.startsWith("/resilience"),
          roles: ["business_unit_manager", "auditor", "reviewer", "supervisor_auditor", "cro", "admin", "super_admin"],
          children: [
            { name: "Dashboard", href: "/resilience", current: location.pathname === "/resilience" },
            { name: "Incident Management", href: "/resilience/incidents", current: location.pathname === "/resilience/incidents" },
            { name: "Business Impact Analysis", href: "/resilience/bia", current: location.pathname.startsWith("/resilience/bia") },
            { name: "Crisis Management", href: "/resilience/crisis", current: location.pathname === "/resilience/crisis" },
            { name: "Scenario Analysis", href: "/resilience/scenarios", current: location.pathname === "/resilience/scenarios" },
            { name: "Metrics Dashboard", href: "/resilience/metrics", current: location.pathname === "/resilience/metrics" }
          ]
        },
        {
          name: "Business Continuity Management",
          href: "/bcp",
          icon: RefreshCw,
          current: location.pathname.startsWith("/bcp"),
          roles: ["auditor", "reviewer", "supervisor_auditor", "cro", "admin", "super_admin"],
          children: [
            { name: "Dashboard", href: "/bcp", current: location.pathname === "/bcp" },
            { name: "Create Plan", href: "/bcp/create", current: location.pathname === "/bcp/create" }
          ]
        },
        {
          name: "Incident Management",
          href: "/incidents",
          icon: AlertCircle,
          current: location.pathname.startsWith("/incidents"),
          roles: ["auditor", "reviewer", "supervisor_auditor", "cro", "admin", "super_admin"],
        },
        {
          name: "Training & Certification",
          href: "/training",
          icon: GraduationCap,
          current: location.pathname.startsWith("/training"),
          roles: ["business_unit_user", "business_unit_manager", "auditor", "reviewer", "supervisor_auditor", "cro", "admin", "super_admin"],
        },
      ],
    },
    {
      id: "system-management",
      name: "System Management",
      icon: Settings,
      color: "from-gray-500 to-slate-500",
      items: [
        {
          name: "Governance",
          href: "/governance",
          icon: Gavel,
          current: location.pathname.startsWith("/governance"),
          roles: ["auditor", "supervisor_auditor", "cro", "admin", "super_admin"],
          children: [
            { name: "Dashboard", href: "/governance/dashboard", current: location.pathname === "/governance/dashboard" },
            { name: "Calendar", href: "/governance/calendar", current: location.pathname === "/governance/calendar" },
            { name: "Reporting", href: "/governance/reporting", current: location.pathname === "/governance/reporting" },
            { name: "Training", href: "/governance/training", current: location.pathname === "/governance/training" }
          ],
        },
        {
          name: "Asset Management",
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

  // Memoize filtered categories to prevent unnecessary re-renders
  const filteredCategories = useMemo(() => 
    menuCategories.map(category => ({
      ...category,
      items: category.items.filter(item =>
        item.roles.some(role => checkPermission(role as any))
      )
    })).filter(category => category.items.length > 0),
    [menuCategories, checkPermission]
  );

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

  return (
    <div className={`flex flex-col h-full bg-white border-r border-gray-200 transition-all duration-300 ${
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
              <h1 className="text-xl font-bold text-gray-900">AI Auditor</h1>
              <p className="text-xs text-gray-500">GRC Platform</p>
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
            <button
              onClick={onSwitchToLegacy}
              className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              title="Switch to legacy menu"
            >
              <Palette className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

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
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                }`}
                title={isCollapsed ? category.name : undefined}
              >
                <div className="flex items-center flex-1">
                  <CategoryIcon
                    className={`${isCollapsed ? 'mx-auto' : 'mr-3'} h-5 w-5 transition-colors ${
                      hasActiveItem
                        ? "text-white"
                        : "text-gray-400 group-hover:text-gray-500"
                    }`}
                  />
                  {!isCollapsed && <span className="flex-1">{category.name}</span>}
                </div>
                {!isCollapsed && (
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${isExpanded ? "transform rotate-180" : ""} ${
                      hasActiveItem ? "text-white" : "text-gray-400"
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
                              ? "bg-blue-50 text-blue-700 font-medium"
                              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                          }`}
                        >
                          <ItemIcon className="mr-2 h-4 w-4" />
                          <span className="flex-1">{item.name}</span>
                          {hasChildren && (
                            <ChevronDown
                              className={`h-3 w-3 transition-transform ${isItemExpanded ? "transform rotate-180" : ""}`}
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
                                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
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
      )}
    </div>
  );
};

export default EnhancedSidebar;
