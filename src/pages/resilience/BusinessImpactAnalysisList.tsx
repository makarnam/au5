import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Calendar,
  User,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
  Building,
  DollarSign,
  Users,
  ArrowRight
} from 'lucide-react';
import { BusinessImpactAnalysis } from '../../types/resilience';
import { resilienceService } from '../../services/resilienceService';

const BusinessImpactAnalysisList: React.FC = () => {
  const navigate = useNavigate();
  const [bias, setBias] = useState<BusinessImpactAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchBIAs();
  }, []);

  const fetchBIAs = async () => {
    try {
      setLoading(true);
      const data = await resilienceService.getBusinessImpactAnalyses();
      setBias(data);
    } catch (err) {
      setError('Failed to load business impact analyses');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredBIAs = bias.filter(bia => {
    const matchesSearch = bia.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         bia.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || bia.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'approved': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCreateBIA = () => {
    // Navigate to create BIA page or show create modal
    navigate('/resilience/bia/create');
  };

  const handleViewBIA = (id: string) => {
    navigate(`/resilience/bia/${id}`);
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
          <h1 className="text-2xl font-bold text-gray-900">Business Impact Analysis</h1>
          <p className="text-gray-600">Assess and manage business process criticality and recovery requirements</p>
        </div>
        <button
          onClick={handleCreateBIA}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>New BIA</span>
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total BIAs</p>
              <p className="text-2xl font-bold text-blue-600">{bias.length}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-yellow-600">
                {bias.filter(b => b.status === 'in_progress').length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">
                {bias.filter(b => b.status === 'completed').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-purple-600">
                {bias.filter(b => b.status === 'approved').length}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg border">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search BIAs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="approved">Approved</option>
          </select>
        </div>
      </div>

      {/* BIA List */}
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Business Impact Analyses</h2>
        </div>
        
        {filteredBIAs.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Business Impact Analyses</h3>
            <p className="text-gray-600 mb-4">Get started by creating your first Business Impact Analysis.</p>
            <button
              onClick={handleCreateBIA}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Create First BIA
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredBIAs.map((bia) => (
              <div
                key={bia.id}
                className="p-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => handleViewBIA(bia.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Building className="w-5 h-5 text-blue-600" />
                      <div>
                        <h3 className="font-medium text-gray-900">{bia.name}</h3>
                        <p className="text-sm text-gray-600">{bia.description}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(bia.status)}`}>
                      {bia.status.replace('_', ' ')}
                    </span>
                    <div className="text-sm text-gray-500">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      {new Date(bia.created_at).toLocaleDateString()}
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
                
                <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                  <span>Processes: {bia.business_processes?.length || 0}</span>
                  <span>Assessments: {bia.impact_assessments?.length || 0}</span>
                  <span>Requirements: {bia.recovery_requirements?.length || 0}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
    </div>
  );
};

export default BusinessImpactAnalysisList;
