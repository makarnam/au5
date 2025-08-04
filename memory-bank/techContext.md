# Tech Context

Stack Overview:
- Frontend: React 18, Vite, TypeScript, TailwindCSS
- State Mgmt: React Query (server-state) + lightweight client state (Zustand or hooks) [pending confirmation]
- Backend: Supabase in cloud (Postgres, RLS, Auth, Storage, Realtime)
- API: PostgREST auto-generated endpoints; Supabase JS client
- AI: Optional local Ollama; abstraction via src/services/aiService.ts

Local Development:
- Node: [version per package.json engines if defined]
- Scripts:
  - dev: Vite dev server
  - build: Vite build
  - preview: Vite preview
  - test: [if configured under src/__tests__]
- Env:
  - VITE_SUPABASE_URL
  - VITE_SUPABASE_ANON_KEY
  - [Optional] AI-related env (e.g., OLLAMA_HOST, OpenRouter/OpenAI)
- Tooling:
  - ESLint, TypeScript config (tsconfig.*), Tailwind (tailwind.config.js), PostCSS

Project Structure (high-level):
- src/
  - components/ (feature + ui primitives)
  - pages/ (route-level screens)
  - services/ (domain data access: controls, audits, risks, etc.)
  - lib/ (supabase client, utils)
  - store/ (authStore, etc.)
  - i18n/ (localization bootstrap)
  - types/ (shared TS types)
  - __tests__/ (unit tests for components/services)
- sql/
  - core/, controls/, audits/, findings/, risks/, workflows/, auth/, migrations/
  - diagnostics/ (verification scripts)

Database & Migrations:
- SQL-first approach with module split
- RLS enforced per table with policies
- Functions/triggers where needed for integrity and workflow transitions
- Verification scripts under sql/diagnostics and sql/**/verify*.sql

Dependencies & Notable Libraries:
- @supabase/supabase-js
- react-router-dom
- @tanstack/react-query
- react-hook-form + zod
- tailwindcss / postcss / autoprefixer
- i18next
- framer-motion
- Radix UI primitives
- Zustand [if used] / or internal custom hooks

Coding Conventions:
- TypeScript strict where reasonable
- Feature-first organization
- Keep components presentational; orchestrate data in services/hooks
- Prefer async/await with centralized error handling in services
- Internationalization: extract strings, use keys/namespaces

Security & Secrets:
- Use anon key in browser; service role never in client
- RLS is primary enforcement layer
- For admin tasks, use secure server scripts or migration pipelines

Testing:
- Unit tests under src/__tests__
- Integration tests using MSW for Supabase API boundaries
- SQL verification under sql/diagnostics
- Prefer mocking Supabase client for unit tests

Build & Deploy:
- Vite build artifacts
- Supabase migrations applied before deploy
- Environment variables provided per environment
- CI/CD target: GitHub Actions for lint, typecheck, test, build, artifact

Open Items:
- Confirm global state approach (Zustand vs hooks-only)
- Define AI provider toggling and health checks
- Implement CI/CD and document environment promotion strategy
