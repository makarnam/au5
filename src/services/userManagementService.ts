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

class UserManagementService {
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

  async getUser(id: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from("users")
        .select(`
          *,
          business_unit:business_units(name, code)
        `)
        .eq("id", id)
        .single();

      if (error) {
        if (error.code === "PGRST116") return null;
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Error fetching user:", error);
      throw new Error("Failed to fetch user");
    }
  }

  async createUser(userData: CreateUserData): Promise<User> {
    try {
      // For now, we'll create the user profile directly without auth.users
      // The user will need to sign up through the normal signup process
      // This is a temporary solution until we can implement proper admin authentication
      
      // Generate a temporary UUID for the user
      const tempUserId = crypto.randomUUID();
      
      // Create the user profile
      const { data, error } = await supabase
        .from("users")
        .insert({
          id: tempUserId,
          email: userData.email,
          first_name: userData.first_name,
          last_name: userData.last_name,
          role: userData.role,
          department: userData.department,
          business_unit_id: userData.business_unit_id,
          is_active: true,
        })
        .select(`
          *,
          business_unit:business_units(name, code)
        `)
        .single();

      if (error) {
        // Check if it's a duplicate email error
        if (error.code === '23505' && error.message.includes('email')) {
          throw new Error('A user with this email address already exists');
        }
        throw error;
      }

      // Add user to groups if specified
      if (userData.groups && userData.groups.length > 0) {
        await this.addUserToGroups(tempUserId, userData.groups);
      }

      // Log activity
      await this.logUserActivity(tempUserId, "user_created", "users", tempUserId, {
        email: userData.email,
        role: userData.role,
        department: userData.department,
      });

      return data;
    } catch (error) {
      console.error("Error creating user:", error);
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("Failed to create user");
    }
  }

  async updateUser(id: string, updates: UpdateUserData): Promise<User> {
    try {
      const { data, error } = await supabase
        .from("users")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select(`
          *,
          business_unit:business_units(name, code)
        `)
        .single();

      if (error) throw error;

      // Update group memberships if specified
      if (updates.groups) {
        await this.updateUserGroups(id, updates.groups);
      }

      // Log activity
      await this.logUserActivity(id, "user_updated", "users", id, updates);

      return data;
    } catch (error) {
      console.error("Error updating user:", error);
      throw new Error("Failed to update user");
    }
  }

  async deactivateUser(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("users")
        .update({
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      // Log activity
      await this.logUserActivity(id, "user_deactivated", "users", id);
    } catch (error) {
      console.error("Error deactivating user:", error);
      throw new Error("Failed to deactivate user");
    }
  }

  async activateUser(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("users")
        .update({
          is_active: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      // Log activity
      await this.logUserActivity(id, "user_activated", "users", id);
    } catch (error) {
      console.error("Error activating user:", error);
      throw new Error("Failed to activate user");
    }
  }

  // Role Management
  async getRoles(): Promise<UserRoleDefinition[]> {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("*")
        .eq("is_active", true)
        .order("display_name", { ascending: true });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error("Error fetching roles:", error);
      throw new Error("Failed to fetch roles");
    }
  }

  async getRole(id: string): Promise<UserRoleDefinition | null> {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        if (error.code === "PGRST116") return null;
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Error fetching role:", error);
      throw new Error("Failed to fetch role");
    }
  }

  async createRole(roleData: CreateUserRoleData): Promise<UserRoleDefinition> {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .insert({
          ...roleData,
          is_system_role: false,
          is_active: true,
        })
        .select("*")
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error("Error creating role:", error);
      throw new Error("Failed to create role");
    }
  }

  async updateRole(id: string, updates: UpdateUserRoleData): Promise<UserRoleDefinition> {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select("*")
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error("Error updating role:", error);
      throw new Error("Failed to update role");
    }
  }

  // Permission Management
  async getPermissions(): Promise<UserPermission[]> {
    try {
      const { data, error } = await supabase
        .from("user_permissions")
        .select("*")
        .eq("is_active", true)
        .order("display_name", { ascending: true });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error("Error fetching permissions:", error);
      throw new Error("Failed to fetch permissions");
    }
  }

  async getPermissionsByModule(module: string): Promise<UserPermission[]> {
    try {
      const { data, error } = await supabase
        .from("user_permissions")
        .select("*")
        .eq("module", module)
        .eq("is_active", true)
        .order("display_name", { ascending: true });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error("Error fetching permissions by module:", error);
      throw new Error("Failed to fetch permissions by module");
    }
  }

  // Group Management
  async getGroups(): Promise<UserGroup[]> {
    try {
      const { data, error } = await supabase
        .from("user_groups")
        .select(`
          *,
          business_unit:business_units(name, code),
          created_by_user:users!user_groups_created_by_fkey(first_name, last_name)
        `)
        .eq("is_active", true)
        .order("name", { ascending: true });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error("Error fetching groups:", error);
      throw new Error("Failed to fetch groups");
    }
  }

  async getGroup(id: string): Promise<UserGroup | null> {
    try {
      const { data, error } = await supabase
        .from("user_groups")
        .select(`
          *,
          business_unit:business_units(name, code),
          created_by_user:users!user_groups_created_by_fkey(first_name, last_name)
        `)
        .eq("id", id)
        .single();

      if (error) {
        if (error.code === "PGRST116") return null;
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Error fetching group:", error);
      throw new Error("Failed to fetch group");
    }
  }

  async createGroup(groupData: CreateUserGroupData): Promise<UserGroup> {
    try {
      const { data, error } = await supabase
        .from("user_groups")
        .insert({
          ...groupData,
          created_by: (await supabase.auth.getUser()).data.user?.id,
          is_active: true,
        })
        .select(`
          *,
          business_unit:business_units(name, code),
          created_by_user:users!user_groups_created_by_fkey(first_name, last_name)
        `)
        .single();

      if (error) throw error;

      // Add members if specified
      if (groupData.members && groupData.members.length > 0) {
        await this.addUsersToGroup(data.id, groupData.members);
      }

      return data;
    } catch (error) {
      console.error("Error creating group:", error);
      throw new Error("Failed to create group");
    }
  }

  async updateGroup(id: string, updates: UpdateUserGroupData): Promise<UserGroup> {
    try {
      const { data, error } = await supabase
        .from("user_groups")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select(`
          *,
          business_unit:business_units(name, code),
          created_by_user:users!user_groups_created_by_fkey(first_name, last_name)
        `)
        .single();

      if (error) throw error;

      // Update members if specified
      if (updates.members) {
        await this.updateGroupMembers(id, updates.members);
      }

      return data;
    } catch (error) {
      console.error("Error updating group:", error);
      throw new Error("Failed to update group");
    }
  }

  async getGroupMembers(groupId: string): Promise<UserGroupMember[]> {
    try {
      const { data, error } = await supabase
        .from("user_group_members")
        .select(`
          *,
          user:users(first_name, last_name, email),
          added_by_user:users!user_group_members_added_by_fkey(first_name, last_name)
        `)
        .eq("group_id", groupId)
        .order("joined_at", { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error("Error fetching group members:", error);
      throw new Error("Failed to fetch group members");
    }
  }

  async addUsersToGroup(groupId: string, userIds: string[]): Promise<void> {
    try {
      const currentUser = (await supabase.auth.getUser()).data.user?.id;
      const members = userIds.map(userId => ({
        user_id: userId,
        group_id: groupId,
        added_by: currentUser,
      }));

      const { error } = await supabase
        .from("user_group_members")
        .insert(members);

      if (error) throw error;
    } catch (error) {
      console.error("Error adding users to group:", error);
      throw new Error("Failed to add users to group");
    }
  }

  async removeUsersFromGroup(groupId: string, userIds: string[]): Promise<void> {
    try {
      const { error } = await supabase
        .from("user_group_members")
        .delete()
        .eq("group_id", groupId)
        .in("user_id", userIds);

      if (error) throw error;
    } catch (error) {
      console.error("Error removing users from group:", error);
      throw new Error("Failed to remove users from group");
    }
  }

  async updateGroupMembers(groupId: string, userIds: string[]): Promise<void> {
    try {
      // Remove all current members
      await this.removeUsersFromGroup(groupId, []);
      
      // Add new members
      if (userIds.length > 0) {
        await this.addUsersToGroup(groupId, userIds);
      }
    } catch (error) {
      console.error("Error updating group members:", error);
      throw new Error("Failed to update group members");
    }
  }

  async addUserToGroups(userId: string, groupIds: string[]): Promise<void> {
    try {
      const currentUser = (await supabase.auth.getUser()).data.user?.id;
      const members = groupIds.map(groupId => ({
        user_id: userId,
        group_id: groupId,
        added_by: currentUser,
      }));

      const { error } = await supabase
        .from("user_group_members")
        .insert(members);

      if (error) throw error;
    } catch (error) {
      console.error("Error adding user to groups:", error);
      throw new Error("Failed to add user to groups");
    }
  }

  async updateUserGroups(userId: string, groupIds: string[]): Promise<void> {
    try {
      // Remove user from all groups
      const { error: removeError } = await supabase
        .from("user_group_members")
        .delete()
        .eq("user_id", userId);

      if (removeError) throw removeError;

      // Add user to specified groups
      if (groupIds.length > 0) {
        await this.addUserToGroups(userId, groupIds);
      }
    } catch (error) {
      console.error("Error updating user groups:", error);
      throw new Error("Failed to update user groups");
    }
  }

  // Session Management
  async getUserSessions(userId: string): Promise<UserSession[]> {
    try {
      const { data, error } = await supabase
        .from("user_sessions")
        .select(`
          *,
          user:users(first_name, last_name, email)
        `)
        .eq("user_id", userId)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error("Error fetching user sessions:", error);
      throw new Error("Failed to fetch user sessions");
    }
  }

  async terminateSession(sessionId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("user_sessions")
        .update({
          is_active: false,
          last_activity: new Date().toISOString(),
        })
        .eq("id", sessionId);

      if (error) throw error;
    } catch (error) {
      console.error("Error terminating session:", error);
      throw new Error("Failed to terminate session");
    }
  }

  async terminateAllUserSessions(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("user_sessions")
        .update({
          is_active: false,
          last_activity: new Date().toISOString(),
        })
        .eq("user_id", userId)
        .eq("is_active", true);

      if (error) throw error;
    } catch (error) {
      console.error("Error terminating all user sessions:", error);
      throw new Error("Failed to terminate all user sessions");
    }
  }

  // Activity Logging
  async logUserActivity(
    userId: string,
    action: string,
    entityType?: string,
    entityId?: string,
    details?: Record<string, any>
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from("user_activity_logs")
        .insert({
          user_id: userId,
          action,
          entity_type: entityType,
          entity_id: entityId,
          details,
          ip_address: "127.0.0.1", // This should be captured from the request
          user_agent: "System", // This should be captured from the request
        });

      if (error) throw error;
    } catch (error) {
      console.error("Error logging user activity:", error);
      // Don't throw error for logging failures
    }
  }

  async getUserActivityLogs(
    userId: string,
    limit: number = 50
  ): Promise<UserActivityLog[]> {
    try {
      const { data, error } = await supabase
        .from("user_activity_logs")
        .select(`
          *,
          user:users(first_name, last_name, email)
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error("Error fetching user activity logs:", error);
      throw new Error("Failed to fetch user activity logs");
    }
  }

  // User Preferences
  async getUserPreferences(userId: string): Promise<UserPreference[]> {
    try {
      const { data, error } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", userId);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error("Error fetching user preferences:", error);
      throw new Error("Failed to fetch user preferences");
    }
  }

  async setUserPreference(
    userId: string,
    key: string,
    value: any
  ): Promise<UserPreference> {
    try {
      const { data, error } = await supabase
        .from("user_preferences")
        .upsert({
          user_id: userId,
          preference_key: key,
          preference_value: value,
          updated_at: new Date().toISOString(),
        })
        .select("*")
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error("Error setting user preference:", error);
      throw new Error("Failed to set user preference");
    }
  }

  // User Invitations
  async createUserInvitation(invitationData: CreateUserInvitationData): Promise<UserInvitation> {
    try {
      const invitationToken = this.generateInvitationToken();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

      const { data, error } = await supabase
        .from("user_invitations")
        .insert({
          ...invitationData,
          invited_by: (await supabase.auth.getUser()).data.user?.id,
          invitation_token: invitationToken,
          expires_at: expiresAt.toISOString(),
          status: "pending",
        })
        .select(`
          *,
          role:user_roles(name, display_name),
          business_unit:business_units(name, code),
          invited_by_user:users!user_invitations_invited_by_fkey(first_name, last_name)
        `)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error("Error creating user invitation:", error);
      throw new Error("Failed to create user invitation");
    }
  }

  async getPendingInvitations(): Promise<UserInvitation[]> {
    try {
      const { data, error } = await supabase
        .from("user_invitations")
        .select(`
          *,
          role:user_roles(name, display_name),
          business_unit:business_units(name, code),
          invited_by_user:users!user_invitations_invited_by_fkey(first_name, last_name)
        `)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error("Error fetching pending invitations:", error);
      throw new Error("Failed to fetch pending invitations");
    }
  }

  async cancelInvitation(invitationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("user_invitations")
        .update({
          status: "cancelled",
          updated_at: new Date().toISOString(),
        })
        .eq("id", invitationId);

      if (error) throw error;
    } catch (error) {
      console.error("Error cancelling invitation:", error);
      throw new Error("Failed to cancel invitation");
    }
  }

  // Statistics and Analytics
  async getUserManagementStats(): Promise<UserManagementStats> {
    try {
      // Get basic user stats
      const { data: users, error: usersError } = await supabase
        .from("users")
        .select("role, is_active, business_unit_id, created_at");

      if (usersError) throw usersError;

      // Get pending invitations
      const { data: invitations, error: invitationsError } = await supabase
        .from("user_invitations")
        .select("status")
        .eq("status", "pending");

      if (invitationsError) throw invitationsError;

      // Get active sessions
      const { data: sessions, error: sessionsError } = await supabase
        .from("user_sessions")
        .select("id")
        .eq("is_active", true);

      if (sessionsError) throw sessionsError;

      // Get recent activity
      const { data: recentActivity, error: activityError } = await supabase
        .from("user_activity_logs")
        .select("id")
        .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()); // Last 24 hours

      if (activityError) throw activityError;

      // Calculate stats
      const total = users?.length || 0;
      const active = users?.filter(u => u.is_active).length || 0;
      const inactive = total - active;

      const usersByRole = users?.reduce((acc, user) => {
        const role = user.role as UserRole;
        acc[role] = (acc[role] || 0) + 1;
        return acc;
      }, {} as Record<UserRole, number>) || {} as Record<UserRole, number>;

      const usersByBusinessUnit = users?.reduce((acc, user) => {
        if (user.business_unit_id) {
          acc[user.business_unit_id] = (acc[user.business_unit_id] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>) || {} as Record<string, number>;

      const recentRegistrations = users?.filter(u => 
        new Date(u.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length || 0;

      return {
        total_users: total,
        active_users: active,
        inactive_users: inactive,
        users_by_role: usersByRole,
        users_by_business_unit: usersByBusinessUnit,
        recent_registrations: recentRegistrations,
        pending_invitations: invitations?.length || 0,
        active_sessions: sessions?.length || 0,
        recent_activity: recentActivity?.length || 0,
      };
    } catch (error) {
      console.error("Error getting user management stats:", error);
      throw new Error("Failed to get user management statistics");
    }
  }

  // Permission Checking
  async checkUserPermission(check: PermissionCheck): Promise<boolean> {
    try {
      const user = await this.getUser(check.user_id);
      if (!user) return false;

      const role = await this.getRole(user.role);
      if (!role) return false;

      return role.permissions.includes(check.permission);
    } catch (error) {
      console.error("Error checking user permission:", error);
      return false;
    }
  }

  async getUserPermissions(userId: string): Promise<UserPermissions> {
    try {
      const user = await this.getUser(userId);
      if (!user) {
        return {
          user_id: userId,
          permissions: [],
          roles: [],
          groups: [],
        };
      }

      const role = await this.getRole(user.role);
      const userGroups = await this.getUserGroups(userId);

      return {
        user_id: userId,
        permissions: role?.permissions || [],
        roles: [user.role],
        groups: userGroups.map(g => g.id),
      };
    } catch (error) {
      console.error("Error getting user permissions:", error);
      return {
        user_id: userId,
        permissions: [],
        roles: [],
        groups: [],
      };
    }
  }

  async getUserGroups(userId: string): Promise<UserGroup[]> {
    try {
      const { data, error } = await supabase
        .from("user_group_members")
        .select(`
          group_id,
          user_groups!inner(
            id,
            name,
            description,
            business_unit_id,
            is_active,
            created_at,
            updated_at,
            business_unit:business_units(name, code)
          )
        `)
        .eq("user_id", userId)
        .eq("user_groups.is_active", true);

      if (error) throw error;

      return data?.map(item => item.user_groups as unknown as UserGroup) || [];
    } catch (error) {
      console.error("Error fetching user groups:", error);
      throw new Error("Failed to fetch user groups");
    }
  }

  // Utility Methods
  private generateTemporaryPassword(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  private generateInvitationToken(): string {
    return crypto.randomUUID();
  }

  async resetUserPassword(userId: string): Promise<void> {
    try {
      const user = await this.getUser(userId);
      if (!user) throw new Error("User not found");

      const { error } = await supabase.auth.admin.generateLink({
        type: "recovery",
        email: user.email,
      });

      if (error) throw error;
    } catch (error) {
      console.error("Error resetting user password:", error);
      throw new Error("Failed to reset user password");
    }
  }

  async updateLastLogin(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("users")
        .update({
          last_login: new Date().toISOString(),
        })
        .eq("id", userId);

      if (error) throw error;
    } catch (error) {
      console.error("Error updating last login:", error);
      // Don't throw error for this non-critical operation
    }
  }
}

export const userManagementService = new UserManagementService();
