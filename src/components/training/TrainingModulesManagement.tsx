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
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Play,
  FileText,
  Video,
  HelpCircle,
  Users,
  Clock,
  Star,
  AlertTriangle,
  CheckCircle,
  Eye
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { trainingService, TrainingModule } from '../../services/trainingService';

interface TrainingModulesManagementProps {
  onModuleSelect?: (module: TrainingModule) => void;
}

const TrainingModulesManagement: React.FC<TrainingModulesManagementProps> = ({ onModuleSelect }) => {
  const [modules, setModules] = useState<TrainingModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<TrainingModule | null>(null);
  const [formData, setFormData] = useState<Partial<TrainingModule>>({
    title: '',
    description: '',
    content_type: 'document',
    difficulty_level: 'beginner',
    category: '',
    is_mandatory: false,
    tags: [],
    learning_objectives: [],
    compliance_frameworks: []
  });

  useEffect(() => {
    loadModules();
  }, [searchTerm, categoryFilter, difficultyFilter]);

  const loadModules = async () => {
    try {
      setLoading(true);
      const filters: any = {};

      if (categoryFilter !== 'all') {
        filters.category = categoryFilter;
      }
      if (difficultyFilter !== 'all') {
        filters.difficulty_level = difficultyFilter;
      }

      const { data, error } = await trainingService.getTrainingModules(filters, 1, 50);

      if (error) throw error;

      // Filter by search term
      let filteredModules = data;
      if (searchTerm) {
        filteredModules = data.filter(module =>
          module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          module.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          module.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      setModules(filteredModules);
    } catch (error) {
      console.error('Error loading modules:', error);
      toast.error('Failed to load training modules');
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

      toast.success('Training module created successfully');
      setIsCreateDialogOpen(false);
      resetForm();
      loadModules();
    } catch (error) {
      console.error('Error creating module:', error);
      toast.error('Failed to create training module');
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

      toast.success('Training module updated successfully');
      setEditingModule(null);
      resetForm();
      loadModules();
    } catch (error) {
      console.error('Error updating module:', error);
      toast.error('Failed to update training module');
    }
  };

  const handleDeleteModule = async (id: string) => {
    if (!confirm('Are you sure you want to delete this training module?')) return;

    try {
      const { error } = await trainingService.deleteTrainingModule(id);

      if (error) throw error;

      toast.success('Training module deleted successfully');
      loadModules();
    } catch (error) {
      console.error('Error deleting module:', error);
      toast.error('Failed to delete training module');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      content_type: 'document',
      difficulty_level: 'beginner',
      category: '',
      is_mandatory: false,
      tags: [],
      learning_objectives: [],
      compliance_frameworks: []
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

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className='h-4 w-4' />;
      case 'document': return <FileText className='h-4 w-4' />;
      case 'quiz': return <HelpCircle className='h-4 w-4' />;
      case 'interactive': return <Play className='h-4 w-4' />;
      case 'webinar': return <Users className='h-4 w-4' />;
      default: return <BookOpen className='h-4 w-4' />;
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const categories = [...new Set(modules.map(m => m.category))];

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <div>
          <h2 className='text-2xl font-bold text-gray-900 flex items-center gap-2'>
            Training Modules Management
            <span className='px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full'>New</span>
          </h2>
          <p className='text-gray-600'>Manage training modules and learning content</p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className='h-4 w-4 mr-2' />
              Add Module
            </Button>
          </DialogTrigger>
          <DialogContent className='max-w-2xl max-h-[80vh] overflow-y-auto'>
            <DialogHeader>
              <DialogTitle>Create Training Module</DialogTitle>
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
                    placeholder='e.g., Security, Compliance'
                  />
                </div>
              </div>

              <div>
                <Label htmlFor='description'>Description</Label>
                <Textarea
                  id='description'
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder='Module description'
                  rows={3}
                />
              </div>

              <div className='grid grid-cols-3 gap-4'>
                <div>
                  <Label htmlFor='content_type'>Content Type</Label>
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
                  <Label htmlFor='difficulty_level'>Difficulty</Label>
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
                  <Label htmlFor='duration'>Duration (minutes)</Label>
                  <Input
                    id='duration'
                    type='number'
                    value={formData.duration_minutes || ''}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 0 })}
                    placeholder='60'
                  />
                </div>
              </div>

              <div>
                <Label htmlFor='content_url'>Content URL</Label>
                <Input
                  id='content_url'
                  value={formData.content_url || ''}
                  onChange={(e) => setFormData({ ...formData, content_url: e.target.value })}
                  placeholder='https://...'
                />
              </div>

              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='is_mandatory'
                  checked={formData.is_mandatory || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_mandatory: checked as boolean })}
                />
                <Label htmlFor='is_mandatory'>Mandatory training module</Label>
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

      {/* Filters */}
      <Card>
        <CardContent className='p-4'>
          <div className='flex gap-4'>
            <div className='flex-1'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
                <Input
                  placeholder='Search modules...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='pl-10'
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className='w-40'>
                <SelectValue placeholder='All Categories' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger className='w-40'>
                <SelectValue placeholder='All Levels' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Levels</SelectItem>
                <SelectItem value='beginner'>Beginner</SelectItem>
                <SelectItem value='intermediate'>Intermediate</SelectItem>
                <SelectItem value='advanced'>Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Modules Table */}
      <Card>
        <CardHeader>
          <CardTitle>Training Modules ({modules.length})</CardTitle>
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
                  <TableHead>Category</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Mandatory</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {modules.map((module) => (
                  <TableRow key={module.id}>
                    <TableCell>
                      <div className='flex items-center gap-3'>
                        {getContentTypeIcon(module.content_type)}
                        <div>
                          <div className='font-medium text-gray-900'>{module.title}</div>
                          <div className='text-sm text-gray-500 line-clamp-1'>{module.description}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant='outline'>{module.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant='secondary' className='capitalize'>
                        {module.content_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getDifficultyColor(module.difficulty_level)}>
                        {module.difficulty_level}
                      </Badge>
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
                      {module.is_mandatory ? (
                        <CheckCircle className='h-5 w-5 text-green-600' />
                      ) : (
                        <span className='text-gray-400'>Optional</span>
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
            <DialogTitle>Edit Training Module</DialogTitle>
          </DialogHeader>
          <div className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <Label htmlFor='edit-title'>Title *</Label>
                <Input
                  id='edit-title'
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor='edit-category'>Category *</Label>
                <Input
                  id='edit-category'
                  value={formData.category || ''}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor='edit-description'>Description</Label>
              <Textarea
                id='edit-description'
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
              <Label>Content URL</Label>
              <Input
                value={formData.content_url || ''}
                onChange={(e) => setFormData({ ...formData, content_url: e.target.value })}
              />
            </div>

            <div className='flex items-center space-x-2'>
              <Checkbox
                checked={formData.is_mandatory || false}
                onCheckedChange={(checked) => setFormData({ ...formData, is_mandatory: checked as boolean })}
              />
              <Label>Mandatory training module</Label>
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

export default TrainingModulesManagement;