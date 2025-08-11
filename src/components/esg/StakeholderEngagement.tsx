import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Users, 
  MessageSquare, 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Plus,
  Edit,
  Eye,
  Send,
  Phone,
  Mail,
  Globe,
  Building2,
  UserCheck,
  Activity,
  TrendingUp,
  BarChart3,
  MapPin,
  Target,
  Shield
} from 'lucide-react';
import { esgService } from '../../services/esgService';
import { ESGStakeholderEngagement, StakeholderType, EngagementType, EngagementStatus } from '../../types';

interface StakeholderEngagementProps {
  className?: string;
  programId?: string;
}

const StakeholderEngagement: React.FC<StakeholderEngagementProps> = ({ className, programId }) => {
  const [engagements, setEngagements] = useState<ESGStakeholderEngagement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<ESGStakeholderEngagement | null>(null);
  const [formData, setFormData] = useState({
    stakeholder_name: '',
    stakeholder_type: 'investor' as StakeholderType,
    engagement_type: 'consultation' as EngagementType,
    engagement_date: '',
    engagement_method: '',
    key_concerns: [] as string[],
    commitments_made: [] as string[],
    follow_up_actions: [] as string[],
    next_engagement_date: '',
    status: 'planned' as EngagementStatus
  });

  useEffect(() => {
    loadEngagements();
  }, [programId]);

  const loadEngagements = async () => {
    try {
      setLoading(true);
      const response = await esgService.getESGStakeholderEngagement(programId);
      setEngagements(response.data);
    } catch (error) {
      console.error('Error loading engagements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await esgService.updateESGStakeholderEngagement(editingItem.id, formData);
      } else {
        await esgService.createESGStakeholderEngagement({
          ...formData,
          program_id: programId || ''
        });
      }
      setShowForm(false);
      setEditingItem(null);
      resetForm();
      loadEngagements();
    } catch (error) {
      console.error('Error saving engagement:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      stakeholder_name: '',
      stakeholder_type: 'investor',
      engagement_type: 'consultation',
      engagement_date: '',
      engagement_method: '',
      key_concerns: [],
      commitments_made: [],
      follow_up_actions: [],
      next_engagement_date: '',
      status: 'planned'
    });
  };

  const handleEdit = (item: ESGStakeholderEngagement) => {
    setEditingItem(item);
    setFormData({
      stakeholder_name: item.stakeholder_name,
      stakeholder_type: item.stakeholder_type,
      engagement_type: item.engagement_type,
      engagement_date: item.engagement_date || '',
      engagement_method: item.engagement_method || '',
      key_concerns: item.key_concerns || [],
      commitments_made: item.commitments_made || [],
      follow_up_actions: item.follow_up_actions || [],
      next_engagement_date: item.next_engagement_date || '',
      status: item.status
    });
    setShowForm(true);
  };

  const addArrayItem = (field: 'key_concerns' | 'commitments_made' | 'follow_up_actions', value: string) => {
    if (value.trim()) {
      setFormData({
        ...formData,
        [field]: [...formData[field], value.trim()]
      });
    }
  };

  const removeArrayItem = (field: 'key_concerns' | 'commitments_made' | 'follow_up_actions', index: number) => {
    setFormData({
      ...formData,
      [field]: formData[field].filter((_, i) => i !== index)
    });
  };

  const getStatusColor = (status: EngagementStatus) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'ongoing': return 'bg-blue-100 text-blue-800';
      case 'planned': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: EngagementStatus) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'ongoing': return <Activity className="h-4 w-4" />;
      case 'planned': return <Clock className="h-4 w-4" />;
      case 'cancelled': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStakeholderTypeIcon = (type: StakeholderType) => {
    switch (type) {
      case 'investor': return <BarChart3 className="h-4 w-4" />;
      case 'customer': return <Users className="h-4 w-4" />;
      case 'employee': return <UserCheck className="h-4 w-4" />;
      case 'supplier': return <Building2 className="h-4 w-4" />;
      case 'community': return <Globe className="h-4 w-4" />;
      case 'regulator': return <Shield className="h-4 w-4" />;
      case 'ngo': return <Target className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const getStakeholderTypeColor = (type: StakeholderType) => {
    switch (type) {
      case 'investor': return 'bg-blue-100 text-blue-800';
      case 'customer': return 'bg-green-100 text-green-800';
      case 'employee': return 'bg-purple-100 text-purple-800';
      case 'supplier': return 'bg-orange-100 text-orange-800';
      case 'community': return 'bg-teal-100 text-teal-800';
      case 'regulator': return 'bg-red-100 text-red-800';
      case 'ngo': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEngagementTypeIcon = (type: EngagementType) => {
    switch (type) {
      case 'consultation': return <MessageSquare className="h-4 w-4" />;
      case 'partnership': return <Users className="h-4 w-4" />;
      case 'communication': return <Send className="h-4 w-4" />;
      case 'feedback': return <MessageSquare className="h-4 w-4" />;
      case 'collaboration': return <Users className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getEngagementStats = () => {
    const total = engagements.length;
    const completed = engagements.filter(e => e.status === 'completed').length;
    const ongoing = engagements.filter(e => e.status === 'ongoing').length;
    const planned = engagements.filter(e => e.status === 'planned').length;
    const upcoming = engagements.filter(e => {
      if (!e.next_engagement_date) return false;
      return new Date(e.next_engagement_date) > new Date();
    }).length;

    return { total, completed, ongoing, planned, upcoming };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const stats = getEngagementStats();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Stakeholder Engagement</h1>
          <p className="text-muted-foreground">
            Engagement planning and tracking with stakeholders
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Engagement
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Engagements</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              All stakeholder engagements
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">
              Successfully completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ongoing</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.ongoing}</div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Planned</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.planned}</div>
            <p className="text-xs text-muted-foreground">
              Scheduled engagements
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.upcoming}</div>
            <p className="text-xs text-muted-foreground">
              Next 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Form Modal */}
      {showForm && (
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle>
              {editingItem ? 'Edit Stakeholder Engagement' : 'Add New Engagement'}
            </CardTitle>
            <CardDescription>
              Plan and track stakeholder engagement activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="stakeholder_name">Stakeholder Name</Label>
                  <Input
                    id="stakeholder_name"
                    value={formData.stakeholder_name}
                    onChange={(e) => setFormData({...formData, stakeholder_name: e.target.value})}
                    placeholder="e.g., ABC Investment Fund"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="stakeholder_type">Stakeholder Type</Label>
                  <select
                    id="stakeholder_type"
                    value={formData.stakeholder_type}
                    onChange={(e) => setFormData({...formData, stakeholder_type: e.target.value as StakeholderType})}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="investor">Investor</option>
                    <option value="customer">Customer</option>
                    <option value="employee">Employee</option>
                    <option value="supplier">Supplier</option>
                    <option value="community">Community</option>
                    <option value="regulator">Regulator</option>
                    <option value="ngo">NGO</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="engagement_type">Engagement Type</Label>
                  <select
                    id="engagement_type"
                    value={formData.engagement_type}
                    onChange={(e) => setFormData({...formData, engagement_type: e.target.value as EngagementType})}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="consultation">Consultation</option>
                    <option value="partnership">Partnership</option>
                    <option value="communication">Communication</option>
                    <option value="feedback">Feedback</option>
                    <option value="collaboration">Collaboration</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="engagement_method">Engagement Method</Label>
                  <Input
                    id="engagement_method"
                    value={formData.engagement_method}
                    onChange={(e) => setFormData({...formData, engagement_method: e.target.value})}
                    placeholder="e.g., Video conference, Survey, Meeting"
                  />
                </div>

                <div>
                  <Label htmlFor="engagement_date">Engagement Date</Label>
                  <Input
                    id="engagement_date"
                    type="date"
                    value={formData.engagement_date}
                    onChange={(e) => setFormData({...formData, engagement_date: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="next_engagement_date">Next Engagement Date</Label>
                  <Input
                    id="next_engagement_date"
                    type="date"
                    value={formData.next_engagement_date}
                    onChange={(e) => setFormData({...formData, next_engagement_date: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value as EngagementStatus})}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="planned">Planned</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Key Concerns */}
              <div>
                <Label>Key Concerns</Label>
                <div className="space-y-2">
                  {formData.key_concerns.map((concern, index) => (
                    <div key={index} className="flex space-x-2">
                      <Input
                        value={concern}
                        onChange={(e) => {
                          const newConcerns = [...formData.key_concerns];
                          newConcerns[index] = e.target.value;
                          setFormData({...formData, key_concerns: newConcerns});
                        }}
                        placeholder="Enter concern"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeArrayItem('key_concerns', index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Add new concern"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addArrayItem('key_concerns', e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                        addArrayItem('key_concerns', input.value);
                        input.value = '';
                      }}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </div>

              {/* Commitments Made */}
              <div>
                <Label>Commitments Made</Label>
                <div className="space-y-2">
                  {formData.commitments_made.map((commitment, index) => (
                    <div key={index} className="flex space-x-2">
                      <Input
                        value={commitment}
                        onChange={(e) => {
                          const newCommitments = [...formData.commitments_made];
                          newCommitments[index] = e.target.value;
                          setFormData({...formData, commitments_made: newCommitments});
                        }}
                        placeholder="Enter commitment"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeArrayItem('commitments_made', index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Add new commitment"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addArrayItem('commitments_made', e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                        addArrayItem('commitments_made', input.value);
                        input.value = '';
                      }}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </div>

              {/* Follow-up Actions */}
              <div>
                <Label>Follow-up Actions</Label>
                <div className="space-y-2">
                  {formData.follow_up_actions.map((action, index) => (
                    <div key={index} className="flex space-x-2">
                      <Input
                        value={action}
                        onChange={(e) => {
                          const newActions = [...formData.follow_up_actions];
                          newActions[index] = e.target.value;
                          setFormData({...formData, follow_up_actions: newActions});
                        }}
                        placeholder="Enter follow-up action"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeArrayItem('follow_up_actions', index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Add new follow-up action"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addArrayItem('follow_up_actions', e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                        addArrayItem('follow_up_actions', input.value);
                        input.value = '';
                      }}
                    >
                      Add
                    </Button>
                  </div>
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

      {/* Engagements Table */}
      <Card>
        <CardHeader>
          <CardTitle>Stakeholder Engagements</CardTitle>
          <CardDescription>
            All stakeholder engagement activities and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Stakeholder</th>
                  <th className="text-left p-2">Type</th>
                  <th className="text-left p-2">Engagement</th>
                  <th className="text-left p-2">Method</th>
                  <th className="text-left p-2">Date</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Next Date</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {engagements.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-medium">{item.stakeholder_name}</td>
                    <td className="p-2">
                      <Badge className={getStakeholderTypeColor(item.stakeholder_type)}>
                        {getStakeholderTypeIcon(item.stakeholder_type)}
                        <span className="ml-1">{item.stakeholder_type}</span>
                      </Badge>
                    </td>
                    <td className="p-2">
                      <div className="flex items-center">
                        {getEngagementTypeIcon(item.engagement_type)}
                        <span className="ml-1 text-sm">
                          {item.engagement_type}
                        </span>
                      </div>
                    </td>
                    <td className="p-2 text-sm">{item.engagement_method || '-'}</td>
                    <td className="p-2 text-sm">
                      {item.engagement_date ? new Date(item.engagement_date).toLocaleDateString() : '-'}
                    </td>
                    <td className="p-2">
                      <Badge className={getStatusColor(item.status)}>
                        {getStatusIcon(item.status)}
                        <span className="ml-1">{item.status}</span>
                      </Badge>
                    </td>
                    <td className="p-2 text-sm">
                      {item.next_engagement_date ? new Date(item.next_engagement_date).toLocaleDateString() : '-'}
                    </td>
                    <td className="p-2">
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(item)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Stakeholder Type Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Stakeholder Distribution</CardTitle>
          <CardDescription>
            Distribution of engagements by stakeholder type
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            {(['investor', 'customer', 'employee', 'supplier'] as StakeholderType[]).map((type) => {
              const typeEngagements = engagements.filter(e => e.stakeholder_type === type);
              const completed = typeEngagements.filter(e => e.status === 'completed').length;
              const total = typeEngagements.length;
              
              return (
                <div key={type} className="space-y-2">
                  <div className="flex items-center space-x-2">
                    {getStakeholderTypeIcon(type)}
                    <h4 className="font-medium capitalize">{type}</h4>
                    <Badge variant="outline">{total}</Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Completed</span>
                      <span className="font-medium text-green-600">{completed}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${total > 0 ? (completed / total) * 100 : 0}%` }}
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

export default StakeholderEngagement;
