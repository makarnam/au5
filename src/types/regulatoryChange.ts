export interface RegulatoryChange {
  id: string;
  title: string;
  description: string;
  regulationId: string;
  changeType: 'new_regulation' | 'amendment' | 'repeal' | 'guidance_update' | 'enforcement_change';
  jurisdiction: string;
  authority: string;
  publicationDate: Date;
  effectiveDate: Date;
  complianceDeadline?: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  impactLevel: 'minimal' | 'moderate' | 'significant' | 'major';
  affectedIndustries: string[];
  affectedBusinessUnits: string[];
  affectedProcesses: string[];
  affectedSystems: string[];
  requirements: RegulatoryRequirement[];
  complianceActions: ComplianceAction[];
  riskAssessment: RiskAssessment;
  status: 'draft' | 'published' | 'in_review' | 'implemented' | 'monitoring';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTo?: string;
  estimatedEffort: number; // hours
  estimatedCost: number;
  actualEffort?: number;
  actualCost?: number;
  tags: string[];
  attachments: Attachment[];
  comments: Comment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface RegulatoryRequirement {
  id: string;
  regulatoryChangeId: string;
  requirementType: 'mandatory' | 'recommended' | 'optional';
  category: 'technical' | 'process' | 'documentation' | 'training' | 'monitoring' | 'reporting';
  title: string;
  description: string;
  specificRequirements: string[];
  complianceCriteria: string[];
  evidenceRequired: string[];
  deadline?: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'verified' | 'non_compliant';
  assignedTo?: string;
  progress: number; // 0-100
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ComplianceAction {
  id: string;
  regulatoryChangeId: string;
  requirementId?: string;
  actionType: 'policy_update' | 'process_change' | 'system_modification' | 'training' | 'documentation' | 'assessment' | 'implementation';
  title: string;
  description: string;
  responsibleParty: string;
  assignedTo: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold';
  startDate: Date;
  dueDate: Date;
  completionDate?: Date;
  estimatedEffort: number;
  actualEffort?: number;
  estimatedCost: number;
  actualCost?: number;
  dependencies: string[]; // IDs of other actions this depends on
  deliverables: string[];
  risks: string[];
  mitigationStrategies: string[];
  progress: number; // 0-100
  notes: string;
  attachments: Attachment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface RiskAssessment {
  id: string;
  regulatoryChangeId: string;
  overallRisk: 'low' | 'medium' | 'high' | 'critical';
  riskFactors: RiskFactor[];
  impactAnalysis: {
    financial: number; // 0-100
    operational: number; // 0-100
    reputational: number; // 0-100
    compliance: number; // 0-100
    strategic: number; // 0-100
  };
  probability: number; // 0-100
  riskScore: number; // calculated
  mitigationStrategies: string[];
  contingencyPlans: string[];
  monitoringMeasures: string[];
  reviewFrequency: 'weekly' | 'monthly' | 'quarterly' | 'annually';
  nextReviewDate: Date;
  assessedBy: string;
  assessmentDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface RiskFactor {
  id: string;
  riskAssessmentId: string;
  factor: string;
  description: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  probability: number; // 0-100
  riskScore: number; // calculated
  mitigationStrategy: string;
  status: 'active' | 'mitigated' | 'accepted';
  createdAt: Date;
}

export interface RegulatoryImpact {
  id: string;
  regulatoryChangeId: string;
  businessUnitId: string;
  impactType: 'direct' | 'indirect' | 'cascading';
  impactAreas: string[];
  currentComplianceLevel: number; // 0-100
  requiredComplianceLevel: number; // 0-100
  gap: number; // calculated
  effortRequired: number; // hours
  costImpact: number;
  timelineImpact: number; // days
  resourceRequirements: string[];
  dependencies: string[];
  risks: string[];
  opportunities: string[];
  recommendations: string[];
  status: 'assessed' | 'in_progress' | 'completed';
  assessedBy: string;
  assessmentDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface RegulatoryMonitoring {
  id: string;
  regulatoryChangeId: string;
  monitoringType: 'compliance' | 'implementation' | 'effectiveness' | 'risk';
  metric: string;
  target: number;
  current: number;
  unit: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  lastMeasurement: Date;
  nextMeasurement: Date;
  trend: 'improving' | 'stable' | 'declining';
  threshold: {
    warning: number;
    critical: number;
  };
  alerts: MonitoringAlert[];
  status: 'active' | 'paused' | 'completed';
  responsibleParty: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MonitoringAlert {
  id: string;
  regulatoryMonitoringId: string;
  alertType: 'warning' | 'critical' | 'info';
  message: string;
  value: number;
  threshold: number;
  isRead: boolean;
  createdAt: Date;
}

export interface RegulatoryDashboard {
  totalChanges: number;
  activeChanges: number;
  criticalChanges: number;
  overdueActions: number;
  complianceRate: number;
  upcomingDeadlines: RegulatoryChange[];
  recentChanges: RegulatoryChange[];
  highPriorityActions: ComplianceAction[];
  riskAlerts: MonitoringAlert[];
  impactSummary: {
    totalEffort: number;
    totalCost: number;
    averageRiskScore: number;
    complianceGap: number;
  };
}

export interface Attachment {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  url: string;
  uploadedBy: string;
  uploadedAt: Date;
}

export interface Comment {
  id: string;
  content: string;
  author: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RegulatoryChangeFilter {
  status?: string[];
  severity?: string[];
  jurisdiction?: string[];
  changeType?: string[];
  priority?: string[];
  assignedTo?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  tags?: string[];
}

export interface RegulatoryChangeReport {
  id: string;
  title: string;
  description: string;
  reportType: 'compliance_status' | 'implementation_progress' | 'risk_assessment' | 'impact_analysis';
  filters: RegulatoryChangeFilter;
  format: 'pdf' | 'excel' | 'csv' | 'json';
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    recipients: string[];
    lastGenerated?: Date;
    nextGeneration?: Date;
  };
  generatedBy: string;
  generatedAt: Date;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  downloadUrl?: string;
}
