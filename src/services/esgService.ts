import { supabase } from '../lib/supabase';

interface ESGMetrics {
  environmental: {
    carbonFootprint: number;
    energyConsumption: number;
    waterUsage: number;
    wasteGenerated: number;
    renewableEnergyPercentage: number;
    recyclingRate: number;
  };
  social: {
    employeeSatisfaction: number;
    diversityPercentage: number;
    trainingHours: number;
    communityInvestment: number;
    healthSafetyIncidents: number;
    supplierDiversity: number;
  };
  governance: {
    boardDiversity: number;
    executiveCompensationRatio: number;
    ethicsComplianceScore: number;
    transparencyScore: number;
    stakeholderEngagement: number;
    riskManagementScore: number;
  };
}

interface ESGGoal {
  id: string;
  category: 'environmental' | 'social' | 'governance';
  title: string;
  description: string;
  target: number;
  current: number;
  unit: string;
  deadline: string;
  status: 'on-track' | 'at-risk' | 'behind' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  created_at: string;
  updated_at: string;
}

interface ESGProgram {
  id: string;
  name: string;
  category: 'environmental' | 'social' | 'governance';
  description: string;
  status: 'active' | 'planned' | 'completed' | 'paused';
  budget: number;
  spent: number;
  startDate: string;
  endDate: string;
  impact: string;
  created_at: string;
  updated_at: string;
}

interface CarbonData {
  id: string;
  scope: 'scope1' | 'scope2' | 'scope3';
  category: string;
  value: number;
  unit: string;
  year: number;
  month?: number;
  source: string;
  verification_status: 'pending' | 'verified' | 'rejected';
  created_at: string;
}

interface MaterialityAssessment {
  id: string;
  topic_name: string;
  category: 'environmental' | 'social' | 'governance';
  impact_score: number;
  financial_score: number;
  combined_score: number;
  materiality_level: 'critical' | 'high' | 'medium' | 'low';
  stakeholder_priority: number;
  created_at: string;
}

class ESGService {
  // Metrics Management
  async getMetrics(timeframe: string = 'current'): Promise<ESGMetrics> {
    try {
      // In a real implementation, this would fetch from the database
      // For now, return mock data
      return {
        environmental: {
          carbonFootprint: 2847,
          energyConsumption: 15.2,
          waterUsage: 8450,
          wasteGenerated: 1234,
          renewableEnergyPercentage: 45,
          recyclingRate: 78,
        },
        social: {
          employeeSatisfaction: 87,
          diversityPercentage: 42,
          trainingHours: 32.5,
          communityInvestment: 2400000,
          healthSafetyIncidents: 0.8,
          supplierDiversity: 28,
        },
        governance: {
          boardDiversity: 45,
          executiveCompensationRatio: 45,
          ethicsComplianceScore: 94,
          transparencyScore: 88,
          stakeholderEngagement: 92,
          riskManagementScore: 89,
        },
      };
    } catch (error) {
      console.error('Error fetching ESG metrics:', error);
      throw error;
    }
  }

  async updateMetrics(metrics: Partial<ESGMetrics>): Promise<void> {
    try {
      // Update metrics in the database
      const { error } = await supabase
        .from('esg_metrics')
        .upsert({
          ...metrics,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating ESG metrics:', error);
      throw error;
    }
  }

  // Goals Management
  async getGoals(): Promise<ESGGoal[]> {
    try {
      const { data, error } = await supabase
        .from('esg_goals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching ESG goals:', error);
      throw error;
    }
  }

  async createGoal(goal: Omit<ESGGoal, 'id' | 'created_at' | 'updated_at'>): Promise<ESGGoal> {
    try {
      const { data, error } = await supabase
        .from('esg_goals')
        .insert({
          ...goal,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error creating ESG goal:', error);
      throw error;
    }
  }

  async updateGoal(id: string, updates: Partial<ESGGoal>): Promise<ESGGoal> {
    try {
      const { data, error } = await supabase
        .from('esg_goals')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error updating ESG goal:', error);
      throw error;
    }
  }

  async deleteGoal(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('esg_goals')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting ESG goal:', error);
      throw error;
    }
  }

  // Programs Management
  async getPrograms(): Promise<ESGProgram[]> {
    try {
      const { data, error } = await supabase
        .from('esg_programs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching ESG programs:', error);
      throw error;
    }
  }

  async createProgram(program: Omit<ESGProgram, 'id' | 'created_at' | 'updated_at'>): Promise<ESGProgram> {
    try {
      const { data, error } = await supabase
        .from('esg_programs')
        .insert({
          ...program,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error creating ESG program:', error);
      throw error;
    }
  }

  async updateProgram(id: string, updates: Partial<ESGProgram>): Promise<ESGProgram> {
    try {
      const { data, error } = await supabase
        .from('esg_programs')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error updating ESG program:', error);
      throw error;
    }
  }

  async deleteProgram(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('esg_programs')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting ESG program:', error);
      throw error;
    }
  }

  // Carbon Management
  async getCarbonData(year?: number): Promise<CarbonData[]> {
    try {
      let query = supabase
        .from('carbon_management')
        .select('*')
        .order('year', { ascending: false });

      if (year) {
        query = query.eq('year', year);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching carbon data:', error);
      throw error;
    }
  }

  async addCarbonData(carbonData: Omit<CarbonData, 'id' | 'created_at'>): Promise<CarbonData> {
    try {
      const { data, error } = await supabase
        .from('carbon_management')
        .insert({
          ...carbonData,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error adding carbon data:', error);
      throw error;
    }
  }

  async updateCarbonData(id: string, updates: Partial<CarbonData>): Promise<CarbonData> {
    try {
      const { data, error } = await supabase
        .from('carbon_management')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error updating carbon data:', error);
      throw error;
    }
  }

  // Materiality Assessment
  async getMaterialityAssessment(): Promise<MaterialityAssessment[]> {
    try {
      const { data, error } = await supabase
        .from('double_materiality_assessments')
        .select('*')
        .order('combined_score', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching materiality assessment:', error);
      throw error;
    }
  }

  async createMaterialityAssessment(assessment: Omit<MaterialityAssessment, 'id' | 'created_at'>): Promise<MaterialityAssessment> {
    try {
      const { data, error } = await supabase
        .from('double_materiality_assessments')
        .insert({
          ...assessment,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error creating materiality assessment:', error);
      throw error;
    }
  }

  // Stakeholder Engagement
  async getStakeholderEngagement(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('esg_stakeholder_engagement')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching stakeholder engagement:', error);
      throw error;
    }
  }

  async addStakeholderEngagement(engagement: any): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('esg_stakeholder_engagement')
        .insert({
          ...engagement,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error adding stakeholder engagement:', error);
      throw error;
    }
  }

  // ESG Disclosures
  async getDisclosures(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('esg_disclosures')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching ESG disclosures:', error);
      throw error;
    }
  }

  async createDisclosure(disclosure: any): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('esg_disclosures')
        .insert({
          ...disclosure,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error creating ESG disclosure:', error);
      throw error;
    }
  }

  // ESG Analytics and Reporting
  async getESGAnalytics(timeframe: string = 'current'): Promise<any> {
    try {
      // Calculate analytics based on metrics, goals, and programs
      const [metrics, goals, programs] = await Promise.all([
        this.getMetrics(timeframe),
        this.getGoals(),
        this.getPrograms(),
      ]);

      // Calculate overall ESG score
      const environmentalScore = this.calculateEnvironmentalScore(metrics.environmental);
      const socialScore = this.calculateSocialScore(metrics.social);
      const governanceScore = this.calculateGovernanceScore(metrics.governance);
      const overallScore = (environmentalScore + socialScore + governanceScore) / 3;

      // Calculate goal progress
      const goalProgress = this.calculateGoalProgress(goals);

      // Calculate program performance
      const programPerformance = this.calculateProgramPerformance(programs);

      return {
        overallScore,
        environmentalScore,
        socialScore,
        governanceScore,
        goalProgress,
        programPerformance,
        trends: this.calculateTrends(metrics),
      };
    } catch (error) {
      console.error('Error calculating ESG analytics:', error);
      throw error;
    }
  }

  private calculateEnvironmentalScore(metrics: any): number {
    // Calculate environmental score based on various factors
    const carbonScore = Math.max(0, 100 - (metrics.carbonFootprint / 100));
    const energyScore = Math.max(0, 100 - (metrics.energyConsumption * 5));
    const waterScore = Math.max(0, 100 - (metrics.waterUsage / 100));
    const wasteScore = Math.max(0, 100 - (metrics.wasteGenerated / 10));
    const renewableScore = metrics.renewableEnergyPercentage;
    const recyclingScore = metrics.recyclingRate;

    return (carbonScore + energyScore + waterScore + wasteScore + renewableScore + recyclingScore) / 6;
  }

  private calculateSocialScore(metrics: any): number {
    // Calculate social score based on various factors
    const satisfactionScore = metrics.employeeSatisfaction;
    const diversityScore = metrics.diversityPercentage * 2; // Scale to 100
    const trainingScore = Math.min(100, metrics.trainingHours * 3);
    const communityScore = Math.min(100, metrics.communityInvestment / 100000);
    const safetyScore = Math.max(0, 100 - (metrics.healthSafetyIncidents * 50));
    const supplierScore = metrics.supplierDiversity * 3.57; // Scale to 100

    return (satisfactionScore + diversityScore + trainingScore + communityScore + safetyScore + supplierScore) / 6;
  }

  private calculateGovernanceScore(metrics: any): number {
    // Calculate governance score based on various factors
    const boardScore = metrics.boardDiversity * 2.22; // Scale to 100
    const compensationScore = Math.max(0, 100 - (metrics.executiveCompensationRatio / 2));
    const ethicsScore = metrics.ethicsComplianceScore;
    const transparencyScore = metrics.transparencyScore;
    const engagementScore = metrics.stakeholderEngagement;
    const riskScore = metrics.riskManagementScore;

    return (boardScore + compensationScore + ethicsScore + transparencyScore + engagementScore + riskScore) / 6;
  }

  private calculateGoalProgress(goals: ESGGoal[]): any {
    const totalGoals = goals.length;
    const completedGoals = goals.filter(goal => goal.status === 'completed').length;
    const onTrackGoals = goals.filter(goal => goal.status === 'on-track').length;
    const atRiskGoals = goals.filter(goal => goal.status === 'at-risk').length;
    const behindGoals = goals.filter(goal => goal.status === 'behind').length;

    return {
      total: totalGoals,
      completed: completedGoals,
      onTrack: onTrackGoals,
      atRisk: atRiskGoals,
      behind: behindGoals,
      completionRate: totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0,
    };
  }

  private calculateProgramPerformance(programs: ESGProgram[]): any {
    const totalPrograms = programs.length;
    const activePrograms = programs.filter(program => program.status === 'active').length;
    const completedPrograms = programs.filter(program => program.status === 'completed').length;
    const totalBudget = programs.reduce((sum, program) => sum + program.budget, 0);
    const totalSpent = programs.reduce((sum, program) => sum + program.spent, 0);

    return {
      total: totalPrograms,
      active: activePrograms,
      completed: completedPrograms,
      totalBudget,
      totalSpent,
      budgetUtilization: totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0,
    };
  }

  private calculateTrends(metrics: ESGMetrics): any {
    // In a real implementation, this would compare current metrics with historical data
    return {
      environmental: {
        carbonFootprint: -12,
        energyConsumption: -8,
        waterUsage: -15,
        wasteGenerated: -20,
        renewableEnergyPercentage: 5,
        recyclingRate: 3,
      },
      social: {
        employeeSatisfaction: 2,
        diversityPercentage: 1,
        trainingHours: 5,
        communityInvestment: 15,
        healthSafetyIncidents: -20,
        supplierDiversity: 3,
      },
      governance: {
        boardDiversity: 5,
        executiveCompensationRatio: -10,
        ethicsComplianceScore: 2,
        transparencyScore: 3,
        stakeholderEngagement: 1,
        riskManagementScore: 4,
      },
    };
  }

  // Export and Reporting
  async generateESGReport(timeframe: string = 'current'): Promise<any> {
    try {
      const analytics = await this.getESGAnalytics(timeframe);
      const goals = await this.getGoals();
      const programs = await this.getPrograms();
      const carbonData = await this.getCarbonData();

      return {
        timeframe,
        generatedAt: new Date().toISOString(),
        analytics,
        goals,
        programs,
        carbonData,
        summary: this.generateReportSummary(analytics, goals, programs),
      };
    } catch (error) {
      console.error('Error generating ESG report:', error);
      throw error;
    }
  }

  private generateReportSummary(analytics: any, goals: ESGGoal[], programs: ESGProgram[]): string {
    const overallScore = analytics.overallScore.toFixed(1);
    const goalCompletion = analytics.goalProgress.completionRate.toFixed(1);
    const programCount = analytics.programPerformance.total;

    return `ESG Performance Summary: Overall ESG score of ${overallScore}% with ${goalCompletion}% goal completion rate and ${programCount} active programs.`;
  }
}

export const esgService = new ESGService();
