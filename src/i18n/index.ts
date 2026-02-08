import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Import split translation modules
import { commonTranslations } from "./common";
import { authTranslations } from "./auth";
import { navigationTranslations } from "./navigation";
import { sidebarTranslations } from "./sidebar";
import { dashboardTranslations } from "./dashboard";
import { controlsTranslations } from "./controls";
import { profileTranslations } from "./profile";
import { governanceTranslations } from "./governance";
import { reportsTranslations } from "./reports";
import { auditsTranslations } from "./audits";
import { risksTranslations } from "./risks";
import { auditPlanningTranslations } from "./audit-planning";
import { settingsTranslations } from "./settings";
import { reportWizardTranslations } from "./report-wizard";
import { otherTranslations } from "./other";

// Combine all translations
const en = {
  common: commonTranslations.en,
  auth: authTranslations.en,
  navigation: navigationTranslations.en,
  sidebar: sidebarTranslations.en,
  dashboard: dashboardTranslations.en,
  settings: settingsTranslations.en,
  profile: profileTranslations.en,
  governance: governanceTranslations.en,
  reports: reportsTranslations.en,
  audits: auditsTranslations.en,
  controls: controlsTranslations.en,
  risks: risksTranslations.en,
  reportWizard: reportWizardTranslations.en,
  auditPlanning: auditPlanningTranslations.en,
  other: otherTranslations.en,
};

const es = {
  common: commonTranslations.es,
  auth: authTranslations.es,
  navigation: navigationTranslations.es,
  sidebar: sidebarTranslations.es,
  dashboard: dashboardTranslations.es,
  settings: settingsTranslations.es,
  profile: profileTranslations.es,
  governance: governanceTranslations.es,
  reports: reportsTranslations.es,
  audits: auditsTranslations.es,
  controls: controlsTranslations.es,
  risks: risksTranslations.es,
  reportWizard: reportWizardTranslations.es,
  auditPlanning: auditPlanningTranslations.es,
  other: otherTranslations.es,
};

const tr = {
  common: commonTranslations.tr,
  auth: authTranslations.tr,
  navigation: navigationTranslations.tr,
  sidebar: sidebarTranslations.tr,
  dashboard: dashboardTranslations.tr,
  settings: settingsTranslations.tr,
  profile: profileTranslations.tr,
  governance: governanceTranslations.tr,
  reports: reportsTranslations.tr,
  audits: auditsTranslations.tr,
  controls: controlsTranslations.tr,
  risks: risksTranslations.tr,
  reportWizard: reportWizardTranslations.tr,
  auditPlanning: auditPlanningTranslations.tr,
  other: otherTranslations.tr,
};

const resources = {
  en: { translation: en },
  es: { translation: es },
  tr: { translation: tr },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"],
    },
  });

export default i18n;
