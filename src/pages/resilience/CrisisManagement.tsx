import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Users,
  Phone,
  Mail,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Shield,
  Activity,
  BarChart3,
  FileText,
  Calendar,
  MapPin,
  Bell,
  Settings,
  Eye,
  Edit,
  Trash2,
  UserPlus,
  Send,
  PhoneCall,
  Video,
  AlertCircle,
  Info,
  Zap,
  Target,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { Crisis, CrisisTeamMember, CrisisStakeholder, CrisisCommunication, CrisisAction } from '../../types/resilience';
import { resilienceService } from '../../services/resilienceService';
import ResilienceAIGenerator from '../../components/ai/ResilienceAIGenerator';

const CrisisManagement: React.FC = () => {
  const navigate = useNavigate();
  const [crises, setCrises] = useState<Crisis[]>([]);
  const [selectedCrisis, setSelectedCrisis] = useState<Crisis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [crisisTypeFilter, setCrisisTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Crisis declaration modal
  const [showDeclareModal, setShowDeclareModal] = useState(false);
  const [newCrisis, setNewCrisis] = useState({
    title: '',
    description: '',
    crisis_type: 'cyber_attack' as Crisis['crisis_type'],
    severity: 'medium' as Crisis['severity'],
    crisis_team: [] as CrisisTeamMember[],
    stakeholders: [] as CrisisStakeholder[]
  });

  // Team coordination
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [newTeamMember, setNewTeamMember] = useState({
    name: '',
    role: '',
    responsibility: '',
    contact_info: '',
    availability: 'available' as CrisisTeamMember['availability'],
    escalation_level: 1
  });

  // Communication
  const [showCommunicationModal, setShowCommunicationModal] = useState(false);
  const [newCommunication, setNewCommunication] = useState({
    audience: '',
    message: '',
    channel: 'email' as CrisisCommunication['channel']
  });

  useEffect(() => {
    fetchCrises();
  }, []);

  const fetchCrises = async () => {
    try {
      setLoading(true);
      const data = await resilienceService.getCrises();
      setCrises(data);
    } catch (err) {
      setError('Failed to load crisis data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeclareCrisis = async () => {
    try {
      const crisisData = {
        ...newCrisis,
        status: 'declared' as Crisis['status'],
        declared_at: new Date().toISOString(),
        communications: [],
        actions: [],
        lessons_learned: []
      };
      
      await resilienceService.createCrisis(crisisData);
      setShowDeclareModal(false);
      setNewCrisis({
        title: '',
        description: '',
        crisis_type: 'cyber_attack',
        severity: 'medium',
        crisis_team: [],
        stakeholders: []
      });
      fetchCrises();
    } catch (err) {
      setError('Failed to declare crisis');
      console.error(err);
    }
  };

  const handleAddTeamMember = async () => {
    if (!selectedCrisis) return;
    
    try {
      const teamMember = {
        crisis_id: selectedCrisis.id,
        ...newTeamMember
      };
      
      await resilienceService.createCrisisTeamMember(teamMember);
      setShowTeamModal(false);
      setNewTeamMember({
        name: '',
        role: '',
        responsibility: '',
        contact_info: '',
        availability: 'available',
        escalation_level: 1
      });
      fetchCrises();
    } catch (err) {
      setError('Failed to add team member');
      console.error(err);
    }
  };

  const handleSendCommunication = async () => {
    if (!selectedCrisis) return;
    
    try {
      const communication = {
        crisis_id: selectedCrisis.id,
        ...newCommunication,
        sent_at: new Date().toISOString(),
        sent_by: 'current_user_id', // Replace with actual user ID
        status: 'sent' as CrisisCommunication['status']
      };
      
      // Update crisis with new communication
      const updatedCrisis = {
        ...selectedCrisis,
        communications: [...selectedCrisis.communications, communication]
      };
      
      await resilienceService.updateCrisis(selectedCrisis.id, updatedCrisis);
      setShowCommunicationModal(false);
      setNewCommunication({
        audience: '',
        message: '',
        channel: 'email'
      });
      fetchCrises();
    } catch (err) {
      setError('Failed to send communication');
      console.error(err);
    }
  };

  const handleUpdateCrisisStatus = async (crisisId: string, newStatus: Crisis['status']) => {
    try {
      await resilienceService.updateCrisis(crisisId, { status: newStatus });
      fetchCrises();
    } catch (err) {
      setError('Failed to update crisis status');
      console.error(err);
    }
  };

  const filteredCrises = crises.filter(crisis => {
    const matchesStatus = statusFilter === 'all' || crisis.status === statusFilter;
    const matchesSeverity = severityFilter === 'all' || crisis.severity === severityFilter;
    const matchesType = crisisTypeFilter === 'all' || crisis.crisis_type === crisisTypeFilter;
    const matchesSearch = crisis.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         crisis.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesSeverity && matchesType && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'declared': return 'bg-yellow-100 text-yellow-800';
      case 'active': return 'bg-red-100 text-red-800';
      case 'contained': return 'bg-blue-100 text-blue-800';
      case 'recovering': return 'bg-green-100 text-green-800';
      case 'resolved': return 'bg-gray-100 text-gray-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCrisisTypeIcon = (type: string) => {
    switch (type) {
      case 'cyber_attack': return <Shield className="w-4 h-4" />;
      case 'data_breach': return <AlertTriangle className="w-4 h-4" />;
      case 'natural_disaster': return <MapPin className="w-4 h-4" />;
      case 'pandemic': return <Users className="w-4 h-4" />;
      case 'financial': return <BarChart3 className="w-4 h-4" />;
      case 'reputational': return <MessageSquare className="w-4 h-4" />;
      case 'regulatory': return <FileText className="w-4 h-4" />;
      case 'supply_chain': return <ArrowUpRight className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
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
          <h1 className="text-2xl font-bold text-gray-900">Crisis Management</h1>
          <p className="text-gray-600">Declare, coordinate, and manage organizational crises</p>
        </div>
        <button
          onClick={() => setShowDeclareModal(true)}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Declare Crisis</span>
        </button>
      </div>

      {/* Crisis Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Crises</p>
              <p className="text-2xl font-bold text-red-600">
                {crises.filter(c => c.status === 'active').length}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Critical Severity</p>
              <p className="text-2xl font-bold text-red-800">
                {crises.filter(c => c.severity === 'critical').length}
              </p>
            </div>
            <Shield className="w-8 h-8 text-red-800" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Team Members</p>
              <p className="text-2xl font-bold text-blue-600">
                {crises.reduce((acc, crisis) => acc + crisis.crisis_team.length, 0)}
              </p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Resolved Today</p>
              <p className="text-2xl font-bold text-green-600">
                {crises.filter(c => 
                  c.status === 'resolved' && 
                  new Date(c.resolved_at || '').toDateString() === new Date().toDateString()
                ).length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg border">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search crises..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="declared">Declared</option>
            <option value="active">Active</option>
            <option value="contained">Contained</option>
            <option value="recovering">Recovering</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Severity</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
          
          <select
            value={crisisTypeFilter}
            onChange={(e) => setCrisisTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="cyber_attack">Cyber Attack</option>
            <option value="data_breach">Data Breach</option>
            <option value="natural_disaster">Natural Disaster</option>
            <option value="pandemic">Pandemic</option>
            <option value="financial">Financial</option>
            <option value="reputational">Reputational</option>
            <option value="regulatory">Regulatory</option>
            <option value="supply_chain">Supply Chain</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Crisis List */}
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Active Crises</h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredCrises.map((crisis) => (
            <div
              key={crisis.id}
              className="p-4 hover:bg-gray-50 cursor-pointer"
              onClick={() => setSelectedCrisis(crisis)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {getCrisisTypeIcon(crisis.crisis_type)}
                    <div>
                      <h3 className="font-medium text-gray-900">{crisis.title}</h3>
                      <p className="text-sm text-gray-600">{crisis.description}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(crisis.status)}`}>
                    {crisis.status}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(crisis.severity)}`}>
                    {crisis.severity}
                  </span>
                  <div className="text-sm text-gray-500">
                    <Clock className="w-4 h-4 inline mr-1" />
                    {new Date(crisis.declared_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
              
              <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                <span>Team: {crisis.crisis_team.length} members</span>
                <span>Actions: {crisis.actions.length}</span>
                <span>Communications: {crisis.communications.length}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Crisis Detail Modal */}
      {selectedCrisis && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selectedCrisis.title}</h2>
                <p className="text-gray-600">{selectedCrisis.description}</p>
              </div>
              <button
                onClick={() => setSelectedCrisis(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Crisis Details */}
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Crisis Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium">{selectedCrisis.crisis_type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Severity:</span>
                      <span className={`font-medium ${getSeverityColor(selectedCrisis.severity)}`}>
                        {selectedCrisis.severity}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`font-medium ${getStatusColor(selectedCrisis.status)}`}>
                        {selectedCrisis.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Declared:</span>
                      <span className="font-medium">
                        {new Date(selectedCrisis.declared_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Team Members */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-gray-900">Crisis Team</h3>
                    <button
                      onClick={() => setShowTeamModal(true)}
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      <UserPlus className="w-4 h-4 inline mr-1" />
                      Add Member
                    </button>
                  </div>
                  <div className="space-y-2">
                    {selectedCrisis.crisis_team.map((member, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-white rounded">
                        <div>
                          <p className="font-medium text-sm">{member.name}</p>
                          <p className="text-xs text-gray-600">{member.role}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-600">{member.availability}</p>
                          <p className="text-xs text-gray-500">Level {member.escalation_level}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions and Communications */}
              <div className="space-y-4">
                {/* Quick Actions */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Quick Actions</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => setShowCommunicationModal(true)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm"
                    >
                      <Send className="w-4 h-4 inline mr-2" />
                      Send Communication
                    </button>
                    <button className="w-full bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm">
                      <PhoneCall className="w-4 h-4 inline mr-2" />
                      Emergency Call
                    </button>
                    <button className="w-full bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded text-sm">
                      <Video className="w-4 h-4 inline mr-2" />
                      Video Conference
                    </button>
                  </div>
                </div>

                {/* Recent Communications */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Recent Communications</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedCrisis.communications.slice(-3).map((comm, index) => (
                      <div key={index} className="p-2 bg-white rounded text-sm">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{comm.audience}</p>
                            <p className="text-gray-600">{comm.message}</p>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(comm.sent_at).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="mt-1">
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {comm.channel}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status Update */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Update Status</h3>
                  <select
                    value={selectedCrisis.status}
                    onChange={(e) => handleUpdateCrisisStatus(selectedCrisis.id, e.target.value as Crisis['status'])}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="declared">Declared</option>
                    <option value="active">Active</option>
                    <option value="contained">Contained</option>
                    <option value="recovering">Recovering</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Declare Crisis Modal */}
      {showDeclareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Declare Crisis</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={newCrisis.title}
                  onChange={(e) => setNewCrisis({...newCrisis, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Crisis title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <div className="space-y-2">
                  <textarea
                    value={newCrisis.description}
                    onChange={(e) => setNewCrisis({...newCrisis, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Describe the crisis"
                  />
                  <ResilienceAIGenerator
                    fieldType="crisis_management_plan"
                    title={newCrisis.title || "Crisis Management"}
                    organizationType="corporate"
                    industry="Technology"
                    scale="medium"
                    onGenerated={(content) => setNewCrisis({...newCrisis, description: content})}
                    className="mt-2"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={newCrisis.crisis_type}
                    onChange={(e) => setNewCrisis({...newCrisis, crisis_type: e.target.value as Crisis['crisis_type']})}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="cyber_attack">Cyber Attack</option>
                    <option value="data_breach">Data Breach</option>
                    <option value="natural_disaster">Natural Disaster</option>
                    <option value="pandemic">Pandemic</option>
                    <option value="financial">Financial</option>
                    <option value="reputational">Reputational</option>
                    <option value="regulatory">Regulatory</option>
                    <option value="supply_chain">Supply Chain</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                  <select
                    value={newCrisis.severity}
                    onChange={(e) => setNewCrisis({...newCrisis, severity: e.target.value as Crisis['severity']})}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowDeclareModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleDeclareCrisis}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
              >
                Declare Crisis
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Team Member Modal */}
      {showTeamModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add Team Member</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={newTeamMember.name}
                  onChange={(e) => setNewTeamMember({...newTeamMember, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Full name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <input
                  type="text"
                  value={newTeamMember.role}
                  onChange={(e) => setNewTeamMember({...newTeamMember, role: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Crisis role"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Responsibility</label>
                <textarea
                  value={newTeamMember.responsibility}
                  onChange={(e) => setNewTeamMember({...newTeamMember, responsibility: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={2}
                  placeholder="Key responsibilities"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Info</label>
                <input
                  type="text"
                  value={newTeamMember.contact_info}
                  onChange={(e) => setNewTeamMember({...newTeamMember, contact_info: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Phone/email"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
                  <select
                    value={newTeamMember.availability}
                    onChange={(e) => setNewTeamMember({...newTeamMember, availability: e.target.value as CrisisTeamMember['availability']})}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="available">Available</option>
                    <option value="unavailable">Unavailable</option>
                    <option value="limited">Limited</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Escalation Level</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={newTeamMember.escalation_level}
                    onChange={(e) => setNewTeamMember({...newTeamMember, escalation_level: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowTeamModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTeamMember}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                Add Member
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send Communication Modal */}
      {showCommunicationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Send Communication</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Audience</label>
                <input
                  type="text"
                  value={newCommunication.audience}
                  onChange={(e) => setNewCommunication({...newCommunication, audience: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Who to communicate with"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  value={newCommunication.message}
                  onChange={(e) => setNewCommunication({...newCommunication, message: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  placeholder="Communication message"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Channel</label>
                <select
                  value={newCommunication.channel}
                  onChange={(e) => setNewCommunication({...newCommunication, channel: e.target.value as CrisisCommunication['channel']})}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="email">Email</option>
                  <option value="phone">Phone</option>
                  <option value="sms">SMS</option>
                  <option value="press_release">Press Release</option>
                  <option value="social_media">Social Media</option>
                  <option value="internal_announcement">Internal Announcement</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCommunicationModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSendCommunication}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
    </div>
  );
};

export default CrisisManagement;
