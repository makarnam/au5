import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
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
  Brain,
  Globe,
  Code,
  Cpu,
  Network,
  HardDrive,
  Monitor,
  FileText,
  Target,
  Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { aiGovernanceService } from '../../services/aiGovernanceService';
import { AIControl, AIGovernanceSearchParams } from '../../types/aiGovernance';
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

const AIControlsList: React.FC = () => {
  const [controls, setControls] = useState<AIControl[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useState<AIGovernanceSearchParams>({
    page: 1,
    page_size: 10
  });
  const [totalPages, setTotalPages] = useState(1);
  const [totalControls, setTotalControls] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedControl, setSelectedControl] = useState<AIControl | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingControl, setDeletingControl] = useState<AIControl | null>(null);

  // Filter states
  const [filters, setFilters] = useState({
    control_type: '',
    category: '',
    risk_level: '',
    framework: '',
    frequency: ''
  });

  useEffect(() => {
    loadControls();
  }, [searchParams]);

  const loadControls = async () => {
    try {
      setLoading(true);
      const response = await aiGovernanceService.getAIControls(searchParams);
      setControls(response.data);
      setTotalPages(response.totalPages);
      setTotalControls(response.total);
    } catch (error) {
      console.error('Error loading AI controls:', error);
      toast.error('Failed to load AI controls');
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
      control_type: '',
      category: '',
      risk_level: '',
      framework: '',
      frequency: ''
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

  const handleDeleteControl = async (control: AIControl) => {
    try {
      setDeletingControl(control);
      const response = await aiGovernanceService.deleteAIControl(control.id);
      if (response.success) {
        toast.success('AI control deleted successfully');
        loadControls();
      } else {
        toast.error(response.message || 'Failed to delete AI control');
      }
    } catch (error) {
      console.error('Error deleting AI control:', error);
      toast.error('Failed to delete AI control');
    } finally {
      setDeletingControl(null);
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

  const getControlTypeIcon = (type: string) => {
    switch (type) {
      case 'preventive': return <Shield className="h-4 w-4" />;
      case 'detective': return <Eye className="h-4 w-4" />;
      case 'corrective': return <Target className="h-4 w-4" />;
      case 'directive': return <FileText className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'data_governance': return <Database className="h-4 w-4" />;
      case 'model_governance': return <Brain className="h-4 w-4" />;
      case 'deployment_governance': return <Network className="h-4 w-4" />;
      case 'monitoring': return <Monitor className="h-4 w-4" />;
      case 'compliance': return <Globe className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
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
          <h1 className="text-3xl font-bold text-gray-900">AI Controls Library</h1>
          <p className="text-gray-600 mt-2">
            Manage and implement AI governance controls
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button onClick={loadControls} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Link to="/ai-governance/controls/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Control
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
                  placeholder="Search controls by code, title, or description..."
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
                <Label>Control Type</Label>
                <Select value={filters.control_type} onValueChange={(value) => handleFilterChange('control_type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All types</SelectItem>
                    <SelectItem value="preventive">Preventive</SelectItem>
                    <SelectItem value="detective">Detective</SelectItem>
                    <SelectItem value="corrective">Corrective</SelectItem>
                    <SelectItem value="directive">Directive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Category</Label>
                <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All categories</SelectItem>
                    <SelectItem value="data_governance">Data Governance</SelectItem>
                    <SelectItem value="model_governance">Model Governance</SelectItem>
                    <SelectItem value="deployment_governance">Deployment Governance</SelectItem>
                    <SelectItem value="monitoring">Monitoring</SelectItem>
                    <SelectItem value="compliance">Compliance</SelectItem>
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
                    <SelectItem value="">All levels</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Framework</Label>
                <Select value={filters.framework} onValueChange={(value) => handleFilterChange('framework', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All frameworks" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All frameworks</SelectItem>
                    <SelectItem value="eu_ai_act">EU AI Act</SelectItem>
                    <SelectItem value="nist_ai_rmf">NIST AI RMF</SelectItem>
                    <SelectItem value="iso_42001">ISO 42001</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Frequency</Label>
                <Select value={filters.frequency} onValueChange={(value) => handleFilterChange('frequency', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All frequencies" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All frequencies</SelectItem>
                    <SelectItem value="continuous">Continuous</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="annually">Annually</SelectItem>
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
          Showing {controls.length} of {totalControls} controls
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Controls Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('control_code')}
                    className="flex items-center space-x-1"
                  >
                    <span>Control Code</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('title')}
                    className="flex items-center space-x-1"
                  >
                    <span>Title</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Framework</TableHead>
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
                <TableHead>Frequency</TableHead>
                <TableHead>Automated</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('created_at')}
                    className="flex items-center space-x-1"
                  >
                    <span>Created</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="w-[50px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {controls.map((control) => (
                <TableRow key={control.id}>
                  <TableCell>
                    <div className="font-mono text-sm font-medium">
                      {control.control_code}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{control.title}</div>
                      <div className="text-sm text-gray-500 line-clamp-2">
                        {control.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div className="p-1 bg-blue-100 rounded">
                        {getControlTypeIcon(control.control_type)}
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {control.control_type}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div className="p-1 bg-green-100 rounded">
                        {getCategoryIcon(control.category)}
                      </div>
                      <Badge variant="secondary" className="capitalize">
                        {control.category.replace('_', ' ')}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    {control.framework ? (
                      <Badge variant="outline" className="capitalize">
                        {control.framework.replace('_', ' ')}
                      </Badge>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={getRiskLevelColor(control.risk_level)}>
                      {control.risk_level}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {control.frequency}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {control.is_automated ? (
                      <Badge className="bg-green-100 text-green-800">
                        <Zap className="h-3 w-3 mr-1" />
                        Automated
                      </Badge>
                    ) : (
                      <Badge variant="outline">Manual</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-500">
                      {formatDate(control.created_at)}
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
                          <Link to={`/ai-governance/controls/${control.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to={`/ai-governance/controls/${control.id}/edit`}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Control
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            setDeletingControl(control);
                            setShowDeleteDialog(true);
                          }}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Control
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
            <DialogTitle>Delete AI Control</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deletingControl?.title}"? This action cannot be undone.
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
              onClick={() => deletingControl && handleDeleteControl(deletingControl)}
              disabled={!deletingControl}
            >
              {deletingControl ? 'Delete' : 'Deleting...'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AIControlsList;
