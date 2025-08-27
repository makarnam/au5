import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  Copy,
  Download,
  Upload,
  Search,
  Filter,
  Star,
  Eye,
  Settings,
  Sparkles,
} from "lucide-react";

import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

import { reportAIService, ReportTemplate } from "../services/reportAIService";

interface TemplateFormData {
  name: string;
  description: string;
  category: string;
  is_ai_enabled: boolean;
  ai_prompt_template?: string;
  export_formats: string[];
}

const TEMPLATE_CATEGORIES = [
  { value: "audit", label: "Audit Reports", color: "bg-blue-500" },
  { value: "risk", label: "Risk Assessment", color: "bg-red-500" },
  { value: "compliance", label: "Compliance", color: "bg-green-500" },
  { value: "executive", label: "Executive Dashboard", color: "bg-purple-500" },
  { value: "operational", label: "Operational", color: "bg-orange-500" },
];

const EXPORT_FORMATS = [
  { value: "pdf", label: "PDF Document" },
  { value: "excel", label: "Excel Spreadsheet" },
  { value: "word", label: "Word Document" },
  { value: "powerpoint", label: "PowerPoint Presentation" },
  { value: "html", label: "HTML Report" },
];

const ReportTemplateManager: React.FC = () => {
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ReportTemplate | null>(null);
  const [formData, setFormData] = useState<TemplateFormData>({
    name: "",
    description: "",
    category: "audit",
    is_ai_enabled: false,
    export_formats: ["pdf"],
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const templateList = await reportAIService.getTemplates();
      setTemplates(templateList);
    } catch (error) {
      console.error("Error loading templates:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async () => {
    try {
      const templateData = {
        ...formData,
        template_structure: {
          sections: [
            {
              type: "text",
              name: "Executive Summary",
              configuration: { ai_enabled: formData.is_ai_enabled },
            },
          ],
        },
        data_sources: [],
        parameters: {},
        regulatory_mappings: {},
        stakeholder_groups: [],
        created_by: "00000000-0000-0000-0000-000000000001", // Default user ID
      };

      const newTemplate = await reportAIService.createTemplate(templateData);
      if (newTemplate) {
        setTemplates([...templates, newTemplate]);
        setIsCreateDialogOpen(false);
        resetForm();
      }
    } catch (error) {
      console.error("Error creating template:", error);
    }
  };

  const handleUpdateTemplate = async () => {
    if (!editingTemplate) return;

    try {
      const updatedTemplate = await reportAIService.updateTemplate(editingTemplate.id, {
        ...formData,
        template_structure: editingTemplate.template_structure,
        data_sources: editingTemplate.data_sources,
        parameters: editingTemplate.parameters,
        regulatory_mappings: editingTemplate.regulatory_mappings,
        stakeholder_groups: editingTemplate.stakeholder_groups,
      });

      if (updatedTemplate) {
        setTemplates(templates.map(t => t.id === editingTemplate.id ? updatedTemplate : t));
        setEditingTemplate(null);
        resetForm();
      }
    } catch (error) {
      console.error("Error updating template:", error);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      const success = await reportAIService.deleteTemplate(templateId);
      if (success) {
        setTemplates(templates.filter(t => t.id !== templateId));
      }
    } catch (error) {
      console.error("Error deleting template:", error);
    }
  };

  const handleDuplicateTemplate = async (template: ReportTemplate) => {
    try {
      const duplicatedTemplate = await reportAIService.createTemplate({
        name: `${template.name} (Copy)`,
        description: template.description,
        category: template.category,
        template_structure: template.template_structure,
        data_sources: template.data_sources,
        parameters: template.parameters,
        export_formats: template.export_formats,
        is_ai_enabled: template.is_ai_enabled,
        ai_prompt_template: template.ai_prompt_template,
        regulatory_mappings: template.regulatory_mappings,
        stakeholder_groups: template.stakeholder_groups,
        created_by: template.created_by,
      });

      if (duplicatedTemplate) {
        setTemplates([...templates, duplicatedTemplate]);
      }
    } catch (error) {
      console.error("Error duplicating template:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      category: "audit",
      is_ai_enabled: false,
      export_formats: ["pdf"],
    });
  };

  const openEditDialog = (template: ReportTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      description: template.description || "",
      category: template.category,
      is_ai_enabled: template.is_ai_enabled || false,
      ai_prompt_template: template.ai_prompt_template || "",
      export_formats: template.export_formats || ["pdf"],
    });
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryInfo = (category: string) => {
    return TEMPLATE_CATEGORIES.find(cat => cat.value === category) || TEMPLATE_CATEGORIES[0];
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Report Templates</h1>
        <p className="text-gray-600">
          Create and manage reusable report templates with AI-powered content generation
        </p>
      </div>

      {/* Filters and Search */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {TEMPLATE_CATEGORIES.map(category => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Template
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Template</DialogTitle>
                </DialogHeader>
                <TemplateForm
                  formData={formData}
                  setFormData={setFormData}
                  onSubmit={handleCreateTemplate}
                  onCancel={() => {
                    setIsCreateDialogOpen(false);
                    resetForm();
                  }}
                  submitLabel="Create Template"
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading templates...</p>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
            <p className="text-gray-600">
              {searchTerm || selectedCategory !== "all"
                ? "Try adjusting your search or filter criteria"
                : "Create your first report template to get started"}
            </p>
          </div>
        ) : (
          filteredTemplates.map((template) => {
            const categoryInfo = getCategoryInfo(template.category);
            return (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">{template.name}</CardTitle>
                        <div className="flex items-center space-x-2 mb-3">
                          <Badge
                            className={`${categoryInfo.color} text-white`}
                            variant="secondary"
                          >
                            {categoryInfo.label}
                          </Badge>
                          {template.is_ai_enabled && (
                            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                              <Sparkles className="w-3 h-3 mr-1" />
                              AI Enabled
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDuplicateTemplate(template)}
                        title="Duplicate template"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {template.description || "No description provided"}
                    </p>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {template.export_formats?.slice(0, 3).map(format => (
                        <Badge key={format} variant="outline" className="text-xs">
                          {format.toUpperCase()}
                        </Badge>
                      ))}
                      {(template.export_formats?.length || 0) > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{(template.export_formats?.length || 0) - 3} more
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                      <span>Updated {new Date(template.updated_at).toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(template)}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {/* Navigate to use template */}}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Use
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Edit Template Dialog */}
      <Dialog open={!!editingTemplate} onOpenChange={() => setEditingTemplate(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Template</DialogTitle>
          </DialogHeader>
          {editingTemplate && (
            <TemplateForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleUpdateTemplate}
              onCancel={() => {
                setEditingTemplate(null);
                resetForm();
              }}
              submitLabel="Update Template"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Template Form Component
interface TemplateFormProps {
  formData: TemplateFormData;
  setFormData: (data: TemplateFormData) => void;
  onSubmit: () => void;
  onCancel: () => void;
  submitLabel: string;
}

const TemplateForm: React.FC<TemplateFormProps> = ({
  formData,
  setFormData,
  onSubmit,
  onCancel,
  submitLabel,
}) => {
  const handleExportFormatChange = (format: string, checked: boolean) => {
    const currentFormats = formData.export_formats || [];
    if (checked) {
      setFormData({
        ...formData,
        export_formats: [...currentFormats, format],
      });
    } else {
      setFormData({
        ...formData,
        export_formats: currentFormats.filter(f => f !== format),
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="templateName">Template Name</Label>
          <Input
            id="templateName"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter template name"
          />
        </div>

        <div>
          <Label htmlFor="templateCategory">Category</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData({ ...formData, category: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TEMPLATE_CATEGORIES.map(category => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="templateDescription">Description</Label>
        <Textarea
          id="templateDescription"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe what this template is for"
          rows={3}
        />
      </div>

      <div>
        <Label>Export Formats</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
          {EXPORT_FORMATS.map(format => (
            <div key={format.value} className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={`format-${format.value}`}
                checked={formData.export_formats?.includes(format.value) || false}
                onChange={(e) => handleExportFormatChange(format.value, e.target.checked)}
                className="rounded border-gray-300"
              />
              <Label htmlFor={`format-${format.value}`} className="text-sm">
                {format.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="aiEnabled"
          checked={formData.is_ai_enabled}
          onCheckedChange={(checked) => setFormData({ ...formData, is_ai_enabled: checked })}
        />
        <Label htmlFor="aiEnabled" className="flex items-center">
          <Sparkles className="w-4 h-4 mr-1" />
          Enable AI Content Generation
        </Label>
      </div>

      {formData.is_ai_enabled && (
        <div>
          <Label htmlFor="aiPromptTemplate">AI Prompt Template (Optional)</Label>
          <Textarea
            id="aiPromptTemplate"
            value={formData.ai_prompt_template || ""}
            onChange={(e) => setFormData({ ...formData, ai_prompt_template: e.target.value })}
            placeholder="Customize the AI prompt for this template..."
            rows={4}
          />
        </div>
      )}

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onSubmit}>
          {submitLabel}
        </Button>
      </div>
    </div>
  );
};

export default ReportTemplateManager;