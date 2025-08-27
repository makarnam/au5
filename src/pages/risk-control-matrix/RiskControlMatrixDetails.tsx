import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { RiskControlMatrix } from "../../types/riskControlMatrix";
import riskControlMatrixService from "../../services/riskControlMatrixService";

const RiskControlMatrixDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [matrix, setMatrix] = useState<RiskControlMatrix | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let isMounted = true;
    (async () => {
      if (!id) {
        setError("Missing matrix id");
        setLoading(false);
        return;
      }
      try {
        const data = await riskControlMatrixService.getMatrix(id);
        if (isMounted) {
          setMatrix(data);
        }
      } catch (e: any) {
        if (isMounted) {
          setError(e?.message || "Failed to load matrix");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;
  if (!matrix) return <div className="p-4">Matrix not found.</div>;

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-4">
        <button
          className="px-3 py-2 bg-gray-100 rounded hover:bg-gray-200"
          onClick={() => navigate(-1)}
        >
          Back
        </button>
      </div>
      <h1 className="text-2xl font-semibold mb-2">{matrix.name}</h1>
      <p className="text-gray-600 mb-4">{matrix.description}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 border rounded">
          <div className="font-medium mb-1">Matrix Type</div>
          <div>{matrix.matrix_type}</div>
        </div>
        <div className="p-4 border rounded">
          <div className="font-medium mb-1">Risk Levels</div>
          <div>
            {Array.isArray(matrix.risk_levels)
              ? (matrix.risk_levels as any[]).join(", ")
              : String(matrix.risk_levels)}
          </div>
        </div>
        <div className="p-4 border rounded">
          <div className="font-medium mb-1">Control Effectiveness Levels</div>
          <div>
            {Array.isArray(matrix.control_effectiveness_levels)
              ? (matrix.control_effectiveness_levels as any[]).join(", ")
              : String(matrix.control_effectiveness_levels)}
          </div>
        </div>
        <div className="p-4 border rounded">
          <div className="font-medium mb-1">Created</div>
          <div>{new Date(matrix.created_at || "").toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
};

export default RiskControlMatrixDetails;


