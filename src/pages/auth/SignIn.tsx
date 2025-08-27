import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Mail, Lock, BarChart3, Sparkles, Shield, Brain, AlertCircle, CheckCircle, Github, Chrome } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from '../../components/LoadingSpinner';
import { toast } from 'react-hot-toast';

const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional()
});

type SignInFormData = z.infer<typeof signInSchema>;

const SignIn: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, loading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [rateLimitTimeLeft, setRateLimitTimeLeft] = useState(0);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [rememberMe, setRememberMe] = useState(() => {
    return localStorage.getItem('rememberMe') === 'true';
  });

  const from = location.state?.from?.pathname || '/dashboard';

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Rate limiting countdown
  useEffect(() => {
    if (rateLimitTimeLeft > 0) {
      const timer = setTimeout(() => {
        setRateLimitTimeLeft(rateLimitTimeLeft - 1);
        if (rateLimitTimeLeft === 1) {
          setIsRateLimited(false);
          setLoginAttempts(0);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [rateLimitTimeLeft]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      rememberMe: false
    }
  });

  const onSubmit = useCallback(async (data: SignInFormData) => {
    // Check if offline
    if (isOffline) {
      setError('root', {
        message: t('auth.offlineMessage', 'You appear to be offline. Please check your internet connection.')
      });
      return;
    }

    // Check rate limiting
    if (isRateLimited) {
      setError('root', {
        message: t('auth.rateLimited', `Too many login attempts. Please wait ${rateLimitTimeLeft} seconds.`)
      });
      return;
    }

    try {
      setLoginAttempts(prev => prev + 1);

      // Implement rate limiting after 3 failed attempts
      if (loginAttempts >= 2) {
        setIsRateLimited(true);
        setRateLimitTimeLeft(30); // 30 second cooldown
        setError('root', {
          message: t('auth.tooManyAttempts', 'Too many failed login attempts. Please wait 30 seconds before trying again.')
        });
        return;
      }

      const success = await signIn(data.email, data.password);
      if (success) {
        // Handle remember me functionality
        if (data.rememberMe) {
          localStorage.setItem('rememberMe', 'true');
          localStorage.setItem('lastEmail', data.email);
        } else {
          localStorage.removeItem('rememberMe');
          localStorage.removeItem('lastEmail');
        }

        setLoginAttempts(0); // Reset on successful login
        toast.success(t('auth.signInSuccess', 'Successfully signed in!'));

        // Add a small delay for better UX
        setTimeout(() => {
          navigate(from, { replace: true });
        }, 500);
      } else {
        setError('root', {
          message: t('auth.invalidEmailOrPassword')
        });
      }
    } catch (error) {
      console.error('Sign in error:', error);
      setError('root', {
        message: t('auth.anErrorOccurred')
      });
    }
  }, [isOffline, isRateLimited, rateLimitTimeLeft, loginAttempts, signIn, navigate, from, t]);

  const features = [
    {
      icon: Brain,
      title: t('auth.aiPoweredAuditing'),
      description: t('auth.aiPoweredAuditingDesc')
    },
    {
      icon: Shield,
      title: t('auth.riskManagement'),
      description: t('auth.riskManagementDesc')
    },
    {
      icon: Sparkles,
      title: t('auth.smartAnalytics'),
      description: t('auth.smartAnalyticsDesc')
    }
  ];

  const handleSocialLogin = useCallback((provider: string) => {
    console.log(`${provider} login is not yet implemented. Please use email and password.`);
    // In a real app, you might want to show a toast notification here
    // toast(`${provider} login is not yet implemented. Please use email and password.`);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex">
      {/* Offline Banner */}
      <AnimatePresence>
        {isOffline && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="absolute top-0 left-0 right-0 z-50 bg-red-600 text-white px-4 py-2 flex items-center justify-center"
          >
            <AlertCircle className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">{t('auth.offlineMessage', 'You are currently offline')}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Left side - Features showcase */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 dark:from-blue-800 dark:via-purple-800 dark:to-indigo-800">
          {/* Animated background elements */}
          <div className="absolute inset-0">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute bg-white/10 rounded-full"
                style={{
                  width: Math.random() * 100 + 20,
                  height: Math.random() * 100 + 20,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -30, 0],
                  opacity: [0.1, 0.3, 0.1],
                }}
                transition={{
                  duration: Math.random() * 3 + 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>
        </div>

        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-16 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mr-4">
                <BarChart3 className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">AI Auditor</h1>
                <p className="text-blue-100">Governance, Risk & Compliance Platform</p>
              </div>
            </div>

            <h2 className="text-4xl xl:text-5xl font-bold mb-6 leading-tight">
              Next-Generation
              <br />
              <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                AI-Powered
              </span>
              <br />
              Audit Management
            </h2>

            <p className="text-xl text-blue-100 mb-12 leading-relaxed">
              Transform your audit processes with intelligent automation,
              comprehensive risk management, and real-time compliance monitoring.
            </p>

            <div className="space-y-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                  className="flex items-start space-x-4"
                >
                  <div className="flex-shrink-0 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                    <feature.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{feature.title}</h3>
                    <p className="text-blue-100 text-sm leading-relaxed">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right side - Sign in form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="sm:mx-auto sm:w-full sm:max-w-md"
        >
          {/* Mobile logo */}
          <div className="flex justify-center mb-8 lg:hidden">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">AI Auditor</h1>
                <p className="text-sm text-gray-500">GRC Platform</p>
              </div>
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {t('auth.welcomeBack')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {t('auth.signInToDashboard')}
            </p>
          </div>

          {/* Social Login Buttons */}
          <div className="mb-6">
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleSocialLogin('Google')}
                disabled={isOffline || loading}
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Chrome className="w-5 h-5 mr-2" />
                Google
              </button>
              <button
                type="button"
                onClick={() => handleSocialLogin('GitHub')}
                disabled={isOffline || loading}
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Github className="w-5 h-5 mr-2" />
                GitHub
              </button>
            </div>
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                    {t('auth.orContinueWith')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 py-8 px-6 shadow-xl rounded-2xl border border-gray-100 dark:border-gray-700">
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <AnimatePresence>
                {errors.root && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4"
                  >
                    <div className="flex items-center">
                      <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
                      <p className="text-sm text-red-600 dark:text-red-400">{errors.root.message}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('auth.email')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    {...register('email')}
                    type="email"
                    autoComplete="email"
                    disabled={loading || isRateLimited}
                    className={`block w-full pl-10 pr-3 py-3 border rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      errors.email
                        ? 'border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-600'
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 text-gray-900 dark:text-white'
                    }`}
                    placeholder="Enter your email address"
                  />
                </div>
                {errors.email && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 text-sm text-red-600 dark:text-red-400"
                  >
                    {errors.email.message}
                  </motion.p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('auth.password')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    disabled={loading || isRateLimited}
                    className={`block w-full pl-10 pr-10 py-3 border rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      errors.password
                        ? 'border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-600'
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 text-gray-900 dark:text-white'
                    }`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading || isRateLimited}
                    aria-label={showPassword ? t('auth.hidePassword', 'Hide password') : t('auth.showPassword', 'Show password')}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 text-sm text-red-600 dark:text-red-400"
                  >
                    {errors.password.message}
                  </motion.p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    {...register('rememberMe')}
                    type="checkbox"
                    disabled={loading || isRateLimited}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    {t('auth.rememberMe')}
                  </label>
                </div>

                <div className="text-sm">
                  <button
                    type="button"
                    onClick={() => console.log('Forgot password clicked')}
                    className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md px-1"
                    disabled={loading || isRateLimited}
                  >
                    {t('auth.forgotPassword')}
                  </button>
                </div>
              </div>

              {/* Rate Limiting Indicator */}
              <AnimatePresence>
                {isRateLimited && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4"
                  >
                    <div className="flex items-center">
                      <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" />
                      <p className="text-sm text-yellow-600 dark:text-yellow-400">
                        {t('auth.rateLimited', `Too many login attempts. Please wait ${rateLimitTimeLeft} seconds.`)}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <button
                  type="submit"
                  disabled={loading || isRateLimited || isOffline}
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl disabled:hover:shadow-lg"
                >
                  {loading ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span className="ml-2">{t('auth.signingIn', 'Signing in...')}</span>
                    </>
                  ) : (
                    <>
                      <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                        <Lock className="h-5 w-5 text-blue-300 group-hover:text-blue-200" />
                      </span>
                      {t('auth.signIn')}
                    </>
                  )}
                </button>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('auth.dontHaveAccount')}{' '}
                  <Link
                    to="/auth/sign-up"
                    className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md px-1"
                  >
                    {t('auth.signUp')}
                  </Link>
                </p>
              </div>
            </form>

            {/* Demo credentials */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">{t('auth.demoCredentials', 'Demo Credentials')}:</h3>
              <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                <p><strong>{t('auth.superAdmin', 'Super Admin')}:</strong> admin@aiauditor.com / admin123</p>
                <p><strong>{t('auth.auditor', 'Auditor')}:</strong> auditor@aiauditor.com / auditor123</p>
                <p><strong>{t('auth.viewer', 'Viewer')}:</strong> viewer@aiauditor.com / viewer123</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SignIn;
