import React, { useState, useEffect } from "react";
import { X, Save, AlertCircle, Search } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { ComplianceFrameworkService } from "../../services/complianceFrameworkService";
import type { ComplianceMapping } from "../../services/complianceFrameworkService";

interface ComplianceMappingDialogProps {
  mapping?: ComplianceMapping | null;
  requirementId: string;
  onClose: () => void;
  onSave: () => void;
}

const ComplianceMappingDialog: React.FC<ComplianceMappingDialogProps> = ({
  mapping,
  requirementId,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<Partial<ComplianceMapping>>({
    requirement_id: requirementId,
    entity_type: "control",
    entity_id: "",
    mapping_type: "direct",
    coverage_percentage: null,
    mapping_strength: "moderate",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [entitySearchTerm, setEntitySearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  const isEditing = !!mapping;

  useEffect(() => {
    if (mapping) {
      setFormData({
        requirement_id: mapping.requirement_id,
        entity_type: mapping.entity_type,
        entity_id: mapping.entity_id,
        mapping_type: mapping.mapping_type || "direct",
        coverage_percentage: mapping.coverage_percentage || null,
        mapping_strength: mapping.mapping_strength || "moderate",
        notes: mapping.notes || "",
      });
    }
  }, [mapping]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.entity_type) {
      newErrors.entity_type = "Entity type is required";
    }

    if (!formData.entity_id?.trim()) {
      newErrors.entity_id = "Entity ID is required";
    }

    if (!formData.mapping_type) {
      newErrors.mapping_type = "Mapping type is required";
    }

    if (formData.coverage_percentage !== null && (formData.coverage_percentage < 0 || formData.coverage_percentage > 100)) {
      newErrors.coverage_percentage = "Coverage percentage must be between 0 and 100";
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
      if (isEditing && mapping) {
        // Update existing mapping - would need update method in service
        console.log("Update mapping:", formData);
      } else {
        await ComplianceFrameworkService.createMapping(formData);
      }
      onSave();
    } catch (error) {
      console.error("Error saving mapping:", error);
      setErrors({ general: "Failed to save mapping. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ComplianceMapping, value: any) => {
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

  const handleEntityTypeChange = (entityType: string) => {
    setFormData(prev => ({
      ...prev,
      entity_type: entityType as any,
      entity_id: "", // Reset entity ID when type changes
    }));
    setEntitySearchTerm("");
    setSearchResults([]);
  };

  const handleEntitySearch = async () => {
    if (!formData.entity_type || !entitySearchTerm.trim()) {
      return;
    }

    setSearching(true);
    try {
      // This would integrate with the appropriate service based on entity type
      // For now, we'll simulate search results
      const mockResults = [
        { id: "1", name: `Sample ${formData.entity_type} 1`, description: "Description 1" },
        { id: "2", name: `Sample ${formData.entity_type} 2`, description: "Description 2" },
        { id: "3", name: `Sample ${formData.entity_type} 3`, description: "Description 3" },
      ].filter(item => 
        item.name.toLowerCase().includes(entitySearchTerm.toLowerCase())
      );
      
      setSearchResults(mockResults);
    } catch (error) {
      console.error("Error searching entities:", error);
    } finally {
      setSearching(false);
    }
  };

  const handleEntitySelect = (entity: any) => {
    setFormData(prev => ({
      ...prev,
      entity_id: entity.id,
    }));
    setEntitySearchTerm(entity.name);
    setSearchResults([]);
  };

  const entityTypes = [
    { value: "risk", label: "Risk" },
    { value: "control", label: "Control" },
    { value: "policy", label: "Policy" },
    { value: "process", label: "Process" },
    { value: "asset", label: "Asset" },
  ];

  const mappingTypes = [
    { value: "direct", label: "Direct" },
    { value: "indirect", label: "Indirect" },
    { value: "supporting", label: "Supporting" },
    { value: "compensating", label: "Compensating" },
  ];

  const mappingStrengths = [
    { value: "weak", label: "Weak" },
    { value: "moderate", label: "Moderate" },
    { value: "strong", label: "Strong" },
    { value: "complete", label: "Complete" },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle>
              {isEditing ? "Edit Mapping" : "Create New Mapping"}
            </CardTitle>
            <CardDescription>
              {isEditing 
                ? "Update the compliance mapping details" 
                : "Map a compliance requirement to an entity"
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

          {/* Entity Type */}
          <div className="space-y-2">
            <Label htmlFor="entity_type">Entity Type *</Label>
            <Select
              value={formData.entity_type || ""}
              onValueChange={handleEntityTypeChange}
            >
              <SelectTrigger className={errors.entity_type ? "border-red-500" : ""}>
                <SelectValue placeholder="Select entity type" />
              </SelectTrigger>
              <SelectContent>
                {entityTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.entity_type && (
              <p className="text-sm text-red-600">{errors.entity_type}</p>
            )}
          </div>

          {/* Entity Search */}
          {formData.entity_type && (
            <div className="space-y-2">
              <Label htmlFor="entity_search">Search {formData.entity_type}s *</Label>
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="entity_search"
                    value={entitySearchTerm}
                    onChange={(e) => setEntitySearchTerm(e.target.value)}
                    placeholder={`Search for ${formData.entity_type}s...`}
                    className="pl-10"
                  />
                </div>
                <Button 
                  variant="outline" 
                  onClick={handleEntitySearch}
                  disabled={searching || !entitySearchTerm.trim()}
                >
                  {searching ? "Searching..." : "Search"}
                </Button>
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="border rounded-md max-h-40 overflow-y-auto">
                  {searchResults.map((entity) => (
                    <div
                      key={entity.id}
                      className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                      onClick={() => handleEntitySelect(entity)}
                    >
                      <div className="font-medium text-sm">{entity.name}</div>
                      <div className="text-xs text-gray-500">{entity.description}</div>
                    </div>
                  ))}
                </div>
              )}

              {formData.entity_id && (
                <div className="p-2 bg-green-50 border border-green-200 rounded-md">
                  <div className="text-sm text-green-800">
                    Selected: {entitySearchTerm}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Mapping Type */}
            <div className="space-y-2">
              <Label htmlFor="mapping_type">Mapping Type *</Label>
              <Select
                value={formData.mapping_type || ""}
                onValueChange={(value) => handleInputChange("mapping_type", value)}
              >
                <SelectTrigger className={errors.mapping_type ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select mapping type" />
                </SelectTrigger>
                <SelectContent>
                  {mappingTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.mapping_type && (
                <p className="text-sm text-red-600">{errors.mapping_type}</p>
              )}
            </div>

            {/* Mapping Strength */}
            <div className="space-y-2">
              <Label htmlFor="mapping_strength">Mapping Strength</Label>
              <Select
                value={formData.mapping_strength || ""}
                onValueChange={(value) => handleInputChange("mapping_strength", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select mapping strength" />
                </SelectTrigger>
                <SelectContent>
                  {mappingStrengths.map((strength) => (
                    <SelectItem key={strength.value} value={strength.value}>
                      {strength.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Coverage Percentage */}
          <div className="space-y-2">
            <Label htmlFor="coverage_percentage">Coverage Percentage</Label>
            <Input
              id="coverage_percentage"
              type="number"
              min="0"
              max="100"
              value={formData.coverage_percentage || ""}
              onChange={(e) => handleInputChange("coverage_percentage", e.target.value ? parseInt(e.target.value) : null)}
              placeholder="0-100"
              className={errors.coverage_percentage ? "border-red-500" : ""}
            />
            {errors.coverage_percentage && (
              <p className="text-sm text-red-600">{errors.coverage_percentage}</p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes || ""}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Additional notes about this mapping..."
              rows={3}
            />
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

export default ComplianceMappingDialog;
