import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { 
  Leaf, 
  Users, 
  Shield, 
  BarChart3, 
  Target, 
  MessageSquare,
  TrendingUp,
  Activity,
  Calendar,
  Globe,
  Wand2
} from 'lucide-react';
import ESGDashboard from '../../components/esg/ESGDashboard';
import CarbonManagement from '../../components/esg/CarbonManagement';
import ESGDisclosureManagement from '../../components/esg/ESGDisclosureManagement';
import PortfolioAssessment from '../../components/esg/PortfolioAssessment';
import ESGGoalsManagement from '../../components/esg/ESGGoalsManagement';
import StakeholderEngagement from '../../components/esg/StakeholderEngagement';
import DoubleMaterialityCalculator from '../../components/esg/DoubleMaterialityCalculator';
import ESGAIGenerator from '../../components/ai/ESGAIGenerator';

const ESGComprehensivePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabConfig = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <BarChart3 className="h-4 w-4" />,
      description: 'ESG overview and key metrics'
    },
    {
      id: 'carbon',
      label: 'Carbon Management',
      icon: <Leaf className="h-4 w-4" />,
      description: 'Track greenhouse gas emissions'
    },
    {
      id: 'disclosure',
      label: 'Disclosure Management',
      icon: <Globe className="h-4 w-4" />,
      description: 'Framework compliance and reporting'
    },
    {
      id: 'portfolio',
      label: 'Portfolio Assessment',
      icon: <Target className="h-4 w-4" />,
      description: 'Investment ESG risk assessment'
    },
    {
      id: 'goals',
      label: 'Goals Management',
      icon: <TrendingUp className="h-4 w-4" />,
      description: 'Goal setting and progress tracking'
    },
    {
      id: 'stakeholders',
      label: 'Stakeholder Engagement',
      icon: <Users className="h-4 w-4" />,
      description: 'Engagement planning and tracking'
    },
    {
      id: 'materiality',
      label: 'Materiality Assessment',
      icon: <Shield className="h-4 w-4" />,
      description: 'Double materiality analysis'
    },
    {
      id: 'ai-generator',
      label: 'AI Generator',
      icon: <Wand2 className="h-4 w-4" />,
      description: 'AI-powered ESG content generation'
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <ESGDashboard />;
      case 'carbon':
        return <CarbonManagement />;
      case 'disclosure':
        return <ESGDisclosureManagement />;
      case 'portfolio':
        return <PortfolioAssessment />;
      case 'goals':
        return <ESGGoalsManagement />;
      case 'stakeholders':
        return <StakeholderEngagement />;
      case 'materiality':
        return <DoubleMaterialityCalculator />;
      case 'ai-generator':
        return <ESGAIGenerator />;
      default:
        return <ESGDashboard />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-green-100 rounded-lg">
            <Leaf className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">ESG Management Suite</h1>
            <p className="text-muted-foreground">
              Comprehensive Environmental, Social, and Governance program management
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Programs</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              ESG programs in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Carbon Reduction</CardTitle>
            <Leaf className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">-15.2%</div>
            <p className="text-xs text-muted-foreground">
              Year-over-year reduction
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Goals on Track</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">8/10</div>
            <p className="text-xs text-muted-foreground">
              ESG goals meeting targets
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stakeholder Engagements</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">24</div>
            <p className="text-xs text-muted-foreground">
              Active engagements this quarter
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>ESG Management Modules</CardTitle>
          <CardDescription>
            Navigate between different ESG management functions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-7">
              {tabConfig.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id} className="flex flex-col items-center space-y-1">
                  {tab.icon}
                  <span className="text-xs">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {tabConfig.map((tab) => (
              <TabsContent key={tab.id} value={tab.id} className="mt-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    {tab.icon}
                    <div>
                      <h2 className="text-2xl font-bold">{tab.label}</h2>
                      <p className="text-muted-foreground">{tab.description}</p>
                    </div>
                  </div>
                  {renderTabContent()}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* ESG Framework Compliance */}
      <Card>
        <CardHeader>
          <CardTitle>ESG Framework Compliance</CardTitle>
          <CardDescription>
            Overview of compliance with major ESG frameworks and standards
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <h3 className="font-semibold">GRI Standards</h3>
                <Badge variant="outline" className="ml-auto">85%</Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Core Disclosures</span>
                  <span className="font-medium">17/20</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <h3 className="font-semibold">SASB Standards</h3>
                <Badge variant="outline" className="ml-auto">72%</Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Industry Metrics</span>
                  <span className="font-medium">13/18</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '72%' }}></div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <h3 className="font-semibold">TCFD Framework</h3>
                <Badge variant="outline" className="ml-auto">68%</Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Climate Disclosures</span>
                  <span className="font-medium">11/16</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '68%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle>Recent ESG Activities</CardTitle>
          <CardDescription>
            Latest updates and activities across all ESG modules
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-3 bg-green-50 rounded-lg">
              <div className="p-2 bg-green-100 rounded-full">
                <Leaf className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Carbon emissions data updated</p>
                <p className="text-sm text-muted-foreground">Scope 1 emissions reduced by 8% this quarter</p>
              </div>
              <span className="text-sm text-muted-foreground">2 hours ago</span>
            </div>

            <div className="flex items-center space-x-4 p-3 bg-blue-50 rounded-lg">
              <div className="p-2 bg-blue-100 rounded-full">
                <Target className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium">ESG goal milestone achieved</p>
                <p className="text-sm text-muted-foreground">Renewable energy target reached 75% completion</p>
              </div>
              <span className="text-sm text-muted-foreground">1 day ago</span>
            </div>

            <div className="flex items-center space-x-4 p-3 bg-purple-50 rounded-lg">
              <div className="p-2 bg-purple-100 rounded-full">
                <Users className="h-4 w-4 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Stakeholder engagement completed</p>
                <p className="text-sm text-muted-foreground">Community consultation meeting with local residents</p>
              </div>
              <span className="text-sm text-muted-foreground">3 days ago</span>
            </div>

            <div className="flex items-center space-x-4 p-3 bg-orange-50 rounded-lg">
              <div className="p-2 bg-orange-100 rounded-full">
                <Globe className="h-4 w-4 text-orange-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium">ESG disclosure published</p>
                <p className="text-sm text-muted-foreground">Annual sustainability report submitted to regulators</p>
              </div>
              <span className="text-sm text-muted-foreground">1 week ago</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ESGComprehensivePage;
