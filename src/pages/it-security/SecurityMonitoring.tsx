import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { motion } from 'framer-motion';
import { 
  Activity, 
  AlertTriangle, 
  Shield, 
  Eye, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
  Network,
  Server,
  Database,
  Globe,
  Users,
  RefreshCw,
  ArrowRight
} from 'lucide-react';

interface SecurityEvent {
  id: string;
  type: 'threat' | 'vulnerability' | 'incident' | 'alert';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  source: string;
  timestamp: string;
  status: 'active' | 'resolved' | 'investigating';
}

interface SystemStatus {
  name: string;
  status: 'operational' | 'degraded' | 'down';
  uptime: number;
  lastCheck: string;
}

const SecurityMonitoring: React.FC = () => {
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data
  const mockSecurityEvents: SecurityEvent[] = [
    {
      id: '1',
      type: 'threat',
      severity: 'high',
      title: 'Suspicious Login Attempts Detected',
      description: 'Multiple failed login attempts from unknown IP addresses',
      source: 'Authentication System',
      timestamp: '2024-01-20T14:30:00Z',
      status: 'investigating'
    },
    {
      id: '2',
      type: 'vulnerability',
      severity: 'critical',
      title: 'Critical Security Patch Required',
      description: 'New zero-day vulnerability detected in web application',
      source: 'Vulnerability Scanner',
      timestamp: '2024-01-20T13:15:00Z',
      status: 'active'
    },
    {
      id: '3',
      type: 'incident',
      severity: 'medium',
      title: 'Data Access Anomaly',
      description: 'Unusual data access patterns detected',
      source: 'Data Loss Prevention',
      timestamp: '2024-01-20T12:45:00Z',
      status: 'resolved'
    },
    {
      id: '4',
      type: 'alert',
      severity: 'low',
      title: 'System Performance Alert',
      description: 'High CPU usage detected on production servers',
      source: 'System Monitor',
      timestamp: '2024-01-20T11:20:00Z',
      status: 'active'
    }
  ];

  const mockSystemStatus: SystemStatus[] = [
    {
      name: 'Web Application',
      status: 'operational',
      uptime: 99.9,
      lastCheck: '2024-01-20T14:35:00Z'
    },
    {
      name: 'Database Server',
      status: 'operational',
      uptime: 99.8,
      lastCheck: '2024-01-20T14:35:00Z'
    },
    {
      name: 'Authentication Service',
      status: 'degraded',
      uptime: 95.2,
      lastCheck: '2024-01-20T14:35:00Z'
    },
    {
      name: 'File Storage',
      status: 'operational',
      uptime: 99.7,
      lastCheck: '2024-01-20T14:35:00Z'
    },
    {
      name: 'Email System',
      status: 'operational',
      uptime: 99.5,
      lastCheck: '2024-01-20T14:35:00Z'
    },
    {
      name: 'Backup System',
      status: 'operational',
      uptime: 99.9,
      lastCheck: '2024-01-20T14:35:00Z'
    }
  ];

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setSecurityEvents(mockSecurityEvents);
        setSystemStatus(mockSystemStatus);
      } catch (error) {
        console.error('Error loading monitoring data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'bg-green-100 text-green-800';
      case 'degraded': return 'bg-yellow-100 text-yellow-800';
      case 'down': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'threat': return AlertTriangle;
      case 'vulnerability': return Shield;
      case 'incident': return AlertCircle;
      case 'alert': return Activity;
      default: return Activity;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const eventTime = new Date(timestamp);
    const diffMs = now.getTime() - eventTime.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Security Monitoring</h1>
          <p className="text-gray-600 text-lg">Real-time security monitoring and system status</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" className="hover:bg-blue-50 hover:border-blue-300 transition-all duration-200">
            <Eye className="h-4 w-4 mr-2" />
            View Logs
          </Button>
          <Button className="hover:bg-blue-700 transition-all duration-200">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <motion.div
          whileHover={{ scale: 1.02, y: -4 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Card className="border-l-4 border-l-red-500 shadow-sm hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-red-50/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-gray-700">Active Threats</CardTitle>
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">3</div>
              <p className="text-sm text-gray-600 mt-2">
                <TrendingUp className="inline h-4 w-4 text-red-600 mr-1" /> 
                <span className="font-medium">+12%</span> from yesterday
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02, y: -4 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Card className="border-l-4 border-l-green-500 shadow-sm hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-green-50/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-gray-700">System Uptime</CardTitle>
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">99.2%</div>
              <p className="text-sm text-gray-600 mt-2">
                <TrendingUp className="inline h-4 w-4 text-green-600 mr-1" /> 
                <span className="font-medium">+0.3%</span> from last week
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02, y: -4 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-blue-50/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-gray-700">Security Score</CardTitle>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Shield className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">87</div>
              <p className="text-sm text-gray-600 mt-2">
                <TrendingUp className="inline h-4 w-4 text-blue-600 mr-1" /> 
                <span className="font-medium">+5 points</span> from last month
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02, y: -4 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Card className="border-l-4 border-l-orange-500 shadow-sm hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-orange-50/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-gray-700">Incidents Today</CardTitle>
              <div className="p-2 bg-orange-100 rounded-lg">
                <Activity className="h-5 w-5 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">7</div>
              <p className="text-sm text-gray-600 mt-2">
                <TrendingDown className="inline h-4 w-4 text-green-600 mr-1" /> 
                <span className="font-medium">-2</span> from yesterday
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Security Events */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="shadow-sm hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-3 text-lg">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <span>Recent Security Events</span>
              </CardTitle>
              <CardDescription className="text-base">Latest security events and alerts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {securityEvents.map((event) => {
                  const EventIcon = getEventIcon(event.type);
                  return (
                    <motion.div
                      key={event.id}
                      whileHover={{ scale: 1.01, x: 4 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <EventIcon className="h-5 w-5 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-semibold text-gray-900 truncate">
                            {event.title}
                          </h4>
                          <Badge className={getSeverityColor(event.severity)} variant="secondary">
                            {event.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500 font-medium">{event.source}</span>
                          <span className="text-xs text-gray-500">{getTimeAgo(event.timestamp)}</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
              <div className="mt-6">
                <Button variant="outline" className="w-full hover:bg-blue-50 hover:border-blue-300 transition-all duration-200">
                  View All Events
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* System Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="shadow-sm hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-3 text-lg">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Server className="h-5 w-5 text-blue-600" />
                </div>
                <span>System Status</span>
              </CardTitle>
              <CardDescription className="text-base">Current status of all monitored systems</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {systemStatus.map((system) => (
                  <motion.div
                    key={system.name}
                    whileHover={{ scale: 1.01, x: 4 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${
                        system.status === 'operational' ? 'bg-green-500' :
                        system.status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">{system.name}</h4>
                        <p className="text-xs text-gray-500 mt-1">
                          Uptime: <span className="font-medium">{system.uptime}%</span> • Last check: {getTimeAgo(system.lastCheck)}
                        </p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(system.status)} variant="secondary">
                      {system.status}
                    </Badge>
                  </motion.div>
                ))}
              </div>
              <div className="mt-6">
                <Button variant="outline" className="w-full hover:bg-blue-50 hover:border-blue-300 transition-all duration-200">
                  View Detailed Status
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Security Dashboard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card className="shadow-sm hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-3 text-lg">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="h-5 w-5 text-purple-600" />
              </div>
              <span>Security Dashboard</span>
            </CardTitle>
            <CardDescription className="text-base">Comprehensive security metrics and trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Threat Intelligence */}
              <div className="space-y-4 p-4 bg-gradient-to-br from-red-50 to-white rounded-lg border border-red-100">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Threat Intelligence</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-2 bg-white rounded-md">
                    <span className="text-sm text-gray-600">Known Threats</span>
                    <span className="text-sm font-bold text-gray-900">1,247</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white rounded-md">
                    <span className="text-sm text-gray-600">New Threats (24h)</span>
                    <span className="text-sm font-bold text-red-600">+23</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white rounded-md">
                    <span className="text-sm text-gray-600">Blocked Attacks</span>
                    <span className="text-sm font-bold text-gray-900">892</span>
                  </div>
                </div>
              </div>

              {/* Network Security */}
              <div className="space-y-4 p-4 bg-gradient-to-br from-blue-50 to-white rounded-lg border border-blue-100">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Network className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Network Security</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-2 bg-white rounded-md">
                    <span className="text-sm text-gray-600">Firewall Rules</span>
                    <span className="text-sm font-bold text-gray-900">156</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white rounded-md">
                    <span className="text-sm text-gray-600">VPN Connections</span>
                    <span className="text-sm font-bold text-gray-900">42</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white rounded-md">
                    <span className="text-sm text-gray-600">Blocked IPs</span>
                    <span className="text-sm font-bold text-gray-900">1,089</span>
                  </div>
                </div>
              </div>

              {/* Data Protection */}
              <div className="space-y-4 p-4 bg-gradient-to-br from-green-50 to-white rounded-lg border border-green-100">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Database className="h-5 w-5 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Data Protection</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-2 bg-white rounded-md">
                    <span className="text-sm text-gray-600">Encrypted Data</span>
                    <span className="text-sm font-bold text-gray-900">99.8%</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white rounded-md">
                    <span className="text-sm text-gray-600">Backup Status</span>
                    <span className="text-sm font-bold text-green-600">Healthy</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white rounded-md">
                    <span className="text-sm text-gray-600">DLP Alerts</span>
                    <span className="text-sm font-bold text-gray-900">5</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Quick Actions</CardTitle>
            <CardDescription className="text-base">Common security monitoring tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button variant="outline" className="w-full h-24 flex-col hover:bg-blue-50 hover:border-blue-300 hover:shadow-md transition-all duration-200">
                  <div className="p-2 bg-blue-100 rounded-lg mb-2">
                    <Eye className="h-5 w-5 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium">View Logs</span>
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button variant="outline" className="w-full h-24 flex-col hover:bg-red-50 hover:border-red-300 hover:shadow-md transition-all duration-200">
                  <div className="p-2 bg-red-100 rounded-lg mb-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  <span className="text-sm font-medium">Create Alert</span>
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button variant="outline" className="w-full h-24 flex-col hover:bg-purple-50 hover:border-purple-300 hover:shadow-md transition-all duration-200">
                  <div className="p-2 bg-purple-100 rounded-lg mb-2">
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                  </div>
                  <span className="text-sm font-medium">Generate Report</span>
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button variant="outline" className="w-full h-24 flex-col hover:bg-green-50 hover:border-green-300 hover:shadow-md transition-all duration-200">
                  <div className="p-2 bg-green-100 rounded-lg mb-2">
                    <Shield className="h-5 w-5 text-green-600" />
                  </div>
                  <span className="text-sm font-medium">Security Scan</span>
                </Button>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default SecurityMonitoring;
