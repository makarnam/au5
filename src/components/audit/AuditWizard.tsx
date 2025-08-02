import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "../ui/button";
import AIGenerator from "../ai/AIGenerator";

// Form schema
const schema = z.object({
  name: z.string().min(3, "Name too short"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  department: z.string().min(1, "Required"),
  startDate: z.string().min(1, "Required"),
  endDate: z.string().min(1, "Required"),
  scope: z.string().min(10, "Too short"),
});

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

export default function AuditWizard({ onComplete }: AuditWizardProps) {
  const [step, setStep] = useState(1);
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

  const nextStep = () => setStep((s) => Math.min(s + 1, 3));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));
  const onSubmit = (data: FormData) => {
    console.log("Submitting audit:", data);
    // TODO: Implement API call
    onComplete?.();
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-xl font-bold mb-6">Create Audit</h2>

      {/* Steps */}
      <div className="flex justify-between mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= i ? "bg-blue-500 text-white" : "bg-gray-200"
              }`}
            >
              {i}
            </div>
            <span className="text-sm mt-1">
              {i === 1 ? "Details" : i === 2 ? "Schedule" : "Review"}
            </span>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {step === 1 && (
          <div className="space-y-4">
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
                      audit_type: "internal",
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
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
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
          </div>
        )}

        {step === 3 && (
          <div>
            <label className="block text-sm font-medium mb-1">Scope</label>
            <textarea
              {...register("scope")}
              className="w-full p-2 border rounded"
              rows={4}
            />
            {errors.scope && (
              <p className="text-red-500 text-sm">{errors.scope.message}</p>
            )}
          </div>
        )}

        <div className="flex justify-between pt-4">
          <Button
            type="button"
            className="border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            onClick={prevStep}
            disabled={step === 1}
          >
            Previous
          </Button>

          {step < 3 ? (
            <Button type="button" onClick={nextStep}>
              Next
            </Button>
          ) : (
            <Button type="submit">Submit</Button>
          )}
        </div>
      </form>
    </div>
  );
}
