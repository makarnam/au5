import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  Layers,
  Plus,
  Search,
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
import type { ComplianceFramework } from '../../types/compliance';
import LoadingSpinner from '../../components/LoadingSpinner';
import { cn } from '../../utils';

type FrameworkForm = Partial<ComplianceFramework>;

export default function FrameworksList() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [items, setItems] = useState<ComplianceFramework[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Create form
  const [form, setForm] = useState<FrameworkForm>({
    code: '',
    name: '',
    version: '',
    authority: '',
    category: '',
    description: '',
    is_active: true,
  });
  const [saving, setSaving] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<FrameworkForm>({});
  const [updating, setUpdating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await ComplianceService.listFrameworks();
    if (!error) setItems((data ?? []) as ComplianceFramework[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    if (!form.code || !form.name) return;
    setSaving(true);
    const { data, error } = await ComplianceService.createFramework(form);
    setSaving(false);
    if (!error && data) {
      setForm({
        code: '',
        name: '',
        version: '',
        authority: '',
        category: '',
        description: '',
        is_active: true,
      });
      setShowCreateForm(false);
      load();
      toast.success('Framework created successfully');
    } else if (error) {
      toast.error(error.message);
    }
  };

  const startEdit = (fw: ComplianceFramework) => {
    setEditingId(fw.id);
    setEditForm({
      code: fw.code,
      name: fw.name,
      version: fw.version ?? '',
      authority: fw.authority ?? '',
      category: fw.category ?? '',
      is_active: fw.is_active,
      description: fw.description ?? '',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const update = async () => {
    if (!editingId) return;
    if (!editForm.code || !editForm.name) return;
    setUpdating(true);
    const { error } = await ComplianceService.updateFramework(editingId, editForm);
    setUpdating(false);
    if (!error) {
      cancelEdit();
      load();
      toast.success('Framework updated successfully');
    } else {
      toast.error(error.message);
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this framework? This action cannot be undone.')) return;
    setDeletingId(id);
    const { error } = await ComplianceService.deleteFramework(id);
    setDeletingId(null);
    if (!error) {
      load();
      toast.success('Framework deleted successfully');
    } else {
      toast.error(error.message);
    }
  };

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return items.filter(
      (fw) =>
        !term ||
        fw.name.toLowerCase().includes(term) ||
        fw.code.toLowerCase().includes(term) ||
        (fw.description || '').toLowerCase().includes(term) ||
        (fw.category || '').toLowerCase().includes(term) ||
        (fw.authority || '').toLowerCase().includes(term)
    );
  }, [items, searchTerm]);

  if (loading && items.length === 0) {
    return (
      <div className="p-6">
        <LoadingSpinner size="lg" text="Loading frameworks..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Compliance Frameworks</h1>
          <p className="text-gray-600 mt-2">
            Manage compliance frameworks and their requirements
          </p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 mt-4 sm:mt-0">
          <button
            onClick={load}
            disabled={loading}
            className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={cn('w-4 h-4 mr-2', loading && 'animate-spin')} />
            Refresh
          </button>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Framework
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search frameworks by name, code, category..."
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
            <Layers className="w-6 h-6 text-blue-600 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Total Frameworks</p>
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
                {items.filter((fw) => fw.is_active).length}
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
                {items.filter((fw) => !fw.is_active).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <FileText className="w-6 h-6 text-purple-600 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Categories</p>
              <p className="text-2xl font-semibold text-gray-900">
                {new Set(items.map((fw) => fw.category).filter(Boolean)).size}
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Framework</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Code *</label>
              <input
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., ISO27001-2022"
                value={form.code ?? ''}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Framework name"
                value={form.name ?? ''}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Version</label>
              <input
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 2022"
                value={form.version ?? ''}
                onChange={(e) => setForm({ ...form, version: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Authority</label>
              <input
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., ISO"
                value={form.authority ?? ''}
                onChange={(e) => setForm({ ...form, authority: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <input
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Security"
                value={form.category ?? ''}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
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
            <div className="md:col-span-3">
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
              disabled={saving || !form.code || !form.name}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {saving ? 'Creating...' : 'Create Framework'}
            </button>
          </div>
        </motion.div>
      )}

      {/* Frameworks Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <Layers className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No frameworks found</h3>
            <p className="text-gray-600 mb-6">
              {items.length === 0
                ? 'Get started by creating your first framework.'
                : 'Try adjusting your search criteria.'}
            </p>
            {items.length === 0 && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Your First Framework
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Framework
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Authority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Version
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filtered.map((fw, idx) => (
                  <motion.tr
                    key={fw.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: Math.min(idx * 0.03, 0.3) }}
                    className="hover:bg-gray-50"
                  >
                    {editingId === fw.id ? (
                      <>
                        <td className="px-6 py-4" colSpan={6}>
                          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                            <input
                              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Code"
                              value={editForm.code ?? ''}
                              onChange={(e) => setEditForm({ ...editForm, code: e.target.value })}
                            />
                            <input
                              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Name"
                              value={editForm.name ?? ''}
                              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            />
                            <input
                              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Category"
                              value={editForm.category ?? ''}
                              onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                            />
                            <input
                              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Authority"
                              value={editForm.authority ?? ''}
                              onChange={(e) => setEditForm({ ...editForm, authority: e.target.value })}
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
                            <div className="flex gap-2 md:col-span-6 justify-end">
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
                              <Layers className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="min-w-0">
                              <button
                                onClick={() => navigate(`/compliance/frameworks/${fw.id}`)}
                                className="text-sm font-semibold text-gray-900 hover:text-blue-600"
                              >
                                {fw.name}
                              </button>
                              <p className="text-xs text-gray-500 mt-1">{fw.code}</p>
                              {fw.description && (
                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                  {fw.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={cn(
                              'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                              fw.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            )}
                          >
                            {fw.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{fw.category || '-'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{fw.authority || '-'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-500">{fw.version || '-'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => navigate(`/compliance/frameworks/${fw.id}`)}
                              className="text-gray-500 hover:text-blue-600 text-sm"
                            >
                              View
                            </button>
                            <button
                              onClick={() => startEdit(fw)}
                              className="text-gray-500 hover:text-blue-600 text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => remove(fw.id)}
                              disabled={deletingId === fw.id}
                              className="text-gray-500 hover:text-red-600 text-sm disabled:opacity-50"
                            >
                              {deletingId === fw.id ? 'Deleting...' : 'Delete'}
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
