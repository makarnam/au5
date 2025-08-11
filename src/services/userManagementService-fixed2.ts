import { supabase } from "../lib/supabase";
import {
  User,
  UserRole,
  UserRoleDefinition,
  UserPermission,
  UserGroup,
  UserGroupMember,
  UserSession,
  UserActivityLog,
  UserPreference,
  UserInvitation,
  CreateUserData,
  UpdateUserData,
  CreateUserRoleData,
  UpdateUserRoleData,
  CreateUserGroupData,
  UpdateUserGroupData,
  CreateUserInvitationData,
  UserFilters,
  UserSearchParams,
  UserManagementStats,
  UserActivitySummary,
  PermissionCheck,
  UserPermissions,
  SessionInfo,
  PaginatedUserResponse,
} from "../types/userManagement";

class UserManagementServiceFixed2 {
  // User Management
  async getUsers(params?: UserSearchParams): Promise<PaginatedUserResponse> {
    try {
      let query = supabase
        .from("users")
        .select(`
          *,
          business_unit:business_units(name, code)
        `, { count: 'exact' });

      // Apply search query - Fixed to use proper Supabase syntax
      if (params?.query) {
        query = query.or(`first_name.ilike.%${params.query}%,last_name.ilike.%${params.query}%,email.ilike.%${params.query}%`);
      }

      // Apply filters
      if (params?.filters) {
        const filters = params.filters;
        if (filters.role) query = query.eq("role", filters.role);
        if (filters.business_unit_id) query = query.eq("business_unit_id", filters.business_unit_id);
        if (filters.is_active !== undefined) query = query.eq("is_active", filters.is_active);
        if (filters.department) query = query.eq("department", filters.department);
        if (filters.created_after) query = query.gte("created_at", filters.created_after);
        if (filters.created_before) query = query.lte("created_at", filters.created_before);
        if (filters.last_login_after) query = query.gte("last_login", filters.last_login_after);
        if (filters.last_login_before) query = query.lte("last_login", filters.last_login_before);
      }

      // Apply sorting
      const sortBy = params?.sort_by || "created_at";
      const sortOrder = params?.sort_order || "desc";
      query = query.order(sortBy, { ascending: sortOrder === "asc" });

      // Apply pagination
      const page = params?.page || 1;
      const pageSize = params?.page_size || 20;
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        console.error("Supabase error in getUsers:", error);
        throw error;
      }

      const total = count || 0;
      const totalPages = Math.ceil(total / pageSize);

      return {
        users: data || [],
        total,
        page,
        page_size: pageSize,
        total_pages: totalPages,
      };
    } catch (error) {
      console.error("Error fetching users:", error);
      throw new Error("Failed to fetch users");
    }
  }

  // Alternative method without search query for debugging
  async getUsersNoSearch(params?: Omit<UserSearchParams, 'query'>): Promise<PaginatedUserResponse> {
    try {
      let query = supabase
        .from("users")
        .select(`
          *,
          business_unit:business_units(name, code)
        `, { count: 'exact' });

      // Apply filters
      if (params?.filters) {
        const filters = params.filters;
        if (filters.role) query = query.eq("role", filters.role);
        if (filters.business_unit_id) query = query.eq("business_unit_id", filters.business_unit_id);
        if (filters.is_active !== undefined) query = query.eq("is_active", filters.is_active);
        if (filters.department) query = query.eq("department", filters.department);
        if (filters.created_after) query = query.gte("created_at", filters.created_after);
        if (filters.created_before) query = query.lte("created_at", filters.created_before);
        if (filters.last_login_after) query = query.gte("last_login", filters.last_login_after);
        if (filters.last_login_before) query = query.lte("last_login", filters.last_login_before);
      }

      // Apply sorting
      const sortBy = params?.sort_by || "created_at";
      const sortOrder = params?.sort_order || "desc";
      query = query.order(sortBy, { ascending: sortOrder === "asc" });

      // Apply pagination
      const page = params?.page || 1;
      const pageSize = params?.page_size || 20;
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        console.error("Supabase error in getUsersNoSearch:", error);
        throw error;
      }

      const total = count || 0;
      const totalPages = Math.ceil(total / pageSize);

      return {
        users: data || [],
        total,
        page,
        page_size: pageSize,
        total_pages: totalPages,
      };
    } catch (error) {
      console.error("Error fetching users (no search):", error);
      throw new Error("Failed to fetch users");
    }
  }
}

export const userManagementServiceFixed2 = new UserManagementServiceFixed2();
