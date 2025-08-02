import React from "react";
import { HardDrive, Shield, Tag, MapPin, Clock, Activity } from "lucide-react";
import ComingSoon from "../../components/common/ComingSoon";

const AssetManagement: React.FC = () => {
  const features = [
    "Comprehensive IT asset inventory and tracking",
    "Asset lifecycle management (procurement to disposal)",
    "Hardware and software asset discovery and cataloging",
    "Asset classification and risk categorization",
    "License management and compliance tracking",
    "Asset location tracking and movement history",
    "Depreciation calculations and financial reporting",
    "Integration with vulnerability management systems",
    "Asset relationship mapping and dependency tracking",
    "Automated asset compliance monitoring",
    "Asset audit trails and change management",
    "Mobile asset scanning and barcode/QR code support",
    "Asset maintenance scheduling and tracking",
    "Integration with procurement and finance systems",
    "Asset risk assessment and security scoring",
    "Custom asset fields and metadata management",
  ];

  return (
    <ComingSoon
      title="IT Asset Management"
      description="Complete IT asset management solution for tracking, managing, and securing your organization's technology assets. Maintain comprehensive visibility of hardware, software, and digital assets throughout their lifecycle."
      icon={HardDrive}
      features={features}
      estimatedDate="Q1 2025"
      priority="medium"
      showNotifyButton={true}
    />
  );
};

export default AssetManagement;
