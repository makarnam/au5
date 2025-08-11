import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Target, 
  AlertTriangle,
  Plus,
  Edit,
  Eye,
  Download,
  Filter,
  Search,
  Activity,
  Calendar,
  DollarSign,
  Shield,
  Leaf,
  Users,
  Building2,
  PieChart
} from 'lucide-react';
import { esgService } from '../../services/esgService';
import { ESGPortfolioAssessment, PortfolioType, RiskLevel } from '../../types';

interface PortfolioAssessmentProps {
  className?: string;
}

const PortfolioAssessment: React.FC<PortfolioAssessmentProps> = ({ className }) => {
  const [portfolios, setPortfolios] = useState<ESGPortfolioAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<ESGPortfolioAssessment | null>(null);
  const [formData, setFormData] = useState({
    portfolio_name: '',
    portfolio_type: 'investment' as PortfolioType,
    assessment_date: '',
    total_value: 0,
    currency: 'USD',
    esg_score: 0,
    environmental_score: 0,
    social_score: 0,
    governance_score: 0,
    risk_level: 'medium' as RiskLevel,
    assessment_methodology: '',
    assessment_framework: '',
    notes: ''
  });

  useEffect(() => {
    loadPortfolios();
  }, []);

  const loadPortfolios = async () => {
    try {
      setLoading(true);
      const response = await esgService.getESGPortfolioAssessments();
      setPortfolios(response.data);
    } catch (error) {
      console.error('Error loading portfolios:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await esgService.updateESGPortfolioAssessment(editingItem.id, formData);
      } else {
        await esgService.createESGPortfolioAssessment(formData);
      }
      setShowForm(false);
      setEditingItem(null);
      resetForm();
      loadPortfolios();
    } catch (error) {
      console.error('Error saving portfolio assessment:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      portfolio_name: '',
      portfolio_type: 'investment',
      assessment_date: '',
      total_value: 0,
      currency: 'USD',
      esg_score: 0,
      environmental_score: 0,
      social_score: 0,
      governance_score: 0,
      risk_level: 'medium',
      assessment_methodology: '',
      assessment_framework: '',
      notes: ''
    });
  };

  const handleEdit = (item: ESGPortfolioAssessment) => {
    setEditingItem(item);
    setFormData({
      portfolio_name: item.portfolio_name,
      portfolio_type: item.portfolio_type,
      assessment_date: item.assessment_date,
      total_value: item.total_value || 0,
      currency: item.currency,
      esg_score: item.esg_score || 0,
      environmental_score: item.environmental_score || 0,
      social_score: item.social_score || 0,
      governance_score: item.governance_score || 0,
      risk_level: item.risk_level,
      assessment_methodology: item.assessment_methodology || '',
      assessment_framework: item.assessment_framework || '',
      notes: item.notes || ''
    });
    setShowForm(true);
  };

  const getRiskLevelColor = (risk: RiskLevel) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskLevelIcon = (risk: RiskLevel) => {
    switch (risk) {
      case 'low': return <Shield className="h-4 w-4" />;
      case 'medium': return <AlertTriangle className="h-4 w-4" />;
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  const getPortfolioTypeIcon = (type: PortfolioType) => {
    switch (type) {
      case 'investment': return <BarChart3 className="h-4 w-4" />;
      case 'supplier': return <Building2 className="h-4 w-4" />;
      case 'vendor': return <Building2 className="h-4 w-4" />;
      case 'asset': return <Target className="h-4 w-4" />;
      default: return <BarChart3 className="h-4 w-4" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (score >= 60) return <Activity className="h-4 w-4 text-yellow-600" />;
    return <TrendingDown className="h-4 w-4 text-red-600" />;
  };

  const getPortfolioStats = () => {
    const total = portfolios.length;
    const totalValue = portfolios.reduce((sum, p) => sum + (p.total_value || 0), 0);
    const avgESGScore = portfolios.length > 0 
      ? portfolios.reduce((sum, p) => sum + (p.esg_score || 0), 0) / portfolios.length 
      : 0;
    const highRisk = portfolios.filter(p => p.risk_level === 'high' || p.risk_level === 'critical').length;

    return { total, totalValue, avgESGScore, highRisk };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const stats = getPortfolioStats();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Portfolio Assessment</h1>
          <p className="text-muted-foreground">
            Investment ESG risk assessment and portfolio management
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Portfolio
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Portfolios</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Assessed portfolios
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(stats.totalValue / 1000000).toFixed(1)}M
            </div>
            <p className="text-xs text-muted-foreground">
              Combined portfolio value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg ESG Score</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.avgESGScore.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">
              Average ESG performance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.highRisk}</div>
            <p className="text-xs text-muted-foreground">
              High/critical risk portfolios
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Form Modal */}
      {showForm && (
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle>
              {editingItem ? 'Edit Portfolio Assessment' : 'Add Portfolio Assessment'}
            </CardTitle>
            <CardDescription>
              Enter details for the portfolio ESG assessment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="portfolio_name">Portfolio Name</Label>
                  <Input
                    id="portfolio_name"
                    value={formData.portfolio_name}
                    onChange={(e) => setFormData({...formData, portfolio_name: e.target.value})}
                    placeholder="e.g., Technology Fund"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="portfolio_type">Portfolio Type</Label>
                  <select
                    id="portfolio_type"
                    value={formData.portfolio_type}
                    onChange={(e) => setFormData({...formData, portfolio_type: e.target.value as PortfolioType})}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="investment">Investment</option>
                    <option value="supplier">Supplier</option>
                    <option value="vendor">Vendor</option>
                    <option value="asset">Asset</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="assessment_date">Assessment Date</Label>
                  <Input
                    id="assessment_date"
                    type="date"
                    value={formData.assessment_date}
                    onChange={(e) => setFormData({...formData, assessment_date: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="total_value">Total Value</Label>
                  <Input
                    id="total_value"
                    type="number"
                    step="0.01"
                    value={formData.total_value}
                    onChange={(e) => setFormData({...formData, total_value: parseFloat(e.target.value) || 0})}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <select
                    id="currency"
                    value={formData.currency}
                    onChange={(e) => setFormData({...formData, currency: e.target.value})}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="JPY">JPY</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="risk_level">Risk Level</Label>
                  <select
                    id="risk_level"
                    value={formData.risk_level}
                    onChange={(e) => setFormData({...formData, risk_level: e.target.value as RiskLevel})}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="esg_score">Overall ESG Score</Label>
                  <Input
                    id="esg_score"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.esg_score}
                    onChange={(e) => setFormData({...formData, esg_score: parseInt(e.target.value) || 0})}
                    placeholder="0-100"
                  />
                </div>

                <div>
                  <Label htmlFor="environmental_score">Environmental Score</Label>
                  <Input
                    id="environmental_score"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.environmental_score}
                    onChange={(e) => setFormData({...formData, environmental_score: parseInt(e.target.value) || 0})}
                    placeholder="0-100"
                  />
                </div>

                <div>
                  <Label htmlFor="social_score">Social Score</Label>
                  <Input
                    id="social_score"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.social_score}
                    onChange={(e) => setFormData({...formData, social_score: parseInt(e.target.value) || 0})}
                    placeholder="0-100"
                  />
                </div>

                <div>
                  <Label htmlFor="governance_score">Governance Score</Label>
                  <Input
                    id="governance_score"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.governance_score}
                    onChange={(e) => setFormData({...formData, governance_score: parseInt(e.target.value) || 0})}
                    placeholder="0-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="assessment_methodology">Assessment Methodology</Label>
                  <Input
                    id="assessment_methodology"
                    value={formData.assessment_methodology}
                    onChange={(e) => setFormData({...formData, assessment_methodology: e.target.value})}
                    placeholder="e.g., MSCI ESG Ratings"
                  />
                </div>

                <div>
                  <Label htmlFor="assessment_framework">Assessment Framework</Label>
                  <Input
                    id="assessment_framework"
                    value={formData.assessment_framework}
                    onChange={(e) => setFormData({...formData, assessment_framework: e.target.value})}
                    placeholder="e.g., SASB, GRI"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Additional assessment notes"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingItem(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingItem ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Portfolios Table */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Assessments</CardTitle>
          <CardDescription>
            ESG risk assessment results for all portfolios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Portfolio</th>
                  <th className="text-left p-2">Type</th>
                  <th className="text-right p-2">Value</th>
                  <th className="text-center p-2">ESG Score</th>
                  <th className="text-center p-2">E</th>
                  <th className="text-center p-2">S</th>
                  <th className="text-center p-2">G</th>
                  <th className="text-left p-2">Risk Level</th>
                  <th className="text-left p-2">Assessment Date</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {portfolios.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-medium">{item.portfolio_name}</td>
                    <td className="p-2">
                      <div className="flex items-center">
                        {getPortfolioTypeIcon(item.portfolio_type)}
                        <span className="ml-1 text-sm">
                          {item.portfolio_type}
                        </span>
                      </div>
                    </td>
                    <td className="p-2 text-right">
                      {item.total_value ? `$${(item.total_value / 1000000).toFixed(1)}M` : '-'}
                    </td>
                    <td className="p-2 text-center">
                      <div className="flex items-center justify-center">
                        {getScoreIcon(item.esg_score || 0)}
                        <span className={`ml-1 font-medium ${getScoreColor(item.esg_score || 0)}`}>
                          {item.esg_score || 0}
                        </span>
                      </div>
                    </td>
                    <td className="p-2 text-center">
                      <span className={getScoreColor(item.environmental_score || 0)}>
                        {item.environmental_score || 0}
                      </span>
                    </td>
                    <td className="p-2 text-center">
                      <span className={getScoreColor(item.social_score || 0)}>
                        {item.social_score || 0}
                      </span>
                    </td>
                    <td className="p-2 text-center">
                      <span className={getScoreColor(item.governance_score || 0)}>
                        {item.governance_score || 0}
                      </span>
                    </td>
                    <td className="p-2">
                      <Badge className={getRiskLevelColor(item.risk_level)}>
                        {getRiskLevelIcon(item.risk_level)}
                        <span className="ml-1">{item.risk_level}</span>
                      </Badge>
                    </td>
                    <td className="p-2 text-sm">
                      {new Date(item.assessment_date).toLocaleDateString()}
                    </td>
                    <td className="p-2">
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(item)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Risk Distribution Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Distribution</CardTitle>
          <CardDescription>
            Distribution of portfolios by ESG risk level
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Low Risk</span>
                <span className="text-sm text-green-600">
                  {portfolios.filter(p => p.risk_level === 'low').length}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ 
                    width: `${(portfolios.filter(p => p.risk_level === 'low').length / portfolios.length) * 100}%` 
                  }}
                ></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Medium Risk</span>
                <span className="text-sm text-yellow-600">
                  {portfolios.filter(p => p.risk_level === 'medium').length}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-yellow-600 h-2 rounded-full" 
                  style={{ 
                    width: `${(portfolios.filter(p => p.risk_level === 'medium').length / portfolios.length) * 100}%` 
                  }}
                ></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">High Risk</span>
                <span className="text-sm text-orange-600">
                  {portfolios.filter(p => p.risk_level === 'high').length}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-orange-600 h-2 rounded-full" 
                  style={{ 
                    width: `${(portfolios.filter(p => p.risk_level === 'high').length / portfolios.length) * 100}%` 
                  }}
                ></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Critical Risk</span>
                <span className="text-sm text-red-600">
                  {portfolios.filter(p => p.risk_level === 'critical').length}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-red-600 h-2 rounded-full" 
                  style={{ 
                    width: `${(portfolios.filter(p => p.risk_level === 'critical').length / portfolios.length) * 100}%` 
                  }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PortfolioAssessment;
