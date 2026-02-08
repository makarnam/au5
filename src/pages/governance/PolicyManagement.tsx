import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import PolicyLifecycleManager from '../../components/policies/PolicyLifecycleManager';
import PolicyComplianceMapping from '../../components/policies/PolicyComplianceMapping';
import PolicyAnalytics from '../../components/policies/PolicyAnalytics';
import {
  FileText,
  TrendingUp,
  Calendar,
  Users,
  Edit,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  BookOpen,
  FileCheck,
  Gavel,
  Target,
  Shield
} from 'lucide-react';

type Policy = {
  id: string;
  title: string;
  policy_number: string;
  category: string;
  description: string;
  content: string;
  effective_date: string | null;
  review_date: string | null;
  approval_required: boolean;
  approved_by: string | null;
  approval_date: string | null;
  status: 'draft' | 'approved' | 'under_review' | 'archived';
  tags: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
};

export default function PolicyManagement() {
  const { t } = useTranslation();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const loadPolicies = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('governance_policies')
        .select('*')
        .order('created_at', { ascending: false });

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,policy_number.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      if (filterCategory !== 'all') {
        query = query.eq('category', filterCategory);
      }

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error loading policies:', error);
        setPolicies([]);
      } else {
        setPolicies((data || []) as Policy[]);
      }
    } catch (error) {
      console.error('Error loading policies:', error);
      setPolicies([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filterCategory, filterStatus]);

  useEffect(() => {
    loadPolicies();
  }, [loadPolicies]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'under_review': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-blue-100 text-blue-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'under_review': return <Clock className="w-4 h-4" />;
      case 'draft': return <Edit className="w-4 h-4" />;
      case 'archived': return <FileText className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'security': return 'bg-red-100 text-red-800';
      case 'compliance': return 'bg-blue-100 text-blue-800';
      case 'risk management': return 'bg-orange-100 text-orange-800';
      case 'data protection': return 'bg-purple-100 text-purple-800';
      case 'operations': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const policyStats = {
    total: policies.length,
    approved: policies.filter(p => p.status === 'approved').length,
    draft: policies.filter(p => p.status === 'draft').length,
    underReview: policies.filter(p => p.status === 'under_review').length,
    dueForReview: policies.filter(p => p.review_date && new Date(p.review_date) < new Date()).length
  };

  const categories = [...new Set(policies.map(p => p.category))];

  return (
    <motion.div
      className="p-4 space-y-6 bg-gray-50 min-h-screen transition-colors"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <FileText className="w-8 h-8 mr-3 text-blue-600" />
            {t("policyManagement", "Policy Management")}
          </h1>
          <p className="text-gray-600 mt-2">
            {t("policyManagementDesc", "Manage governance policies and regulatory compliance")}
          </p>
        </div>
      </div>

      <Tabs defaultValue="lifecycle" className="space-y-6">
        <TabsList>
          <TabsTrigger value="lifecycle">Policy Lifecycle</TabsTrigger>
          <TabsTrigger value="compliance">Compliance Mapping</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="legacy">Legacy View</TabsTrigger>
        </TabsList>

        <TabsContent value="lifecycle" className="space-y-6">
          <PolicyLifecycleManager />
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <PolicyComplianceMapping />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <PolicyAnalytics />
        </TabsContent>

        <TabsContent value="legacy" className="space-y-6">

      {/* Stats Cards */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-5 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Policies</p>
              <p className="text-2xl font-bold text-gray-900">{policyStats.total}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-green-600">{policyStats.approved}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Draft</p>
              <p className="text-2xl font-bold text-blue-600">{policyStats.draft}</p>
            </div>
            <Edit className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Under Review</p>
              <p className="text-2xl font-bold text-yellow-600">{policyStats.underReview}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Due for Review</p>
              <p className="text-2xl font-bold text-red-600">{policyStats.dueForReview}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search policies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="under_review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Policies List */}
      <motion.div
        className="bg-white border border-gray-200 rounded-lg shadow-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Policies</h3>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading policies...</span>
            </div>
          ) : policies.length > 0 ? (
            <div className="space-y-4">
              {policies.map((policy, index) => (
                <motion.div
                  key={policy.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-semibold text-gray-900">{policy.title}</h4>
                        <span className="text-sm text-gray-500">#{policy.policy_number}</span>
                      </div>
                      <p className="text-gray-600 mb-3">{policy.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(policy.category)}`}>
                          {policy.category}
                        </span>
                        <span className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(policy.status)}`}>
                          {getStatusIcon(policy.status)}
                          <span className="ml-1 capitalize">{policy.status.replace('_', ' ')}</span>
                        </span>
                        {policy.effective_date && (
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            Effective: {new Date(policy.effective_date).toLocaleDateString()}
                          </div>
                        )}
                        {policy.review_date && (
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            Review: {new Date(policy.review_date).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      {policy.tags && policy.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {policy.tags.map((tag, idx) => (
                            <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedPolicy(policy)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                      {policy.approval_required && (
                        <div className="text-xs text-gray-500 mt-1">
                          {policy.approved_by ? `Approved by ${policy.approved_by}` : 'Approval required'}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Policies Yet</h3>
              <p className="text-gray-600 mb-6">Create your first governance policy to get started</p>
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Policy
              </Button>
            </div>
          )}
        </div>
      </motion.div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}