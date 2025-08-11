import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Mail,
  ArrowLeft,
  Send,
  X,
  Check,
  AlertCircle,
  Building,
  Users,
  Shield,
  Clock,
} from 'lucide-react';
import { userManagementService } from '../../services/userManagementService';
import { 
  CreateUserInvitationData, 
  UserRoleDefinition, 
  UserGroup,
  BusinessUnit 
} from '../../types/userManagement';
import LoadingSpinner from '../../components/LoadingSpinner';

const InviteUserPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form data
  const [formData, setFormData] = useState<CreateUserInvitationData>({
    email: '',
    first_name: '',
    last_name: '',
    role_id: undefined,
    business_unit_id: undefined,
    department: '',
    groups: [],
  });

  // Available options
  const [roles, setRoles] = useState<UserRoleDefinition[]>([]);
  const [businessUnits, setBusinessUnits] = useState<BusinessUnit[]>([]);
  const [groups, setGroups] = useState<UserGroup[]>([]);

  useEffect(() => {
    loadFormOptions();
  }, []);

  const loadFormOptions = async () => {
    try {
      setLoading(true);
      const [rolesData, businessUnitsData, groupsData] = await Promise.all([
        userManagementService.getRoles(),
        fetchBusinessUnits(),
        userManagementService.getGroups(),
      ]);
      setRoles(rolesData);
      setBusinessUnits(businessUnitsData);
      setGroups(groupsData);
    } catch (err) {
      setError('Failed to load form options');
      console.error('Error loading form options:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBusinessUnits = async (): Promise<BusinessUnit[]> => {
    try {
      const { data, error } = await userManagementService['supabase']
        .from('business_units')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching business units:', error);
      return [];
    }
  };

  const handleInputChange = (field: keyof CreateUserInvitationData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    setError(null);
  };

  const handleGroupToggle = (groupId: string) => {
    setFormData(prev => ({
      ...prev,
      groups: prev.groups?.includes(groupId)
        ? prev.groups.filter(id => id !== groupId)
        : [...(prev.groups || []), groupId],
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.email || !formData.first_name || !formData.last_name) {
      setError('Please fill in all required fields');
      return false;
    }

    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }

    if (!formData.role_id) {
      setError('Please select a role for the user');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      setError(null);
      
      const invitation = await userManagementService.createUserInvitation(formData);
      
      setSuccess(`Invitation sent to ${invitation.first_name} ${invitation.last_name} at ${invitation.email}`);
      
      // Reset form
      setFormData({
        email: '',
        first_name: '',
        last_name: '',
        role_id: undefined,
        business_unit_id: undefined,
        department: '',
        groups: [],
      });

      // Navigate to invitations list after a short delay
      setTimeout(() => {
        navigate('/users/invitations');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to send invitation');
      console.error('Error sending invitation:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const getRoleDescription = (roleId: string): string => {
    const role = roles.find(r => r.id === roleId);
    return role?.description || '';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/users')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Invite User</h1>
            <p className="text-gray-600">Send an invitation to join the system</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => navigate('/users')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <LoadingSpinner size="sm" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            Send Invitation
          </button>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <Check className="w-5 h-5 text-green-500 mr-2" />
            <span className="text-green-700">{success}</span>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Invitation Info */}
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <Clock className="w-5 h-5 text-blue-500 mr-2 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-blue-900">Invitation Details</h3>
            <p className="text-sm text-blue-700 mt-1">
              The invitation will be valid for 7 days. The user will receive an email with instructions to set up their account.
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) => handleInputChange('first_name', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter first name"
                required
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => handleInputChange('last_name', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter last name"
                required
              />
            </div>

            {/* Email */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter email address"
                required
              />
            </div>

            {/* Department */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter department"
              />
            </div>
          </div>
        </div>

        {/* Role and Business Unit */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Role & Organization</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.role_id || ''}
                onChange={(e) => handleInputChange('role_id', e.target.value || undefined)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select Role</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.display_name}
                  </option>
                ))}
              </select>
              {formData.role_id && (
                <p className="mt-2 text-sm text-gray-600">
                  {getRoleDescription(formData.role_id)}
                </p>
              )}
            </div>

            {/* Business Unit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Unit
              </label>
              <select
                value={formData.business_unit_id || ''}
                onChange={(e) => handleInputChange('business_unit_id', e.target.value || undefined)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Business Unit</option>
                {businessUnits.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Group Membership */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Group Membership</h2>
          
          {groups.length === 0 ? (
            <p className="text-gray-500">No groups available</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groups.map((group) => (
                <div
                  key={group.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    formData.groups?.includes(group.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleGroupToggle(group.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{group.name}</h3>
                      {group.description && (
                        <p className="text-sm text-gray-500 mt-1">{group.description}</p>
                      )}
                      {group.business_unit && (
                        <p className="text-xs text-gray-400 mt-1">
                          {group.business_unit.name}
                        </p>
                      )}
                    </div>
                    <div className={`w-4 h-4 rounded border-2 ${
                      formData.groups?.includes(group.id)
                        ? 'bg-blue-500 border-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {formData.groups?.includes(group.id) && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-6">
          <button
            type="button"
            onClick={() => navigate('/users')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <LoadingSpinner size="sm" />
            ) : (
              <Mail className="w-4 h-4 mr-2" />
            )}
            Send Invitation
          </button>
        </div>
      </form>
    </div>
  );
};

export default InviteUserPage;
