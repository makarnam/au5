import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "../ui/button";
import AIGenerator from "../ai/AIGenerator";
import { toast } from "react-hot-toast";
import { auditService, AuditTemplate } from "../../services/auditService";
import AuditTemplateManager from "./AuditTemplateManager";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Users, Target, Check, ChevronRight, ChevronLeft, Template } from "lucide-react";

// Form schema
const schema = z
  .object({
    name: z.string().min(3, "Name too short"),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters"),
    department: z.string().min(1, "Required"),
    startDate: z.string().min(1, "Required"),
    endDate: z.string().min(1, "Required"),
    scope: z.string().min(10, "Too short"),
  })
  .refine(
    (data) => {
      return new Date(data.endDate) >= new Date(data.startDate);
    },
    {
      message: "End date must be after start date",
      path: ["endDate"],
    },
  );

type FormData = z.infer<typeof schema>;

const departments = [
  { id: "it", name: "IT" },
  { id: "finance", name: "Finance" },
  { id: "hr", name: "HR" },
  { id: "ops", name: "Operations" },
];

interface AuditWizardProps {
  onComplete?: () => void;
}

const steps = [
  { id: 1, name: "Template", icon: Template },
  { id: 2, name: "Details", icon: FileText },
  { id: 3, name: "Schedule", icon: Users },
  { id: 4, name: "Review", icon: Check },
];

export default function AuditWizard({ onComplete }: AuditWizardProps) {
  const [step, setStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<AuditTemplate | null>(null);
  const [useTemplate, setUseTemplate] = useState<boolean>(false);
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const watchedName = watch("name");
  const watchedDescription = watch("description");

  const nextStep = () => setStep((s) => Math.min(s + 1, 4));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));
  
  const handleTemplateSelect = (template: AuditTemplate) => {
    setSelectedTemplate(template);
    setUseTemplate(true);
    
    // Pre-fill form with template data
    setValue("name", `Audit based on ${template.name}`);
    setValue("description", template.description || "");
    setValue("scope", template.scope || "");
    
    toast.success(`Template "${template.name}" selected`);
    nextStep();
  };

  const handleSkipTemplate = () => {
    setUseTemplate(false);
    nextStep();
  };

  const onSubmit = async (data: FormData) => {
    try {
      let payload: any;

      if (useTemplate && selectedTemplate) {
        // Create audit from template
        payload = {
          title: data.name,
          description: data.description,
          audit_type: selectedTemplate.audit_type,
          status: "draft",
          business_unit_id: data.department,
          lead_auditor_id: "",
          team_members: [],
          start_date: data.startDate,
          end_date: data.endDate,
          planned_hours: 40,
          objectives: selectedTemplate.objectives,
          scope: data.scope,
          methodology: selectedTemplate.methodology || "Standard audit methodology",
          approval_status: "draft",
        };

        await auditService.createAuditFromTemplate(selectedTemplate.id, payload);
      } else {
        // Create audit without template
        payload = {
          title: data.name,
          description: data.description,
          audit_type: "internal",
          status: "draft",
          business_unit_id: data.department,
          lead_auditor_id: "",
          team_members: [],
          start_date: data.startDate,
          end_date: data.endDate,
          planned_hours: 40,
          objectives: [],
          scope: data.scope,
          methodology: "Standard audit methodology",
          approval_status: "draft",
        };

        await auditService.createAudit(payload);
      }

      toast.success("Audit created successfully.");
      onComplete?.();
    } catch (err) {
      console.error("Failed to create audit from wizard:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to create audit",
      );
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Choose Your Approach
              </h3>
              <p className="text-gray-600">
                Start with a template for consistency or create from scratch
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer">
                <Template className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  Use Template
                </h4>
                <p className="text-gray-600 mb-4">
                  Start with a pre-defined template for consistent audit planning
                </p>
                <Button
                  onClick={() => setUseTemplate(true)}
                  className="w-full"
                >
                  Browse Templates
                </Button>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer">
                <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  Start from Scratch
                </h4>
                <p className="text-gray-600 mb-4">
                  Create a custom audit plan tailored to your specific needs
                </p>
                <Button
                  onClick={handleSkipTemplate}
                  variant="outline"
                  className="w-full"
                >
                  Create Custom
                </Button>
              </div>
            </div>

            {useTemplate && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="border border-gray-200 rounded-lg p-6"
              >
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Select Template
                </h4>
                <AuditTemplateManager
                  mode="select"
                  onTemplateSelect={handleTemplateSelect}
                />
              </motion.div>
            )}
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {selectedTemplate && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-2">
                  <Template className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">
                    Using template: {selectedTemplate.name}
                  </span>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">
                Audit Name
              </label>
              <input
                type="text"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-red-500 text-sm">{errors.name.message}</p>
              )}
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium">Description</label>
                {watchedName && (
                  <AIGenerator
                    fieldType="description"
                    auditData={{
                      title: watchedName,
                      audit_type: selectedTemplate?.audit_type || "internal",
                      business_unit: "General",
                    }}
                    onGenerated={(content) =>
                      setValue("description", content as string)
                    }
                    currentValue={watchedDescription}
                    className="text-xs"
                  />
                )}
              </div>
              <textarea
                rows={3}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Enter audit description..."
                {...register("description")}
              />
              {errors.description && (
                <p className="text-red-500 text-sm">
                  {errors.description.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Department
              </label>
              <select
                {...register("department")}
                className="w-full p-2 border rounded"
              >
                <option value="">Select department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
              {errors.department && (
                <p className="text-red-500 text-sm">
                  {errors.department.message}
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
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium mb-1">
                Start Date
              </label>
              <input
                type="date"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                {...register("startDate")}
              />
              {errors.startDate && (
                <p className="text-red-500 text-sm">
                  {errors.startDate.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Date</label>
              <input
                type="date"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                {...register("endDate")}
              />
              {errors.endDate && (
                <p className="text-red-500 text-sm">{errors.endDate.message}</p>
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
          >
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium">Scope</label>
              {watchedName && (
                <AIGenerator
                  fieldType="scope"
                  auditData={{
                    title: watchedName,
                    audit_type: selectedTemplate?.audit_type || "internal",
                    business_unit: "General",
                  }}
                  onGenerated={(content) => setValue("scope", content as string)}
                  currentValue={watch("scope")}
                  className="text-xs"
                />
              )}
            </div>
            <textarea
              {...register("scope")}
              className="w-full p-2 border rounded"
              rows={4}
            />
            {errors.scope && (
              <p className="text-red-500 text-sm">{errors.scope.message}</p>
            )}

            {selectedTemplate && (
              <div className="mt-6 bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Template Details</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <p><strong>Template:</strong> {selectedTemplate.name}</p>
                  <p><strong>Type:</strong> {selectedTemplate.audit_type}</p>
                  <p><strong>Objectives:</strong> {selectedTemplate.objectives.length} objectives</p>
                  {selectedTemplate.methodology && (
                    <p><strong>Methodology:</strong> {selectedTemplate.methodology}</p>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-xl font-bold mb-6">Create Audit</h2>

      {/* Steps */}
      <div className="flex justify-between mb-8">
        {steps.map((stepItem, index) => {
          const Icon = stepItem.icon;
          const isActive = step >= stepItem.id;
          const isCompleted = step > stepItem.id;

          return (
            <div key={stepItem.id} className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isActive
                    ? "bg-blue-500 text-white"
                    : isCompleted
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-500"
                }`}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </div>
              <span className="text-sm mt-1 text-center">
                {stepItem.name}
              </span>
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>

        <div className="flex justify-between pt-4">
          <Button
            type="button"
            className="border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            onClick={prevStep}
            disabled={step === 1}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          {step < 4 ? (
            <Button type="button" onClick={nextStep}>
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button type="submit">Create Audit</Button>
          )}
        </div>
      </form>
    </div>
  );
}
