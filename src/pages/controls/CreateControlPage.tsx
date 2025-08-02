import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Bot, Plus, Shield } from "lucide-react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { ControlFormData, Audit } from "../../types";
import { controlService } from "../../services/controlService";
import { auditService } from "../../services/auditService";
import ControlForm from "../../components/controls/ControlForm";
import AIControlGenerator from "../../components/controls/AIControlGenerator";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function CreateControlPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { auditId, controlSetId } = useParams<{ auditId: string; controlSetId: string }>();

  const [audit, setAudit] = useState<Audit | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [mode, setMode] = useState<'single' | 'ai'>('single');

  useEffect(() => {
    loadAuditData();
  }, [auditId]);

  const loadAuditData = async () => {
    if (!auditId) return;

    try {
      setLoading(true);
      const auditData = await auditService.getAudit(auditId);
      if (auditData) {
        setAudit(auditData);
      } else {
        toast.error("Audit not found");
        navigate("/audits");
      }
    } catch (error) {
      console.error("Error loading audit:", error);
      toast.error("Failed to load audit data");
      navigate("/audits");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateControl = async (data: ControlFormData) => {
    if (!auditId || !controlSetId) {
      toast.error("Missing audit or control set information");
      return;
    }

    try {
      setIsCreating(true);

      await controlService.createControl({
        ...data,
        control_set_id: controlSetId,
        audit_id: auditId,
      });

      toast.success("Control created successfully!");
      navigate(`/audits/${auditId}/controls`);
    } catch (error) {
      console.error("Error creating control:", error);
      toast.error("Failed to create control");
    } finally {
      setIsCreating(false);
    }
  };

  const handleAIGeneration = async (controls: ControlFormData[]) => {
    if (!auditId || !controlSetId) {
      toast.error("Missing audit or control set information");
      return;
    }

    try {
      setIsCreating(true);

      // Create all generated controls
      for (const controlData of controls) {
        await controlService.createControl({
          ...controlData,
          control_set_id: controlSetId,
          audit_id: auditId,
        });
      }

      toast.success(`Created ${controls.length} controls successfully!`);
      navigate(`/audits/${auditId}/controls`);
    } catch (error) {
      console.error("Error creating AI-generated controls:", error);
      toast.error("Failed to create controls");
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancel = () => {
    navigate(`/audits/${auditId}/controls`);
  };

  if (loading) {
    return (
      <div className="p-6">
        <LoadingSpinner size="lg" text="Loading audit data..." />
      </div>
    );
  }

  if (!audit) {
    return (
      <div className="p-6">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Audit Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The requested audit could not be found.
          </p>
          <button
            onClick={() => navigate("/audits")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Audits
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(`/audits/${auditId}/controls`)}
            className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Controls
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Create Controls - {audit.title}
              </h1>
              <p className="text-gray-600 mt-1">
                Add new controls to your audit
              </p>
            </div>

            {/* Mode Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setMode('single')}
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  mode === 'single'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Plus className="w-4 h-4 mr-2" />
                Single Control
              </button>
              <button
                onClick={() => setMode('ai')}
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  mode === 'ai'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Bot className="w-4 h-4 mr-2" />
                AI Generate
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {mode === 'single' ? (
          <ControlForm
            mode="create"
            onSave={handleCreateControl}
            onCancel={handleCancel}
            isLoading={isCreating}
          />
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="text-center mb-8">
              <Bot className="w-16 h-16 text-purple-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                AI Control Generation
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Generate multiple controls automatically using AI based on your audit type,
                business unit, and control framework. Perfect for quickly establishing
                comprehensive control sets.
              </p>
            </div>

            <div className="max-w-md mx-auto">
              <button
                onClick={() => setShowAIGenerator(true)}
                disabled={isCreating}
                className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                <Bot className="w-5 h-5 mr-2" />
                Start AI Generation
              </button>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Shield className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <h3 className="font-medium text-purple-900 mb-1">Smart Controls</h3>
                <p className="text-sm text-purple-700">
                  AI generates relevant controls based on industry best practices
                </p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Bot className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-medium text-blue-900 mb-1">Time Saving</h3>
                <p className="text-sm text-blue-700">
                  Create multiple controls in minutes instead of hours
                </p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Plus className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-medium text-green-900 mb-1">Customizable</h3>
                <p className="text-sm text-green-700">
                  Review and modify generated controls before saving
                </p>
              </div>
            </div>
          </div>
        )}

        {/* AI Generator Modal */}
        <AIControlGenerator
          isOpen={showAIGenerator}
          auditType={audit.audit_type}
          businessUnit={audit.business_unit_id}
          onGenerated={handleAIGeneration}
          onClose={() => setShowAIGenerator(false)}
        />
      </div>
    </div>
  );
}
