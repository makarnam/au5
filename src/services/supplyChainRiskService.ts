import { supabase } from '../lib/supabase';
import {
  SupplyChainNode,
  SupplyChainRisk,
  SupplyChainDisruption,
  DisruptionAction,
  SupplyChainMapping,
  SupplyChainRelationship,
  SupplyChainAnalytics,
  AuditRecord,
  SupplyChainDashboard,
  SupplyChainAlert
} from '../types/supplyChainRisk';

export class SupplyChainRiskService {
  // Supply Chain Nodes
  async getNodes(): Promise<SupplyChainNode[]> {
    const { data, error } = await supabase
      .from('supply_chain_nodes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getNodeById(id: string): Promise<SupplyChainNode | null> {
    const { data, error } = await supabase
      .from('supply_chain_nodes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async createNode(node: Omit<SupplyChainNode, 'id' | 'createdAt' | 'updatedAt'>): Promise<SupplyChainNode> {
    const { data, error } = await supabase
      .from('supply_chain_nodes')
      .insert([node])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateNode(id: string, updates: Partial<SupplyChainNode>): Promise<SupplyChainNode> {
    const { data, error } = await supabase
      .from('supply_chain_nodes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteNode(id: string): Promise<void> {
    const { error } = await supabase
      .from('supply_chain_nodes')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Supply Chain Risks
  async getRisks(): Promise<SupplyChainRisk[]> {
    const { data, error } = await supabase
      .from('supply_chain_risks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getRisksByNode(nodeId: string): Promise<SupplyChainRisk[]> {
    const { data, error } = await supabase
      .from('supply_chain_risks')
      .select('*')
      .eq('node_id', nodeId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async createRisk(risk: Omit<SupplyChainRisk, 'id' | 'createdAt' | 'updatedAt'>): Promise<SupplyChainRisk> {
    const { data, error } = await supabase
      .from('supply_chain_risks')
      .insert([risk])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateRisk(id: string, updates: Partial<SupplyChainRisk>): Promise<SupplyChainRisk> {
    const { data, error } = await supabase
      .from('supply_chain_risks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Supply Chain Disruptions
  async getDisruptions(): Promise<SupplyChainDisruption[]> {
    const { data, error } = await supabase
      .from('supply_chain_disruptions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getActiveDisruptions(): Promise<SupplyChainDisruption[]> {
    const { data, error } = await supabase
      .from('supply_chain_disruptions')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async createDisruption(disruption: Omit<SupplyChainDisruption, 'id' | 'createdAt' | 'updatedAt'>): Promise<SupplyChainDisruption> {
    const { data, error } = await supabase
      .from('supply_chain_disruptions')
      .insert([disruption])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateDisruption(id: string, updates: Partial<SupplyChainDisruption>): Promise<SupplyChainDisruption> {
    const { data, error } = await supabase
      .from('supply_chain_disruptions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Disruption Actions
  async getDisruptionActions(disruptionId: string): Promise<DisruptionAction[]> {
    const { data, error } = await supabase
      .from('disruption_actions')
      .select('*')
      .eq('disruption_id', disruptionId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async createDisruptionAction(action: Omit<DisruptionAction, 'id' | 'createdAt' | 'updatedAt'>): Promise<DisruptionAction> {
    const { data, error } = await supabase
      .from('disruption_actions')
      .insert([action])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateDisruptionAction(id: string, updates: Partial<DisruptionAction>): Promise<DisruptionAction> {
    const { data, error } = await supabase
      .from('disruption_actions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Supply Chain Mappings
  async getMappings(): Promise<SupplyChainMapping[]> {
    const { data, error } = await supabase
      .from('supply_chain_mappings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getMappingById(id: string): Promise<SupplyChainMapping | null> {
    const { data, error } = await supabase
      .from('supply_chain_mappings')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async createMapping(mapping: Omit<SupplyChainMapping, 'id' | 'createdAt' | 'updatedAt'>): Promise<SupplyChainMapping> {
    const { data, error } = await supabase
      .from('supply_chain_mappings')
      .insert([mapping])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Supply Chain Analytics
  async getAnalytics(nodeId?: string): Promise<SupplyChainAnalytics[]> {
    let query = supabase
      .from('supply_chain_analytics')
      .select('*')
      .order('date', { ascending: false });

    if (nodeId) {
      query = query.eq('node_id', nodeId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async createAnalytics(analytics: Omit<SupplyChainAnalytics, 'id' | 'createdAt'>): Promise<SupplyChainAnalytics> {
    const { data, error } = await supabase
      .from('supply_chain_analytics')
      .insert([analytics])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Audit Records
  async getAuditRecords(nodeId?: string): Promise<AuditRecord[]> {
    let query = supabase
      .from('audit_records')
      .select('*')
      .order('audit_date', { ascending: false });

    if (nodeId) {
      query = query.eq('node_id', nodeId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async createAuditRecord(record: Omit<AuditRecord, 'id' | 'createdAt'>): Promise<AuditRecord> {
    const { data, error } = await supabase
      .from('audit_records')
      .insert([record])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Supply Chain Alerts
  async getAlerts(): Promise<SupplyChainAlert[]> {
    const { data, error } = await supabase
      .from('supply_chain_alerts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getUnreadAlerts(): Promise<SupplyChainAlert[]> {
    const { data, error } = await supabase
      .from('supply_chain_alerts')
      .select('*')
      .eq('is_read', false)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async markAlertAsRead(id: string): Promise<void> {
    const { error } = await supabase
      .from('supply_chain_alerts')
      .update({ is_read: true })
      .eq('id', id);

    if (error) throw error;
  }

  async createAlert(alert: Omit<SupplyChainAlert, 'id' | 'createdAt'>): Promise<SupplyChainAlert> {
    const { data, error } = await supabase
      .from('supply_chain_alerts')
      .insert([alert])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Dashboard Data
  async getDashboardData(): Promise<SupplyChainDashboard> {
    // Get basic counts
    const [nodes, risks, disruptions, alerts] = await Promise.all([
      this.getNodes(),
      this.getRisks(),
      this.getActiveDisruptions(),
      this.getUnreadAlerts()
    ]);

    const activeNodes = nodes.filter(node => node.status === 'active');
    const highRiskNodes = nodes.filter(node => node.riskProfile.overallRisk === 'high');
    const criticalRiskNodes = nodes.filter(node => node.riskProfile.overallRisk === 'critical');
    const highRisks = risks.filter(risk => risk.severity === 'high' || risk.severity === 'critical');

    const averageRiskScore = nodes.length > 0 
      ? nodes.reduce((sum, node) => {
          const riskScore = (node.riskProfile.financialRisk + 
                           node.riskProfile.operationalRisk + 
                           node.riskProfile.complianceRisk + 
                           node.riskProfile.geopoliticalRisk + 
                           node.riskProfile.environmentalRisk) / 5;
          return sum + riskScore;
        }, 0) / nodes.length
      : 0;

    const performanceMetrics = {
      onTimeDelivery: activeNodes.length > 0 
        ? activeNodes.reduce((sum, node) => sum + node.performance.onTimeDelivery, 0) / activeNodes.length
        : 0,
      qualityScore: activeNodes.length > 0
        ? activeNodes.reduce((sum, node) => sum + node.performance.qualityScore, 0) / activeNodes.length
        : 0,
      costEfficiency: activeNodes.length > 0
        ? activeNodes.reduce((sum, node) => sum + (100 - Math.abs(node.performance.costVariance)), 0) / activeNodes.length
        : 0,
      riskScore: averageRiskScore
    };

    return {
      totalNodes: nodes.length,
      activeNodes: activeNodes.length,
      highRiskNodes: highRiskNodes.length,
      criticalRiskNodes: criticalRiskNodes.length,
      activeDisruptions: disruptions.length,
      averageRiskScore,
      topRisks: highRisks.slice(0, 5),
      recentDisruptions: disruptions.slice(0, 5),
      performanceMetrics,
      alerts: alerts.slice(0, 10)
    };
  }

  // Risk Assessment
  async assessNodeRisk(nodeId: string): Promise<SupplyChainRisk[]> {
    const node = await this.getNodeById(nodeId);
    if (!node) throw new Error('Node not found');

    const risks: Omit<SupplyChainRisk, 'id' | 'createdAt' | 'updatedAt'>[] = [];

    // Financial Risk Assessment
    if (node.businessInfo.size === 'small' && node.businessInfo.annualRevenue && node.businessInfo.annualRevenue < 1000000) {
      risks.push({
        nodeId,
        riskType: 'financial',
        severity: 'high',
        probability: 70,
        impact: 80,
        riskScore: 70 * 80 / 100,
        description: 'Small supplier with limited financial capacity',
        rootCause: 'Low annual revenue and small business size',
        potentialImpact: 'Potential financial instability and supply disruption',
        mitigationStrategies: ['Diversify suppliers', 'Implement financial monitoring', 'Establish backup suppliers'],
        contingencyPlans: ['Activate backup suppliers', 'Increase inventory levels', 'Negotiate payment terms'],
        responsibleParty: 'Procurement Team',
        status: 'identified'
      });
    }

    // Geographic Risk Assessment
    const highRiskCountries = ['China', 'Russia', 'Iran', 'North Korea', 'Venezuela'];
    if (highRiskCountries.includes(node.location.country)) {
      risks.push({
        nodeId,
        riskType: 'geopolitical',
        severity: 'critical',
        probability: 60,
        impact: 90,
        riskScore: 60 * 90 / 100,
        description: 'Supplier located in high-risk geopolitical region',
        rootCause: 'Geographic location in politically unstable region',
        potentialImpact: 'Supply chain disruption due to political instability',
        mitigationStrategies: ['Diversify geographic sourcing', 'Increase inventory levels', 'Develop alternative suppliers'],
        contingencyPlans: ['Activate alternative suppliers', 'Increase safety stock', 'Monitor political developments'],
        responsibleParty: 'Risk Management Team',
        status: 'identified'
      });
    }

    // Dependency Risk Assessment
    if (node.dependencies.criticality === 'critical' && node.dependencies.alternativeSources.length === 0) {
      risks.push({
        nodeId,
        riskType: 'operational',
        severity: 'critical',
        probability: 50,
        impact: 95,
        riskScore: 50 * 95 / 100,
        description: 'Critical supplier with no alternative sources',
        rootCause: 'Single source dependency for critical component',
        potentialImpact: 'Complete supply chain disruption if supplier fails',
        mitigationStrategies: ['Develop alternative suppliers', 'Increase inventory levels', 'Implement supplier development programs'],
        contingencyPlans: ['Emergency supplier qualification', 'Increase safety stock', 'Implement emergency procurement procedures'],
        responsibleParty: 'Supply Chain Team',
        status: 'identified'
      });
    }

    // Create risks in database
    const createdRisks = await Promise.all(
      risks.map(risk => this.createRisk(risk))
    );

    return createdRisks;
  }
}

export const supplyChainRiskService = new SupplyChainRiskService();
