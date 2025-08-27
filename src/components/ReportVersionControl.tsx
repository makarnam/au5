import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GitBranch,
  GitCompare,
  RotateCcw,
  Clock,
  User,
  MessageSquare,
  Tag,
  ChevronDown,
  ChevronRight,
  Eye,
  Download,
  History,
  ArrowLeft,
  ArrowRight,
  Diff,
} from "lucide-react";

import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";

import {
  reportVersionControlService,
  ReportVersion,
  TemplateVersion,
  VersionComparison
} from "../services/reportVersionControlService";

interface ReportVersionControlProps {
  entityId: string;
  entityType: 'report' | 'template';
  currentContent: any;
  onRestore: (versionContent: any) => void;
  onUpdate: () => void;
}

export const ReportVersionControl: React.FC<ReportVersionControlProps> = ({
  entityId,
  entityType,
  currentContent,
  onRestore,
  onUpdate,
}) => {
  const [versions, setVersions] = useState<(ReportVersion | TemplateVersion)[]>([]);
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);
  const [comparison, setComparison] = useState<VersionComparison | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingVersion, setIsCreatingVersion] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newVersionLabel, setNewVersionLabel] = useState('');
  const [newVersionSummary, setNewVersionSummary] = useState('');
  const [newVersionReason, setNewVersionReason] = useState('');

  // Load versions on mount
  useEffect(() => {
    loadVersions();
  }, [entityId, entityType]);

  const loadVersions = async () => {
    setIsLoading(true);
    try {
      const data = entityType === 'report'
        ? await reportVersionControlService.getReportVersions(entityId)
        : await reportVersionControlService.getTemplateVersions(entityId);
      setVersions(data);
    } catch (error) {
      console.error('Error loading versions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateVersion = async () => {
    if (!newVersionSummary.trim()) return;

    setIsCreatingVersion(true);
    try {
      if (entityType === 'report') {
        await reportVersionControlService.createReportVersion(
          entityId,
          currentContent,
          newVersionSummary,
          newVersionReason || undefined,
          newVersionLabel || undefined
        );
      } else {
        await reportVersionControlService.createTemplateVersion(
          entityId,
          currentContent,
          newVersionSummary,
          newVersionReason || undefined,
          newVersionLabel || undefined
        );
      }

      setNewVersionLabel('');
      setNewVersionSummary('');
      setNewVersionReason('');
      setShowCreateDialog(false);
      await loadVersions();
      onUpdate();
    } catch (error) {
      console.error('Error creating version:', error);
    } finally {
      setIsCreatingVersion(false);
    }
  };

  const handleRestoreVersion = async (versionId: string) => {
    try {
      const success = entityType === 'report'
        ? await reportVersionControlService.restoreReportVersion(versionId)
        : await reportVersionControlService.restoreTemplateVersion(versionId);

      if (success) {
        await loadVersions();
        onUpdate();
        // The onRestore callback would be called from the parent component
        // after the version is restored in the database
      }
    } catch (error) {
      console.error('Error restoring version:', error);
    }
  };

  const handleCompareVersions = async () => {
    if (selectedVersions.length !== 2) return;

    try {
      const comparison = await reportVersionControlService.compareReportVersions(
        selectedVersions[0],
        selectedVersions[1]
      );
      setComparison(comparison);
    } catch (error) {
      console.error('Error comparing versions:', error);
    }
  };

  const toggleVersionSelection = (versionId: string) => {
    setSelectedVersions(prev => {
      if (prev.includes(versionId)) {
        return prev.filter(id => id !== versionId);
      } else if (prev.length < 2) {
        return [...prev, versionId];
      } else {
        return [prev[1], versionId]; // Keep the last selected and add the new one
      }
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getChangeTypeIcon = (changeType: string) => {
    switch (changeType) {
      case 'added':
        return <ArrowRight className="w-4 h-4 text-green-600" />;
      case 'removed':
        return <ArrowLeft className="w-4 h-4 text-red-600" />;
      case 'modified':
        return <Diff className="w-4 h-4 text-blue-600" />;
      default:
        return <div className="w-4 h-4" />;
    }
  };

  const getChangeTypeColor = (changeType: string) => {
    switch (changeType) {
      case 'added':
        return 'bg-green-100 text-green-800';
      case 'removed':
        return 'bg-red-100 text-red-800';
      case 'modified':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <GitBranch className="w-5 h-5 mr-2" />
            Version Control
          </CardTitle>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Tag className="w-4 h-4 mr-1" />
                Create Version
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Version</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="versionLabel">Version Label (Optional)</Label>
                  <Input
                    id="versionLabel"
                    value={newVersionLabel}
                    onChange={(e) => setNewVersionLabel(e.target.value)}
                    placeholder="e.g., v2.0, Final Draft, etc."
                  />
                </div>
                <div>
                  <Label htmlFor="versionSummary">Change Summary *</Label>
                  <Textarea
                    id="versionSummary"
                    value={newVersionSummary}
                    onChange={(e) => setNewVersionSummary(e.target.value)}
                    placeholder="Describe what changed in this version"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="versionReason">Reason for Changes (Optional)</Label>
                  <Textarea
                    id="versionReason"
                    value={newVersionReason}
                    onChange={(e) => setNewVersionReason(e.target.value)}
                    placeholder="Explain why these changes were made"
                    rows={2}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateVersion}
                    disabled={!newVersionSummary.trim() || isCreatingVersion}
                  >
                    {isCreatingVersion ? (
                      <Clock className="w-4 h-4 mr-1 animate-spin" />
                    ) : (
                      <Tag className="w-4 h-4 mr-1" />
                    )}
                    {isCreatingVersion ? 'Creating...' : 'Create Version'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="history" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="history" className="flex items-center">
              <History className="w-4 h-4 mr-1" />
              Version History ({versions.length})
            </TabsTrigger>
            <TabsTrigger value="compare" className="flex items-center">
              <GitCompare className="w-4 h-4 mr-1" />
              Compare Versions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="history" className="space-y-4">
            <div className="h-96 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Clock className="w-6 h-6 animate-spin mr-2" />
                  Loading versions...
                </div>
              ) : versions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <GitBranch className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No versions found</p>
                  <p className="text-sm">Create your first version to start tracking changes</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {versions.map((version, index) => (
                    <motion.div
                      key={version.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={selectedVersions.includes(version.id)}
                              onChange={() => toggleVersionSelection(version.id)}
                              className="rounded"
                            />
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline">
                                v{version.version_number}
                              </Badge>
                              {version.version_label && (
                                <Badge variant="secondary">
                                  {version.version_label}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <User className="w-4 h-4 text-blue-600" />
                              </div>
                              <div>
                                <div className="font-medium text-sm">
                                  {version.created_by_user?.first_name} {version.created_by_user?.last_name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {formatDate(version.created_at)}
                                </div>
                              </div>
                            </div>
                            {version.change_summary && (
                              <p className="text-sm text-gray-600 mt-2">
                                {version.change_summary}
                              </p>
                            )}
                            {version.change_reason && (
                              <p className="text-xs text-gray-500 mt-1">
                                Reason: {version.change_reason}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRestoreVersion(version.id)}
                          >
                            <RotateCcw className="w-4 h-4 mr-1" />
                            Restore
                          </Button>
                        </div>
                      </div>

                      {/* Version details */}
                      <div className="text-xs text-gray-500 bg-gray-50 rounded p-2">
                        <div className="flex items-center justify-between">
                          <span>Version {version.version_number}</span>
                          <span>{versions.length - index} of {versions.length} versions</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="compare" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Select two versions to compare</Label>
                <div className="space-y-2 mt-2">
                  <div className="text-sm font-medium">
                    Version 1: {selectedVersions[0] ? `v${versions.find(v => v.id === selectedVersions[0])?.version_number}` : 'Not selected'}
                  </div>
                  <div className="text-sm font-medium">
                    Version 2: {selectedVersions[1] ? `v${versions.find(v => v.id === selectedVersions[1])?.version_number}` : 'Not selected'}
                  </div>
                </div>
                <Button
                  onClick={handleCompareVersions}
                  disabled={selectedVersions.length !== 2}
                  className="mt-3"
                >
                  <GitCompare className="w-4 h-4 mr-1" />
                  Compare Versions
                </Button>
              </div>

              {comparison && (
                <div className="md:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Diff className="w-5 h-5 mr-2" />
                        Version Comparison Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-4 gap-4 mb-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {comparison.summary.totalChanges}
                          </div>
                          <div className="text-sm text-gray-600">Total Changes</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {comparison.summary.additions}
                          </div>
                          <div className="text-sm text-gray-600">Additions</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {comparison.summary.modifications}
                          </div>
                          <div className="text-sm text-gray-600">Modifications</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-600">
                            {comparison.summary.deletions}
                          </div>
                          <div className="text-sm text-gray-600">Deletions</div>
                        </div>
                      </div>

                      <div className="h-64 overflow-y-auto">
                        <div className="space-y-2">
                          {comparison.changes.map((change, index) => (
                            <div key={index} className="flex items-start space-x-3 p-3 border rounded">
                              {getChangeTypeIcon(change.changeType)}
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="font-medium text-sm">{change.field}</span>
                                  <Badge className={getChangeTypeColor(change.changeType)}>
                                    {change.changeType}
                                  </Badge>
                                </div>
                                <div className="text-sm text-gray-600">
                                  {change.changeType === 'added' && (
                                    <span className="text-green-700">+ {JSON.stringify(change.newValue)}</span>
                                  )}
                                  {change.changeType === 'removed' && (
                                    <span className="text-red-700">- {JSON.stringify(change.oldValue)}</span>
                                  )}
                                  {change.changeType === 'modified' && (
                                    <div>
                                      <div className="text-red-700">- {JSON.stringify(change.oldValue)}</div>
                                      <div className="text-green-700">+ {JSON.stringify(change.newValue)}</div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ReportVersionControl;