# AI Auditor GRC Application - Simple Setup Guide

## 🚀 Quick Start (Simplified Approach)

This is a modern AI-powered Audit Management System built with React, TypeScript, Tailwind CSS, and Supabase.

## 📋 Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier is fine)
- Git (for cloning)

## 🛠️ Installation Steps

### 1. Install Dependencies

```bash
cd au5
npm install
```

### 2. Set up Supabase Database

1. Go to [Supabase](https://supabase.com) and create a new project
2. Wait for the project to be ready
3. Go to the SQL Editor in your Supabase dashboard
4. Copy and paste the entire content from `simple-setup.sql` and run it
   - This creates all database tables and basic structure
   - No demo users are created - you'll sign up normally

### 3. Configure Environment (Optional)

The app is already configured to use your Supabase credentials. If you need to change them:

Edit `src/lib/supabase.ts` with your Supabase URL and API key.

### 4. Run the Application

```bash
npm run dev
```

The application will start at `http://localhost:5173`

## 👥 Getting Started

### First Time Setup

1. **Sign Up**: Go to the signup page and create your account
2. **Promote to Admin**: After signing up, run the `promote-admin.sql` script:
   - Go to Supabase SQL Editor
   - Edit the script to replace `'your-email@example.com'` with your email
   - Run the script to promote yourself to super admin
3. **Login**: Sign in with your account - you'll now have full admin access

### Create Additional Users

As a super admin, you can:
- Invite other users through the Users management page
- Assign appropriate roles to team members
- Set up business units and organizational structure

## 🎯 Key Features

### ✅ Currently Available
- **Modern Dashboard** - Interactive metrics and charts
- **Audit Management** - Complete audit lifecycle management
- **AI Assistant** - AI-powered audit planning and analysis
- **User Authentication** - Role-based access control
- **Multi-language Support** - English, Spanish, French, German, Turkish
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Profile Management** - User profiles with activity tracking
- **Settings** - Comprehensive system configuration

### 🔄 Ready to Expand
- Controls Management
- Risk Management
- Findings Management
- User Management
- Workflow Management

## 🤖 AI Integration

The AI Assistant supports multiple providers:

### Local AI (Ollama)
- Default configuration for local AI models
- Endpoint: `http://localhost:11434`
- Models: Llama 2, Code Llama, Mistral

### Cloud AI Providers
- **OpenAI:** GPT-4, GPT-3.5 Turbo
- **Claude:** Claude 3 Opus, Claude 3 Sonnet
- **Gemini:** Google's AI models

Configure AI settings in the Settings page after login.

## 🏗️ Application Structure

```
au5/
├── src/
│   ├── components/          # Reusable UI components
│   ├── pages/              # Main application pages
│   │   ├── auth/           # Authentication pages
│   │   ├── audits/         # Audit management
│   │   ├── ai/             # AI Assistant
│   │   └── ...             # Other modules
│   ├── store/              # State management (Zustand)
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   ├── i18n/               # Internationalization
│   └── lib/                # External library configurations
├── simple-setup.sql        # Database schema only
├── promote-admin.sql       # Make first user admin
└── package.json           # Dependencies and scripts
```

## 🔒 Security Features

- **Role-based Access Control** - 9 different user roles
- **Row Level Security** - Supabase RLS policies
- **Session Management** - Automatic session handling
- **Protected Routes** - Route-level authorization
- **Audit Logging** - Comprehensive activity tracking

## 🌍 Multi-language Support

Currently supported languages:
- 🇺🇸 English (default)
- 🇪🇸 Spanish
- 🇫🇷 French
- 🇩🇪 German
- 🇹🇷 Turkish

Change language in the top navigation bar.

## 📊 Database Schema

The application includes 17+ database tables:
- Users and authentication
- Business units and organizational structure
- Audits, controls, risks, and findings
- Workflows and approval processes
- AI configurations and request history
- Comprehensive audit logging

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm run preview
```

### Deploy to Vercel/Netlify
The application is ready for deployment to modern hosting platforms.

## 🔧 Troubleshooting

### Database Issues
- Ensure the simple-setup.sql file runs without errors
- Check Supabase project status
- Verify API keys are correct

### Authentication Issues
- Clear browser cache and localStorage
- Check network connectivity to Supabase
- Ensure you've promoted your account to admin using promote-admin.sql

### AI Features Not Working
- Configure AI provider in Settings
- For local Ollama: ensure it's running on localhost:11434
- For cloud providers: add valid API keys

### No Admin Access
1. Sign up for an account first
2. Run the promote-admin.sql script with your email
3. Refresh the application and sign in again

## 📚 User Roles

The system supports 9 different user roles:

1. **Super Admin** - Full system access
2. **Admin** - Administrative functions
3. **CRO** - Chief Risk Officer, risk oversight
4. **Supervisor Auditor** - Audit supervision
5. **Auditor** - Conduct audits and create findings
6. **Reviewer** - Review audit work
7. **Viewer** - Read-only access
8. **Business Unit Manager** - Unit-specific management
9. **Business Unit User** - Unit-specific access

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

## 🆘 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the database setup in Supabase
3. Ensure all dependencies are installed correctly
4. Make sure you've promoted your account to admin

## 🎉 You're Ready!

The AI Auditor GRC application is now ready to use. Sign up, promote yourself to admin, and start exploring the features!

### Quick Start Checklist:
- [ ] Run `simple-setup.sql` in Supabase
- [ ] Start the application with `npm run dev`
- [ ] Sign up for an account
- [ ] Run `promote-admin.sql` with your email
- [ ] Sign in and explore the dashboard
- [ ] Configure AI settings if needed
- [ ] Start creating audits and managing your GRC processes