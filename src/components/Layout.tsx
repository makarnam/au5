import React, { useState } from "react";
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
  Globe,
  BookOpen,
  Building2,
  GraduationCap,
  HardDrive,
} from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { getUserRoleLabel, getRoleColor } from "../utils";
import { motion, AnimatePresence } from "framer-motion";
 // Ensure NotificationBell is statically imported to work with Vite/ESM
 import NotificationBell from "./notifications/NotificationBell";
 import ComposeNotificationModal from "./notifications/ComposeNotificationModal";

const Layout: React.FC = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut, checkPermission } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);

  const navigation = [
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
          name: "Upcoming Schedules",
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
      name: "Audit Planning",
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
          name: "Dashboard",
          href: "/audit-planning",
          current: location.pathname === "/audit-planning",
        },
        {
          name: "Audit Universe",
          href: "/audit-planning/universe",
          current: location.pathname === "/audit-planning/universe",
        },
        {
          name: "Audit Plans",
          href: "/audit-planning/plans",
          current: location.pathname === "/audit-planning/plans",
        },
        {
          name: "Resource Management",
          href: "/audit-planning/resources",
          current: location.pathname === "/audit-planning/resources",
        },
        {
          name: "Competencies",
          href: "/audit-planning/competencies",
          current: location.pathname === "/audit-planning/competencies",
        },
        {
          name: "Training Needs",
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
          name: "All Risks",
          href: "/risks",
          current: location.pathname === "/risks",
        },
        {
          name: "Dashboard",
          href: "/risks/dashboard",
          current: location.pathname === "/risks/dashboard",
        },
        {
          name: "Second Dashboard",
          href: "/risks/dashboard-2",
          current: location.pathname === "/risks/dashboard-2",
        },
        {
          name: "Create",
          href: "/risks/create",
          current: location.pathname === "/risks/create",
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
    },
    {
      name: t("navigation.workflow"),
      href: "/workflows",
      icon: Workflow,
      current: location.pathname.startsWith("/workflows"),
      roles: ["cro", "admin", "super_admin"],
    },
    {
      name: t("navigation.aiAssistant"),
      // Align with existing AI Assistant page route in the app
      href: "/ai/assistant",
      icon: Bot,
      current:
        location.pathname === "/ai/assistant" ||
        location.pathname.startsWith("/ai/assistant/"),
      roles: [
        "auditor",
        "reviewer",
        "supervisor_auditor",
        "cro",
        "admin",
        "super_admin",
      ],
      // Provide a simple fallback navigate if route exists but page renders empty due to stale state
      onClick: () => navigate("/ai/assistant"),
    },
    {
      name: "Compliance",
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
          name: "Frameworks",
          href: "/compliance/frameworks",
          current: location.pathname === "/compliance/frameworks",
        },
        {
          name: "Requirements",
          href: "/compliance/requirements",
          current: location.pathname === "/compliance/requirements",
        },
        {
          name: "Profiles",
          href: "/compliance/profiles",
          current: location.pathname === "/compliance/profiles",
        },
        {
          name: "Mapping",
          href: "/compliance/mapping",
          current: location.pathname === "/compliance/mapping",
        },
        {
          name: "Import",
          href: "/compliance/import",
          current: location.pathname === "/compliance/import",
        }
        ,
        {
          name: "Importer 2",
          href: "/compliance/importer-2",
          current: location.pathname === "/compliance/importer-2",
        }
      ]
     },
    {
      name: "Privacy",
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
        { name: "Dashboard", href: "/privacy/dashboard", current: location.pathname === "/privacy/dashboard" },
        { name: "DPIA", href: "/privacy/dpia", current: location.pathname === "/privacy/dpia" },
        { name: "RoPA Register", href: "/privacy/ropa", current: location.pathname === "/privacy/ropa" },
      ],
    },
    {
      name: "Regulations (RCM)",
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
        { name: "All Regulations", href: "/regulations", current: location.pathname === "/regulations" },
        { name: "Impact Dashboard", href: "/regulations/impact-dashboard", current: location.pathname === "/regulations/impact-dashboard" },
      ]
    },
    {
      name: "Governance",
      href: "/governance",
      icon: Shield,
      current: location.pathname.startsWith("/governance"),
      roles: ["auditor", "supervisor_auditor", "cro", "admin", "super_admin"],
      children: [
        {
          name: "Dashboard",
          href: "/governance/dashboard",
          current: location.pathname === "/governance/dashboard",
        },
        {
          name: "Calendar",
          href: "/governance/calendar",
          current: location.pathname === "/governance/calendar",
        },
        {
          name: "Reporting",
          href: "/governance/reporting",
          current: location.pathname === "/governance/reporting",
        },
        {
          name: "Training",
          href: "/governance/training",
          current: location.pathname === "/governance/training",
        }
      ],
    },
    {
      name: "Business Continuity Management",
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
          name: "Dashboard",
          href: "/bcp",
          current: location.pathname === "/bcp",
        },
        {
          name: "Create Plan",
          href: "/bcp/create",
          current: location.pathname === "/bcp/create",
        },
        {
          name: "Plan Details",
          href: "/bcp/placeholder",
          current: location.pathname.startsWith("/bcp/") && location.pathname !== "/bcp" && location.pathname !== "/bcp/create",
        }
      ]
    },
    {
      name: "Advanced Analytics",
      href: "/analytics",
      icon: BarChart3,
      current: location.pathname.startsWith("/analytics"),
      roles: ["reviewer", "supervisor_auditor", "cro", "admin", "super_admin"],
      comingSoon: true,
    },
    {
      name: "Document Management",
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
      comingSoon: true,
    },
    {
      name: "Policies",
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
          name: "All Policies",
          href: "/policies",
          current: location.pathname === "/policies",
        },
        {
          name: "Create / Edit",
          href: "/policies",
          current: location.pathname.startsWith("/policies/"),
        },
      ],
    },
    {
      name: "Incident Management",
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
      comingSoon: true,
    },
    {
      name: "Vendor Management",
      href: "/vendors",
      icon: Building2,
      current: location.pathname.startsWith("/vendors"),
      roles: [
        "business_unit_manager",
        "reviewer",
        "supervisor_auditor",
        "cro",
        "admin",
        "super_admin",
      ],
      comingSoon: true,
    },
    {
      name: "Third Party Risk Management",
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
          name: "Dashboard",
          href: "/third-party-risk-management",
          current: location.pathname === "/third-party-risk-management",
        },
        {
          name: "Third Party Catalog",
          href: "/third-party-risk-management/catalog",
          current: location.pathname === "/third-party-risk-management/catalog",
        },
        {
          name: "Create Third Party",
          href: "/third-party-risk-management/create",
          current: location.pathname === "/third-party-risk-management/create",
        },
        {
          name: "Assessments",
          href: "/third-party-risk-management/assessments",
          current: location.pathname === "/third-party-risk-management/assessments",
        },
        {
          name: "Engagements",
          href: "/third-party-risk-management/engagements",
          current: location.pathname.startsWith("/third-party-risk-management/engagements"),
        },
        {
          name: "Incident Management",
          href: "/third-party-risk-management/incidents",
          current: location.pathname === "/third-party-risk-management/incidents",
        },
        {
          name: "Contract Management",
          href: "/third-party-risk-management/contracts",
          current: location.pathname === "/third-party-risk-management/contracts",
        },
        {
          name: "Performance Monitoring",
          href: "/third-party-risk-management/performance",
          current: location.pathname === "/third-party-risk-management/performance",
        },
        {
          name: "Security Monitoring",
          href: "/third-party-risk-management/security",
          current: location.pathname === "/third-party-risk-management/security",
        },
        {
          name: "Due Diligence Workflow",
          href: "/third-party-risk-management/due-diligence",
          current: location.pathname === "/third-party-risk-management/due-diligence",
        },
      ]
    },
    {
      name: "ESG Management",
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
          name: "Dashboard",
          href: "/esg",
          current: location.pathname === "/esg",
        },
        {
          name: "Comprehensive ESG",
          href: "/esg/comprehensive",
          current: location.pathname === "/esg/comprehensive",
        },
        {
          name: "Programs",
          href: "/esg/programs",
          current: location.pathname === "/esg/programs",
        },
        {
          name: "Carbon Management",
          href: "/esg/carbon",
          current: location.pathname === "/esg/carbon",
        },
        {
          name: "Disclosures",
          href: "/esg/disclosures",
          current: location.pathname === "/esg/disclosures",
        },
        {
          name: "Portfolio Assessment",
          href: "/esg/portfolio",
          current: location.pathname === "/esg/portfolio",
        },
        {
          name: "Goals Management",
          href: "/esg/goals",
          current: location.pathname === "/esg/goals",
        },
        {
          name: "Stakeholder Engagement",
          href: "/esg/stakeholders",
          current: location.pathname === "/esg/stakeholders",
        },
        {
          name: "Materiality Calculator",
          href: "/esg/materiality",
          current: location.pathname === "/esg/materiality",
        },
      ],
    },
    {
      name: "Training & Certification",
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
      comingSoon: true,
    },
    {
      name: "Asset Management",
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
      comingSoon: true,
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
  ];

  const languages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "es", name: "Español", flag: "🇪🇸" },
    { code: "fr", name: "Français", flag: "🇫🇷" },
    { code: "de", name: "Deutsch", flag: "🇩🇪" },
    { code: "tr", name: "Türkçe", flag: "🇹🇷" },
  ];

  const currentLanguage =
    languages.find((lang) => lang.code === i18n.language) || languages[0];

  const filteredNavigation = navigation.filter((item) =>
    item.roles.some((role) => checkPermission(role as any)),
  );

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth/sign-in", { replace: true });
  };

  const changeLanguage = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    setLanguageMenuOpen(false);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center px-6 py-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div className="ml-3">
            <h1 className="text-xl font-bold text-gray-900">AI Auditor</h1>
            <p className="text-xs text-gray-500">GRC Platform</p>
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
                  {item.comingSoon && (
                    <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                      Coming Soon
                    </span>
                  )}
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
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-80">
          <div className="flex flex-col flex-grow bg-white border-r border-gray-200 overflow-hidden">
            <SidebarContent />
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
              className="fixed inset-y-0 left-0 z-50 w-80 bg-white lg:hidden"
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
              <SidebarContent />
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
                  New Message
                </button>
              </div>
              {/* Language Selector */}
              <div className="relative">
                <button
                  type="button"
                  className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                  onClick={() => setLanguageMenuOpen(!languageMenuOpen)}
                >
                  <Globe className="h-5 w-5" />
                </button>

                <AnimatePresence>
                  {languageMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50"
                    >
                      <div className="py-1">
                        {languages.map((language) => (
                          <button
                            key={language.code}
                            onClick={() => changeLanguage(language.code)}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center space-x-2 ${
                              i18n.language === language.code
                                ? "bg-blue-50 text-blue-600"
                                : "text-gray-700"
                            }`}
                          >
                            <span>{language.flag}</span>
                            <span>{language.name}</span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

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
          <Outlet />
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
