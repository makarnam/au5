import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  Calendar,
  User,
  Building,
  Shield,
  BookOpen
} from 'lucide-react';
import { itSecurityService, ITSecurityPolicy, ITSecuritySearchParams } from '../../services/itSecurityService';
import { Link, useNavigate } from 'react-router-dom';

const PoliciesList: React.FC = () => {
  const [policies, setPolicies] = useState<ITSecurityPolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useState<ITSecuritySearchParams>({
    page: 1,
    page_size: 20
  });
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadPolicies();
  }, [searchParams]);

  const loadPolicies = async () => {
    try {
      setLoading(true);
      const response = await itSecurityService.policies.getAll(searchParams);
      setPolicies(response.data);
      setTotalPages(response.totalPages);
      setTotalItems(response.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load policies');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchParams(prev => ({ ...prev, query, page: 1 }));
  };

  const handleFilter = (filters: any) => {
    setSearchParams(prev => ({ ...prev, filters, page: 1 }));
  };

  const handleSort = (sortBy: string, sortOrder: 'asc' | 'desc') => {
    setSearchParams(prev => ({ ...prev, sort_by: sortBy, sort_order: sortOrder }));
  };

  const handlePageChange = (page: number) => {
    setSearchParams(prev => ({ ...prev, page }));
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this policy?')) {
      try {
        await itSecurityService.policies.delete(id);
        loadPolicies();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete policy');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'review': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'archived': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPolicyTypeColor = (type: string) => {
    switch (type) {
      case 'access_control': return 'bg-blue-100 text-blue-800';
      case 'data_protection': return 'bg-purple-100 text-purple-800';
      case 'network_security': return 'bg-green-100 text-green-800';
      case 'incident_response': return 'bg-red-100 text-red-800';
      case 'business_continuity': return 'bg-orange-100 text-orange-800';
      case 'vendor_management': return 'bg-indigo-100 text-indigo-800';
      case 'acceptable_use': return 'bg-yellow-100 text-yellow-800';
      case 'password': return 'bg-pink-100 text-pink-800';
      case 'encryption': return 'bg-teal-100 text-teal-800';
      case 'backup': return 'bg-cyan-100 text-cyan-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'technical': return 'bg-blue-100 text-blue-800';
      case 'administrative': return 'bg-green-100 text-green-800';
      case 'physical': return 'bg-orange-100 text-orange-800';
      case 'organizational': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isPolicyDueForReview = (policy: ITSecurityPolicy) => {
    if (!policy.next_review_date) return false;
    const reviewDate = new Date(policy.next_review_date);
    const today = new Date();
    return reviewDate <= today;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadPolicies}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">IT Security Policies</h1>
          <p className="text-gray-600 mt-2">
            Manage and maintain IT security policies and procedures
          </p>
        </div>
        <Button onClick={() => navigate('/it-security/policies/create')}>
          <Plus className="h-4 w-4 mr-2" />
          New Policy
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Search & Filters</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search policies..."
                className="pl-10"
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                <div>
                  <Label>Status</Label>
                  <select
                    className="w-full mt-1 p-2 border rounded-md"
                    onChange={(e) => handleFilter({ status: e.target.value ? [e.target.value] : [] })}
                  >
                    <option value="">All Statuses</option>
                    <option value="draft">Draft</option>
                    <option value="review">Review</option>
                    <option value="approved">Approved</option>
                    <option value="active">Active</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                <div>
                  <Label>Policy Type</Label>
                  <select
                    className="w-full mt-1 p-2 border rounded-md"
                    onChange={(e) => handleFilter({ type: e.target.value ? [e.target.value] : [] })}
                  >
                    <option value="">All Types</option>
                    <option value="access_control">Access Control</option>
                    <option value="data_protection">Data Protection</option>
                    <option value="network_security">Network Security</option>
                    <option value="incident_response">Incident Response</option>
                    <option value="business_continuity">Business Continuity</option>
                    <option value="vendor_management">Vendor Management</option>
                    <option value="acceptable_use">Acceptable Use</option>
                    <option value="password">Password</option>
                    <option value="encryption">Encryption</option>
                    <option value="backup">Backup</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <Label>Category</Label>
                  <select
                    className="w-full mt-1 p-2 border rounded-md"
                    onChange={(e) => handleFilter({ category: e.target.value ? [e.target.value] : [] })}
                  >
                    <option value="">All Categories</option>
                    <option value="technical">Technical</option>
                    <option value="administrative">Administrative</option>
                    <option value="physical">Physical</option>
                    <option value="organizational">Organizational</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total Policies</p>
                <p className="text-2xl font-bold">{totalItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold">
                  {policies.filter(p => p.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Due for Review</p>
                <p className="text-2xl font-bold">
                  {policies.filter(p => isPolicyDueForReview(p)).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-purple-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">In Review</p>
                <p className="text-2xl font-bold">
                  {policies.filter(p => p.status === 'review').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Policies List */}
      <Card>
        <CardHeader>
          <CardTitle>Policies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {policies.map((policy) => (
              <div
                key={policy.id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">{policy.title}</h3>
                      <Badge className={getStatusColor(policy.status)}>
                        {policy.status}
                      </Badge>
                      <Badge className={getPolicyTypeColor(policy.policy_type)}>
                        {policy.policy_type.replace('_', ' ')}
                      </Badge>
                      <Badge className={getCategoryColor(policy.category)}>
                        {policy.category}
                      </Badge>
                      {isPolicyDueForReview(policy) && (
                        <Badge className="bg-red-100 text-red-800">
                          <Clock className="h-3 w-3 mr-1" />
                          Review Due
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-gray-600 mb-3">{policy.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <BookOpen className="h-4 w-4 mr-2" />
                        <span>Code: {policy.policy_code}</span>
                      </div>
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-2" />
                        <span>Version: {policy.version}</span>
                      </div>
                      {policy.effective_date && (
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>Effective: {new Date(policy.effective_date).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500 mt-2">
                      {policy.review_date && (
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>Last Review: {new Date(policy.review_date).toLocaleDateString()}</span>
                        </div>
                      )}
                      {policy.next_review_date && (
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2" />
                          <span>Next Review: {new Date(policy.next_review_date).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>

                    {policy.compliance_frameworks.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-700 mb-1">Compliance Frameworks:</p>
                        <div className="flex flex-wrap gap-1">
                          {policy.compliance_frameworks.map((framework, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {framework}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {policy.owner && (
                      <div className="mt-3 flex items-center text-sm text-gray-500">
                        <User className="h-4 w-4 mr-2" />
                        <span>Owner: {policy.owner.first_name} {policy.owner.last_name}</span>
                      </div>
                    )}

                    {policy.business_unit && (
                      <div className="mt-1 flex items-center text-sm text-gray-500">
                        <Building className="h-4 w-4 mr-2" />
                        <span>Business Unit: {policy.business_unit.name}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/it-security/policies/${policy.id}`)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/it-security/policies/${policy.id}/edit`)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(policy.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {policies.length === 0 && (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No policies found</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-600">
                Showing {((searchParams.page || 1) - 1) * (searchParams.page_size || 20) + 1} to{' '}
                {Math.min((searchParams.page || 1) * (searchParams.page_size || 20), totalItems)} of {totalItems} results
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={searchParams.page === 1}
                  onClick={() => handlePageChange((searchParams.page || 1) - 1)}
                >
                  Previous
                </Button>
                <span className="text-sm">
                  Page {searchParams.page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={searchParams.page === totalPages}
                  onClick={() => handlePageChange((searchParams.page || 1) + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PoliciesList;
