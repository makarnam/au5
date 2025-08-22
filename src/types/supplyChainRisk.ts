export interface SupplyChainNode {
  id: string;
  name: string;
  type: 'supplier' | 'manufacturer' | 'distributor' | 'logistics' | 'customer';
  tier: number;
  parentNodeId?: string;
  location: {
    country: string;
    region: string;
    city: string;
    coordinates?: { lat: number; lng: number };
  };
  contactInfo: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  businessInfo: {
    industry: string;
    size: 'small' | 'medium' | 'large';
    annualRevenue?: number;
    employeeCount?: number;
    certifications: string[];
  };
  riskProfile: {
    overallRisk: 'low' | 'medium' | 'high' | 'critical';
    financialRisk: number;
    operationalRisk: number;
    complianceRisk: number;
    geopoliticalRisk: number;
    environmentalRisk: number;
  };
  dependencies: {
    criticality: 'low' | 'medium' | 'high' | 'critical';
    leadTime: number;
    inventoryLevel: number;
    alternativeSources: string[];
  };
  compliance: {
    certifications: string[];
    auditHistory: AuditRecord[];
    lastAuditDate?: Date;
    nextAuditDate?: Date;
  };
  performance: {
    onTimeDelivery: number;
    qualityScore: number;
    costVariance: number;
    responsivenessScore: number;
  };
  status: 'active' | 'inactive' | 'suspended' | 'terminated';
  createdAt: Date;
  updatedAt: Date;
}

export interface SupplyChainRisk {
  id: string;
  nodeId: string;
  riskType: 'financial' | 'operational' | 'compliance' | 'geopolitical' | 'environmental' | 'cybersecurity' | 'natural_disaster' | 'pandemic';
  severity: 'low' | 'medium' | 'high' | 'critical';
  probability: number; // 0-100
  impact: number; // 0-100
  riskScore: number; // calculated
  description: string;
  rootCause: string;
  potentialImpact: string;
  mitigationStrategies: string[];
  contingencyPlans: string[];
  responsibleParty: string;
  status: 'identified' | 'assessed' | 'mitigated' | 'monitored' | 'closed';
  dueDate?: Date;
  completionDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SupplyChainDisruption {
  id: string;
  title: string;
  description: string;
  affectedNodes: string[];
  disruptionType: 'natural_disaster' | 'pandemic' | 'geopolitical' | 'financial' | 'operational' | 'cybersecurity' | 'transportation' | 'supplier_failure';
  severity: 'low' | 'medium' | 'high' | 'critical';
  startDate: Date;
  endDate?: Date;
  estimatedImpact: {
    financial: number;
    operational: number;
    reputational: number;
    customerSatisfaction: number;
  };
  responseActions: DisruptionAction[];
  status: 'active' | 'resolved' | 'monitoring';
  lessonsLearned: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface DisruptionAction {
  id: string;
  disruptionId: string;
  actionType: 'mitigation' | 'contingency' | 'communication' | 'recovery';
  description: string;
  responsibleParty: string;
  assignedTo: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  startDate: Date;
  dueDate: Date;
  completionDate?: Date;
  cost?: number;
  effectiveness?: number; // 0-100
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SupplyChainMapping {
  id: string;
  name: string;
  description: string;
  nodes: SupplyChainNode[];
  relationships: SupplyChainRelationship[];
  visualization: {
    layout: 'hierarchical' | 'network' | 'geographic';
    customLayout?: any;
  };
  version: number;
  status: 'draft' | 'active' | 'archived';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SupplyChainRelationship {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  relationshipType: 'supplies' | 'distributes' | 'transports' | 'finances' | 'owns' | 'partners';
  strength: 'weak' | 'moderate' | 'strong' | 'critical';
  volume: number;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
  contractTerms: {
    startDate: Date;
    endDate: Date;
    renewalTerms: string;
    terminationClause: string;
  };
  performanceMetrics: {
    reliability: number;
    quality: number;
    cost: number;
    responsiveness: number;
  };
  riskFactors: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SupplyChainAnalytics {
  id: string;
  nodeId?: string;
  metricType: 'performance' | 'risk' | 'cost' | 'quality' | 'sustainability';
  metricName: string;
  value: number;
  unit: string;
  target?: number;
  threshold?: number;
  trend: 'improving' | 'stable' | 'declining';
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  date: Date;
  context: string;
  createdAt: Date;
}

export interface AuditRecord {
  id: string;
  nodeId: string;
  auditType: 'financial' | 'operational' | 'compliance' | 'quality' | 'security';
  auditor: string;
  auditDate: Date;
  score: number; // 0-100
  findings: string[];
  recommendations: string[];
  status: 'passed' | 'failed' | 'conditional' | 'pending';
  followUpDate?: Date;
  reportUrl?: string;
  createdAt: Date;
}

export interface SupplyChainDashboard {
  totalNodes: number;
  activeNodes: number;
  highRiskNodes: number;
  criticalRiskNodes: number;
  activeDisruptions: number;
  averageRiskScore: number;
  topRisks: SupplyChainRisk[];
  recentDisruptions: SupplyChainDisruption[];
  performanceMetrics: {
    onTimeDelivery: number;
    qualityScore: number;
    costEfficiency: number;
    riskScore: number;
  };
  alerts: SupplyChainAlert[];
}

export interface SupplyChainAlert {
  id: string;
  type: 'risk' | 'disruption' | 'performance' | 'compliance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  nodeId?: string;
  riskId?: string;
  disruptionId?: string;
  isRead: boolean;
  createdAt: Date;
}
