import { useState, useEffect } from "react";
import { useForm, useFieldArray, FieldArrayPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Target,
  FileText,
  Settings,
  Check,
  ChevronRight,
  ChevronLeft,
  Plus,
  X,
  Bot,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { Audit, AuditType, AuditStatus, BusinessUnit, User } from "../../types";
import { supabase } from "../../lib/supabase";
import AIGenerator from "../ai/AIGenerator";
import { aiService } from "../../services/aiService";
import { auditService } from "../../services/auditService";

// Form validation schema
const auditFormSchema = z
  .object({
    title: z
      .string()
      .min(3, "Title must be at least 3 characters")
      .max(200, "Title too long"),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters"),
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
    status: z.enum([
      "draft",
      "planning",
      "in_progress",
      "testing",
      "reporting",
      "completed",
      "cancelled",
      "on_hold",
    ]),
    business_unit_id: z.string().min(1, "Business unit is required"),
    lead_auditor_id: z.string().min(1, "Lead auditor is required"),
    team_members: z.array(z.string()).optional().default([]),
    start_date: z.string().min(1, "Start date is required"),
    end_date: z.string().min(1, "End date is required"),
    planned_hours: z
      .number()
      .min(1, "Planned hours must be at least 1")
      .max(10000, "Planned hours too high"),
    objectives: z
      .array(z.string())
      .min(1, "At least one objective is required"),
    scope: z.string().min(20, "Scope must be at least 20 characters"),
    methodology: z
      .string()
      .min(10, "Methodology must be at least 10 characters"),
    approval_status: z
      .enum([
        "draft",
        "pending_approval",
        "approved",
        "rejected",
        "revision_required",
      ])
      .optional()
      .default("draft"),
  })
  .refine(
    (data) => {
      return new Date(data.end_date) >= new Date(data.start_date);
    },
    {
      message: "End date must be after start date",
      path: ["end_date"],
    },
  );

type AuditFormData = z.infer<typeof auditFormSchema>;

interface AuditFormProps {
  audit?: Audit;
  onSave: (data: AuditFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  mode: "create" | "edit";
}

const getAuditTypes = (): { value: AuditType; labelKey: string }[] => [
  { value: "internal", labelKey: "audits.internal" },
  { value: "external", labelKey: "audits.external" },
  { value: "compliance", labelKey: "audits.compliance" },
  { value: "operational", labelKey: "audits.operational" },
  { value: "financial", labelKey: "audits.financial" },
  { value: "it", labelKey: "audits.it" },
  { value: "quality", labelKey: "audits.quality" },
  { value: "environmental", labelKey: "audits.environmental" },
];

const getAuditStatuses = (): { value: AuditStatus; labelKey: string }[] => [
  { value: "draft", labelKey: "audits.draft" },
  { value: "planning", labelKey: "audits.planning" },
  { value: "in_progress", labelKey: "audits.inProgress" },
  { value: "testing", labelKey: "audits.testing" },
  { value: "reporting", labelKey: "audits.reporting" },
  { value: "completed", labelKey: "audits.completed" },
  { value: "cancelled", labelKey: "audits.cancelled" },
];

const getSteps = (t: any) => [
  { id: 1, name: t("audits.steps.basicInformation"), icon: FileText },
  { id: 2, name: t("audits.steps.teamSchedule"), icon: Users },
  { id: 3, name: t("audits.steps.scopeObjectives"), icon: Target },
  { id: 4, name: t("audits.steps.methodology"), icon: Settings },
  { id: 5, name: t("audits.steps.reviewSubmit"), icon: Check },
];

export default function AuditForm({
  audit,
  onSave,
  onCancel,
  isLoading = false,
  mode,
}: AuditFormProps) {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [businessUnits, setBusinessUnits] = useState<BusinessUnit[]>([]);

  const auditTypes = getAuditTypes().map(type => ({
    ...type,
    label: t(type.labelKey)
  }));
  const auditStatuses = getAuditStatuses().map(status => ({
    ...status,
    label: t(status.labelKey)
  }));
  const steps = getSteps(t);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isValid },
    trigger,
  } = useForm<AuditFormData>({
    resolver: zodResolver(auditFormSchema),
    defaultValues: audit
      ? {
          title: audit.title,
          description: audit.description,
          audit_type: audit.audit_type,
          status: audit.status,
          business_unit_id: audit.business_unit_id,
          lead_auditor_id: audit.lead_auditor_id,
          team_members: audit?.team_members || ([] as string[]),
          start_date: audit.start_date
            ? new Date(audit.start_date).toISOString().split("T")[0]
            : "",
          end_date: audit.end_date
            ? new Date(audit.end_date).toISOString().split("T")[0]
            : "",
          planned_hours: audit.planned_hours,
          objectives: audit.objectives || [],
          scope: audit.scope || "",
          methodology: audit.methodology || "",
          approval_status: audit.approval_status,
        }
      : {
          title: "",
          description: "",
          audit_type: "internal",
          status: "draft",
          business_unit_id: "",
          lead_auditor_id: "",
          team_members: [],
          start_date: "",
          end_date: "",
          planned_hours: 40,
          objectives: [],
          scope: "",
          methodology: "",
          approval_status: "draft",
        },
  });

  // FieldArray strictly bound to the "objectives" array (string[])
  const {
    fields: objectiveFields,
    append: appendObjective,
    remove: removeObjective,
  } = useFieldArray<AuditFormData, FieldArrayPath<AuditFormData>, "id">({
    control,
    // cast ensures RHF infers correct key type instead of never
    name: "objectives" as FieldArrayPath<AuditFormData>,
  });

  // Load users and business units from Supabase
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load users
        const { data: usersData, error: usersError } = await supabase
          .from("users")
          .select("*")
          .eq("is_active", true)
          .order("first_name");

        if (usersError) {
          console.error("Error loading users:", usersError);
          toast.error("Failed to load users");
        } else {
          setUsers(usersData || []);
        }

        // Load business units
        const { data: businessUnitsData, error: businessUnitsError } =
          await supabase
            .from("business_units")
            .select("*")
            .eq("is_active", true)
            .order("name");

        if (businessUnitsError) {
          console.error("Error loading business units:", businessUnitsError);
          toast.error("Failed to load business units");
        } else {
          setBusinessUnits(businessUnitsData || []);
        }
      } catch (error) {
        console.error("Error loading form data:", error);
        toast.error("Failed to load form data");
      }
    };

    loadData();
  }, []);

  const handleNextStep = async () => {
    const fieldsToValidate = getFieldsForStep(currentStep);
    const isStepValid = await trigger(fieldsToValidate);

    if (isStepValid) {
      setCurrentStep((prev) => Math.min(prev + 1, 5));
    }
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const getFieldsForStep = (step: number): (keyof AuditFormData)[] => {
    switch (step) {
      case 1:
        return [
          "title",
          "description",
          "audit_type",
          "status",
          "business_unit_id",
        ];
      case 2:
        return ["lead_auditor_id", "start_date", "end_date", "planned_hours"];
      case 3:
        return ["objectives", "scope"];
      case 4:
        return ["methodology"];
      default:
        return [];
    }
  };

  const generateAIContent = async (
    field: "objectives" | "scope" | "methodology",
  ) => {
    setAiGenerating(true);
    try {
      const auditTitle = watch("title");
      const auditType = watch("audit_type");
      const businessUnitId = watch("business_unit_id");
      const businessUnit = businessUnits.find((bu) => bu.id === businessUnitId);
      const currentScope = watch("scope");

      if (!auditTitle) {
        toast.error("Please enter an audit title first");
        return;
      }

      // Get AI configurations
      const configurations = await aiService.getConfigurations();
      if (configurations.length === 0) {
        toast.error(
          "No AI configuration found. Please configure AI settings first.",
        );
        return;
      }

      const selectedConfig = configurations[0]; // Use first available configuration

      // Prepare audit data for AI generation
      const auditData = {
        title: auditTitle,
        audit_type: auditType,
        business_unit: businessUnit?.name || "General",
        scope: currentScope || "",
      };

      // Generate content using AI service
      const response = await aiService.generateContent({
        provider: selectedConfig.provider,
        model: selectedConfig.model_name,
        prompt: "", // Will be built by the service
        context: `Generate realistic and professional audit ${field} for: ${auditTitle}`,
        fieldType: field,
        auditData,
        temperature: selectedConfig.temperature,
        maxTokens: selectedConfig.max_tokens,
        apiKey: selectedConfig.api_key,
        baseUrl: selectedConfig.api_endpoint,
      });

      if (response.success) {
        let generatedContent: string | string[] = response.content;

        // For objectives, ensure we have an array
        if (field === "objectives") {
          if (typeof response.content === "string") {
            try {
              // Try to parse as JSON array first
              const parsed = JSON.parse(response.content);
              if (Array.isArray(parsed)) {
                generatedContent = parsed;
              } else {
                // Split by lines and clean up
                generatedContent = response.content
                  .split("\n")
                  .filter((line) => line.trim())
                  .map((line) =>
                    line
                      .replace(/^[-•*]\s*/, "")
                      .replace(/^\d+\.\s*/, "")
                      .trim(),
                  )
                  .filter((line) => line.length > 10); // Filter out very short lines
              }
            } catch {
              // Split by lines and clean up
              generatedContent = response.content
                .split("\n")
                .filter((line) => line.trim())
                .map((line) =>
                  line
                    .replace(/^[-•*]\s*/, "")
                    .replace(/^\d+\.\s*/, "")
                    .trim(),
                )
                .filter((line) => line.length > 10);
            }
          }
        }

        setValue(field, generatedContent, { shouldValidate: true });
        toast.success(`AI-generated ${field} added successfully!`);

        // Log the generation
        await aiService.logGeneration(
          {
            provider: selectedConfig.provider,
            model: selectedConfig.model_name,
            prompt: "",
            context: `Generate realistic and professional audit ${field} for: ${auditTitle}`,
            fieldType: field,
            auditData,
            temperature: selectedConfig.temperature,
            maxTokens: selectedConfig.max_tokens,
            apiKey: selectedConfig.api_key,
            baseUrl: selectedConfig.api_endpoint,
          },
          response,
        );
      } else {
        throw new Error(response.error || "AI generation failed");
      }
    } catch (error) {
      console.error("AI generation failed:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      // Provide fallback content for better user experience
      if (field === "objectives") {
        const auditType = watch("audit_type");
        const businessUnit = businessUnits.find(
          (bu) => bu.id === watch("business_unit_id"),
        );
        const auditTitle = watch("title");

        const fallbackObjectives = [
          `Assess the effectiveness of ${auditType} controls and processes within ${businessUnit?.name || "the organization"}`,
          `Evaluate compliance with applicable policies, procedures, and regulatory requirements for ${auditTitle}`,
          `Identify potential risks and control gaps in the ${auditType} operations`,
          `Review the adequacy and completeness of documentation and evidence supporting ${auditType} activities`,
          `Test the design and operating effectiveness of key controls related to ${auditTitle}`,
          `Provide recommendations for process improvements and risk mitigation strategies`,
        ];

        setValue("objectives", fallbackObjectives, { shouldValidate: true });
        toast.error(
          `AI generation failed: ${errorMessage}. Using fallback objectives.`,
        );
      } else {
        toast.error(`AI generation failed: ${errorMessage}`);
      }
    } finally {
      setAiGenerating(false);
    }
  };

  const onSubmit = async (data: AuditFormData) => {
    try {
      // Prefer page-level onSave if provided (CreateAuditPage/EditAuditPage). Fallback to direct service call for robustness.
      if (onSave) {
        await onSave(data);
      } else {
        await auditService.createAudit({
          title: data.title,
          description: data.description,
          audit_type: data.audit_type,
          status: data.status,
          business_unit_id: data.business_unit_id,
          lead_auditor_id: data.lead_auditor_id,
          team_members: data.team_members,
          start_date: data.start_date,
          end_date: data.end_date,
          planned_hours: data.planned_hours,
          objectives: data.objectives,
          scope: data.scope,
          methodology: data.methodology,
          approval_status: data.approval_status || "draft",
        });
        toast.success("Audit created successfully");
      }
    } catch (e) {
      // Error is handled by the parent component in most flows
      if (e instanceof Error) {
        toast.error(e.message);
      } else {
        toast.error("Failed to save audit");
      }
      throw e;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("audits.title")} *
              </label>
              <input
                {...register("title")}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t("audits.title")}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  {t("common.description")} *
                </label>
                {watch("title") && (
                  <AIGenerator
                    fieldType="description"
                    auditData={{
                      title: watch("title"),
                      audit_type: watch("audit_type"),
                      business_unit:
                        businessUnits.find(
                          (bu) => bu.id === watch("business_unit_id"),
                        )?.name || "General",
                    }}
                    onGenerated={(content) =>
                      setValue("description", content as string)
                    }
                    currentValue={watch("description")}
                    className="text-xs"
                  />
                )}
              </div>
              <textarea
                {...register("description")}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t("common.description")}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("audits.auditType")} *
                </label>
                <select
                  {...register("audit_type")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {auditTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                {errors.audit_type && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.audit_type.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("common.status")} *
                </label>
                <select
                  {...register("status")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {auditStatuses.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
                {errors.status && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.status.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("audits.businessUnit")} *
              </label>
              <select
                {...register("business_unit_id")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">{t("common.selectOption")}</option>
                {businessUnits.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.name} ({unit.code})
                  </option>
                ))}
              </select>
              {errors.business_unit_id && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.business_unit_id.message}
                </p>
              )}
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("audits.leadAuditor")} *
              </label>
              <select
                {...register("lead_auditor_id")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">{t("common.selectOption")}</option>
                {users
                  .filter((user) =>
                    ["auditor", "supervisor_auditor"].includes(user.role),
                  )
                  .map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.first_name} {user.last_name} ({user.role})
                    </option>
                  ))}
              </select>
              {errors.lead_auditor_id && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.lead_auditor_id.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("audits.teamMembers")}
              </label>
              <select
                {...register("team_members")}
                multiple
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                size={4}
              >
                {users
                  .filter((user) => user.role === "auditor")
                  .map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.first_name} {user.last_name}
                    </option>
                  ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                {t("common.multiSelectHint")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("audits.startDate")} *
                </label>
                <input
                  {...register("start_date")}
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.start_date && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.start_date.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("audits.endDate")} *
                </label>
                <input
                  {...register("end_date")}
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.end_date && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.end_date.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("audits.plannedHours")} *
              </label>
              <input
                {...register("planned_hours", { valueAsNumber: true })}
                type="number"
                min="1"
                max="10000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., 40"
              />
              {errors.planned_hours && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.planned_hours.message}
                </p>
              )}
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  {t("audits.objectives")} *
                </label>
                <button
                  type="button"
                  onClick={() => generateAIContent("objectives")}
                  disabled={aiGenerating}
                  className="flex items-center space-x-1 px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors disabled:opacity-50"
                >
                  {aiGenerating ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Bot className="w-3 h-3" />
                  )}
                  <span>AI</span>
                </button>
              </div>

              <div className="space-y-3">
                {objectiveFields.map((field, index) => (
                  <div key={field.id ?? index} className="flex items-start space-x-2">
                    <input
                      {...register(`objectives.${index}` as const)}
                      type="text"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={`${t("audits.objectives")} ${index + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => removeObjective(index)}
                      className="p-2 text-red-500 hover:text-red-700 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => appendObjective("")}
                  className="flex items-center space-x-1 px-3 py-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>
                    {t("common.add")} {t("audits.objectives")}
                  </span>
                </button>
              </div>

              {errors.objectives && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.objectives.message}
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  {t("audits.scope")} *
                </label>
                <button
                  type="button"
                  onClick={() => generateAIContent("scope")}
                  disabled={aiGenerating}
                  className="flex items-center space-x-1 px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors disabled:opacity-50"
                >
                  {aiGenerating ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Bot className="w-3 h-3" />
                  )}
                  <span>AI Generate</span>
                </button>
              </div>
              <textarea
                {...register("scope")}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t("audits.scope")}
              />
              {errors.scope && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.scope.message}
                </p>
              )}
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  {t("audits.methodology")} *
                </label>
                <button
                  type="button"
                  onClick={() => generateAIContent("methodology")}
                  disabled={aiGenerating}
                  className="flex items-center space-x-1 px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors disabled:opacity-50"
                >
                  {aiGenerating ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Bot className="w-3 h-3" />
                  )}
                  <span>AI Generate</span>
                </button>
              </div>
              <textarea
                {...register("methodology")}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t("audits.methodology")}
              />
              {errors.methodology && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.methodology.message}
                </p>
              )}
            </div>
          </motion.div>
        );

      case 5: {
        const formData = watch();
        const leadAuditor = users.find(
          (u) => u.id === formData.lead_auditor_id,
        );
        const businessUnit = businessUnits.find(
          (bu) => bu.id === formData.business_unit_id,
        );
        const teamMembers = users.filter((u) =>
          formData.team_members?.includes(u.id),
        );

        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Review Audit Details
              </h3>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">
                    {formData.title}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {formData.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Type:</span>
                    <span className="ml-2 text-gray-600">
                      {
                        auditTypes.find((t) => t.value === formData.audit_type)?.label || formData.audit_type
                      }
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Status:</span>
                    <span className="ml-2 text-gray-600">
                      {
                        auditStatuses.find((s) => s.value === formData.status)?.label || formData.status
                      }
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">
                      Business Unit:
                    </span>
                    <span className="ml-2 text-gray-600">
                      {businessUnit?.name}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">
                      Lead Auditor:
                    </span>
                    <span className="ml-2 text-gray-600">
                      {leadAuditor
                        ? `${leadAuditor.first_name} ${leadAuditor.last_name}`
                        : "Not selected"}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Duration:</span>
                    <span className="ml-2 text-gray-600">
                      {formData.start_date} to {formData.end_date}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">
                      Planned Hours:
                    </span>
                    <span className="ml-2 text-gray-600">
                      {formData.planned_hours} hours
                    </span>
                  </div>
                </div>

                {teamMembers.length > 0 && (
                  <div>
                    <span className="font-medium text-gray-700">
                      {t("audits.teamMembers")}:
                    </span>
                    <ul className="mt-1 text-sm text-gray-600">
                      {teamMembers.map((member) => (
                        <li key={member.id} className="ml-4">
                          • {member.first_name} {member.last_name}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <span className="font-medium text-gray-700">Objectives:</span>
                  <ul className="mt-1 text-sm text-gray-600">
                    {formData.objectives?.map((objective, index) => (
                      <li key={index} className="ml-4 mb-1">
                        • {objective}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            {mode === "create" ? t("audits.newAudit") : t("audits.editAudit")}
          </h1>
          <p className="mt-2 text-gray-600">
            {mode === "create"
              ? t("audits.newAuditSubtitle")
              : t("audits.editAuditSubtitle")}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-between items-center">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;

            return (
              <div key={step.id} className="flex items-center">
                <div
                  className={`
                  flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors
                  ${
                    isActive
                      ? "bg-blue-600 border-blue-600 text-white"
                      : isCompleted
                        ? "bg-green-600 border-green-600 text-white"
                        : "bg-white border-gray-300 text-gray-400"
                  }
                `}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                <div className="ml-3 hidden sm:block">
                  <p
                    className={`text-sm font-medium ${
                      isActive
                        ? "text-blue-600"
                        : isCompleted
                          ? "text-green-600"
                          : "text-gray-400"
                    }`}
                  >
                    {step.name}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <ChevronRight className="w-5 h-5 text-gray-400 mx-4" />
                )}
              </div>
            );
          })}
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 min-h-[500px]">
          <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center">
          <div>
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handlePrevStep}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {t("common.cancel")}
            </button>

            {currentStep < 5 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isLoading || !isValid}
                className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>
                  {mode === "create" ? t("audits.newAudit") : t("common.update")}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Form Validation Summary */}
        {Object.keys(errors).length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-red-800">
                  Please fix the following errors:
                </h3>
                <ul className="mt-2 text-sm text-red-700 space-y-1">
                  {Object.entries(errors).map(([field, error]) => (
                    <li key={field} className="flex items-start space-x-1">
                      <span>•</span>
                      <span>{error.message}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
