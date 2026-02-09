import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { motion } from 'framer-motion';
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
  AlertCircle,
  RefreshCw,
  ArrowRight
} from 'lucide-react';
import { itSecurityDashboardService } from '../../services/itSecurityService';
import { ITSecurityDashboardMetrics } from '../../types/itSecurity';
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
      const data = await itSecurityDashboardService.getMetrics();
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
    <div className="space-y-8 p-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">IT & Security Risk Management</h1>
          <p className="text-gray-600 text-lg">
            Comprehensive IT and cybersecurity risk management across technology infrastructure and operations
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={loadMetrics}
          className="hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </motion.div>

      {/* Key Metrics Overview */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {/* Incidents */}
        <motion.div
          whileHover={{ scale: 1.02, y: -4 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Card className="border-l-4 border-l-red-500 shadow-sm hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-red-50/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-gray-700">Security Incidents</CardTitle>
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-3xl font-bold text-gray-900">{metrics.total_incidents}</div>
              <div className="flex items-center text-sm text-gray-600">
                <span className={`inline-block w-2.5 h-2.5 rounded-full ${getSeverityColor('critical')} mr-2`}></span>
                <span className="font-medium">{metrics.critical_incidents}</span>
                <span className="ml-1">critical</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="h-4 w-4 mr-2 text-blue-500" />
                <span className="font-medium">{metrics.open_incidents}</span>
                <span className="ml-1">open</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Vulnerabilities */}
        <motion.div
          whileHover={{ scale: 1.02, y: -4 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Card className="border-l-4 border-l-orange-500 shadow-sm hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-orange-50/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-gray-700">Vulnerabilities</CardTitle>
              <div className="p-2 bg-orange-100 rounded-lg">
                <Bug className="h-5 w-5 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-3xl font-bold text-gray-900">{metrics.total_vulnerabilities}</div>
              <div className="flex items-center text-sm text-gray-600">
                <span className={`inline-block w-2.5 h-2.5 rounded-full ${getSeverityColor('high')} mr-2`}></span>
                <span className="font-medium">{metrics.high_critical_vulnerabilities}</span>
                <span className="ml-1">high/critical</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                <span className="font-medium">{metrics.patched_vulnerabilities_30d}</span>
                <span className="ml-1">patched (30d)</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Controls */}
        <motion.div
          whileHover={{ scale: 1.02, y: -4 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-blue-50/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-gray-700">IT Controls</CardTitle>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Shield className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-3xl font-bold text-gray-900">{metrics.total_controls}</div>
              <div className="flex items-center text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                <span className="font-medium">{metrics.implemented_controls}</span>
                <span className="ml-1">implemented</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Activity className="h-4 w-4 mr-2 text-purple-500" />
                <span className="font-medium">{metrics.effective_controls}</span>
                <span className="ml-1">effective</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Assets */}
        <motion.div
          whileHover={{ scale: 1.02, y: -4 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Card className="border-l-4 border-l-green-500 shadow-sm hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-green-50/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-gray-700">Security Assets</CardTitle>
              <div className="p-2 bg-green-100 rounded-lg">
                <Server className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-3xl font-bold text-gray-900">{metrics.total_assets}</div>
              <div className="flex items-center text-sm text-gray-600">
                <span className={`inline-block w-2.5 h-2.5 rounded-full ${getSeverityColor('critical')} mr-2`}></span>
                <span className="font-medium">{metrics.critical_assets}</span>
                <span className="ml-1">critical</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <AlertTriangle className="h-4 w-4 mr-2 text-orange-500" />
                <span className="font-medium">{metrics.assets_with_vulnerabilities}</span>
                <span className="ml-1">at risk</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Main Content Tabs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 h-12 bg-gray-100/50 p-1 rounded-lg">
            <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200">Overview</TabsTrigger>
            <TabsTrigger value="incidents" className="data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200">Incidents</TabsTrigger>
            <TabsTrigger value="vulnerabilities" className="data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200">Vulnerabilities</TabsTrigger>
            <TabsTrigger value="controls" className="data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200">Controls</TabsTrigger>
            <TabsTrigger value="compliance" className="data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200">Compliance</TabsTrigger>
            <TabsTrigger value="monitoring" className="data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200">Monitoring</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Compliance Status */}
              <motion.div
                whileHover={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Card className="shadow-sm hover:shadow-lg transition-all duration-300">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center text-lg">
                      <div className="p-2 bg-blue-100 rounded-lg mr-3">
                        <Lock className="h-5 w-5 text-blue-600" />
                      </div>
                      Compliance Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <span className="font-medium text-gray-700">PCI DSS Compliance</span>
                      <Badge className={getStatusColor('active')} variant="secondary">
                        {metrics.pci_compliance_score.toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <span className="font-medium text-gray-700">ISO 27001 Status</span>
                      <Badge className={getStatusColor(metrics.isms_certification_status)} variant="secondary">
                        {metrics.isms_certification_status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <span className="font-medium text-gray-700">CMMC Level</span>
                      <Badge className={getStatusColor('active')} variant="secondary">
                        Level {metrics.cmmc_current_level}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Security Monitoring */}
              <motion.div
                whileHover={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Card className="shadow-sm hover:shadow-lg transition-all duration-300">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center text-lg">
                      <div className="p-2 bg-purple-100 rounded-lg mr-3">
                        <Eye className="h-5 w-5 text-purple-600" />
                      </div>
                      Security Monitoring
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <span className="font-medium text-gray-700">Alerts (24h)</span>
                      <Badge variant="outline" className="font-semibold">{metrics.security_alerts_24h}</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <span className="font-medium text-gray-700">False Positive Rate</span>
                      <Badge variant="outline" className="font-semibold">{metrics.false_positive_rate.toFixed(1)}%</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <span className="font-medium text-gray-700">Policies Due Review</span>
                      <Badge variant="outline" className="font-semibold">{metrics.policies_due_review}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Link to="/it-security/incidents/create">
                      <motion.div
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button variant="outline" className="w-full h-24 flex flex-col hover:bg-red-50 hover:border-red-300 hover:shadow-md transition-all duration-200">
                          <div className="p-2 bg-red-100 rounded-lg mb-2">
                            <AlertTriangle className="h-6 w-6 text-red-600" />
                          </div>
                          <span className="font-medium">Report Incident</span>
                        </Button>
                      </motion.div>
                    </Link>
                    <Link to="/it-security/vulnerabilities/create">
                      <motion.div
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button variant="outline" className="w-full h-24 flex flex-col hover:bg-orange-50 hover:border-orange-300 hover:shadow-md transition-all duration-200">
                          <div className="p-2 bg-orange-100 rounded-lg mb-2">
                            <Bug className="h-6 w-6 text-orange-600" />
                          </div>
                          <span className="font-medium">Add Vulnerability</span>
                        </Button>
                      </motion.div>
                    </Link>
                    <Link to="/it-security/controls/create">
                      <motion.div
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button variant="outline" className="w-full h-24 flex flex-col hover:bg-blue-50 hover:border-blue-300 hover:shadow-md transition-all duration-200">
                          <div className="p-2 bg-blue-100 rounded-lg mb-2">
                            <Shield className="h-6 w-6 text-blue-600" />
                          </div>
                          <span className="font-medium">Create Control</span>
                        </Button>
                      </motion.div>
                    </Link>
                    <Link to="/it-security/policies/create">
                      <motion.div
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button variant="outline" className="w-full h-24 flex flex-col hover:bg-green-50 hover:border-green-300 hover:shadow-md transition-all duration-200">
                          <div className="p-2 bg-green-100 rounded-lg mb-2">
                            <FileText className="h-6 w-6 text-green-600" />
                          </div>
                          <span className="font-medium">New Policy</span>
                        </Button>
                      </motion.div>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="incidents" className="space-y-6">
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between text-lg">
                  <span>Security Incidents</span>
                  <Link to="/it-security/incidents">
                    <Button variant="outline" className="hover:bg-blue-50 hover:border-blue-300 transition-all duration-200">
                      View All
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="p-4 bg-red-50 rounded-full inline-block mb-4">
                    <AlertTriangle className="h-12 w-12 text-red-400" />
                  </div>
                  <p className="text-gray-500 text-lg">Incident management interface will be implemented here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vulnerabilities" className="space-y-6">
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between text-lg">
                  <span>Vulnerability Management</span>
                  <Link to="/it-security/vulnerabilities">
                    <Button variant="outline" className="hover:bg-blue-50 hover:border-blue-300 transition-all duration-200">
                      View All
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="p-4 bg-orange-50 rounded-full inline-block mb-4">
                    <Bug className="h-12 w-12 text-orange-400" />
                  </div>
                  <p className="text-gray-500 text-lg">Vulnerability management interface will be implemented here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="controls" className="space-y-6">
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between text-lg">
                  <span>IT Controls Management</span>
                  <Link to="/it-security/controls">
                    <Button variant="outline" className="hover:bg-blue-50 hover:border-blue-300 transition-all duration-200">
                      View All
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="p-4 bg-blue-50 rounded-full inline-block mb-4">
                    <Shield className="h-12 w-12 text-blue-400" />
                  </div>
                  <p className="text-gray-500 text-lg">Controls management interface will be implemented here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compliance" className="space-y-6">
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Compliance Programs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Link to="/it-security/pci">
                    <motion.div
                      whileHover={{ scale: 1.03, y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-blue-300 bg-gradient-to-br from-white to-blue-50/50">
                        <CardContent className="p-6">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="p-3 bg-blue-100 rounded-lg">
                              <Lock className="h-6 w-6 text-blue-600" />
                            </div>
                            <span className="font-semibold text-lg">PCI DSS</span>
                          </div>
                          <p className="text-sm text-gray-600">Payment Card Industry Compliance</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Link>
                  <Link to="/it-security/isms">
                    <motion.div
                      whileHover={{ scale: 1.03, y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-green-300 bg-gradient-to-br from-white to-green-50/50">
                        <CardContent className="p-6">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="p-3 bg-green-100 rounded-lg">
                              <Shield className="h-6 w-6 text-green-600" />
                            </div>
                            <span className="font-semibold text-lg">ISO 27001</span>
                          </div>
                          <p className="text-sm text-gray-600">Information Security Management</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Link>
                  <Link to="/it-security/cmmc">
                    <motion.div
                      whileHover={{ scale: 1.03, y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-purple-300 bg-gradient-to-br from-white to-purple-50/50">
                        <CardContent className="p-6">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="p-3 bg-purple-100 rounded-lg">
                              <Activity className="h-6 w-6 text-purple-600" />
                            </div>
                            <span className="font-semibold text-lg">CMMC</span>
                          </div>
                          <p className="text-sm text-gray-600">Cybersecurity Maturity Model</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-6">
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between text-lg">
                  <span>Security Monitoring</span>
                  <Link to="/it-security/monitoring">
                    <Button variant="outline" className="hover:bg-blue-50 hover:border-blue-300 transition-all duration-200">
                      View All
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="p-4 bg-purple-50 rounded-full inline-block mb-4">
                    <Eye className="h-12 w-12 text-purple-400" />
                  </div>
                  <p className="text-gray-500 text-lg">Security monitoring interface will be implemented here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default ITSecurityDashboard;
