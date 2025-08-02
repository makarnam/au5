# AI Auditor GRC Application Setup Guide

## 🚀 Quick Start

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
4. Copy and paste the entire content from `final-setup.sql` and run it
   - This single file creates all tables, demo users, and sample data

### 3. Configure Environment (Optional)

The app is already configured to use your Supabase credentials. If you need to change them:

Edit `src/lib/supabase.ts` with your Supabase URL and API key.

### 4. Run the Application

```bash
npm run dev
```

The application will start at `http://localhost:5173`

## 👥 Demo Login Credentials

The application comes with pre-configured demo users:

### Super Admin
- **Email:** `admin@aiauditor.com`
- **Password:** `admin123`
- **Access:** Full system access, user management, settings

### Auditor
- **Email:** `auditor@aiauditor.com`
- **Password:** `auditor123`
- **Access:** Audit management, findings, controls, AI assistant

### Viewer
- **Email:** `viewer@aiauditor.com`
- **Password:** `viewer123`
- **Access:** Read-only access to audits and reports

### CRO (Chief Risk Officer)
- **Email:** `cro@aiauditor.com`
- **Password:** `cro123`
- **Access:** Risk management, workflows, audit oversight

### Business Unit Manager
- **Email:** `manager@aiauditor.com`
- **Password:** `manager123`
- **Access:** Business unit specific audit data and management

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

### 🔄 Placeholder Pages (Basic Structure)
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
├── database-setup.sql      # Complete database schema
├── auth-setup.sql          # Demo user setup
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
- Ensure the final-setup.sql file runs without errors
- Check Supabase project status
- Verify API keys are correct

### Authentication Issues
- Clear browser cache and localStorage
- Check network connectivity to Supabase
- Verify user exists in auth.users table

### AI Features Not Working
- Configure AI provider in Settings
- For local Ollama: ensure it's running on localhost:11434
- For cloud providers: add valid API keys

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

## 🎉 You're Ready!

The AI Auditor GRC application is now ready to use. Start by logging in with one of the demo accounts and exploring the features!