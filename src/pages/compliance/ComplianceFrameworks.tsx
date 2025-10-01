import React, { useState, useEffect } from "react";
import {
  Shield,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Settings,
  BarChart3,
  CheckCircle,
  AlertCircle,
  XCircle,
  Clock,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../components/ui/dropdown-menu";
import { ComplianceFrameworkService } from "../../services/complianceFrameworkService";
import type { ComplianceFramework, ComplianceProfile, ComplianceSnapshot } from "../../services/complianceFrameworkService";
import ComplianceFrameworkDialog from "../../components/compliance/ComplianceFrameworkDialog";
import ComplianceRequirementManager from "../../components/compliance/ComplianceRequirementManager";
import ComplianceMappingMatrix from "../../components/compliance/ComplianceMappingMatrix";
import ComplianceAnalytics from "../../components/compliance/ComplianceAnalytics";

const ComplianceFrameworks: React.FC = () => {
  const [frameworks, setFrameworks] = useState<ComplianceFramework[]>([]);
  const [profiles, setProfiles] = useState<ComplianceProfile[]>([]);
  const [snapshots, setSnapshots] = useState<ComplianceSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFramework, setSelectedFramework] = useState<ComplianceFramework | null>(null);
  const [showFrameworkDialog, setShowFrameworkDialog] = useState(false);
  const [editingFramework, setEditingFramework] = useState<ComplianceFramework | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [frameworksResult, profilesResult] = await Promise.all([
        ComplianceFrameworkService.listFrameworks(),
        ComplianceFrameworkService.listProfiles(),
      ]);

      if (frameworksResult.data) {
        setFrameworks(frameworksResult.data as ComplianceFramework[]);
      }
      if (profilesResult.data) {
        setProfiles(profilesResult.data as ComplianceProfile[]);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredFrameworks = frameworks.filter((framework) =>
    framework.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    framework.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    framework.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getFrameworkStats = (frameworkId: string) => {
    const frameworkProfiles = profiles.filter(p => p.framework_id === frameworkId);
    const activeProfiles = frameworkProfiles.filter(p => p.is_active);
    const inactiveProfiles = frameworkProfiles.filter(p => !p.is_active);
    
    return {
      totalProfiles: frameworkProfiles.length,
      activeProfiles: activeProfiles.length,
      inactiveProfiles: inactiveProfiles.length,
    };
  };

  const handleCreateFramework = () => {
    setEditingFramework(null);
    setShowFrameworkDialog(true);
  };

  const handleEditFramework = (framework: ComplianceFramework) => {
    setEditingFramework(framework);
    setShowFrameworkDialog(true);
  };

  const handleDeleteFramework = async (framework: ComplianceFramework) => {
    if (window.confirm(`Are you sure you want to delete "${framework.name}"?`)) {
      try {
        await ComplianceFrameworkService.deleteFramework(framework.id);
        await loadData();
      } catch (error) {
        console.error("Error deleting framework:", error);
        alert("Error deleting framework");
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'security': return <Shield className="h-4 w-4" />;
      case 'privacy': return <Eye className="h-4 w-4" />;
      case 'financial': return <BarChart3 className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Compliance Framework Management</h1>
          <p className="text-gray-600 mt-2">
            Manage compliance frameworks, requirements, and assessments across multiple standards
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button onClick={handleCreateFramework}>
            <Plus className="h-4 w-4 mr-2" />
            New Framework
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search frameworks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="frameworks" className="space-y-6">
        <TabsList>
          <TabsTrigger value="frameworks">Frameworks</TabsTrigger>
          <TabsTrigger value="requirements">Requirements</TabsTrigger>
          <TabsTrigger value="mappings">Mappings</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="frameworks" className="space-y-6">
          {/* Framework Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFrameworks.map((framework) => {
              const stats = getFrameworkStats(framework.id);
              return (
                <Card key={framework.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        {getCategoryIcon(framework.category || '')}
                        <div>
                          <CardTitle className="text-lg">{framework.name}</CardTitle>
                          <CardDescription className="text-sm text-gray-500">
                            {framework.code} • v{framework.version || '1.0'}
                          </CardDescription>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditFramework(framework)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setSelectedFramework(framework)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteFramework(framework)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {framework.description || 'No description available'}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <Badge className={getStatusColor(framework.is_active ? 'active' : 'inactive')}>
                          {framework.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        {framework.category && (
                          <Badge variant="outline" className="text-xs">
                            {framework.category}
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <div className="text-lg font-semibold">{stats.totalProfiles}</div>
                          <div className="text-xs text-gray-500">Profiles</div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-green-600">{stats.activeProfiles}</div>
                          <div className="text-xs text-gray-500">Active</div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-gray-600">{stats.inactiveProfiles}</div>
                          <div className="text-xs text-gray-500">Inactive</div>
                        </div>
                      </div>

                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => setSelectedFramework(framework)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredFrameworks.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No frameworks found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm ? 'No frameworks match your search criteria.' : 'Get started by creating your first compliance framework.'}
                </p>
                <Button onClick={handleCreateFramework}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Framework
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="requirements">
          {selectedFramework ? (
            <ComplianceRequirementManager frameworkId={selectedFramework.id} />
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Framework</h3>
                <p className="text-gray-600">
                  Choose a framework from the Frameworks tab to view and manage its requirements.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="mappings">
          {selectedFramework ? (
            <ComplianceMappingMatrix frameworkId={selectedFramework.id} />
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Framework</h3>
                <p className="text-gray-600">
                  Choose a framework from the Frameworks tab to view and manage its mappings.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analytics">
          {selectedFramework ? (
            <ComplianceAnalytics frameworkId={selectedFramework.id} />
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Framework</h3>
                <p className="text-gray-600">
                  Choose a framework from the Frameworks tab to view its analytics and reports.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Framework Dialog */}
      {showFrameworkDialog && (
        <ComplianceFrameworkDialog
          framework={editingFramework}
          onClose={() => {
            setShowFrameworkDialog(false);
            setEditingFramework(null);
          }}
          onSave={() => {
            loadData();
            setShowFrameworkDialog(false);
            setEditingFramework(null);
          }}
        />
      )}
    </div>
  );
};

export default ComplianceFrameworks;
