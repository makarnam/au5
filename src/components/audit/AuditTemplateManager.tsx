import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Copy,
  Search,
  Filter,
  Loader2,
  AlertCircle,
  Check,
  X,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { AuditTemplate, auditService } from "../../services/auditService";
import { AuditType } from "../../types";

// Form validation schema
const templateFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().optional(),
  audit_type: z.enum([
    "internal",
    "external",
    "compliance",
    "operational",
    "financial",
    "it",
    "quality",
    "environmental",
  ]),
  objectives: z.array(z.string()).min(1, "At least one objective is required"),
  scope: z.string().optional(),
  methodology: z.string().optional(),
});

type TemplateFormData = z.infer<typeof templateFormSchema>;

interface AuditTemplateManagerProps {
  onTemplateSelect?: (template: AuditTemplate) => void;
  mode?: "select" | "manage";
}

const getAuditTypes = (t: any): { value: AuditType; label: string }[] => [
  { value: "internal", label: t("audit.type.internal") },
  { value: "external", label: t("audit.type.external") },
  { value: "compliance", label: t("audit.type.compliance") },
  { value: "operational", label: t("audit.type.operational") },
  { value: "financial", label: t("audit.type.financial") },
  { value: "it", label: t("audit.type.it") },
  { value: "quality", label: t("audit.type.quality") },
  { value: "environmental", label: t("audit.type.environmental") },
];

export default function AuditTemplateManager({
  onTemplateSelect,
  mode = "manage",
}: AuditTemplateManagerProps) {
  const { t } = useTranslation();
  const [templates, setTemplates] = useState<AuditTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<AuditTemplate | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [showPreview, setShowPreview] = useState<string | null>(null);

  const auditTypes = getAuditTypes(t);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<TemplateFormData>({
    resolver: zodResolver(templateFormSchema),
    defaultValues: {
      name: "",
      description: "",
      audit_type: "internal",
      objectives: [""],
      scope: "",
      methodology: "",
    },
  });

  const watchedObjectives = watch("objectives");

  // Load templates
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await auditService.getAllAuditTemplates();
      setTemplates(data);
    } catch (error) {
      console.error("Error loading templates:", error);
      toast.error("Failed to load templates");
    } finally {
      setLoading(false);
    }
  };

  // Filter templates
  const filteredTemplates = templates.filter((template) => {
    const matchesSearch = template.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || template.audit_type === filterType;
    return matchesSearch && matchesType;
  });

  const handleCreateTemplate = async (data: TemplateFormData) => {
    try {
      await auditService.createAuditTemplate({
        name: data.name,
        description: data.description,
        audit_type: data.audit_type,
        objectives: data.objectives.filter((obj) => obj.trim() !== ""),
        scope: data.scope,
        methodology: data.methodology,
      });
      toast.success("Template created successfully");
      setShowForm(false);
      reset();
      loadTemplates();
    } catch (error) {
      console.error("Error creating template:", error);
      toast.error("Failed to create template");
    }
  };

  const handleUpdateTemplate = async (data: TemplateFormData) => {
    if (!editingTemplate) return;

    try {
      await auditService.updateAuditTemplate({
        id: editingTemplate.id,
        name: data.name,
        description: data.description,
        audit_type: data.audit_type,
        objectives: data.objectives.filter((obj) => obj.trim() !== ""),
        scope: data.scope,
        methodology: data.methodology,
      });
      toast.success("Template updated successfully");
      setShowForm(false);
      setEditingTemplate(null);
      reset();
      loadTemplates();
    } catch (error) {
      console.error("Error updating template:", error);
      toast.error("Failed to update template");
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;

    try {
      await auditService.deleteAuditTemplate(templateId);
      toast.success("Template deleted successfully");
      loadTemplates();
    } catch (error) {
      console.error("Error deleting template:", error);
      toast.error("Failed to delete template");
    }
  };

  const handleEditTemplate = (template: AuditTemplate) => {
    setEditingTemplate(template);
    setValue("name", template.name);
    setValue("description", template.description || "");
    setValue("audit_type", template.audit_type as AuditType);
    setValue("objectives", template.objectives.length > 0 ? template.objectives : [""]);
    setValue("scope", template.scope || "");
    setValue("methodology", template.methodology || "");
    setShowForm(true);
  };

  const handleSelectTemplate = (template: AuditTemplate) => {
    if (onTemplateSelect) {
      onTemplateSelect(template);
    }
  };

  const addObjective = () => {
    const currentObjectives = watch("objectives");
    setValue("objectives", [...currentObjectives, ""]);
  };

  const removeObjective = (index: number) => {
    const currentObjectives = watch("objectives");
    if (currentObjectives.length > 1) {
      setValue("objectives", currentObjectives.filter((_, i) => i !== index));
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingTemplate(null);
    reset();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {mode === "select" ? "Select Template" : "Audit Templates"}
          </h2>
          <p className="text-gray-600">
            {mode === "select"
              ? "Choose a template to start your audit"
              : "Manage audit templates for consistent audit planning"}
          </p>
        </div>
        {mode === "manage" && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Template</span>
          </button>
        )}
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
          >
            <option value="all">All Types</option>
            {auditTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Template Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white border border-gray-200 rounded-lg p-6"
          >
            <h3 className="text-lg font-semibold mb-4">
              {editingTemplate ? "Edit Template" : "Create New Template"}
            </h3>
            <form
              onSubmit={handleSubmit(editingTemplate ? handleUpdateTemplate : handleCreateTemplate)}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Template Name *
                  </label>
                  <input
                    {...register("name")}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter template name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Audit Type *
                  </label>
                  <select
                    {...register("audit_type")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {auditTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  {errors.audit_type && (
                    <p className="mt-1 text-sm text-red-600">{errors.audit_type.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  {...register("description")}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter template description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Objectives *
                </label>
                <div className="space-y-2">
                  {watchedObjectives.map((_, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        {...register(`objectives.${index}` as const)}
                        type="text"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={`Objective ${index + 1}`}
                      />
                      {watchedObjectives.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeObjective(index)}
                          className="p-2 text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addObjective}
                    className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Objective</span>
                  </button>
                </div>
                {errors.objectives && (
                  <p className="mt-1 text-sm text-red-600">{errors.objectives.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Scope
                  </label>
                  <textarea
                    {...register("scope")}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter audit scope"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Methodology
                  </label>
                  <textarea
                    {...register("methodology")}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter audit methodology"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isValid}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {editingTemplate ? "Update Template" : "Create Template"}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Templates List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                <p className="text-sm text-gray-500">
                  {auditTypes.find((t) => t.value === template.audit_type)?.label}
                </p>
              </div>
              <div className="flex space-x-1">
                {mode === "select" ? (
                  <button
                    onClick={() => handleSelectTemplate(template)}
                    className="p-2 text-blue-600 hover:text-blue-800"
                    title="Select template"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setShowPreview(template.id)}
                      className="p-2 text-gray-600 hover:text-gray-800"
                      title="Preview template"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEditTemplate(template)}
                      className="p-2 text-blue-600 hover:text-blue-800"
                      title="Edit template"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="p-2 text-red-600 hover:text-red-800"
                      title="Delete template"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {template.description && (
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {template.description}
              </p>
            )}

            <div className="space-y-2">
              <div>
                <span className="text-xs font-medium text-gray-500">Objectives:</span>
                <p className="text-sm text-gray-700">
                  {template.objectives.length} objective{template.objectives.length !== 1 ? "s" : ""}
                </p>
              </div>
              {template.scope && (
                <div>
                  <span className="text-xs font-medium text-gray-500">Scope:</span>
                  <p className="text-sm text-gray-700 line-clamp-2">{template.scope}</p>
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Created {new Date(template.created_at).toLocaleDateString()}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredTemplates.length === 0 && !loading && (
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
          <p className="text-gray-600">
            {searchTerm || filterType !== "all"
              ? "Try adjusting your search or filter criteria"
              : "Create your first audit template to get started"}
          </p>
        </div>
      )}

      {/* Template Preview Modal */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowPreview(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {(() => {
                const template = templates.find((t) => t.id === showPreview);
                if (!template) return null;

                return (
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">{template.name}</h2>
                        <p className="text-gray-600">
                          {auditTypes.find((t) => t.value === template.audit_type)?.label}
                        </p>
                      </div>
                      <button
                        onClick={() => setShowPreview(null)}
                        className="p-2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>

                    {template.description && (
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                        <p className="text-gray-700">{template.description}</p>
                      </div>
                    )}

                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Objectives</h3>
                      <ul className="space-y-2">
                        {template.objectives.map((objective, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <span className="text-blue-600 font-medium">{index + 1}.</span>
                            <span className="text-gray-700">{objective}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {template.scope && (
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Scope</h3>
                        <p className="text-gray-700 whitespace-pre-wrap">{template.scope}</p>
                      </div>
                    )}

                    {template.methodology && (
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Methodology</h3>
                        <p className="text-gray-700 whitespace-pre-wrap">{template.methodology}</p>
                      </div>
                    )}

                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => setShowPreview(null)}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                      >
                        Close
                      </button>
                      {mode === "select" && (
                        <button
                          onClick={() => {
                            handleSelectTemplate(template);
                            setShowPreview(null);
                          }}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          Use Template
                        </button>
                      )}
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
