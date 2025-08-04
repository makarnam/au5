import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import AIGenerator from "../../components/ai/AIGenerator";
import { schedulingService } from "../../services/schedulingService";
import { supabase } from "../../lib/supabase";
import LoadingSpinner from "../../components/LoadingSpinner";

const scheduleSchema = z
  .object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().optional(),
    start_at: z.string().min(1, "Start date & time is required"),
    end_at: z.string().min(1, "End date & time is required"),
    timezone: z.string().min(1, "Timezone is required"),
    recurrence_rule: z.string().optional(),
  })
  .refine(
    (val) => new Date(val.end_at).getTime() >= new Date(val.start_at).getTime(),
    { message: "End must be after start", path: ["end_at"] },
  );

type ScheduleForm = z.infer<typeof scheduleSchema>;

const COMMON_TIMEZONES = [
  "UTC",
  "Europe/Istanbul",
  "Europe/London",
  "Europe/Berlin",
  "America/New_York",
  "America/Los_Angeles",
  "Asia/Dubai",
  "Asia/Singapore",
  "Asia/Tokyo",
];

export default function ScheduleAuditPage() {
  const navigate = useNavigate();
  const { auditId } = useParams<{ auditId: string }>();
  const [isLoading, setIsLoading] = useState(false);
  const [auditTitle, setAuditTitle] = useState<string>("");
  const [loadingAudit, setLoadingAudit] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<ScheduleForm>({
    resolver: zodResolver(scheduleSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      description: "",
      start_at: "",
      end_at: "",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
      recurrence_rule: "",
    },
  });

  const title = watch("title");
  const desc = watch("description");

  // Load audit basic info for context/AI prompts
  useEffect(() => {
    const loadAudit = async () => {
      try {
        const { data, error } = await supabase
          .from("audits")
          .select("id,title")
          .eq("id", auditId)
          .single();
        if (error || !data) {
          toast.error("Audit not found");
          navigate("/audits");
          return;
        }
        setAuditTitle((data as any).title || "");
      } catch (e) {
        toast.error("Failed to load audit");
        navigate("/audits");
      } finally {
        setLoadingAudit(false);
      }
    };
    loadAudit();
  }, [auditId, navigate]);

  const aiAuditData = useMemo(
    () => ({
      title: auditTitle || title || "Audit",
      audit_type: "internal",
      business_unit: "General",
    }),
    [auditTitle, title],
  );

  const onSubmit = async (form: ScheduleForm) => {
    if (!auditId) {
      toast.error("Invalid audit");
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await schedulingService.createSchedule({
        audit_id: auditId,
        title: form.title,
        description: form.description,
        start_at: new Date(form.start_at).toISOString(),
        end_at: new Date(form.end_at).toISOString(),
        timezone: form.timezone,
        recurrence_rule: form.recurrence_rule || null,
      });
      if (error) {
        throw error;
      }
      toast.success("Audit scheduled successfully");
      navigate(`/audits/${auditId}`);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to create schedule");
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingAudit) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          ← Back
        </button>
      </div>

      <h1 className="text-2xl font-bold mb-2">Schedule Audit</h1>
      <p className="text-gray-600 mb-6">
        Create a schedule for: <span className="font-medium">{auditTitle}</span>
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white border rounded-lg p-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">Title *</label>
            {(auditTitle || title) && (
              <AIGenerator
                fieldType="description"
                auditData={aiAuditData}
                onGenerated={(content) => setValue("title", String(content), { shouldValidate: true })}
                currentValue={title}
                className="text-xs"
              />
            )}
          </div>
          <input
            type="text"
            {...register("title")}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Q3 Process Walkthrough"
          />
          {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            {(auditTitle || title || desc) && (
              <AIGenerator
                fieldType="description"
                auditData={aiAuditData}
                onGenerated={(content) => setValue("description", String(content), { shouldValidate: true })}
                currentValue={desc}
                className="text-xs"
              />
            )}
          </div>
          <textarea
            rows={3}
            {...register("description")}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe the schedule, scope, milestones..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start (local) *</label>
            <input
              type="datetime-local"
              {...register("start_at")}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.start_at && <p className="mt-1 text-sm text-red-600">{errors.start_at.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End (local) *</label>
            <input
              type="datetime-local"
              {...register("end_at")}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.end_at && <p className="mt-1 text-sm text-red-600">{errors.end_at.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Timezone *</label>
            <select
              {...register("timezone")}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {COMMON_TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
            {errors.timezone && <p className="mt-1 text-sm text-red-600">{errors.timezone.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Recurrence Rule (optional)</label>
            <input
              type="text"
              {...register("recurrence_rule")}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="RRULE e.g., FREQ=WEEKLY;BYDAY=MO,WE"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || !isValid}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? "Saving..." : "Create Schedule"}
          </button>
        </div>
      </form>
    </div>
  );
}
