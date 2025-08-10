import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Eye, 
  Trash2, 
  Download, 
  RefreshCw,
  TrendingUp,
  Award,
  Clock,
  User,
  Star,
  BarChart3,
  Target,
  DollarSign,
  Calendar
} from 'lucide-react';
import { auditPlanningService } from '../../services/auditPlanningService';
import { 
  AuditorCompetency, 
  AuditorCompetencyFormData,
  CompetencyArea,
  ProficiencyLevel 
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

  const [currentCertification, setCurrentCertification] = useState('');

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
    } else {
      setFormData({
        user_id: '',
        competency_area: 'financial_audit',
        proficiency_level: 'beginner',
        years_experience: 0,
        certifications: [],
        next_assessment_date: '',
        assessment_notes: ''
      });
    }
  }, [competency]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const addCertification = () => {
    if (currentCertification.trim()) {
      setFormData(prev => ({
        ...prev,
        certifications: [...(prev.certifications || []), currentCertification.trim()]
      }));
      setCurrentCertification('');
    }
  };

  const removeCertification = (index: number) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications?.filter((_, i) => i !== index) || []
    }));
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
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                User ID *
              </label>
              <input
                type="text"
                required
                value={formData.user_id}
                onChange={(e) => setFormData(prev => ({ ...prev, user_id: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter user ID"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Competency Area *
              </label>
              <select
                required
                value={formData.competency_area}
                onChange={(e) => setFormData(prev => ({ ...prev, competency_area: e.target.value as CompetencyArea }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Proficiency Level *
              </label>
              <select
                required
                value={formData.proficiency_level}
                onChange={(e) => setFormData(prev => ({ ...prev, proficiency_level: e.target.value as ProficiencyLevel }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Years of Experience *
              </label>
              <input
                type="number"
                required
                value={formData.years_experience}
                onChange={(e) => setFormData(prev => ({ ...prev, years_experience: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Certifications
              </label>
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={currentCertification}
                  onChange={(e) => setCurrentCertification(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCertification())}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add certification..."
                />
                <button
                  type="button"
                  onClick={addCertification}
                  className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              {formData.certifications && formData.certifications.length > 0 && (
                <div className="space-y-1">
                  {formData.certifications.map((cert, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">{cert}</span>
                      <button
                        type="button"
                        onClick={() => removeCertification(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Next Assessment Date
              </label>
              <input
                type="date"
                value={formData.next_assessment_date}
                onChange={(e) => setFormData(prev => ({ ...prev, next_assessment_date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assessment Notes
              </label>
              <textarea
                value={formData.assessment_notes}
                onChange={(e) => setFormData(prev => ({ ...prev, assessment_notes: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Assessment notes..."
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {competency ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const CompetencyManagement: React.FC = () => {
  const [competencies, setCompetencies] = useState<AuditorCompetency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedCompetency, setSelectedCompetency] = useState<AuditorCompetency | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterArea, setFilterArea] = useState<string>('all');
  const [filterLevel, setFilterLevel] = useState<string>('all');

  useEffect(() => {
    loadCompetencies();
  }, []);

  const loadCompetencies = async () => {
    try {
      setLoading(true);
      // Note: This would need to be implemented in the service to get all competencies
      // For now, we'll use a mock approach
      const mockCompetencies: AuditorCompetency[] = [
        {
          id: '1',
          user_id: 'user1',
          competency_area: 'financial_audit',
          proficiency_level: 'expert',
          years_experience: 8,
          certifications: ['CPA', 'CIA'],
          last_assessment_date: '2024-01-15',
          next_assessment_date: '2024-07-15',
          assessed_by: 'assessor1',
          assessment_notes: 'Excellent financial audit skills',
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-15T00:00:00Z',
          user: {
            first_name: 'John',
            last_name: 'Doe',
            email: 'john.doe@example.com'
          },
          assessed_by_user: {
            first_name: 'Jane',
            last_name: 'Smith',
            email: 'jane.smith@example.com'
          }
        },
        {
          id: '2',
          user_id: 'user2',
          competency_area: 'it_audit',
          proficiency_level: 'advanced',
          years_experience: 5,
          certifications: ['CISA', 'CISM'],
          last_assessment_date: '2024-02-01',
          next_assessment_date: '2024-08-01',
          assessed_by: 'assessor1',
          assessment_notes: 'Strong IT audit capabilities',
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-02-01T00:00:00Z',
          user: {
            first_name: 'Alice',
            last_name: 'Johnson',
            email: 'alice.johnson@example.com'
          },
          assessed_by_user: {
            first_name: 'Jane',
            last_name: 'Smith',
            email: 'jane.smith@example.com'
          }
        }
      ];
      setCompetencies(mockCompetencies);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load competencies');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCompetency = async (data: AuditorCompetencyFormData) => {
    try {
      // This would call the service to create competency
      console.log('Creating competency:', data);
      setShowModal(false);
      loadCompetencies();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create competency');
    }
  };

  const handleEdit = (competency: AuditorCompetency) => {
    setSelectedCompetency(competency);
    setShowModal(true);
  };

  const getProficiencyColor = (level: string) => {
    switch (level) {
      case 'expert': return 'text-purple-600 bg-purple-50';
      case 'advanced': return 'text-blue-600 bg-blue-50';
      case 'intermediate': return 'text-yellow-600 bg-yellow-50';
      case 'beginner': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getCompetencyAreaIcon = (area: string) => {
    switch (area) {
      case 'financial_audit': return <DollarSign className="h-4 w-4" />;
      case 'it_audit': return <BarChart3 className="h-4 w-4" />;
      case 'compliance_audit': return <Target className="h-4 w-4" />;
      case 'risk_assessment': return <TrendingUp className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const filteredCompetencies = competencies.filter(comp => {
    const matchesSearch = comp.user?.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         comp.user?.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         comp.competency_area.replace('_', ' ').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesArea = filterArea === 'all' || comp.competency_area === filterArea;
    const matchesLevel = filterLevel === 'all' || comp.proficiency_level === filterLevel;
    
    return matchesSearch && matchesArea && matchesLevel;
  });

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
          <h1 className="text-2xl font-bold text-gray-900">Competency Management</h1>
          <p className="text-gray-600">Manage auditor skills and capabilities</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={loadCompetencies}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Competency
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <TrendingUp className="h-5 w-5 text-red-400 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search auditors or areas..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Competency Area</label>
            <select
              value={filterArea}
              onChange={(e) => setFilterArea(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Areas</option>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Proficiency Level</label>
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="expert">Expert</option>
            </select>
          </div>

          <div className="flex items-end">
            <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
              <Filter className="h-4 w-4 mr-2 inline" />
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Competencies List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Auditor Competencies</h3>
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
                  Certifications
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
              {filteredCompetencies.map((competency) => (
                <tr key={competency.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {competency.user?.first_name} {competency.user?.last_name}
                        </div>
                        <div className="text-sm text-gray-500">{competency.user?.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getCompetencyAreaIcon(competency.competency_area)}
                      <span className="ml-2 text-sm text-gray-900">
                        {competency.competency_area.replace('_', ' ')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getProficiencyColor(competency.proficiency_level)}`}>
                      {competency.proficiency_level}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1 text-gray-400" />
                      {competency.years_experience} years
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {competency.certifications?.slice(0, 2).map((cert, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full"
                        >
                          <Award className="h-3 w-3 mr-1" />
                          {cert}
                        </span>
                      ))}
                      {competency.certifications && competency.certifications.length > 2 && (
                        <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                          +{competency.certifications.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {competency.next_assessment_date ? (
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                        {new Date(competency.next_assessment_date).toLocaleDateString()}
                      </div>
                    ) : (
                      <span className="text-gray-400">Not scheduled</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(competency)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-900">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Competency Modal */}
      <CompetencyModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedCompetency(null);
        }}
        competency={selectedCompetency || undefined}
        onSave={handleCreateCompetency}
      />
    </div>
  );
};

export default CompetencyManagement;
