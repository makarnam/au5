import React from "react";
import { RiskLevel } from "../../services/riskService";

type MatrixSize = 3 | 4 | 5;

export type AssessmentFormValue = {
  assessment_date: string;
  assessment_type: "initial" | "periodic" | "triggered" | "ad_hoc";
  probability: number;
  impact: number;
  risk_score: number;
  risk_level: RiskLevel;
  confidence_level?: "low" | "medium" | "high";
  assessment_notes?: string;
};

type Props = {
  value: AssessmentFormValue;
  onChange: (v: AssessmentFormValue) => void;
  matrixSize?: MatrixSize; // default 5 for compatibility
  disabled?: boolean;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

const RiskAssessmentForm: React.FC<Props> = ({ value, onChange, matrixSize = 5, disabled }) => {
  const ranges = Array.from({ length: matrixSize }, (_, i) => i + 1);

  const update = (patch: Partial<AssessmentFormValue>) => {
    const next = { ...value, ...patch };
    // recompute default score if probability/impact provided without score
    if (patch.probability !== undefined || patch.impact !== undefined) {
      const p = clamp(next.probability, 1, matrixSize);
      const im = clamp(next.impact, 1, matrixSize);
      next.risk_score = p * im;
    }
    onChange(next);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div>
        <label className="block text-sm text-gray-700">Date</label>
        <input
          type="date"
          className="mt-1 w-full border rounded-lg px-3 py-2"
          value={value.assessment_date}
          onChange={(e) => update({ assessment_date: e.target.value })}
          disabled={disabled}
        />
      </div>
      <div>
        <label className="block text-sm text-gray-700">Type</label>
        <select
          className="mt-1 w-full border rounded-lg px-3 py-2"
          value={value.assessment_type}
          onChange={(e) => update({ assessment_type: e.target.value as AssessmentFormValue["assessment_type"] })}
          disabled={disabled}
        >
          <option value="initial">Initial</option>
          <option value="periodic">Periodic</option>
          <option value="triggered">Triggered</option>
          <option value="ad_hoc">Ad hoc</option>
        </select>
      </div>

      <div>
        <label className="block text-sm text-gray-700">Probability (1-{matrixSize})</label>
        <div className="mt-1 flex items-center gap-2">
          <select
            className="w-full border rounded-lg px-3 py-2"
            value={value.probability}
            onChange={(e) => update({ probability: clamp(Number(e.target.value), 1, matrixSize) })}
            disabled={disabled}
          >
            {ranges.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm text-gray-700">Impact (1-{matrixSize})</label>
        <div className="mt-1 flex items-center gap-2">
          <select
            className="w-full border rounded-lg px-3 py-2"
            value={value.impact}
            onChange={(e) => update({ impact: clamp(Number(e.target.value), 1, matrixSize) })}
            disabled={disabled}
          >
            {ranges.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm text-gray-700">Score</label>
        <input
          type="number"
          className="mt-1 w-full border rounded-lg px-3 py-2"
          value={value.risk_score}
          onChange={(e) => update({ risk_score: Number(e.target.value) })}
          disabled={disabled}
        />
      </div>

      <div>
        <label className="block text-sm text-gray-700">Level</label>
        <select
          className="mt-1 w-full border rounded-lg px-3 py-2"
          value={value.risk_level}
          onChange={(e) => update({ risk_level: e.target.value as RiskLevel })}
          disabled={disabled}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      <div>
        <label className="block text-sm text-gray-700">Confidence</label>
        <select
          className="mt-1 w-full border rounded-lg px-3 py-2"
          value={value.confidence_level || "medium"}
          onChange={(e) => update({ confidence_level: e.target.value as "low" | "medium" | "high" })}
          disabled={disabled}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm text-gray-700">Notes</label>
        <textarea
          className="mt-1 w-full border rounded-lg px-3 py-2"
          rows={3}
          value={value.assessment_notes || ""}
          onChange={(e) => update({ assessment_notes: e.target.value })}
          disabled={disabled}
        />
      </div>

      <div className="md:col-span-2">
        <div className="text-[11px] text-gray-500">
          Matrix size: {matrixSize}x{matrixSize} (future compatible)
        </div>
      </div>
    </div>
  );
};

export default RiskAssessmentForm;