import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  GitBranch,
  GitCompare,
  RotateCcw,
  Eye,
  Download,
  Upload,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  History
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { policyService } from '../../services/policyService';
import type { Policy, PolicyVersion, PolicyVersionStatus } from '../../types/policies';

interface PolicyVersionControlProps {
  policy: Policy;
}

const PolicyVersionControl: React.FC<PolicyVersionControlProps> = ({ policy }) => {
  const [versions, setVersions] = useState<PolicyVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);
  const [compareMode, setCompareMode] = useState(false);
  const [rollbackVersion, setRollbackVersion] = useState<PolicyVersion | null>(null);
  const [isRollbackDialogOpen, setIsRollbackDialogOpen] = useState(false);

  useEffect(() => {
    loadVersions();
  }, [policy.id]);

  const loadVersions = async () => {
    try {
      setLoading(true);
      const { data, error } = await policyService.listVersions(policy.id);
      if (error) throw error;
      setVersions(data || []);
    } catch (error) {
      console.error('Error loading versions:', error);
      toast.error('Failed to load policy versions');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: PolicyVersionStatus) => {
    switch (status) {
      case 'published':
        return <CheckCircle className='h-4 w-4 text-green-600' />;
      case 'draft':
        return <Clock className='h-4 w-4 text-orange-600' />;
      case 'archived':
        return <XCircle className='h-4 w-4 text-gray-600' />;
      default:
        return <Clock className='h-4 w-4 text-gray-600' />;
    }
  };

  const getStatusBadge = (status: PolicyVersionStatus) => {
    const variants = {
      draft: 'secondary',
      published: 'default',
      archived: 'outline',
    } as const;

    return (
      <Badge variant={variants[status] || 'secondary'}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const handleVersionSelect = (versionId: string) => {
    setSelectedVersions(prev => {
      if (prev.includes(versionId)) {
        return prev.filter(id => id !== versionId);
      } else if (prev.length < 2) {
        return [...prev, versionId];
      } else {
        return [prev[1], versionId]; // Keep last selected + new one
      }
    });
  };

  const handleCompare = () => {
    if (selectedVersions.length === 2) {
      setCompareMode(true);
    } else {
      toast.error('Please select exactly 2 versions to compare');
    }
  };

  const handleRollback = (version: PolicyVersion) => {
    setRollbackVersion(version);
    setIsRollbackDialogOpen(true);
  };

  const confirmRollback = async () => {
    if (!rollbackVersion) return;

    try {
      // Create a new version based on the rollback version
      const rollbackData = {
        title: `Rollback to v${rollbackVersion.version_number}`,
        content: rollbackVersion.content,
        status: 'draft' as PolicyVersionStatus,
      };

      await policyService.createVersion(policy.id, rollbackData);
      toast.success('Policy rolled back successfully');

      setIsRollbackDialogOpen(false);
      setRollbackVersion(null);
      loadVersions();
    } catch (error) {
      console.error('Error rolling back version:', error);
      toast.error('Failed to rollback policy version');
    }
  };

  const exportVersion = (version: PolicyVersion) => {
    const dataStr = JSON.stringify(version, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    const exportFileDefaultName = `${policy.name}_v${version.version_number}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const renderVersionComparison = () => {
    if (selectedVersions.length !== 2) return null;

    const version1 = versions.find(v => v.id === selectedVersions[0]);
    const version2 = versions.find(v => v.id === selectedVersions[1]);

    if (!version1 || !version2) return null;

    // Simple diff logic (in a real app, you'd use a proper diff library)
    const lines1 = version1.content.split('\n');
    const lines2 = version2.content.split('\n');

    return (
      <div className='grid grid-cols-2 gap-6'>
        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>
              Version {version1.version_number}: {version1.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className='text-sm whitespace-pre-wrap bg-gray-50 p-4 rounded max-h-96 overflow-y-auto'>
              {version1.content}
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>
              Version {version2.version_number}: {version2.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className='text-sm whitespace-pre-wrap bg-gray-50 p-4 rounded max-h-96 overflow-y-auto'>
              {version2.content}
            </pre>
          </CardContent>
        </Card>
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className='p-6'>
          <div className='flex items-center justify-center'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold text-gray-900 flex items-center gap-2'>
            Policy Version Control
            <span className='px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full'>New</span>
          </h2>
          <p className='text-gray-600'>Advanced version management for {policy.name}</p>
        </div>

        <div className='flex gap-2'>
          {selectedVersions.length === 2 && !compareMode && (
            <Button onClick={handleCompare} variant='outline'>
              <GitCompare className='h-4 w-4 mr-2' />
              Compare Selected
            </Button>
          )}
          {compareMode && (
            <Button onClick={() => setCompareMode(false)} variant='outline'>
              <History className='h-4 w-4 mr-2' />
              Back to List
            </Button>
          )}
        </div>
      </div>

      {compareMode ? (
        <div className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <GitCompare className='h-5 w-5' />
                Version Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderVersionComparison()}
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <GitBranch className='h-5 w-5' />
              Version History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {versions.length === 0 ? (
              <div className='text-center py-8'>
                <GitBranch className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                <p className='text-gray-500'>No versions found.</p>
                <p className='text-sm text-gray-400 mt-2'>
                  Create the first version to start version control.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className='w-12'>
                      <input
                        type='checkbox'
                        checked={selectedVersions.length === versions.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedVersions(versions.slice(0, 2).map(v => v.id));
                          } else {
                            setSelectedVersions([]);
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead>Version</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead className='w-48'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {versions.map((version) => (
                    <TableRow key={version.id}>
                      <TableCell>
                        <input
                          type='checkbox'
                          checked={selectedVersions.includes(version.id)}
                          onChange={() => handleVersionSelect(version.id)}
                          disabled={!selectedVersions.includes(version.id) && selectedVersions.length >= 2}
                        />
                      </TableCell>
                      <TableCell className='font-medium'>v{version.version_number}</TableCell>
                      <TableCell>{version.title}</TableCell>
                      <TableCell>
                        <div className='flex items-center gap-2'>
                          {getStatusIcon(version.status)}
                          {getStatusBadge(version.status)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {version.created_at ? new Date(version.created_at).toLocaleDateString() : '-'}
                      </TableCell>
                      <TableCell>{version.created_by || 'System'}</TableCell>
                      <TableCell>
                        <div className='flex gap-1'>
                          <Button size='sm' variant='ghost' title='View Version'>
                            <Eye className='h-4 w-4' />
                          </Button>
                          <Button
                            size='sm'
                            variant='ghost'
                            onClick={() => exportVersion(version)}
                            title='Export Version'
                          >
                            <Download className='h-4 w-4' />
                          </Button>
                          <Button
                            size='sm'
                            variant='ghost'
                            onClick={() => handleRollback(version)}
                            title='Rollback to this version'
                            className='text-orange-600 hover:text-orange-700'
                          >
                            <RotateCcw className='h-4 w-4' />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Rollback Confirmation Dialog */}
      <Dialog open={isRollbackDialogOpen} onOpenChange={setIsRollbackDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <AlertTriangle className='h-5 w-5 text-orange-600' />
              Confirm Rollback
            </DialogTitle>
            <DialogDescription>
              This will create a new draft version based on version {rollbackVersion?.version_number}.
              The current published version will remain unchanged until the new version is published.
            </DialogDescription>
          </DialogHeader>

          {rollbackVersion && (
            <div className='space-y-4'>
              <div className='p-4 bg-orange-50 rounded-lg'>
                <h4 className='font-medium text-orange-900'>Rollback Details</h4>
                <p className='text-sm text-orange-700 mt-1'>
                  Creating new version from: v{rollbackVersion.version_number} - {rollbackVersion.title}
                </p>
              </div>

              <div className='flex justify-end gap-2'>
                <Button variant='outline' onClick={() => setIsRollbackDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={confirmRollback} className='bg-orange-600 hover:bg-orange-700'>
                  <RotateCcw className='h-4 w-4 mr-2' />
                  Confirm Rollback
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PolicyVersionControl;