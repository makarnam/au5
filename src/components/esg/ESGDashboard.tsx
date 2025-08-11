import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  Leaf, 
  Users, 
  Shield, 
  Target,
  BarChart3,
  FileText,
  Globe,
  Calculator,
  Building2,
  Activity
} from 'lucide-react';
import { esgService } from '../../services/esgService';
import { ESGDashboardMetrics, ESGCarbonSummary, ESGMaterialityMatrix } from '../../types';

interface ESGDashboardProps {
  className?: string;
}

const ESGDashboard: React.FC<ESGDashboardProps> = ({ className }) => {
  const [metrics, setMetrics] = useState<ESGDashboardMetrics | null>(null);
  const [carbonSummary, setCarbonSummary] = useState<ESGCarbonSummary | null>(null);
  const [materialityMatrix, setMaterialityMatrix] = useState<ESGMaterialityMatrix[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [metricsData, carbonData, materialityData] = await Promise.all([
        esgService.getESGDashboardMetrics(),
        esgService.getCarbonSummary(),
        esgService.getMaterialityMatrix(),
      ]);

      setMetrics(metricsData);
      setCarbonSummary(carbonData);
      setMaterialityMatrix(materialityData);
    } catch (error) {
      console.error('Error loading ESG dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (value: number, threshold: number = 70) => {
    if (value >= threshold) return 'text-green-600';
    if (value >= threshold * 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusIcon = (value: number, threshold: number = 70) => {
    if (value >= threshold) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (value >= threshold * 0.7) return <Activity className="h-4 w-4 text-yellow-600" />;
    return <TrendingDown className="h-4 w-4 text-red-600" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">ESG Management Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive Environmental, Social, and Governance program oversight
          </p>
        </div>
        <Button onClick={loadDashboardData} variant="outline">
          <Activity className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Programs</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.total_programs || 0}</div>
            <p className="text-xs text-muted-foreground">
              {metrics?.active_programs || 0} active programs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Collection Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.data_collection_rate.toFixed(1) || 0}%</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {getStatusIcon(metrics?.data_collection_rate || 0)}
              <span className="ml-1">Verification status</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Carbon Footprint</CardTitle>
            <Leaf className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(metrics?.carbon_footprint_total || 0).toLocaleString()} tCO₂e
            </div>
            <p className="text-xs text-muted-foreground">
              Total emissions tracked
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Goals Progress</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.goals_on_track || 0}</div>
            <p className="text-xs text-muted-foreground">
              {metrics?.goals_at_risk || 0} goals at risk
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="carbon">Carbon Management</TabsTrigger>
          <TabsTrigger value="materiality">Materiality Matrix</TabsTrigger>
          <TabsTrigger value="disclosures">Disclosures</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* ESG Categories Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">ESG Categories</CardTitle>
                <CardDescription>Program distribution by category</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Leaf className="h-4 w-4 text-green-600" />
                    <span>Environmental</span>
                  </div>
                  <Badge variant="secondary">45%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span>Social</span>
                  </div>
                  <Badge variant="secondary">35%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-purple-600" />
                    <span>Governance</span>
                  </div>
                  <Badge variant="secondary">20%</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
                <CardDescription>Latest ESG updates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">New carbon data verified</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">ESG disclosure approved</p>
                    <p className="text-xs text-muted-foreground">1 day ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Materiality assessment completed</p>
                    <p className="text-xs text-muted-foreground">3 days ago</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
                <CardDescription>Common ESG tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Create ESG Program
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Calculator className="h-4 w-4 mr-2" />
                  Add Carbon Data
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Globe className="h-4 w-4 mr-2" />
                  Materiality Assessment
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Target className="h-4 w-4 mr-2" />
                  Set ESG Goals
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="carbon" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Carbon Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Carbon Footprint Summary</CardTitle>
                <CardDescription>Emissions by scope</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Scope 1 (Direct)</span>
                  <span className="font-medium">
                    {(carbonSummary?.scope1_total || 0).toLocaleString()} tCO₂e
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Scope 2 (Indirect)</span>
                  <span className="font-medium">
                    {(carbonSummary?.scope2_total || 0).toLocaleString()} tCO₂e
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Scope 3 (Value Chain)</span>
                  <span className="font-medium">
                    {(carbonSummary?.scope3_total || 0).toLocaleString()} tCO₂e
                  </span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex items-center justify-between font-semibold">
                    <span>Total Emissions</span>
                    <span>{(carbonSummary?.total_emissions || 0).toLocaleString()} tCO₂e</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Carbon Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Emission Trends</CardTitle>
                <CardDescription>Year-over-year comparison</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Year-over-Year Change</span>
                    <div className="flex items-center">
                      {carbonSummary?.year_over_year_change && carbonSummary.year_over_year_change > 0 ? (
                        <TrendingUp className="h-4 w-4 text-red-600 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-green-600 mr-1" />
                      )}
                      <span className={`font-medium ${
                        carbonSummary?.year_over_year_change && carbonSummary.year_over_year_change > 0 
                          ? 'text-red-600' 
                          : 'text-green-600'
                      }`}>
                        {Math.abs(carbonSummary?.year_over_year_change || 0).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Reduction Target</span>
                    <span className="font-medium">
                      {(carbonSummary?.reduction_target || 0).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Progress</span>
                    <span className="font-medium">
                      {(carbonSummary?.progress_percentage || 0).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="materiality" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Materiality Matrix</CardTitle>
              <CardDescription>ESG topics by impact and financial materiality</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {materialityMatrix.slice(0, 10).map((topic, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{topic.topic_name}</span>
                        <Badge variant={
                          topic.materiality_level === 'critical' ? 'destructive' :
                          topic.materiality_level === 'high' ? 'default' :
                          topic.materiality_level === 'medium' ? 'secondary' : 'outline'
                        }>
                          {topic.materiality_level}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground capitalize">{topic.category}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        Combined: {topic.combined_score.toFixed(1)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Impact: {topic.impact_score} | Financial: {topic.financial_score}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="disclosures" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Disclosure Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Disclosure Status</CardTitle>
                <CardDescription>ESG reporting progress</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Completion Rate</span>
                  <span className={`font-medium ${getStatusColor(metrics?.disclosure_completion_rate || 0)}`}>
                    {metrics?.disclosure_completion_rate.toFixed(1) || 0}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Disclosures</span>
                  <span className="font-medium">{metrics?.disclosure_completion_rate ? 
                    Math.round((metrics.disclosure_completion_rate / 100) * 10) : 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Pending Approval</span>
                  <span className="font-medium">3</span>
                </div>
              </CardContent>
            </Card>

            {/* Framework Compliance */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Framework Compliance</CardTitle>
                <CardDescription>Reporting framework status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">GRI Standards</span>
                  <Badge variant="default">Compliant</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">SASB Standards</span>
                  <Badge variant="secondary">In Progress</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">TCFD Framework</span>
                  <Badge variant="outline">Planned</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">CDP Reporting</span>
                  <Badge variant="default">Compliant</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ESGDashboard;
