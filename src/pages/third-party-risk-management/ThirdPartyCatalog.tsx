import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { 
  Building2, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Eye, 
  Trash2, 
  Download,
  Calendar,
  AlertTriangle,
  Shield,
  TrendingUp,
  Users,
  DollarSign,
  Globe,
  Phone,
  Mail,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { thirdPartyRiskManagementService } from '../../services/thirdPartyRiskManagementService';
import { ThirdParty, ThirdPartySearchFilters } from '../../types/thirdPartyRiskManagement';
import { Link } from 'react-router-dom';

const ThirdPartyCatalog: React.FC = () => {
  const [thirdParties, setThirdParties] = useState<ThirdParty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<ThirdPartySearchFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [businessUnits, setBusinessUnits] = useState<any[]>([]);
  const [selectedThirdParty, setSelectedThirdParty] = useState<ThirdParty | null>(null);

  const vendorTypes = [
    'supplier', 'service_provider', 'contractor', 'partner', 'consultant',
    'vendor', 'distributor', 'manufacturer', 'logistics', 'technology'
  ];

  const riskClassifications = ['low', 'medium', 'high', 'critical'];
  const statuses = ['active', 'inactive', 'suspended', 'terminated'];

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
        loadThirdParties();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete third party');
      }
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'suspended': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'terminated': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const isAssessmentOverdue = (nextAssessmentDate?: string) => {
    if (!nextAssessmentDate) return false;
    return new Date(nextAssessmentDate) < new Date();
  };

  const isContractExpiringSoon = (contractEndDate?: string) => {
    if (!contractEndDate) return false;
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return new Date(contractEndDate) <= thirtyDaysFromNow;
  };

  if (loading && thirdParties.length === 0) {
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
          <h1 className="text-3xl font-bold text-gray-900">Third Party Catalog</h1>
          <p className="text-gray-600 mt-2">Manage and monitor all third-party vendors and suppliers</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {showFilters ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button asChild>
            <Link to="/third-party-risk-management/create">
              <Plus className="h-4 w-4 mr-2" />
              Add Third Party
            </Link>
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Search */}
            <div className="flex space-x-3">
              <div className="flex-1">
                <Input
                  placeholder="Search by name, legal name, or vendor ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button onClick={handleSearch}>
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Risk Classification
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
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
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
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
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
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
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
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

                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.assessment_overdue || false}
                      onChange={(e) => handleFilterChange('assessment_overdue', e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm">Assessment Overdue</span>
                  </label>
                </div>

                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.contract_expiring_soon || false}
                      onChange={(e) => handleFilterChange('contract_expiring_soon', e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm">Contract Expiring Soon</span>
                  </label>
                </div>

                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.high_risk_only || false}
                      onChange={(e) => handleFilterChange('high_risk_only', e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm">High Risk Only</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle>
            Third Parties ({total} total)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            {thirdParties.map((thirdParty) => (
              <div
                key={thirdParty.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {thirdParty.name}
                      </h3>
                      <Badge className={getRiskLevelColor(thirdParty.risk_classification)}>
                        {thirdParty.risk_classification.toUpperCase()}
                      </Badge>
                      <Badge className={getStatusColor(thirdParty.status)}>
                        {thirdParty.status.toUpperCase()}
                      </Badge>
                      {isAssessmentOverdue(thirdParty.next_assessment_date) && (
                        <Badge className="bg-red-100 text-red-800 border-red-200">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Assessment Overdue
                        </Badge>
                      )}
                      {isContractExpiringSoon(thirdParty.contract_end_date) && (
                        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                          <Calendar className="h-3 w-3 mr-1" />
                          Contract Expiring
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
                      <div className="flex items-center space-x-2">
                        <Building2 className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {thirdParty.vendor_type.replace('_', ' ')}
                        </span>
                      </div>
                      
                      {thirdParty.business_units?.name && (
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {thirdParty.business_units.name}
                          </span>
                        </div>
                      )}

                      {thirdParty.contract_value && (
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {thirdParty.currency} {thirdParty.contract_value.toLocaleString()}
                          </span>
                        </div>
                      )}

                      {thirdParty.country && (
                        <div className="flex items-center space-x-2">
                          <Globe className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {thirdParty.country}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      {thirdParty.contact_email && (
                        <div className="flex items-center space-x-1">
                          <Mail className="h-3 w-3" />
                          <span>{thirdParty.contact_email}</span>
                        </div>
                      )}
                      {thirdParty.contact_phone && (
                        <div className="flex items-center space-x-1">
                          <Phone className="h-3 w-3" />
                          <span>{thirdParty.contact_phone}</span>
                        </div>
                      )}
                      {thirdParty.website && (
                        <div className="flex items-center space-x-1">
                          <ExternalLink className="h-3 w-3" />
                          <a href={thirdParty.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            Website
                          </a>
                        </div>
                      )}
                    </div>

                    {thirdParty.notes && (
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                        {thirdParty.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex space-x-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedThirdParty(thirdParty)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <Link to={`/third-party-risk-management/edit/${thirdParty.id}`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(thirdParty.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {total > 10 && (
            <div className="flex justify-between items-center mt-6 pt-4 border-t">
              <div className="text-sm text-gray-600">
                Showing {((page - 1) * 10) + 1} to {Math.min(page * 10, total)} of {total} results
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page * 10 >= total}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Third Party Details Modal */}
      {selectedThirdParty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold">{selectedThirdParty.name}</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedThirdParty(null)}
              >
                ×
              </Button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Legal Name</label>
                  <p className="text-sm text-gray-900">{selectedThirdParty.legal_name || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Vendor ID</label>
                  <p className="text-sm text-gray-900">{selectedThirdParty.vendor_id || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Industry</label>
                  <p className="text-sm text-gray-900">{selectedThirdParty.industry || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Risk Score</label>
                  <p className="text-sm text-gray-900">{selectedThirdParty.risk_score}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contact Person</label>
                  <p className="text-sm text-gray-900">{selectedThirdParty.contact_person || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contact Email</label>
                  <p className="text-sm text-gray-900">{selectedThirdParty.contact_email || 'N/A'}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <p className="text-sm text-gray-900">{selectedThirdParty.address || 'N/A'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contract Start Date</label>
                  <p className="text-sm text-gray-900">
                    {selectedThirdParty.contract_start_date ? new Date(selectedThirdParty.contract_start_date).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contract End Date</label>
                  <p className="text-sm text-gray-900">
                    {selectedThirdParty.contract_end_date ? new Date(selectedThirdParty.contract_end_date).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <p className="text-sm text-gray-900">{selectedThirdParty.notes || 'No notes available'}</p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setSelectedThirdParty(null)}
              >
                Close
              </Button>
              <Button asChild>
                <Link to={`/third-party-risk-management/edit/${selectedThirdParty.id}`}>
                  Edit Third Party
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThirdPartyCatalog;
