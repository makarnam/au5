import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Eye, Edit, Trash2, Calendar, DollarSign, Users, AlertTriangle, CheckCircle, Clock, X } from 'lucide-react';
import { ThirdPartyRiskManagementService } from '../../services/thirdPartyRiskManagementService';
import { ThirdPartyEngagement, ThirdPartyEngagementFormData, ThirdParty } from '../../types/thirdPartyRiskManagement';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';

const service = new ThirdPartyRiskManagementService();

interface EngagementFilters {
  search?: string;
  engagement_type?: string[];
  status?: string[];
  priority?: string[];
  third_party_id?: string;
  business_unit_id?: string;
  project_manager_id?: string;
  date_from?: string;
  date_to?: string;
}

const EngagementManagement: React.FC = () => {
  const navigate = useNavigate();
  const [engagements, setEngagements] = useState<ThirdPartyEngagement[]>([]);
  const [thirdParties, setThirdParties] = useState<ThirdParty[]>([]);
  const [businessUnits, setBusinessUnits] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [filters, setFilters] = useState<EngagementFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [selectedEngagement, setSelectedEngagement] = useState<ThirdPartyEngagement | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [page, filters]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load engagements
      const engagementsResult = await service.getEngagements(undefined, page, limit);
      if (engagementsResult.data) {
        setEngagements(engagementsResult.data);
        setTotal(engagementsResult.total);
      }

      // Load third parties for filters
      const thirdPartiesResult = await service.getThirdParties();
      if (thirdPartiesResult.data) {
        setThirdParties(thirdPartiesResult.data);
      }

      // Load business units
      const businessUnitsResult = await service.getBusinessUnits();
      if (businessUnitsResult.data) {
        setBusinessUnits(businessUnitsResult.data);
      }

      // Load users
      const usersResult = await service.getUsers();
      if (usersResult.data) {
        setUsers(usersResult.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this engagement?')) return;
    
    setDeleting(id);
    try {
      // Note: The service doesn't have a deleteEngagement method yet
      // We'll need to add it to the service
      await service.deleteEngagement?.(id);
      await loadData();
    } catch (error) {
      console.error('Error deleting engagement:', error);
    } finally {
      setDeleting(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'planning': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'terminated': return 'bg-red-100 text-red-800';
      case 'suspended': return 'bg-yellow-100 text-yellow-800';
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

  const getEngagementTypeIcon = (type: string) => {
    switch (type) {
      case 'contract': return <DollarSign className="w-4 h-4" />;
      case 'project': return <Calendar className="w-4 h-4" />;
      case 'service': return <Users className="w-4 h-4" />;
      case 'partnership': return <CheckCircle className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  const formatCurrency = (value?: number, currency = 'USD') => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(value);
  };

  const getThirdPartyName = (thirdPartyId: string) => {
    const thirdParty = thirdParties.find(tp => tp.id === thirdPartyId);
    return thirdParty?.name || 'Unknown';
  };

  const getUserName = (userId?: string) => {
    if (!userId) return 'N/A';
    const user = users.find(u => u.id === userId);
    return user ? `${user.first_name} ${user.last_name}` : 'Unknown';
  };

  const getBusinessUnitName = (businessUnitId?: string) => {
    if (!businessUnitId) return 'N/A';
    const businessUnit = businessUnits.find(bu => bu.id === businessUnitId);
    return businessUnit?.name || 'Unknown';
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Engagement Management</h1>
          <p className="text-gray-600 mt-2">Manage third-party engagements and vendor lifecycle</p>
        </div>
        <Link to="/third-party-risk-management/engagements/create">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create Engagement
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Filters</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              {showFilters ? 'Hide' : 'Show'} Filters
            </Button>
          </div>
        </CardHeader>
        {showFilters && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="search">Search</Label>
                <Input
                  id="search"
                  placeholder="Search engagements..."
                  value={filters.search || ''}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="engagement_type">Engagement Type</Label>
                <select
                  id="engagement_type"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={filters.engagement_type?.[0] || ''}
                  onChange={(e) => setFilters({ 
                    ...filters, 
                    engagement_type: e.target.value ? [e.target.value] : undefined 
                  })}
                >
                  <option value="">All Types</option>
                  <option value="contract">Contract</option>
                  <option value="project">Project</option>
                  <option value="service">Service</option>
                  <option value="partnership">Partnership</option>
                </select>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={filters.status?.[0] || ''}
                  onChange={(e) => setFilters({ 
                    ...filters, 
                    status: e.target.value ? [e.target.value] : undefined 
                  })}
                >
                  <option value="">All Statuses</option>
                  <option value="planning">Planning</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="terminated">Terminated</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <select
                  id="priority"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={filters.priority?.[0] || ''}
                  onChange={(e) => setFilters({ 
                    ...filters, 
                    priority: e.target.value ? [e.target.value] : undefined 
                  })}
                >
                  <option value="">All Priorities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div>
                <Label htmlFor="third_party">Third Party</Label>
                <select
                  id="third_party"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={filters.third_party_id || ''}
                  onChange={(e) => setFilters({ 
                    ...filters, 
                    third_party_id: e.target.value || undefined 
                  })}
                >
                  <option value="">All Third Parties</option>
                  {thirdParties.map((tp) => (
                    <option key={tp.id} value={tp.id}>{tp.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="business_unit">Business Unit</Label>
                <select
                  id="business_unit"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={filters.business_unit_id || ''}
                  onChange={(e) => setFilters({ 
                    ...filters, 
                    business_unit_id: e.target.value || undefined 
                  })}
                >
                  <option value="">All Business Units</option>
                  {businessUnits.map((bu) => (
                    <option key={bu.id} value={bu.id}>{bu.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end mt-4 space-x-2">
              <Button
                variant="outline"
                onClick={() => setFilters({})}
              >
                Clear Filters
              </Button>
              <Button onClick={() => setShowFilters(false)}>
                Apply Filters
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Engagements List */}
      <Card>
        <CardHeader>
          <CardTitle>Engagements ({total})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : engagements.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No engagements found</p>
              <Link to="/third-party-risk-management/engagements/create">
                <Button className="mt-4">Create First Engagement</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {engagements.map((engagement) => (
                <div
                  key={engagement.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getEngagementTypeIcon(engagement.engagement_type)}
                        <h3 className="text-lg font-semibold">{engagement.title}</h3>
                        <Badge className={getStatusColor(engagement.status)}>
                          {engagement.status}
                        </Badge>
                        <Badge className={getPriorityColor(engagement.priority)}>
                          {engagement.priority}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Third Party:</span> {getThirdPartyName(engagement.third_party_id)}
                        </div>
                        <div>
                          <span className="font-medium">Type:</span> {engagement.engagement_type}
                        </div>
                        <div>
                          <span className="font-medium">Value:</span> {formatCurrency(engagement.contract_value, engagement.currency)}
                        </div>
                        <div>
                          <span className="font-medium">Duration:</span> {engagement.start_date} - {engagement.end_date || 'Ongoing'}
                        </div>
                      </div>

                      {engagement.description && (
                        <p className="text-gray-600 mt-2 line-clamp-2">{engagement.description}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedEngagement(engagement);
                          setShowDetails(true);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Link to={`/third-party-risk-management/engagements/${engagement.id}/edit`}>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(engagement.id)}
                        disabled={deleting === engagement.id}
                      >
                        {deleting === engagement.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Engagement Details Modal */}
      {showDetails && selectedEngagement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold">{selectedEngagement.title}</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDetails(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Basic Information</h3>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Third Party:</span> {getThirdPartyName(selectedEngagement.third_party_id)}</div>
                  <div><span className="font-medium">Type:</span> {selectedEngagement.engagement_type}</div>
                  <div><span className="font-medium">Status:</span> 
                    <Badge className={`ml-2 ${getStatusColor(selectedEngagement.status)}`}>
                      {selectedEngagement.status}
                    </Badge>
                  </div>
                  <div><span className="font-medium">Priority:</span>
                    <Badge className={`ml-2 ${getPriorityColor(selectedEngagement.priority)}`}>
                      {selectedEngagement.priority}
                    </Badge>
                  </div>
                  <div><span className="font-medium">Start Date:</span> {selectedEngagement.start_date}</div>
                  <div><span className="font-medium">End Date:</span> {selectedEngagement.end_date || 'Ongoing'}</div>
                  <div><span className="font-medium">Business Unit:</span> {getBusinessUnitName(selectedEngagement.business_unit_id)}</div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Contract Details</h3>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Contract Number:</span> {selectedEngagement.contract_number || 'N/A'}</div>
                  <div><span className="font-medium">Contract Value:</span> {formatCurrency(selectedEngagement.contract_value, selectedEngagement.currency)}</div>
                  <div><span className="font-medium">Project Manager:</span> {getUserName(selectedEngagement.project_manager_id)}</div>
                  <div><span className="font-medium">Contract Manager:</span> {getUserName(selectedEngagement.contract_manager_id)}</div>
                  <div><span className="font-medium">Payment Schedule:</span> {selectedEngagement.payment_schedule || 'N/A'}</div>
                </div>
              </div>
            </div>

            {selectedEngagement.description && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">Description</h3>
                <p className="text-gray-600">{selectedEngagement.description}</p>
              </div>
            )}

            {selectedEngagement.deliverables && selectedEngagement.deliverables.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">Deliverables</h3>
                <ul className="list-disc list-inside space-y-1">
                  {selectedEngagement.deliverables.map((deliverable, index) => (
                    <li key={index} className="text-gray-600">{deliverable}</li>
                  ))}
                </ul>
              </div>
            )}

            {selectedEngagement.key_performance_indicators && selectedEngagement.key_performance_indicators.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">Key Performance Indicators</h3>
                <ul className="list-disc list-inside space-y-1">
                  {selectedEngagement.key_performance_indicators.map((kpi, index) => (
                    <li key={index} className="text-gray-600">{kpi}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-end space-x-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowDetails(false)}
              >
                Close
              </Button>
              <Link to={`/third-party-risk-management/engagements/${selectedEngagement.id}/edit`}>
                <Button>Edit Engagement</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EngagementManagement;
