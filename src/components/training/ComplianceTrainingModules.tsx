import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { Progress } from '../ui/progress';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Users,
  BookOpen,
  Target,
  Calendar,
  RefreshCw,
  Filter,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  BarChart3,
  TrendingUp,
  Award,
  Clock
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { trainingService, TrainingModule } from '../../services/trainingService';

interface ComplianceTrainingModulesProps {
  onModuleSelect?: (module: TrainingModule) => void;
}

interface ComplianceStats {
  totalModules: number;
  mandatoryModules: number;
  complianceCoverage: number;
  overdueAssignments: number;
  completionRate: number;
}

const ComplianceTrainingModules: React.FC<ComplianceTrainingModulesProps> = ({ onModuleSelect }) => {
  const [modules, setModules] = useState<TrainingModule[]>([]);
  const [complianceStats, setComplianceStats] = useState<ComplianceStats>({
    totalModules: 0,
    mandatoryModules: 0,
    complianceCoverage: 0,
    overdueAssignments: 0,
    completionRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [frameworkFilter, setFrameworkFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<TrainingModule | null>(null);
  const [formData, setFormData] = useState<Partial<TrainingModule>>({
    title: '',
    description: '',
    content_type: 'document',
    difficulty_level: 'intermediate',
    category: 'Compliance',
    is_mandatory: true,
    tags: [],
    learning_objectives: [],
    compliance_frameworks: [],
    expiry_days: 365
  });

  useEffect(() => {
    loadData();
  }, [searchTerm, frameworkFilter]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load training modules
      const { data: modulesData, error: modulesError } = await trainingService.getTrainingModules({}, 1, 100);
      if (modulesError) throw modulesError;

      // Filter for compliance modules
      let complianceModules = modulesData.filter(module =>
        module.is_mandatory ||
        module.category.toLowerCase().includes('compliance') ||
        (module.compliance_frameworks && module.compliance_frameworks.length > 0)
      );

      // Apply search filter
      if (searchTerm) {
        complianceModules = complianceModules.filter(module =>
          module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          module.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          module.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Apply framework filter
      if (frameworkFilter !== 'all') {
        complianceModules = complianceModules.filter(module =>
          module.compliance_frameworks?.includes(frameworkFilter)
        );
      }

      setModules(complianceModules);

      // Load compliance analytics
      const { data: analyticsData, error: analyticsError } = await trainingService.getTrainingAnalytics();
      if (analyticsError) {
        console.warn('Failed to load analytics:', analyticsError);
      } else {
        const { data: complianceData, error: complianceError } = await trainingService.getComplianceTrainingStatus();
        if (complianceError) {
          console.warn('Failed to load compliance status:', complianceError);
        }

        setComplianceStats({
          totalModules: complianceModules.length,
          mandatoryModules: complianceModules.filter(m => m.is_mandatory).length,
          complianceCoverage: analyticsData?.completionRate || 0,
          overdueAssignments: analyticsData?.overdueAssignments || 0,
          completionRate: analyticsData?.completionRate || 0
        });
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load compliance training data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateModule = async () => {
    try {
      if (!formData.title || !formData.category) {
        toast.error('Title and category are required');
        return;
      }

      const moduleData = {
        ...formData,
        tags: formData.tags || [],
        learning_objectives: formData.learning_objectives || [],
        compliance_frameworks: formData.compliance_frameworks || []
      };

      const { data, error } = await trainingService.createTrainingModule(moduleData as Omit<TrainingModule, 'id' | 'created_at' | 'updated_at'>);

      if (error) throw error;

      toast.success('Compliance training module created successfully');
      setIsCreateDialogOpen(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error creating module:', error);
      toast.error('Failed to create compliance training module');
    }
  };

  const handleUpdateModule = async () => {
    try {
      if (!editingModule || !formData.title || !formData.category) {
        toast.error('Title and category are required');
        return;
      }

      const { data, error } = await trainingService.updateTrainingModule(editingModule.id, formData);

      if (error) throw error;

      toast.success('Compliance training module updated successfully');
      setEditingModule(null);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error updating module:', error);
      toast.error('Failed to update compliance training module');
    }
  };

  const handleDeleteModule = async (id: string) => {
    if (!confirm('Are you sure you want to delete this compliance training module?')) return;

    try {
      const { error } = await trainingService.deleteTrainingModule(id);

      if (error) throw error;

      toast.success('Compliance training module deleted successfully');
      loadData();
    } catch (error) {
      console.error('Error deleting module:', error);
      toast.error('Failed to delete compliance training module');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      content_type: 'document',
      difficulty_level: 'intermediate',
      category: 'Compliance',
      is_mandatory: true,
      tags: [],
      learning_objectives: [],
      compliance_frameworks: [],
      expiry_days: 365
    });
  };

  const openEditDialog = (module: TrainingModule) => {
    setEditingModule(module);
    setFormData({
      title: module.title,
      description: module.description || '',
      content_type: module.content_type,
      content_url: module.content_url || '',
      duration_minutes: module.duration_minutes || 0,
      difficulty_level: module.difficulty_level,
      category: module.category,
      tags: module.tags || [],
      prerequisites: module.prerequisites || [],
      learning_objectives: module.learning_objectives || [],
      is_mandatory: module.is_mandatory,
      compliance_frameworks: module.compliance_frameworks || [],
      expiry_days: module.expiry_days || 0
    });
  };

  const getComplianceFrameworks = () => {
    const frameworks = new Set<string>();
    modules.forEach(module => {
      module.compliance_frameworks?.forEach(framework => frameworks.add(framework));
    });
    return Array.from(frameworks);
  };

  const getFrameworkColor = (framework: string) => {
    const colors: Record<string, string> = {
      'GDPR': 'bg-blue-100 text-blue-800',
      'HIPAA': 'bg-green-100 text-green-800',
      'SOX': 'bg-purple-100 text-purple-800',
      'ISO 27001': 'bg-orange-100 text-orange-800',
      'PCI DSS': 'bg-red-100 text-red-800',
      'NIST': 'bg-yellow-100 text-yellow-800'
    };
    return colors[framework] || 'bg-gray-100 text-gray-800';
  };

  const getComplianceStatus = () => {
    if (complianceStats.complianceCoverage >= 90) return { status: 'excellent', color: 'text-green-600', icon: CheckCircle };
    if (complianceStats.complianceCoverage >= 75) return { status: 'good', color: 'text-blue-600', icon: Target };
    if (complianceStats.complianceCoverage >= 60) return { status: 'fair', color: 'text-yellow-600', icon: AlertTriangle };
    return { status: 'poor', color: 'text-red-600', icon: AlertTriangle };
  };

  const complianceStatus = getComplianceStatus();
  const StatusIcon = complianceStatus.icon;

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <div>
          <h2 className='text-2xl font-bold text-gray-900 flex items-center gap-2'>
            Compliance Training Modules
            <span className='px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full'>New</span>
          </h2>
          <p className='text-gray-600'>Manage compliance training and regulatory requirements</p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className='h-4 w-4 mr-2' />
              Add Compliance Module
            </Button>
          </DialogTrigger>
          <DialogContent className='max-w-2xl max-h-[80vh] overflow-y-auto'>
            <DialogHeader>
              <DialogTitle>Create Compliance Training Module</DialogTitle>
            </DialogHeader>
            <div className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label htmlFor='title'>Title *</Label>
                  <Input
                    id='title'
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder='Module title'
                  />
                </div>
                <div>
                  <Label htmlFor='category'>Category *</Label>
                  <Input
                    id='category'
                    value={formData.category || ''}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder='e.g., GDPR, HIPAA'
                  />
                </div>
              </div>

              <div>
                <Label htmlFor='description'>Description</Label>
                <Textarea
                  id='description'
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder='Module description and compliance requirements'
                  rows={3}
                />
              </div>

              <div className='grid grid-cols-3 gap-4'>
                <div>
                  <Label>Content Type</Label>
                  <Select value={formData.content_type} onValueChange={(value: any) => setFormData({ ...formData, content_type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='video'>Video</SelectItem>
                      <SelectItem value='document'>Document</SelectItem>
                      <SelectItem value='quiz'>Quiz</SelectItem>
                      <SelectItem value='interactive'>Interactive</SelectItem>
                      <SelectItem value='webinar'>Webinar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Difficulty</Label>
                  <Select value={formData.difficulty_level} onValueChange={(value: any) => setFormData({ ...formData, difficulty_level: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='beginner'>Beginner</SelectItem>
                      <SelectItem value='intermediate'>Intermediate</SelectItem>
                      <SelectItem value='advanced'>Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Duration (minutes)</Label>
                  <Input
                    type='number'
                    value={formData.duration_minutes || ''}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 0 })}
                    placeholder='120'
                  />
                </div>
              </div>

              <div>
                <Label>Compliance Frameworks</Label>
                <div className='flex flex-wrap gap-2 mt-2'>
                  {['GDPR', 'HIPAA', 'SOX', 'ISO 27001', 'PCI DSS', 'NIST'].map(framework => (
                    <div key={framework} className='flex items-center space-x-2'>
                      <Checkbox
                        checked={formData.compliance_frameworks?.includes(framework) || false}
                        onCheckedChange={(checked) => {
                          const current = formData.compliance_frameworks || [];
                          if (checked) {
                            setFormData({ ...formData, compliance_frameworks: [...current, framework] });
                          } else {
                            setFormData({ ...formData, compliance_frameworks: current.filter(f => f !== framework) });
                          }
                        }}
                      />
                      <Label className='text-sm'>{framework}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label>Expiry Days</Label>
                  <Input
                    type='number'
                    value={formData.expiry_days || ''}
                    onChange={(e) => setFormData({ ...formData, expiry_days: parseInt(e.target.value) || 365 })}
                    placeholder='365'
                  />
                </div>
                <div className='flex items-center space-x-2 pt-8'>
                  <Checkbox
                    checked={formData.is_mandatory || false}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_mandatory: checked as boolean })}
                  />
                  <Label>Mandatory training module</Label>
                </div>
              </div>

              <div className='flex justify-end gap-2'>
                <Button variant='outline' onClick={() => { setIsCreateDialogOpen(false); resetForm(); }}>
                  Cancel
                </Button>
                <Button onClick={handleCreateModule}>
                  Create Module
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Compliance Overview Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>Compliance Coverage</p>
                <p className={`text-3xl font-bold ${complianceStatus.color}`}>
                  {complianceStats.complianceCoverage}%
                </p>
                <div className='flex items-center gap-1 mt-1'>
                  <StatusIcon className={`h-4 w-4 ${complianceStatus.color}`} />
                  <span className='text-xs text-gray-500 capitalize'>{complianceStatus.status}</span>
                </div>
              </div>
              <Shield className='h-8 w-8 text-blue-600' />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>Mandatory Modules</p>
                <p className='text-3xl font-bold text-gray-900'>{complianceStats.mandatoryModules}</p>
                <p className='text-xs text-gray-500 mt-1'>
                  of {complianceStats.totalModules} total
                </p>
              </div>
              <BookOpen className='h-8 w-8 text-green-600' />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>Completion Rate</p>
                <p className='text-3xl font-bold text-purple-600'>{complianceStats.completionRate}%</p>
                <p className='text-xs text-gray-500 mt-1'>
                  average completion
                </p>
              </div>
              <TrendingUp className='h-8 w-8 text-purple-600' />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>Overdue Assignments</p>
                <p className={`text-3xl font-bold ${complianceStats.overdueAssignments > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {complianceStats.overdueAssignments}
                </p>
                <p className='text-xs text-gray-500 mt-1'>
                  requiring attention
                </p>
              </div>
              {complianceStats.overdueAssignments > 0 ? (
                <AlertTriangle className='h-8 w-8 text-red-600' />
              ) : (
                <CheckCircle className='h-8 w-8 text-green-600' />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className='p-4'>
          <div className='flex gap-4'>
            <div className='flex-1'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
                <Input
                  placeholder='Search compliance modules...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='pl-10'
                />
              </div>
            </div>
            <Select value={frameworkFilter} onValueChange={setFrameworkFilter}>
              <SelectTrigger className='w-48'>
                <SelectValue placeholder='All Frameworks' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Frameworks</SelectItem>
                {getComplianceFrameworks().map(framework => (
                  <SelectItem key={framework} value={framework}>{framework}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Modules Table */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance Training Modules ({modules.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className='flex items-center justify-center h-32'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Module</TableHead>
                  <TableHead>Frameworks</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Mandatory</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {modules.map((module) => (
                  <TableRow key={module.id}>
                    <TableCell>
                      <div className='flex items-center gap-3'>
                        <Shield className='h-5 w-5 text-blue-600' />
                        <div>
                          <div className='font-medium text-gray-900'>{module.title}</div>
                          <div className='text-sm text-gray-500 line-clamp-1'>{module.description}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='flex flex-wrap gap-1'>
                        {module.compliance_frameworks?.slice(0, 2).map(framework => (
                          <Badge key={framework} className={`text-xs ${getFrameworkColor(framework)}`}>
                            {framework}
                          </Badge>
                        ))}
                        {module.compliance_frameworks && module.compliance_frameworks.length > 2 && (
                          <Badge variant='outline' className='text-xs'>
                            +{module.compliance_frameworks.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant='secondary' className='capitalize'>
                        {module.content_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {module.is_mandatory ? (
                        <Badge className='bg-red-100 text-red-800'>Mandatory</Badge>
                      ) : (
                        <Badge variant='outline'>Optional</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {module.duration_minutes ? (
                        <div className='flex items-center gap-1'>
                          <Clock className='h-4 w-4 text-gray-400' />
                          <span>{module.duration_minutes} min</span>
                        </div>
                      ) : (
                        <span className='text-gray-400'>N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {module.expiry_days ? (
                        <div className='flex items-center gap-1'>
                          <Calendar className='h-4 w-4 text-gray-400' />
                          <span>{module.expiry_days} days</span>
                        </div>
                      ) : (
                        <span className='text-gray-400'>No expiry</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className='flex items-center gap-2'>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => onModuleSelect?.(module)}
                        >
                          <Eye className='h-4 w-4' />
                        </Button>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => openEditDialog(module)}
                        >
                          <Edit className='h-4 w-4' />
                        </Button>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => handleDeleteModule(module.id)}
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingModule} onOpenChange={(open) => !open && setEditingModule(null)}>
        <DialogContent className='max-w-2xl max-h-[80vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>Edit Compliance Training Module</DialogTitle>
          </DialogHeader>
          <div className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <Label>Title *</Label>
                <Input
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div>
                <Label>Category *</Label>
                <Input
                  value={formData.category || ''}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className='grid grid-cols-3 gap-4'>
              <div>
                <Label>Content Type</Label>
                <Select value={formData.content_type} onValueChange={(value: any) => setFormData({ ...formData, content_type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='video'>Video</SelectItem>
                    <SelectItem value='document'>Document</SelectItem>
                    <SelectItem value='quiz'>Quiz</SelectItem>
                    <SelectItem value='interactive'>Interactive</SelectItem>
                    <SelectItem value='webinar'>Webinar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Difficulty</Label>
                <Select value={formData.difficulty_level} onValueChange={(value: any) => setFormData({ ...formData, difficulty_level: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='beginner'>Beginner</SelectItem>
                    <SelectItem value='intermediate'>Intermediate</SelectItem>
                    <SelectItem value='advanced'>Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Duration (minutes)</Label>
                <Input
                  type='number'
                  value={formData.duration_minutes || ''}
                  onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div>
              <Label>Compliance Frameworks</Label>
              <div className='flex flex-wrap gap-2 mt-2'>
                {['GDPR', 'HIPAA', 'SOX', 'ISO 27001', 'PCI DSS', 'NIST'].map(framework => (
                  <div key={framework} className='flex items-center space-x-2'>
                    <Checkbox
                      checked={formData.compliance_frameworks?.includes(framework) || false}
                      onCheckedChange={(checked) => {
                        const current = formData.compliance_frameworks || [];
                        if (checked) {
                          setFormData({ ...formData, compliance_frameworks: [...current, framework] });
                        } else {
                          setFormData({ ...formData, compliance_frameworks: current.filter(f => f !== framework) });
                        }
                      }}
                    />
                    <Label className='text-sm'>{framework}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div>
                <Label>Expiry Days</Label>
                <Input
                  type='number'
                  value={formData.expiry_days || ''}
                  onChange={(e) => setFormData({ ...formData, expiry_days: parseInt(e.target.value) || 365 })}
                />
              </div>
              <div className='flex items-center space-x-2 pt-8'>
                <Checkbox
                  checked={formData.is_mandatory || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_mandatory: checked as boolean })}
                />
                <Label>Mandatory training module</Label>
              </div>
            </div>

            <div className='flex justify-end gap-2'>
              <Button variant='outline' onClick={() => { setEditingModule(null); resetForm(); }}>
                Cancel
              </Button>
              <Button onClick={handleUpdateModule}>
                Update Module
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ComplianceTrainingModules;