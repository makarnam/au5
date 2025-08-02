import React from "react";
import {
  Building2,
  Shield,
  FileCheck,
  Users,
  DollarSign,
  AlertCircle,
} from "lucide-react";
import ComingSoon from "../../components/common/ComingSoon";

const VendorManagement: React.FC = () => {
  const features = [
    "Vendor onboarding and qualification workflows",
    "Third-party risk assessment and scoring",
    "Vendor contract management and renewal tracking",
    "Due diligence documentation and evidence collection",
    "Vendor performance monitoring and KPI tracking",
    "Compliance certification tracking and validation",
    "Vendor audit scheduling and management",
    "Risk-based vendor categorization and tiering",
    "Automated vendor assessment questionnaires",
    "Integration with procurement and finance systems",
    "Vendor communication and collaboration portal",
    "Regulatory compliance monitoring (SOX, GDPR, etc.)",
    "Vendor incident and breach notification management",
    "Supply chain risk visualization and mapping",
    "Automated vendor risk scoring and alerts",
    "Vendor offboarding and data security procedures",
  ];

  return (
    <ComingSoon
      title="Vendor Risk Management"
      description="Comprehensive third-party vendor risk management platform for assessing, monitoring, and managing vendor relationships. Ensure compliance and minimize supply chain risks with automated assessments and continuous monitoring."
      icon={Building2}
      features={features}
      estimatedDate="Q3 2024"
      priority="medium"
      showNotifyButton={true}
    />
  );
};

export default VendorManagement;
