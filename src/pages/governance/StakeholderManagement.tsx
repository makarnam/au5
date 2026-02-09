import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  TrendingUp,
  Mail,
  Phone,
  Calendar,
  Edit,
  Plus,
  Search,
  Filter,
  Download,
  MessageCircle,
  Building,
  UserCheck,
  AlertCircle,
  CheckCircle,
  Clock,
  Target,
  Briefcase,
  Shield
} from 'lucide-react';

type Stakeholder = {
  id: string;
  name: string;
  title: string;
  organization: string;
  email: string;
  phone: string;
  stakeholder_type: 'board_member' | 'executive' | 'regulator' | 'customer' | 'supplier' | 'employee' | 'shareholder';
  influence_level: 'low' | 'medium' | 'high' | 'critical';
  interest_level: 'low' | 'medium' | 'high' | 'critical';
  communication_frequency: string;
  key_concerns: string[];
  relationship_status: 'active' | 'inactive' | 'monitoring';
  last_contact: string | null;
  next_contact: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
};

type Communication = {
  id: string;
  stakeholder_id: string;
  communication_type: 'meeting' | 'email' | 'call' | 'presentation' | 'report';
  subject: string;
  content: string;
  date: string;
  participants: string[];
  outcomes: string;
  follow_up_required: boolean;
  follow_up_date: string | null;
};

export default function StakeholderManagement() {
  const { t } = useTranslation();
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedStakeholder, setSelectedStakeholder] = useState<Stakeholder | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const loadStakeholders = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('governance_stakeholders')
        .select('*')
        .order('created_at', { ascending: false });

      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,organization.ilike.%${searchQuery}%,title.ilike.%${searchQuery}%`);
      }

      if (filterType !== 'all') {
        query = query.eq('stakeholder_type', filterType);
      }

      if (filterStatus !== 'all') {
        query = query.eq('relationship_status', filterStatus);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error loading stakeholders:', error);
        setStakeholders([]);
      } else {
        setStakeholders((data || []) as Stakeholder[]);
      }
    } catch (error) {
      console.error('Error loading stakeholders:', error);
      setStakeholders([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filterType, filterStatus]);

  const loadCommunications = useCallback(async (stakeholderId?: string) => {
    if (!stakeholderId) return;

    try {
      const { data, error } = await supabase
        .from('stakeholder_communications')
        .select('*')
        .eq('stakeholder_id', stakeholderId)
        .order('date', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error loading communications:', error);
        setCommunications([]);
      } else {
        setCommunications((data || []) as Communication[]);
      }
    } catch (error) {
      console.error('Error loading communications:', error);
      setCommunications([]);
    }
  }, []);

  useEffect(() => {
    loadStakeholders();
  }, [loadStakeholders]);

  useEffect(() => {
    if (selectedStakeholder) {
      loadCommunications(selectedStakeholder.id);
    }
  }, [selectedStakeholder, loadCommunications]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'board_member': return 'bg-purple-100 text-purple-800';
      case 'executive': return 'bg-blue-100 text-blue-800';
      case 'regulator': return 'bg-red-100 text-red-800';
      case 'customer': return 'bg-green-100 text-green-800';
      case 'supplier': return 'bg-orange-100 text-orange-800';
      case 'employee': return 'bg-gray-100 text-gray-800';
      case 'shareholder': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getInfluenceColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'monitoring': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'board_member': return <UserCheck className="w-4 h-4" />;
      case 'executive': return <Briefcase className="w-4 h-4" />;
      case 'regulator': return <Shield className="w-4 h-4" />;
      case 'customer': return <Users className="w-4 h-4" />;
      case 'supplier': return <Building className="w-4 h-4" />;
      case 'employee': return <Users className="w-4 h-4" />;
      case 'shareholder': return <Target className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  const stakeholderStats = {
    total: stakeholders.length,
    active: stakeholders.filter(s => s.relationship_status === 'active').length,
    highInfluence: stakeholders.filter(s => s.influence_level === 'high' || s.influence_level === 'critical').length,
    boardMembers: stakeholders.filter(s => s.stakeholder_type === 'board_member').length
  };

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
            <Users className="w-8 h-8 mr-3 text-blue-600" />
            {t("stakeholderManagement", "Stakeholder Management")}
          </h1>
          <p className="text-gray-600 mt-2">
            {t("stakeholderManagementDesc", "Manage governance stakeholders and their communications")}
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => {
              if (stakeholders.length === 0) return;
              const csvContent = [
                ['Name', 'Title', 'Organization', 'Email', 'Phone', 'Type', 'Influence', 'Interest', 'Status'].join(','),
                ...stakeholders.map(s => [
                  `"${s.name.replace(/"/g, '""')}"`,
                  `"${s.title.replace(/"/g, '""')}"`,
                  `"${s.organization.replace(/"/g, '""')}"`,
                  s.email,
                  s.phone || '',
                  s.stakeholder_type,
                  s.influence_level,
                  s.interest_level,
                  s.relationship_status
                ].join(','))
              ].join('\n');
              const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
              const link = document.createElement('a');
              link.href = URL.createObjectURL(blob);
              link.download = `stakeholders-${new Date().toISOString().split('T')[0]}.csv`;
              link.click();
              URL.revokeObjectURL(link.href);
            }}
          >
            <Download className="w-4 h-4 mr-2" />
            {t("export", "Export")}
          </Button>
          <Button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t("addStakeholder", "Add Stakeholder")}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Stakeholders</p>
              <p className="text-2xl font-bold text-gray-900">{stakeholderStats.total}</p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Relationships</p>
              <p className="text-2xl font-bold text-green-600">{stakeholderStats.active}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">High Influence</p>
              <p className="text-2xl font-bold text-orange-600">{stakeholderStats.highInfluence}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-orange-600" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Board Members</p>
              <p className="text-2xl font-bold text-purple-600">{stakeholderStats.boardMembers}</p>
            </div>
            <UserCheck className="w-8 h-8 text-purple-600" />
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
                placeholder="Search stakeholders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="board_member">Board Member</option>
              <option value="executive">Executive</option>
              <option value="regulator">Regulator</option>
              <option value="customer">Customer</option>
              <option value="supplier">Supplier</option>
              <option value="employee">Employee</option>
              <option value="shareholder">Shareholder</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="monitoring">Monitoring</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Stakeholders List */}
      <motion.div
        className="bg-white border border-gray-200 rounded-lg shadow-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Stakeholders</h3>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading stakeholders...</span>
            </div>
          ) : stakeholders.length > 0 ? (
            <div className="space-y-4">
              {stakeholders.map((stakeholder, index) => (
                <motion.div
                  key={stakeholder.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-semibold text-gray-900">{stakeholder.name}</h4>
                        <span className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(stakeholder.stakeholder_type)}`}>
                          {getTypeIcon(stakeholder.stakeholder_type)}
                          <span className="ml-1 capitalize">{stakeholder.stakeholder_type.replace('_', ' ')}</span>
                        </span>
                      </div>
                      <p className="text-gray-600 mb-2">{stakeholder.title} at {stakeholder.organization}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 mr-1" />
                          {stakeholder.email}
                        </div>
                        {stakeholder.phone && (
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 mr-1" />
                            {stakeholder.phone}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getInfluenceColor(stakeholder.influence_level)}`}>
                          Influence: {stakeholder.influence_level}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(stakeholder.relationship_status)}`}>
                          {stakeholder.relationship_status}
                        </span>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedStakeholder(stakeholder)}
                        >
                          <MessageCircle className="w-4 h-4 mr-1" />
                          Communicate
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </div>
                  {stakeholder.last_contact && (
                    <div className="mt-3 text-sm text-gray-500">
                      Last contact: {new Date(stakeholder.last_contact).toLocaleDateString()}
                      {stakeholder.next_contact && ` • Next: ${new Date(stakeholder.next_contact).toLocaleDateString()}`}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Stakeholders Yet</h3>
              <p className="text-gray-600 mb-6">Add your first governance stakeholder to get started</p>
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Stakeholder
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}