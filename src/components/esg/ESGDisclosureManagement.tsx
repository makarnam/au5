import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Calendar,
  Plus,
  Edit,
  Eye,
  Download,
  Send,
  Check,
  X,
  BarChart3,
  Target,
  Globe,
  Building2,
  Activity
} from 'lucide-react';
import { esgService } from '../../services/esgService';
import { ESGDisclosure, DisclosureType, DisclosureStatus } from '../../types';

interface ESGDisclosureManagementProps {
  className?: string;
  programId?: string;
}

const ESGDisclosureManagement: React.FC<ESGDisclosureManagementProps> = ({ className, programId }) => {
  const [disclosures, setDisclosures] = useState<ESGDisclosure[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<ESGDisclosure | null>(null);
  const [formData, setFormData] = useState({
    disclosure_name: '',
    disclosure_type: 'annual_report' as DisclosureType,
    framework: '',
    reporting_period: '',
    status: 'draft' as DisclosureStatus,
    due_date: '',
    content: '',
    file_urls: [] as string[]
  });

  useEffect(() => {
    loadDisclosures();
  }, [programId]);

  const loadDisclosures = async () => {
    try {
      setLoading(true);
      const response = await esgService.getESGDisclosures(programId);
      setDisclosures(response.data);
    } catch (error) {
      console.error('Error loading disclosures:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        // Note: updateESGDisclosure method needs to be implemented in esgService
        console.log('Update functionality needs to be implemented');
      } else {
        await esgService.createESGDisclosure({
          ...formData,
          program_id: programId || ''
        });
      }
      setShowForm(false);
      setEditingItem(null);
      resetForm();
      loadDisclosures();
    } catch (error) {
      console.error('Error saving disclosure:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      disclosure_name: '',
      disclosure_type: 'annual_report',
      framework: '',
      reporting_period: '',
      status: 'draft',
      due_date: '',
      content: '',
      file_urls: []
    });
  };

  const handleEdit = (item: ESGDisclosure) => {
    setEditingItem(item);
    setFormData({
      disclosure_name: item.disclosure_name,
      disclosure_type: item.disclosure_type,
      framework: item.framework || '',
      reporting_period: item.reporting_period,
      status: item.status,
      due_date: item.due_date || '',
      content: item.content || '',
      file_urls: item.file_urls || []
    });
    setShowForm(true);
  };

  const handleApprove = async (id: string) => {
    try {
      await esgService.approveESGDisclosure(id, 'current-user-id');
      loadDisclosures();
    } catch (error) {
      console.error('Error approving disclosure:', error);
    }
  };

  const getStatusColor = (status: DisclosureStatus) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'in_review': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'archived': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: DisclosureStatus) => {
    switch (status) {
      case 'published': return <CheckCircle className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'in_review': return <Clock className="h-4 w-4" />;
      case 'draft': return <FileText className="h-4 w-4" />;
      case 'archived': return <AlertCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getDisclosureTypeIcon = (type: DisclosureType) => {
    switch (type) {
      case 'annual_report': return <FileText className="h-4 w-4" />;
      case 'sustainability_report': return <Globe className="h-4 w-4" />;
      case 'esg_report': return <Target className="h-4 w-4" />;
      case 'regulatory_filing': return <Building2 className="h-4 w-4" />;
      case 'stakeholder_communication': return <Activity className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getComplianceStats = () => {
    const total = disclosures.length;
    const published = disclosures.filter(d => d.status === 'published').length;
    const inReview = disclosures.filter(d => d.status === 'in_review').length;
    const overdue = disclosures.filter(d => {
      if (!d.due_date) return false;
      return new Date(d.due_date) < new Date() && d.status !== 'published';
    }).length;

    return { total, published, inReview, overdue };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const stats = getComplianceStats();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">ESG Disclosure Management</h1>
          <p className="text-muted-foreground">
            Manage framework compliance and reporting disclosures
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Disclosure
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Disclosures</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              All disclosure documents
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.published}</div>
            <p className="text-xs text-muted-foreground">
              Successfully published
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Review</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.inReview}</div>
            <p className="text-xs text-muted-foreground">
              Under review process
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
            <p className="text-xs text-muted-foreground">
              Past due date
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Form Modal */}
      {showForm && (
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle>
              {editingItem ? 'Edit Disclosure' : 'Create New Disclosure'}
            </CardTitle>
            <CardDescription>
              Enter details for the ESG disclosure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="disclosure_name">Disclosure Name</Label>
                  <Input
                    id="disclosure_name"
                    value={formData.disclosure_name}
                    onChange={(e) => setFormData({...formData, disclosure_name: e.target.value})}
                    placeholder="e.g., 2023 Sustainability Report"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="disclosure_type">Disclosure Type</Label>
                  <select
                    id="disclosure_type"
                    value={formData.disclosure_type}
                    onChange={(e) => setFormData({...formData, disclosure_type: e.target.value as DisclosureType})}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="annual_report">Annual Report</option>
                    <option value="sustainability_report">Sustainability Report</option>
                    <option value="esg_report">ESG Report</option>
                    <option value="regulatory_filing">Regulatory Filing</option>
                    <option value="stakeholder_communication">Stakeholder Communication</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="framework">Framework</Label>
                  <Input
                    id="framework"
                    value={formData.framework}
                    onChange={(e) => setFormData({...formData, framework: e.target.value})}
                    placeholder="e.g., GRI, SASB, TCFD"
                  />
                </div>

                <div>
                  <Label htmlFor="reporting_period">Reporting Period</Label>
                  <Input
                    id="reporting_period"
                    value={formData.reporting_period}
                    onChange={(e) => setFormData({...formData, reporting_period: e.target.value})}
                    placeholder="e.g., 2023"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value as DisclosureStatus})}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="draft">Draft</option>
                    <option value="in_review">In Review</option>
                    <option value="approved">Approved</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="due_date">Due Date</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  placeholder="Enter disclosure content or description"
                  rows={6}
                />
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

      {/* Disclosures Table */}
      <Card>
        <CardHeader>
          <CardTitle>Disclosures</CardTitle>
          <CardDescription>
            All ESG disclosure documents and their current status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Name</th>
                  <th className="text-left p-2">Type</th>
                  <th className="text-left p-2">Framework</th>
                  <th className="text-left p-2">Period</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Due Date</th>
                  <th className="text-left p-2">Published</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {disclosures.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-medium">{item.disclosure_name}</td>
                    <td className="p-2">
                      <div className="flex items-center">
                        {getDisclosureTypeIcon(item.disclosure_type)}
                        <span className="ml-1 text-sm">
                          {item.disclosure_type.replace('_', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="p-2 text-sm">{item.framework || '-'}</td>
                    <td className="p-2 text-sm">{item.reporting_period}</td>
                    <td className="p-2">
                      <Badge className={getStatusColor(item.status)}>
                        {getStatusIcon(item.status)}
                        <span className="ml-1">{item.status.replace('_', ' ')}</span>
                      </Badge>
                    </td>
                    <td className="p-2 text-sm">
                      {item.due_date ? new Date(item.due_date).toLocaleDateString() : '-'}
                    </td>
                    <td className="p-2 text-sm">
                      {item.published_date ? new Date(item.published_date).toLocaleDateString() : '-'}
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
                        {item.status === 'in_review' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleApprove(item.id)}
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                        )}
                        {item.status === 'published' && (
                          <Button
                            size="sm"
                            variant="outline"
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Framework Compliance Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Framework Compliance</CardTitle>
          <CardDescription>
            Overview of compliance with different ESG frameworks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <h4 className="font-medium">GRI Standards</h4>
              <div className="flex items-center space-x-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
                <span className="text-sm font-medium">75%</span>
              </div>
              <p className="text-xs text-muted-foreground">3 of 4 disclosures complete</p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">SASB Standards</h4>
              <div className="flex items-center space-x-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '50%' }}></div>
                </div>
                <span className="text-sm font-medium">50%</span>
              </div>
              <p className="text-xs text-muted-foreground">2 of 4 disclosures complete</p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">TCFD Framework</h4>
              <div className="flex items-center space-x-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-red-600 h-2 rounded-full" style={{ width: '25%' }}></div>
                </div>
                <span className="text-sm font-medium">25%</span>
              </div>
              <p className="text-xs text-muted-foreground">1 of 4 disclosures complete</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ESGDisclosureManagement;
