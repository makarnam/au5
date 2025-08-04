# Tech Context

Stack Overview:
- Frontend: React 18, Vite, TypeScript, TailwindCSS
- State Mgmt: [Lightweight (Zustand or hooks) — confirm]
- Backend: Supabase in cloud (Postgres, RLS, Auth, Storage, Realtime)
- API: PostgREST auto-generated endpoints; Supabase JS client
- AI: Optional local Ollama; abstraction via src/services/aiService.ts

Local Development:
- Node: [version per package.json engines if defined]
- Scripts:
  - dev: Vite dev server
  - build: Vite build
  - preview: Vite preview
  - tests: [if configured under src/__tests__]
- Env:
  - VITE_SUPABASE_URL
  - VITE_SUPABASE_ANON_KEY
  - [Optional] AI-related env (e.g., OLLAMA_HOST, open router)

Project Structure (high-level):
- src/
  - components/ (feature + ui primitives)
  - pages/ (route-level screens)
  - services/ (domain data access: controls, audits, risks, etc.)
  - lib/ (supabase client, utils)
  - store/ (authStore, etc.)
  - i18n/ (localization bootstrap)
  - types/ (shared TS types)
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
- tailwindcss / postcss / autoprefixer
- Zustand [if used] / or internal custom hooks
- i18n library [TBD/confirm]

Coding Conventions:
- TypeScript strict where reasonable
- Feature-first organization
- Keep components presentational; orchestrate data in services/hooks
- Prefer async/await with centralized error handling in services

Security & Secrets:
- Use anon key in browser; service role never in client
- RLS is primary enforcement layer
- For admin tasks, use secure server scripts or migration pipelines

Testing:
- Unit tests under src/__tests__
- SQL verification under sql/diagnostics
- Prefer mocking Supabase client for unit tests

Build & Deploy:
- Vite build artifacts
- Supabase migrations applied before deploy
- Environment variables provided per environment

Open Items:
- Confirm global state approach
- Define AI provider toggling and health checks
- Document CI/CD if applicable
