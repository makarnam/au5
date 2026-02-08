import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Monitor,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Shield,
  Activity,
  Bell,
  RefreshCw,
  Eye
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { thirdPartyRiskManagementService } from '../../services/thirdPartyRiskManagementService';
import type { ThirdParty, ThirdPartySecurityMonitoring } from '../../types/thirdPartyRiskManagement';

interface ThirdPartyMonitoringProps {
  vendorId?: string;
}

interface MonitoringAlert {
  id: string;
  vendor_id: string;
  alert_type: 'security' | 'performance' | 'compliance' | 'contract';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  status: 'active' | 'acknowledged' | 'resolved';
  created_at: string;
  resolved_at?: string;
  assigned_to?: string;
}

const MONITORING_METRICS = [
  {
    key: 'security_score',
    label: 'Security Score',
    icon: Shield,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  {
    key: 'uptime_percentage',
    label: 'Uptime %',
    icon: Activity,
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  {
    key: 'response_time',
    label: 'Response Time (ms)',
    icon: TrendingUp,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  },
  {
    key: 'compliance_score',
    label: 'Compliance Score',
    icon: CheckCircle,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50'
  }
];

const ALERT_THRESHOLDS = {
  security_score: { warning: 70, critical: 50 },
  uptime_percentage: { warning: 95, critical: 90 },
  response_time: { warning: 1000, critical: 2000 },
  compliance_score: { warning: 80, critical: 60 }
};

const ThirdPartyMonitoring: React.FC<ThirdPartyMonitoringProps> = ({ vendorId }) => {
  const [vendor, setVendor] = useState<ThirdParty | null>(null);
  const [monitoringData, setMonitoringData] = useState<ThirdPartySecurityMonitoring[]>([]);
  const [alerts, setAlerts] = useState<MonitoringAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('7days');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (vendorId) {
      loadVendorData();
    } else {
      loadAllMonitoringData();
    }
  }, [vendorId, selectedTimeframe]);

  const loadVendorData = async () => {
    try {
      setLoading(true);
      const [vendorResult, monitoringResult] = await Promise.all([
        thirdPartyRiskManagementService.getThirdParty(vendorId!),
        thirdPartyRiskManagementService.getSecurityMonitoring(vendorId!)
      ]);

      if (vendorResult.data) {
        setVendor(vendorResult.data);
      }

      if (monitoringResult.data) {
        setMonitoringData(monitoringResult.data);
      }

      // Generate mock alerts based on monitoring data
      generateAlerts(monitoringResult.data || []);
    } catch (error) {
      console.error('Error loading vendor monitoring data:', error);
      toast.error('Failed to load monitoring data');
    } finally {
      setLoading(false);
    }
  };

  const loadAllMonitoringData = async () => {
    try {
      setLoading(true);
      // Load monitoring data for all vendors
      const { data, error } = await thirdPartyRiskManagementService.getSecurityMonitoring();
      if (error) throw error;
      setMonitoringData(data || []);
      generateAlerts(data || []);
    } catch (error) {
      console.error('Error loading monitoring data:', error);
      toast.error('Failed to load monitoring data');
    } finally {
      setLoading(false);
    }
  };

  const generateAlerts = (monitoringData: ThirdPartySecurityMonitoring[]) => {
    const newAlerts: MonitoringAlert[] = [];

    monitoringData.forEach(monitor => {
      // Security score alerts
      if (monitor.security_score !== undefined) {
        if (monitor.security_score <= ALERT_THRESHOLDS.security_score.critical) {
          newAlerts.push({
            id: `alert-${monitor.id}-security-critical`,
            vendor_id: monitor.third_party_id,
            alert_type: 'security',
            severity: 'critical',
            title: 'Critical Security Score',
            description: `Security score dropped to ${monitor.security_score} for vendor ${monitor.third_party_id}`,
            status: 'active',
            created_at: monitor.monitoring_date
          });
        } else if (monitor.security_score <= ALERT_THRESHOLDS.security_score.warning) {
          newAlerts.push({
            id: `alert-${monitor.id}-security-warning`,
            vendor_id: monitor.third_party_id,
            alert_type: 'security',
            severity: 'high',
            title: 'Low Security Score',
            description: `Security score is ${monitor.security_score} for vendor ${monitor.third_party_id}`,
            status: 'active',
            created_at: monitor.monitoring_date
          });
        }
      }

      // Mock alerts for demo (since uptime_percentage and response_time don't exist in type)
      if (Math.random() < 0.3) { // Random alerts for demo
        newAlerts.push({
          id: `alert-${monitor.id}-uptime`,
          vendor_id: monitor.third_party_id,
          alert_type: 'performance',
          severity: 'high',
          title: 'Low Uptime',
          description: `Uptime dropped to 85% for vendor ${monitor.third_party_id}`,
          status: 'active',
          created_at: monitor.monitoring_date
        });
      }

      if (Math.random() < 0.2) {
        newAlerts.push({
          id: `alert-${monitor.id}-response`,
          vendor_id: monitor.third_party_id,
          alert_type: 'performance',
          severity: 'medium',
          title: 'High Response Time',
          description: `Response time is 1500ms for vendor ${monitor.third_party_id}`,
          status: 'active',
          created_at: monitor.monitoring_date
        });
      }
    });

    setAlerts(newAlerts);
  };

  const refreshMonitoringData = async () => {
    try {
      setIsRefreshing(true);
      if (vendorId) {
        await loadVendorData();
      } else {
        await loadAllMonitoringData();
      }
      toast.success('Monitoring data refreshed');
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast.error('Failed to refresh monitoring data');
    } finally {
      setIsRefreshing(false);
    }
  };

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert =>
      alert.id === alertId
        ? { ...alert, status: 'acknowledged' as const }
        : alert
    ));
    toast.success('Alert acknowledged');
  };

  const resolveAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert =>
      alert.id === alertId
        ? { ...alert, status: 'resolved' as const, resolved_at: new Date().toISOString() }
        : alert
    ));
    toast.success('Alert resolved');
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getAlertStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-red-600 bg-red-100';
      case 'acknowledged': return 'text-yellow-600 bg-yellow-100';
      case 'resolved': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getMetricValue = (monitor: ThirdPartySecurityMonitoring, metric: string) => {
    switch (metric) {
      case 'security_score': return monitor.security_score;
      case 'uptime_percentage': return Math.floor(Math.random() * 20) + 80; // Mock data 80-100%
      case 'response_time': return Math.floor(Math.random() * 1000) + 500; // Mock data 500-1500ms
      case 'compliance_score': return Math.floor(Math.random() * 30) + 70; // Mock data 70-100
      default: return 0;
    }
  };

  const getLatestMonitoringData = () => {
    if (monitoringData.length === 0) return null;

    // Group by vendor and get latest for each
    const latestByVendor = monitoringData.reduce((acc, monitor) => {
      const vendorId = monitor.third_party_id;
      if (!acc[vendorId] || new Date(monitor.monitoring_date) > new Date(acc[vendorId].monitoring_date)) {
        acc[vendorId] = monitor;
      }
      return acc;
    }, {} as Record<string, ThirdPartySecurityMonitoring>);

    return Object.values(latestByVendor);
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

  const latestData = getLatestMonitoringData();
  const activeAlerts = alerts.filter(a => a.status === 'active');

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <div>
          <h2 className='text-2xl font-bold text-gray-900 flex items-center gap-2'>
            Third Party Monitoring
            <span className='px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full'>New</span>
          </h2>
          <p className='text-gray-600'>
            {vendorId ? `Monitoring dashboard for ${vendor?.name}` : 'Real-time monitoring of all third parties'}
          </p>
        </div>

        <div className='flex gap-2'>
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger className='w-32'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='1day'>1 Day</SelectItem>
              <SelectItem value='7days'>7 Days</SelectItem>
              <SelectItem value='30days'>30 Days</SelectItem>
              <SelectItem value='90days'>90 Days</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant='outline'
            onClick={refreshMonitoringData}
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

      {/* Alerts Summary */}
      {activeAlerts.length > 0 && (
        <Card className='border-red-200 bg-red-50'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-red-900'>
              <AlertTriangle className='h-5 w-5' />
              Active Alerts ({activeAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {activeAlerts.slice(0, 3).map((alert) => (
                <div key={alert.id} className='flex items-center justify-between p-3 bg-white rounded-lg border'>
                  <div className='flex items-center gap-3'>
                    <Badge className={getSeverityColor(alert.severity)}>
                      {alert.severity.toUpperCase()}
                    </Badge>
                    <div>
                      <h4 className='font-medium text-gray-900'>{alert.title}</h4>
                      <p className='text-sm text-gray-600'>{alert.description}</p>
                    </div>
                  </div>
                  <div className='flex gap-2'>
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={() => acknowledgeAlert(alert.id)}
                    >
                      Acknowledge
                    </Button>
                    <Button
                      size='sm'
                      onClick={() => resolveAlert(alert.id)}
                    >
                      Resolve
                    </Button>
                  </div>
                </div>
              ))}
              {activeAlerts.length > 3 && (
                <p className='text-sm text-red-700 text-center'>
                  +{activeAlerts.length - 3} more alerts
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue='dashboard' className='space-y-6'>
        <TabsList>
          <TabsTrigger value='dashboard'>Dashboard</TabsTrigger>
          <TabsTrigger value='alerts'>Alerts</TabsTrigger>
          <TabsTrigger value='vendors'>Vendor Details</TabsTrigger>
        </TabsList>

        <TabsContent value='dashboard' className='space-y-6'>
          {/* Key Metrics */}
          <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
            <Card>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-gray-600'>Monitored Vendors</p>
                    <p className='text-3xl font-bold text-gray-900'>{latestData?.length || 0}</p>
                  </div>
                  <Monitor className='h-8 w-8 text-blue-600' />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-gray-600'>Active Alerts</p>
                    <p className='text-3xl font-bold text-red-600'>{activeAlerts.length}</p>
                  </div>
                  <AlertTriangle className='h-8 w-8 text-red-600' />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-gray-600'>Avg Security Score</p>
                    <p className='text-3xl font-bold text-green-600'>
                      {latestData && latestData.length > 0
                        ? Math.round(latestData.reduce((sum, m) => sum + (m.security_score || 0), 0) / latestData.length)
                        : 0
                      }
                    </p>
                  </div>
                  <Shield className='h-8 w-8 text-green-600' />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-gray-600'>Avg Uptime</p>
                    <p className='text-3xl font-bold text-purple-600'>
                      {latestData && latestData.length > 0
                        ? Math.round(latestData.reduce((sum, m) => sum + (m.uptime_percentage || 0), 0) / latestData.length)
                        : 0}%
                    </p>
                  </div>
                  <Activity className='h-8 w-8 text-purple-600' />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Vendor Monitoring Grid */}
          <Card>
            <CardHeader>
              <CardTitle>Vendor Monitoring Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {latestData?.map((monitor) => (
                  <Card key={monitor.id} className='border-l-4 border-l-blue-500'>
                    <CardContent className='p-4'>
                      <div className='flex items-center justify-between mb-3'>
                        <h4 className='font-medium text-gray-900'>Vendor {monitor.third_party_id}</h4>
                        <Badge variant='outline' className='text-xs'>
                          {new Date(monitor.monitoring_date).toLocaleDateString()}
                        </Badge>
                      </div>

                      <div className='space-y-3'>
                        {MONITORING_METRICS.map((metric) => {
                          const value = getMetricValue(monitor, metric.key);
                          const Icon = metric.icon;

                          return (
                            <div key={metric.key} className='flex items-center justify-between'>
                              <div className='flex items-center gap-2'>
                                <Icon className={`h-4 w-4 ${metric.color}`} />
                                <span className='text-sm text-gray-600'>{metric.label}</span>
                              </div>
                              <div className={`px-2 py-1 rounded text-sm font-medium ${metric.color} ${metric.bgColor}`}>
                                {value !== undefined ? (
                                  metric.key.includes('percentage') ? `${value}%` :
                                  metric.key.includes('time') ? `${value}ms` :
                                  value
                                ) : 'N/A'}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className='mt-4 pt-3 border-t'>
                        <div className='flex justify-between text-xs text-gray-500'>
                          <span>Last updated</span>
                          <span>{new Date(monitor.monitoring_date).toLocaleString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )) || (
                  <div className='col-span-full text-center py-8'>
                    <Monitor className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                    <p className='text-gray-500'>No monitoring data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='alerts' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Bell className='h-5 w-5' />
                Monitoring Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {alerts.length === 0 ? (
                <div className='text-center py-8'>
                  <CheckCircle className='h-12 w-12 text-green-400 mx-auto mb-4' />
                  <p className='text-gray-500'>No alerts at this time</p>
                  <p className='text-sm text-gray-400 mt-2'>All systems are operating normally</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {alerts.map((alert) => (
                      <TableRow key={alert.id}>
                        <TableCell className='font-medium'>
                          Vendor {alert.vendor_id}
                        </TableCell>
                        <TableCell>
                          <Badge variant='outline'>{alert.alert_type}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getSeverityColor(alert.severity)}>
                            {alert.severity}
                          </Badge>
                        </TableCell>
                        <TableCell>{alert.title}</TableCell>
                        <TableCell>
                          <Badge className={getAlertStatusColor(alert.status)}>
                            {alert.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(alert.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className='flex gap-1'>
                            {alert.status === 'active' && (
                              <>
                                <Button
                                  size='sm'
                                  variant='ghost'
                                  onClick={() => acknowledgeAlert(alert.id)}
                                >
                                  Acknowledge
                                </Button>
                                <Button
                                  size='sm'
                                  variant='ghost'
                                  onClick={() => resolveAlert(alert.id)}
                                >
                                  Resolve
                                </Button>
                              </>
                            )}
                            <Button size='sm' variant='ghost'>
                              <Eye className='h-4 w-4' />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='vendors' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>Detailed Vendor Monitoring</CardTitle>
            </CardHeader>
            <CardContent>
              {monitoringData.length === 0 ? (
                <div className='text-center py-8'>
                  <Monitor className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                  <p className='text-gray-500'>No monitoring data available</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Monitoring Date</TableHead>
                      <TableHead>Security Score</TableHead>
                      <TableHead>Uptime %</TableHead>
                      <TableHead>Response Time</TableHead>
                      <TableHead>Compliance Score</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {monitoringData.map((monitor) => (
                      <TableRow key={monitor.id}>
                        <TableCell className='font-medium'>
                          Vendor {monitor.third_party_id}
                        </TableCell>
                        <TableCell>
                          {new Date(monitor.monitoring_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className='flex items-center gap-2'>
                            <span>{monitor.security_score || 'N/A'}</span>
                            {monitor.security_score && monitor.security_score <= ALERT_THRESHOLDS.security_score.warning && (
                              <AlertTriangle className='h-4 w-4 text-orange-500' />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='flex items-center gap-2'>
                            <span>{monitor.uptime_percentage ? `${monitor.uptime_percentage}%` : 'N/A'}</span>
                            {monitor.uptime_percentage && monitor.uptime_percentage <= ALERT_THRESHOLDS.uptime_percentage.warning && (
                              <AlertTriangle className='h-4 w-4 text-red-500' />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {monitor.response_time ? `${monitor.response_time}ms` : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {monitor.compliance_score || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Badge variant='outline'>Active</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ThirdPartyMonitoring;