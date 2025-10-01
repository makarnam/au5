import React, { useState, useEffect } from "react";
import { X, Save, AlertCircle } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Switch } from "../ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { ComplianceFrameworkService } from "../../services/complianceFrameworkService";
import type { ComplianceRequirement, ComplianceSection } from "../../services/complianceFrameworkService";

interface ComplianceRequirementDialogProps {
  requirement?: ComplianceRequirement | null;
  frameworkId: string;
  sections: ComplianceSection[];
  onClose: () => void;
  onSave: () => void;
}

const ComplianceRequirementDialog: React.FC<ComplianceRequirementDialogProps> = ({
  requirement,
  frameworkId,
  sections,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<Partial<ComplianceRequirement>>({
    framework_id: frameworkId,
    requirement_code: "",
    title: "",
    description: "",
    text: "",
    guidance: "",
    category: "",
    priority: "",
    implementation_level: "",
    evidence_required: "",
    assessment_frequency: "annual",
    is_active: true,
    tags: [],
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = !!requirement;

  useEffect(() => {
    if (requirement) {
      setFormData({
        framework_id: requirement.framework_id,
        section_id: requirement.section_id,
        requirement_code: requirement.requirement_code,
        title: requirement.title,
        description: requirement.description || "",
        text: requirement.text,
        guidance: requirement.guidance || "",
        category: requirement.category || "",
        priority: requirement.priority || "",
        implementation_level: requirement.implementation_level || "",
        evidence_required: requirement.evidence_required || "",
        assessment_frequency: requirement.assessment_frequency || "annual",
        is_active: requirement.is_active,
        tags: requirement.tags || [],
      });
    } else {
      setFormData(prev => ({
        ...prev,
        framework_id: frameworkId,
      }));
    }
  }, [requirement, frameworkId]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.requirement_code?.trim()) {
      newErrors.requirement_code = "Requirement code is required";
    }

    if (!formData.title?.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.text?.trim()) {
      newErrors.text = "Requirement text is required";
    }

    if (!formData.priority?.trim()) {
      newErrors.priority = "Priority is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      if (isEditing && requirement) {
        await ComplianceFrameworkService.updateRequirement(requirement.id, formData);
      } else {
        await ComplianceFrameworkService.createRequirement(formData);
      }
      onSave();
    } catch (error) {
      console.error("Error saving requirement:", error);
      setErrors({ general: "Failed to save requirement. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ComplianceRequirement, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const priorities = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "critical", label: "Critical" },
  ];

  const implementationLevels = [
    { value: "basic", label: "Basic" },
    { value: "intermediate", label: "Intermediate" },
    { value: "advanced", label: "Advanced" },
  ];

  const assessmentFrequencies = [
    { value: "monthly", label: "Monthly" },
    { value: "quarterly", label: "Quarterly" },
    { value: "semi-annual", label: "Semi-Annual" },
    { value: "annual", label: "Annual" },
    { value: "as-needed", label: "As Needed" },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle>
              {isEditing ? "Edit Requirement" : "Create New Requirement"}
            </CardTitle>
            <CardDescription>
              {isEditing 
                ? "Update the compliance requirement details" 
                : "Define a new compliance requirement"
              }
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {errors.general && (
            <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-md">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{errors.general}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Requirement Code */}
            <div className="space-y-2">
              <Label htmlFor="requirement_code">Requirement Code *</Label>
              <Input
                id="requirement_code"
                value={formData.requirement_code || ""}
                onChange={(e) => handleInputChange("requirement_code", e.target.value)}
                placeholder="e.g., A.5.1.1, SOX-001"
                className={errors.requirement_code ? "border-red-500" : ""}
              />
              {errors.requirement_code && (
                <p className="text-sm text-red-600">{errors.requirement_code}</p>
              )}
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title || ""}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Brief title of the requirement"
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && (
                <p className="text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            {/* Section */}
            <div className="space-y-2">
              <Label htmlFor="section_id">Section</Label>
              <Select
                value={formData.section_id || ""}
                onValueChange={(value) => handleInputChange("section_id", value || null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select section (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No Section</SelectItem>
                  {sections.map((section) => (
                    <SelectItem key={section.id} value={section.id}>
                      {section.section_code} - {section.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category || ""}
                onChange={(e) => handleInputChange("category", e.target.value)}
                placeholder="e.g., Access Control, Data Protection"
              />
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <Label htmlFor="priority">Priority *</Label>
              <Select
                value={formData.priority || ""}
                onValueChange={(value) => handleInputChange("priority", value)}
              >
                <SelectTrigger className={errors.priority ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((priority) => (
                    <SelectItem key={priority.value} value={priority.value}>
                      {priority.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.priority && (
                <p className="text-sm text-red-600">{errors.priority}</p>
              )}
            </div>

            {/* Implementation Level */}
            <div className="space-y-2">
              <Label htmlFor="implementation_level">Implementation Level</Label>
              <Select
                value={formData.implementation_level || ""}
                onValueChange={(value) => handleInputChange("implementation_level", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select implementation level" />
                </SelectTrigger>
                <SelectContent>
                  {implementationLevels.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Assessment Frequency */}
            <div className="space-y-2">
              <Label htmlFor="assessment_frequency">Assessment Frequency</Label>
              <Select
                value={formData.assessment_frequency || "annual"}
                onValueChange={(value) => handleInputChange("assessment_frequency", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  {assessmentFrequencies.map((frequency) => (
                    <SelectItem key={frequency.value} value={frequency.value}>
                      {frequency.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ""}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Brief description of the requirement..."
              rows={3}
            />
          </div>

          {/* Requirement Text */}
          <div className="space-y-2">
            <Label htmlFor="text">Requirement Text *</Label>
            <Textarea
              id="text"
              value={formData.text || ""}
              onChange={(e) => handleInputChange("text", e.target.value)}
              placeholder="Full text of the compliance requirement..."
              rows={4}
              className={errors.text ? "border-red-500" : ""}
            />
            {errors.text && (
              <p className="text-sm text-red-600">{errors.text}</p>
            )}
          </div>

          {/* Guidance */}
          <div className="space-y-2">
            <Label htmlFor="guidance">Implementation Guidance</Label>
            <Textarea
              id="guidance"
              value={formData.guidance || ""}
              onChange={(e) => handleInputChange("guidance", e.target.value)}
              placeholder="Guidance on how to implement this requirement..."
              rows={3}
            />
          </div>

          {/* Evidence Required */}
          <div className="space-y-2">
            <Label htmlFor="evidence_required">Evidence Required</Label>
            <Textarea
              id="evidence_required"
              value={formData.evidence_required || ""}
              onChange={(e) => handleInputChange("evidence_required", e.target.value)}
              placeholder="What evidence is required to demonstrate compliance..."
              rows={3}
            />
          </div>

          {/* Active Status */}
          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active || false}
              onCheckedChange={(checked) => handleInputChange("is_active", checked)}
            />
            <Label htmlFor="is_active">Active Requirement</Label>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditing ? "Update" : "Create"}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComplianceRequirementDialog;
