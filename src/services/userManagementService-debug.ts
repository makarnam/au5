import { supabase } from "../lib/supabase";

class UserManagementServiceDebug {
  async getUsersSimple() {
    try {
      console.log('Starting getUsersSimple...');
      
      const { data, error, count } = await supabase
        .from("users")
        .select("*", { count: 'exact' })
        .limit(5);

      console.log('Supabase response:', { data, error, count });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      return {
        users: data || [],
        total: count || 0,
        page: 1,
        page_size: 5,
        total_pages: Math.ceil((count || 0) / 5),
      };
    } catch (error) {
      console.error("Error in getUsersSimple:", error);
      throw new Error("Failed to fetch users");
    }
  }

  async getUsersWithJoin() {
    try {
      console.log('Starting getUsersWithJoin...');
      
      const { data, error, count } = await supabase
        .from("users")
        .select(`
          *,
          business_unit:business_units(name, code)
        `, { count: 'exact' })
        .limit(5);

      console.log('Supabase response with join:', { data, error, count });

      if (error) {
        console.error('Supabase error with join:', error);
        throw error;
      }

      return {
        users: data || [],
        total: count || 0,
        page: 1,
        page_size: 5,
        total_pages: Math.ceil((count || 0) / 5),
      };
    } catch (error) {
      console.error("Error in getUsersWithJoin:", error);
      throw new Error("Failed to fetch users with join");
    }
  }
}

export const userManagementServiceDebug = new UserManagementServiceDebug();
