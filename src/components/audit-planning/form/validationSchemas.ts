import { z } from "zod";

// Audit Plan Form Validation Schema
export const auditPlanFormSchema = z
  .object({
    plan_name: z
      .string()
      .min(3, "Plan name must be at least 3 characters")
      .max(200, "Plan name too long"),
    plan_type: z.enum(["annual", "multi_year", "strategic"], {
      required_error: "Plan type is required",
    }),
    plan_year: z
      .number()
      .min(new Date().getFullYear(), "Plan year cannot be in the past")
      .max(new Date().getFullYear() + 10, "Plan year too far in the future"),
    description: z
      .string()
      .max(1000, "Description too long")
      .optional(),
    strategic_objectives: z
      .array(z.string().min(10, "Each objective must be at least 10 characters"))
      .min(1, "At least one strategic objective is required")
      .max(10, "Maximum 10 strategic objectives allowed"),
    total_budget: z
      .number()
      .min(0, "Budget cannot be negative")
      .max(10000000, "Budget too high")
      .optional(),
    risk_based_coverage_percentage: z
      .number()
      .min(0, "Coverage percentage cannot be negative")
      .max(100, "Coverage percentage cannot exceed 100%")
      .optional(),
    compliance_coverage_percentage: z
      .number()
      .min(0, "Coverage percentage cannot be negative")
      .max(100, "Coverage percentage cannot exceed 100%")
      .optional(),
  })
  .refine(
    (data) => {
      // Ensure coverage percentages don't exceed 100% combined
      const riskCoverage = data.risk_based_coverage_percentage || 0;
      const complianceCoverage = data.compliance_coverage_percentage || 0;
      return riskCoverage + complianceCoverage <= 100;
    },
    {
      message: "Combined coverage percentages cannot exceed 100%",
      path: ["compliance_coverage_percentage"],
    }
  );

// Audit Plan Item Form Validation Schema
export const auditPlanItemFormSchema = z.object({
  audit_title: z
    .string()
    .min(3, "Audit title must be at least 3 characters")
    .max(200, "Audit title too long"),
  audit_type: z.enum([
    "financial",
    "operational",
    "compliance",
    "it",
    "security",
    "risk",
    "quality",
    "environmental",
    "internal",
    "external",
  ], {
    required_error: "Audit type is required",
  }),
  priority_level: z.enum(["critical", "high", "medium", "low"], {
    required_error: "Priority level is required",
  }),
  risk_score: z
    .number()
    .min(1, "Risk score must be at least 1")
    .max(5, "Risk score cannot exceed 5")
    .optional(),
  planned_start_date: z
    .string()
    .optional(),
  planned_end_date: z
    .string()
    .optional(),
  planned_hours: z
    .number()
    .min(1, "Planned hours must be at least 1")
    .max(10000, "Planned hours too high"),
  lead_auditor_id: z
    .string()
    .min(1, "Lead auditor is required"),
  team_size: z
    .number()
    .min(1, "Team size must be at least 1")
    .max(50, "Team size too large")
    .default(1),
  business_unit_id: z
    .string()
    .optional(),
  regulatory_requirement: z
    .string()
    .max(500, "Regulatory requirement description too long")
    .optional(),
  audit_frequency_months: z
    .number()
    .min(1, "Frequency must be at least 1 month")
    .max(120, "Frequency cannot exceed 120 months")
    .default(12),
  dependencies: z
    .array(z.string())
    .optional()
    .default([]),
  resource_requirements: z
    .array(z.string())
    .optional()
    .default([]),
})
.refine(
  (data) => {
    // If both dates are provided, ensure end date is after start date
    if (data.planned_start_date && data.planned_end_date) {
      return new Date(data.planned_end_date) >= new Date(data.planned_start_date);
    }
    return true;
  },
  {
    message: "End date must be after start date",
    path: ["planned_end_date"],
  }
);

// Combined form data type for the wizard
export const auditPlanningWizardSchema = z.object({
  planData: auditPlanFormSchema,
  planItems: z.array(auditPlanItemFormSchema).min(1, "At least one audit plan item is required"),
});

// Type exports
export type AuditPlanFormData = z.infer<typeof auditPlanFormSchema>;
export type AuditPlanItemFormData = z.infer<typeof auditPlanItemFormSchema>;
export type AuditPlanningWizardData = z.infer<typeof auditPlanningWizardSchema>;