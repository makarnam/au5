import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { ThirdPartyRiskManagementService } from '../../services/thirdPartyRiskManagementService';
import { ThirdPartyPerformance, ThirdPartyPerformanceMetrics } from '../../types/thirdPartyRiskManagement';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  BarChart3, 
  Calendar,
  Filter,
  Download,
  Eye,
  Star,
  Users,
  DollarSign,
  Activity,
  Edit
} from 'lucide-react';

const service = new ThirdPartyRiskManagementService();

const PerformanceMonitoring: React.FC = () => {
  const [performanceData, setPerformanceData] = useState<ThirdPartyPerformance[]>([]);
  const [metrics, setMetrics] = useState<ThirdPartyPerformanceMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('quarterly');
  const [selectedThirdParty, setSelectedThirdParty] = useState<string>('');
  const [thirdParties, setThirdParties] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPerformance, setSelectedPerformance] = useState<ThirdPartyPerformance | null>(null);

  // Form state for creating performance records
  const [formData, setFormData] = useState({
    third_party_id: '',
    engagement_id: '',
    performance_period: 'quarterly' as const,
    period_start_date: new Date().toISOString().split('T')[0],
    period_end_date: new Date().toISOString().split('T')[0],
    overall_performance_score: 0,
    performance_level: 'satisfactory' as const,
    sla_compliance_percentage: 0,
    quality_score: 0,
    delivery_timeliness: 0,
    cost_effectiveness: 0,
    communication_effectiveness: 0,
    problem_resolution_time: 0,
    customer_satisfaction_score: 0,
    key_metrics: [] as string[],
    performance_issues: [] as string[],
    improvement_areas: [] as string[],
    corrective_actions: [] as string[],
    performance_bonus_earned: false,
    performance_penalty_applied: false,
    review_comments: '',
    reviewed_by: '',
    review_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadPerformanceData();
    loadThirdParties();
    loadMetrics();
  }, [selectedPeriod, selectedThirdParty]);

  const loadPerformanceData = async () => {
    setLoading(true);
    try {
      // Note: We need to add getPerformance method to the service
      // For now, we'll create mock data
      const mockData: ThirdPartyPerformance[] = [
        {
          id: '1',
          third_party_id: 'tp1',
          engagement_id: 'eng1',
          performance_period: 'quarterly',
          period_start_date: '2024-01-01',
          period_end_date: '2024-03-31',
          overall_performance_score: 85,
          performance_level: 'good',
          sla_compliance_percentage: 92,
          quality_score: 88,
          delivery_timeliness: 90,
          cost_effectiveness: 82,
          communication_effectiveness: 85,
          problem_resolution_time: 4.2,
          customer_satisfaction_score: 87,
          key_metrics: ['On-time delivery', 'Quality compliance', 'Cost efficiency'],
          performance_issues: ['Occasional communication delays'],
          improvement_areas: ['Response time', 'Documentation quality'],
          corrective_actions: ['Enhanced communication protocols'],
          performance_bonus_earned: true,
          performance_penalty_applied: false,
          review_comments: 'Overall good performance with room for improvement in communication.',
          reviewed_by: 'user1',
          review_date: '2024-04-01',
          created_by: 'user1',
          updated_by: 'user1',
          created_at: '2024-04-01T00:00:00Z',
          updated_at: '2024-04-01T00:00:00Z'
        },
        {
          id: '2',
          third_party_id: 'tp2',
          engagement_id: 'eng2',
          performance_period: 'quarterly',
          period_start_date: '2024-01-01',
          period_end_date: '2024-03-31',
          overall_performance_score: 78,
          performance_level: 'satisfactory',
          sla_compliance_percentage: 85,
          quality_score: 82,
          delivery_timeliness: 88,
          cost_effectiveness: 75,
          communication_effectiveness: 80,
          problem_resolution_time: 6.5,
          customer_satisfaction_score: 79,
          key_metrics: ['SLA compliance', 'Quality standards', 'Cost management'],
          performance_issues: ['Cost overruns', 'Delayed responses'],
          improvement_areas: ['Cost control', 'Response time'],
          corrective_actions: ['Cost review meetings', 'Response time targets'],
          performance_bonus_earned: false,
          performance_penalty_applied: true,
          review_comments: 'Satisfactory performance with cost control issues.',
          reviewed_by: 'user2',
          review_date: '2024-04-01',
          created_by: 'user2',
          updated_by: 'user2',
          created_at: '2024-04-01T00:00:00Z',
          updated_at: '2024-04-01T00:00:00Z'
        }
      ];
      setPerformanceData(mockData);
    } catch (error) {
      console.error('Error loading performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadThirdParties = async () => {
    try {
      const result = await service.getThirdParties();
      if (!result.error) {
        setThirdParties(result.data);
      }
    } catch (error) {
      console.error('Error loading third parties:', error);
    }
  };

  const loadMetrics = async () => {
    try {
      // Mock metrics data
      const mockMetrics: ThirdPartyPerformanceMetrics[] = [
        {
          third_party_id: 'tp1',
          third_party_name: 'Tech Solutions Inc.',
          overall_performance_score: 85,
          sla_compliance_percentage: 92,
          quality_score: 88,
          delivery_timeliness: 90,
          cost_effectiveness: 82,
          communication_effectiveness: 85,
          problem_resolution_time: 4.2,
          customer_satisfaction_score: 87
        },
        {
          third_party_id: 'tp2',
          third_party_name: 'Data Services Corp.',
          overall_performance_score: 78,
          sla_compliance_percentage: 85,
          quality_score: 82,
          delivery_timeliness: 88,
          cost_effectiveness: 75,
          communication_effectiveness: 80,
          problem_resolution_time: 6.5,
          customer_satisfaction_score: 79
        }
      ];
      setMetrics(mockMetrics);
    } catch (error) {
      console.error('Error loading metrics:', error);
    }
  };

  const handleCreatePerformance = async () => {
    try {
      // Note: We need to add createPerformance method to the service
      alert('Performance creation functionality will be implemented with the service method');
      setShowCreateModal(false);
      resetForm();
    } catch (error) {
      console.error('Error creating performance record:', error);
      alert('Failed to create performance record');
    }
  };

  const resetForm = () => {
    setFormData({
      third_party_id: '',
      engagement_id: '',
      performance_period: 'quarterly',
      period_start_date: new Date().toISOString().split('T')[0],
      period_end_date: new Date().toISOString().split('T')[0],
      overall_performance_score: 0,
      performance_level: 'satisfactory',
      sla_compliance_percentage: 0,
      quality_score: 0,
      delivery_timeliness: 0,
      cost_effectiveness: 0,
      communication_effectiveness: 0,
      problem_resolution_time: 0,
      customer_satisfaction_score: 0,
      key_metrics: [],
      performance_issues: [],
      improvement_areas: [],
      corrective_actions: [],
      performance_bonus_earned: false,
      performance_penalty_applied: false,
      review_comments: '',
      reviewed_by: '',
      review_date: new Date().toISOString().split('T')[0]
    });
  };

  const getPerformanceLevelColor = (level: string) => {
    switch (level) {
      case 'excellent': return 'bg-green-100 text-green-800 border-green-200';
      case 'good': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'satisfactory': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'poor': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'unacceptable': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPerformanceLevelIcon = (level: string) => {
    switch (level) {
      case 'excellent': return <Star className="w-4 h-4" />;
      case 'good': return <CheckCircle className="w-4 h-4" />;
      case 'satisfactory': return <Target className="w-4 h-4" />;
      case 'poor': return <AlertTriangle className="w-4 h-4" />;
      case 'unacceptable': return <AlertTriangle className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const calculateAverageScore = (data: ThirdPartyPerformance[]) => {
    if (data.length === 0) return 0;
    const total = data.reduce((sum, item) => sum + (item.overall_performance_score || 0), 0);
    return Math.round(total / data.length);
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (current < previous) return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <Activity className="w-4 h-4 text-gray-600" />;
  };

  const filteredData = selectedThirdParty 
    ? performanceData.filter(p => p.third_party_id === selectedThirdParty)
    : performanceData;

  const averageScore = calculateAverageScore(filteredData);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Performance Monitoring</h1>
          <p className="text-gray-600 mt-2">Track and analyze third-party performance metrics</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          Add Performance Record
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="period">Performance Period</Label>
              <select
                id="period"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="annually">Annually</option>
              </select>
            </div>
            <div>
              <Label htmlFor="third-party-filter">Third Party</Label>
              <select
                id="third-party-filter"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={selectedThirdParty}
                onChange={(e) => setSelectedThirdParty(e.target.value)}
              >
                <option value="">All Third Parties</option>
                {thirdParties.map((tp) => (
                  <option key={tp.id} value={tp.id}>{tp.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Performance Score</p>
                <p className="text-2xl font-bold text-gray-900">{averageScore}%</p>
                <p className="text-xs text-gray-500">vs previous period</p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">SLA Compliance</p>
                <p className="text-2xl font-bold text-green-600">
                  {filteredData.length > 0 
                    ? Math.round(filteredData.reduce((sum, item) => sum + (item.sla_compliance_percentage || 0), 0) / filteredData.length)
                    : 0}%
                </p>
                <p className="text-xs text-gray-500">Average compliance rate</p>
              </div>
              <Target className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Customer Satisfaction</p>
                <p className="text-2xl font-bold text-blue-600">
                  {filteredData.length > 0 
                    ? Math.round(filteredData.reduce((sum, item) => sum + (item.customer_satisfaction_score || 0), 0) / filteredData.length)
                    : 0}%
                </p>
                <p className="text-xs text-gray-500">Average satisfaction score</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Performance Records</p>
                <p className="text-2xl font-bold text-purple-600">{filteredData.length}</p>
                <p className="text-xs text-gray-500">Total records</p>
              </div>
              <Calendar className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics Table */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
          <CardDescription>Detailed performance metrics for all third parties</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading performance data...</div>
          ) : metrics.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No performance metrics found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Third Party</th>
                    <th className="text-left p-2">Overall Score</th>
                    <th className="text-left p-2">SLA Compliance</th>
                    <th className="text-left p-2">Quality</th>
                    <th className="text-left p-2">Delivery</th>
                    <th className="text-left p-2">Cost Effectiveness</th>
                    <th className="text-left p-2">Communication</th>
                    <th className="text-left p-2">Satisfaction</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.map((metric) => (
                    <tr key={metric.third_party_id} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-medium">{metric.third_party_name}</td>
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{metric.overall_performance_score}%</span>
                          {getTrendIcon(metric.overall_performance_score, 80)}
                        </div>
                      </td>
                      <td className="p-2">{metric.sla_compliance_percentage}%</td>
                      <td className="p-2">{metric.quality_score}%</td>
                      <td className="p-2">{metric.delivery_timeliness}%</td>
                      <td className="p-2">{metric.cost_effectiveness}%</td>
                      <td className="p-2">{metric.communication_effectiveness}%</td>
                      <td className="p-2">{metric.customer_satisfaction_score}%</td>
                      <td className="p-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Records */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Records</CardTitle>
          <CardDescription>Detailed performance records and reviews</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading performance records...</div>
          ) : filteredData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No performance records found</div>
          ) : (
            <div className="space-y-4">
              {filteredData.map((performance) => (
                <div key={performance.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">
                          {thirdParties.find(tp => tp.id === performance.third_party_id)?.name || 'Unknown Third Party'}
                        </h3>
                        <Badge className={getPerformanceLevelColor(performance.performance_level)}>
                          <div className="flex items-center gap-1">
                            {getPerformanceLevelIcon(performance.performance_level)}
                            {performance.performance_level.toUpperCase()}
                          </div>
                        </Badge>
                        <Badge variant="outline">
                          {performance.performance_period.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-2">{performance.review_comments}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Overall Score:</span> {performance.overall_performance_score}%
                        </div>
                        <div>
                          <span className="font-medium">SLA Compliance:</span> {performance.sla_compliance_percentage}%
                        </div>
                        <div>
                          <span className="font-medium">Quality Score:</span> {performance.quality_score}%
                        </div>
                        <div>
                          <span className="font-medium">Customer Satisfaction:</span> {performance.customer_satisfaction_score}%
                        </div>
                        <div>
                          <span className="font-medium">Period:</span> {formatDate(performance.period_start_date)} - {formatDate(performance.period_end_date)}
                        </div>
                        <div>
                          <span className="font-medium">Review Date:</span> {formatDate(performance.review_date)}
                        </div>
                        <div>
                          <span className="font-medium">Bonus Earned:</span> {performance.performance_bonus_earned ? 'Yes' : 'No'}
                        </div>
                        <div>
                          <span className="font-medium">Penalty Applied:</span> {performance.performance_penalty_applied ? 'Yes' : 'No'}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedPerformance(performance)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Performance Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Add Performance Record</h2>
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>×</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="third-party-select">Third Party *</Label>
                <select
                  id="third-party-select"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={formData.third_party_id}
                  onChange={(e) => setFormData({ ...formData, third_party_id: e.target.value })}
                  required
                >
                  <option value="">Select Third Party</option>
                  {thirdParties.map((tp) => (
                    <option key={tp.id} value={tp.id}>{tp.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="performance-period">Performance Period *</Label>
                <select
                  id="performance-period"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={formData.performance_period}
                  onChange={(e) => setFormData({ ...formData, performance_period: e.target.value as any })}
                  required
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="annually">Annually</option>
                </select>
              </div>

              <div>
                <Label htmlFor="period-start">Period Start Date *</Label>
                <Input
                  id="period-start"
                  type="date"
                  value={formData.period_start_date}
                  onChange={(e) => setFormData({ ...formData, period_start_date: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="period-end">Period End Date *</Label>
                <Input
                  id="period-end"
                  type="date"
                  value={formData.period_end_date}
                  onChange={(e) => setFormData({ ...formData, period_end_date: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="overall-score">Overall Performance Score (%) *</Label>
                <Input
                  id="overall-score"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.overall_performance_score}
                  onChange={(e) => setFormData({ ...formData, overall_performance_score: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="performance-level">Performance Level *</Label>
                <select
                  id="performance-level"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={formData.performance_level}
                  onChange={(e) => setFormData({ ...formData, performance_level: e.target.value as any })}
                  required
                >
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="satisfactory">Satisfactory</option>
                  <option value="poor">Poor</option>
                  <option value="unacceptable">Unacceptable</option>
                </select>
              </div>

              <div>
                <Label htmlFor="sla-compliance">SLA Compliance (%)</Label>
                <Input
                  id="sla-compliance"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.sla_compliance_percentage}
                  onChange={(e) => setFormData({ ...formData, sla_compliance_percentage: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div>
                <Label htmlFor="quality-score">Quality Score (%)</Label>
                <Input
                  id="quality-score"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.quality_score}
                  onChange={(e) => setFormData({ ...formData, quality_score: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div>
                <Label htmlFor="delivery-timeliness">Delivery Timeliness (%)</Label>
                <Input
                  id="delivery-timeliness"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.delivery_timeliness}
                  onChange={(e) => setFormData({ ...formData, delivery_timeliness: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div>
                <Label htmlFor="cost-effectiveness">Cost Effectiveness (%)</Label>
                <Input
                  id="cost-effectiveness"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.cost_effectiveness}
                  onChange={(e) => setFormData({ ...formData, cost_effectiveness: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div>
                <Label htmlFor="communication-effectiveness">Communication Effectiveness (%)</Label>
                <Input
                  id="communication-effectiveness"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.communication_effectiveness}
                  onChange={(e) => setFormData({ ...formData, communication_effectiveness: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div>
                <Label htmlFor="problem-resolution-time">Problem Resolution Time (hours)</Label>
                <Input
                  id="problem-resolution-time"
                  type="number"
                  min="0"
                  value={formData.problem_resolution_time}
                  onChange={(e) => setFormData({ ...formData, problem_resolution_time: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div>
                <Label htmlFor="customer-satisfaction">Customer Satisfaction Score (%)</Label>
                <Input
                  id="customer-satisfaction"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.customer_satisfaction_score}
                  onChange={(e) => setFormData({ ...formData, customer_satisfaction_score: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="review-comments">Review Comments</Label>
                <textarea
                  id="review-comments"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows={3}
                  value={formData.review_comments}
                  onChange={(e) => setFormData({ ...formData, review_comments: e.target.value })}
                  placeholder="Performance review comments and observations"
                />
              </div>

              <div className="md:col-span-2">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="performance-bonus"
                      checked={formData.performance_bonus_earned}
                      onChange={(e) => setFormData({ ...formData, performance_bonus_earned: e.target.checked })}
                    />
                    <Label htmlFor="performance-bonus">Performance Bonus Earned</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="performance-penalty"
                      checked={formData.performance_penalty_applied}
                      onChange={(e) => setFormData({ ...formData, performance_penalty_applied: e.target.checked })}
                    />
                    <Label htmlFor="performance-penalty">Performance Penalty Applied</Label>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreatePerformance}>
                Add Performance Record
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Performance Detail Modal */}
      {selectedPerformance && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Performance Details</h2>
              <Button variant="outline" onClick={() => setSelectedPerformance(null)}>×</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Basic Information</h3>
                <div className="space-y-2">
                  <div><span className="font-medium">Third Party:</span> {thirdParties.find(tp => tp.id === selectedPerformance.third_party_id)?.name || 'Unknown'}</div>
                  <div><span className="font-medium">Period:</span> {selectedPerformance.performance_period.toUpperCase()}</div>
                  <div><span className="font-medium">Date Range:</span> {formatDate(selectedPerformance.period_start_date)} - {formatDate(selectedPerformance.period_end_date)}</div>
                  <div><span className="font-medium">Performance Level:</span>
                    <Badge className={`ml-2 ${getPerformanceLevelColor(selectedPerformance.performance_level)}`}>
                      {selectedPerformance.performance_level.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Performance Scores</h3>
                <div className="space-y-2">
                  <div><span className="font-medium">Overall Score:</span> {selectedPerformance.overall_performance_score}%</div>
                  <div><span className="font-medium">SLA Compliance:</span> {selectedPerformance.sla_compliance_percentage}%</div>
                  <div><span className="font-medium">Quality Score:</span> {selectedPerformance.quality_score}%</div>
                  <div><span className="font-medium">Delivery Timeliness:</span> {selectedPerformance.delivery_timeliness}%</div>
                  <div><span className="font-medium">Cost Effectiveness:</span> {selectedPerformance.cost_effectiveness}%</div>
                  <div><span className="font-medium">Communication:</span> {selectedPerformance.communication_effectiveness}%</div>
                  <div><span className="font-medium">Customer Satisfaction:</span> {selectedPerformance.customer_satisfaction_score}%</div>
                  <div><span className="font-medium">Problem Resolution Time:</span> {selectedPerformance.problem_resolution_time} hours</div>
                </div>
              </div>

              {selectedPerformance.review_comments && (
                <div className="md:col-span-2">
                  <h3 className="font-semibold mb-2">Review Comments</h3>
                  <p className="text-gray-700">{selectedPerformance.review_comments}</p>
                </div>
              )}

              {selectedPerformance.key_metrics && selectedPerformance.key_metrics.length > 0 && (
                <div className="md:col-span-2">
                  <h3 className="font-semibold mb-2">Key Metrics</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedPerformance.key_metrics.map((metric, index) => (
                      <Badge key={index} variant="outline">{metric}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedPerformance.performance_issues && selectedPerformance.performance_issues.length > 0 && (
                <div className="md:col-span-2">
                  <h3 className="font-semibold mb-2">Performance Issues</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {selectedPerformance.performance_issues.map((issue, index) => (
                      <li key={index} className="text-gray-700">{issue}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedPerformance.improvement_areas && selectedPerformance.improvement_areas.length > 0 && (
                <div className="md:col-span-2">
                  <h3 className="font-semibold mb-2">Areas for Improvement</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {selectedPerformance.improvement_areas.map((area, index) => (
                      <li key={index} className="text-gray-700">{area}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedPerformance.corrective_actions && selectedPerformance.corrective_actions.length > 0 && (
                <div className="md:col-span-2">
                  <h3 className="font-semibold mb-2">Corrective Actions</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {selectedPerformance.corrective_actions.map((action, index) => (
                      <li key={index} className="text-gray-700">{action}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="md:col-span-2">
                <h3 className="font-semibold mb-2">Additional Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div><span className="font-medium">Performance Bonus:</span> {selectedPerformance.performance_bonus_earned ? 'Earned' : 'Not Earned'}</div>
                    <div><span className="font-medium">Performance Penalty:</span> {selectedPerformance.performance_penalty_applied ? 'Applied' : 'Not Applied'}</div>
                  </div>
                  <div>
                    <div><span className="font-medium">Review Date:</span> {formatDate(selectedPerformance.review_date)}</div>
                    <div><span className="font-medium">Reviewed By:</span> {selectedPerformance.reviewed_by || 'N/A'}</div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2">
                <div className="flex justify-end">
                  <Button variant="outline" onClick={() => setSelectedPerformance(null)}>
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceMonitoring;
