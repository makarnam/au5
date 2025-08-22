import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { 
  HardDrive, 
  Shield, 
  Tag, 
  MapPin, 
  Clock, 
  Activity,
  ArrowRight,
  Server,
  Database,
  Network,
  Globe,
  Building
} from "lucide-react";

const AssetManagement: React.FC = () => {
  const navigate = useNavigate();

  const assetCategories = [
    {
      title: "Security Assets",
      description: "Manage security infrastructure and assets",
      icon: Shield,
      count: 156,
      route: "/it-security/assets",
      color: "bg-red-50 text-red-600",
      features: ["Vulnerability tracking", "Risk scoring", "Security monitoring"]
    },
    {
      title: "IT Infrastructure",
      description: "Hardware and software asset management",
      icon: Server,
      count: 342,
      route: "/assets/infrastructure",
      color: "bg-blue-50 text-blue-600",
      features: ["Lifecycle management", "License tracking", "Maintenance scheduling"]
    },
    {
      title: "Network Assets",
      description: "Network infrastructure and connectivity",
      icon: Network,
      count: 89,
      route: "/assets/network",
      color: "bg-green-50 text-green-600",
      features: ["Network mapping", "Connectivity monitoring", "Performance tracking"]
    },
    {
      title: "Cloud Assets",
      description: "Cloud infrastructure and services",
      icon: Globe,
      count: 67,
      route: "/assets/cloud",
      color: "bg-purple-50 text-purple-600",
      features: ["Cloud monitoring", "Cost optimization", "Security compliance"]
    },
    {
      title: "Data Assets",
      description: "Database and data storage management",
      icon: Database,
      count: 234,
      route: "/assets/data",
      color: "bg-orange-50 text-orange-600",
      features: ["Data classification", "Backup monitoring", "Compliance tracking"]
    },
    {
      title: "Physical Assets",
      description: "Physical infrastructure and facilities",
      icon: Building,
      count: 45,
      route: "/assets/physical",
      color: "bg-gray-50 text-gray-600",
      features: ["Location tracking", "Maintenance records", "Asset tagging"]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Asset Management</h1>
          <p className="text-gray-600">Comprehensive asset management across all categories</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-gray-500">Total Assets</p>
            <p className="text-2xl font-bold text-gray-900">933</p>
          </div>
        </div>
      </div>

      {/* Asset Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assetCategories.map((category) => {
          const Icon = category.icon;
          return (
            <Card key={category.title} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg ${category.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <Badge variant="secondary">{category.count}</Badge>
                </div>
                <CardTitle className="text-lg">{category.title}</CardTitle>
                <CardDescription>{category.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="space-y-1">
                    {category.features.map((feature, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></div>
                        {feature}
                      </div>
                    ))}
                  </div>
                  <Button 
                    onClick={() => navigate(category.route)}
                    className="w-full mt-4"
                    variant="outline"
                  >
                    Manage {category.title}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common asset management tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex-col">
              <Plus className="h-6 w-6 mb-2" />
              Add New Asset
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Activity className="h-6 w-6 mb-2" />
              Asset Discovery
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Shield className="h-6 w-6 mb-2" />
              Security Scan
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssetManagement;
