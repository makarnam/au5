import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Building2,
  Search,
  Filter,
  Plus,
  Edit,
  Eye,
  Trash2,
  Download,
  AlertTriangle,
  Shield,
  TrendingUp,
  Users,
  DollarSign,
  Globe,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { thirdPartyRiskManagementService } from '../../services/thirdPartyRiskManagementService';
import { ThirdParty, ThirdPartySearchFilters } from '../../types/thirdPartyRiskManagement';

const ThirdPartyCatalog: React.FC = () => {
  const navigate = useNavigate();
  const [thirdParties, setThirdParties] = useState<ThirdParty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<ThirdPartySearchFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [businessUnits, setBusinessUnits] = useState<any[]>([]);

  const vendorTypes = [
    'supplier', 'service_provider', 'contractor', 'partner', 'consultant',
    'vendor', 'distributor', 'manufacturer', 'logistics', 'technology'
  ];

  const riskClassifications = ['low', 'medium', 'high', 'critical'];
  const statuses = ['active', 'inactive', 'suspended', 'terminated'];

  // Stats
  const statsLoading = false;
  const totalRisk = thirdParties.filter(t => t.risk_classification === 'high' || t.risk_classification === 'critical').length;
  const totalActive = thirdParties.filter(t => t.status === 'active').length;
  const totalAssessmentOverdue = thirdParties.filter(t => 
    t.next_assessment_date && new Date(t.next_assessment_date) < new Date()
  ).length;

  useEffect(() => {
    loadThirdParties();
    loadBusinessUnits();
  }, [page, filters]);

  const loadThirdParties = async () => {
    try {
      setLoading(true);
      const searchFilters: ThirdPartySearchFilters = {
        ...filters,
        search: searchTerm || undefined
      };

      const result = await thirdPartyRiskManagementService.getThirdParties(searchFilters, page, 10);
      
      if (result.error) {
        throw new Error('Failed to load third parties');
      }

      setThirdParties(result.data);
      setTotal(result.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const loadBusinessUnits = async () => {
    try {
      const result = await thirdPartyRiskManagementService.getBusinessUnits();
      if (!result.error) {
        setBusinessUnits(result.data);
      }
    } catch (err) {
      console.error('Failed to load business units:', err);
    }
  };

  const handleSearch = () => {
    setPage(1);
    loadThirdParties();
  };

  const handleFilterChange = (key: keyof ThirdPartySearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setPage(1);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this third party?')) {
      try {
        const result = await thirdPartyRiskManagementService.deleteThirdParty(id);
        if (result.error) {
          throw new Error('Failed to delete third party');
        }
        toast.success('Third party deleted successfully');
        loadThirdParties();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete third party');
        toast.error('Failed to delete third party');
      }
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-yellow-100 text-yellow-800';
      case 'terminated': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isAssessmentOverdue = (nextAssessmentDate?: string) => {
    if (!nextAssessmentDate) return false;
    return new Date(nextAssessmentDate) < new Date();
  };

  const filteredThirdParties = thirdParties.filter(tp => {
    const matchesSearch = !searchTerm || 
      tp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tp.legal_name?.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  if (loading && thirdParties.length === 0) {
    return (
      <div className="p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-center text-gray-600 mt-4">Loading third parties...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-red-900 mb-2">Error Loading Third Parties</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={loadThirdParties}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Third Party Catalog</h1>
          <p className="text-gray-600 mt-2">
            Manage and monitor all third-party vendors and suppliers
          </p>
        </div>

        <div className="flex space-x-3 mt-4 sm:mt-0">
          <button
            onClick={() => {
              // TODO: Implement export functionality
              console.log('Export third parties');
              alert('Export functionality will be implemented');
            }}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
          <button
            onClick={() => navigate('/third-party-risk-management/create')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Third Party
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Building2 className="w-6 h-6 text-blue-600 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Total Third Parties</p>
              <p className="text-2xl font-semibold text-gray-900">{loading ? '...' : total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Shield className="w-6 h-6 text-green-600 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Active</p>
              <p className="text-2xl font-semibold text-gray-900">{loading ? '...' : totalActive}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <AlertTriangle className="w-6 h-6 text-orange-600 mr-3" />
            <div>
              <p className="text-sm text-gray-500">High Risk</p>
              <p className="text-2xl font-semibold text-gray-900">{loading ? '...' : totalRisk}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <TrendingUp className="w-6 h-6 text-red-600 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Assessment Overdue</p>
              <p className="text-2xl font-semibold text-gray-900">{loading ? '...' : totalAssessmentOverdue}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name or legal name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
            {showFilters ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
          </button>

          <button
            onClick={handleSearch}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Search className="w-4 h-4 mr-2" />
            Search
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Risk Classification
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={filters.risk_classification?.[0] || ''}
                  onChange={(e) => handleFilterChange('risk_classification', e.target.value ? [e.target.value] : undefined)}
                >
                  <option value="">All</option>
                  {riskClassifications.map(classification => (
                    <option key={classification} value={classification}>
                      {classification.charAt(0).toUpperCase() + classification.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={filters.status?.[0] || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value ? [e.target.value] : undefined)}
                >
                  <option value="">All</option>
                  {statuses.map(status => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vendor Type
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={filters.vendor_type?.[0] || ''}
                  onChange={(e) => handleFilterChange('vendor_type', e.target.value ? [e.target.value] : undefined)}
                >
                  <option value="">All</option>
                  {vendorTypes.map(type => (
                    <option key={type} value={type}>
                      {type.replace('_', ' ').charAt(0).toUpperCase() + type.replace('_', ' ').slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Unit
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={filters.business_unit_id || ''}
                  onChange={(e) => handleFilterChange('business_unit_id', e.target.value || undefined)}
                >
                  <option value="">All</option>
                  {businessUnits.map(unit => (
                    <option key={unit.id} value={unit.id}>
                      {unit.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-4 mt-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.assessment_overdue || false}
                  onChange={(e) => handleFilterChange('assessment_overdue', e.target.checked)}
                  className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Assessment Overdue</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.high_risk_only || false}
                  onChange={(e) => handleFilterChange('high_risk_only', e.target.checked)}
                  className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">High Risk Only</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Third Parties Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {filteredThirdParties.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No third parties found</h3>
            <p className="text-gray-600 mb-6">
              {thirdParties.length === 0
                ? "Get started by adding your first third party."
                : "Try adjusting your search or filter criteria."}
            </p>
            {thirdParties.length === 0 && (
              <button
                onClick={() => navigate('/third-party-risk-management/create')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Your First Third Party
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Third Party
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Risk Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Business Unit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredThirdParties.map((thirdParty, idx) => (
                  <motion.tr
                    key={thirdParty.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: Math.min(idx * 0.03, 0.3) }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-start">
                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mr-3">
                          <Building2 className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="min-w-0">
                          <button
                            onClick={() => navigate(`/third-party-risk-management/${thirdParty.id}`)}
                            className="text-sm font-semibold text-gray-900 hover:text-blue-600"
                          >
                            {thirdParty.name}
                          </button>
                          {thirdParty.legal_name && (
                            <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                              {thirdParty.legal_name}
                            </p>
                          )}
                          {thirdParty.country && (
                            <p className="text-xs text-gray-400 mt-1 flex items-center">
                              <Globe className="w-3 h-3 mr-1" />
                              {thirdParty.country}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900">
                        {thirdParty.vendor_type?.replace('_', ' ').charAt(0).toUpperCase() + thirdParty.vendor_type?.replace('_', ' ').slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskLevelColor(thirdParty.risk_classification)}`}>
                        {thirdParty.risk_classification?.charAt(0).toUpperCase() + thirdParty.risk_classification?.slice(1)}
                      </span>
                      {isAssessmentOverdue(thirdParty.next_assessment_date) && (
                        <span className="ml-1 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Overdue
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(thirdParty.status)}`}>
                        {thirdParty.status?.charAt(0).toUpperCase() + thirdParty.status?.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900">
                        {thirdParty.business_unit_id || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {thirdParty.contract_value && (
                          <div className="flex items-center">
                            <DollarSign className="w-4 h-4 text-gray-400 mr-1" />
                            {thirdParty.contract_value.toLocaleString()}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => navigate(`/third-party-risk-management/${thirdParty.id}`)}
                          className="text-gray-500 hover:text-blue-600 text-sm"
                        >
                          View
                        </button>
                        <button
                          onClick={() => navigate(`/third-party-risk-management/edit/${thirdParty.id}`)}
                          className="text-gray-500 hover:text-blue-600 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(thirdParty.id)}
                          className="text-gray-500 hover:text-red-600 text-sm"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {total > 10 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page * 10 >= total}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(page - 1) * 10 + 1}</span> to <span className="font-medium">{Math.min(page * 10, total)}</span> of <span className="font-medium">{total}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronDown className="h-4 w-4 transform rotate-90" />
                  </button>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page * 10 >= total}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronDown className="h-4 w-4 transform -rotate-90" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ThirdPartyCatalog;
