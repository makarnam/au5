import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Leaf,
  Users,
  Shield,
  Target,
  BarChart3,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Globe,
  Factory,
  Car,
  Zap,
  Droplets,
  Recycle,
  TreePine,
  Building2,
  Heart,
  Award,
  Scale,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Progress } from '../ui/progress';
import { esgService } from '../../services/esgService';

interface ESGMetrics {
  environmental: {
    carbonFootprint: number;
    energyConsumption: number;
    waterUsage: number;
    wasteGenerated: number;
    renewableEnergyPercentage: number;
    recyclingRate: number;
  };
  social: {
    employeeSatisfaction: number;
    diversityPercentage: number;
    trainingHours: number;
    communityInvestment: number;
    healthSafetyIncidents: number;
    supplierDiversity: number;
  };
  governance: {
    boardDiversity: number;
    executiveCompensationRatio: number;
    ethicsComplianceScore: number;
    transparencyScore: number;
    stakeholderEngagement: number;
    riskManagementScore: number;
  };
}

interface ESGGoal {
  id: string;
  category: 'environmental' | 'social' | 'governance';
  title: string;
  description: string;
  target: number;
  current: number;
  unit: string;
  deadline: string;
  status: 'on-track' | 'at-risk' | 'behind' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface ESGProgram {
  id: string;
  name: string;
  category: 'environmental' | 'social' | 'governance';
  description: string;
  status: 'active' | 'planned' | 'completed' | 'paused';
  budget: number;
  spent: number;
  startDate: string;
  endDate: string;
  impact: string;
}

const ESGDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<ESGMetrics | null>(null);
  const [goals, setGoals] = useState<ESGGoal[]>([]);
  const [programs, setPrograms] = useState<ESGProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('current');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'environmental' | 'social' | 'governance'>('all');

  useEffect(() => {
    loadESGData();
  }, [timeframe]);

  const loadESGData = async () => {
    try {
      setLoading(true);
      
      // Load metrics, goals, and programs
      const [metricsData, goalsData, programsData] = await Promise.all([
        esgService.getMetrics(timeframe),
        esgService.getGoals(),
        esgService.getPrograms(),
      ]);

      setMetrics(metricsData);
      setGoals(goalsData);
      setPrograms(programsData);
    } catch (error) {
      console.error('Error loading ESG data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track': return 'bg-green-100 text-green-800';
      case 'at-risk': return 'bg-yellow-100 text-yellow-800';
      case 'behind': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'environmental': return <Leaf className="w-4 h-4" />;
      case 'social': return <Users className="w-4 h-4" />;
      case 'governance': return <Shield className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const filteredGoals = goals.filter(goal => 
    selectedCategory === 'all' || goal.category === selectedCategory
  );

  const filteredPrograms = programs.filter(program => 
    selectedCategory === 'all' || program.category === selectedCategory
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">ESG Dashboard</h1>
          <p className="text-gray-600">Environmental, Social, and Governance Performance</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">Current Period</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="previous">Previous Period</SelectItem>
            </SelectContent>
          </Select>
          <Button>
            <BarChart3 className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Leaf className="w-4 h-4 mr-2 text-green-600" />
              Environmental Score
            </CardTitle>
            <TrendingUp className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78.5%</div>
            <p className="text-xs text-muted-foreground">
              +2.3% from last period
            </p>
            <Progress value={78.5} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Users className="w-4 h-4 mr-2 text-blue-600" />
              Social Score
            </CardTitle>
            <TrendingUp className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">82.1%</div>
            <p className="text-xs text-muted-foreground">
              +1.8% from last period
            </p>
            <Progress value={82.1} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Shield className="w-4 h-4 mr-2 text-purple-600" />
              Governance Score
            </CardTitle>
            <TrendingUp className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85.3%</div>
            <p className="text-xs text-muted-foreground">
              +3.1% from last period
            </p>
            <Progress value={85.3} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <Tabs defaultValue="environmental" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="environmental" className="flex items-center">
            <Leaf className="w-4 h-4 mr-2" />
            Environmental
          </TabsTrigger>
          <TabsTrigger value="social" className="flex items-center">
            <Users className="w-4 h-4 mr-2" />
            Social
          </TabsTrigger>
          <TabsTrigger value="governance" className="flex items-center">
            <Shield className="w-4 h-4 mr-2" />
            Governance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="environmental" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Carbon Footprint</CardTitle>
                <Factory className="w-4 h-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2,847</div>
                <p className="text-xs text-muted-foreground">tons CO2e</p>
                <div className="flex items-center mt-2">
                  <TrendingDown className="w-4 h-4 text-green-600 mr-1" />
                  <span className="text-xs text-green-600">-12% vs target</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Energy Consumption</CardTitle>
                <Zap className="w-4 h-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">15.2</div>
                <p className="text-xs text-muted-foreground">GWh</p>
                <div className="flex items-center mt-2">
                  <TrendingDown className="w-4 h-4 text-green-600 mr-1" />
                  <span className="text-xs text-green-600">-8% vs target</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Water Usage</CardTitle>
                <Droplets className="w-4 h-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8,450</div>
                <p className="text-xs text-muted-foreground">m³</p>
                <div className="flex items-center mt-2">
                  <TrendingDown className="w-4 h-4 text-green-600 mr-1" />
                  <span className="text-xs text-green-600">-15% vs target</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Waste Generated</CardTitle>
                <Recycle className="w-4 h-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,234</div>
                <p className="text-xs text-muted-foreground">tons</p>
                <div className="flex items-center mt-2">
                  <TrendingDown className="w-4 h-4 text-green-600 mr-1" />
                  <span className="text-xs text-green-600">-20% vs target</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Renewable Energy</CardTitle>
                <TreePine className="w-4 h-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">45%</div>
                <p className="text-xs text-muted-foreground">of total energy</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                  <span className="text-xs text-green-600">+5% vs target</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recycling Rate</CardTitle>
                <Recycle className="w-4 h-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">78%</div>
                <p className="text-xs text-muted-foreground">of waste recycled</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                  <span className="text-xs text-green-600">+3% vs target</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="social" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Employee Satisfaction</CardTitle>
                <Heart className="w-4 h-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">87%</div>
                <p className="text-xs text-muted-foreground">satisfaction rate</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                  <span className="text-xs text-green-600">+2% vs target</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Diversity</CardTitle>
                <Users className="w-4 h-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">42%</div>
                <p className="text-xs text-muted-foreground">women in workforce</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                  <span className="text-xs text-green-600">+1% vs target</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Training Hours</CardTitle>
                <Award className="w-4 h-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">32.5</div>
                <p className="text-xs text-muted-foreground">hours per employee</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                  <span className="text-xs text-green-600">+5% vs target</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Community Investment</CardTitle>
                <Building2 className="w-4 h-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$2.4M</div>
                <p className="text-xs text-muted-foreground">total investment</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                  <span className="text-xs text-green-600">+15% vs target</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Health & Safety</CardTitle>
                <Shield className="w-4 h-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0.8</div>
                <p className="text-xs text-muted-foreground">incidents per 100k hours</p>
                <div className="flex items-center mt-2">
                  <TrendingDown className="w-4 h-4 text-green-600 mr-1" />
                  <span className="text-xs text-green-600">-20% vs target</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Supplier Diversity</CardTitle>
                <Scale className="w-4 h-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">28%</div>
                <p className="text-xs text-muted-foreground">diverse suppliers</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                  <span className="text-xs text-green-600">+3% vs target</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="governance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Board Diversity</CardTitle>
                <Users className="w-4 h-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">45%</div>
                <p className="text-xs text-muted-foreground">women on board</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                  <span className="text-xs text-green-600">+5% vs target</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Executive Pay Ratio</CardTitle>
                <DollarSign className="w-4 h-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">45:1</div>
                <p className="text-xs text-muted-foreground">CEO to median worker</p>
                <div className="flex items-center mt-2">
                  <TrendingDown className="w-4 h-4 text-green-600 mr-1" />
                  <span className="text-xs text-green-600">-10% vs target</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ethics Compliance</CardTitle>
                <Scale className="w-4 h-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">94%</div>
                <p className="text-xs text-muted-foreground">compliance score</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                  <span className="text-xs text-green-600">+2% vs target</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Transparency</CardTitle>
                <Eye className="w-4 h-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">88%</div>
                <p className="text-xs text-muted-foreground">transparency score</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                  <span className="text-xs text-green-600">+3% vs target</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Stakeholder Engagement</CardTitle>
                <Users className="w-4 h-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">92%</div>
                <p className="text-xs text-muted-foreground">engagement rate</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                  <span className="text-xs text-green-600">+1% vs target</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Risk Management</CardTitle>
                <Shield className="w-4 h-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">89%</div>
                <p className="text-xs text-muted-foreground">risk management score</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                  <span className="text-xs text-green-600">+4% vs target</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Goals and Programs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ESG Goals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>ESG Goals</span>
              <Select value={selectedCategory} onValueChange={(value: any) => setSelectedCategory(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="environmental">Environmental</SelectItem>
                  <SelectItem value="social">Social</SelectItem>
                  <SelectItem value="governance">Governance</SelectItem>
                </SelectContent>
              </Select>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {filteredGoals.map((goal) => (
              <div key={goal.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getCategoryIcon(goal.category)}
                    <h4 className="font-medium">{goal.title}</h4>
                  </div>
                  <Badge className={getStatusColor(goal.status)}>
                    {goal.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-3">{goal.description}</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{goal.current} / {goal.target} {goal.unit}</span>
                  </div>
                  <Progress value={(goal.current / goal.target) * 100} />
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Deadline: {new Date(goal.deadline).toLocaleDateString()}</span>
                    <Badge className={getPriorityColor(goal.priority)}>
                      {goal.priority}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* ESG Programs */}
        <Card>
          <CardHeader>
            <CardTitle>ESG Programs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {filteredPrograms.map((program) => (
              <div key={program.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getCategoryIcon(program.category)}
                    <h4 className="font-medium">{program.name}</h4>
                  </div>
                  <Badge className={getStatusColor(program.status)}>
                    {program.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-3">{program.description}</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Budget:</span>
                    <span className="ml-1 font-medium">${program.budget.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Spent:</span>
                    <span className="ml-1 font-medium">${program.spent.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Start:</span>
                    <span className="ml-1">{new Date(program.startDate).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">End:</span>
                    <span className="ml-1">{new Date(program.endDate).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Budget Utilization</span>
                    <span>{Math.round((program.spent / program.budget) * 100)}%</span>
                  </div>
                  <Progress value={(program.spent / program.budget) * 100} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ESGDashboard;
