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
  ChevronDown,
  ChevronUp,
  Calendar,
  AlertTriangle,
  Target,
  Building,
  Globe,
  Shield,
  TrendingUp
} from 'lucide-react';
import { auditPlanningService } from '../../services/auditPlanningService';
import { 
  AuditUniverse, 
  EntityType, 
  ClassificationCategory,
  AuditUniverseFormData 
} from '../../types/auditPlanning';

interface AuditUniverseModalProps {
  isOpen: boolean;
  onClose: () => void;
  universe?: AuditUniverse;
  onSave: (data: AuditUniverseFormData) => void;
}

const AuditUniverseModal: React.FC<AuditUniverseModalProps> = ({
  isOpen,
  onClose,
  universe,
  onSave
}) => {
  const [formData, setFormData] = useState<AuditUniverseFormData>({
    entity_name: '',
    entity_type: 'process',
    business_unit_id: '',
    description: '',
    classification_category: 'operational',
    geography: '',
    regulatory_requirements: [],
    inherent_risk_score: undefined,
    control_maturity_level: undefined,
    audit_frequency_months: 12,
    parent_entity_id: ''
  });

  useEffect(() => {
    if (universe) {
      setFormData({
        entity_name: universe.entity_name,
        entity_type: universe.entity_type,
        business_unit_id: universe.business_unit_id || '',
        description: universe.description || '',
        classification_category: universe.classification_category,
        geography: universe.geography || '',
        regulatory_requirements: universe.regulatory_requirements || [],
        inherent_risk_score: universe.inherent_risk_score,
        control_maturity_level: universe.control_maturity_level,
        audit_frequency_months: universe.audit_frequency_months,
        parent_entity_id: universe.parent_entity_id || ''
      });
    } else {
      setFormData({
        entity_name: '',
        entity_type: 'process',
        business_unit_id: '',
        description: '',
        classification_category: 'operational',
        geography: '',
        regulatory_requirements: [],
        inherent_risk_score: undefined,
        control_maturity_level: undefined,
        audit_frequency_months: 12,
        parent_entity_id: ''
      });
    }
  }, [universe]);

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
              {universe ? 'Edit Audit Universe Entity' : 'Create New Audit Universe Entity'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Entity Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.entity_name}
                  onChange={(e) => setFormData({ ...formData, entity_name: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Entity Type *
                </label>
                <select
                  required
                  value={formData.entity_type}
                  onChange={(e) => setFormData({ ...formData, entity_type: e.target.value as EntityType })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="process">Process</option>
                  <option value="system">System</option>
                  <option value="department">Department</option>
                  <option value="location">Location</option>
                  <option value="vendor">Vendor</option>
                  <option value="project">Project</option>
                  <option value="application">Application</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Classification Category *
                </label>
                <select
                  required
                  value={formData.classification_category}
                  onChange={(e) => setFormData({ ...formData, classification_category: e.target.value as ClassificationCategory })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="financial">Financial</option>
                  <option value="operational">Operational</option>
                  <option value="compliance">Compliance</option>
                  <option value="strategic">Strategic</option>
                  <option value="technology">Technology</option>
                  <option value="security">Security</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Geography
                </label>
                <input
                  type="text"
                  value={formData.geography}
                  onChange={(e) => setFormData({ ...formData, geography: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Inherent Risk Score
                </label>
                <select
                  value={formData.inherent_risk_score || ''}
                  onChange={(e) => setFormData({ ...formData, inherent_risk_score: e.target.value ? parseInt(e.target.value) : undefined })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Risk Score</option>
                  <option value="1">1 - Very Low</option>
                  <option value="2">2 - Low</option>
                  <option value="3">3 - Medium</option>
                  <option value="4">4 - High</option>
                  <option value="5">5 - Very High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Control Maturity Level
                </label>
                <select
                  value={formData.control_maturity_level || ''}
                  onChange={(e) => setFormData({ ...formData, control_maturity_level: e.target.value ? parseInt(e.target.value) : undefined })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Maturity Level</option>
                  <option value="1">1 - Initial</option>
                  <option value="2">2 - Repeatable</option>
                  <option value="3">3 - Defined</option>
                  <option value="4">4 - Managed</option>
                  <option value="5">5 - Optimizing</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Audit Frequency (months) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.audit_frequency_months}
                  onChange={(e) => setFormData({ ...formData, audit_frequency_months: parseInt(e.target.value) })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Regulatory Requirements
              </label>
              <input
                type="text"
                placeholder="Enter requirements separated by commas"
                value={formData.regulatory_requirements?.join(', ') || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  regulatory_requirements: e.target.value.split(',').map(req => req.trim()).filter(req => req)
                })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {universe ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const AuditUniversePage: React.FC = () => {
  const [universeEntities, setUniverseEntities] = useState<AuditUniverse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    entity_type: '',
    classification_category: '',
    risk_level: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUniverse, setEditingUniverse] = useState<AuditUniverse | undefined>();

  useEffect(() => {
    loadUniverseEntities();
  }, []);

  const loadUniverseEntities = async () => {
    try {
      setLoading(true);
      const data = await auditPlanningService.getAllAuditUniverse();
      setUniverseEntities(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load universe entities');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUniverse = async (formData: AuditUniverseFormData) => {
    try {
      await auditPlanningService.createAuditUniverse(formData);
      setIsModalOpen(false);
      loadUniverseEntities();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create universe entity');
    }
  };

  const handleUpdateUniverse = async (formData: AuditUniverseFormData) => {
    if (!editingUniverse) return;
    
    try {
      await auditPlanningService.updateAuditUniverse(editingUniverse.id, formData);
      setIsModalOpen(false);
      setEditingUniverse(undefined);
      loadUniverseEntities();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update universe entity');
    }
  };

  const handleEdit = (universe: AuditUniverse) => {
    setEditingUniverse(universe);
    setIsModalOpen(true);
  };

  const getEntityTypeIcon = (type: EntityType) => {
    switch (type) {
      case 'process': return <Target className="h-4 w-4" />;
      case 'system': return <TrendingUp className="h-4 w-4" />;
      case 'department': return <Building className="h-4 w-4" />;
      case 'location': return <Globe className="h-4 w-4" />;
      case 'vendor': return <Shield className="h-4 w-4" />;
      case 'project': return <Calendar className="h-4 w-4" />;
      case 'application': return <TrendingUp className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const getRiskLevelColor = (score?: number) => {
    if (!score) return 'text-gray-500 bg-gray-100';
    if (score >= 4) return 'text-red-600 bg-red-100';
    if (score >= 3) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const getRiskLevelText = (score?: number) => {
    if (!score) return 'Not Assessed';
    if (score >= 4) return 'High';
    if (score >= 3) return 'Medium';
    return 'Low';
  };

  const filteredEntities = universeEntities.filter(entity => {
    const matchesSearch = entity.entity_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         entity.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = !selectedFilters.entity_type || entity.entity_type === selectedFilters.entity_type;
    const matchesCategory = !selectedFilters.classification_category || entity.classification_category === selectedFilters.classification_category;
    const matchesRisk = !selectedFilters.risk_level || 
                       (selectedFilters.risk_level === 'high' && entity.inherent_risk_score && entity.inherent_risk_score >= 4) ||
                       (selectedFilters.risk_level === 'medium' && entity.inherent_risk_score && entity.inherent_risk_score >= 3 && entity.inherent_risk_score < 4) ||
                       (selectedFilters.risk_level === 'low' && entity.inherent_risk_score && entity.inherent_risk_score < 3);

    return matchesSearch && matchesType && matchesCategory && matchesRisk;
  });

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
          <h1 className="text-2xl font-bold text-gray-900">Audit Universe</h1>
          <p className="text-gray-600">Manage all auditable entities across the organization</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={loadUniverseEntities}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Entity
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

      {/* Search and Filters */}
      <div className="bg-white shadow rounded-lg">
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search entities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {showFilters ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <select
                value={selectedFilters.entity_type}
                onChange={(e) => setSelectedFilters({ ...selectedFilters, entity_type: e.target.value })}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Entity Types</option>
                <option value="process">Process</option>
                <option value="system">System</option>
                <option value="department">Department</option>
                <option value="location">Location</option>
                <option value="vendor">Vendor</option>
                <option value="project">Project</option>
                <option value="application">Application</option>
              </select>

              <select
                value={selectedFilters.classification_category}
                onChange={(e) => setSelectedFilters({ ...selectedFilters, classification_category: e.target.value })}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Categories</option>
                <option value="financial">Financial</option>
                <option value="operational">Operational</option>
                <option value="compliance">Compliance</option>
                <option value="strategic">Strategic</option>
                <option value="technology">Technology</option>
                <option value="security">Security</option>
              </select>

              <select
                value={selectedFilters.risk_level}
                onChange={(e) => setSelectedFilters({ ...selectedFilters, risk_level: e.target.value })}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Risk Levels</option>
                <option value="high">High Risk</option>
                <option value="medium">Medium Risk</option>
                <option value="low">Low Risk</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Universe Entities Table */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">
              Universe Entities ({filteredEntities.length})
            </h3>
            <button className="text-sm text-blue-600 hover:text-blue-500">
              <Download className="h-4 w-4 inline mr-1" />
              Export
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Risk Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Audit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Frequency
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEntities.map((entity) => (
                <tr key={entity.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8">
                        {getEntityTypeIcon(entity.entity_type)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {entity.entity_name}
                        </div>
                        {entity.description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {entity.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                    {entity.entity_type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                    {entity.classification_category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRiskLevelColor(entity.inherent_risk_score)}`}>
                      {getRiskLevelText(entity.inherent_risk_score)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {entity.last_audit_date ? new Date(entity.last_audit_date).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {entity.audit_frequency_months} months
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(entity)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-900">
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      <AuditUniverseModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingUniverse(undefined);
        }}
        universe={editingUniverse}
        onSave={editingUniverse ? handleUpdateUniverse : handleCreateUniverse}
      />
    </div>
  );
};

export default AuditUniversePage;
