import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Users,
  AlertTriangle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  UserCheck,
  CalendarDays
} from 'lucide-react';
import { auditPlanningService } from '../../services/auditPlanningService';
import { supabase } from '../../lib/supabase';
import { 
  AuditorCompetency,
  AuditorAvailability,
  AuditResourceAllocation,
  CompetencyArea,
  ProficiencyLevel,
  AvailabilityType,
  AuditorRole,
  AuditorCompetencyFormData,
  AuditorAvailabilityFormData,
  AuditPlanItem
} from '../../types/auditPlanning';

interface CompetencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  competency?: AuditorCompetency;
  onSave: (data: AuditorCompetencyFormData) => void;
}

const CompetencyModal: React.FC<CompetencyModalProps> = ({
  isOpen,
  onClose,
  competency,
  onSave
}) => {
  const [formData, setFormData] = useState<AuditorCompetencyFormData>({
    user_id: '',
    competency_area: 'financial_audit',
    proficiency_level: 'beginner',
    years_experience: 0,
    certifications: [],
    next_assessment_date: '',
    assessment_notes: ''
  });

  useEffect(() => {
    if (competency) {
      setFormData({
        user_id: competency.user_id,
        competency_area: competency.competency_area,
        proficiency_level: competency.proficiency_level,
        years_experience: competency.years_experience,
        certifications: competency.certifications || [],
        next_assessment_date: competency.next_assessment_date || '',
        assessment_notes: competency.assessment_notes || ''
      });
    }
  }, [competency]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              {competency ? 'Edit Competency' : 'Add Competency'}
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">×</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Competency Area *</label>
                <select
                  required
                  value={formData.competency_area}
                  onChange={(e) => setFormData({ ...formData, competency_area: e.target.value as CompetencyArea })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="financial_audit">Financial Audit</option>
                  <option value="operational_audit">Operational Audit</option>
                  <option value="it_audit">IT Audit</option>
                  <option value="compliance_audit">Compliance Audit</option>
                  <option value="risk_assessment">Risk Assessment</option>
                  <option value="data_analytics">Data Analytics</option>
                  <option value="forensic_audit">Forensic Audit</option>
                  <option value="cybersecurity">Cybersecurity</option>
                  <option value="business_process">Business Process</option>
                  <option value="regulatory_compliance">Regulatory Compliance</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Proficiency Level *</label>
                <select
                  required
                  value={formData.proficiency_level}
                  onChange={(e) => setFormData({ ...formData, proficiency_level: e.target.value as ProficiencyLevel })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Years Experience</label>
                <input
                  type="number"
                  min="0"
                  value={formData.years_experience}
                  onChange={(e) => setFormData({ ...formData, years_experience: parseInt(e.target.value) })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Next Assessment Date</label>
                <input
                  type="date"
                  value={formData.next_assessment_date}
                  onChange={(e) => setFormData({ ...formData, next_assessment_date: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Certifications</label>
              <input
                type="text"
                placeholder="Enter certifications separated by commas"
                value={formData.certifications?.join(', ') || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  certifications: e.target.value.split(',').map(cert => cert.trim()).filter(cert => cert)
                })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Assessment Notes</label>
              <textarea
                rows={3}
                value={formData.assessment_notes}
                onChange={(e) => setFormData({ ...formData, assessment_notes: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {competency ? 'Update' : 'Add'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

interface AvailabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  availability?: AuditorAvailability;
  onSave: (data: AuditorAvailabilityFormData) => void;
}

const AvailabilityModal: React.FC<AvailabilityModalProps> = ({
  isOpen,
  onClose,
  availability,
  onSave
}) => {
  const [formData, setFormData] = useState<AuditorAvailabilityFormData>({
    user_id: '',
    date: '',
    availability_type: 'available',
    available_hours: 8,
    notes: ''
  });

  useEffect(() => {
    if (availability) {
      setFormData({
        user_id: availability.user_id,
        date: availability.date,
        availability_type: availability.availability_type,
        available_hours: availability.available_hours,
        notes: availability.notes || ''
      });
    }
  }, [availability]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              {availability ? 'Edit Availability' : 'Add Availability'}
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">×</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Date *</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Availability Type *</label>
                <select
                  required
                  value={formData.availability_type}
                  onChange={(e) => setFormData({ ...formData, availability_type: e.target.value as AvailabilityType })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="available">Available</option>
                  <option value="partially_available">Partially Available</option>
                  <option value="unavailable">Unavailable</option>
                  <option value="vacation">Vacation</option>
                  <option value="training">Training</option>
                  <option value="sick_leave">Sick Leave</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Available Hours</label>
                <input
                  type="number"
                  min="0"
                  max="24"
                  value={formData.available_hours}
                  onChange={(e) => setFormData({ ...formData, available_hours: parseFloat(e.target.value) })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Notes</label>
              <textarea
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {availability ? 'Update' : 'Add'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const ResourceManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'competencies' | 'availability' | 'allocation'>('competencies');
  const [competencies, setCompetencies] = useState<AuditorCompetency[]>([]);
  const [availability, setAvailability] = useState<AuditorAvailability[]>([]);
  const [allocations, setAllocations] = useState<AuditResourceAllocation[]>([]);
  const [planItems, setPlanItems] = useState<AuditPlanItem[]>([]);
  const [selectedPlanItem, setSelectedPlanItem] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    competency_area: '',
    proficiency_level: '',
    availability_type: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [isCompetencyModalOpen, setIsCompetencyModalOpen] = useState(false);
  const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false);
  const [editingCompetency, setEditingCompetency] = useState<AuditorCompetency | undefined>();
  const [editingAvailability, setEditingAvailability] = useState<AuditorAvailability | undefined>();

  useEffect(() => {
    loadData();
    loadPlanItems();
  }, []);

  useEffect(() => {
    if (selectedPlanItem) {
      loadAllocations(selectedPlanItem);
    }
  }, [selectedPlanItem]);

    const loadData = async () => {
    try {
      setLoading(true);
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        setError('User not authenticated');
        setLoading(false);
        return;
      }

      const competenciesData = await auditPlanningService.getAuditorCompetencies(user.id);
      setCompetencies(competenciesData);
      
      const startDate = new Date().toISOString().split('T')[0];
      const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const availabilityData = await auditPlanningService.getAuditorAvailability(user.id, startDate, endDate);
      setAvailability(availabilityData);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load resource data');
    } finally {
      setLoading(false);
    }
  };

  const loadPlanItems = async () => {
    try {
      // This is a simplified call. In a real app, you might want to get items for a specific plan.
      const allPlans = await auditPlanningService.getAllAuditPlans();
      if (allPlans.length > 0) {
        const items = await auditPlanningService.getAuditPlanItems(allPlans[0].id);
        setPlanItems(items);
        if (items.length > 0) {
          setSelectedPlanItem(items[0].id);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load plan items');
    }
  };

  const loadAllocations = async (planItemId: string) => {
    try {
      const allocationsData = await auditPlanningService.getResourceAllocations(planItemId);
      setAllocations(allocationsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load allocations');
    }
  };

  const handleCreateCompetency = async (formData: AuditorCompetencyFormData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");
      await auditPlanningService.createAuditorCompetency({ ...formData, user_id: user.id });
      setIsCompetencyModalOpen(false);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create competency');
    }
  };

  const handleCreateAvailability = async (formData: AuditorAvailabilityFormData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");
      await auditPlanningService.createAuditorAvailability({ ...formData, user_id: user.id });
      setIsAvailabilityModalOpen(false);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create availability');
    }
  };

  const getProficiencyColor = (level: ProficiencyLevel) => {
    switch (level) {
      case 'expert': return 'text-purple-600 bg-purple-100';
      case 'advanced': return 'text-blue-600 bg-blue-100';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100';
      case 'beginner': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getAvailabilityColor = (type: AvailabilityType) => {
    switch (type) {
      case 'available': return 'text-green-600 bg-green-100';
      case 'partially_available': return 'text-yellow-600 bg-yellow-100';
      case 'unavailable': return 'text-red-600 bg-red-100';
      case 'vacation': return 'text-blue-600 bg-blue-100';
      case 'training': return 'text-purple-600 bg-purple-100';
      case 'sick_leave': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRoleColor = (role: AuditorRole) => {
    switch (role) {
      case 'lead_auditor': return 'text-purple-600 bg-purple-100';
      case 'senior_auditor': return 'text-blue-600 bg-blue-100';
      case 'auditor': return 'text-green-600 bg-green-100';
      case 'reviewer': return 'text-yellow-600 bg-yellow-100';
      case 'specialist': return 'text-indigo-600 bg-indigo-100';
      case 'trainee': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Resource Management</h1>
          <p className="text-gray-600">Manage auditor competencies, availability, and resource allocation</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={loadData}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('competencies')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'competencies'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <UserCheck className="h-4 w-4 inline mr-2" />
            Competencies
          </button>
          <button
            onClick={() => setActiveTab('availability')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'availability'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <CalendarDays className="h-4 w-4 inline mr-2" />
            Availability
          </button>
          <button
            onClick={() => setActiveTab('allocation')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'allocation'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Users className="h-4 w-4 inline mr-2" />
            Resource Allocation
          </button>
        </nav>
      </div>

      {/* Search and Filters */}
      <div className="bg-white shadow rounded-lg">
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search resources..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {showFilters ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              {activeTab === 'competencies' && (
                <>
                  <select
                    value={selectedFilters.competency_area}
                    onChange={(e) => setSelectedFilters({ ...selectedFilters, competency_area: e.target.value })}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Competency Areas</option>
                    <option value="financial_audit">Financial Audit</option>
                    <option value="operational_audit">Operational Audit</option>
                    <option value="it_audit">IT Audit</option>
                    <option value="compliance_audit">Compliance Audit</option>
                    <option value="risk_assessment">Risk Assessment</option>
                    <option value="data_analytics">Data Analytics</option>
                    <option value="forensic_audit">Forensic Audit</option>
                    <option value="cybersecurity">Cybersecurity</option>
                    <option value="business_process">Business Process</option>
                    <option value="regulatory_compliance">Regulatory Compliance</option>
                  </select>

                  <select
                    value={selectedFilters.proficiency_level}
                    onChange={(e) => setSelectedFilters({ ...selectedFilters, proficiency_level: e.target.value })}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Proficiency Levels</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="expert">Expert</option>
                  </select>
                </>
              )}

              {activeTab === 'availability' && (
                <select
                  value={selectedFilters.availability_type}
                  onChange={(e) => setSelectedFilters({ ...selectedFilters, availability_type: e.target.value })}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Availability Types</option>
                  <option value="available">Available</option>
                  <option value="partially_available">Partially Available</option>
                  <option value="unavailable">Unavailable</option>
                  <option value="vacation">Vacation</option>
                  <option value="training">Training</option>
                  <option value="sick_leave">Sick Leave</option>
                  <option value="other">Other</option>
                </select>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'competencies' && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Auditor Competencies</h3>
              <button
                onClick={() => setIsCompetencyModalOpen(true)}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Competency
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Auditor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Competency Area
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Proficiency Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Experience
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Next Assessment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {competencies.map((competency) => (
                  <tr key={competency.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {competency.user?.first_name} {competency.user?.last_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                      {competency.competency_area.replace('_', ' ')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getProficiencyColor(competency.proficiency_level)}`}>
                        {competency.proficiency_level}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {competency.years_experience} years
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {competency.next_assessment_date ? new Date(competency.next_assessment_date).toLocaleDateString() : 'Not scheduled'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          setEditingCompetency(competency);
                          setIsCompetencyModalOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'availability' && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Auditor Availability</h3>
              <button
                onClick={() => setIsAvailabilityModalOpen(true)}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Availability
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Auditor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Availability Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Available Hours
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {availability.map((avail) => (
                  <tr key={avail.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {avail.user?.first_name} {avail.user?.last_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(avail.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getAvailabilityColor(avail.availability_type)}`}>
                        {avail.availability_type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {avail.available_hours} hours
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {avail.notes || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          setEditingAvailability(avail);
                          setIsAvailabilityModalOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'allocation' && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Resource Allocation</h3>
              <select
                value={selectedPlanItem}
                onChange={(e) => setSelectedPlanItem(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select an Audit Plan Item</option>
                {planItems.map(item => (
                  <option key={item.id} value={item.id}>{item.audit_title}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Auditor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Audit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Allocated Hours
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actual Hours
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Allocation %
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allocations.map((allocation) => (
                  <tr key={allocation.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {allocation.user?.first_name} {allocation.user?.last_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {allocation.audit_plan_item?.audit_title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(allocation.role)}`}>
                        {allocation.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {allocation.allocated_hours} hours
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {allocation.actual_hours} hours
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {allocation.allocation_percentage || 0}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      <CompetencyModal
        isOpen={isCompetencyModalOpen}
        onClose={() => {
          setIsCompetencyModalOpen(false);
          setEditingCompetency(undefined);
        }}
        competency={editingCompetency}
        onSave={handleCreateCompetency}
      />

      <AvailabilityModal
        isOpen={isAvailabilityModalOpen}
        onClose={() => {
          setIsAvailabilityModalOpen(false);
          setEditingAvailability(undefined);
        }}
        availability={editingAvailability}
        onSave={handleCreateAvailability}
      />
    </div>
  );
};

export default ResourceManagement;
