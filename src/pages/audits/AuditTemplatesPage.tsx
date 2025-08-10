import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AuditTemplateManager from "../../components/audit/AuditTemplateManager";

export default function AuditTemplatesPage() {
  const navigate = useNavigate();

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

        <AuditTemplateManager mode="manage" />
      </div>
    </div>
  );
}
