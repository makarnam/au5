import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Plus, Edit, Trash2, FileText, Shield, Link, CheckCircle, XCircle, Eye, Search, Filter } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Policy {
  id: string;
  name: string;
  description: string;
  category: string;
  status: 'draft' | 'active' | 'archived';
  tags: string[];
}

interface ComplianceFramework {
  id: string;
  name: string;
  description: string;
  standard: string; // ISO 27001, SOX, GDPR, etc.
  version: string;
  status: 'active' | 'deprecated';
}

interface ComplianceRequirement {
  id: string;
  framework_id: string;
  requirement_code: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface PolicyComplianceMapping {
  id: string;
  policy_id: string;
  requirement_id: string;
  mapping_type: 'direct' | 'indirect' | 'supporting';
  coverage_percentage: number;
  evidence: string;
  notes: string;
  mapped_by: string;
  mapped_at: string;
  last_reviewed: string;
  review_notes: string;
}

const PolicyComplianceMapping: React.FC = () => {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [frameworks, setFrameworks] = useState<ComplianceFramework[]>([]);
  const [requirements, setRequirements] = useState<ComplianceRequirement[]>([]);
  const [mappings, setMappings] = useState<PolicyComplianceMapping[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMapping, setEditingMapping] = useState<PolicyComplianceMapping | null>(null);
  const [selectedPolicy, setSelectedPolicy] = useState<string>('');
  const [selectedFramework, setSelectedFramework] = useState<string>('');
  const [filterPolicy, setFilterPolicy] = useState<string>('all');
  const [filterFramework, setFilterFramework] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    policy_id: '',
    requirement_id: '',
    mapping_type: 'direct' as PolicyComplianceMapping['mapping_type'],
    coverage_percentage: 100,
    evidence: '',
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedFramework) {
      loadRequirements(selectedFramework);
    }
  }, [selectedFramework]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Mock data for demonstration
      const mockPolicies: Policy[] = [
        {
          id: '1',
          name: 'Data Protection Policy',
          description: 'Comprehensive data protection and privacy policy',
          category: 'Data Protection',
          status: 'active',
          tags: ['GDPR', 'privacy', 'data']
        },
        {
          id: '2',
          name: 'Information Security Policy',
          description: 'Information security management policy',
          category: 'Security',
          status: 'active',
          tags: ['ISO 27001', 'security', 'information']
        },
        {
          id: '3',
          name: 'Access Control Policy',
          description: 'User access control and authorization policy',
          category: 'Access Management',
          status: 'active',
          tags: ['access', 'authorization', 'users']
        }
      ];

      const mockFrameworks: ComplianceFramework[] = [
        {
          id: '1',
          name: 'ISO 27001:2022',
          description: 'Information Security Management Systems',
          standard: 'ISO 27001',
          version: '2022',
          status: 'active'
        },
        {
          id: '2',
          name: 'GDPR',
          description: 'General Data Protection Regulation',
          standard: 'GDPR',
          version: '2018',
          status: 'active'
        },
        {
          id: '3',
          name: 'SOX',
          description: 'Sarbanes-Oxley Act',
          standard: 'SOX',
          version: '2002',
          status: 'active'
        }
      ];

      const mockMappings: PolicyComplianceMapping[] = [
        {
          id: '1',
          policy_id: '1',
          requirement_id: 'gdpr-1',
          mapping_type: 'direct',
          coverage_percentage: 95,
          evidence: 'Policy sections 3.1-3.5 cover data processing requirements',
          notes: 'Direct mapping to GDPR Article 5 principles',
          mapped_by: 'Compliance Officer',
          mapped_at: '2024-01-15T10:00:00Z',
          last_reviewed: '2024-06-15T10:00:00Z',
          review_notes: 'Mapping verified during annual compliance review'
        },
        {
          id: '2',
          policy_id: '2',
          requirement_id: 'iso-1',
          mapping_type: 'direct',
          coverage_percentage: 100,
          evidence: 'Complete coverage of ISO 27001 Annex A.9 requirements',
          notes: 'Full compliance with access control requirements',
          mapped_by: 'Security Officer',
          mapped_at: '2024-01-20T14:30:00Z',
          last_reviewed: '2024-07-01T14:30:00Z',
          review_notes: 'Validated during ISO certification audit'
        }
      ];

      setPolicies(mockPolicies);
      setFrameworks(mockFrameworks);
      setMappings(mockMappings);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadRequirements = async (frameworkId: string) => {
    try {
      // Mock requirements based on framework
      const mockRequirements: ComplianceRequirement[] = [
        {
          id: 'iso-1',
          framework_id: frameworkId,
          requirement_code: 'A.9',
          title: 'Access Control',
          description: 'Access control policies and procedures',
          category: 'Access Control',
          priority: 'high'
        },
        {
          id: 'iso-2',
          framework_id: frameworkId,
          requirement_code: 'A.12',
          title: 'Operations Security',
          description: 'Operational procedures and responsibilities',
          category: 'Operations',
          priority: 'medium'
        },
        {
          id: 'gdpr-1',
          framework_id: frameworkId,
          requirement_code: 'Article 5',
          title: 'Principles relating to processing of personal data',
          description: 'Lawfulness, fairness, transparency, purpose limitation, data minimization, accuracy, storage limitation, integrity, confidentiality, accountability',
          category: 'Data Protection',
          priority: 'critical'
        },
        {
          id: 'sox-1',
          framework_id: frameworkId,
          requirement_code: '404',
          title: 'Management Assessment of Internal Controls',
          description: 'Management assessment of internal controls over financial reporting',
          category: 'Financial Controls',
          priority: 'critical'
        }
      ];

      setRequirements(mockRequirements.filter(req => req.framework_id === frameworkId));
    } catch (error) {
      console.error('Error loading requirements:', error);
      toast.error('Failed to load requirements');
    }
  };

  const resetForm = () => {
    setFormData({
      policy_id: '',
      requirement_id: '',
      mapping_type: 'direct',
      coverage_percentage: 100,
      evidence: '',
      notes: '',
    });
    setEditingMapping(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.policy_id || !formData.requirement_id) {
      toast.error('Policy and requirement are required');
      return;
    }

    try {
      if (editingMapping) {
        // Update mapping
        toast.success('Mapping updated successfully');
      } else {
        // Create mapping
        toast.success('Mapping created successfully');
      }

      setIsDialogOpen(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error saving mapping:', error);
      toast.error('Failed to save mapping');
    }
  };

  const handleEdit = (mapping: PolicyComplianceMapping) => {
    setEditingMapping(mapping);
    setFormData({
      policy_id: mapping.policy_id,
      requirement_id: mapping.requirement_id,
      mapping_type: mapping.mapping_type,
      coverage_percentage: mapping.coverage_percentage,
      evidence: mapping.evidence,
      notes: mapping.notes,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (mappingId: string) => {
    if (!confirm('Are you sure you want to delete this mapping?')) {
      return;
    }

    try {
      // Delete mapping
      toast.success('Mapping deleted successfully');
      loadData();
    } catch (error) {
      console.error('Error deleting mapping:', error);
      toast.error('Failed to delete mapping');
    }
  };

  const getMappingTypeColor = (type: string) => {
    switch (type) {
      case 'direct': return 'bg-green-100 text-green-800';
      case 'indirect': return 'bg-blue-100 text-blue-800';
      case 'supporting': return 'bg-yellow-100 text-yellow-800';
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

  const getCoverageColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-100 text-green-800';
    if (percentage >= 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const filteredMappings = mappings.filter(mapping => {
    const policy = policies.find(p => p.id === mapping.policy_id);
    const requirement = requirements.find(r => r.id === mapping.requirement_id);
    const framework = frameworks.find(f => f.id === requirement?.framework_id);

    const matchesSearch = !searchQuery ||
      policy?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      requirement?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      framework?.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPolicy = filterPolicy === 'all' || mapping.policy_id === filterPolicy;
    const matchesFramework = filterFramework === 'all' || requirement?.framework_id === filterFramework;

    return matchesSearch && matchesPolicy && matchesFramework;
  });

  const getMappingStats = () => {
    const total = mappings.length;
    const direct = mappings.filter(m => m.mapping_type === 'direct').length;
    const highCoverage = mappings.filter(m => m.coverage_percentage >= 90).length;
    const avgCoverage = mappings.length > 0 ?
      Math.round(mappings.reduce((sum, m) => sum + m.coverage_percentage, 0) / mappings.length) : 0;

    return { total, direct, highCoverage, avgCoverage };
  };

  const stats = getMappingStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            Policy Compliance Mapping
            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">New</span>
          </h2>
          <p className="text-gray-600">Map policies to compliance requirements and track coverage</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Create Mapping
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingMapping ? 'Edit Mapping' : 'Create New Mapping'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Policy *</label>
                  <Select
                    value={formData.policy_id}
                    onValueChange={(value) => setFormData({ ...formData, policy_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select policy" />
                    </SelectTrigger>
                    <SelectContent>
                      {policies.map(policy => (
                        <SelectItem key={policy.id} value={policy.id}>
                          {policy.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Compliance Framework</label>
                  <Select
                    value={selectedFramework}
                    onValueChange={(value) => {
                      setSelectedFramework(value);
                      setFormData({ ...formData, requirement_id: '' });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select framework" />
                    </SelectTrigger>
                    <SelectContent>
                      {frameworks.map(framework => (
                        <SelectItem key={framework.id} value={framework.id}>
                          {framework.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Compliance Requirement *</label>
                <Select
                  value={formData.requirement_id}
                  onValueChange={(value) => setFormData({ ...formData, requirement_id: value })}
                  disabled={!selectedFramework}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select requirement" />
                  </SelectTrigger>
                  <SelectContent>
                    {requirements.map(requirement => (
                      <SelectItem key={requirement.id} value={requirement.id}>
                        {requirement.requirement_code}: {requirement.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Mapping Type</label>
                  <Select
                    value={formData.mapping_type}
                    onValueChange={(value) => setFormData({ ...formData, mapping_type: value as PolicyComplianceMapping['mapping_type'] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="direct">Direct</SelectItem>
                      <SelectItem value="indirect">Indirect</SelectItem>
                      <SelectItem value="supporting">Supporting</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Coverage Percentage</label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.coverage_percentage}
                    onChange={(e) => setFormData({ ...formData, coverage_percentage: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Evidence</label>
                <Textarea
                  value={formData.evidence}
                  onChange={(e) => setFormData({ ...formData, evidence: e.target.value })}
                  placeholder="Describe how the policy addresses this requirement"
                  rows={3}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Notes</label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes or comments"
                  rows={2}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingMapping ? 'Update' : 'Create'} Mapping
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Mappings</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Link className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Direct Mappings</p>
                <p className="text-2xl font-bold">{stats.direct}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">High Coverage (≥90%)</p>
                <p className="text-2xl font-bold">{stats.highCoverage}</p>
              </div>
              <Shield className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Coverage</p>
                <p className="text-2xl font-bold">{stats.avgCoverage}%</p>
              </div>
              <FileText className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search mappings, policies, or frameworks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filterPolicy} onValueChange={setFilterPolicy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by Policy" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Policies</SelectItem>
                {policies.map(policy => (
                  <SelectItem key={policy.id} value={policy.id}>
                    {policy.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterFramework} onValueChange={setFilterFramework}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by Framework" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Frameworks</SelectItem>
                {frameworks.map(framework => (
                  <SelectItem key={framework.id} value={framework.id}>
                    {framework.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Mappings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Policy-Compliance Mappings</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Policy</TableHead>
                  <TableHead>Compliance Requirement</TableHead>
                  <TableHead>Framework</TableHead>
                  <TableHead>Mapping Type</TableHead>
                  <TableHead>Coverage</TableHead>
                  <TableHead>Last Reviewed</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMappings.map((mapping) => {
                  const policy = policies.find(p => p.id === mapping.policy_id);
                  const requirement = requirements.find(r => r.id === mapping.requirement_id);
                  const framework = frameworks.find(f => f.id === requirement?.framework_id);

                  return (
                    <TableRow key={mapping.id}>
                      <TableCell>
                        <div className="font-medium">{policy?.name}</div>
                        <div className="text-sm text-gray-500">{policy?.category}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{requirement?.requirement_code}</div>
                        <div className="text-sm text-gray-500">{requirement?.title}</div>
                        <Badge className={getPriorityColor(requirement?.priority || 'low')}>
                          {requirement?.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{framework?.name}</div>
                        <div className="text-sm text-gray-500">{framework?.standard}</div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getMappingTypeColor(mapping.mapping_type)}>
                          {mapping.mapping_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getCoverageColor(mapping.coverage_percentage)}>
                          {mapping.coverage_percentage}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(mapping.last_reviewed).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(mapping)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(mapping.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}

          {filteredMappings.length === 0 && !loading && (
            <div className="text-center py-12">
              <Link className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Mappings Found</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery || filterPolicy !== 'all' || filterFramework !== 'all'
                  ? "Try adjusting your search or filters"
                  : "Start by creating your first policy-compliance mapping"}
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Mapping
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PolicyComplianceMapping;