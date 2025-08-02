import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import {
  Shield,
  Bot,
  Loader2,
  AlertCircle,
  CheckCircle,
  X,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { Control, ControlFormData, User, ControlType, ControlFrequency, ControlEffectiveness } from "../../types";
import { supabase } from "../../lib/supabase";

const controlFormSchema = z.object({
  control_code: z.string().min(3, "Control code is required").max(20, "Control code too long"),
  title: z.string().min(5, "Title must be at least 5 characters").max(200, "Title too long"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  control_type: z.enum(["preventive", "detective", "corrective", "directive"]),
  frequency: z.enum(["continuous", "daily", "weekly", "monthly", "quarterly", "annually", "adhoc"]),
  process_area: z.string().min(3, "Process area is required"),
  owner_id: z.string().optional(),
  testing_procedure: z.string().min(20, "Testing procedure must be at least 20 characters"),
  evidence_requirements: z.string().min(20, "Evidence requirements must be at least 20 characters"),
  effectiveness: z.enum(["not_tested", "effective", "partially_effective", "ineffective"]),
  last_tested_date: z.string().optional(),
  next_test_date: z.string().optional(),
  is_automated: z.boolean().default(false),
});

interface ControlFormProps {
  control?: Control;
  onSave: (data: ControlFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  mode: "create" | "edit";
}

const controlTypes: { value: ControlType; label: string }[] = [
  { value: "preventive", label: "Preventive" },
  { value: "detective", label: "Detective" },
  { value: "corrective", label: "Corrective" },
  { value: "directive", label: "Directive" },
];

const frequencies: { value: ControlFrequency; label: string }[] = [
  { value: "continuous", label: "Continuous" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "annually", label: "Annually" },
  { value: "adhoc", label: "Ad Hoc" },
];

const effectivenessOptions: { value: ControlEffectiveness; label: string }[] = [
  { value: "not_tested", label: "Not Tested" },
  { value: "effective", label: "Effective" },
  { value: "partially_effective", label: "Partially Effective" },
  { value: "ineffective", label: "Ineffective" },
];

export default function ControlForm({
  control,
  onSave,
  onCancel,
  isLoading = false,
  mode,
}: ControlFormProps) {
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    watch,
  } = useForm<ControlFormData>({
    resolver: zodResolver(controlFormSchema),
    defaultValues: control
      ? {
          control_code: control.control_code,
          title: control.title,
          description: control.description,
          control_type: control.control_type,
          frequency: control.frequency,
          process_area: control.process_area,
          owner_id: control.owner_id || "",
          testing_procedure: control.testing_procedure,
          evidence_requirements: control.evidence_requirements,
          effectiveness: control.effectiveness,
          last_tested_date: control.last_tested_date
            ? new Date(control.last_tested_date).toISOString().split("T")[0]
            : "",
          next_test_date: control.next_test_date
            ? new Date(control.next_test_date).toISOString().split("T")[0]
            : "",
          is_automated: control.is_automated,
        }
      : {
          control_code: "",
          title: "",
          description: "",
          control_type: "preventive",
          frequency: "monthly",
          process_area: "",
          owner_id: "",
          testing_procedure: "",
          evidence_requirements: "",
          effectiveness: "not_tested",
          last_tested_date: "",
          next_test_date: "",
          is_automated: false,
        },
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("is_active", true)
        .order("first_name");

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Error loading users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoadingUsers(false);
    }
  };

  const onSubmit = async (data: ControlFormData) => {
    try {
      await onSave(data);
    } catch (error) {
      // Error handling is done in parent component
    }
  };

  const generateControlCode = () => {
    const processArea = watch("process_area");
    if (processArea) {
      const initials = processArea
        .split(" ")
        .map(word => word[0])
        .join("")
        .toUpperCase()
        .substring(0, 2);

      const randomNum = Math.floor(Math.random() * 999) + 1;
      const code = `${initials}-${randomNum.toString().padStart(3, "0")}`;

      // Use setValue to update the form value
      const setValue = (document.querySelector('[name="control_code"]') as HTMLInputElement);
      if (setValue) {
        setValue.value = code;
        setValue.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center">
            <Shield className="w-8 h-8 text-blue-600 mr-3" />
            {mode === "create" ? "Create New Control" : "Edit Control"}
          </h1>
          <p className="mt-2 text-gray-600">
            {mode === "create"
              ? "Define a new internal control for your audit"
              : "Update the control information and requirements"}
          </p>
        </div>

        {/* Basic Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Basic Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Control Code *
                </label>
                <button
                  type="button"
                  onClick={generateControlCode}
                  className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                >
                  <Bot className="w-3 h-3 inline mr-1" />
                  Generate
                </button>
              </div>
              <input
                {...register("control_code")}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., AC-001"
              />
              {errors.control_code && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.control_code.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Process Area *
              </label>
              <input
                {...register("process_area")}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Access Management"
              />
              {errors.process_area && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.process_area.message}
                </p>
              )}
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Control Title *
            </label>
            <input
              {...register("title")}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., User Access Review Process"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              {...register("description")}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Detailed description of what this control does and how it operates..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">
                {errors.description.message}
              </p>
            )}
          </div>
        </motion.div>

        {/* Control Characteristics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Control Characteristics
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Control Type *
              </label>
              <select
                {...register("control_type")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {controlTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Frequency *
              </label>
              <select
                {...register("frequency")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {frequencies.map((freq) => (
                  <option key={freq.value} value={freq.value}>
                    {freq.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Effectiveness *
              </label>
              <select
                {...register("effectiveness")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {effectivenessOptions.map((eff) => (
                  <option key={eff.value} value={eff.value}>
                    {eff.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Control Owner
              </label>
              <select
                {...register("owner_id")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loadingUsers}
              >
                <option value="">Select owner (optional)</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.first_name} {user.last_name} - {user.role}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center">
              <input
                {...register("is_automated")}
                type="checkbox"
                id="is_automated"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is_automated" className="ml-2 text-sm text-gray-700">
                This is an automated control
              </label>
            </div>
          </div>
        </motion.div>

        {/* Testing Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Testing Information
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Testing Procedure *
              </label>
              <textarea
                {...register("testing_procedure")}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe the specific steps and procedures for testing this control..."
              />
              {errors.testing_procedure && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.testing_procedure.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Evidence Requirements *
              </label>
              <textarea
                {...register("evidence_requirements")}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Specify what evidence should be collected to support the testing of this control..."
              />
              {errors.evidence_requirements && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.evidence_requirements.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Tested Date
                </label>
                <input
                  {...register("last_tested_date")}
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Next Test Date
                </label>
                <input
                  {...register("next_test_date")}
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <div className="flex justify-between">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {t("common.cancel")}
          </button>

          <button
            type="submit"
            disabled={isLoading || !isValid}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>
              {mode === "create" ? "Create Control" : "Update Control"}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}
