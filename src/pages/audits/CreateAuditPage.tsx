import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { toast } from "react-hot-toast";
import AuditForm from "../../components/audit/AuditForm";
import { AuditFormData } from "../../types";
import { auditService, CreateAuditData } from "../../services/auditService";

export default function CreateAuditPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveAudit = async (auditData: AuditFormData) => {
    setIsLoading(true);
    try {
      // Prepare data for the service
      const createAuditData: CreateAuditData = {
        title: auditData.title,
        description: auditData.description,
        audit_type: auditData.audit_type,
        status: auditData.status,
        business_unit_id: auditData.business_unit_id,
        lead_auditor_id: auditData.lead_auditor_id,
        team_members: auditData.team_members,
        start_date: auditData.start_date,
        end_date: auditData.end_date,
        planned_hours: auditData.planned_hours,
        objectives: auditData.objectives,
        scope: auditData.scope,
        methodology: auditData.methodology,
        approval_status: auditData.approval_status || "draft",
      };

      console.log("Creating audit with data:", createAuditData);

      // Call the actual audit service
      const newAudit = await auditService.createAudit(createAuditData);

      console.log("Audit created successfully:", newAudit);

      // Show success message and navigate
      toast.success("Audit created successfully!");
      navigate("/audits");
    } catch (error) {
      console.error("Error creating audit:", error);

      // Show more specific error messages
      if (error instanceof Error) {
        if (error.message.includes("User not authenticated")) {
          toast.error("You must be logged in to create an audit.");
        } else if (error.message.includes("Database error")) {
          toast.error(
            "Database error occurred. Please check your data and try again.",
          );
        } else {
          toast.error(`Failed to create audit: ${error.message}`);
        }
      } else {
        toast.error("Failed to create audit. Please try again.");
      }

      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/audits");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <button
            onClick={() => navigate("/audits")}
            className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Audits
          </button>
        </div>

        <AuditForm
          mode="create"
          onSave={handleSaveAudit}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
