import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Plus, 
  Save, 
  Trash2, 
  Edit, 
  Eye, 
  AlertTriangle,
  Clock,
  DollarSign,
  Users,
  Building,
  Database,
  Server,
  Phone,
  Mail,
  Calendar,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { 
  BusinessImpactAnalysis as BIA,
  BusinessProcess,
  ImpactAssessment,
  RecoveryRequirement
} from '../../types/resilience';
import { resilienceService } from '../../services/resilienceService';

const BusinessImpactAnalysis: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [bia, setBia] = useState<BIA | null>(null);
  const [processes, setProcesses] = useState<BusinessProcess[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'processes' | 'assessments' | 'requirements'>('overview');
  const [editingProcess, setEditingProcess] = useState<BusinessProcess | null>(null);
  const [showProcessForm, setShowProcessForm] = useState(false);

  useEffect(() => {
    const fetchBIA = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const [biaData, processesData] = await Promise.all([
          resilienceService.getBusinessImpactAnalysisById(id),
          resilienceService.getBusinessProcesses(id)
        ]);
        
        setBia(biaData);
        setProcesses(processesData);
      } catch (err) {
        setError('Failed to load business impact analysis');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBIA();
  }, [id]);

  const handleSaveProcess = async (process: Partial<BusinessProcess>) => {
    if (!id) return;

    try {
      if (editingProcess) {
        await resilienceService.updateBusinessProcess(editingProcess.id, process);
      } else {
        await resilienceService.createBusinessProcess({
          ...process,
          bia_id: id
        } as BusinessProcess);
      }
      
      // Refresh processes
      const updatedProcesses = await resilienceService.getBusinessProcesses(id);
      setProcesses(updatedProcesses);
      setEditingProcess(null);
      setShowProcessForm(false);
    } catch (err) {
      console.error('Failed to save process:', err);
    }
  };

  const handleDeleteProcess = async (processId: string) => {
    if (!confirm('Are you sure you want to delete this process?')) return;

    try {
      // Note: Add delete method to service if needed
      // await resilienceService.deleteBusinessProcess(processId);
      const updatedProcesses = processes.filter(p => p.id !== processId);
      setProcesses(updatedProcesses);
    } catch (err) {
      console.error('Failed to delete process:', err);
    }
  };

  const getCriticalityColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'in_progress': return 'text-blue-600 bg-blue-100';
      case 'draft': return 'text-yellow-600 bg-yellow-100';
      case 'approved': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !bia) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error || 'Business Impact Analysis not found'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/resilience')}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{bia.name}</h1>
            <p className="text-gray-600">{bia.description}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(bia.status)}`}>
            {bia.status.replace('_', ' ')}
          </span>
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
            <Save className="h-4 w-4 mr-2" />
            Save
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: Eye },
            { id: 'processes', label: 'Business Processes', icon: Building },
            { id: 'assessments', label: 'Impact Assessments', icon: AlertTriangle },
            { id: 'requirements', label: 'Recovery Requirements', icon: Clock }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* BIA Overview */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Analysis Overview</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{processes.length}</div>
                    <div className="text-sm text-gray-500">Business Processes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {processes.filter(p => p.criticality_level === 'critical').length}
                    </div>
                    <div className="text-sm text-gray-500">Critical Processes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {processes.filter(p => p.criticality_level === 'high').length}
                    </div>
                    <div className="text-sm text-gray-500">High Priority</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {Math.round(processes.reduce((sum, p) => sum + p.rto_hours, 0) / processes.length || 0)}
                    </div>
                    <div className="text-sm text-gray-500">Avg RTO (hours)</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Process Summary */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Process Summary</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {processes.slice(0, 5).map((process) => (
                    <div key={process.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`w-3 h-3 rounded-full ${
                          process.criticality_level === 'critical' ? 'bg-red-500' :
                          process.criticality_level === 'high' ? 'bg-orange-500' :
                          process.criticality_level === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                        }`} />
                        <div>
                          <div className="font-medium text-gray-900">{process.name}</div>
                          <div className="text-sm text-gray-500">{process.department}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCriticalityColor(process.criticality_level)}`}>
                          {process.criticality_level}
                        </span>
                        <div className="text-sm text-gray-500">
                          RTO: {process.rto_hours}h
                        </div>
                        <div className="text-sm text-gray-500">
                          ${process.financial_impact_per_hour}/hr
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {processes.length > 5 && (
                  <div className="mt-4 text-center">
                    <button
                      onClick={() => setActiveTab('processes')}
                      className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                    >
                      View all {processes.length} processes
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'processes' && (
          <div className="space-y-6">
            {/* Process Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Business Processes</h3>
              <button
                onClick={() => {
                  setEditingProcess(null);
                  setShowProcessForm(true);
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Process
              </button>
            </div>

            {/* Process Form */}
            {showProcessForm && (
              <ProcessForm
                process={editingProcess}
                onSave={handleSaveProcess}
                onCancel={() => {
                  setShowProcessForm(false);
                  setEditingProcess(null);
                }}
              />
            )}

            {/* Processes List */}
            <div className="bg-white shadow rounded-lg">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Process
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Department
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Criticality
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        RTO
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Financial Impact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {processes.map((process) => (
                      <tr key={process.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{process.name}</div>
                            <div className="text-sm text-gray-500">{process.description}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {process.department}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCriticalityColor(process.criticality_level)}`}>
                            {process.criticality_level}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {process.rto_hours} hours
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${process.financial_impact_per_hour}/hour
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setEditingProcess(process);
                                setShowProcessForm(true);
                              }}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProcess(process.id)}
                              className="text-red-600 hover:text-red-900"
                            >
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
          </div>
        )}

        {activeTab === 'assessments' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Impact Assessments</h3>
            </div>
            <div className="p-6">
              <div className="text-center py-12">
                <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Impact Assessments</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Impact assessments will be implemented in the next iteration.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'requirements' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Recovery Requirements</h3>
            </div>
            <div className="p-6">
              <div className="text-center py-12">
                <Clock className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Recovery Requirements</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Recovery requirements will be implemented in the next iteration.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Process Form Component
interface ProcessFormProps {
  process?: BusinessProcess | null;
  onSave: (process: Partial<BusinessProcess>) => void;
  onCancel: () => void;
}

const ProcessForm: React.FC<ProcessFormProps> = ({ process, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: process?.name || '',
    description: process?.description || '',
    department: process?.department || '',
    criticality_level: process?.criticality_level || 'medium',
    rto_hours: process?.rto_hours || 24,
    rpo_hours: process?.rpo_hours || 4,
    max_tolerable_outage: process?.max_tolerable_outage || 48,
    financial_impact_per_hour: process?.financial_impact_per_hour || 0,
    regulatory_impact: process?.regulatory_impact || [],
    customer_impact: process?.customer_impact || '',
    recovery_strategy: process?.recovery_strategy || '',
    alternate_processes: process?.alternate_processes || [],
    dependencies: process?.dependencies || []
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          {process ? 'Edit Process' : 'Add New Process'}
        </h3>
      </div>
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Process Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Department</label>
            <input
              type="text"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Criticality Level</label>
            <select
              value={formData.criticality_level}
              onChange={(e) => setFormData({ ...formData, criticality_level: e.target.value as any })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">RTO (hours)</label>
            <input
              type="number"
              value={formData.rto_hours}
              onChange={(e) => setFormData({ ...formData, rto_hours: parseInt(e.target.value) })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">RPO (hours)</label>
            <input
              type="number"
              value={formData.rpo_hours}
              onChange={(e) => setFormData({ ...formData, rpo_hours: parseInt(e.target.value) })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Financial Impact per Hour ($)</label>
            <input
              type="number"
              value={formData.financial_impact_per_hour}
              onChange={(e) => setFormData({ ...formData, financial_impact_per_hour: parseInt(e.target.value) })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Customer Impact</label>
          <textarea
            value={formData.customer_impact}
            onChange={(e) => setFormData({ ...formData, customer_impact: e.target.value })}
            rows={2}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Recovery Strategy</label>
          <textarea
            value={formData.recovery_strategy}
            onChange={(e) => setFormData({ ...formData, recovery_strategy: e.target.value })}
            rows={3}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {process ? 'Update' : 'Create'} Process
          </button>
        </div>
      </form>
    </div>
  );
};

export default BusinessImpactAnalysis;
