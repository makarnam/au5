import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  Shield,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  RefreshCw,
  FileText,
  ChevronDown,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { ComplianceService } from '../../services/compliance';
import type { ComplianceFramework, ComplianceProfile } from '../../types/compliance';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../../components/LoadingSpinner';
import { cn } from '../../utils';

type ProfileForm = Partial<ComplianceProfile>;

export default function ProfilesList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [frameworks, setFrameworks] = useState<ComplianceFramework[]>([]);
  const [frameworkId, setFrameworkId] = useState<string>('');
  const [items, setItems] = useState<ComplianceProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Create form
  const [form, setForm] = useState<ProfileForm>({
    name: '',
    description: '',
    is_active: true,
  });
  const [saving, setSaving] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<ProfileForm>({});
  const [updating, setUpdating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Load frameworks once and default select first
  useEffect(() => {
    const init = async () => {
      const { data, error } = await ComplianceService.listFrameworks();
      if (!error) {
        const list = (data ?? []) as ComplianceFramework[];
        setFrameworks(list);
        if (!frameworkId && list.length > 0) setFrameworkId(list[0].id);
      }
    };
    init();
  }, []);

  const loadProfiles = async () => {
    setLoading(true);
    const { data, error } = await ComplianceService.listProfiles(frameworkId || undefined);
    if (!error) setItems((data ?? []) as ComplianceProfile[]);
    setLoading(false);
  };

  useEffect(() => {
    loadProfiles();
  }, [frameworkId]);

  const create = async () => {
    if (!form.name || !frameworkId) return;
    setSaving(true);
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData?.user?.id || null;

    const payload: ProfileForm = {
      name: form.name,
      description: form.description ?? '',
      framework_id: frameworkId,
      is_active: form.is_active ?? true,
      created_by: userId as any,
    };
    const { error } = await ComplianceService.createProfile(payload);
    setSaving(false);
    if (!error) {
      setForm({ name: '', description: '', is_active: true });
      setShowCreateForm(false);
      loadProfiles();
      toast.success('Profile created successfully');
    } else {
      toast.error(error.message);
    }
  };

  const update = async () => {
    if (!editingId) return;
    if (!editForm.name) return;
    setUpdating(true);
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData?.user?.id || null;

    const { error } = await supabase
      .from('compliance_profiles')
      .update({
        name: editForm.name,
        description: editForm.description ?? '',
        is_active: editForm.is_active ?? true,
        framework_id: frameworkId || editForm.framework_id,
        created_by: userId as any,
      })
      .eq('id', editingId)
      .select()
      .single();
    setUpdating(false);
    if (!error) {
      cancelEdit();
      loadProfiles();
      toast.success('Profile updated successfully');
    } else {
      toast.error(error.message);
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this profile? This action cannot be undone.')) return;
    setDeletingId(id);
    const { error } = await supabase.from('compliance_profiles').delete().eq('id', id);
    setDeletingId(null);
    if (!error) {
      loadProfiles();
      toast.success('Profile deleted successfully');
    } else {
      toast.error(error.message);
    }
  };

  const startEdit = (p: ComplianceProfile) => {
    setEditingId(p.id);
    setEditForm({
      name: p.name,
      description: p.description ?? '',
      is_active: p.is_active,
      framework_id: p.framework_id,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return items.filter((p) =>
      !term ||
      p.name.toLowerCase().includes(term) ||
      (p.description || '').toLowerCase().includes(term)
    );
  }, [items, searchTerm]);

  const selectedFramework = frameworks.find((f) => f.id === frameworkId);

  if (loading && items.length === 0) {
    return (
      <div className="p-6">
        <LoadingSpinner size="lg" text="Loading profiles..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Compliance Profiles</h1>
          <p className="text-gray-600 mt-2">
            Manage compliance profiles for your frameworks
          </p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 mt-4 sm:mt-0">
          <button
            onClick={loadProfiles}
            disabled={loading || !frameworkId}
            className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
            Refresh
          </button>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Profile
          </button>
        </div>
      </div>

      {/* Framework Selector & Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Framework Select */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Framework</label>
            <div className="relative">
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                value={frameworkId}
                onChange={(e) => setFrameworkId(e.target.value)}
              >
                {frameworks.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.code})
                  </option>
                ))}
                {frameworks.length === 0 && <option value="">No frameworks found</option>}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Search */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search profiles..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Shield className="w-6 h-6 text-blue-600 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Total Profiles</p>
              <p className="text-2xl font-semibold text-gray-900">{items.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Active</p>
              <p className="text-2xl font-semibold text-gray-900">
                {items.filter((p) => p.is_active).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <XCircle className="w-6 h-6 text-red-600 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Inactive</p>
              <p className="text-2xl font-semibold text-gray-900">
                {items.filter((p) => !p.is_active).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <FileText className="w-6 h-6 text-purple-600 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Framework</p>
              <p className="text-lg font-semibold text-gray-900 truncate">
                {selectedFramework?.name || '-'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-white rounded-lg border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Profile</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Profile name"
                value={form.name ?? ''}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="flex items-center">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  checked={form.is_active ?? true}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                />
                <span className="text-sm font-medium text-gray-700">Active</span>
              </label>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Description (optional)"
                rows={3}
                value={form.description ?? ''}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={() => setShowCreateForm(false)}
              className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={create}
              disabled={saving || !frameworkId || !form.name}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {saving ? 'Creating...' : 'Create Profile'}
            </button>
          </div>
        </motion.div>
      )}

      {/* Profiles Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No profiles found</h3>
            <p className="text-gray-600 mb-6">
              {items.length === 0
                ? 'Get started by creating your first profile.'
                : 'Try adjusting your search criteria.'}
            </p>
            {items.length === 0 && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Your First Profile
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Profile
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Framework
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filtered.map((profile, idx) => (
                  <motion.tr
                    key={profile.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: Math.min(idx * 0.03, 0.3) }}
                    className="hover:bg-gray-50"
                  >
                    {editingId === profile.id ? (
                      <>
                        <td className="px-6 py-4" colSpan={5}>
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                            <input
                              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Name"
                              value={editForm.name ?? ''}
                              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            />
                            <label className="inline-flex items-center gap-2">
                              <input
                                type="checkbox"
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                checked={editForm.is_active ?? true}
                                onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })}
                              />
                              <span className="text-sm text-gray-700">Active</span>
                            </label>
                            <textarea
                              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500 md:col-span-2"
                              placeholder="Description"
                              rows={2}
                              value={editForm.description ?? ''}
                              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                            />
                            <div className="flex gap-2 md:col-span-4 justify-end">
                              <button
                                onClick={update}
                                disabled={updating}
                                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                              >
                                {updating ? 'Updating...' : 'Update'}
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4">
                          <div className="flex items-start">
                            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mr-3">
                              <Shield className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="min-w-0">
                              <button
                                onClick={() => navigate(`/compliance/profiles/${profile.id}`)}
                                className="text-sm font-semibold text-gray-900 hover:text-blue-600"
                              >
                                {profile.name}
                              </button>
                              {profile.description && (
                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                  {profile.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={cn(
                              "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                              profile.is_active
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            )}
                          >
                            {profile.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {frameworks.find((f) => f.id === profile.framework_id)?.name || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-500">
                            {profile.created_at
                              ? new Date(profile.created_at).toLocaleDateString()
                              : '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => navigate(`/compliance/profiles/${profile.id}`)}
                              className="text-gray-500 hover:text-blue-600 text-sm"
                            >
                              View
                            </button>
                            <button
                              onClick={() => startEdit(profile)}
                              className="text-gray-500 hover:text-blue-600 text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => remove(profile.id)}
                              disabled={deletingId === profile.id}
                              className="text-gray-500 hover:text-red-600 text-sm disabled:opacity-50"
                            >
                              {deletingId === profile.id ? 'Deleting...' : 'Delete'}
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
