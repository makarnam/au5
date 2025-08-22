import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Wand2, AlertTriangle } from "lucide-react";
import { toast } from "react-hot-toast";
import IncidentAIGenerator from "../../components/ai/IncidentAIGenerator";

interface IncidentFormData {
  title: string;
  incident_type: string;
  severity: string;
  business_unit: string;
  description: string;
  response_procedures: string;
  root_cause_analysis: string;
  lessons_learned: string;
  affected_systems: string[];
  stakeholders: string[];
  status: string;
  discovered_date: string;
  reported_by: string;
}

const incidentTypes = [
  "security",
  "operational",
  "technical",
  "compliance",
  "third_party",
  "resilience",
  "other"
];

const severityLevels = ["low", "medium", "high", "critical"];
const statusOptions = ["open", "investigating", "resolved", "closed"];

export default function CreateIncidentPage() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<IncidentFormData>({
    title: "",
    incident_type: "security",
    severity: "medium",
    business_unit: "IT",
    description: "",
    response_procedures: "",
    root_cause_analysis: "",
    lessons_learned: "",
    affected_systems: [],
    stakeholders: [],
    status: "open",
    discovered_date: new Date().toISOString().split('T')[0],
    reported_by: "",
  });

  const [newSystem, setNewSystem] = useState("");
  const [newStakeholder, setNewStakeholder] = useState("");

  const handleChange = (field: keyof IncidentFormData, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const addAffectedSystem = () => {
    if (newSystem.trim() && !form.affected_systems.includes(newSystem.trim())) {
      handleChange("affected_systems", [...form.affected_systems, newSystem.trim()]);
      setNewSystem("");
    }
  };

  const removeAffectedSystem = (system: string) => {
    handleChange("affected_systems", form.affected_systems.filter(s => s !== system));
  };

  const addStakeholder = () => {
    if (newStakeholder.trim() && !form.stakeholders.includes(newStakeholder.trim())) {
      handleChange("stakeholders", [...form.stakeholders, newStakeholder.trim()]);
      setNewStakeholder("");
    }
  };

  const removeStakeholder = (stakeholder: string) => {
    handleChange("stakeholders", form.stakeholders.filter(s => s !== stakeholder));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.incident_type) {
      toast.error("Title and Incident Type are required");
      return;
    }

    try {
      setSaving(true);
      // TODO: Implement incident service when backend is available
      console.log("Creating incident:", form);
      toast.success("Incident created successfully!");
      navigate("/incidents");
    } catch (error) {
      console.error("Error creating incident:", error);
      toast.error("Failed to create incident");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <button
        className="inline-flex items-center text-sm text-gray-600 hover:text-blue-600"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </button>

      <h1 className="text-3xl font-bold text-gray-900 mt-4 mb-6">Create Incident</h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
            Basic Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => handleChange("title", e.target.value)}
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Incident title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Incident Type *</label>
              <select
                value={form.incident_type}
                onChange={(e) => handleChange("incident_type", e.target.value)}
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                {incidentTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Severity</label>
              <select
                value={form.severity}
                onChange={(e) => handleChange("severity", e.target.value)}
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {severityLevels.map((level) => (
                  <option key={level} value={level}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Business Unit</label>
              <input
                type="text"
                value={form.business_unit}
                onChange={(e) => handleChange("business_unit", e.target.value)}
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., IT, Operations, Finance"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                value={form.status}
                onChange={(e) => handleChange("status", e.target.value)}
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Discovered Date</label>
              <input
                type="date"
                value={form.discovered_date}
                onChange={(e) => handleChange("discovered_date", e.target.value)}
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Reported By</label>
              <input
                type="text"
                value={form.reported_by}
                onChange={(e) => handleChange("reported_by", e.target.value)}
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Name of person who reported"
              />
            </div>
          </div>
        </div>

        {/* Affected Systems */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Affected Systems</h2>
          
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newSystem}
              onChange={(e) => setNewSystem(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter affected system"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAffectedSystem())}
            />
            <button
              type="button"
              onClick={addAffectedSystem}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add
            </button>
          </div>

          {form.affected_systems.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {form.affected_systems.map((system, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                >
                  {system}
                  <button
                    type="button"
                    onClick={() => removeAffectedSystem(system)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Stakeholders */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Stakeholders</h2>
          
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newStakeholder}
              onChange={(e) => setNewStakeholder(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter stakeholder name"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addStakeholder())}
            />
            <button
              type="button"
              onClick={addStakeholder}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add
            </button>
          </div>

          {form.stakeholders.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {form.stakeholders.map((stakeholder, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
                >
                  {stakeholder}
                  <button
                    type="button"
                    onClick={() => removeStakeholder(stakeholder)}
                    className="ml-2 text-green-600 hover:text-green-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* AI-Generated Content Sections */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Wand2 className="w-5 h-5 mr-2 text-purple-600" />
            AI-Generated Content
          </h2>
          
          <div className="space-y-6">
            {/* Incident Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                placeholder="Describe the incident..."
              />
              <div className="mt-2">
                <IncidentAIGenerator
                  fieldType="incident_description"
                  title={form.title}
                  incidentType={form.incident_type}
                  severity={form.severity}
                  businessUnit={form.business_unit}
                  affectedSystems={form.affected_systems}
                  stakeholders={form.stakeholders}
                  onGenerated={(content) => handleChange("description", content)}
                  disabled={!form.title}
                />
              </div>
            </div>

            {/* Response Procedures */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Response Procedures</label>
              <textarea
                value={form.response_procedures}
                onChange={(e) => handleChange("response_procedures", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                placeholder="Document response procedures..."
              />
              <div className="mt-2">
                <IncidentAIGenerator
                  fieldType="response_procedures"
                  title={form.title}
                  incidentType={form.incident_type}
                  severity={form.severity}
                  businessUnit={form.business_unit}
                  affectedSystems={form.affected_systems}
                  stakeholders={form.stakeholders}
                  onGenerated={(content) => handleChange("response_procedures", content)}
                  disabled={!form.title}
                />
              </div>
            </div>

            {/* Root Cause Analysis */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Root Cause Analysis</label>
              <textarea
                value={form.root_cause_analysis}
                onChange={(e) => handleChange("root_cause_analysis", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                placeholder="Analyze the root cause..."
              />
              <div className="mt-2">
                <IncidentAIGenerator
                  fieldType="root_cause_analysis"
                  title={form.title}
                  incidentType={form.incident_type}
                  severity={form.severity}
                  businessUnit={form.business_unit}
                  affectedSystems={form.affected_systems}
                  stakeholders={form.stakeholders}
                  onGenerated={(content) => handleChange("root_cause_analysis", content)}
                  disabled={!form.title}
                />
              </div>
            </div>

            {/* Lessons Learned */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Lessons Learned</label>
              <textarea
                value={form.lessons_learned}
                onChange={(e) => handleChange("lessons_learned", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                placeholder="Document lessons learned..."
              />
              <div className="mt-2">
                <IncidentAIGenerator
                  fieldType="lessons_learned"
                  title={form.title}
                  incidentType={form.incident_type}
                  severity={form.severity}
                  businessUnit={form.business_unit}
                  affectedSystems={form.affected_systems}
                  stakeholders={form.stakeholders}
                  onGenerated={(content) => handleChange("lessons_learned", content)}
                  disabled={!form.title}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Create Incident
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
