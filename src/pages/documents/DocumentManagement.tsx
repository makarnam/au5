import React from "react";
import {
  FileText,
  Upload,
  FolderOpen,
  Search,
  Archive,
  Lock,
} from "lucide-react";
import ComingSoon from "../../components/common/ComingSoon";

const DocumentManagement: React.FC = () => {
  const features = [
    "Centralized document repository and storage",
    "Version control and document history tracking",
    "Advanced search and filtering capabilities",
    "Document categorization and tagging system",
    "Access control and permission management",
    "Automated document retention policies",
    "Integration with audit workflows and findings",
    "Bulk document upload and processing",
    "Document approval workflows and e-signatures",
    "Compliance document templates and standards",
    "OCR (Optical Character Recognition) for scanned documents",
    "Document sharing and collaboration tools",
    "Audit trail and document access logging",
    "Integration with cloud storage providers",
    "Mobile document access and management",
    "Automated document classification using AI",
  ];

  return (
    <ComingSoon
      title="Document Management System"
      description="Comprehensive document management solution for audit evidence, compliance documentation, and organizational knowledge. Streamline document workflows with AI-powered classification and automated retention policies."
      icon={FileText}
      features={features}
      estimatedDate="Q2 2024"
      priority="medium"
      showNotifyButton={true}
    />
  );
};

export default DocumentManagement;
