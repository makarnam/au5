import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { 
  Shield, 
  AlertTriangle, 
  FileText, 
  Bug, 
  Activity, 
  Lock, 
  Eye, 
  Server,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { itSecurityService, ITSecurityDashboardMetrics } from '../../services/itSecurityService';
import { Link } from 'react-router-dom';

const ITSecurityDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<ITSecurityDashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      const data = await itSecurityService.dashboard.getMetrics();
      setMetrics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load metrics');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'implemented':
      case 'operational':
      case 'effective': return 'bg-green-100 text-green-800';
      case 'in_progress':
      case 'investigating': return 'bg-blue-100 text-blue-800';
      case 'pending':
      case 'planned': return 'bg-yellow-100 text-yellow-800';
      case 'failed':
      case 'ineffective': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadMetrics}>Retry</Button>
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">IT & Security Risk Management</h1>
          <p className="text-gray-600 mt-2">
            Comprehensive IT and cybersecurity risk management across technology infrastructure and operations
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={loadMetrics}>
            <Activity className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Incidents */}
        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Incidents</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.total_incidents}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <span className={`inline-block w-2 h-2 rounded-full ${getSeverityColor('critical')} mr-1`}></span>
              {metrics.critical_incidents} critical
            </div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <Clock className="h-3 w-3 mr-1" />
              {metrics.open_incidents} open
            </div>
          </CardContent>
        </Card>

        {/* Vulnerabilities */}
        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vulnerabilities</CardTitle>
            <Bug className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.total_vulnerabilities}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <span className={`inline-block w-2 h-2 rounded-full ${getSeverityColor('high')} mr-1`}></span>
              {metrics.high_critical_vulnerabilities} high/critical
            </div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <CheckCircle className="h-3 w-3 mr-1" />
              {metrics.patched_vulnerabilities_30d} patched (30d)
            </div>
          </CardContent>
        </Card>

        {/* Controls */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">IT Controls</CardTitle>
            <Shield className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.total_controls}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <CheckCircle className="h-3 w-3 mr-1" />
              {metrics.implemented_controls} implemented
            </div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <Activity className="h-3 w-3 mr-1" />
              {metrics.effective_controls} effective
            </div>
          </CardContent>
        </Card>

        {/* Assets */}
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Assets</CardTitle>
            <Server className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.total_assets}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <span className={`inline-block w-2 h-2 rounded-full ${getSeverityColor('critical')} mr-1`}></span>
              {metrics.critical_assets} critical
            </div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <AlertTriangle className="h-3 w-3 mr-1" />
              {metrics.assets_with_vulnerabilities} at risk
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="incidents">Incidents</TabsTrigger>
          <TabsTrigger value="vulnerabilities">Vulnerabilities</TabsTrigger>
          <TabsTrigger value="controls">Controls</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Compliance Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lock className="h-5 w-5 mr-2" />
                  Compliance Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>PCI DSS Compliance</span>
                  <Badge className={getStatusColor('active')}>
                    {metrics.pci_compliance_score.toFixed(1)}%
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>ISO 27001 Status</span>
                  <Badge className={getStatusColor(metrics.isms_certification_status)}>
                    {metrics.isms_certification_status.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>CMMC Level</span>
                  <Badge className={getStatusColor('active')}>
                    Level {metrics.cmmc_current_level}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Security Monitoring */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Eye className="h-5 w-5 mr-2" />
                  Security Monitoring
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Alerts (24h)</span>
                  <Badge variant="outline">{metrics.security_alerts_24h}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>False Positive Rate</span>
                  <Badge variant="outline">{metrics.false_positive_rate.toFixed(1)}%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Policies Due Review</span>
                  <Badge variant="outline">{metrics.policies_due_review}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link to="/it-security/incidents/create">
                  <Button variant="outline" className="w-full h-20 flex flex-col">
                    <AlertTriangle className="h-6 w-6 mb-2" />
                    Report Incident
                  </Button>
                </Link>
                <Link to="/it-security/vulnerabilities/create">
                  <Button variant="outline" className="w-full h-20 flex flex-col">
                    <Bug className="h-6 w-6 mb-2" />
                    Add Vulnerability
                  </Button>
                </Link>
                <Link to="/it-security/controls/create">
                  <Button variant="outline" className="w-full h-20 flex flex-col">
                    <Shield className="h-6 w-6 mb-2" />
                    Create Control
                  </Button>
                </Link>
                <Link to="/it-security/policies/create">
                  <Button variant="outline" className="w-full h-20 flex flex-col">
                    <FileText className="h-6 w-6 mb-2" />
                    New Policy
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="incidents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Security Incidents</span>
                <Link to="/it-security/incidents">
                  <Button variant="outline">View All</Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Incident management interface will be implemented here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vulnerabilities" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Vulnerability Management</span>
                <Link to="/it-security/vulnerabilities">
                  <Button variant="outline">View All</Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Bug className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Vulnerability management interface will be implemented here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="controls" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>IT Controls Management</span>
                <Link to="/it-security/controls">
                  <Button variant="outline">View All</Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Controls management interface will be implemented here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Programs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link to="/it-security/pci">
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <Lock className="h-5 w-5 text-blue-600" />
                        <span className="font-medium">PCI DSS</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">Payment Card Industry Compliance</p>
                    </CardContent>
                  </Card>
                </Link>
                <Link to="/it-security/isms">
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <Shield className="h-5 w-5 text-green-600" />
                        <span className="font-medium">ISO 27001</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">Information Security Management</p>
                    </CardContent>
                  </Card>
                </Link>
                <Link to="/it-security/cmmc">
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <Activity className="h-5 w-5 text-purple-600" />
                        <span className="font-medium">CMMC</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">Cybersecurity Maturity Model</p>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Security Monitoring</span>
                <Link to="/it-security/monitoring">
                  <Button variant="outline">View All</Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Security monitoring interface will be implemented here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ITSecurityDashboard;
