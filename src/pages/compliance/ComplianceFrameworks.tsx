import React from "react";
import {
  Shield,
  BookOpen,
  CheckSquare,
  FileText,
  Globe,
  Scale,
} from "lucide-react";
import ComingSoon from "../../components/common/ComingSoon";

const ComplianceFrameworks: React.FC = () => {
  const features = [
    "SOX (Sarbanes-Oxley) compliance framework",
    "ISO 27001 security management standards",
    "GDPR data protection requirements",
    "HIPAA healthcare compliance",
    "PCI DSS payment card industry standards",
    "NIST cybersecurity framework",
    "Custom framework creation and management",
    "Framework mapping and cross-referencing",
    "Automated compliance gap analysis",
    "Real-time compliance monitoring",
    "Evidence collection and documentation",
    "Compliance reporting and dashboards",
  ];

  return (
    <ComingSoon
      title="Compliance Framework Management"
      description="Comprehensive compliance framework management system supporting multiple industry standards including SOX, ISO 27001, GDPR, HIPAA, and more. Streamline your compliance processes with automated monitoring and reporting."
      icon={Shield}
      features={features}
      estimatedDate="Q2 2024"
      priority="high"
      showNotifyButton={true}
    />
  );
};

export default ComplianceFrameworks;
