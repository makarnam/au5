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
import type { ComplianceFramework } from "../../services/complianceFrameworkService";

interface ComplianceFrameworkDialogProps {
  framework?: ComplianceFramework | null;
  onClose: () => void;
  onSave: () => void;
}

const ComplianceFrameworkDialog: React.FC<ComplianceFrameworkDialogProps> = ({
  framework,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<Partial<ComplianceFramework>>({
    code: "",
    name: "",
    version: "1.0",
    description: "",
    authority: "",
    category: "",
    is_active: true,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = !!framework;

  useEffect(() => {
    if (framework) {
      setFormData({
        code: framework.code,
        name: framework.name,
        version: framework.version || "1.0",
        description: framework.description || "",
        authority: framework.authority || "",
        category: framework.category || "",
        is_active: framework.is_active,
      });
    }
  }, [framework]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.code?.trim()) {
      newErrors.code = "Framework code is required";
    }

    if (!formData.name?.trim()) {
      newErrors.name = "Framework name is required";
    }

    if (!formData.category?.trim()) {
      newErrors.category = "Category is required";
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
      if (isEditing && framework) {
        await ComplianceFrameworkService.updateFramework(framework.id, formData);
      } else {
        await ComplianceFrameworkService.createFramework(formData);
      }
      onSave();
    } catch (error) {
      console.error("Error saving framework:", error);
      setErrors({ general: "Failed to save framework. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ComplianceFramework, value: any) => {
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

  const categories = [
    { value: "security", label: "Security" },
    { value: "privacy", label: "Privacy" },
    { value: "financial", label: "Financial" },
    { value: "operational", label: "Operational" },
    { value: "regulatory", label: "Regulatory" },
    { value: "quality", label: "Quality" },
    { value: "environmental", label: "Environmental" },
    { value: "other", label: "Other" },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle>
              {isEditing ? "Edit Framework" : "Create New Framework"}
            </CardTitle>
            <CardDescription>
              {isEditing 
                ? "Update the compliance framework details" 
                : "Define a new compliance framework for your organization"
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
            {/* Framework Code */}
            <div className="space-y-2">
              <Label htmlFor="code">Framework Code *</Label>
              <Input
                id="code"
                value={formData.code || ""}
                onChange={(e) => handleInputChange("code", e.target.value)}
                placeholder="e.g., ISO27001, SOX, GDPR"
                className={errors.code ? "border-red-500" : ""}
              />
              {errors.code && (
                <p className="text-sm text-red-600">{errors.code}</p>
              )}
            </div>

            {/* Framework Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Framework Name *</Label>
              <Input
                id="name"
                value={formData.name || ""}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="e.g., ISO 27001 Information Security"
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Version */}
            <div className="space-y-2">
              <Label htmlFor="version">Version</Label>
              <Input
                id="version"
                value={formData.version || ""}
                onChange={(e) => handleInputChange("version", e.target.value)}
                placeholder="e.g., 1.0, 2023.1"
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category || ""}
                onValueChange={(value) => handleInputChange("category", value)}
              >
                <SelectTrigger className={errors.category ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-red-600">{errors.category}</p>
              )}
            </div>
          </div>

          {/* Authority */}
          <div className="space-y-2">
            <Label htmlFor="authority">Authority/Regulatory Body</Label>
            <Input
              id="authority"
              value={formData.authority || ""}
              onChange={(e) => handleInputChange("authority", e.target.value)}
              placeholder="e.g., ISO, SEC, EU Commission"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ""}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Describe the purpose and scope of this compliance framework..."
              rows={4}
            />
          </div>

          {/* Active Status */}
          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active || false}
              onCheckedChange={(checked) => handleInputChange("is_active", checked)}
            />
            <Label htmlFor="is_active">Active Framework</Label>
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

export default ComplianceFrameworkDialog;
