import { supabase } from "../lib/supabase";
import { User, UserRole } from "../types";

interface CreateUserData {
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  department: string;
  business_unit_id?: string;
}

interface UpdateUserData {
  first_name?: string;
  last_name?: string;
  role?: UserRole;
  department?: string;
  business_unit_id?: string;
  is_active?: boolean;
}

class UserService {
  async getUsers(): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from("users")
        .select(`
          *,
          business_unit:business_units(name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return data || [];
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
          business_unit:business_units(name)
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

  async getUsersByRole(role: UserRole): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from("users")
        .select(`
          *,
          business_unit:business_units(name)
        `)
        .eq("role", role)
        .eq("is_active", true)
        .order("first_name", { ascending: true });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error("Error fetching users by role:", error);
      throw new Error("Failed to fetch users by role");
    }
  }

  async getUsersByBusinessUnit(businessUnitId: string): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from("users")
        .select(`
          *,
          business_unit:business_units(name)
        `)
        .eq("business_unit_id", businessUnitId)
        .eq("is_active", true)
        .order("first_name", { ascending: true });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error("Error fetching users by business unit:", error);
      throw new Error("Failed to fetch users by business unit");
    }
  }

  async createUser(userData: CreateUserData): Promise<User> {
    try {
      // First create the user in auth.users
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: this.generateTemporaryPassword(),
        email_confirm: true,
      });

      if (authError) throw authError;

      // Then create the user profile
      const { data, error } = await supabase
        .from("users")
        .insert({
          id: authData.user?.id,
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
          business_unit:business_units(name)
        `)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error("Error creating user:", error);
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
          business_unit:business_units(name)
        `)
        .single();

      if (error) throw error;

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
    } catch (error) {
      console.error("Error activating user:", error);
      throw new Error("Failed to activate user");
    }
  }

  async updateUserAvatar(id: string, avatarFile: File): Promise<string> {
    try {
      const fileExt = avatarFile.name.split('.').pop();
      const fileName = `${id}/avatar.${fileExt}`;

      // Upload avatar to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, avatarFile, {
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      // Update user profile with avatar URL
      const { error: updateError } = await supabase
        .from("users")
        .update({
          avatar_url: publicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (updateError) throw updateError;

      return publicUrl;
    } catch (error) {
      console.error("Error updating user avatar:", error);
      throw new Error("Failed to update user avatar");
    }
  }

  async getUserPermissions(userId: string): Promise<string[]> {
    try {
      const user = await this.getUser(userId);
      if (!user) return [];

      // Define role-based permissions
      const rolePermissions: Record<UserRole, string[]> = {
        super_admin: [
          "manage_users",
          "manage_audits",
          "manage_controls",
          "manage_risks",
          "manage_findings",
          "manage_workflows",
          "manage_system",
          "view_analytics",
          "manage_ai_config",
        ],
        admin: [
          "manage_users",
          "manage_audits",
          "manage_controls",
          "manage_risks",
          "manage_findings",
          "manage_workflows",
          "view_analytics",
          "manage_ai_config",
        ],
        cro: [
          "view_audits",
          "view_controls",
          "view_risks",
          "view_findings",
          "view_analytics",
          "approve_audits",
          "approve_findings",
        ],
        supervisor_auditor: [
          "manage_audits",
          "manage_controls",
          "manage_risks",
          "manage_findings",
          "view_analytics",
          "approve_findings",
          "use_ai_generation",
        ],
        auditor: [
          "create_audits",
          "manage_assigned_audits",
          "manage_controls",
          "create_findings",
          "test_controls",
          "use_ai_generation",
        ],
        reviewer: [
          "view_audits",
          "view_controls",
          "view_findings",
          "comment_on_findings",
          "review_controls",
        ],
        viewer: [
          "view_audits",
          "view_controls",
          "view_findings",
          "view_reports",
        ],
        business_unit_manager: [
          "view_unit_audits",
          "view_unit_controls",
          "view_unit_findings",
          "comment_on_findings",
          "assign_control_owners",
        ],
        business_unit_user: [
          "view_assigned_controls",
          "update_control_evidence",
          "comment_on_findings",
        ],
      };

      return rolePermissions[user.role] || [];
    } catch (error) {
      console.error("Error getting user permissions:", error);
      return [];
    }
  }

  async searchUsers(query: string, filters?: {
    role?: UserRole;
    business_unit_id?: string;
    is_active?: boolean;
  }): Promise<User[]> {
    try {
      let queryBuilder = supabase
        .from("users")
        .select(`
          *,
          business_unit:business_units(name)
        `)
        .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%`);

      if (filters?.role) {
        queryBuilder = queryBuilder.eq("role", filters.role);
      }

      if (filters?.business_unit_id) {
        queryBuilder = queryBuilder.eq("business_unit_id", filters.business_unit_id);
      }

      if (filters?.is_active !== undefined) {
        queryBuilder = queryBuilder.eq("is_active", filters.is_active);
      }

      const { data, error } = await queryBuilder
        .order("first_name", { ascending: true })
        .limit(50);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error("Error searching users:", error);
      throw new Error("Failed to search users");
    }
  }

  async getUserStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    byRole: Record<UserRole, number>;
  }> {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("role, is_active");

      if (error) throw error;

      const total = data?.length || 0;
      const active = data?.filter(u => u.is_active).length || 0;
      const inactive = total - active;

      const byRole = data?.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {} as Record<UserRole, number>) || {} as Record<UserRole, number>;

      return {
        total,
        active,
        inactive,
        byRole,
      };
    } catch (error) {
      console.error("Error getting user stats:", error);
      throw new Error("Failed to get user statistics");
    }
  }

  private generateTemporaryPassword(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  async resetUserPassword(userId: string): Promise<void> {
    try {
      const { error } = await supabase.auth.admin.generateLink({
        type: "recovery",
        email: (await this.getUser(userId))?.email || "",
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

export const userService = new UserService();
