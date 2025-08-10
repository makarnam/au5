import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Eye, 
  Trash2, 
  Download, 
  RefreshCw,
  TrendingUp,
  Award,
  Clock,
  User,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  BookOpen,
  Target
} from 'lucide-react';
import { auditPlanningService } from '../../services/auditPlanningService';
import { 
  AuditTrainingNeed, 
  TrainingNeedFormData,
  TrainingType,
  TrainingStatus 
} from '../../types/auditPlanning';

interface TrainingNeedModalProps {
  isOpen: boolean;
  onClose: () => void;
  trainingNeed?: AuditTrainingNeed;
  onSave: (data: TrainingNeedFormData) => void;
}

const TrainingNeedModal: React.FC<TrainingNeedModalProps> = ({
  isOpen,
  onClose,
  trainingNeed,
  onSave
}) => {
  const [formData, setFormData] = useState<TrainingNeedFormData>({
    user_id: '',
    training_area: '',
    training_type: 'technical',
    priority_level: 'medium',
    required_by_date: '',
    estimated_hours: 0,
    training_provider: '',
    training_cost: 0
  });

  useEffect(() => {
    if (trainingNeed) {
      setFormData({
        user_id: trainingNeed.user_id,
        training_area: trainingNeed.training_area,
        training_type: trainingNeed.training_type,
        priority_level: trainingNeed.priority_level,
        required_by_date: trainingNeed.required_by_date || '',
        estimated_hours: trainingNeed.estimated_hours,
        training_provider: trainingNeed.training_provider || '',
        training_cost: trainingNeed.training_cost
      });
    } else {
      setFormData({
        user_id: '',
        training_area: '',
        training_type: 'technical',
        priority_level: 'medium',
        required_by_date: '',
        estimated_hours: 0,
        training_provider: '',
        training_cost: 0
      });
    }
  }, [trainingNeed]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              {trainingNeed ? 'Edit Training Need' : 'Add Training Need'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                User ID *
              </label>
              <input
                type="text"
                required
                value={formData.user_id}
                onChange={(e) => setFormData(prev => ({ ...prev, user_id: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter user ID"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Training Area *
              </label>
              <input
                type="text"
                required
                value={formData.training_area}
                onChange={(e) => setFormData(prev => ({ ...prev, training_area: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Data Analytics, Cybersecurity"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Training Type *
              </label>
              <select
                required
                value={formData.training_type}
                onChange={(e) => setFormData(prev => ({ ...prev, training_type: e.target.value as TrainingType }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="technical">Technical</option>
                <option value="soft_skills">Soft Skills</option>
                <option value="certification">Certification</option>
                <option value="compliance">Compliance</option>
                <option value="tool_training">Tool Training</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority Level *
              </label>
              <select
                required
                value={formData.priority_level}
                onChange={(e) => setFormData(prev => ({ ...prev, priority_level: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Required By Date
              </label>
              <input
                type="date"
                value={formData.required_by_date}
                onChange={(e) => setFormData(prev => ({ ...prev, required_by_date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estimated Hours *
              </label>
              <input
                type="number"
                required
                value={formData.estimated_hours}
                onChange={(e) => setFormData(prev => ({ ...prev, estimated_hours: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Training Provider
              </label>
              <input
                type="text"
                value={formData.training_provider}
                onChange={(e) => setFormData(prev => ({ ...prev, training_provider: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Coursera, ISACA, Internal"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Training Cost
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  value={formData.training_cost}
                  onChange={(e) => setFormData(prev => ({ ...prev, training_cost: parseFloat(e.target.value) || 0 }))}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {trainingNeed ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const TrainingNeeds: React.FC = () => {
  const [trainingNeeds, setTrainingNeeds] = useState<AuditTrainingNeed[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedTrainingNeed, setSelectedTrainingNeed] = useState<AuditTrainingNeed | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  useEffect(() => {
    loadTrainingNeeds();
  }, []);

  const loadTrainingNeeds = async () => {
    try {
      setLoading(true);
      // Note: This would need to be implemented in the service
      // For now, we'll use a mock approach
      const mockTrainingNeeds: AuditTrainingNeed[] = [
        {
          id: '1',
          user_id: 'user1',
          training_area: 'Data Analytics',
          training_type: 'technical',
          priority_level: 'high',
          required_by_date: '2024-06-30',
          estimated_hours: 40,
          training_provider: 'Coursera',
          training_cost: 500,
          status: 'identified',
          approved_by: null,
          approved_at: null,
          completion_date: null,
          completion_notes: null,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          user: {
            first_name: 'John',
            last_name: 'Doe',
            email: 'john.doe@example.com'
          },
          approved_by_user: null
        },
        {
          id: '2',
          user_id: 'user2',
          training_area: 'Cybersecurity Fundamentals',
          training_type: 'certification',
          priority_level: 'critical',
          required_by_date: '2024-09-30',
          estimated_hours: 80,
          training_provider: 'ISACA',
          training_cost: 1200,
          status: 'approved',
          approved_by: 'approver1',
          approved_at: '2024-02-01T00:00:00Z',
          completion_date: null,
          completion_notes: null,
          created_at: '2024-01-15T00:00:00Z',
          updated_at: '2024-02-01T00:00:00Z',
          user: {
            first_name: 'Alice',
            last_name: 'Johnson',
            email: 'alice.johnson@example.com'
          },
          approved_by_user: {
            first_name: 'Manager',
            last_name: 'Smith',
            email: 'manager.smith@example.com'
          }
        }
      ];
      setTrainingNeeds(mockTrainingNeeds);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load training needs');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTrainingNeed = async (data: TrainingNeedFormData) => {
    try {
      // This would call the service to create training need
      console.log('Creating training need:', data);
      setShowModal(false);
      loadTrainingNeeds();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create training need');
    }
  };

  const handleEdit = (trainingNeed: AuditTrainingNeed) => {
    setSelectedTrainingNeed(trainingNeed);
    setShowModal(true);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'in_progress': return 'text-blue-600 bg-blue-50';
      case 'approved': return 'text-purple-600 bg-purple-50';
      case 'identified': return 'text-yellow-600 bg-yellow-50';
      case 'deferred': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getTrainingTypeIcon = (type: string) => {
    switch (type) {
      case 'technical': return <BookOpen className="h-4 w-4" />;
      case 'certification': return <Award className="h-4 w-4" />;
      case 'compliance': return <Target className="h-4 w-4" />;
      case 'soft_skills': return <User className="h-4 w-4" />;
      case 'tool_training': return <TrendingUp className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const filteredTrainingNeeds = trainingNeeds.filter(need => {
    const matchesSearch = need.user?.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         need.user?.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         need.training_area.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || need.training_type === filterType;
    const matchesStatus = filterStatus === 'all' || need.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || need.priority_level === filterPriority;
    
    return matchesSearch && matchesType && matchesStatus && matchesPriority;
  });

  const calculateTotalCost = () => {
    return trainingNeeds.reduce((total, need) => total + need.training_cost, 0);
  };

  const calculateTotalHours = () => {
    return trainingNeeds.reduce((total, need) => total + need.estimated_hours, 0);
  };

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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Training Needs Management</h1>
          <p className="text-gray-600">Identify and track auditor development requirements</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={loadTrainingNeeds}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Training Need
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Training Needs
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {trainingNeeds.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Hours
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {calculateTotalHours()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Cost
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    ${calculateTotalCost().toLocaleString()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Completed
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {trainingNeeds.filter(n => n.status === 'completed').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search auditors or areas..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Training Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="technical">Technical</option>
              <option value="soft_skills">Soft Skills</option>
              <option value="certification">Certification</option>
              <option value="compliance">Compliance</option>
              <option value="tool_training">Tool Training</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="identified">Identified</option>
              <option value="approved">Approved</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="deferred">Deferred</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div className="flex items-end">
            <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
              <Filter className="h-4 w-4 mr-2 inline" />
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Training Needs List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Training Needs</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Auditor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Training Area
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hours
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTrainingNeeds.map((need) => (
                <tr key={need.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {need.user?.first_name} {need.user?.last_name}
                        </div>
                        <div className="text-sm text-gray-500">{need.user?.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{need.training_area}</div>
                    <div className="text-sm text-gray-500">{need.training_provider}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getTrainingTypeIcon(need.training_type)}
                      <span className="ml-2 text-sm text-gray-900 capitalize">
                        {need.training_type.replace('_', ' ')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(need.priority_level)}`}>
                      {need.priority_level}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(need.status)}`}>
                      {need.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1 text-gray-400" />
                      {need.estimated_hours}h
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-1 text-gray-400" />
                      ${need.training_cost.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {need.required_by_date ? (
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                        {new Date(need.required_by_date).toLocaleDateString()}
                      </div>
                    ) : (
                      <span className="text-gray-400">Not set</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(need)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-900">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Training Need Modal */}
      <TrainingNeedModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedTrainingNeed(null);
        }}
        trainingNeed={selectedTrainingNeed || undefined}
        onSave={handleCreateTrainingNeed}
      />
    </div>
  );
};

export default TrainingNeeds;
