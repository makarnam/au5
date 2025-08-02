import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Bot,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Calendar,
  Settings,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuthStore } from "../../store/authStore";
import { Control, ControlSet, ControlFormData, ControlType, ControlFrequency, ControlEffectiveness } from "../../types";
import { controlService } from "../../services/controlService";
import { userService } from "../../services/userService";
import LoadingSpinner from "../LoadingSpinner";
import { formatDate, cn } from "../../utils";
import ControlForm from "./ControlForm";
import AIControlGenerator from "./AIControlGenerator";

interface ControlEditorProps {
  controlSetId: string;
  embedded?: boolean;
}

const ControlEditor: React.FC<ControlEditorProps> = ({
  controlSetId,
  embedded = false,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { checkPermission } = useAuthStore();

  const [controlSet, setControlSet] = useState<ControlSet | null>(null);
  const [controls, setControls] = useState<Control[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<ControlType | "">("");
  const [filterEffectiveness, setFilterEffectiveness] = useState<ControlEffectiveness | "">("");
  const [sortBy, setSortBy] = useState<"control_code" | "title" | "created_at" | "effectiveness">("control_code");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Modal states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [editingControl, setEditingControl] = useState<Control | null>(null);
  const [selectedControls, setSelectedControls] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, [controlSetId, sortBy, sortOrder]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [controlSetData, controlsData, usersData] = await Promise.all([
        controlService.getControlSet(controlSetId),
        controlService.getControlsBySet(controlSetId),
        userService.getUsers(),
      ]);

      setControlSet(controlSetData);
      setUsers(usersData);

      // Sort controls
      const sortedControls = [...controlsData].sort((a, b) => {
        let aValue: any = a[sortBy];
        let bValue: any = b[sortBy];

        if (sortBy === "created_at") {
          aValue = new Date(aValue);
          bValue = new Date(bValue);
        }

        if (sortOrder === "asc") {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });

      setControls(sortedControls);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load controls");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateControl = async (data: ControlFormData) => {
    try {
      const newControl = await controlService.createControl(controlSetId, data);
      setControls(prev => [newControl, ...prev]);
      setShowCreateForm(false);
      toast.success("Control created successfully");
    } catch (error) {
      console.error("Error creating control:", error);
      toast.error("Failed to create control");
    }
  };

  const handleUpdateControl = async (id: string, data: ControlFormData) => {
    try {
      const updatedControl = await controlService.updateControl(id, data);
      setControls(prev =>
        prev.map(control => control.id === id ? updatedControl : control)
      );
      setEditingControl(null);
      toast.success("Control updated successfully");
    } catch (error) {
      console.error("Error updating control:", error);
      toast.error("Failed to update control");
    }
  };

  const handleDeleteControl = async (controlId: string) => {
    if (!window.confirm("Are you sure you want to delete this control?")) {
      return;
    }

    try {
      await controlService.deleteControl(controlId);
      setControls(prev => prev.filter(control => control.id !== controlId));
      setSelectedControls(prev => prev.filter(id => id !== controlId));
      toast.success("Control deleted successfully");
    } catch (error) {
      console.error("Error deleting control:", error);
      toast.error("Failed to delete control");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedControls.length === 0) return;

    if (!window.confirm(`Are you sure you want to delete ${selectedControls.length} selected control(s)?`)) {
      return;
    }

    try {
      await Promise.all(
        selectedControls.map(id => controlService.deleteControl(id))
      );
      setControls(prev => prev.filter(control => !selectedControls.includes(control.id)));
      setSelectedControls([]);
      toast.success(`${selectedControls.length} control(s) deleted successfully`);
    } catch (error) {
      console.error("Error deleting controls:", error);
      toast.error("Failed to delete some controls");
    }
  };

  const getEffectivenessColor = (effectiveness: ControlEffectiveness) => {
    switch (effectiveness) {
      case "effective": return "text-green-600";
      case "partially_effective": return "text-yellow-600";
      case "ineffective": return "text-red-600";
      default: return "text-gray-500";
    }
  };

  const getEffectivenessIcon = (effectiveness: ControlEffectiveness) => {
    switch (effectiveness) {
      case "effective": return <CheckCircle className="w-4 h-4" />;
      case "partially_effective": return <AlertCircle className="w-4 h-4" />;
      case "ineffective": return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getUserName = (userId?: string) => {
    if (!userId) return "Unassigned";
    const user = users.find(u => u.id === userId);
    return user ? `${user.first_name} ${user.last_name}` : "Unknown User";
  };

  const filteredControls = controls.filter(control => {
    const matchesSearch =
      control.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      control.control_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      control.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      control.process_area.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = !filterType || control.control_type === filterType;
    const matchesEffectiveness = !filterEffectiveness || control.effectiveness === filterEffectiveness;

    return matchesSearch && matchesType && matchesEffectiveness;
  });

  const stats = {
    total: controls.length,
    effective: controls.filter(c => c.effectiveness === "effective").length,
    partiallyEffective: controls.filter(c => c.effectiveness === "partially_effective").length,
    ineffective: controls.filter(c => c.effectiveness === "ineffective").length,
    notTested: controls.filter(c => c.effectiveness === "not_tested").length,
    automated: controls.filter(c => c.is_automated).length,
  };

  if (loading) {
    return (
      <div className="p-6">
        <LoadingSpinner size="lg" text="Loading controls..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center">
          {!embedded && (
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors mr-3"
            >
              <ArrowLeft className="w-5 h-5 text-gray-500" />
            </button>
          )}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {controlSet?.name} Controls
            </h1>
            <p className="text-gray-600 mt-2">
              {controlSet?.description}
            </p>
            <div className="flex items-center mt-2 text-sm text-gray-500">
              <Settings className="w-4 h-4 mr-1" />
              Framework: {controlSet?.framework}
            </div>
          </div>
        </div>

        {checkPermission(["auditor", "supervisor_auditor", "admin"]) && (
          <div className="flex space-x-3 mt-4 sm:mt-0">
            {selectedControls.length > 0 && (
              <button
                onClick={handleBulkDelete}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete ({selectedControls.length})
              </button>
            )}

            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Control
            </button>

            <button
              onClick={() => setShowAIGenerator(true)}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
            >
              <Bot className="w-4 h-4 mr-2" />
              AI Generate
            </button>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm font-medium text-gray-500">Total</p>
          <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm font-medium text-gray-500">Effective</p>
          <p className="text-2xl font-semibold text-green-600">{stats.effective}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm font-medium text-gray-500">Partial</p>
          <p className="text-2xl font-semibold text-yellow-600">{stats.partiallyEffective}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm font-medium text-gray-500">Ineffective</p>
          <p className="text-2xl font-semibold text-red-600">{stats.ineffective}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm font-medium text-gray-500">Not Tested</p>
          <p className="text-2xl font-semibold text-gray-500">{stats.notTested}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm font-medium text-gray-500">Automated</p>
          <p className="text-2xl font-semibold text-blue-600">{stats.automated}</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search controls..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as ControlType | "")}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              <option value="preventive">Preventive</option>
              <option value="detective">Detective</option>
              <option value="corrective">Corrective</option>
              <option value="directive">Directive</option>
            </select>

            <select
              value={filterEffectiveness}
              onChange={(e) => setFilterEffectiveness(e.target.value as ControlEffectiveness | "")}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Effectiveness</option>
              <option value="effective">Effective</option>
              <option value="partially_effective">Partially Effective</option>
              <option value="ineffective">Ineffective</option>
              <option value="not_tested">Not Tested</option>
            </select>

            <select
              value={`${sortBy}_${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('_');
                setSortBy(field as any);
                setSortOrder(order as any);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="control_code_asc">Code (A-Z)</option>
              <option value="control_code_desc">Code (Z-A)</option>
              <option value="title_asc">Title (A-Z)</option>
              <option value="title_desc">Title (Z-A)</option>
              <option value="created_at_desc">Newest First</option>
              <option value="created_at_asc">Oldest First</option>
              <option value="effectiveness_asc">Effectiveness</option>
            </select>
          </div>
        </div>
      </div>

      {/* Controls Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedControls.length === filteredControls.length && filteredControls.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedControls(filteredControls.map(c => c.id));
                      } else {
                        setSelectedControls([]);
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Control
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Effectiveness
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Owner
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Frequency
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredControls.map((control) => (
                <tr key={control.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedControls.includes(control.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedControls(prev => [...prev, control.id]);
                        } else {
                          setSelectedControls(prev => prev.filter(id => id !== control.id));
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-start">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-gray-900">
                            {control.control_code}
                          </p>
                          {control.ai_generated && (
                            <Bot className="w-4 h-4 text-purple-600 ml-2" title="AI Generated" />
                          )}
                          {control.is_automated && (
                            <Settings className="w-4 h-4 text-blue-600 ml-2" title="Automated" />
                          )}
                        </div>
                        <p className="text-sm text-gray-900 font-medium mt-1">{control.title}</p>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{control.description}</p>
                        <p className="text-xs text-gray-400 mt-1">{control.process_area}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={cn(
                      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                      control.control_type === "preventive" && "bg-green-100 text-green-800",
                      control.control_type === "detective" && "bg-blue-100 text-blue-800",
                      control.control_type === "corrective" && "bg-yellow-100 text-yellow-800",
                      control.control_type === "directive" && "bg-purple-100 text-purple-800"
                    )}>
                      {control.control_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={cn("flex items-center", getEffectivenessColor(control.effectiveness))}>
                      {getEffectivenessIcon(control.effectiveness)}
                      <span className="ml-2 text-sm capitalize">
                        {control.effectiveness.replace('_', ' ')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">
                        {getUserName(control.owner_id)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900 capitalize">
                      {control.frequency.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => navigate(`/controls/${controlSetId}/control/${control.id}`)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {checkPermission(["auditor", "supervisor_auditor", "admin"]) && (
                        <>
                          <button
                            onClick={() => setEditingControl(control)}
                            className="text-green-600 hover:text-green-900"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteControl(control.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredControls.length === 0 && (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No controls found
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filterType || filterEffectiveness
                ? "Try adjusting your search criteria"
                : "Get started by adding your first control"}
            </p>
            {checkPermission(["auditor", "supervisor_auditor", "admin"]) && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Control
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateForm && (
        <ControlForm
          controlSetId={controlSetId}
          users={users}
          onSubmit={handleCreateControl}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {editingControl && (
        <ControlForm
          controlSetId={controlSetId}
          users={users}
          control={editingControl}
          onSubmit={(data) => handleUpdateControl(editingControl.id, data)}
          onCancel={() => setEditingControl(null)}
        />
      )}

      {showAIGenerator && (
        <AIControlGenerator
          controlSetId={controlSetId}
          framework={controlSet?.framework}
          onSuccess={(newControls) => {
            setControls(prev => [...newControls, ...prev]);
            setShowAIGenerator(false);
          }}
          onCancel={() => setShowAIGenerator(false)}
        />
      )}
    </div>
  );
};

export default ControlEditor;
