import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Progress } from '../ui/progress';
import {
  User,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  BarChart3,
  Users,
  BookOpen,
  Target,
  TrendingUp
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { trainingService, TrainingAssignment, TrainingModule } from '../../services/trainingService';

interface UserTrainingAssignmentsProps {
  userId?: string;
}

const UserTrainingAssignments: React.FC<UserTrainingAssignmentsProps> = ({ userId }) => {
  const [assignments, setAssignments] = useState<TrainingAssignment[]>([]);
  const [trainingModules, setTrainingModules] = useState<TrainingModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<TrainingAssignment | null>(null);
  const [assignmentFormData, setAssignmentFormData] = useState({
    user_id: userId || '',
    training_module_id: '',
    assigned_by: '',
    assigned_date: new Date().toISOString().split('T')[0],
    due_date: '',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, [searchTerm, statusFilter, userId]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load training assignments
      const assignmentFilters: any = {};
      if (userId) {
        assignmentFilters.user_id = userId;
      }
      if (statusFilter !== 'all') {
        assignmentFilters.status = statusFilter;
      }

      const { data: assignmentData, error: assignmentError } = await trainingService.getTrainingAssignments(userId, assignmentFilters, 1, 50);
      if (assignmentError) throw assignmentError;

      // Filter by search term
      let filteredAssignments = assignmentData;
      if (searchTerm) {
        filteredAssignments = assignmentData.filter(assignment =>
          assignment.training_modules?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          assignment.users?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          assignment.users?.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          assignment.users?.last_name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      setAssignments(filteredAssignments);

      // Load training modules for assignment
      const { data: modulesData, error: modulesError } = await trainingService.getTrainingModules({}, 1, 100);
      if (modulesError) throw modulesError;

      setTrainingModules(modulesData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load training assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssignment = async () => {
    try {
      if (!assignmentFormData.user_id || !assignmentFormData.training_module_id || !assignmentFormData.assigned_date) {
        toast.error('User, training module, and assigned date are required');
        return;
      }

      const { data, error } = await trainingService.createTrainingAssignment({
        user_id: assignmentFormData.user_id,
        training_module_id: assignmentFormData.training_module_id,
        assigned_by: assignmentFormData.assigned_by || 'system',
        assigned_date: assignmentFormData.assigned_date,
        due_date: assignmentFormData.due_date || undefined,
        status: 'assigned',
        progress_percentage: 0,
        attempts: 0,
        notes: assignmentFormData.notes || undefined
      });

      if (error) throw error;

      toast.success('Training assignment created successfully');
      setIsAssignDialogOpen(false);
      resetAssignmentForm();
      loadData();
    } catch (error) {
      console.error('Error creating assignment:', error);
      toast.error('Failed to create training assignment');
    }
  };

  const handleUpdateAssignment = async (id: string, updates: Partial<TrainingAssignment>) => {
    try {
      const { data, error } = await trainingService.updateTrainingAssignment(id, updates);

      if (error) throw error;

      toast.success('Training assignment updated successfully');
      loadData();
    } catch (error) {
      console.error('Error updating assignment:', error);
      toast.error('Failed to update training assignment');
    }
  };

  const handleDeleteAssignment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this training assignment?')) return;

    try {
      const { error } = await trainingService.deleteTrainingModule(id);

      if (error) throw error;

      toast.success('Training assignment deleted successfully');
      loadData();
    } catch (error) {
      console.error('Error deleting assignment:', error);
      toast.error('Failed to delete training assignment');
    }
  };

  const resetAssignmentForm = () => {
    setAssignmentFormData({
      user_id: userId || '',
      training_module_id: '',
      assigned_by: '',
      assigned_date: new Date().toISOString().split('T')[0],
      due_date: '',
      notes: ''
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'assigned': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className='h-4 w-4' />;
      case 'in_progress': return <Play className='h-4 w-4' />;
      case 'assigned': return <Clock className='h-4 w-4' />;
      case 'overdue': return <AlertTriangle className='h-4 w-4' />;
      case 'cancelled': return <Pause className='h-4 w-4' />;
      default: return <Clock className='h-4 w-4' />;
    }
  };

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDueStatus = (dueDate: string, status: string) => {
    if (status === 'completed' || status === 'cancelled') return null;

    const days = getDaysUntilDue(dueDate);
    if (days < 0) return { status: 'overdue', color: 'text-red-600', text: `${Math.abs(days)} days overdue` };
    if (days <= 7) return { status: 'due_soon', color: 'text-orange-600', text: `Due in ${days} days` };
    return { status: 'on_track', color: 'text-green-600', text: `Due in ${days} days` };
  };

  const calculateCompletionStats = () => {
    const total = assignments.length;
    const completed = assignments.filter(a => a.status === 'completed').length;
    const inProgress = assignments.filter(a => a.status === 'in_progress').length;
    const overdue = assignments.filter(a => a.status === 'overdue').length;

    return {
      total,
      completed,
      inProgress,
      overdue,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  };

  const stats = calculateCompletionStats();

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <div>
          <h2 className='text-2xl font-bold text-gray-900 flex items-center gap-2'>
            Training Assignments
            <span className='px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full'>New</span>
          </h2>
          <p className='text-gray-600'>
            {userId ? 'Manage training assignments for this user' : 'Manage training assignments across all users'}
          </p>
        </div>

        <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className='h-4 w-4 mr-2' />
              Assign Training
            </Button>
          </DialogTrigger>
          <DialogContent className='max-w-2xl'>
            <DialogHeader>
              <DialogTitle>Assign Training Module</DialogTitle>
            </DialogHeader>
            <div className='space-y-4'>
              {!userId && (
                <div>
                  <Label>User ID *</Label>
                  <Input
                    value={assignmentFormData.user_id}
                    onChange={(e) => setAssignmentFormData({ ...assignmentFormData, user_id: e.target.value })}
                    placeholder='Enter user ID'
                  />
                </div>
              )}

              <div>
                <Label>Training Module *</Label>
                <Select value={assignmentFormData.training_module_id} onValueChange={(value) => setAssignmentFormData({ ...assignmentFormData, training_module_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder='Select training module' />
                  </SelectTrigger>
                  <SelectContent>
                    {trainingModules.map(module => (
                      <SelectItem key={module.id} value={module.id}>
                        {module.title} ({module.category})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label>Assigned Date *</Label>
                  <Input
                    type='date'
                    value={assignmentFormData.assigned_date}
                    onChange={(e) => setAssignmentFormData({ ...assignmentFormData, assigned_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Due Date</Label>
                  <Input
                    type='date'
                    value={assignmentFormData.due_date}
                    onChange={(e) => setAssignmentFormData({ ...assignmentFormData, due_date: e.target.value })}
                  />
                </div>
              </div>

              {!userId && (
                <div>
                  <Label>Assigned By</Label>
                  <Input
                    value={assignmentFormData.assigned_by}
                    onChange={(e) => setAssignmentFormData({ ...assignmentFormData, assigned_by: e.target.value })}
                    placeholder='Your user ID'
                  />
                </div>
              )}

              <div>
                <Label>Notes</Label>
                <Input
                  value={assignmentFormData.notes}
                  onChange={(e) => setAssignmentFormData({ ...assignmentFormData, notes: e.target.value })}
                  placeholder='Additional notes'
                />
              </div>

              <div className='flex justify-end gap-2'>
                <Button variant='outline' onClick={() => { setIsAssignDialogOpen(false); resetAssignmentForm(); }}>
                  Cancel
                </Button>
                <Button onClick={handleCreateAssignment}>
                  Assign Training
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>Total Assignments</p>
                <p className='text-3xl font-bold text-gray-900'>{stats.total}</p>
              </div>
              <BookOpen className='h-8 w-8 text-blue-600' />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>Completed</p>
                <p className='text-3xl font-bold text-green-600'>{stats.completed}</p>
                <p className='text-xs text-gray-500 mt-1'>
                  {stats.completionRate}% completion rate
                </p>
              </div>
              <CheckCircle className='h-8 w-8 text-green-600' />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>In Progress</p>
                <p className='text-3xl font-bold text-blue-600'>{stats.inProgress}</p>
              </div>
              <Play className='h-8 w-8 text-blue-600' />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>Overdue</p>
                <p className={`text-3xl font-bold ${stats.overdue > 0 ? 'text-red-600' : 'text-gray-600'}`}>
                  {stats.overdue}
                </p>
                <p className='text-xs text-gray-500 mt-1'>
                  requiring attention
                </p>
              </div>
              {stats.overdue > 0 ? (
                <AlertTriangle className='h-8 w-8 text-red-600' />
              ) : (
                <CheckCircle className='h-8 w-8 text-gray-600' />
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
                  placeholder='Search assignments...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='pl-10'
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className='w-40'>
                <SelectValue placeholder='All Status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Status</SelectItem>
                <SelectItem value='assigned'>Assigned</SelectItem>
                <SelectItem value='in_progress'>In Progress</SelectItem>
                <SelectItem value='completed'>Completed</SelectItem>
                <SelectItem value='overdue'>Overdue</SelectItem>
                <SelectItem value='cancelled'>Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Assignments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Training Assignments ({assignments.length})</CardTitle>
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
                  <TableHead>Training Module</TableHead>
                  {!userId && <TableHead>User</TableHead>}
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Assigned Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell>
                      <div className='flex items-center gap-3'>
                        <BookOpen className='h-5 w-5 text-blue-600' />
                        <div>
                          <div className='font-medium text-gray-900'>
                            {assignment.training_modules?.title}
                          </div>
                          <div className='text-sm text-gray-500'>
                            {assignment.training_modules?.category}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    {!userId && (
                      <TableCell>
                        <div>
                          <div className='font-medium text-gray-900'>
                            {assignment.users?.first_name} {assignment.users?.last_name}
                          </div>
                          <div className='text-sm text-gray-500'>
                            {assignment.users?.email}
                          </div>
                        </div>
                      </TableCell>
                    )}
                    <TableCell>
                      <Badge className={getStatusColor(assignment.status)}>
                        <div className='flex items-center gap-1'>
                          {getStatusIcon(assignment.status)}
                          {assignment.status.replace('_', ' ')}
                        </div>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className='flex items-center gap-3'>
                        <Progress value={assignment.progress_percentage} className='w-20' />
                        <span className='text-sm font-medium'>{assignment.progress_percentage}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(assignment.assigned_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {assignment.due_date ? (
                        <div>
                          <div className={`font-medium ${getDueStatus(assignment.due_date, assignment.status)?.color || 'text-gray-900'}`}>
                            {new Date(assignment.due_date).toLocaleDateString()}
                          </div>
                          {getDueStatus(assignment.due_date, assignment.status) && (
                            <div className='text-xs text-gray-500'>
                              {getDueStatus(assignment.due_date, assignment.status)?.text}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className='text-gray-400'>No due date</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className='flex items-center gap-2'>
                        {assignment.status === 'assigned' && (
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => handleUpdateAssignment(assignment.id, { status: 'in_progress' })}
                          >
                            <Play className='h-4 w-4' />
                          </Button>
                        )}
                        {assignment.status === 'in_progress' && (
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => handleUpdateAssignment(assignment.id, { status: 'completed', completion_date: new Date().toISOString() })}
                          >
                            <CheckCircle className='h-4 w-4' />
                          </Button>
                        )}
                        <Button variant='ghost' size='sm'>
                          <Edit className='h-4 w-4' />
                        </Button>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => handleDeleteAssignment(assignment.id)}
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
    </div>
  );
};

export default UserTrainingAssignments;