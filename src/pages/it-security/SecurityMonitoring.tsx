import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
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
  Users
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
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Security Monitoring</h1>
          <p className="text-gray-600">Real-time security monitoring and system status</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Eye className="h-4 w-4 mr-2" />
            View Logs
          </Button>
          <Button>
            <Activity className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Threats</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">3</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 text-red-600" /> +12% from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">99.2%</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 text-green-600" /> +0.3% from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Score</CardTitle>
            <Shield className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">87</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 text-blue-600" /> +5 points from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Incidents Today</CardTitle>
            <Activity className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">7</div>
            <p className="text-xs text-muted-foreground">
              <TrendingDown className="inline h-3 w-3 text-green-600" /> -2 from yesterday
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Security Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5" />
              <span>Recent Security Events</span>
            </CardTitle>
            <CardDescription>Latest security events and alerts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {securityEvents.map((event) => {
                const EventIcon = getEventIcon(event.type);
                return (
                  <div key={event.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                    <EventIcon className="h-5 w-5 mt-0.5 text-gray-500" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {event.title}
                        </h4>
                        <Badge className={getSeverityColor(event.severity)}>
                          {event.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">{event.source}</span>
                        <span className="text-xs text-gray-500">{getTimeAgo(event.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4">
              <Button variant="outline" className="w-full">
                View All Events
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Server className="h-5 w-5" />
              <span>System Status</span>
            </CardTitle>
            <CardDescription>Current status of all monitored systems</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {systemStatus.map((system) => (
                <div key={system.name} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      system.status === 'operational' ? 'bg-green-500' :
                      system.status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{system.name}</h4>
                      <p className="text-xs text-gray-500">
                        Uptime: {system.uptime}% • Last check: {getTimeAgo(system.lastCheck)}
                      </p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(system.status)}>
                    {system.status}
                  </Badge>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button variant="outline" className="w-full">
                View Detailed Status
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Security Dashboard</span>
          </CardTitle>
          <CardDescription>Comprehensive security metrics and trends</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Threat Intelligence */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Threat Intelligence</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Known Threats</span>
                  <span className="text-sm font-medium">1,247</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">New Threats (24h)</span>
                  <span className="text-sm font-medium text-red-600">+23</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Blocked Attacks</span>
                  <span className="text-sm font-medium">892</span>
                </div>
              </div>
            </div>

            {/* Network Security */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Network Security</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Firewall Rules</span>
                  <span className="text-sm font-medium">156</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">VPN Connections</span>
                  <span className="text-sm font-medium">42</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Blocked IPs</span>
                  <span className="text-sm font-medium">1,089</span>
                </div>
              </div>
            </div>

            {/* Data Protection */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Data Protection</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Encrypted Data</span>
                  <span className="text-sm font-medium">99.8%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Backup Status</span>
                  <span className="text-sm font-medium text-green-600">Healthy</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">DLP Alerts</span>
                  <span className="text-sm font-medium">5</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common security monitoring tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col">
              <Eye className="h-5 w-5 mb-2" />
              <span className="text-sm">View Logs</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <AlertTriangle className="h-5 w-5 mb-2" />
              <span className="text-sm">Create Alert</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <BarChart3 className="h-5 w-5 mb-2" />
              <span className="text-sm">Generate Report</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Shield className="h-5 w-5 mb-2" />
              <span className="text-sm">Security Scan</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityMonitoring;
