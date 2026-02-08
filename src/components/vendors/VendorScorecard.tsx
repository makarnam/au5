import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Progress } from '../ui/progress';
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  Star,
  Target,
  Award,
  BarChart3,
  PieChart,
  RefreshCw,
  Download,
  Eye,
  Calculator,
  Zap,
  Shield,
  Activity,
  Users
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { thirdPartyRiskManagementService } from '../../services/thirdPartyRiskManagementService';
import type { ThirdPartyPerformance, ThirdParty } from '../../types/thirdPartyRiskManagement';

interface VendorScorecardProps {
  vendorId?: string;
}

interface ScorecardData {
  vendor: ThirdParty | null;
  performance: ThirdPartyPerformance[];
  overallScore: number;
  riskScore: number;
  performanceScore: number;
  complianceScore: number;
  categories: {
    name: string;
    score: number;
    weight: number;
    maxScore: number;
  }[];
}

const VendorScorecard: React.FC<VendorScorecardProps> = ({ vendorId }) => {
  const [scorecardData, setScorecardData] = useState<ScorecardData>({
    vendor: null,
    performance: [],
    overallScore: 0,
    riskScore: 0,
    performanceScore: 0,
    complianceScore: 0,
    categories: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('quarterly');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadScorecardData();
  }, [vendorId, selectedPeriod]);

  const loadScorecardData = async () => {
    try {
      setLoading(true);

      if (vendorId) {
        // Load specific vendor data
        const vendorResult = await thirdPartyRiskManagementService.getThirdParty(vendorId);
        if (vendorResult.error) throw vendorResult.error;

        const vendor = vendorResult.data;

        // Mock performance data for now
        const performance: ThirdPartyPerformance[] = [
          {
            id: 'perf-1',
            third_party_id: vendorId,
            performance_period: 'quarterly',
            period_start_date: '2024-01-01',
            period_end_date: '2024-03-31',
            overall_performance_score: 85,
            performance_level: 'good',
            sla_compliance_percentage: 92,
            quality_score: 88,
            delivery_timeliness: 85,
            cost_effectiveness: 82,
            communication_effectiveness: 90,
            problem_resolution_time: 95,
            customer_satisfaction_score: 87,
            performance_bonus_earned: false,
            performance_penalty_applied: false,
            created_by: 'system',
            updated_by: 'system',
            created_at: '2024-04-01T00:00:00Z',
            updated_at: '2024-04-01T00:00:00Z'
          },
          {
            id: 'perf-2',
            third_party_id: vendorId,
            performance_period: 'quarterly',
            period_start_date: '2024-04-01',
            period_end_date: '2024-06-30',
            overall_performance_score: 88,
            performance_level: 'excellent',
            sla_compliance_percentage: 95,
            quality_score: 90,
            delivery_timeliness: 88,
            cost_effectiveness: 85,
            communication_effectiveness: 92,
            problem_resolution_time: 98,
            customer_satisfaction_score: 89,
            performance_bonus_earned: true,
            performance_penalty_applied: false,
            created_by: 'system',
            updated_by: 'system',
            created_at: '2024-07-01T00:00:00Z',
            updated_at: '2024-07-01T00:00:00Z'
          }
        ];

        // Calculate scores
        const calculatedData = calculateScorecardData(vendor, performance);
        setScorecardData(calculatedData);
      } else {
        // Load all vendors for comparison
        const vendorsResult = await thirdPartyRiskManagementService.getThirdParties();
        if (vendorsResult.error) throw vendorsResult.error;

        // Mock performance data for all vendors
        const mockPerformance: ThirdPartyPerformance[] = vendorsResult.data.flatMap(vendor => [
          {
            id: `perf-${vendor.id}-1`,
            third_party_id: vendor.id,
            performance_period: 'quarterly',
            period_start_date: '2024-01-01',
            period_end_date: '2024-03-31',
            overall_performance_score: Math.floor(Math.random() * 40) + 60, // 60-100
            performance_level: 'good',
            sla_compliance_percentage: Math.floor(Math.random() * 20) + 80, // 80-100
            quality_score: Math.floor(Math.random() * 20) + 75, // 75-95
            delivery_timeliness: Math.floor(Math.random() * 20) + 75, // 75-95
            cost_effectiveness: Math.floor(Math.random() * 20) + 70, // 70-90
            communication_effectiveness: Math.floor(Math.random() * 20) + 80, // 80-100
            problem_resolution_time: Math.floor(Math.random() * 20) + 85, // 85-105
            customer_satisfaction_score: Math.floor(Math.random() * 20) + 80, // 80-100
            performance_bonus_earned: Math.random() > 0.7,
            performance_penalty_applied: Math.random() > 0.8,
            created_by: 'system',
            updated_by: 'system',
            created_at: '2024-04-01T00:00:00Z',
            updated_at: '2024-04-01T00:00:00Z'
          }
        ]);

        // For now, show aggregated data
        const aggregatedData = calculateAggregatedScorecard(vendorsResult.data, mockPerformance);
        setScorecardData(aggregatedData);
      }
    } catch (error) {
      console.error('Error loading scorecard data:', error);
      toast.error('Failed to load scorecard data');
    } finally {
      setLoading(false);
    }
  };

  const calculateScorecardData = (vendor: ThirdParty | null, performance: ThirdPartyPerformance[]): ScorecardData => {
    if (!vendor) {
      return {
        vendor: null,
        performance: [],
        overallScore: 0,
        riskScore: 0,
        performanceScore: 0,
        complianceScore: 0,
        categories: []
      };
    }

    // Calculate risk score (inverse of risk level)
    const riskScore = Math.max(0, 100 - (vendor.risk_score || 0));

    // Calculate performance score from latest performance data
    const latestPerformance = performance.sort((a, b) =>
      new Date(b.period_end_date).getTime() - new Date(a.period_end_date).getTime()
    )[0];

    const performanceScore = latestPerformance ? (
      (latestPerformance.sla_compliance_percentage || 0) * 0.4 +
      (latestPerformance.quality_score || 0) * 0.3 +
      (latestPerformance.delivery_timeliness || 0) * 0.2 +
      (latestPerformance.communication_effectiveness || 0) * 0.1
    ) : 0;

    // Mock compliance score based on certifications and frameworks
    const complianceScore = Math.min(100,
      ((vendor.certifications?.length || 0) * 10) +
      ((vendor.compliance_frameworks?.length || 0) * 15) +
      (vendor.financial_stability_rating ? 20 : 0) +
      (vendor.insurance_coverage ? 15 : 0)
    );

    // Calculate overall score (weighted average)
    const overallScore = Math.round(
      riskScore * 0.4 +
      performanceScore * 0.4 +
      complianceScore * 0.2
    );

    const categories = [
      { name: 'Risk Management', score: riskScore, weight: 40, maxScore: 100 },
      { name: 'Performance', score: performanceScore, weight: 40, maxScore: 100 },
      { name: 'Compliance', score: complianceScore, weight: 20, maxScore: 100 }
    ];

    return {
      vendor,
      performance,
      overallScore,
      riskScore,
      performanceScore,
      complianceScore,
      categories
    };
  };

  const calculateAggregatedScorecard = (vendors: ThirdParty[], performance: ThirdPartyPerformance[]): ScorecardData => {
    if (vendors.length === 0) {
      return {
        vendor: null,
        performance: [],
        overallScore: 0,
        riskScore: 0,
        performanceScore: 0,
        complianceScore: 0,
        categories: []
      };
    }

    // Calculate average scores across all vendors
    const avgRiskScore = vendors.reduce((sum, v) => sum + Math.max(0, 100 - (v.risk_score || 0)), 0) / vendors.length;
    const avgPerformanceScore = performance.length > 0 ?
      performance.reduce((sum, p) =>
        sum + ((p.sla_compliance_percentage || 0) * 0.4 +
               (p.quality_score || 0) * 0.3 +
               (p.delivery_timeliness || 0) * 0.2 +
               (p.communication_effectiveness || 0) * 0.1), 0) / performance.length : 0;

    const avgComplianceScore = vendors.reduce((sum, v) =>
      sum + Math.min(100,
        ((v.certifications?.length || 0) * 10) +
        ((v.compliance_frameworks?.length || 0) * 15) +
        (v.financial_stability_rating ? 20 : 0) +
        (v.insurance_coverage ? 15 : 0)
      ), 0) / vendors.length;

    const overallScore = Math.round(
      avgRiskScore * 0.4 +
      avgPerformanceScore * 0.4 +
      avgComplianceScore * 0.2
    );

    const categories = [
      { name: 'Risk Management', score: Math.round(avgRiskScore), weight: 40, maxScore: 100 },
      { name: 'Performance', score: Math.round(avgPerformanceScore), weight: 40, maxScore: 100 },
      { name: 'Compliance', score: Math.round(avgComplianceScore), weight: 20, maxScore: 100 }
    ];

    return {
      vendor: null, // Represents all vendors
      performance,
      overallScore,
      riskScore: Math.round(avgRiskScore),
      performanceScore: Math.round(avgPerformanceScore),
      complianceScore: Math.round(avgComplianceScore),
      categories
    };
  };

  const refreshScorecardData = async () => {
    try {
      setIsRefreshing(true);
      await loadScorecardData();
      toast.success('Scorecard data refreshed');
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast.error('Failed to refresh scorecard data');
    } finally {
      setIsRefreshing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreGrade = (score: number) => {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B+';
    if (score >= 60) return 'B';
    if (score >= 50) return 'C+';
    if (score >= 40) return 'C';
    if (score >= 30) return 'D';
    return 'F';
  };

  const getGradeColor = (grade: string) => {
    switch (grade.charAt(0)) {
      case 'A': return 'bg-green-100 text-green-800';
      case 'B': return 'bg-blue-100 text-blue-800';
      case 'C': return 'bg-yellow-100 text-yellow-800';
      case 'D': return 'bg-orange-100 text-orange-800';
      default: return 'bg-red-100 text-red-800';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className='p-6'>
          <div className='flex items-center justify-center'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { vendor, performance, overallScore, categories } = scorecardData;

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <div>
          <h2 className='text-2xl font-bold text-gray-900 flex items-center gap-2'>
            Vendor Scorecard
            <span className='px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full'>New</span>
          </h2>
          <p className='text-gray-600'>
            {vendorId ? `Performance scorecard for ${vendor?.name || 'vendor'}` : 'Aggregated vendor performance scorecard'}
          </p>
        </div>

        <div className='flex gap-2'>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className='w-32'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='monthly'>Monthly</SelectItem>
              <SelectItem value='quarterly'>Quarterly</SelectItem>
              <SelectItem value='annually'>Annually</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant='outline'
            onClick={refreshScorecardData}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <RefreshCw className='h-4 w-4 mr-2 animate-spin' />
            ) : (
              <RefreshCw className='h-4 w-4 mr-2' />
            )}
            Refresh
          </Button>
        </div>
      </div>

      {/* Overall Score Display */}
      <Card className='bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200'>
        <CardContent className='p-8'>
          <div className='text-center'>
            <div className={`text-6xl font-bold mb-4 ${getScoreColor(overallScore)}`}>
              {overallScore}
            </div>
            <div className='flex items-center justify-center gap-4 mb-6'>
              <Badge className={`text-lg px-4 py-2 ${getGradeColor(getScoreGrade(overallScore))}`}>
                Grade {getScoreGrade(overallScore)}
              </Badge>
              <div className='flex items-center gap-2'>
                <Trophy className='h-5 w-5 text-yellow-500' />
                <span className='text-sm font-medium text-gray-600'>Overall Score</span>
              </div>
            </div>
            <Progress value={overallScore} className='h-4 max-w-md mx-auto' />
            <p className='text-sm text-gray-600 mt-4'>
              {vendorId ? `${vendor?.name} performance rating` : 'Average vendor performance across all vendors'}
            </p>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue='categories' className='space-y-6'>
        <TabsList>
          <TabsTrigger value='categories'>Score Categories</TabsTrigger>
          <TabsTrigger value='performance'>Performance Details</TabsTrigger>
          <TabsTrigger value='trends'>Score Trends</TabsTrigger>
        </TabsList>

        <TabsContent value='categories' className='space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            {categories.map((category) => (
              <Card key={category.name}>
                <CardHeader className='pb-3'>
                  <CardTitle className='text-lg flex items-center justify-between'>
                    {category.name}
                    <Badge variant='outline'>{category.weight}%</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    <div className='flex items-center justify-between'>
                      <span className='text-3xl font-bold text-gray-900'>{category.score}</span>
                      <span className='text-sm text-gray-500'>/ {category.maxScore}</span>
                    </div>

                    <Progress value={(category.score / category.maxScore) * 100} className='h-3' />

                    <div className='flex items-center justify-between text-sm'>
                      <span className='text-gray-600'>Weighted contribution:</span>
                      <span className='font-medium'>
                        {Math.round((category.score * category.weight) / 100)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Score Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Calculator className='h-5 w-5' />
                Score Calculation Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {categories.map((category) => (
                  <div key={category.name} className='flex items-center justify-between p-4 border border-gray-200 rounded-lg'>
                    <div className='flex items-center gap-3'>
                      <div className={`w-3 h-3 rounded-full ${
                        category.name === 'Risk Management' ? 'bg-red-500' :
                        category.name === 'Performance' ? 'bg-blue-500' : 'bg-green-500'
                      }`} />
                      <div>
                        <h4 className='font-medium text-gray-900'>{category.name}</h4>
                        <p className='text-sm text-gray-600'>Weight: {category.weight}%</p>
                      </div>
                    </div>
                    <div className='text-right'>
                      <div className='text-2xl font-bold text-gray-900'>{category.score}</div>
                      <div className='text-sm text-gray-600'>
                        Contribution: {Math.round((category.score * category.weight) / 100)}
                      </div>
                    </div>
                  </div>
                ))}

                <div className='border-t pt-4'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <h4 className='text-lg font-bold text-gray-900'>Total Score</h4>
                      <p className='text-sm text-gray-600'>Weighted average of all categories</p>
                    </div>
                    <div className='text-right'>
                      <div className='text-3xl font-bold text-blue-600'>{overallScore}</div>
                      <div className='text-sm text-gray-600'>Grade {getScoreGrade(overallScore)}</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='performance' className='space-y-6'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <BarChart3 className='h-5 w-5' />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {performance.slice(0, 5).map((perf, index) => (
                    <div key={index} className='p-4 border border-gray-200 rounded-lg'>
                      <div className='flex items-center justify-between mb-3'>
                        <h4 className='font-medium text-gray-900'>
                          {new Date(perf.period_start_date).toLocaleDateString()} - {new Date(perf.period_end_date).toLocaleDateString()}
                        </h4>
                        <Badge variant='outline'>{perf.performance_level}</Badge>
                      </div>

                      <div className='grid grid-cols-2 gap-4 text-sm'>
                        <div>
                          <span className='text-gray-600'>SLA Compliance:</span>
                          <div className='font-medium'>{perf.sla_compliance_percentage || 0}%</div>
                        </div>
                        <div>
                          <span className='text-gray-600'>Quality Score:</span>
                          <div className='font-medium'>{perf.quality_score || 0}/100</div>
                        </div>
                        <div>
                          <span className='text-gray-600'>Delivery:</span>
                          <div className='font-medium'>{perf.delivery_timeliness || 0}/100</div>
                        </div>
                        <div>
                          <span className='text-gray-600'>Communication:</span>
                          <div className='font-medium'>{perf.communication_effectiveness || 0}/100</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Risk vs Performance Comparison */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Shield className='h-5 w-5' />
                  Risk vs Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-6'>
                  <div className='text-center p-6 bg-gray-50 rounded-lg'>
                    <div className='grid grid-cols-2 gap-4'>
                      <div>
                        <div className={`text-3xl font-bold ${getScoreColor(scorecardData.riskScore)}`}>
                          {scorecardData.riskScore}
                        </div>
                        <p className='text-sm text-gray-600 mt-1'>Risk Score</p>
                      </div>
                      <div>
                        <div className={`text-3xl font-bold ${getScoreColor(scorecardData.performanceScore)}`}>
                          {Math.round(scorecardData.performanceScore)}
                        </div>
                        <p className='text-sm text-gray-600 mt-1'>Performance Score</p>
                      </div>
                    </div>
                  </div>

                  <div className='space-y-3'>
                    <div className='flex justify-between items-center'>
                      <span className='text-sm font-medium'>Risk-Performance Balance</span>
                      <span className='text-sm text-gray-600'>
                        {Math.abs(scorecardData.riskScore - scorecardData.performanceScore) < 10 ? 'Balanced' :
                         scorecardData.riskScore > scorecardData.performanceScore ? 'Risk-Heavy' : 'Performance-Heavy'}
                      </span>
                    </div>

                    <Progress
                      value={Math.min(100, (scorecardData.performanceScore / Math.max(scorecardData.riskScore, 1)) * 50)}
                      className='h-3'
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value='trends' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <TrendingUp className='h-5 w-5' />
                Score Trends Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {performance.slice(0, 6).reverse().map((perf, index) => {
                  const periodScore = Math.round(
                    ((perf.sla_compliance_percentage || 0) * 0.4 +
                     (perf.quality_score || 0) * 0.3 +
                     (perf.delivery_timeliness || 0) * 0.2 +
                     (perf.communication_effectiveness || 0) * 0.1)
                  );

                  return (
                    <div key={index} className='flex items-center justify-between p-4 border border-gray-200 rounded-lg'>
                      <div className='font-medium text-gray-900'>
                        {new Date(perf.period_start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </div>
                      <div className='flex items-center gap-4'>
                        <div className='text-center'>
                          <div className={`text-xl font-bold ${getScoreColor(periodScore)}`}>
                            {periodScore}
                          </div>
                          <div className='text-xs text-gray-500'>Performance</div>
                        </div>
                        <div className='text-center'>
                          <div className={`text-xl font-bold ${getScoreColor(perf.overall_performance_score || 0)}`}>
                            {perf.overall_performance_score || 0}
                          </div>
                          <div className='text-xs text-gray-500'>Overall</div>
                        </div>
                        <Badge variant='outline' className='ml-2'>
                          {perf.performance_level}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VendorScorecard;