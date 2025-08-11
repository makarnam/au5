import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Target, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Plus,
  Edit,
  Eye,
  Calendar,
  Activity,
  Leaf,
  Users,
  Shield,
  BarChart3,
  Percent,
  Flag,
  Award
} from 'lucide-react';
import { esgService } from '../../services/esgService';
import { ESGGoal, ESGCategory, GoalStatus } from '../../types';

interface ESGGoalsManagementProps {
  className?: string;
  programId?: string;
}

const ESGGoalsManagement: React.FC<ESGGoalsManagementProps> = ({ className, programId }) => {
  const [goals, setGoals] = useState<ESGGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<ESGGoal | null>(null);
  const [formData, setFormData] = useState({
    goal_name: '',
    description: '',
    category: 'environmental' as ESGCategory,
    target_value: 0,
    baseline_value: 0,
    current_value: 0,
    unit_of_measure: '',
    target_year: new Date().getFullYear(),
    status: 'active' as GoalStatus,
    owner_id: ''
  });

  useEffect(() => {
    loadGoals();
  }, [programId]);

  const loadGoals = async () => {
    try {
      setLoading(true);
      const response = await esgService.getESGGoals(programId);
      setGoals(response.data);
    } catch (error) {
      console.error('Error loading goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await esgService.updateESGGoal(editingItem.id, formData);
      } else {
        await esgService.createESGGoal({
          ...formData,
          program_id: programId || ''
        });
      }
      setShowForm(false);
      setEditingItem(null);
      resetForm();
      loadGoals();
    } catch (error) {
      console.error('Error saving goal:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      goal_name: '',
      description: '',
      category: 'environmental',
      target_value: 0,
      baseline_value: 0,
      current_value: 0,
      unit_of_measure: '',
      target_year: new Date().getFullYear(),
      status: 'active',
      owner_id: ''
    });
  };

  const handleEdit = (item: ESGGoal) => {
    setEditingItem(item);
    setFormData({
      goal_name: item.goal_name,
      description: item.description || '',
      category: item.category,
      target_value: item.target_value || 0,
      baseline_value: item.baseline_value || 0,
      current_value: item.current_value || 0,
      unit_of_measure: item.unit_of_measure || '',
      target_year: item.target_year || new Date().getFullYear(),
      status: item.status,
      owner_id: item.owner_id || ''
    });
    setShowForm(true);
  };

  const getStatusColor = (status: GoalStatus) => {
    switch (status) {
      case 'achieved': return 'bg-green-100 text-green-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'behind_schedule': return 'bg-yellow-100 text-yellow-800';
      case 'at_risk': return 'bg-orange-100 text-orange-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: GoalStatus) => {
    switch (status) {
      case 'achieved': return <CheckCircle className="h-4 w-4" />;
      case 'active': return <Activity className="h-4 w-4" />;
      case 'behind_schedule': return <Clock className="h-4 w-4" />;
      case 'at_risk': return <AlertTriangle className="h-4 w-4" />;
      case 'cancelled': return <TrendingDown className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const getCategoryIcon = (category: ESGCategory) => {
    switch (category) {
      case 'environmental': return <Leaf className="h-4 w-4" />;
      case 'social': return <Users className="h-4 w-4" />;
      case 'governance': return <Shield className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: ESGCategory) => {
    switch (category) {
      case 'environmental': return 'bg-green-100 text-green-800';
      case 'social': return 'bg-blue-100 text-blue-800';
      case 'governance': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateProgress = (goal: ESGGoal) => {
    if (!goal.target_value || !goal.baseline_value) return 0;
    const totalChange = goal.target_value - goal.baseline_value;
    const currentChange = (goal.current_value || 0) - goal.baseline_value;
    return Math.max(0, Math.min(100, (currentChange / totalChange) * 100));
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-600';
    if (progress >= 60) return 'bg-yellow-600';
    if (progress >= 40) return 'bg-orange-600';
    return 'bg-red-600';
  };

  const getGoalsStats = () => {
    const total = goals.length;
    const achieved = goals.filter(g => g.status === 'achieved').length;
    const active = goals.filter(g => g.status === 'active').length;
    const atRisk = goals.filter(g => g.status === 'at_risk' || g.status === 'behind_schedule').length;
    const avgProgress = goals.length > 0 
      ? goals.reduce((sum, g) => sum + calculateProgress(g), 0) / goals.length 
      : 0;

    return { total, achieved, active, atRisk, avgProgress };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const stats = getGoalsStats();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">ESG Goals Management</h1>
          <p className="text-muted-foreground">
            Goal setting and progress tracking for ESG initiatives
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Goal
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Goals</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              All ESG goals
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Achieved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.achieved}</div>
            <p className="text-xs text-muted-foreground">
              Successfully completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.active}</div>
            <p className="text-xs text-muted-foreground">
              In progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">At Risk</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.atRisk}</div>
            <p className="text-xs text-muted-foreground">
              Behind schedule
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Progress</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgProgress.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Overall progress
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Form Modal */}
      {showForm && (
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle>
              {editingItem ? 'Edit ESG Goal' : 'Add New ESG Goal'}
            </CardTitle>
            <CardDescription>
              Define a new ESG goal with targets and milestones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="goal_name">Goal Name</Label>
                  <Input
                    id="goal_name"
                    value={formData.goal_name}
                    onChange={(e) => setFormData({...formData, goal_name: e.target.value})}
                    placeholder="e.g., Reduce carbon emissions by 50%"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value as ESGCategory})}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="environmental">Environmental</option>
                    <option value="social">Social</option>
                    <option value="governance">Governance</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="target_year">Target Year</Label>
                  <Input
                    id="target_year"
                    type="number"
                    value={formData.target_year}
                    onChange={(e) => setFormData({...formData, target_year: parseInt(e.target.value) || new Date().getFullYear()})}
                    min={new Date().getFullYear()}
                    max={new Date().getFullYear() + 20}
                  />
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value as GoalStatus})}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="active">Active</option>
                    <option value="achieved">Achieved</option>
                    <option value="behind_schedule">Behind Schedule</option>
                    <option value="at_risk">At Risk</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe the goal and its importance"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="baseline_value">Baseline Value</Label>
                  <Input
                    id="baseline_value"
                    type="number"
                    step="0.01"
                    value={formData.baseline_value}
                    onChange={(e) => setFormData({...formData, baseline_value: parseFloat(e.target.value) || 0})}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label htmlFor="target_value">Target Value</Label>
                  <Input
                    id="target_value"
                    type="number"
                    step="0.01"
                    value={formData.target_value}
                    onChange={(e) => setFormData({...formData, target_value: parseFloat(e.target.value) || 0})}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label htmlFor="current_value">Current Value</Label>
                  <Input
                    id="current_value"
                    type="number"
                    step="0.01"
                    value={formData.current_value}
                    onChange={(e) => setFormData({...formData, current_value: parseFloat(e.target.value) || 0})}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label htmlFor="unit_of_measure">Unit of Measure</Label>
                  <Input
                    id="unit_of_measure"
                    value={formData.unit_of_measure}
                    onChange={(e) => setFormData({...formData, unit_of_measure: e.target.value})}
                    placeholder="e.g., tCO2e, %, $"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingItem(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingItem ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Goals Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {goals.map((goal) => {
          const progress = calculateProgress(goal);
          return (
            <Card key={goal.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge className={getCategoryColor(goal.category)}>
                      {getCategoryIcon(goal.category)}
                      <span className="ml-1">{goal.category}</span>
                    </Badge>
                    <Badge className={getStatusColor(goal.status)}>
                      {getStatusIcon(goal.status)}
                      <span className="ml-1">{goal.status.replace('_', ' ')}</span>
                    </Badge>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => handleEdit(goal)}>
                    <Edit className="h-3 w-3" />
                  </Button>
                </div>
                <CardTitle className="text-lg">{goal.goal_name}</CardTitle>
                <CardDescription>
                  {goal.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span className="font-medium">{progress.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getProgressColor(progress)}`}
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="text-center">
                    <div className="font-medium text-gray-900">
                      {goal.baseline_value?.toFixed(1) || '0'}
                    </div>
                    <div className="text-xs text-gray-500">Baseline</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-blue-600">
                      {goal.current_value?.toFixed(1) || '0'}
                    </div>
                    <div className="text-xs text-gray-500">Current</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-green-600">
                      {goal.target_value?.toFixed(1) || '0'}
                    </div>
                    <div className="text-xs text-gray-500">Target</div>
                  </div>
                </div>

                {goal.unit_of_measure && (
                  <div className="text-xs text-gray-500 text-center">
                    Unit: {goal.unit_of_measure}
                  </div>
                )}

                {/* Target Year */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Target Year:</span>
                  <span className="font-medium">{goal.target_year}</span>
                </div>

                {/* Owner */}
                {goal.owner && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Owner:</span>
                    <span className="font-medium">
                      {goal.owner.first_name} {goal.owner.last_name}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Goals by Category</CardTitle>
          <CardDescription>
            Distribution of goals across ESG categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {(['environmental', 'social', 'governance'] as ESGCategory[]).map((category) => {
              const categoryGoals = goals.filter(g => g.category === category);
              const achieved = categoryGoals.filter(g => g.status === 'achieved').length;
              const total = categoryGoals.length;
              
              return (
                <div key={category} className="space-y-2">
                  <div className="flex items-center space-x-2">
                    {getCategoryIcon(category)}
                    <h4 className="font-medium capitalize">{category}</h4>
                    <Badge variant="outline">{total}</Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Achieved</span>
                      <span className="font-medium text-green-600">{achieved}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${total > 0 ? (achieved / total) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ESGGoalsManagement;
