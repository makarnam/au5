import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Mail,
  Shield,
  Eye,
  ChevronLeft,
  ChevronRight,
  Download,
  RefreshCw,
  Plus,
  Settings,
} from 'lucide-react';
import { userManagementService } from '../../services/userManagementService';
import { User, UserFilters, UserSearchParams, PaginatedUserResponse } from '../../types/userManagement';
import LoadingSpinner from '../../components/LoadingSpinner';

const UsersList: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useState<UserSearchParams>({
    page: 1,
    page_size: 20,
    sort_by: 'created_at',
    sort_order: 'desc',
  });
  const [totalPages, setTotalPages] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  useEffect(() => {
    loadUsers();
  }, [searchParams]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await userManagementService.getUsers(searchParams);
      setUsers(response.users);
      setTotalPages(response.total_pages);
      setTotalUsers(response.total);
    } catch (err) {
      setError('Failed to load users');
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchParams(prev => ({
      ...prev,
      query: query || undefined,
      page: 1,
    }));
  };

  const handleFilterChange = (filters: Partial<UserFilters>) => {
    setSearchParams(prev => ({
      ...prev,
      filters: { ...prev.filters, ...filters },
      page: 1,
    }));
  };

  const handleSort = (sortBy: string) => {
    setSearchParams(prev => ({
      ...prev,
      sort_by: sortBy as any,
      sort_order: prev.sort_by === sortBy && prev.sort_order === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handlePageChange = (page: number) => {
    setSearchParams(prev => ({ ...prev, page }));
  };

  const handleUserAction = async (userId: string, action: string) => {
    try {
      switch (action) {
        case 'activate':
          await userManagementService.activateUser(userId);
          break;
        case 'deactivate':
          await userManagementService.deactivateUser(userId);
          break;
        case 'reset-password':
          await userManagementService.resetUserPassword(userId);
          break;
        case 'terminate-sessions':
          await userManagementService.terminateAllUserSessions(userId);
          break;
      }
      loadUsers(); // Refresh the list
    } catch (err) {
      console.error(`Error performing ${action} on user:`, err);
    }
  };

  const handleBulkAction = async (action: string) => {
    try {
      for (const userId of selectedUsers) {
        await handleUserAction(userId, action);
      }
      setSelectedUsers([]);
    } catch (err) {
      console.error(`Error performing bulk ${action}:`, err);
    }
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      super_admin: 'bg-red-100 text-red-800',
      admin: 'bg-orange-100 text-orange-800',
      cro: 'bg-purple-100 text-purple-800',
      supervisor_auditor: 'bg-blue-100 text-blue-800',
      auditor: 'bg-green-100 text-green-800',
      reviewer: 'bg-yellow-100 text-yellow-800',
      viewer: 'bg-gray-100 text-gray-800',
      business_unit_manager: 'bg-indigo-100 text-indigo-800',
      business_unit_user: 'bg-teal-100 text-teal-800',
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (isActive: boolean) => {
    return isActive ? (
      <UserCheck className="w-4 h-4 text-green-500" />
    ) : (
      <UserX className="w-4 h-4 text-red-500" />
    );
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600">
            {totalUsers} total users • {users.filter(u => u.is_active).length} active
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => navigate('/users/invite')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Mail className="w-4 h-4 mr-2" />
            Invite User
          </button>
          <button
            onClick={() => navigate('/users/create')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Create User
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search users by name or email..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </button>

          {/* Refresh */}
          <button
            onClick={loadUsers}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  onChange={(e) => handleFilterChange({ role: e.target.value as any })}
                >
                  <option value="">All Roles</option>
                  <option value="super_admin">Super Admin</option>
                  <option value="admin">Admin</option>
                  <option value="cro">CRO</option>
                  <option value="supervisor_auditor">Supervisor Auditor</option>
                  <option value="auditor">Auditor</option>
                  <option value="reviewer">Reviewer</option>
                  <option value="viewer">Viewer</option>
                  <option value="business_unit_manager">Business Unit Manager</option>
                  <option value="business_unit_user">Business Unit User</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  onChange={(e) => handleFilterChange({ is_active: e.target.value === 'true' ? true : e.target.value === 'false' ? false : undefined })}
                >
                  <option value="">All Status</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <input
                  type="text"
                  placeholder="Filter by department..."
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  onChange={(e) => handleFilterChange({ department: e.target.value })}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-700">
              {selectedUsers.length} user(s) selected
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => handleBulkAction('activate')}
                className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200"
              >
                <UserCheck className="w-3 h-3 mr-1" />
                Activate
              </button>
              <button
                onClick={() => handleBulkAction('deactivate')}
                className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200"
              >
                <UserX className="w-3 h-3 mr-1" />
                Deactivate
              </button>
              <button
                onClick={() => setSelectedUsers([])}
                className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers(users.map(u => u.id));
                      } else {
                        setSelectedUsers([]);
                      }
                    }}
                    checked={selectedUsers.length === users.length && users.length > 0}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('role')}
                >
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Business Unit
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('last_login')}
                >
                  Last Login
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('created_at')}
                >
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={selectedUsers.includes(user.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers([...selectedUsers, user.id]);
                        } else {
                          setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                        }
                      }}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {user.avatar_url ? (
                          <img
                            className="h-10 w-10 rounded-full"
                            src={user.avatar_url}
                            alt=""
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {user.first_name[0]}{user.last_name[0]}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.first_name} {user.last_name}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                      {user.role.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.department}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.business_unit?.name || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(user.is_active)}
                      <span className={`ml-2 text-sm ${user.is_active ? 'text-green-600' : 'text-red-600'}`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => navigate(`/users/${user.id}`)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => navigate(`/users/${user.id}/edit`)}
                        className="text-gray-600 hover:text-gray-900"
                        title="Edit User"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <div className="relative">
                        <button
                          className="text-gray-600 hover:text-gray-900"
                          title="More Actions"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                        {/* Dropdown menu would go here */}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(searchParams.page! - 1)}
                disabled={searchParams.page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(searchParams.page! + 1)}
                disabled={searchParams.page === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{' '}
                  <span className="font-medium">{(searchParams.page! - 1) * searchParams.page_size! + 1}</span>
                  {' '}to{' '}
                  <span className="font-medium">
                    {Math.min(searchParams.page! * searchParams.page_size!, totalUsers)}
                  </span>
                  {' '}of{' '}
                  <span className="font-medium">{totalUsers}</span>
                  {' '}results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => handlePageChange(searchParams.page! - 1)}
                    disabled={searchParams.page === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          page === searchParams.page
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => handlePageChange(searchParams.page! + 1)}
                    disabled={searchParams.page === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersList;
