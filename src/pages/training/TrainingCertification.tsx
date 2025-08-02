import React from "react";
import {
  GraduationCap,
  BookOpen,
  Award,
  Users,
  Calendar,
  Target,
} from "lucide-react";
import ComingSoon from "../../components/common/ComingSoon";

const TrainingCertification: React.FC = () => {
  const features = [
    "Comprehensive training program management",
    "Role-based training curriculum and pathways",
    "Certification tracking and renewal management",
    "Interactive learning modules and assessments",
    "Compliance training requirements mapping",
    "Training effectiveness measurement and analytics",
    "Automated training assignment and scheduling",
    "Integration with HR systems and employee records",
    "Training completion tracking and reporting",
    "Customizable training content and materials",
    "Virtual and in-person training session management",
    "Training feedback and evaluation collection",
    "Skills gap analysis and competency mapping",
    "Third-party training provider integration",
    "Mobile learning platform and offline access",
    "Gamification and learning engagement features",
  ];

  return (
    <ComingSoon
      title="Training & Certification Management"
      description="Comprehensive training and certification management system for compliance, security awareness, and professional development. Track certifications, manage training programs, and ensure organizational competency requirements are met."
      icon={GraduationCap}
      features={features}
      estimatedDate="Q4 2024"
      priority="medium"
      showNotifyButton={true}
    />
  );
};

export default TrainingCertification;
