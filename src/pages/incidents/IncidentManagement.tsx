import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { 
  AlertTriangle, 
  Bell, 
  Clock, 
  Users, 
  FileText, 
  Activity,
  ArrowRight,
  Shield,
  CheckCircle,
  XCircle,
  TrendingUp,
  Plus
} from "lucide-react";

const IncidentManagement: React.FC = () => {
  const navigate = useNavigate();

  const incidentModules = [
    {
      title: "IT Security Incidents",
      description: "Security incident management and response",
      icon: Shield,
      route: "/it-security/incidents",
      color: "bg-red-50 text-red-600",
      features: ["Security incident tracking", "Vulnerability management", "Threat response", "Security monitoring"]
    },
    {
      title: "Resilience Incidents",
      description: "Business continuity and resilience incidents",
      icon: AlertTriangle,
      route: "/resilience/incidents",
      color: "bg-orange-50 text-orange-600",
      features: ["Business continuity", "Crisis management", "Recovery planning", "Impact assessment"]
    },
    {
      title: "Third Party Incidents",
      description: "Third party and vendor incident management",
      icon: Users,
      route: "/third-party-risk-management/incidents",
      color: "bg-blue-50 text-blue-600",
      features: ["Vendor incidents", "Contract monitoring", "Risk assessment", "Performance tracking"]
    }
  ];

  const stats = {
    totalIncidents: 156,
    openIncidents: 23,
    resolvedThisMonth: 89,
    averageResolutionTime: 4.2,
    criticalIncidents: 5,
    securityIncidents: 67
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Incident Management</h1>
          <p className="text-gray-600">Comprehensive incident management across all categories</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-gray-500">Open Incidents</p>
            <p className="text-2xl font-bold text-red-600">{stats.openIncidents}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Incidents</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalIncidents}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Critical Incidents</p>
                <p className="text-2xl font-bold text-red-600">{stats.criticalIncidents}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Resolved This Month</p>
                <p className="text-2xl font-bold text-green-600">{stats.resolvedThisMonth}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Resolution (Days)</p>
                <p className="text-2xl font-bold text-blue-600">{stats.averageResolutionTime}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Incident Modules */}
      <Card>
        <CardHeader>
          <CardTitle>Incident Management Modules</CardTitle>
          <CardDescription>Access different incident management systems</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {incidentModules.map((module) => {
              const Icon = module.icon;
              return (
                <Card key={module.title} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className={`p-2 rounded-lg ${module.color}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                    </div>
                    <CardTitle className="text-lg">{module.title}</CardTitle>
                    <CardDescription>{module.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="space-y-1">
                        {module.features.map((feature, index) => (
                          <div key={index} className="flex items-center text-sm text-gray-600">
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></div>
                            {feature}
                          </div>
                        ))}
                      </div>
                      <Button 
                        onClick={() => navigate(module.route)}
                        className="w-full mt-4"
                        variant="outline"
                      >
                        Access Module
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common incident management tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col">
              <Plus className="h-6 w-6 mb-2" />
              Report Incident
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Activity className="h-6 w-6 mb-2" />
              View Dashboard
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <FileText className="h-6 w-6 mb-2" />
              Generate Report
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <TrendingUp className="h-6 w-6 mb-2" />
              View Analytics
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IncidentManagement;
