import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { 
  GraduationCap, 
  BookOpen, 
  Award, 
  Users, 
  Calendar, 
  Target,
  ArrowRight,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  BarChart3
} from "lucide-react";

const TrainingCertification: React.FC = () => {
  const navigate = useNavigate();

  const trainingModules = [
    {
      title: "Training Management Dashboard",
      description: "Comprehensive training and certification management",
      icon: GraduationCap,
      route: "/training/dashboard",
      color: "bg-blue-50 text-blue-600",
      features: ["Module management", "Assignment tracking", "Certification tracking", "Learning paths"]
    },
    {
      title: "Audit Planning Training",
      description: "Training needs within audit planning",
      icon: Target,
      route: "/audit-planning/training",
      color: "bg-green-50 text-green-600",
      features: ["Training needs analysis", "Competency mapping", "Resource planning", "Progress tracking"]
    },
    {
      title: "Governance Training",
      description: "Compliance and governance training",
      icon: BookOpen,
      route: "/governance/training",
      color: "bg-purple-50 text-purple-600",
      features: ["Compliance training", "Framework-based modules", "Assignment management", "Completion tracking"]
    }
  ];

  const stats = {
    totalModules: 45,
    activeAssignments: 234,
    completedThisMonth: 89,
    certificationsExpiring: 12,
    averageCompletionRate: 87,
    totalUsers: 156
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Training & Certification Management</h1>
          <p className="text-gray-600">Comprehensive training and certification management system</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-gray-500">Active Users</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Modules</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalModules}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Assignments</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeAssignments}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed This Month</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedThisMonth}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageCompletionRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Training Modules */}
      <Card>
        <CardHeader>
          <CardTitle>Training Modules</CardTitle>
          <CardDescription>Access different training management systems</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {trainingModules.map((module) => {
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
          <CardDescription>Common training management tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col">
              <BookOpen className="h-6 w-6 mb-2" />
              Create Module
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Users className="h-6 w-6 mb-2" />
              Assign Training
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Award className="h-6 w-6 mb-2" />
              Issue Certificate
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <BarChart3 className="h-6 w-6 mb-2" />
              View Reports
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrainingCertification;
