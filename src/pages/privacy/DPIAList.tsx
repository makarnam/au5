import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Plus, ShieldAlert, ClipboardList, CheckCircle2, XCircle, Search, Edit, Trash2, Eye } from "lucide-react";
import { privacyService, type Dpia as DpiaRecord, type DpiaStatus, type DpiaRisk } from "../../services/privacyService";
import PrivacyAIGenerator from "../../components/ai/PrivacyAIGenerator";

interface EditModalProps {
  dpia: DpiaRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (dpia: DpiaRecord) => void;
}

function EditModal({ dpia, isOpen, onClose, onSave }: EditModalProps) {
  const [formData, setFormData] = useState<Partial<DpiaRecord>>({});
  const [industry, setIndustry] = useState("Technology");
  const [dataSubjects, setDataSubjects] = useState<string[]>([]);
  const [dataCategories, setDataCategories] = useState<string[]>([]);

  useEffect(() => {
    if (dpia) {
      setFormData(dpia);
    } else {
      setFormData({
        title: "",
        description: "",
        owner: "",
        status: "draft",
        risk_level: "medium",
      });
    }
  }, [dpia]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title && formData.description) {
      onSave(formData as DpiaRecord);
    }
  };

  const handleAIGeneration = (field: "description" | "risk_assessment", content: string) => {
    if (field === "description") {
      setFormData(prev => ({ ...prev, description: content }));
    }
    // For risk assessment, we could add a separate field or enhance the description
    // For now, we'll append it to the description
    if (field === "risk_assessment") {
      setFormData(prev => ({ 
        ...prev, 
        description: prev.description ? `${prev.description}\n\nRisk Assessment:\n${content}` : content 
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">
          {dpia ? "Edit DPIA" : "New DPIA"}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              type="text"
              value={formData.title || ""}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Data Subjects (comma-separated)</label>
            <input
              type="text"
              value={dataSubjects.join(', ')}
              onChange={(e) => setDataSubjects(e.target.value.split(',').map(s => s.trim()).filter(s => s))}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Customers, Employees, Vendors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data Categories (comma-separated)</label>
            <input
              type="text"
              value={dataCategories.join(', ')}
              onChange={(e) => setDataCategories(e.target.value.split(',').map(s => s.trim()).filter(s => s))}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Personal Data, Financial Data, Health Data"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <div className="flex items-center gap-2 mb-2">
              <PrivacyAIGenerator
                fieldType="dpia_description"
                title={formData.title || ""}
                industry={industry}
                dataSubjects={dataSubjects}
                dataCategories={dataCategories}
                riskLevel={formData.risk_level || "medium"}
                onGenerated={(content) => handleAIGeneration("description", content)}
                disabled={!formData.title?.trim()}
              />
              <PrivacyAIGenerator
                fieldType="dpia_risk_assessment"
                title={formData.title || ""}
                industry={industry}
                dataSubjects={dataSubjects}
                dataCategories={dataCategories}
                riskLevel={formData.risk_level || "medium"}
                onGenerated={(content) => handleAIGeneration("risk_assessment", content)}
                disabled={!formData.title?.trim()}
              />
            </div>
            <textarea
              value={formData.description || ""}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={6}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Owner</label>
            <input
              type="text"
              value={formData.owner || ""}
              onChange={(e) => setFormData(prev => ({ ...prev, owner: e.target.value }))}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Privacy Office, CISO"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status || "draft"}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as DpiaStatus }))}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="draft">Draft</option>
                <option value="in_review">In Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Risk Level</label>
              <select
                value={formData.risk_level || "medium"}
                onChange={(e) => setFormData(prev => ({ ...prev, risk_level: e.target.value as DpiaRisk }))}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
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
              {dpia ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface ViewModalProps {
  dpia: DpiaRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

function ViewModal({ dpia, isOpen, onClose }: ViewModalProps) {
  if (!isOpen || !dpia) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold">DPIA Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{dpia.title}</h3>
            <p className="text-gray-600">{dpia.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Status</h4>
              <StatusPill status={dpia.status} />
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Risk Level</h4>
              <RiskPill level={dpia.risk_level} />
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Owner</h4>
              <p className="text-gray-600">{dpia.owner || "Not assigned"}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Created</h4>
              <p className="text-gray-600">{new Date(dpia.created_at).toLocaleDateString()}</p>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-2">Last Updated</h4>
            <p className="text-gray-600">{new Date(dpia.updated_at).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: DpiaStatus }) {
  const map: Record<DpiaStatus, { text: string; classes: string; Icon: React.ComponentType<any> }> = {
    draft: { text: "Draft", classes: "bg-gray-100 text-gray-800", Icon: ClipboardList },
    in_review: { text: "In Review", classes: "bg-yellow-100 text-yellow-800", Icon: Search },
    approved: { text: "Approved", classes: "bg-green-100 text-green-700", Icon: CheckCircle2 },
    rejected: { text: "Rejected", classes: "bg-red-100 text-red-700", Icon: XCircle },
  };
  const { text, classes, Icon } = map[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${classes}`}>
      <Icon className="w-3.5 h-3.5" /> {text}
    </span>
  );
}

function RiskPill({ level }: { level: DpiaRecord["risk_level"] }) {
  const classes =
    level === "critical"
      ? "bg-red-100 text-red-800"
      : level === "high"
      ? "bg-orange-100 text-orange-800"
      : level === "medium"
      ? "bg-yellow-100 text-yellow-800"
      : "bg-green-100 text-green-800";
  const text = level.charAt(0).toUpperCase() + level.slice(1);
  return <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${classes}`}>{text}</span>;
}

export default function DPIAList() {
  const [records, setRecords] = useState<DpiaRecord[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | DpiaStatus>("all");
  const [risk, setRisk] = useState<"all" | DpiaRecord["risk_level"]>("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingDpia, setEditingDpia] = useState<DpiaRecord | null>(null);
  const [viewingDpia, setViewingDpia] = useState<DpiaRecord | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const location = useLocation();

  useEffect(() => {
    // Check if we're on a create route
    if (location.pathname.includes('/create-dpia')) {
      setEditingDpia(null);
      setIsEditModalOpen(true);
    }
    
    // Load data
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, status, risk, location.pathname]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await privacyService.listDPIA({ search, status, risk });
      setRecords(list);
    } catch (error: any) {
      console.error("Failed to load DPIAs:", error);
      setError(`Failed to load DPIAs: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const addDpia = () => {
    setEditingDpia(null);
    setIsEditModalOpen(true);
  };

  const editDpia = (dpia: DpiaRecord) => {
    setEditingDpia(dpia);
    setIsEditModalOpen(true);
  };

  const viewDpia = (dpia: DpiaRecord) => {
    setViewingDpia(dpia);
    setIsViewModalOpen(true);
  };

  const handleSave = async (dpiaData: DpiaRecord) => {
    try {
      if (editingDpia) {
        await privacyService.updateDPIA(editingDpia.id, dpiaData);
      } else {
        await privacyService.createDPIA(dpiaData);
      }
      await load();
      setIsEditModalOpen(false);
      setEditingDpia(null);
    } catch (error: any) {
      console.error("Failed to save DPIA:", error);
      setError(`Failed to save DPIA: ${error.message || 'Unknown error'}`);
    }
  };

  const deleteDpia = async (id: string) => {
    if (!confirm("Are you sure you want to delete this DPIA?")) return;
    
    try {
      await privacyService.deleteDPIA(id);
    await load();
    } catch (error: any) {
      console.error("Failed to delete DPIA:", error);
      setError(`Failed to delete DPIA: ${error.message || 'Unknown error'}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <ShieldAlert className="w-7 h-7 text-blue-600" /> Privacy Impact Assessments (DPIA)
          </h1>
          <p className="text-gray-600 mt-2">Identify, assess, and document privacy risks for high-risk processing activities.</p>
        </div>
        <button 
          onClick={addDpia} 
          disabled={loading}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4 mr-2" /> New DPIA
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 flex flex-wrap gap-3 items-center">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search DPIAs"
            className="pl-9 pr-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as any)}
          className="px-3 py-2 border rounded-md text-sm"
        >
          <option value="all">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="in_review">In Review</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <select
          value={risk}
          onChange={(e) => setRisk(e.target.value as any)}
          className="px-3 py-2 border rounded-md text-sm"
        >
          <option value="all">All Risks</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                  Loading DPIAs...
                </td>
              </tr>
            ) : records.length > 0 ? (
              records.map((dpia) => (
                <tr key={dpia.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{dpia.title}</div>
                    {dpia.description && <div className="text-xs text-gray-500 mt-1 line-clamp-2">{dpia.description}</div>}
                </td>
                <td className="px-6 py-4">
                    <StatusPill status={dpia.status} />
                </td>
                <td className="px-6 py-4">
                    <RiskPill level={dpia.risk_level} />
                </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{dpia.owner || "-"}</td>
                <td className="px-6 py-4 text-sm text-gray-900">
                    <div>Created: {new Date(dpia.created_at).toLocaleDateString()}</div>
                    <div className="text-gray-500">Updated: {new Date(dpia.updated_at).toLocaleDateString()}</div>
                </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="flex gap-2">
                      <button
                        onClick={() => viewDpia(dpia)}
                        className="text-blue-600 hover:text-blue-800"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => editDpia(dpia)}
                        className="text-green-600 hover:text-green-800"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                  <button
                        onClick={() => deleteDpia(dpia.id)}
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
                  {search || status !== "all" || risk !== "all" ? "No DPIAs match your filters." : "No DPIAs found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      <EditModal
        dpia={editingDpia}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingDpia(null);
        }}
        onSave={handleSave}
      />

      {/* View Modal */}
      <ViewModal
        dpia={viewingDpia}
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setViewingDpia(null);
        }}
      />
    </div>
  );
}
