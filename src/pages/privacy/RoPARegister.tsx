import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { BookOpen, Building2, Users, Database, Plus, Search, Edit, Trash2, Eye, ShieldAlert } from "lucide-react";
import { privacyService, type Ropa as ProcessingActivity } from "../../services/privacyService";
import PrivacyAIGenerator from "../../components/ai/PrivacyAIGenerator";

interface EditModalProps {
  activity: ProcessingActivity | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (activity: ProcessingActivity) => void;
}

interface ViewModalProps {
  activity: ProcessingActivity | null;
  isOpen: boolean;
  onClose: () => void;
}

function ViewModal({ activity, isOpen, onClose }: ViewModalProps) {
  if (!isOpen || !activity) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Processing Activity Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-600" />
                Basic Information
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Activity Name</label>
                  <p className="mt-1 text-sm text-gray-900 font-medium">{activity.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Purpose</label>
                  <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{activity.purpose || "Not specified"}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-gray-600" />
                Controller & Processor
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Controller</label>
                  <p className="mt-1 text-sm text-gray-900">{activity.controller || "Not specified"}</p>
                </div>
                {activity.processor && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Processor</label>
                    <p className="mt-1 text-sm text-gray-900">{activity.processor}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Data & Legal Information */}
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Users className="w-5 h-5 text-green-600" />
                Data Subjects & Categories
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Data Subjects</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {Array.isArray(activity.data_subjects) && activity.data_subjects.length > 0 
                      ? activity.data_subjects.join(", ") 
                      : "Not specified"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Data Categories</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {Array.isArray(activity.data_categories) && activity.data_categories.length > 0 
                      ? activity.data_categories.join(", ") 
                      : "Not specified"}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-600" />
                Recipients & Transfers
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Recipients</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {Array.isArray(activity.recipients) && activity.recipients.length > 0 
                      ? activity.recipients.join(", ") 
                      : "Not specified"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Transfers</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {Array.isArray(activity.transfers) && activity.transfers.length > 0 
                      ? activity.transfers.join(", ") 
                      : "Not specified"}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-orange-600" />
                Retention & Legal Basis
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Retention Period</label>
                  <p className="mt-1 text-sm text-gray-900">{activity.retention || "Not specified"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Legal Basis</label>
                  <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{activity.legal_basis || "Not specified"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border rounded-md hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function EditModal({ activity, isOpen, onClose, onSave }: EditModalProps) {
  const [formData, setFormData] = useState<Partial<ProcessingActivity>>({});
  const [industry, setIndustry] = useState("Technology");

  useEffect(() => {
    if (activity) {
      setFormData(activity);
    } else {
      setFormData({
        name: "",
        purpose: "",
        controller: "",
        processor: "",
        data_subjects: [],
        data_categories: [],
        recipients: [],
        transfers: [],
        retention: "",
        legal_basis: "",
      });
    }
  }, [activity]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.purpose && formData.controller) {
      onSave(formData as ProcessingActivity);
    }
  };

  const handleArrayInput = (field: keyof ProcessingActivity, value: string) => {
    const arrayValue = value.split(',').map(item => item.trim()).filter(item => item);
    setFormData(prev => ({ ...prev, [field]: arrayValue }));
  };

  const handleAIGeneration = (field: "purpose" | "legal_basis", content: string) => {
    if (field === "purpose") {
      setFormData(prev => ({ ...prev, purpose: content }));
    }
    if (field === "legal_basis") {
      setFormData(prev => ({ ...prev, legal_basis: content }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">
          {activity ? "Edit Processing Activity" : "New Processing Activity"}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input
              type="text"
              value={formData.name || ""}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Technology">Technology</option>
              <option value="Financial Services">Financial Services</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Manufacturing">Manufacturing</option>
              <option value="Retail">Retail</option>
              <option value="Government">Government</option>
              <option value="Education">Education</option>
              <option value="Energy">Energy</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Purpose *</label>
            <div className="flex items-center gap-2 mb-2">
              <PrivacyAIGenerator
                fieldType="ropa_purpose"
                title={formData.name || ""}
                industry={industry}
                dataSubjects={Array.isArray(formData.data_subjects) ? formData.data_subjects : []}
                dataCategories={Array.isArray(formData.data_categories) ? formData.data_categories : []}
                onGenerated={(content) => handleAIGeneration("purpose", content)}
                disabled={!formData.name?.trim()}
              />
            </div>
            <textarea
              value={formData.purpose || ""}
              onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
              rows={6}
              placeholder="Describe the purpose of this processing activity..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Controller *</label>
              <input
                type="text"
                value={formData.controller || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, controller: e.target.value }))}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Processor</label>
              <input
                type="text"
                value={formData.processor || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, processor: e.target.value }))}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data Subjects (comma-separated)</label>
              <input
                type="text"
                value={Array.isArray(formData.data_subjects) ? formData.data_subjects.join(', ') : ""}
                onChange={(e) => handleArrayInput('data_subjects', e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Customers, Employees, Visitors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data Categories (comma-separated)</label>
              <input
                type="text"
                value={Array.isArray(formData.data_categories) ? formData.data_categories.join(', ') : ""}
                onChange={(e) => handleArrayInput('data_categories', e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Personal, Financial, Health"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Recipients (comma-separated)</label>
              <input
                type="text"
                value={Array.isArray(formData.recipients) ? formData.recipients.join(', ') : ""}
                onChange={(e) => handleArrayInput('recipients', e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Marketing Partners, Tax Authority"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Transfers (comma-separated)</label>
              <input
                type="text"
                value={Array.isArray(formData.transfers) ? formData.transfers.join(', ') : ""}
                onChange={(e) => handleArrayInput('transfers', e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., US, EU, UK"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Retention Period</label>
              <input
                type="text"
                value={formData.retention || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, retention: e.target.value }))}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 7 years post-employment"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Legal Basis</label>
              <div className="flex items-center gap-2 mb-2">
                <PrivacyAIGenerator
                  fieldType="ropa_legal_basis"
                  title={formData.name || ""}
                  industry={industry}
                  dataSubjects={Array.isArray(formData.data_subjects) ? formData.data_subjects : []}
                  dataCategories={Array.isArray(formData.data_categories) ? formData.data_categories : []}
                  onGenerated={(content) => handleAIGeneration("legal_basis", content)}
                  disabled={!formData.name?.trim()}
                />
              </div>
              <textarea
                value={formData.legal_basis || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, legal_basis: e.target.value }))}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                rows={4}
                placeholder="e.g., Legitimate interests, Consent, Contractual necessity..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {activity ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function RoPARegister() {
  const [activities, setActivities] = useState<ProcessingActivity[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingActivity, setEditingActivity] = useState<ProcessingActivity | null>(null);
  const [viewingActivity, setViewingActivity] = useState<ProcessingActivity | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const location = useLocation();

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("Loading RoPA activities...");
      const list = await privacyService.listRoPA({ search });
      console.log("Loaded activities:", list);
      setActivities(list);
    } catch (error: any) {
      console.error("Failed to load RoPA activities:", error);
      setError(`Failed to load processing activities: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if we're on a create route
    if (location.pathname.includes('/create-ropa')) {
      setEditingActivity(null);
      setIsModalOpen(true);
    }
    
    // Load data
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, location.pathname]);

  const addActivity = () => {
    setEditingActivity(null);
    setIsModalOpen(true);
  };

  const editActivity = (activity: ProcessingActivity) => {
    setEditingActivity(activity);
    setIsModalOpen(true);
  };

  const viewActivity = (activity: ProcessingActivity) => {
    setViewingActivity(activity);
    setIsViewModalOpen(true);
  };

  const handleSave = async (activityData: ProcessingActivity) => {
    try {
      if (editingActivity) {
        await privacyService.updateRoPA(editingActivity.id, activityData);
      } else {
        await privacyService.createRoPA(activityData);
      }
      await load();
      setIsModalOpen(false);
      setEditingActivity(null);
    } catch (error) {
      console.error("Failed to save activity:", error);
    }
  };

  const deleteActivity = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this processing activity?")) {
      try {
        await privacyService.deleteRoPA(id);
        await load();
      } catch (error) {
        console.error("Failed to delete activity:", error);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Records of Processing Activities (RoPA)</h1>
          <p className="text-gray-600 mt-1">Manage and track data processing activities for GDPR compliance</p>
        </div>
        <button
          onClick={addActivity}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Activity
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search activities"
            className="pl-9 pr-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Controller/Processor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subjects & Data</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recipients/Transfers</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Retention/Basis</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                  Loading activities...
                </td>
              </tr>
            ) : activities.length > 0 ? (
              activities.map((activity: ProcessingActivity) => (
                <tr key={activity.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900 flex items-center gap-2">
                      <Database className="w-4 h-4 text-blue-600" /> {activity.name}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 line-clamp-2">{activity.purpose}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-gray-400" /> {activity.controller || "-"}
                    </div>
                    {activity.processor && (
                      <div className="text-xs text-gray-600 ml-6">Processor: {activity.processor}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" /> {activity.data_subjects.join(", ") || "-"}
                    </div>
                    <div className="text-xs text-gray-600 ml-6">Data: {activity.data_categories.join(", ") || "-"}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div>Recipients: {activity.recipients?.join(", ") || "-"}</div>
                    <div className="text-xs text-gray-600">Transfers: {activity.transfers?.join(", ") || "-"}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="line-clamp-2">Retention: {activity.retention || "-"}</div>
                    <div className="text-xs text-gray-600 line-clamp-2">Legal basis: {activity.legal_basis || "-"}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="flex gap-2">
                      <button
                        onClick={() => viewActivity(activity)}
                        className="text-green-600 hover:text-green-800"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => editActivity(activity)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteActivity(activity.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                  {search ? "No processing activities found matching your search." : "No processing activities found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      <EditModal
        activity={editingActivity}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingActivity(null);
        }}
        onSave={handleSave}
      />

      {/* View Modal */}
      <ViewModal
        activity={viewingActivity}
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setViewingActivity(null);
        }}
      />
    </div>
  );
}
