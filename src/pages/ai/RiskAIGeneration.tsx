import React, { useState } from "react";
import { ArrowLeft, Wand2, Check, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import AIGenerator from "../../components/ai/AIGenerator";

export default function RiskAIGeneration() {
  const navigate = useNavigate();

  // Local risk template fields we want to generate
  const [title, setTitle] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [riskSource, setRiskSource] = useState<string>("");

  const [description, setDescription] = useState<string>("");
  const [mitigation, setMitigation] = useState<string>("");

  const handleUseInCreate = () => {
    if (!title || !category) {
      toast.error("Please provide Title and Category to proceed");
      return;
    }
    // Simple navigation back to create risk page; user can paste values
    navigate("/risks/create", { replace: false });
    toast.success("Open 'Create Risk' and paste the generated fields");
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <button
        className="inline-flex items-center text-sm text-gray-600 hover:text-blue-600"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </button>

      <div className="flex items-center justify-between mt-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Risk AI Generation</h1>
        <div className="flex items-center text-sm text-gray-600">
          <Settings className="w-4 h-4 mr-1" />
          Configure AI in any generator modal
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Risk title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Category *</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="e.g., Operational / Compliance / Technology"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Risk Source (Optional)</label>
            <input
              type="text"
              value={riskSource}
              onChange={(e) => setRiskSource(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Context or source (e.g., Supplier, Process, Asset)"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Description with AI */}
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <AIGenerator
                fieldType="description"
                auditData={{
                  title: title || "Risk",
                  audit_type: "risk",
                  business_unit: category || "General",
                  scope: riskSource || "",
                }}
                currentValue={description}
                onGenerated={(content) => {
                  const text = Array.isArray(content) ? content.join("\n") : content;
                  setDescription(text);
                }}
                className="ml-2"
              />
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={8}
              className="mt-2 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="AI will generate a comprehensive description for this risk"
            />
          </div>

          {/* Mitigation with AI */}
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">Mitigation Strategy</label>
              <AIGenerator
                fieldType="methodology"
                auditData={{
                  title: title || "Risk Mitigation",
                  audit_type: "risk",
                  business_unit: category || "General",
                  scope: `Mitigation for risk: ${title}`,
                }}
                currentValue={mitigation}
                onGenerated={(content) => {
                  const text = Array.isArray(content) ? content.join("\n") : content;
                  setMitigation(text);
                }}
                className="ml-2"
              />
            </div>
            <textarea
              value={mitigation}
              onChange={(e) => setMitigation(e.target.value)}
              rows={8}
              className="mt-2 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="AI will generate suggested mitigation/treatment plan"
            />
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3">
          <button
            onClick={() => {
              setDescription("");
              setMitigation("");
              toast.success("Cleared generated fields");
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Reset
          </button>
          <button
            onClick={handleUseInCreate}
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Check className="w-4 h-4 mr-2" />
            Use in Create Risk
          </button>
        </div>

        <div className="mt-2 rounded-lg p-4 bg-purple-50">
          <div className="flex items-center text-sm text-purple-800">
            <Wand2 className="w-4 h-4 mr-2" />
            Generated content uses your configured AI provider (Ollama/OpenAI/Claude/Gemini). Open the AI modal to manage providers.
          </div>
        </div>
      </div>
    </div>
  );
}