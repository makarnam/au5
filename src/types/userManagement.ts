// User Management Types
export type UserRole =
  | "super_admin"
  | "admin"
  | "cro"
  | "supervisor_auditor"
  | "auditor"
  | "reviewer"
  | "viewer"
  | "business_unit_manager"
  | "business_unit_user";

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  department: string;
  business_unit_id?: string;
  avatar_url?: string;
  is_active: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  business_unit?: {
    name: string;
    code: string;
  };
}

// Enhanced User Management Types
export interface UserRoleDefinition {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  permissions: string[];
  is_system_role: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserPermission {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  module: string;
  action: string;
  resource: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserGroup {
  id: string;
  name: string;
  description?: string;
  business_unit_id?: string;
  created_by?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Joined data
  business_unit?: {
    name: string;
    code: string;
  };
  created_by_user?: {
    first_name: string;
    last_name: string;
  };
  member_count?: number;
}

export interface UserGroupMember {
  id: string;
  user_id: string;
  group_id: string;
  joined_at: string;
  added_by?: string;
  // Joined data
  user?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  added_by_user?: {
    first_name: string;
    last_name: string;
  };
}

export interface UserSession {
  id: string;
  user_id: string;
  session_token: string;
  ip_address?: string;
  user_agent?: string;
  device_info?: Record<string, any>;
  is_active: boolean;
  expires_at: string;
  created_at: string;
  last_activity: string;
  // Joined data
  user?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

export interface UserActivityLog {
  id: string;
  user_id?: string;
  action: string;
  entity_type?: string;
  entity_id?: string;
  details?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  // Joined data
  user?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

export interface UserPreference {
  id: string;
  user_id: string;
  preference_key: string;
  preference_value?: any;
  created_at: string;
  updated_at: string;
}

export interface UserInvitation {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role_id?: string;
  business_unit_id?: string;
  department?: string;
  invited_by?: string;
  invitation_token: string;
  expires_at: string;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  accepted_at?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  role?: {
    name: string;
    display_name: string;
  };
  business_unit?: {
    name: string;
    code: string;
  };
  invited_by_user?: {
    first_name: string;
    last_name: string;
  };
}

// Form Data Types
export interface CreateUserData {
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  department: string;
  business_unit_id?: string;
  groups?: string[];
}

export interface UpdateUserData {
  first_name?: string;
  last_name?: string;
  role?: UserRole;
  department?: string;
  business_unit_id?: string;
  is_active?: boolean;
  groups?: string[];
}

export interface CreateUserRoleData {
  name: string;
  display_name: string;
  description?: string;
  permissions: string[];
}

export interface UpdateUserRoleData {
  display_name?: string;
  description?: string;
  permissions?: string[];
  is_active?: boolean;
}

export interface CreateUserGroupData {
  name: string;
  description?: string;
  business_unit_id?: string;
  members?: string[];
}

export interface UpdateUserGroupData {
  name?: string;
  description?: string;
  business_unit_id?: string;
  is_active?: boolean;
  members?: string[];
}

export interface CreateUserInvitationData {
  email: string;
  first_name: string;
  last_name: string;
  role_id?: string;
  business_unit_id?: string;
  department?: string;
  groups?: string[];
}

// Filter and Search Types
export interface UserFilters {
  role?: UserRole;
  business_unit_id?: string;
  is_active?: boolean;
  department?: string;
  group_id?: string;
  created_after?: string;
  created_before?: string;
  last_login_after?: string;
  last_login_before?: string;
}

export interface UserSearchParams {
  query?: string;
  filters?: UserFilters;
  sort_by?: 'first_name' | 'last_name' | 'email' | 'role' | 'created_at' | 'last_login';
  sort_order?: 'asc' | 'desc';
  page?: number;
  page_size?: number;
}

// Dashboard and Analytics Types
export interface UserManagementStats {
  total_users: number;
  active_users: number;
  inactive_users: number;
  users_by_role: Record<UserRole, number>;
  users_by_business_unit: Record<string, number>;
  recent_registrations: number;
  pending_invitations: number;
  active_sessions: number;
  recent_activity: number;
}

export interface UserActivitySummary {
  user_id: string;
  user_name: string;
  login_count: number;
  last_login: string;
  total_actions: number;
  recent_actions: UserActivityLog[];
}

// Permission and Authorization Types
export interface PermissionCheck {
  user_id: string;
  permission: string;
  resource_id?: string;
  resource_type?: string;
}

export interface UserPermissions {
  user_id: string;
  permissions: string[];
  roles: string[];
  groups: string[];
}

// Session Management Types
export interface SessionInfo {
  session_id: string;
  user_id: string;
  ip_address?: string;
  user_agent?: string;
  device_info?: Record<string, any>;
  created_at: string;
  last_activity: string;
  expires_at: string;
}

// API Response Types
export interface UserManagementResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
}

export interface PaginatedUserResponse {
  users: User[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// Notification Types for User Management
export interface UserManagementNotification {
  type: 'user_created' | 'user_updated' | 'user_deactivated' | 'user_activated' | 'invitation_sent' | 'invitation_accepted' | 'role_changed' | 'group_membership_changed';
  user_id: string;
  user_name: string;
  details?: Record<string, any>;
  timestamp: string;
}
