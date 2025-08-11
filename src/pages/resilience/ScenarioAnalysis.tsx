import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Target,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Plus,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Shield,
  Activity,
  FileText,
  Calendar,
  MapPin,
  Bell,
  Settings,
  Eye,
  Edit,
  Trash2,
  Play,
  Pause,
  RotateCcw,
  Zap,
  Info,
  Clock,
  Users,
  DollarSign,
  AlertCircle,
  PieChart,
  LineChart,
  BarChart,
  Scatter,
  Layers,
  Database,
  Cpu,
  Network,
  Globe,
  Building,
  Truck,
  Heart,
  Brain,
  Wifi,
  Server
} from 'lucide-react';
import { ScenarioAnalysis, Scenario, StressTest, ScenarioRecommendation, ProbabilityFactor } from '../../types/resilience';
import { resilienceService } from '../../services/resilienceService';

const ScenarioAnalysisPage: React.FC = () => {
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState<ScenarioAnalysis[]>([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState<ScenarioAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [scenarioTypeFilter, setScenarioTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Create new analysis modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAnalysis, setNewAnalysis] = useState({
    name: '',
    description: '',
    scenario_type: 'cyber_attack' as ScenarioAnalysis['scenario_type'],
    severity: 'medium' as ScenarioAnalysis['severity'],
    probability: 'medium' as ScenarioAnalysis['probability'],
    impact_areas: [] as string[]
  });

  // Scenario builder modal
  const [showScenarioModal, setShowScenarioModal] = useState(false);
  const [newScenario, setNewScenario] = useState({
    name: '',
    description: '',
    trigger_conditions: [] as string[],
    timeline: [] as any[],
    impact_assessment: {
      financial_impact: {
        direct_losses: 0,
        indirect_losses: 0,
        recovery_costs: 0,
        total_impact: 0
      },
      operational_impact: {
        affected_processes: [] as string[],
        downtime_hours: 0,
        capacity_reduction: 0,
        customer_impact: ''
      },
      reputational_impact: {
        media_coverage: '',
        stakeholder_concerns: [] as string[],
        brand_damage_assessment: ''
      },
      regulatory_impact: {
        compliance_breaches: [] as string[],
        reporting_requirements: [] as string[],
        potential_penalties: 0
      }
    },
    response_actions: [] as any[],
    recovery_actions: [] as any[],
    probability_factors: [] as ProbabilityFactor[]
  });

  // Stress test modal
  const [showStressTestModal, setShowStressTestModal] = useState(false);
  const [newStressTest, setNewStressTest] = useState({
    name: '',
    description: '',
    test_type: 'tabletop' as StressTest['test_type'],
    scenario_ids: [] as string[],
    participants: [] as string[],
    results: {
      overall_score: 0,
      response_time_score: 0,
      coordination_score: 0,
      communication_score: 0,
      resource_adequacy_score: 0,
      plan_effectiveness_score: 0,
      gaps_identified: [] as string[],
      strengths_identified: [] as string[],
      improvement_areas: [] as string[]
    },
    findings: [] as string[],
    recommendations: [] as string[]
  });

  useEffect(() => {
    fetchAnalyses();
  }, []);

  const fetchAnalyses = async () => {
    try {
      setLoading(true);
      const data = await resilienceService.getScenarioAnalyses();
      setAnalyses(data);
    } catch (err) {
      setError('Failed to load scenario analyses');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnalysis = async () => {
    try {
      const analysisData = {
        ...newAnalysis,
        status: 'draft' as ScenarioAnalysis['status'],
        scenarios: [],
        stress_tests: [],
        recommendations: []
      };
      
      await resilienceService.createScenarioAnalysis(analysisData);
      setShowCreateModal(false);
      setNewAnalysis({
        name: '',
        description: '',
        scenario_type: 'cyber_attack',
        severity: 'medium',
        probability: 'medium',
        impact_areas: []
      });
      fetchAnalyses();
    } catch (err) {
      setError('Failed to create scenario analysis');
      console.error(err);
    }
  };

  const handleCreateScenario = async () => {
    if (!selectedAnalysis) return;
    
    try {
      const scenarioData = {
        analysis_id: selectedAnalysis.id,
        ...newScenario
      };
      
      await resilienceService.createScenario(scenarioData);
      setShowScenarioModal(false);
      setNewScenario({
        name: '',
        description: '',
        trigger_conditions: [],
        timeline: [],
        impact_assessment: {
          financial_impact: {
            direct_losses: 0,
            indirect_losses: 0,
            recovery_costs: 0,
            total_impact: 0
          },
          operational_impact: {
            affected_processes: [],
            downtime_hours: 0,
            capacity_reduction: 0,
            customer_impact: ''
          },
          reputational_impact: {
            media_coverage: '',
            stakeholder_concerns: [],
            brand_damage_assessment: ''
          },
          regulatory_impact: {
            compliance_breaches: [],
            reporting_requirements: [],
            potential_penalties: 0
          }
        },
        response_actions: [],
        recovery_actions: [],
        probability_factors: []
      });
      fetchAnalyses();
    } catch (err) {
      setError('Failed to create scenario');
      console.error(err);
    }
  };

  const handleCreateStressTest = async () => {
    if (!selectedAnalysis) return;
    
    try {
      const stressTestData = {
        analysis_id: selectedAnalysis.id,
        ...newStressTest,
        conducted_at: new Date().toISOString(),
        conducted_by: 'current_user_id' // Replace with actual user ID
      };
      
      await resilienceService.createStressTest(stressTestData);
      setShowStressTestModal(false);
      setNewStressTest({
        name: '',
        description: '',
        test_type: 'tabletop',
        scenario_ids: [],
        participants: [],
        results: {
          overall_score: 0,
          response_time_score: 0,
          coordination_score: 0,
          communication_score: 0,
          resource_adequacy_score: 0,
          plan_effectiveness_score: 0,
          gaps_identified: [],
          strengths_identified: [],
          improvement_areas: []
        },
        findings: [],
        recommendations: []
      });
      fetchAnalyses();
    } catch (err) {
      setError('Failed to create stress test');
      console.error(err);
    }
  };

  const filteredAnalyses = analyses.filter(analysis => {
    const matchesStatus = statusFilter === 'all' || analysis.status === statusFilter;
    const matchesSeverity = severityFilter === 'all' || analysis.severity === severityFilter;
    const matchesType = scenarioTypeFilter === 'all' || analysis.scenario_type === scenarioTypeFilter;
    const matchesSearch = analysis.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         analysis.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesSeverity && matchesType && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'archived': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProbabilityColor = (probability: string) => {
    switch (probability) {
      case 'very_low': return 'bg-green-100 text-green-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'very_high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScenarioTypeIcon = (type: string) => {
    switch (type) {
      case 'cyber_attack': return <Shield className="w-4 h-4" />;
      case 'natural_disaster': return <MapPin className="w-4 h-4" />;
      case 'supply_chain_disruption': return <Truck className="w-4 h-4" />;
      case 'pandemic': return <Users className="w-4 h-4" />;
      case 'financial_crisis': return <DollarSign className="w-4 h-4" />;
      case 'regulatory_change': return <FileText className="w-4 h-4" />;
      case 'reputation_damage': return <Heart className="w-4 h-4" />;
      case 'technology_failure': return <Server className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const calculateRiskScore = (severity: string, probability: string) => {
    const severityScores = { low: 1, medium: 2, high: 3, critical: 4 };
    const probabilityScores = { very_low: 1, low: 2, medium: 3, high: 4, very_high: 5 };
    
    return (severityScores[severity as keyof typeof severityScores] || 1) * 
           (probabilityScores[probability as keyof typeof probabilityScores] || 1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Scenario Analysis</h1>
          <p className="text-gray-600">Stress testing and probability modeling for resilience planning</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Analysis</span>
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Analyses</p>
              <p className="text-2xl font-bold text-blue-600">{analyses.length}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">High Risk Scenarios</p>
              <p className="text-2xl font-bold text-red-600">
                {analyses.filter(a => calculateRiskScore(a.severity, a.probability) >= 12).length}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Stress Tests</p>
              <p className="text-2xl font-bold text-green-600">
                {analyses.reduce((acc, analysis) => acc + analysis.stress_tests.length, 0)}
              </p>
            </div>
            <Target className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Risk Score</p>
              <p className="text-2xl font-bold text-purple-600">
                {analyses.length > 0 
                  ? Math.round(analyses.reduce((acc, a) => acc + calculateRiskScore(a.severity, a.probability), 0) / analyses.length)
                  : 0
                }
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg border">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search analyses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
          
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Severity</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
          
          <select
            value={scenarioTypeFilter}
            onChange={(e) => setScenarioTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="cyber_attack">Cyber Attack</option>
            <option value="natural_disaster">Natural Disaster</option>
            <option value="supply_chain_disruption">Supply Chain</option>
            <option value="pandemic">Pandemic</option>
            <option value="financial_crisis">Financial Crisis</option>
            <option value="regulatory_change">Regulatory Change</option>
            <option value="reputation_damage">Reputation Damage</option>
            <option value="technology_failure">Technology Failure</option>
          </select>
        </div>
      </div>

      {/* Scenario Analyses List */}
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Scenario Analyses</h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredAnalyses.map((analysis) => (
            <div
              key={analysis.id}
              className="p-4 hover:bg-gray-50 cursor-pointer"
              onClick={() => setSelectedAnalysis(analysis)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {getScenarioTypeIcon(analysis.scenario_type)}
                    <div>
                      <h3 className="font-medium text-gray-900">{analysis.name}</h3>
                      <p className="text-sm text-gray-600">{analysis.description}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(analysis.status)}`}>
                    {analysis.status}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(analysis.severity)}`}>
                    {analysis.severity}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getProbabilityColor(analysis.probability)}`}>
                    {analysis.probability}
                  </span>
                  <div className="text-sm text-gray-500">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    {new Date(analysis.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
              
              <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                <span>Risk Score: {calculateRiskScore(analysis.severity, analysis.probability)}</span>
                <span>Scenarios: {analysis.scenarios.length}</span>
                <span>Stress Tests: {analysis.stress_tests.length}</span>
                <span>Recommendations: {analysis.recommendations.length}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Analysis Detail Modal */}
      {selectedAnalysis && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selectedAnalysis.name}</h2>
                <p className="text-gray-600">{selectedAnalysis.description}</p>
              </div>
              <button
                onClick={() => setSelectedAnalysis(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Analysis Details */}
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Analysis Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium">{selectedAnalysis.scenario_type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Severity:</span>
                      <span className={`font-medium ${getSeverityColor(selectedAnalysis.severity)}`}>
                        {selectedAnalysis.severity}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Probability:</span>
                      <span className={`font-medium ${getProbabilityColor(selectedAnalysis.probability)}`}>
                        {selectedAnalysis.probability}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Risk Score:</span>
                      <span className="font-medium">
                        {calculateRiskScore(selectedAnalysis.severity, selectedAnalysis.probability)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`font-medium ${getStatusColor(selectedAnalysis.status)}`}>
                        {selectedAnalysis.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Quick Actions</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => setShowScenarioModal(true)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm"
                    >
                      <Plus className="w-4 h-4 inline mr-2" />
                      Add Scenario
                    </button>
                    <button
                      onClick={() => setShowStressTestModal(true)}
                      className="w-full bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm"
                    >
                      <Target className="w-4 h-4 inline mr-2" />
                      Create Stress Test
                    </button>
                    <button className="w-full bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded text-sm">
                      <BarChart3 className="w-4 h-4 inline mr-2" />
                      Run Analysis
                    </button>
                  </div>
                </div>
              </div>

              {/* Scenarios */}
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Scenarios ({selectedAnalysis.scenarios.length})</h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {selectedAnalysis.scenarios.map((scenario, index) => (
                      <div key={index} className="p-2 bg-white rounded text-sm">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{scenario.name}</p>
                            <p className="text-gray-600">{scenario.description}</p>
                          </div>
                        </div>
                        <div className="mt-1 flex space-x-2">
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {scenario.trigger_conditions.length} triggers
                          </span>
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            ${scenario.impact_assessment.financial_impact.total_impact.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Stress Tests */}
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Stress Tests ({selectedAnalysis.stress_tests.length})</h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {selectedAnalysis.stress_tests.map((test, index) => (
                      <div key={index} className="p-2 bg-white rounded text-sm">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{test.name}</p>
                            <p className="text-gray-600">{test.test_type}</p>
                          </div>
                          <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                            {test.results.overall_score}/100
                          </span>
                        </div>
                        <div className="mt-1">
                          <span className="text-xs text-gray-500">
                            {new Date(test.conducted_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Analysis Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Create Scenario Analysis</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={newAnalysis.name}
                  onChange={(e) => setNewAnalysis({...newAnalysis, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Analysis name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newAnalysis.description}
                  onChange={(e) => setNewAnalysis({...newAnalysis, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Describe the analysis"
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={newAnalysis.scenario_type}
                    onChange={(e) => setNewAnalysis({...newAnalysis, scenario_type: e.target.value as ScenarioAnalysis['scenario_type']})}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="cyber_attack">Cyber Attack</option>
                    <option value="natural_disaster">Natural Disaster</option>
                    <option value="supply_chain_disruption">Supply Chain</option>
                    <option value="pandemic">Pandemic</option>
                    <option value="financial_crisis">Financial Crisis</option>
                    <option value="regulatory_change">Regulatory Change</option>
                    <option value="reputation_damage">Reputation Damage</option>
                    <option value="technology_failure">Technology Failure</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                  <select
                    value={newAnalysis.severity}
                    onChange={(e) => setNewAnalysis({...newAnalysis, severity: e.target.value as ScenarioAnalysis['severity']})}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Probability</label>
                  <select
                    value={newAnalysis.probability}
                    onChange={(e) => setNewAnalysis({...newAnalysis, probability: e.target.value as ScenarioAnalysis['probability']})}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="very_low">Very Low</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="very_high">Very High</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAnalysis}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                Create Analysis
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Scenario Modal */}
      {showScenarioModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Create Scenario</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={newScenario.name}
                    onChange={(e) => setNewScenario({...newScenario, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Scenario name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={newScenario.description}
                    onChange={(e) => setNewScenario({...newScenario, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={2}
                    placeholder="Scenario description"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trigger Conditions</label>
                <textarea
                  value={newScenario.trigger_conditions.join('\n')}
                  onChange={(e) => setNewScenario({...newScenario, trigger_conditions: e.target.value.split('\n').filter(line => line.trim())})}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Enter trigger conditions (one per line)"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Financial Impact - Direct Losses</label>
                  <input
                    type="number"
                    value={newScenario.impact_assessment.financial_impact.direct_losses}
                    onChange={(e) => setNewScenario({
                      ...newScenario,
                      impact_assessment: {
                        ...newScenario.impact_assessment,
                        financial_impact: {
                          ...newScenario.impact_assessment.financial_impact,
                          direct_losses: parseFloat(e.target.value) || 0
                        }
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Operational Impact - Downtime Hours</label>
                  <input
                    type="number"
                    value={newScenario.impact_assessment.operational_impact.downtime_hours}
                    onChange={(e) => setNewScenario({
                      ...newScenario,
                      impact_assessment: {
                        ...newScenario.impact_assessment,
                        operational_impact: {
                          ...newScenario.impact_assessment.operational_impact,
                          downtime_hours: parseFloat(e.target.value) || 0
                        }
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowScenarioModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateScenario}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                Create Scenario
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Stress Test Modal */}
      {showStressTestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Create Stress Test</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={newStressTest.name}
                  onChange={(e) => setNewStressTest({...newStressTest, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Stress test name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newStressTest.description}
                  onChange={(e) => setNewStressTest({...newStressTest, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Describe the stress test"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Test Type</label>
                <select
                  value={newStressTest.test_type}
                  onChange={(e) => setNewStressTest({...newStressTest, test_type: e.target.value as StressTest['test_type']})}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="tabletop">Tabletop Exercise</option>
                  <option value="simulation">Simulation</option>
                  <option value="full_scale">Full Scale</option>
                  <option value="partial">Partial</option>
                  <option value="automated">Automated</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Participants</label>
                <textarea
                  value={newStressTest.participants.join('\n')}
                  onChange={(e) => setNewStressTest({...newStressTest, participants: e.target.value.split('\n').filter(line => line.trim())})}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Enter participants (one per line)"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowStressTestModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateStressTest}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
              >
                Create Stress Test
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
    </div>
  );
};

export default ScenarioAnalysisPage;
