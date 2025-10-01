import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  AlertCircle,
  XCircle,
  Clock,
  MoreHorizontal,
  Download,
  Upload,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { ComplianceFrameworkService } from "../../services/complianceFrameworkService";
import type { ComplianceRequirement, ComplianceSection } from "../../services/complianceFrameworkService";
import ComplianceRequirementDialog from "./ComplianceRequirementDialog";

interface ComplianceRequirementManagerProps {
  frameworkId: string;
}

const ComplianceRequirementManager: React.FC<ComplianceRequirementManagerProps> = ({
  frameworkId,
}) => {
  const [requirements, setRequirements] = useState<ComplianceRequirement[]>([]);
  const [sections, setSections] = useState<ComplianceSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSection, setSelectedSection] = useState<string>("all");
  const [selectedRequirement, setSelectedRequirement] = useState<ComplianceRequirement | null>(null);
  const [showRequirementDialog, setShowRequirementDialog] = useState(false);
  const [editingRequirement, setEditingRequirement] = useState<ComplianceRequirement | null>(null);

  useEffect(() => {
    loadData();
  }, [frameworkId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [requirementsResult, sectionsResult] = await Promise.all([
        ComplianceFrameworkService.listRequirements(frameworkId),
        ComplianceFrameworkService.listSections(frameworkId),
      ]);

      if (requirementsResult.data) {
        setRequirements(requirementsResult.data as ComplianceRequirement[]);
      }
      if (sectionsResult.data) {
        setSections(sectionsResult.data as ComplianceSection[]);
      }
    } catch (error) {
      console.error("Error loading requirements:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRequirements = requirements.filter((requirement) => {
    const matchesSearch = 
      requirement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      requirement.requirement_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      requirement.text.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSection = selectedSection === "all" || requirement.section_id === selectedSection;
    
    return matchesSearch && matchesSection;
  });

  const getSectionName = (sectionId: string | null) => {
    if (!sectionId) return "Unassigned";
    const section = sections.find(s => s.id === sectionId);
    return section ? `${section.section_code} - ${section.title}` : "Unknown Section";
  };

  const getPriorityColor = (priority: string | null) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getImplementationLevelColor = (level: string | null) => {
    switch (level) {
      case 'basic': return 'bg-blue-100 text-blue-800';
      case 'intermediate': return 'bg-purple-100 text-purple-800';
      case 'advanced': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCreateRequirement = () => {
    setEditingRequirement(null);
    setShowRequirementDialog(true);
  };

  const handleEditRequirement = (requirement: ComplianceRequirement) => {
    setEditingRequirement(requirement);
    setShowRequirementDialog(true);
  };

  const handleDeleteRequirement = async (requirement: ComplianceRequirement) => {
    if (window.confirm(`Are you sure you want to delete "${requirement.title}"?`)) {
      try {
        await ComplianceFrameworkService.deleteRequirement(requirement.id);
        await loadData();
      } catch (error) {
        console.error("Error deleting requirement:", error);
        alert("Error deleting requirement");
      }
    }
  };

  const handleViewRequirement = (requirement: ComplianceRequirement) => {
    setSelectedRequirement(requirement);
    // You could implement a view-only modal here
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
          <h2 className="text-2xl font-bold text-gray-900">Requirements Management</h2>
          <p className="text-gray-600 mt-1">
            Manage compliance requirements and their implementation details
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
          <Button onClick={handleCreateRequirement}>
            <Plus className="h-4 w-4 mr-2" />
            New Requirement
          </Button>
        </div>
      </div>

      {/* Filters */}
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
        
        <div className="min-w-[200px]">
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Sections</option>
            {sections.map((section) => (
              <option key={section.id} value={section.id}>
                {section.section_code} - {section.title}
              </option>
            ))}
            <option value="unassigned">Unassigned</option>
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
              <CheckCircle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Critical Priority</p>
                <p className="text-2xl font-bold text-red-600">
                  {requirements.filter(r => r.priority === 'critical').length}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Requirements</p>
                <p className="text-2xl font-bold text-green-600">
                  {requirements.filter(r => r.is_active).length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Sections</p>
                <p className="text-2xl font-bold text-purple-600">{sections.length}</p>
              </div>
              <Eye className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Requirements Table */}
      <Card>
        <CardHeader>
          <CardTitle>Requirements</CardTitle>
          <CardDescription>
            {filteredRequirements.length} of {requirements.length} requirements
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredRequirements.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No requirements found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || selectedSection !== "all" 
                  ? "No requirements match your search criteria." 
                  : "Get started by creating your first requirement."
                }
              </p>
              <Button onClick={handleCreateRequirement}>
                <Plus className="h-4 w-4 mr-2" />
                Create Requirement
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Section</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequirements.map((requirement) => (
                  <TableRow key={requirement.id}>
                    <TableCell className="font-mono text-sm">
                      {requirement.requirement_code}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{requirement.title}</div>
                        <div className="text-sm text-gray-500 line-clamp-1">
                          {requirement.description || requirement.text}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {getSectionName(requirement.section_id)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {requirement.priority && (
                        <Badge className={getPriorityColor(requirement.priority)}>
                          {requirement.priority}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {requirement.implementation_level && (
                        <Badge className={getImplementationLevelColor(requirement.implementation_level)}>
                          {requirement.implementation_level}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={requirement.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                        {requirement.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewRequirement(requirement)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditRequirement(requirement)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteRequirement(requirement)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Requirement Dialog */}
      {showRequirementDialog && (
        <ComplianceRequirementDialog
          requirement={editingRequirement}
          frameworkId={frameworkId}
          sections={sections}
          onClose={() => {
            setShowRequirementDialog(false);
            setEditingRequirement(null);
          }}
          onSave={() => {
            loadData();
            setShowRequirementDialog(false);
            setEditingRequirement(null);
          }}
        />
      )}
    </div>
  );
};

export default ComplianceRequirementManager;
