import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Brain,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Database,
  Settings,
  ArrowUpDown,
  Download,
  RefreshCw,
  Calendar,
  Tag,
  Shield,
  Globe,
  Code,
  Cpu,
  Network,
  HardDrive,
  Monitor
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { aiGovernanceService } from '../../services/aiGovernanceService';
import { AIModel, AIGovernanceSearchParams } from '../../types/aiGovernance';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog';

const AIModelsList: React.FC = () => {
  const [models, setModels] = useState<AIModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useState<AIGovernanceSearchParams>({
    page: 1,
    page_size: 10
  });
  const [totalPages, setTotalPages] = useState(1);
  const [totalModels, setTotalModels] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingModel, setDeletingModel] = useState<AIModel | null>(null);

  // Filter states
  const [filters, setFilters] = useState({
    model_type: '',
    provider: '',
    risk_level: '',
    compliance_status: '',
    deployment_environment: '',
    business_unit: '',
    owner: ''
  });

  useEffect(() => {
    loadModels();
  }, [searchParams]);

  const loadModels = async () => {
    try {
      setLoading(true);
      const response = await aiGovernanceService.getAIModels(searchParams);
      setModels(response.data);
      setTotalPages(response.totalPages);
      setTotalModels(response.total);
    } catch (error) {
      console.error('Error loading AI models:', error);
      toast.error('Failed to load AI models');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchParams(prev => ({
      ...prev,
      query,
      page: 1
    }));
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const applyFilters = () => {
    const activeFilters: any = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        activeFilters[key] = [value];
      }
    });

    setSearchParams(prev => ({
      ...prev,
      filters: activeFilters,
      page: 1
    }));
  };

  const clearFilters = () => {
    setFilters({
      model_type: '',
      provider: '',
      risk_level: '',
      compliance_status: '',
      deployment_environment: '',
      business_unit: '',
      owner: ''
    });
    setSearchParams(prev => ({
      ...prev,
      filters: undefined,
      page: 1
    }));
  };

  const handleSort = (field: string) => {
    setSearchParams(prev => ({
      ...prev,
      sort_by: field,
      sort_order: prev.sort_order === 'asc' ? 'desc' : 'asc',
      page: 1
    }));
  };

  const handlePageChange = (page: number) => {
    setSearchParams(prev => ({
      ...prev,
      page
    }));
  };

  const handleDeleteModel = async (model: AIModel) => {
    try {
      setDeletingModel(model);
      const response = await aiGovernanceService.deleteAIModel(model.id);
      if (response.success) {
        toast.success('AI model deleted successfully');
        loadModels();
      } else {
        toast.error(response.message || 'Failed to delete AI model');
      }
    } catch (error) {
      console.error('Error deleting AI model:', error);
      toast.error('Failed to delete AI model');
    } finally {
      setDeletingModel(null);
      setShowDeleteDialog(false);
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getComplianceStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'bg-green-100 text-green-800';
      case 'non_compliant': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'under_review': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getModelTypeIcon = (type: string) => {
    switch (type) {
      case 'llm': return <Brain className="h-4 w-4" />;
      case 'ml': return <Cpu className="h-4 w-4" />;
      case 'nlp': return <Code className="h-4 w-4" />;
      case 'computer_vision': return <Eye className="h-4 w-4" />;
      case 'recommendation': return <Network className="h-4 w-4" />;
      default: return <Database className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Models</h1>
          <p className="text-gray-600 mt-2">
            Manage and monitor AI models across the organization
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button onClick={loadModels} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Link to="/ai-governance/models/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Model
            </Button>
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search models by name, description, or provider..."
                  value={searchParams.query || ''}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t"
            >
              <div>
                <Label>Model Type</Label>
                <Select value={filters.model_type} onValueChange={(value) => handleFilterChange('model_type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    <SelectItem value="llm">LLM</SelectItem>
                    <SelectItem value="ml">Machine Learning</SelectItem>
                    <SelectItem value="nlp">NLP</SelectItem>
                    <SelectItem value="computer_vision">Computer Vision</SelectItem>
                    <SelectItem value="recommendation">Recommendation</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Provider</Label>
                <Select value={filters.provider} onValueChange={(value) => handleFilterChange('provider', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All providers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All providers</SelectItem>
                    <SelectItem value="openai">OpenAI</SelectItem>
                    <SelectItem value="anthropic">Anthropic</SelectItem>
                    <SelectItem value="google">Google</SelectItem>
                    <SelectItem value="meta">Meta</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Risk Level</Label>
                <Select value={filters.risk_level} onValueChange={(value) => handleFilterChange('risk_level', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All levels</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Compliance Status</Label>
                <Select value={filters.compliance_status} onValueChange={(value) => handleFilterChange('compliance_status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="compliant">Compliant</SelectItem>
                    <SelectItem value="non_compliant">Non-Compliant</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Environment</Label>
                <Select value={filters.deployment_environment} onValueChange={(value) => handleFilterChange('deployment_environment', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All environments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All environments</SelectItem>
                    <SelectItem value="development">Development</SelectItem>
                    <SelectItem value="staging">Staging</SelectItem>
                    <SelectItem value="production">Production</SelectItem>
                    <SelectItem value="research">Research</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end space-x-2">
                <Button onClick={applyFilters} className="flex-1">
                  Apply Filters
                </Button>
                <Button onClick={clearFilters} variant="outline">
                  Clear
                </Button>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Showing {models.length} of {totalModels} models
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Models Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('name')}
                    className="flex items-center space-x-1"
                  >
                    <span>Model</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Environment</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('risk_level')}
                    className="flex items-center space-x-1"
                  >
                    <span>Risk Level</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('compliance_status')}
                    className="flex items-center space-x-1"
                  >
                    <span>Compliance</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('last_updated')}
                    className="flex items-center space-x-1"
                  >
                    <span>Last Updated</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="w-[50px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {models.map((model) => (
                <TableRow key={model.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        {getModelTypeIcon(model.model_type)}
                      </div>
                      <div>
                        <div className="font-medium">{model.name}</div>
                        <div className="text-sm text-gray-500">{model.description}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {model.model_type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="capitalize">
                      {model.provider}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={model.deployment_environment === 'production' ? 'default' : 'outline'}
                      className="capitalize"
                    >
                      {model.deployment_environment}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getRiskLevelColor(model.risk_level)}>
                      {model.risk_level}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getComplianceStatusColor(model.compliance_status)}>
                      {model.compliance_status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {model.owner ? (
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">
                          {model.owner.first_name} {model.owner.last_name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">Not assigned</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-500">
                      {formatDate(model.last_updated)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link to={`/ai-governance/models/${model.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to={`/ai-governance/models/${model.id}/edit`}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Model
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            setDeletingModel(model);
                            setShowDeleteDialog(true);
                          }}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Model
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(searchParams.page! - 1)}
              disabled={searchParams.page === 1}
            >
              Previous
            </Button>
            <div className="text-sm">
              Page {searchParams.page} of {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(searchParams.page! + 1)}
              disabled={searchParams.page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete AI Model</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deletingModel?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deletingModel && handleDeleteModel(deletingModel)}
              disabled={!deletingModel}
            >
              {deletingModel ? 'Delete' : 'Deleting...'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AIModelsList;
