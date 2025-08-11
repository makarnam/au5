import React, { useState, useEffect } from "react";
import {
  FileText,
  Upload,
  Archive,
  BarChart3,
  Clock,
  AlertTriangle,
  Grid,
  List,
  RefreshCw,
  Eye,
  Download,
  Share2,
  MoreHorizontal,
  File,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { documentManagementService } from "../../services/documentManagementService";
import {
  Document,
  DocumentCategory,
  DocumentTag,
  DocumentSearchFilters,
  DocumentDashboardStats,
  DocumentAnalytics,
} from "../../types/documentManagement";
import { formatBytes, formatDate } from "../../utils/displayUtils";

const DocumentManagement: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [categories, setCategories] = useState<DocumentCategory[]>([]);
  const [tags, setTags] = useState<DocumentTag[]>([]);
  const [stats, setStats] = useState<DocumentDashboardStats | null>(null);
  const [analytics, setAnalytics] = useState<DocumentAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchFilters, setSearchFilters] = useState<DocumentSearchFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    searchDocuments();
  }, [searchFilters, currentPage]);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('Loading document management data...');
      
      // Load data with individual error handling
      let categoriesData: DocumentCategory[] = [];
      let tagsData: DocumentTag[] = [];
      let statsData: DocumentDashboardStats | null = null;
      let analyticsData: DocumentAnalytics | null = null;

      try {
        categoriesData = await documentManagementService.getCategories();
        console.log('Categories loaded:', categoriesData.length);
      } catch (error) {
        console.error('Error loading categories:', error);
      }

      try {
        tagsData = await documentManagementService.getTags();
        console.log('Tags loaded:', tagsData.length);
      } catch (error) {
        console.error('Error loading tags:', error);
      }

      try {
        statsData = await documentManagementService.getDashboardStats();
        console.log('Stats loaded:', statsData);
      } catch (error) {
        console.error('Error loading stats:', error);
      }

      try {
        analyticsData = await documentManagementService.getAnalytics();
        console.log('Analytics loaded:', analyticsData);
      } catch (error) {
        console.error('Error loading analytics:', error);
      }

      setCategories(categoriesData);
      setTags(tagsData);
      setStats(statsData);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchDocuments = async () => {
    try {
      console.log('Searching documents with filters:', searchFilters);
      const result = await documentManagementService.searchDocuments(searchFilters, currentPage, 20);
      console.log('Search results:', result);
      setDocuments(result.documents);
      setTotalPages(result.total_pages);
    } catch (error) {
      console.error('Error searching documents:', error);
      // Set empty results on error
      setDocuments([]);
      setTotalPages(1);
    }
  };

  const handleFilterChange = (key: keyof DocumentSearchFilters, value: any) => {
    setSearchFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleDocumentSelect = (documentId: string) => {
    setSelectedDocuments(prev => 
      prev.includes(documentId) 
        ? prev.filter(id => id !== documentId)
        : [...prev, documentId]
    );
  };

  const handleSelectAll = () => {
    if (selectedDocuments.length === documents.length) {
      setSelectedDocuments([]);
    } else {
      setSelectedDocuments(documents.map(doc => doc.id));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'archived': return 'bg-blue-100 text-blue-800';
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



  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading Document Management System...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Document Management</h1>
          <p className="text-muted-foreground">
            Comprehensive document management solution for audit evidence, compliance documentation, and organizational knowledge
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
            {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
          </Button>
          <Button>
            <Upload className="h-4 w-4 mr-2" />
            Upload Document
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_documents.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {stats.recent_uploads} uploaded this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending_approvals}</div>
              <p className="text-xs text-muted-foreground">
                Require attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
              <Archive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatBytes(stats.storage_used)}</div>
              <p className="text-xs text-muted-foreground">
                {((stats.storage_used / stats.storage_limit) * 100).toFixed(1)}% of limit
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Processing</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.ai_processing_queue}</div>
              <p className="text-xs text-muted-foreground">
                In queue
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <Input
                placeholder="Search documents..."
                value={searchFilters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select
                value={searchFilters.category_id || 'all'}
                onValueChange={(value) => handleFilterChange('category_id', value === 'all' ? undefined : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem key="all-categories" value="all">All categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={searchFilters.status?.[0] || 'all'}
                onValueChange={(value) => handleFilterChange('status', value === 'all' ? undefined : [value])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem key="all-statuses" value="all">All statuses</SelectItem>
                  <SelectItem key="draft" value="draft">Draft</SelectItem>
                  <SelectItem key="review" value="review">Review</SelectItem>
                  <SelectItem key="approved" value="approved">Approved</SelectItem>
                  <SelectItem key="archived" value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Priority</label>
              <Select
                value={searchFilters.priority?.[0] || 'all'}
                onValueChange={(value) => handleFilterChange('priority', value === 'all' ? undefined : [value])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem key="all-priorities" value="all">All priorities</SelectItem>
                  <SelectItem key="low" value="low">Low</SelectItem>
                  <SelectItem key="medium" value="medium">Medium</SelectItem>
                  <SelectItem key="high" value="high">High</SelectItem>
                  <SelectItem key="critical" value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents List/Grid */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Documents</CardTitle>
              <CardDescription>
                {documents.length} documents found
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              {selectedDocuments.length > 0 && (
                <Badge variant="secondary">
                  {selectedDocuments.length} selected
                </Badge>
              )}
              <Button variant="outline" size="sm" onClick={handleSelectAll}>
                {selectedDocuments.length === documents.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {documents.map((document) => (
                <Card key={document.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <File className="h-4 w-4 text-blue-500" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{document.title}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {document.file_name}
                          </p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={selectedDocuments.includes(document.id)}
                        onChange={() => handleDocumentSelect(document.id)}
                        className="ml-2"
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Size</span>
                        <span>{formatBytes(document.file_size)}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Type</span>
                        <span className="uppercase">{document.file_type}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Created</span>
                        <span>{formatDate(document.created_at)}</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        <Badge className={getStatusColor(document.status)} variant="secondary">
                          {document.status}
                        </Badge>
                        <Badge className={getPriorityColor(document.priority)} variant="secondary">
                          {document.priority}
                        </Badge>
                      </div>
                      {document.category && (
                        <Badge variant="outline" className="text-xs">
                          {document.category.name}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-2 border-t">
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Share2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={selectedDocuments.length === documents.length && documents.length > 0}
                      onChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Document</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((document) => (
                  <TableRow key={document.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedDocuments.includes(document.id)}
                        onChange={() => handleDocumentSelect(document.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{document.title}</div>
                        <div className="text-sm text-muted-foreground">{document.file_name}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {document.category ? (
                        <Badge variant="outline">{document.category.name}</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(document.status)} variant="secondary">
                        {document.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPriorityColor(document.priority)} variant="secondary">
                        {document.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatBytes(document.file_size)}</TableCell>
                    <TableCell>{formatDate(document.created_at)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Share2 className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analytics */}
      {analytics && (
        <Tabs defaultValue="trends" className="space-y-4">
          <TabsList>
            <TabsTrigger value="trends">Upload Trends</TabsTrigger>
            <TabsTrigger value="categories">Category Distribution</TabsTrigger>
            <TabsTrigger value="activity">User Activity</TabsTrigger>
            <TabsTrigger value="compliance">Compliance Coverage</TabsTrigger>
          </TabsList>

          <TabsContent value="trends" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Upload Trends (Last 30 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analytics.upload_trends.slice(-7).map((trend) => (
                    <div key={trend.date} className="flex items-center justify-between">
                      <span className="text-sm">{formatDate(trend.date)}</span>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm">{trend.count} documents</span>
                        <span className="text-sm text-muted-foreground">{formatBytes(trend.size)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Category Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analytics.category_distribution.map((category) => (
                    <div key={category.category_id} className="flex items-center justify-between">
                      <span className="text-sm">{category.category_name}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">{category.count} documents</span>
                        <span className="text-sm text-muted-foreground">
                          ({category.percentage.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analytics.user_activity.slice(0, 10).map((user) => (
                    <div key={user.user_id} className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium">{user.user_name}</span>
                        <span className="text-sm text-muted-foreground ml-2">({user.user_email})</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm">{user.documents_uploaded} uploaded</span>
                        <span className="text-sm">{user.documents_accessed} accessed</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compliance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Framework Coverage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analytics.compliance_coverage.map((framework) => (
                    <div key={framework.framework} className="flex items-center justify-between">
                      <span className="text-sm">{framework.framework}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">{framework.document_count} documents</span>
                        <span className="text-sm text-muted-foreground">
                          ({framework.coverage_percentage.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default DocumentManagement;
