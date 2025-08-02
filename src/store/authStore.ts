import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import { User, UserRole } from '../types';
import toast from 'react-hot-toast';

interface AuthState {
  user: User | null;
  session: any;
  loading: boolean;
  initialized: boolean;
}

interface AuthActions {
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, firstName: string, lastName: string, role: UserRole) => Promise<boolean>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
  updateProfile: (updates: Partial<User>) => Promise<boolean>;
  checkPermission: (requiredRole: UserRole | UserRole[]) => boolean;
  initialize: () => Promise<void>;
  setUser: (user: User | null) => void;
  setSession: (session: any) => void;
  setLoading: (loading: boolean) => void;
}

type AuthStore = AuthState & AuthActions;

// Role hierarchy for permission checking
const ROLE_HIERARCHY: Record<UserRole, number> = {
  'super_admin': 9,
  'admin': 8,
  'cro': 7,
  'supervisor_auditor': 6,
  'auditor': 5,
  'reviewer': 4,
  'business_unit_manager': 3,
  'business_unit_user': 2,
  'viewer': 1
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      session: null,
      loading: false,
      initialized: false,

      // Actions
      initialize: async () => {
        set({ loading: true });

        try {
          // Get current session
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();

          if (sessionError) {
            console.error('Session error:', sessionError);
            set({ user: null, session: null, loading: false, initialized: true });
            return;
          }

          if (session?.user) {
            // Fetch user profile from our users table
            const { data: userProfile, error: profileError } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (profileError) {
              console.error('Profile fetch error:', profileError);
              // If profile doesn't exist, create a basic one
              const newUser: Partial<User> = {
                id: session.user.id,
                email: session.user.email!,
                first_name: session.user.user_metadata?.first_name || '',
                last_name: session.user.user_metadata?.last_name || '',
                role: 'viewer',
                department: '',
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                last_login: new Date().toISOString()
              };

              const { data: createdUser, error: createError } = await supabase
                .from('users')
                .insert([newUser])
                .select()
                .single();

              if (createError) {
                console.error('User creation error:', createError);
                set({ user: null, session: null, loading: false, initialized: true });
                return;
              }

              set({
                user: createdUser as User,
                session,
                loading: false,
                initialized: true
              });
            } else {
              // Update last login
              await supabase
                .from('users')
                .update({ last_login: new Date().toISOString() })
                .eq('id', userProfile.id);

              set({
                user: userProfile as User,
                session,
                loading: false,
                initialized: true
              });
            }
          } else {
            set({ user: null, session: null, loading: false, initialized: true });
          }

          // Listen for auth changes
          supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
              const { data: userProfile } = await supabase
                .from('users')
                .select('*')
                .eq('id', session.user.id)
                .single();

              if (userProfile) {
                await supabase
                  .from('users')
                  .update({ last_login: new Date().toISOString() })
                  .eq('id', userProfile.id);

                set({ user: userProfile as User, session });
              }
            } else if (event === 'SIGNED_OUT') {
              set({ user: null, session: null });
            }
          });

        } catch (error) {
          console.error('Initialization error:', error);
          set({ user: null, session: null, loading: false, initialized: true });
        }
      },

      signIn: async (email: string, password: string) => {
        set({ loading: true });

        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
          });

          if (error) {
            toast.error(error.message);
            set({ loading: false });
            return false;
          }

          if (data.user) {
            // Fetch user profile
            const { data: userProfile, error: profileError } = await supabase
              .from('users')
              .select('*')
              .eq('id', data.user.id)
              .single();

            if (profileError) {
              toast.error('Failed to load user profile');
              set({ loading: false });
              return false;
            }

            // Update last login
            await supabase
              .from('users')
              .update({ last_login: new Date().toISOString() })
              .eq('id', userProfile.id);

            set({
              user: userProfile as User,
              session: data.session,
              loading: false
            });

            // Log the sign-in activity
            await supabase.from('audit_logs').insert([{
              user_id: userProfile.id,
              action: 'sign_in',
              entity_type: 'auth',
              entity_id: userProfile.id,
              ip_address: '', // You might want to get this from a service
              user_agent: navigator.userAgent,
              created_at: new Date().toISOString()
            }]);

            toast.success('Welcome back!');
            return true;
          }

          set({ loading: false });
          return false;
        } catch (error) {
          console.error('Sign in error:', error);
          toast.error('An error occurred during sign in');
          set({ loading: false });
          return false;
        }
      },

      signUp: async (email: string, password: string, firstName: string, lastName: string, role: UserRole = 'viewer') => {
        set({ loading: true });

        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                first_name: firstName,
                last_name: lastName
              }
            }
          });

          if (error) {
            toast.error(error.message);
            set({ loading: false });
            return false;
          }

          if (data.user) {
            // Create user profile
            const newUser: Partial<User> = {
              id: data.user.id,
              email,
              first_name: firstName,
              last_name: lastName,
              role,
              department: '',
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              last_login: new Date().toISOString()
            };

            const { data: userProfile, error: profileError } = await supabase
              .from('users')
              .insert([newUser])
              .select()
              .single();

            if (profileError) {
              toast.error('Failed to create user profile');
              set({ loading: false });
              return false;
            }

            set({
              user: userProfile as User,
              session: data.session,
              loading: false
            });

            toast.success('Account created successfully!');
            return true;
          }

          set({ loading: false });
          return false;
        } catch (error) {
          console.error('Sign up error:', error);
          toast.error('An error occurred during sign up');
          set({ loading: false });
          return false;
        }
      },

      signOut: async () => {
        const { user } = get();

        try {
          // Log the sign-out activity
          if (user) {
            await supabase.from('audit_logs').insert([{
              user_id: user.id,
              action: 'sign_out',
              entity_type: 'auth',
              entity_id: user.id,
              ip_address: '',
              user_agent: navigator.userAgent,
              created_at: new Date().toISOString()
            }]);
          }

          const { error } = await supabase.auth.signOut();

          if (error) {
            toast.error(error.message);
            return;
          }

          set({ user: null, session: null });
          toast.success('Signed out successfully');
        } catch (error) {
          console.error('Sign out error:', error);
          toast.error('An error occurred during sign out');
        }
      },

      resetPassword: async (email: string) => {
        try {
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`
          });

          if (error) {
            toast.error(error.message);
            return false;
          }

          toast.success('Password reset email sent!');
          return true;
        } catch (error) {
          console.error('Password reset error:', error);
          toast.error('An error occurred during password reset');
          return false;
        }
      },

      updateProfile: async (updates: Partial<User>) => {
        const { user } = get();
        if (!user) return false;

        set({ loading: true });

        try {
          const { data, error } = await supabase
            .from('users')
            .update({
              ...updates,
              updated_at: new Date().toISOString()
            })
            .eq('id', user.id)
            .select()
            .single();

          if (error) {
            toast.error('Failed to update profile');
            set({ loading: false });
            return false;
          }

          set({ user: data as User, loading: false });
          toast.success('Profile updated successfully');
          return true;
        } catch (error) {
          console.error('Profile update error:', error);
          toast.error('An error occurred while updating profile');
          set({ loading: false });
          return false;
        }
      },

      checkPermission: (requiredRole: UserRole | UserRole[]) => {
        const { user } = get();
        if (!user) return false;

        const userRoleLevel = ROLE_HIERARCHY[user.role];

        if (Array.isArray(requiredRole)) {
          return requiredRole.some(role => userRoleLevel >= ROLE_HIERARCHY[role]);
        }

        return userRoleLevel >= ROLE_HIERARCHY[requiredRole];
      },

      // Setters
      setUser: (user: User | null) => set({ user }),
      setSession: (session: any) => set({ session }),
      setLoading: (loading: boolean) => set({ loading })
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        user: state.user,
        session: state.session
      })
    }
  )
);

// Initialize auth on app start
useAuthStore.getState().initialize();
