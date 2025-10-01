import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Filter,
  Link,
  Unlink,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  BarChart3,
  Shield,
  FileText,
  AlertTriangle,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { ComplianceFrameworkService } from "../../services/complianceFrameworkService";
import type { ComplianceRequirement, ComplianceMapping } from "../../services/complianceFrameworkService";
import ComplianceMappingDialog from "./ComplianceMappingDialog";

interface ComplianceMappingMatrixProps {
  frameworkId: string;
}

const ComplianceMappingMatrix: React.FC<ComplianceMappingMatrixProps> = ({
  frameworkId,
}) => {
  const [requirements, setRequirements] = useState<ComplianceRequirement[]>([]);
  const [mappings, setMappings] = useState<ComplianceMapping[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEntityType, setSelectedEntityType] = useState<string>("all");
  const [selectedRequirement, setSelectedRequirement] = useState<ComplianceRequirement | null>(null);
  const [showMappingDialog, setShowMappingDialog] = useState(false);
  const [editingMapping, setEditingMapping] = useState<ComplianceMapping | null>(null);

  useEffect(() => {
    loadData();
  }, [frameworkId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const requirementsResult = await ComplianceFrameworkService.listRequirements(frameworkId);
      if (requirementsResult.data) {
        setRequirements(requirementsResult.data as ComplianceRequirement[]);
      }
    } catch (error) {
      console.error("Error loading mappings:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMappingsForRequirement = async (requirementId: string) => {
    try {
      const result = await ComplianceFrameworkService.listMappings(requirementId);
      if (result.data) {
        setMappings(result.data as ComplianceMapping[]);
      }
    } catch (error) {
      console.error("Error loading mappings:", error);
    }
  };

  const filteredRequirements = requirements.filter((requirement) =>
    requirement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    requirement.requirement_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getEntityTypeIcon = (entityType: string) => {
    switch (entityType) {
      case 'risk': return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'control': return <Shield className="h-4 w-4 text-blue-600" />;
      case 'policy': return <FileText className="h-4 w-4 text-green-600" />;
      case 'process': return <BarChart3 className="h-4 w-4 text-purple-600" />;
      case 'asset': return <Shield className="h-4 w-4 text-indigo-600" />;
      default: return <Link className="h-4 w-4 text-gray-600" />;
    }
  };

  const getMappingTypeColor = (mappingType: string | null) => {
    switch (mappingType) {
      case 'direct': return 'bg-green-100 text-green-800';
      case 'indirect': return 'bg-yellow-100 text-yellow-800';
      case 'supporting': return 'bg-blue-100 text-blue-800';
      case 'compensating': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMappingStrengthColor = (strength: string | null) => {
    switch (strength) {
      case 'complete': return 'bg-green-100 text-green-800';
      case 'strong': return 'bg-blue-100 text-blue-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'weak': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCreateMapping = (requirement: ComplianceRequirement) => {
    setSelectedRequirement(requirement);
    setEditingMapping(null);
    setShowMappingDialog(true);
  };

  const handleEditMapping = (mapping: ComplianceMapping) => {
    setEditingMapping(mapping);
    setShowMappingDialog(true);
  };

  const handleDeleteMapping = async (mapping: ComplianceMapping) => {
    if (window.confirm("Are you sure you want to delete this mapping?")) {
      try {
        await ComplianceFrameworkService.deleteMapping(mapping.id);
        if (selectedRequirement) {
          await loadMappingsForRequirement(selectedRequirement.id);
        }
      } catch (error) {
        console.error("Error deleting mapping:", error);
        alert("Error deleting mapping");
      }
    }
  };

  const handleRequirementClick = async (requirement: ComplianceRequirement) => {
    setSelectedRequirement(requirement);
    await loadMappingsForRequirement(requirement.id);
  };

  const getMappingStats = () => {
    const totalMappings = mappings.length;
    const directMappings = mappings.filter(m => m.mapping_type === 'direct').length;
    const completeCoverage = mappings.filter(m => m.mapping_strength === 'complete').length;
    
    return {
      totalMappings,
      directMappings,
      completeCoverage,
      coveragePercentage: totalMappings > 0 ? Math.round((completeCoverage / totalMappings) * 100) : 0,
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const stats = getMappingStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Compliance Mapping Matrix</h2>
          <p className="text-gray-600 mt-1">
            Map compliance requirements to risks, controls, policies, and other entities
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <BarChart3 className="h-4 w-4 mr-2" />
            Export Matrix
          </Button>
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Bulk Mapping
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search requirements..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="min-w-[150px]">
          <select
            value={selectedEntityType}
            onChange={(e) => setSelectedEntityType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Entity Types</option>
            <option value="risk">Risks</option>
            <option value="control">Controls</option>
            <option value="policy">Policies</option>
            <option value="process">Processes</option>
            <option value="asset">Assets</option>
          </select>
        </div>

        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          More Filters
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Requirements</p>
                <p className="text-2xl font-bold text-gray-900">{requirements.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Mappings</p>
                <p className="text-2xl font-bold text-green-600">{stats.totalMappings}</p>
              </div>
              <Link className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Direct Mappings</p>
                <p className="text-2xl font-bold text-blue-600">{stats.directMappings}</p>
              </div>
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Complete Coverage</p>
                <p className="text-2xl font-bold text-purple-600">{stats.coveragePercentage}%</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Requirements List */}
        <Card>
          <CardHeader>
            <CardTitle>Requirements</CardTitle>
            <CardDescription>
              Select a requirement to view and manage its mappings
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredRequirements.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No requirements found</h3>
                <p className="text-gray-600">
                  {searchTerm ? "No requirements match your search criteria." : "No requirements available."}
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredRequirements.map((requirement) => (
                  <div
                    key={requirement.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedRequirement?.id === requirement.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => handleRequirementClick(requirement)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{requirement.title}</div>
                        <div className="text-xs text-gray-500 font-mono">
                          {requirement.requirement_code}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCreateMapping(requirement);
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Mappings List */}
        <Card>
          <CardHeader>
            <CardTitle>Mappings</CardTitle>
            <CardDescription>
              {selectedRequirement 
                ? `Mappings for ${selectedRequirement.title}`
                : "Select a requirement to view its mappings"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!selectedRequirement ? (
              <div className="text-center py-8">
                <Link className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Requirement</h3>
                <p className="text-gray-600">
                  Choose a requirement from the left to view and manage its mappings.
                </p>
              </div>
            ) : mappings.length === 0 ? (
              <div className="text-center py-8">
                <Link className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Mappings</h3>
                <p className="text-gray-600 mb-4">
                  This requirement doesn't have any mappings yet.
                </p>
                <Button onClick={() => handleCreateMapping(selectedRequirement)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Mapping
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {mappings.map((mapping) => (
                  <div key={mapping.id} className="p-3 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        {getEntityTypeIcon(mapping.entity_type)}
                        <div className="flex-1">
                          <div className="font-medium text-sm capitalize">
                            {mapping.entity_type} Entity
                          </div>
                          <div className="text-xs text-gray-500">
                            ID: {mapping.entity_id}
                          </div>
                          {mapping.notes && (
                            <div className="text-xs text-gray-600 mt-1">
                              {mapping.notes}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {mapping.mapping_type && (
                          <Badge className={getMappingTypeColor(mapping.mapping_type)}>
                            {mapping.mapping_type}
                          </Badge>
                        )}
                        {mapping.mapping_strength && (
                          <Badge className={getMappingStrengthColor(mapping.mapping_strength)}>
                            {mapping.mapping_strength}
                          </Badge>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditMapping(mapping)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteMapping(mapping)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    {mapping.coverage_percentage && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                          <span>Coverage</span>
                          <span>{mapping.coverage_percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1">
                          <div 
                            className="bg-blue-600 h-1 rounded-full"
                            style={{ width: `${mapping.coverage_percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Mapping Dialog */}
      {showMappingDialog && selectedRequirement && (
        <ComplianceMappingDialog
          mapping={editingMapping}
          requirementId={selectedRequirement.id}
          onClose={() => {
            setShowMappingDialog(false);
            setEditingMapping(null);
          }}
          onSave={() => {
            if (selectedRequirement) {
              loadMappingsForRequirement(selectedRequirement.id);
            }
            setShowMappingDialog(false);
            setEditingMapping(null);
          }}
        />
      )}
    </div>
  );
};

export default ComplianceMappingMatrix;
