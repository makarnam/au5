import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import { sessionInterceptor } from '../lib/sessionInterceptor';
import { User, UserRole } from '../types';
import toast from 'react-hot-toast';

interface AuthState {
  user: User | null;
  session: any;
  loading: boolean;
  initialized: boolean;
  lastActivity: number;
  sessionRecoveryAttempts: number;
  isRecovering: boolean;
}

interface AuthActions {
  setUser: (user: User | null) => void;
  setSession: (session: any) => void;
  setLoading: (loading: boolean) => void;
  initialize: () => Promise<void>;
  checkPermission: (requiredRole: UserRole | UserRole[]) => boolean;
  refreshSession: () => Promise<boolean>;
  recoverSession: () => Promise<boolean>;
  updateLastActivity: () => void;
  resetRecoveryAttempts: () => void;
  // Auth methods
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, firstName: string, lastName: string, role?: UserRole) => Promise<boolean>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
  updateProfile: (updates: Partial<User>) => Promise<boolean>;
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
      lastActivity: Date.now(),
      sessionRecoveryAttempts: 0,
      isRecovering: false,

      // Actions
      initialize: async () => {
        // Prevent duplicate listeners if initialize() is called more than once
        if ((window as any).__auth_init_in_progress__) {
          return;
        }
        (window as any).__auth_init_in_progress__ = true;

        set({ loading: true });

        let didSetFromSession = false;
        let listenerAdded = false;

        try {
          // Attach listener first to catch any immediate state changes
          if (!(window as any).__auth_listener_added__) {
            const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
              console.log('Auth state change:', event, session?.user?.id);

              // Prevent duplicate processing
              if ((window as any).__auth_processing_event__) {
                console.log('Event already being processed, skipping...');
                return;
              }
              (window as any).__auth_processing_event__ = true;

              try {
                if (event === 'SIGNED_IN' && session?.user) {
                  console.log('User signed in, loading profile...');
                  
                  // Check if user is already loaded
                  const currentState = get();
                  if (currentState.user?.id === session.user.id) {
                    console.log('User already loaded, skipping...');
                    return;
                  }
                  
                  // Get user profile from database
                  const { data: userProfile, error } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();

                  if (error) {
                    console.error('Error loading user profile:', error);
                    set({ user: null, session: null, loading: false, initialized: true });
                    return;
                  }

                  // Update last login (best effort)
                  try {
                    await supabase.from('users').update({ last_login: new Date().toISOString() }).eq('id', userProfile.id);
                  } catch {}

                  set({ 
                    user: userProfile as User, 
                    session, 
                    loading: false, 
                    initialized: true,
                    lastActivity: Date.now(),
                    sessionRecoveryAttempts: 0
                  });
                  didSetFromSession = true;
                } else if (event === 'INITIAL_SESSION') {
                  console.log('Initial session event:', session ? 'Session found' : 'No session');
                  // Handle initial session - this is called when the app first loads
                  if (session?.user) {
                    console.log('Found initial session, loading profile...');
                    
                    // Check if user is already loaded
                    const currentState = get();
                    if (currentState.user?.id === session.user.id) {
                      console.log('User already loaded from initial session, skipping...');
                      return;
                    }
                    
                    // Get user profile from database
                    const { data: userProfile, error } = await supabase
                      .from('users')
                      .select('*')
                      .eq('id', session.user.id)
                      .single();

                    if (error) {
                      console.error('Error loading user profile from initial session:', error);
                      set({ user: null, session: null, loading: false, initialized: true });
                      return;
                    }

                    set({ 
                      user: userProfile as User, 
                      session, 
                      loading: false, 
                      initialized: true,
                      lastActivity: Date.now(),
                      sessionRecoveryAttempts: 0
                    });
                    didSetFromSession = true;
                  } else {
                    // No initial session, mark as initialized
                    console.log('No initial session found');
                    set({ 
                      user: null, 
                      session: null, 
                      loading: false, 
                      initialized: true,
                      lastActivity: Date.now(),
                      sessionRecoveryAttempts: 0
                    });
                  }
                } else if (event === 'TOKEN_REFRESHED' && session?.user) {
                  console.log('Token refreshed, updating session');
                  set({ 
                    session, 
                    loading: false,
                    lastActivity: Date.now(),
                    sessionRecoveryAttempts: 0
                  });
                } else if (event === 'SIGNED_OUT') {
                  set({ 
                    user: null, 
                    session: null, 
                    loading: false, 
                    initialized: true,
                    lastActivity: Date.now(),
                    sessionRecoveryAttempts: 0
                  });
                }
              } finally {
                // Clear processing flag after a short delay
                setTimeout(() => {
                  (window as any).__auth_processing_event__ = false;
                }, 100);
              }
            });

            (window as any).__auth_listener_added__ = true;
            listenerAdded = true;
            console.log('Auth listener added');
          }

          // One-time read of current session
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();

          if (sessionError) {
            console.error('Session error:', sessionError);
            set({ user: null, session: null, loading: false, initialized: true });
            return;
          }

          if (session?.user && !didSetFromSession) {
            console.log('Found existing session, loading profile...');
            
            // Get user profile from database
            const { data: userProfile, error } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (error) {
              console.error('Error loading user profile:', error);
              set({ user: null, session: null, loading: false, initialized: true });
              return;
            }

            // Update last login (best effort)
            try {
              await supabase.from('users').update({ last_login: new Date().toISOString() }).eq('id', userProfile.id);
            } catch {}

            set({ 
              user: userProfile as User, 
              session, 
              loading: false, 
              initialized: true,
              lastActivity: Date.now(),
              sessionRecoveryAttempts: 0
            });
          } else if (!didSetFromSession) {
            set({ loading: false, initialized: true });
          }

          // Setup activity tracking
          setupActivityTracking();

          // Setup visibility change handling for tab switching
          setupVisibilityChangeHandling();

        } catch (error) {
          console.error('Error during auth initialization:', error);
          set({ user: null, session: null, loading: false, initialized: true });
        } finally {
          (window as any).__auth_init_in_progress__ = false;
        }
      },

      setUser: (user) => set({ user }),
      setSession: (session) => set({ session }),
      setLoading: (loading) => set({ loading }),

      checkPermission: (requiredRole) => {
        const { user } = get();
        if (!user) return false;

        const userRoleLevel = ROLE_HIERARCHY[user.role] || 0;
        
        if (Array.isArray(requiredRole)) {
          return requiredRole.some(role => userRoleLevel >= ROLE_HIERARCHY[role]);
        }
        
        return userRoleLevel >= ROLE_HIERARCHY[requiredRole];
      },

      refreshSession: async () => {
        const { sessionRecoveryAttempts } = get();
        
        if (sessionRecoveryAttempts >= 3) {
          console.log('Max recovery attempts reached');
          return false;
        }

        set({ isRecovering: true, sessionRecoveryAttempts: sessionRecoveryAttempts + 1 });

        try {
          const { data, error } = await supabase.auth.refreshSession();
          
          if (error) {
            console.error('Session refresh failed:', error);
            return false;
          }

          if (data.session) {
            console.log('Session refreshed successfully');
            set({ 
              session: data.session, 
              isRecovering: false,
              lastActivity: Date.now()
            });
            return true;
          }

          return false;
        } catch (error) {
          console.error('Session refresh error:', error);
          set({ isRecovering: false });
          return false;
        }
      },

      recoverSession: async () => {
        const { refreshSession, resetRecoveryAttempts } = get();
        
        console.log('Attempting session recovery...');
        
        const success = await refreshSession();
        
        if (success) {
          resetRecoveryAttempts();
          toast.success('Session recovered successfully');
        } else {
          toast.error('Session recovery failed. Please log in again.');
          // Redirect to login after failed recovery
          setTimeout(() => {
            window.location.href = '/auth/sign-in';
          }, 2000);
        }
        
        return success;
      },

      updateLastActivity: () => set({ lastActivity: Date.now() }),

      resetRecoveryAttempts: () => set({ sessionRecoveryAttempts: 0 }),

      // Auth methods
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
              loading: false,
              lastActivity: Date.now(),
              sessionRecoveryAttempts: 0
            });

            // Log the sign-in activity
            await supabase.from('audit_logs').insert([{
              user_id: userProfile.id,
              action: 'sign_in',
              entity_type: 'auth',
              entity_id: userProfile.id,
              ip_address: '',
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
              loading: false,
              lastActivity: Date.now(),
              sessionRecoveryAttempts: 0
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

          set({ 
            user: null, 
            session: null, 
            loading: false,
            lastActivity: Date.now(),
            sessionRecoveryAttempts: 0
          });
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
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        user: state.user,
        session: state.session,
        lastActivity: state.lastActivity,
        sessionRecoveryAttempts: state.sessionRecoveryAttempts
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Check if session is still valid after rehydration
          const now = Date.now();
          const lastActivity = state.lastActivity || 0;
          const sessionTimeout = 24 * 60 * 60 * 1000; // 24 hours
          
          if (now - lastActivity > sessionTimeout) {
            console.log('Session expired during rehydration');
            state.setUser(null);
            state.setSession(null);
            state.resetRecoveryAttempts();
          }
        }
      }
    }
  )
);

// Activity tracking for session management
function setupActivityTracking() {
  const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
  
  let lastUpdate = 0;
  const updateInterval = 5000; // Update at most every 5 seconds
  
  const updateActivity = () => {
    const now = Date.now();
    if (now - lastUpdate > updateInterval) {
      lastUpdate = now;
      const authStore = useAuthStore.getState();
      authStore.updateLastActivity();
    }
  };

  events.forEach(event => {
    document.addEventListener(event, updateActivity, { passive: true });
  });

  // Cleanup function
  return () => {
    events.forEach(event => {
      document.removeEventListener(event, updateActivity);
    });
  };
}

// Handle tab visibility changes
function setupVisibilityChangeHandling() {
  const handleVisibilityChange = async () => {
    if (!document.hidden) {
      // Tab became visible, check session status
      const authStore = useAuthStore.getState();
      const { session, user } = authStore;
      
      if (session && !user) {
        console.log('Tab became visible, session exists but no user - attempting recovery');
        await authStore.recoverSession();
      }
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);
  
  // Cleanup function
  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
}

// Export for use in other modules
export const getAuthStore = () => useAuthStore.getState();
