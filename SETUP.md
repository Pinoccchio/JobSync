# JobSync - Supabase & Gemini AI Setup Complete ✅

This document details the infrastructure setup completed for the JobSync application.

## ✅ What's Been Set Up

### 1. Environment Configuration
- **File**: `.env.local`
- **Contents**:
  - ✅ Supabase URL configured
  - ✅ Supabase Anon Key configured
  - ✅ Supabase Service Role Key configured
  - ✅ Gemini API Key configured
  - ✅ Automatically excluded from Git (in `.gitignore`)

### 2. Dependencies Installed
```json
{
  "@supabase/supabase-js": "^2.x.x",      // Supabase client
  "@supabase/ssr": "^0.x.x",              // SSR support for Next.js
  "@google/generative-ai": "^0.x.x"       // Gemini AI SDK
}
```

### 3. Supabase Client Configuration
**Location**: `src/lib/supabase/`

- ✅ **`client.ts`** - Browser client (client components)
- ✅ **`server.ts`** - Server client (server components, API routes)
- ✅ **`admin.ts`** - Admin client with service role (privileged operations)
- ✅ **`index.ts`** - Unified exports

**Usage Examples**:
```typescript
// In Client Components
import { supabase } from '@/lib/supabase/client';

// In Server Components
import { createServerClient } from '@/lib/supabase/server';
const supabase = createServerClient();

// In API Routes (admin operations)
import { supabaseAdmin } from '@/lib/supabase/admin';
```

### 4. Gemini AI Configuration
**Location**: `src/lib/gemini/`

- ✅ **`config.ts`** - Model configuration & ranking algorithm prompts
- ✅ **`client.ts`** - Gemini AI client with helper functions
- ✅ **`index.ts`** - Unified exports

**Features**:
- 3 ranking algorithms (Education, Experience, Skills)
- JSON response parsing
- Error handling
- Configurable model parameters

**Usage Example**:
```typescript
import { generateContent, parseGeminiJSON, RANKING_PROMPTS } from '@/lib/gemini';

const response = await generateContent(RANKING_PROMPTS.educationMatch);
const result = parseGeminiJSON<ScoreResponse>(response);
```

### 5. Authentication Integration
**File**: `src/contexts/AuthContext.tsx`

- ✅ Replaced localStorage with Supabase Auth
- ✅ Uses `supabase.auth.signInWithPassword()`
- ✅ Listens to `onAuthStateChange()` for session updates
- ✅ Maintains same interface (no breaking changes to existing components)
- ✅ Role stored temporarily in localStorage (will use database when schema is ready)

### 6. API Route Structure
**Location**: `src/app/api/`

All routes have placeholder implementations with TODO comments:

- ✅ **`/api/auth`** - Authentication endpoints
- ✅ **`/api/jobs`** - Job management CRUD
- ✅ **`/api/applications`** - Application submission & tracking
- ✅ **`/api/training`** - PESO training programs
- ✅ **`/api/gemini`** - AI ranking algorithms (with working example!)
- ✅ **`/api/users`** - User management (Admin)
- ✅ **`/api/storage`** - File upload/download

Each route includes:
- Request/response types
- TODO implementation steps
- Database schema requirements
- Code examples

### 7. TypeScript Type Definitions
**Location**: `src/types/`

- ✅ **`database.types.ts`** - Complete database schema types
- ✅ **`supabase.ts`** - Type helpers for queries
- ✅ **`index.ts`** - Central exports

**Includes types for**:
- Users, Jobs, Applications, Training Programs
- Insert/Update types for all tables
- Enums (UserRole, ApplicationStatus, etc.)
- Relations (ApplicationWithRelations, etc.)
- Gemini AI ranking results

---

## 🔧 What You Need to Do Next

### Step 1: Create Database Schema in Supabase

1. Go to your Supabase Dashboard: https://app.supabase.com/project/ajmftwhmskcvljlfvhjf
2. Navigate to **SQL Editor**
3. Create the following tables using the SQL schema below

<details>
<summary>📄 Click to view complete SQL schema</summary>

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE user_role AS ENUM ('ADMIN', 'HR', 'PESO', 'APPLICANT');
CREATE TYPE application_status AS ENUM ('pending', 'approved', 'denied');
CREATE TYPE job_status AS ENUM ('active', 'hidden', 'archived');

-- Users table (synced with Supabase Auth)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'APPLICANT',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Jobs table
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  degree_requirement TEXT NOT NULL,
  eligibilities TEXT[] DEFAULT '{}',
  skills TEXT[] DEFAULT '{}',
  years_of_experience INTEGER NOT NULL DEFAULT 0,
  status job_status NOT NULL DEFAULT 'active',
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Applicant profiles (extracted from PDS)
CREATE TABLE applicant_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  education JSONB DEFAULT '[]',
  work_experience JSONB DEFAULT '[]',
  eligibilities TEXT[] DEFAULT '{}',
  skills TEXT[] DEFAULT '{}',
  total_years_experience INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Applications table
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  applicant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pds_file_url TEXT NOT NULL,
  status application_status NOT NULL DEFAULT 'pending',
  rank INTEGER,
  match_score NUMERIC(5,2),
  education_score NUMERIC(5,2),
  experience_score NUMERIC(5,2),
  skills_score NUMERIC(5,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(job_id, applicant_id)
);

-- Training programs table
CREATE TABLE training_programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  duration TEXT NOT NULL,
  capacity INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Training applications table
CREATE TABLE training_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  program_id UUID NOT NULL REFERENCES training_programs(id) ON DELETE CASCADE,
  applicant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  id_image_url TEXT NOT NULL,
  status application_status NOT NULL DEFAULT 'pending',
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(program_id, applicant_id)
);

-- Activity logs table
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  details TEXT NOT NULL,
  ip_address TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_applications_job_id ON applications(job_id);
CREATE INDEX idx_applications_applicant_id ON applications(applicant_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_training_applications_program_id ON training_applications(program_id);
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_timestamp ON activity_logs(timestamp DESC);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applicant_profiles_updated_at BEFORE UPDATE ON applicant_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_training_programs_updated_at BEFORE UPDATE ON training_programs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

</details>

### Step 2: Set Up Row Level Security (RLS)

Enable RLS on all tables and create policies:

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applicant_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Example policies (customize as needed)

-- Users: Admin can see all, others can see their own
CREATE POLICY "Users can view their own data"
  ON users FOR SELECT
  USING (auth.uid() = id OR (SELECT role FROM users WHERE id = auth.uid()) = 'ADMIN');

-- Jobs: Everyone can view active jobs
CREATE POLICY "Anyone can view active jobs"
  ON jobs FOR SELECT
  USING (status = 'active' OR created_by = auth.uid());

-- Applications: Applicants see their own, HR sees all
CREATE POLICY "Users can view their own applications"
  ON applications FOR SELECT
  USING (applicant_id = auth.uid() OR
         (SELECT role FROM users WHERE id = auth.uid()) IN ('HR', 'ADMIN'));

-- Add more policies as needed...
```

### Step 3: Create Storage Buckets

1. Go to **Storage** in Supabase Dashboard
2. Create two buckets:
   - `pds-files` (for PDS PDFs)
   - `id-images` (for training ID uploads)
3. Set up bucket policies:
   - Users can upload their own files
   - HR/PESO can view all files

### Step 4: Create Test Users

Create test accounts for each role:

```sql
-- Insert test users (run after creating first users via Supabase Auth)
-- You'll need to create these via the Supabase Auth interface first
-- Then update their roles:

UPDATE users SET role = 'ADMIN' WHERE email = 'admin@jobsync.test';
UPDATE users SET role = 'HR' WHERE email = 'hr@jobsync.test';
UPDATE users SET role = 'PESO' WHERE email = 'peso@jobsync.test';
UPDATE users SET role = 'APPLICANT' WHERE email = 'applicant@jobsync.test';
```

### Step 5: Generate Type Definitions

Once your database is set up, generate TypeScript types:

```bash
npx supabase gen types typescript --project-id ajmftwhmskcvljlfvhjf > src/types/database.types.ts
```

### Step 6: Test the Setup

1. Start the dev server:
```bash
cd jobsync
npm run dev
```

2. Test authentication:
   - Go to http://localhost:3000/login
   - Try logging in (create user via Supabase Dashboard first)

3. Test API routes:
   - Visit http://localhost:3000/api/gemini
   - Visit http://localhost:3000/api/jobs

### Step 7: Implement Features

Now you're ready to implement actual features! Start with:

1. **User Registration** (`/api/auth/signup`)
2. **Job Management** (`/api/jobs/route.ts`)
3. **File Upload** (`/api/storage/route.ts`)
4. **Gemini AI Ranking** (already has example code in `/api/gemini/route.ts`)

Each API route file has detailed TODO comments with implementation steps.

---

## 📂 Project Structure

```
jobsync/
├── .env.local                           # ✅ Environment variables
├── src/
│   ├── lib/
│   │   ├── supabase/                   # ✅ Supabase clients
│   │   │   ├── client.ts               # Browser client
│   │   │   ├── server.ts               # Server client
│   │   │   ├── admin.ts                # Admin client
│   │   │   └── index.ts
│   │   └── gemini/                     # ✅ Gemini AI
│   │       ├── client.ts               # Gemini client
│   │       ├── config.ts               # Prompts & config
│   │       └── index.ts
│   ├── types/                          # ✅ TypeScript types
│   │   ├── database.types.ts           # Database schema
│   │   ├── supabase.ts                 # Query helpers
│   │   └── index.ts
│   ├── contexts/
│   │   └── AuthContext.tsx             # ✅ Supabase Auth integrated
│   ├── app/
│   │   └── api/                        # ✅ API routes (placeholder)
│   │       ├── auth/route.ts
│   │       ├── jobs/route.ts
│   │       ├── applications/route.ts
│   │       ├── training/route.ts
│   │       ├── gemini/route.ts
│   │       ├── users/route.ts
│   │       └── storage/route.ts
│   └── ...
└── SETUP.md                            # This file
```

---

## 🔑 Important Notes

### Security
- ✅ `.env.local` is excluded from Git
- ✅ Service role key is only used server-side
- ⚠️ Set up RLS policies before going live
- ⚠️ Validate all user inputs in API routes

### Gemini AI
- ✅ API key is configured
- ✅ 3 ranking algorithms defined
- ✅ Example implementation in `/api/gemini/route.ts`
- 📝 Temperature set to 0.2 for consistency
- 📝 Using `gemini-1.5-pro` for best quality

### Supabase Auth
- ✅ Authentication working with email/password
- ✅ Session management with cookies
- ⚠️ Role stored in localStorage temporarily
- 📝 Move role to `users` table once schema is ready

### Next Steps Priority
1. **High Priority**: Create database schema (Step 1)
2. **High Priority**: Set up RLS policies (Step 2)
3. **Medium Priority**: Create storage buckets (Step 3)
4. **Medium Priority**: Create test users (Step 4)
5. **Low Priority**: Generate types (Step 5)
6. **Implementation**: Start building features (Step 7)

---

## 🆘 Troubleshooting

### Cannot connect to Supabase
- Check `.env.local` has correct URL and keys
- Restart dev server after changing `.env.local`
- Verify Supabase project is active

### Authentication not working
- Create users in Supabase Dashboard first
- Check email confirmation is disabled (for testing)
- Look at browser console for error messages

### Gemini AI errors
- Verify API key in `.env.local`
- Check API quota limits in Google AI Studio
- Look at server console for detailed errors

### Type errors
- Run `npm install` to ensure all packages are installed
- Generate types from Supabase (Step 5)
- Restart TypeScript server in VS Code

---

## 📚 Documentation Links

- [Supabase Docs](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Supabase Storage Guide](https://supabase.com/docs/guides/storage)
- [Gemini AI Docs](https://ai.google.dev/docs)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

---

**Setup completed by Claude Code on 2025-01-22** 🎉
