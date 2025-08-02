import React from "react";
import {
  AlertTriangle,
  Bell,
  Clock,
  Users,
  FileText,
  Activity,
} from "lucide-react";
import ComingSoon from "../../components/common/ComingSoon";

const IncidentManagement: React.FC = () => {
  const features = [
    "Incident reporting and intake system",
    "Automated incident classification and prioritization",
    "Real-time incident tracking and status updates",
    "Incident response team assignment and notifications",
    "Escalation workflows and SLA management",
    "Root cause analysis documentation and tracking",
    "Incident timeline and activity logging",
    "Integration with audit findings and risk assessments",
    "Automated regulatory reporting for security incidents",
    "Post-incident review and lessons learned capture",
    "Incident metrics and performance dashboards",
    "Communication templates and stakeholder notifications",
    "Evidence collection and forensic documentation",
    "Corrective action planning and tracking",
    "Integration with external security tools and SIEM",
    "Mobile incident reporting capabilities",
  ];

  return (
    <ComingSoon
      title="Incident Management System"
      description="Comprehensive incident management platform for tracking, investigating, and resolving security incidents, operational issues, and compliance breaches. Streamline incident response with automated workflows and real-time collaboration."
      icon={AlertTriangle}
      features={features}
      estimatedDate="Q4 2024"
      priority="high"
      showNotifyButton={true}
    />
  );
};

export default IncidentManagement;
