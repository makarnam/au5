import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

interface User {
  id: string;
  email: string;
  full_name?: string;
  role?: string;
  department?: string;
}

interface UserSelectionDropdownProps {
  value?: string | null;
  onChange: (userId: string | null) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  filterByRole?: string;
  showRole?: boolean;
}

export default function UserSelectionDropdown({
  value,
  onChange,
  placeholder = "Select a user...",
  className = "",
  disabled = false,
  filterByRole,
  showRole = true
}: UserSelectionDropdownProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, [filterByRole]);

  async function loadUsers() {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('users')
        .select('id, email, full_name, role, department')
        .eq('is_active', true)
        .order('full_name', { ascending: true });

      if (filterByRole) {
        query = query.eq('role', filterByRole);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      setUsers(data || []);
    } catch (err) {
      console.error('Error loading users:', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  }

  const selectedUser = users.find(user => user.id === value);

  return (
    <div className={`relative ${className}`}>
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value || null)}
        disabled={disabled || loading}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        <option value="">{loading ? "Loading..." : placeholder}</option>
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.full_name || user.email}
            {showRole && user.role ? ` (${user.role})` : ""}
          </option>
        ))}
      </select>
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      
      {selectedUser && (
        <div className="mt-1 text-xs text-gray-500">
          {selectedUser.email}
          {selectedUser.department && ` • ${selectedUser.department}`}
        </div>
      )}
    </div>
  );
}
