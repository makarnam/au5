import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import AuditForm from "../../components/audit/AuditForm";
import { Audit, AuditFormData } from "../../types";
import { auditService, UpdateAuditData } from "../../services/auditService";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function EditAuditPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [audit, setAudit] = useState<Audit | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAudit = useCallback(async () => {
    if (!id) {
      setError("No audit ID provided");
      setIsLoadingData(false);
      return;
    }

    try {
      setIsLoadingData(true);
      setError(null);
      console.log("Loading audit for editing:", id);

      const auditData = await auditService.getAudit(id);

      if (!auditData) {
        setError("Audit not found");
        return;
      }

      console.log("Audit loaded for editing:", auditData);
      setAudit(auditData);
    } catch (error) {
      console.error("Error loading audit:", error);

      if (error instanceof Error) {
        if (error.message.includes("User not authenticated")) {
          setError("Please log in to edit this audit.");
          toast.error("Please log in to edit this audit.");
        } else if (error.message.includes("Database error")) {
          setError("Failed to load audit data from database.");
          toast.error("Failed to load audit data.");
        } else {
          setError(`Failed to load audit: ${error.message}`);
          toast.error("Failed to load audit data.");
        }
      } else {
        setError("Failed to load audit data");
        toast.error("Failed to load audit data");
      }
    } finally {
      setIsLoadingData(false);
    }
  }, [id]);

  useEffect(() => {
    loadAudit();
  }, [loadAudit]);

  const handleSaveAudit = async (auditData: AuditFormData) => {
    if (!id || !audit) {
      toast.error("Invalid audit data");
      return;
    }

    setIsLoading(true);
    try {
      // Prepare data for the service
      const updateAuditData: UpdateAuditData = {
        id: id,
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
        approval_status: auditData.approval_status,
      };

      console.log("Updating audit with data:", updateAuditData);

      // Call the actual audit service
      const updatedAudit = await auditService.updateAudit(updateAuditData);

      console.log("Audit updated successfully:", updatedAudit);
      setAudit(updatedAudit);

      // Show success message and navigate
      toast.success("Audit updated successfully!");
      navigate(`/audits/${id}`);
    } catch (error) {
      console.error("Error updating audit:", error);

      // Show more specific error messages
      if (error instanceof Error) {
        if (error.message.includes("User not authenticated")) {
          toast.error("You must be logged in to update an audit.");
        } else if (error.message.includes("Database error")) {
          toast.error(
            "Database error occurred. Please check your data and try again.",
          );
        } else {
          toast.error(`Failed to update audit: ${error.message}`);
        }
      } else {
        toast.error("Failed to update audit. Please try again.");
      }

      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(`/audits/${id}`);
  };

  if (isLoadingData) {
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

          <div className="flex items-center justify-center py-12">
            <LoadingSpinner
              size="lg"
              text="Loading audit data..."
              variant="dots"
            />
          </div>
        </div>
      </div>
    );
  }

  if (error || !audit) {
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

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto bg-white rounded-lg shadow-sm p-6 text-center"
          >
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {audit ? "Error Loading Audit" : "Audit Not Found"}
            </h2>
            <p className="text-gray-600 mb-6">
              {error ||
                "The requested audit could not be found or you don't have permission to access it."}
            </p>
            <div className="flex space-x-3 justify-center">
              <button
                onClick={() => navigate("/audits")}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go to Audits
              </button>
              <button
                onClick={loadAudit}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Retry
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <button
            onClick={() => navigate(`/audits/${id}`)}
            className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Audit Details
          </button>
        </div>

        <AuditForm
          mode="edit"
          audit={audit}
          onSave={handleSaveAudit}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
