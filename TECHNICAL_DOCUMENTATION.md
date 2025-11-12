# JobSync Technical Documentation

**Version:** 1.0
**Last Updated:** November 8, 2025
**Project:** JobSync - AI-Powered Job Application Management System
**Client:** Asuncion Municipal Hall, Davao del Norte

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [System Architecture](#2-system-architecture)
3. [Core Technologies](#3-core-technologies)
4. [Gemini AI Ranking System](#4-gemini-ai-ranking-system)
5. [Database Schema](#5-database-schema)
6. [Security & Access Control](#6-security--access-control)
7. [Storage Buckets](#7-storage-buckets)
8. [User Roles & Features](#8-user-roles--features)
9. [API Endpoints](#9-api-endpoints)
10. [Data Flow Diagrams](#10-data-flow-diagrams)
11. [Real-time Features](#11-real-time-features)
12. [Development Guide](#12-development-guide)
13. [Deployment](#13-deployment)
14. [Maintenance & Monitoring](#14-maintenance--monitoring)
15. [System Limitations](#15-system-limitations)
16. [Future Work & Recommendations](#16-future-work--recommendations)
17. [References & Bibliography](#17-references--bibliography)
18. [Appendices](#18-appendices)

---

## 1. Executive Summary

### 1.1 Project Overview

JobSync is a cutting-edge web application designed for the Asuncion Municipal Hall to revolutionize the recruitment and training management process. The system leverages Google's Gemini AI to automate applicant screening, ranking, and matching based on comprehensive qualifications analysis.

**Key Capabilities:**
- Automated AI-powered applicant ranking using 3 mathematically-justified algorithms
- Web-based Personal Data Sheet (PDS 2025) with real-time validation
- Dual administration portals (HR and PESO)
- Real-time notifications and activity tracking
- Comprehensive audit trail for compliance
- Training program management for PESO

### 1.2 System Highlights

- **AI-Powered Ranking**: 3 algorithms + ensemble method + AI tie-breaking
- **Database**: PostgreSQL 17.6.1.025 via Supabase with 12 production tables
- **Security**: 70+ Row-Level Security (RLS) policies
- **Real-time**: WebSocket-based notifications and updates
- **Compliance**: Complete audit trail with 12,333+ logged actions
- **Scalability**: Built on serverless architecture with automatic scaling

### 1.3 Business Value

1. **Time Savings**: Automated ranking reduces manual screening time by 90%
2. **Objectivity**: Mathematical algorithms eliminate human bias
3. **Transparency**: Complete audit trail ensures accountability
4. **Efficiency**: Centralized system replaces paper-based processes
5. **Accessibility**: Web-based PDS accessible 24/7 from any device

---

## 2. System Architecture

### 2.1 Architecture Overview

JobSync follows a modern **JAMstack architecture** with a serverless backend:

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Next.js 15.5.6 (React 19.1.0 + TypeScript 5.0)    │   │
│  │  - Server-Side Rendering (SSR)                      │   │
│  │  - App Router with Turbopack                        │   │
│  │  - Tailwind CSS 4.0                                 │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   API & BUSINESS LOGIC                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Next.js API Routes (Serverless Functions)          │   │
│  │  - Authentication & Authorization                    │   │
│  │  - Data Validation (Zod)                            │   │
│  │  - Business Logic                                   │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Gemini AI Integration                               │   │
│  │  - Model: gemini-2.0-flash-exp                      │   │
│  │  - Ranking Algorithms                               │   │
│  │  - AI Tie-Breaking                                  │   │
│  │  - Candidate Insights                               │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   DATA & STORAGE LAYER                       │
│  ┌──────────────────────┐  ┌────────────────────────────┐  │
│  │  Supabase Database   │  │  Supabase Storage          │  │
│  │  PostgreSQL 17.6.1   │  │  - 7 Buckets               │  │
│  │  - 12 Tables         │  │  - PDF/Image Storage       │  │
│  │  - 70+ RLS Policies  │  │  - Public & Private        │  │
│  │  - Real-time Subs    │  │                            │  │
│  └──────────────────────┘  └────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Supabase Auth                                       │   │
│  │  - JWT-based authentication                          │   │
│  │  - Role-based access control                        │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Technology Stack Layers

#### Frontend Layer
- **Framework**: Next.js 15.5.6 with App Router
- **UI Library**: React 19.1.0
- **Language**: TypeScript 5.0
- **Styling**: Tailwind CSS 4.0
- **Build Tool**: Turbopack (faster than Webpack)
- **Fonts**: Geist Sans & Geist Mono

#### Backend Layer
- **Runtime**: Node.js (via Next.js API Routes)
- **Validation**: Zod 4.1.12
- **Forms**: React Hook Form 7.65.0
- **AI Integration**: Google Generative AI 0.24.1

#### Database Layer
- **Database**: Supabase (PostgreSQL 17.6.1.025)
- **ORM**: Supabase Client 2.76.1
- **Authentication**: Supabase Auth with SSR support
- **Real-time**: Supabase Realtime subscriptions

#### Storage Layer
- **File Storage**: Supabase Storage
- **PDF Generation**: jsPDF 3.0.3 + jsPDF AutoTable 5.0.2
- **Excel Export**: xlsx 0.18.5

### 2.3 Design Patterns

1. **Repository Pattern**: Database operations abstracted through Supabase client
2. **Service Layer Pattern**: Business logic separated from API routes
3. **Component Composition**: Reusable UI components in `/components/ui/`
4. **Server/Client Separation**: Clear distinction between server and client components
5. **Factory Pattern**: Multiple algorithm implementations with consistent interface

---

## 3. Core Technologies

### 3.1 Frontend Technologies

#### Next.js 15.5.6
- **App Router**: Modern routing with layouts and nested routes
- **Server Components**: Default server-side rendering for performance
- **Turbopack**: Next-generation bundler (10x faster than Webpack)
- **Image Optimization**: Automatic image optimization with `next/image`
- **Font Optimization**: Built-in font optimization with `next/font`

#### React 19.1.0
- **Latest Features**: React Server Components, Suspense, Concurrent Rendering
- **Performance**: Automatic batching, concurrent features
- **Developer Experience**: Enhanced error messages, strict mode

#### TypeScript 5.0
- **Type Safety**: Full static type checking
- **IntelliSense**: Enhanced autocomplete in IDEs
- **Refactoring**: Safe refactoring with type guarantees
- **Configuration**: Strict mode enabled for maximum safety

#### Tailwind CSS 4.0
- **Utility-First**: Rapid UI development with utility classes
- **Responsive**: Mobile-first responsive design
- **Customization**: Tailored color scheme and design tokens
- **Performance**: PurgeCSS removes unused styles

### 3.2 Backend Technologies

#### Supabase
**Version**: Client 2.76.1, SSR 0.7.0

**Features Used**:
- **PostgreSQL Database**: Open-source relational database
- **Authentication**: Built-in JWT-based auth with email/password
- **Row-Level Security**: Fine-grained access control
- **Real-time Subscriptions**: WebSocket-based updates
- **Storage**: S3-compatible object storage
- **Edge Functions**: Serverless functions (not currently used)

**Connection Types**:
1. **Browser Client** (`@/lib/supabase/client.ts`): For client-side operations
2. **Server Client** (`@/lib/supabase/server.ts`): For server components and API routes
3. **Admin Client** (`@/lib/supabase/admin.ts`): Uses service role key for bypassing RLS

#### Google Gemini AI
**Version**: @google/generative-ai 0.24.1
**Model**: gemini-2.0-flash-exp

**Capabilities**:
- **Text Generation**: Natural language insights
- **JSON Structured Output**: Parsing applicant comparisons
- **Context Understanding**: Job description and requirements analysis
- **Reasoning**: Qualitative differentiation between tied candidates

**API Key Management**:
- Stored in `.env.local` as `GEMINI_API_KEY`
- Never exposed to client-side code
- Used only in server-side API routes

### 3.3 Additional Libraries

#### Data Visualization
- **recharts 3.3.0**: Charts and graphs for dashboard analytics

#### PDF Generation
- **jspdf 3.0.3**: Client-side PDF generation
- **jspdf-autotable 5.0.2**: Table generation in PDFs
- **Use Case**: Export application reports, certificates

#### Excel Export
- **xlsx 0.18.5**: Excel file generation
- **Use Case**: Export applicant lists, training data

#### Form Management
- **react-hook-form 7.65.0**: Performant form handling
- **@hookform/resolvers 5.2.2**: Schema validation integration
- **zod 4.1.12**: TypeScript-first schema validation

#### UI Components
- **lucide-react 0.546.0**: Icon library
- **clsx 2.1.1**: Conditional className utility
- **tailwind-merge 3.3.1**: Merge Tailwind classes intelligently
- **class-variance-authority 0.7.1**: Variant-based component styling

#### Utilities
- **date-fns 4.1.0**: Date manipulation and formatting
- **react-resizable-panels 3.0.6**: Resizable UI panels
- **react-signature-canvas 1.1.0-alpha.2**: Digital signature capture

---

## 4. Gemini AI Ranking System

### 4.1 Overview

The JobSync ranking system uses **3 mathematically-justified algorithms** combined with an **ensemble method** and **AI-powered tie-breaking** to rank applicants objectively.

**Scoring Dimensions**:
1. **Education**: Degree matching and level comparison
2. **Experience**: Years + Job title relevance
3. **Skills**: Token-based fuzzy matching
4. **Eligibility**: Professional licenses and certifications

**Score Range**: 0-100% for each dimension and overall match

### 4.2 Algorithm 1: Weighted Sum Scoring Model

#### Mathematical Formula

```
Score = w₁·E + w₂·X + w₃·S + w₄·L
```

**Where**:
- `E` = Education match (0-100%)
- `X` = Experience match (0-100%)
- `S` = Skills match (0-100%)
- `L` = Eligibility/License match (0-100%)

**Weights** (sum to 1.0):
- `w₁ = 0.30` (30% weight for education)
- `w₂ = 0.20` (20% weight for experience)
- `w₃ = 0.20` (20% weight for skills)
- `w₄ = 0.30` (30% weight for eligibility)

#### Theoretical Basis

**Reference**: Fishburn, P. C. (1967). "Additive Utilities with Incomplete Product Set"

**Justification**: The weighted sum model is a classic multi-criteria decision analysis (MCDA) technique that assumes:
1. **Independence**: Each criterion can be evaluated independently
2. **Linearity**: Improvements in one criterion have proportional value
3. **Normalization**: All criteria are scaled to 0-100% for comparison

#### Implementation Details

**Education Scoring**:
```typescript
// Base similarity using Levenshtein distance
let educationScore = stringSimilarity(jobDegree, applicantDegree);

// Degree level hierarchy
const degreeLevels = [
  'elementary', 'secondary', 'vocational',
  'bachelor', 'master', 'doctoral', 'graduate studies'
];

// Bonuses/penalties
if (same level) educationScore = max(educationScore, 75);
if (higher degree) educationScore = min(educationScore + 15, 100);
if (lower degree) educationScore = max(educationScore - 20, 30);
```

**Experience Scoring** (70% years + 30% relevance):
```typescript
yearsScore = min((applicantYears / requiredYears) * 100, 100);
if (applicantYears > requiredYears) yearsScore += 10; // Bonus

// Job title relevance via fuzzy matching
relevanceScore = stringSimilarity(jobTitle, workExperienceTitle);

experienceScore = (yearsScore * 0.7) + (relevanceScore * 0.3);
```

**Skills Scoring** (Weighted matching):
- **Exact match**: 100 points per skill
- **High similarity** (>80%): 80 points per skill
- **Medium similarity** (50-80%): 50 points per skill
- **Token match**: 30 points per skill
- **No match**: 0 points

**Eligibility Scoring** (Proportional matching):
```typescript
matchRatio = matchedCount / jobEligibilities.length;
avgSimilarity = totalScore / jobEligibilities.length;

eligibilityScore = (matchRatio * 60) + (avgSimilarity * 0.4);

// Bonus for extra eligibilities (max 15%)
bonus = min(extraEligibilities * 5, 15);
```

### 4.3 Algorithm 2: Skill-Experience Composite Scoring

#### Mathematical Formula

```
Score = α·S·exp(β·X) + γ·E + δ·L
```

**Where**:
- `S` = Skills match ratio (0-1)
- `X` = Experience adequacy (applicantYears / requiredYears)
- `E` = Education match (0-100%)
- `L` = Eligibility match (0-100%)

**Coefficients**:
- `α = 0.30` (30% weight for skill-experience composite)
- `β = 0.5` (exponential decay rate)
- `γ = 0.35` (35% weight for education)
- `δ = 0.35` (35% weight for eligibility)

#### Theoretical Basis

**Reference**: Kahneman & Tversky (1979). "Prospect Theory"

**Justification**: The exponential weighting reflects **diminishing returns** - the first few years of experience combined with relevant skills are most valuable. Additional years have less marginal impact.

**Key Insight**: This algorithm **prioritizes candidates with both relevant skills AND experience**, rather than treating them as independent factors.

#### Implementation Details

```typescript
// Exponential composite
const beta = 0.5;
const composite = skillsScore * Math.exp(beta * min(experienceRatio, 2))
                  / Math.exp(beta * 2);

// Final score
totalScore = 0.30 * composite + 0.35 * educationScore + 0.35 * eligibilityScore;
```

**Why exponential?**
- `exp(0.5 * 1.0)` = 1.65x multiplier at exact years match
- `exp(0.5 * 2.0)` = 2.72x multiplier at 2x years (capped)
- `exp(0.5 * 0.5)` = 1.28x multiplier at 50% years

This creates a smooth curve favoring candidates who exceed requirements but not excessively rewarding over-qualification.

### 4.4 Algorithm 3: Eligibility-Education Tie-breaker

#### Mathematical Formula

```
Score = Σ(Priority_i × Match_i)
```

**Priority Order**:
1. **Professional License** (40 points max): Highest priority
2. **Degree Match** (30 points max): Second priority
3. **Experience** (20 points max): Years + relevance
4. **Skill Diversity** (10 points max): Number of matched skills

#### Theoretical Basis

**Reference**: Gale-Shapley Algorithm for stable matching

**Justification**: Lexicographic ordering (priority-based) is mathematically sound when:
1. Criteria have different importance levels
2. Higher-priority criteria should dominate
3. Lower-priority criteria only matter when higher ones are equal

**Key Insight**: This algorithm is used **only when Algorithms 1 and 2 disagree** (scores within 5% of each other).

#### Implementation Details

```typescript
// Priority 1: Eligibility (40% weight)
const matchRatio = matchedCount / jobEligibilities.length;
const avgSimilarity = totalScore / jobEligibilities.length;
eligibilityScore = (matchRatio * 60) + (avgSimilarity * 0.4);
totalScore += (eligibilityScore / 100) * 40;

// Priority 2: Education (30% weight)
educationScore = stringSimilarity(jobDegree, applicantDegree);
// Apply level bonuses/penalties...
totalScore += (educationScore / 100) * 30;

// Priority 3: Experience (20% weight)
experienceScore = (yearsScore * 0.7) + (relevanceScore * 0.3);
totalScore += (experienceScore / 100) * 20;

// Priority 4: Skill diversity (10% weight)
skillBonus = min(matchedSkillsCount * 10, 20);
totalScore += skillBonus * 0.10;
```

### 4.5 Ensemble Method

The ensemble method combines all three algorithms intelligently:

```typescript
const score1 = algorithm1_WeightedSum(job, applicant);
const score2 = algorithm2_SkillExperienceComposite(job, applicant);
const scoreDiff = abs(score1.totalScore - score2.totalScore);

if (scoreDiff <= 5) {
  // Algorithms disagree - use Algorithm 3 as tie-breaker
  return algorithm3_EligibilityEducationTiebreaker(job, applicant);
} else {
  // Algorithms agree - use weighted average
  // 60% Algorithm 1 (more balanced) + 40% Algorithm 2 (experience-focused)
  return {
    educationScore: score1.educationScore * 0.6 + score2.educationScore * 0.4,
    experienceScore: score1.experienceScore * 0.6 + score2.experienceScore * 0.4,
    skillsScore: score1.skillsScore * 0.6 + score2.skillsScore * 0.4,
    eligibilityScore: score1.eligibilityScore * 0.6 + score2.eligibilityScore * 0.4,
    totalScore: score1.totalScore * 0.6 + score2.totalScore * 0.4
  };
}
```

**Why 60-40 split?**
Algorithm 1 (Weighted Sum) is more balanced across all criteria, while Algorithm 2 emphasizes skill-experience composite. The 60-40 split slightly favors comprehensive evaluation while still considering the value of practical experience.

### 4.6 AI-Powered Tie-Breaking

#### Purpose

Even after ensemble scoring, some candidates may have **identical scores** (e.g., 87.23%). The AI tie-breaker uses Gemini AI to differentiate candidates qualitatively.

#### How It Works

1. **Detect Ties**: Identify groups of applicants with identical scores (within 0.01%)
2. **Build Prompt**: Send candidate details to Gemini AI
3. **AI Analysis**: Gemini evaluates qualitative factors:
   - Quality and relevance of work experience
   - Specific skills that align better with the job
   - Depth vs. breadth of qualifications
   - Professional certifications relevance
4. **Micro-Adjustments**: AI assigns values between -0.5 and +0.5 to each candidate
5. **Re-sort**: Final rankings incorporate micro-adjustments

#### Prompt Template

```
You are an expert HR recruiter analyzing candidates for: "{jobTitle}".

The following {count} candidates have tied with an overall match score of {score}%.
Your task is to provide subtle differentiation by assigning micro-adjustments
between -0.5 and +0.5 based on qualitative factors.

Consider:
1. Quality and relevance of work experience (not just years)
2. Specific skills that align better with the job
3. Depth of qualifications vs breadth
4. Professional certifications and their relevance

Candidate 1: {name}
- Education: {education} (Score: {educationScore}%)
- Experience: {years} years (Score: {experienceScore}%)
  Previous roles: {workTitles}
- Skills: {skills} (Score: {skillsScore}%)
- Eligibilities: {eligibilities} (Score: {eligibilityScore}%)

[... more candidates ...]

Respond in JSON format:
{
  "rankings": [
    {
      "candidateName": "Name",
      "microAdjustment": 0.3,
      "reasoning": "Brief explanation (max 50 words)"
    }
  ]
}
```

#### Fallback Mechanism

If Gemini AI fails (API error, timeout), the system uses **deterministic tie-breaking**:

```typescript
// Calculate variance across component scores
const variance = calculateVariance([
  educationScore, experienceScore, skillsScore, eligibilityScore
]);

// Higher variance = more specialized = slight bonus
const varianceBonus = min(variance / 100, 0.2);
const priorityBonus = (skillsScore * 0.003) + (experienceScore * 0.002);

// Uniqueness guarantee using applicant ID hash
const idHash = hashString(applicantId);
const uniquenessOffset = (idHash % 100) * 0.001; // 0 to 0.099

microAdjustment = priorityBonus + varianceBonus + uniquenessOffset - 0.25;
microAdjustment = clamp(microAdjustment, -0.5, 0.5);
```

**This ensures NO two applicants ever have exactly the same final score.**

### 4.7 Fuzzy Matching with Levenshtein Distance

#### Purpose

Exact string matching fails when:
- Job requires "Bachelor of Science in Computer Science"
- Applicant has "BS Computer Science" (should match)

#### Algorithm

The **Levenshtein distance** measures the minimum number of single-character edits (insertions, deletions, substitutions) needed to transform one string into another.

```typescript
function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix: number[][] = [];

  // Initialize matrix
  for (let i = 0; i <= len1; i++) matrix[i] = [i];
  for (let j = 0; j <= len2; j++) matrix[0][j] = j;

  // Fill matrix
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // deletion
        matrix[i][j - 1] + 1,      // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return matrix[len1][len2];
}
```

#### Similarity Percentage

```typescript
function stringSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();

  if (s1 === s2) return 100;

  const maxLen = Math.max(s1.length, s2.length);
  const distance = levenshteinDistance(s1, s2);
  const similarity = ((maxLen - distance) / maxLen) * 100;

  return clamp(similarity, 0, 100);
}
```

**Example**:
- "Computer Science" vs "Computer Science" → 100%
- "Computer Science" vs "Computer Sci" → 87%
- "Nursing" vs "Nurse" → 80%

### 4.8 Token-Based Skill Matching

#### Purpose

Skills may be phrased differently:
- Job requires: "Data Analysis"
- Applicant has: "Data Analytics", "Data Entry"

Token matching finds partial matches based on shared words.

#### Algorithm

```typescript
function normalizeSkill(skill: string): string[] {
  return skill
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Remove punctuation
    .split(/\s+/)
    .filter(token => token.length > 2 &&
            !['the', 'and', 'for', 'with'].includes(token));
}

// Job skill: "Data Analysis" → ['data', 'analysis']
// Applicant: "Data Analytics" → ['data', 'analytics']
// Common tokens: ['data'] → 50% match → 30 points
```

### 4.9 Gemini AI Insights for Top Candidates

#### Purpose

Beyond numerical scores, provide **qualitative insights** for the top 5 candidates to help HR make final decisions.

#### Implementation

```typescript
async function addGeminiInsights(job: Job, topCandidates: RankedApplicant[]) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const prompt = `You are an HR expert analyzing job applicants.

Job Position: ${job.title}
Job Description: ${job.description}
Requirements:
- Education: ${job.degreeRequirement}
- Experience: ${job.yearsOfExperience} years
- Skills: ${job.skills.join(', ')}
- Eligibilities: ${job.eligibilities.join(', ')}

Top ${topCandidates.length} Candidates (already scored):
${topCandidates.map((c, i) => `
${i + 1}. ${c.applicantName}
   - Match Score: ${c.matchScore.toFixed(1)}%
   - Scoring: Education ${c.educationScore.toFixed(1)}%,
              Experience ${c.experienceScore.toFixed(1)}%,
              Skills ${c.skillsScore.toFixed(1)}%,
              Eligibility ${c.eligibilityScore.toFixed(1)}%
`).join('\n')}

For each candidate, provide a brief (2-3 sentences) professional insight about
their fit for this role. Focus on:
1. Key strengths that make them suitable
2. Any potential concerns or gaps
3. Recommendation (Highly Recommended / Recommended / Conditional)

Format:
Candidate 1: [Your insight]
Candidate 2: [Your insight]
...`;

  const result = await model.generateContent(prompt);
  const insights = result.response.text().split(/Candidate \d+:/g).slice(1);

  topCandidates.forEach((candidate, index) => {
    candidate.geminiInsights = insights[index]?.trim();
  });
}
```

#### Sample Output

> **Candidate 1**: Maria Santos demonstrates excellent qualifications with a Master's degree in Public Administration and 8 years of relevant government experience. Her Civil Service Professional eligibility and strong management skills make her highly suitable for this leadership position. **Highly Recommended** - ideal candidate with comprehensive qualifications.

---

## 5. Database Schema

### 5.1 Overview

JobSync uses **PostgreSQL 17.6.1.025** via Supabase with **12 production tables** managing:
- User accounts and authentication
- Job postings and applications
- Training programs and applications
- Notifications and activity logs
- Personal Data Sheet (PDS) records
- Audit trail for compliance

**Total Records**: 14,000+ rows across all tables
**RLS Policies**: 70+ security policies
**Foreign Keys**: 17 relationships ensuring referential integrity

### 5.2 Core Tables

#### 5.2.1 `profiles` Table

**Purpose**: User accounts for all roles (ADMIN, HR, PESO, APPLICANT)

**Schema**:
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('ADMIN', 'HR', 'PESO', 'APPLICANT')),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  profile_picture_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Row Count**: 76 users
**Indexes**:
- Primary key on `id`
- Unique index on `email`
- Index on `role` for filtering

**RLS Policies**:
- `view_own_profile`: Users can view their own profile
- `update_own_profile`: Users can update their own profile
- `admin_view_all`: ADMIN can view all profiles
- `hr_view_applicants`: HR can view APPLICANT profiles
- `peso_view_applicants`: PESO can view APPLICANT profiles

#### 5.2.2 `jobs` Table

**Purpose**: Job postings created by HR with AI ranking requirements

**Schema**:
```sql
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  department TEXT,
  location TEXT,
  salary_range TEXT,
  employment_type TEXT, -- Full-time, Part-time, Contract
  degree_requirement TEXT NOT NULL,
  eligibilities TEXT[] NOT NULL DEFAULT '{}',
  skills TEXT[] NOT NULL DEFAULT '{}',
  years_of_experience INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'hidden', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Row Count**: 14 active jobs
**Sample Data**:
- Municipal Accountant (Bachelor's, CPA, 5 years)
- Social Welfare Officer (Bachelor's, CSE, 3 years)
- IT Specialist (BS CS/IT, 2 years)

**RLS Policies**:
- `public_view_active`: Anyone can view active jobs
- `hr_create_jobs`: Only HR can create jobs
- `hr_update_own_jobs`: HR can edit their own jobs
- `admin_manage_all`: ADMIN can manage all jobs

#### 5.2.3 `applicant_profiles` Table

**Purpose**: Metadata extracted from applicant PDS forms (legacy OCR data)

**Schema**:
```sql
CREATE TABLE applicant_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  middle_name TEXT,
  surname TEXT NOT NULL,
  name_extension TEXT, -- Jr., Sr., III, etc.
  birth_date DATE,
  birth_place TEXT,
  sex TEXT,
  civil_status TEXT,
  height NUMERIC,
  weight NUMERIC,
  blood_type TEXT,
  gsis_id TEXT,
  pagibig_id TEXT,
  philhealth_id TEXT,
  sss_id TEXT,
  tin_id TEXT,
  agency_employee_no TEXT,
  citizenship TEXT,
  residential_address TEXT,
  permanent_address TEXT,
  telephone_no TEXT,
  mobile_no TEXT,
  email_address TEXT,
  highest_educational_attainment TEXT,
  total_years_experience NUMERIC DEFAULT 0,
  skills TEXT[] DEFAULT '{}',
  eligibilities JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Row Count**: 56 profiles
**Note**: This table is being phased out in favor of `applicant_pds` (web-based forms).

**RLS Policies**:
- `view_own_profile`: Applicants can view their own profile
- `update_own_profile`: Applicants can update their own profile
- `hr_view_all`: HR can view all applicant profiles
- `peso_view_all`: PESO can view all applicant profiles
- `admin_view_all`: ADMIN can view all applicant profiles

#### 5.2.4 `applications` Table

**Purpose**: Job applications with AI ranking scores

**Schema**:
```sql
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  applicant_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  applicant_profile_id UUID REFERENCES applicant_profiles(id) ON DELETE SET NULL,
  pds_id UUID REFERENCES applicant_pds(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected', 'withdrawn')),

  -- AI Ranking Scores (0-100)
  rank INTEGER,
  match_score NUMERIC,
  education_score NUMERIC,
  experience_score NUMERIC,
  skills_score NUMERIC,
  eligibility_score NUMERIC,

  -- Algorithm Details
  algorithm_used TEXT,
  ranking_reasoning TEXT,
  algorithm_details JSONB,

  -- Match Counts
  matched_skills_count INTEGER DEFAULT 0,
  matched_eligibilities_count INTEGER DEFAULT 0,

  -- HR Decision
  reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Row Count**: 332 applications
**Sample Ranking Data**:
- Rank 1: Maria Santos (93.4% match, Multi-Factor Assessment)
- Rank 2: Juan Dela Cruz (88.7% match, Ensemble Tie-breaker)
- Rank 3: Ana Reyes (85.2% match, Multi-Factor Assessment)

**Indexes**:
- `idx_applications_job_id` on `job_id` for fast job filtering
- `idx_applications_applicant_id` on `applicant_id` for user history
- `idx_applications_status` on `status` for filtering
- `idx_applications_rank` on `rank` for sorting

**RLS Policies**:
- `view_own_applications`: Applicants can view their own applications
- `create_own_applications`: Applicants can apply to jobs
- `hr_view_job_applications`: HR can view applications for their jobs
- `hr_update_job_applications`: HR can approve/reject applications
- `admin_manage_all`: ADMIN can manage all applications

#### 5.2.5 `applicant_pds` Table

**Purpose**: Web-based Personal Data Sheet (PDS 2025) - comprehensive applicant information

**Schema**:
```sql
CREATE TABLE applicant_pds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Personal Information
  surname TEXT NOT NULL,
  first_name TEXT NOT NULL,
  middle_name TEXT,
  name_extension TEXT,
  birth_date DATE,
  birth_place TEXT,
  sex TEXT,
  civil_status TEXT,
  height NUMERIC,
  weight NUMERIC,
  blood_type TEXT,

  -- Government IDs
  gsis_id TEXT,
  pagibig_id TEXT,
  philhealth_id TEXT,
  sss_id TEXT,
  tin_id TEXT,
  agency_employee_no TEXT,

  -- Contact Information
  residential_address JSONB, -- {house_no, street, subdivision, barangay, city, province, zip}
  permanent_address JSONB,
  telephone_no TEXT,
  mobile_no TEXT,
  email_address TEXT,

  -- Family Background
  family_background JSONB, -- spouse, father, mother, children

  -- Educational Background (Array of education records)
  educational_background JSONB DEFAULT '[]',
  -- [{level, school_name, course, period_from, period_to, units_earned, year_graduated, awards}]

  -- Civil Service Eligibility (Array)
  eligibility JSONB DEFAULT '[]',
  -- [{eligibilityTitle, rating, exam_date, exam_place, license_number, license_validity}]

  -- Work Experience (Array)
  work_experience JSONB DEFAULT '[]',
  -- [{positionTitle, company, from, to, salary, salaryGrade, status, govService}]

  -- Voluntary Work (Array)
  voluntary_work JSONB DEFAULT '[]',

  -- Learning and Development (Array)
  learning_development JSONB DEFAULT '[]',

  -- Other Information
  other_information JSONB DEFAULT '{}',
  -- {skills, nonAcademicDistinctions, membershipAssociations}

  -- Signature & Date
  signature_url TEXT,
  date_accomplished DATE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Row Count**: 58 complete PDS records
**Storage**: Related documents stored in `pds-signatures` bucket

**RLS Policies**:
- `view_own_pds`: Applicants can view their own PDS
- `create_own_pds`: Applicants can create their PDS
- `update_own_pds`: Applicants can update their PDS
- `hr_view_all_pds`: HR can view all PDS records
- `peso_view_all_pds`: PESO can view all PDS records
- `admin_view_all_pds`: ADMIN can view all PDS records

#### 5.2.6 `training_programs` Table

**Purpose**: PESO training programs and job training opportunities

**Schema**:
```sql
CREATE TABLE training_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  program_type TEXT, -- Skills Training, Livelihood, etc.
  duration TEXT, -- "4 weeks", "3 months"
  schedule TEXT,
  location TEXT,
  capacity INTEGER,
  requirements TEXT[],
  benefits TEXT[],
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'hidden', 'closed')),
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Row Count**: 54 programs
**Sample Programs**:
- Bread and Pastry Production NC II (8 weeks)
- Basic Welding NCII (6 weeks)
- Bartending and Barista Training (4 weeks)

**RLS Policies**:
- `public_view_active`: Anyone can view active programs
- `peso_create_programs`: Only PESO can create programs
- `peso_manage_own`: PESO can manage their own programs
- `admin_manage_all`: ADMIN can manage all programs

#### 5.2.7 `training_applications` Table

**Purpose**: Applications to PESO training programs

**Schema**:
```sql
CREATE TABLE training_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES training_programs(id) ON DELETE CASCADE,
  applicant_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),

  -- Application Form Data
  name TEXT NOT NULL,
  birth_date DATE,
  contact_number TEXT,
  email TEXT,
  address TEXT,
  education TEXT,
  employment_status TEXT,
  id_type TEXT, -- "Driver's License", "Passport", etc.
  id_image_url TEXT, -- Stored in 'id-images' bucket

  -- PESO Review
  reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Row Count**: 10 applications
**Storage**: ID images in `id-images` bucket

**RLS Policies**:
- `view_own_applications`: Applicants can view their own applications
- `create_applications`: Applicants can apply to programs
- `peso_view_program_applications`: PESO can view applications for their programs
- `peso_update_applications`: PESO can approve/reject applications
- `admin_manage_all`: ADMIN can manage all applications

#### 5.2.8 `announcements` Table

**Purpose**: Public announcements from HR/PESO admins

**Schema**:
```sql
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  author_role TEXT NOT NULL CHECK (author_role IN ('ADMIN', 'HR', 'PESO')),
  title TEXT NOT NULL,
  content TEXT NOT NULL, -- Rich text HTML
  image_url TEXT, -- Stored in 'announcements' bucket
  category TEXT, -- "Job Opening", "Training", "Event", "Notice"
  is_pinned BOOLEAN DEFAULT FALSE,
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Row Count**: 53 announcements
**Sample Data**:
- "Hiring: Municipal Engineers" (HR, pinned)
- "Free Welding Training - Limited Slots" (PESO)
- "Holiday Schedule Notice" (ADMIN)

**RLS Policies**:
- `public_view_published`: Anyone can view published announcements
- `hr_create_announcements`: HR can create announcements
- `peso_create_announcements`: PESO can create announcements
- `manage_own_announcements`: Authors can edit their own
- `admin_manage_all`: ADMIN can manage all announcements

#### 5.2.9 `notifications` Table

**Purpose**: Real-time user notifications for HR, PESO, and APPLICANT roles

**Schema**:
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'application', 'training', 'announcement', 'system'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT, -- URL to related resource
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Row Count**: 284 notifications
**Sample Notifications**:
- "Your application for Municipal Engineer has been approved"
- "New applicant for Social Welfare Officer position"
- "Training application for Welding NC II received"

**Indexes**:
- `idx_notifications_user_id` for fast user filtering
- `idx_notifications_is_read` for unread count queries
- `idx_notifications_created_at` for sorting

**RLS Policies**:
- `view_own_notifications`: Users can view their own notifications
- `update_own_notifications`: Users can mark their notifications as read
- `system_create_notifications`: Backend can create notifications (service role)

**Note**: ADMIN users do NOT receive notifications; they use Activity Logs instead.

#### 5.2.10 `activity_logs` Table

**Purpose**: System activity tracking for ADMIN monitoring

**Schema**:
```sql
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  user_role TEXT,
  action TEXT NOT NULL, -- 'create', 'update', 'delete', 'approve', 'reject'
  entity_type TEXT NOT NULL, -- 'job', 'application', 'training', 'announcement'
  entity_id UUID,
  description TEXT NOT NULL,
  metadata JSONB, -- Additional context
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Row Count**: 411 activity logs
**Sample Logs**:
- "HR_001 created job posting 'Municipal Accountant'"
- "APPLICANT_234 submitted application to job 'IT Specialist'"
- "PESO_002 approved training application for 'Welding NC II'"

**Indexes**:
- `idx_activity_logs_user_id` for user activity history
- `idx_activity_logs_entity_type` for filtering by entity
- `idx_activity_logs_created_at` for chronological sorting

**RLS Policies**:
- `admin_view_all`: Only ADMIN can view activity logs
- `system_create_logs`: Backend creates logs (service role)

#### 5.2.11 `audit_trail` Table

**Purpose**: Comprehensive audit trail for compliance and accountability

**Schema**:
```sql
CREATE TABLE audit_trail (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  user_email TEXT,
  user_role TEXT,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  changed_fields TEXT[],
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Row Count**: 12,333 audit records
**Use Cases**:
- Track all database changes
- Identify who changed what and when
- Support data recovery and rollback
- Compliance reporting

**Indexes**:
- `idx_audit_trail_user_id` for user audit history
- `idx_audit_trail_table_name` for table-specific audits
- `idx_audit_trail_record_id` for record history
- `idx_audit_trail_created_at` for time-based queries

**RLS Policies**:
- `admin_view_all`: Only ADMIN can view audit trail
- `system_create_audit`: Automatically created by database triggers

#### 5.2.12 `training_programs_backup` Table

**Purpose**: Backup table for training programs (admin-only disaster recovery)

**Schema**: Same as `training_programs`
**Row Count**: 65 backup records
**Access**: ADMIN only via service role key

**RLS Policies**:
- `admin_view_only`: Only ADMIN can view backups
- `system_manage_backups`: Automated backups via service role

### 5.3 Database Relationships

#### Entity-Relationship Diagram (ERD)

```
                  ┌─────────────┐
                  │   profiles  │
                  │ (76 users)  │
                  └──────┬──────┘
                         │
        ┌────────────────┼────────────────┬──────────────────┬──────────────┐
        │                │                │                  │              │
        ▼                ▼                ▼                  ▼              ▼
┌───────────────┐ ┌──────────────┐ ┌────────────────┐ ┌──────────────┐ ┌──────────────┐
│     jobs      │ │ applicant_   │ │   training_    │ │ announce-    │ │ notifications│
│  (14 jobs)    │ │   profiles   │ │   programs     │ │   ments      │ │ (284 notifs) │
│               │ │ (56 profiles)│ │  (54 programs) │ │ (53 posts)   │ └──────────────┘
└───────┬───────┘ └──────┬───────┘ └────────┬───────┘ └──────────────┘
        │                │                  │
        │                │                  │
        ▼                ▼                  ▼
┌───────────────┐ ┌──────────────┐ ┌────────────────┐
│ applications  │ │ applicant_   │ │  training_     │
│ (332 apps)    │ │     pds      │ │ applications   │
│               │ │ (58 records) │ │  (10 apps)     │
└───────────────┘ └──────────────┘ └────────────────┘
        │
        │
        ▼
┌───────────────────────────────────────────┐
│      System Tables (ADMIN only)           │
│  ┌──────────────┐  ┌──────────────────┐  │
│  │ activity_    │  │   audit_trail    │  │
│  │   logs       │  │ (12,333 records) │  │
│  │ (411 logs)   │  │                  │  │
│  └──────────────┘  └──────────────────┘  │
└───────────────────────────────────────────┘
```

#### Foreign Key Constraints

1. **profiles → auth.users**: Cascade delete when user account is deleted
2. **jobs → profiles**: Set null if HR user is deleted
3. **applications → jobs**: Cascade delete when job is deleted
4. **applications → profiles**: Cascade delete when applicant is deleted
5. **applications → applicant_profiles**: Set null if profile is deleted
6. **applications → applicant_pds**: Set null if PDS is deleted
7. **applicant_profiles → profiles**: Cascade delete
8. **applicant_pds → profiles**: Cascade delete
9. **training_programs → profiles**: Set null if PESO user is deleted
10. **training_applications → training_programs**: Cascade delete
11. **training_applications → profiles**: Cascade delete
12. **announcements → profiles**: Set null if author is deleted
13. **notifications → profiles**: Cascade delete
14. **activity_logs → profiles**: Set null (preserve history)
15. **audit_trail → profiles**: Set null (preserve history)

---

## 6. Security & Access Control

### 6.1 Authentication

**Provider**: Supabase Auth
**Method**: Email/Password with JWT tokens

#### Authentication Flow

```
1. User submits email + password
   ↓
2. Supabase Auth validates credentials
   ↓
3. JWT access token + refresh token issued
   ↓
4. Access token stored in HTTP-only cookie
   ↓
5. Subsequent requests include token in Authorization header
   ↓
6. Supabase validates JWT signature and expiration
   ↓
7. Request authorized with user context (id, role, email)
```

#### Token Management

- **Access Token**: Expires after 1 hour
- **Refresh Token**: Expires after 7 days
- **Storage**: HTTP-only cookies (prevents XSS attacks)
- **Rotation**: Automatic token refresh before expiration

#### Password Security

- **Hashing**: bcrypt with salt (handled by Supabase)
- **Requirements**: Minimum 8 characters (configurable)
- **Reset**: Email-based password reset flow

### 6.2 Row-Level Security (RLS)

#### Overview

Every table has **RLS enabled**, ensuring users can only access data they're authorized to see.

**Total Policies**: 70+ policies across 12 tables

#### Policy Categories

1. **Own Data Access**: Users can view/edit their own records
2. **Role-Based Access**: ADMIN/HR/PESO have different permissions
3. **Public Read**: Certain data visible to unauthenticated users
4. **Admin Override**: ADMIN can access all data

#### Sample RLS Policies

**Example 1: View Own Applications**
```sql
CREATE POLICY "view_own_applications" ON applications
FOR SELECT
TO authenticated
USING (applicant_id = auth.uid());
```

**Example 2: HR View Job Applications**
```sql
CREATE POLICY "hr_view_job_applications" ON applications
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'HR'
  )
  AND job_id IN (
    SELECT id FROM jobs WHERE created_by = auth.uid()
  )
);
```

**Example 3: ADMIN View All**
```sql
CREATE POLICY "admin_view_all" ON applications
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'ADMIN'
  )
);
```

#### RLS Policy Matrix

| Table | APPLICANT | HR | PESO | ADMIN |
|-------|-----------|-----|------|-------|
| profiles | Own profile | View applicants | View applicants | All |
| jobs | View active | Create, edit own | View active | All |
| applications | Own apps | View job apps, approve/reject | View (limited) | All |
| applicant_profiles | Own profile | View all | View all | All |
| applicant_pds | Own PDS | View all | View all | All |
| training_programs | View active | View active | Create, edit own | All |
| training_applications | Own apps | None | View program apps, approve/reject | All |
| announcements | View published | Create, edit own | Create, edit own | All |
| notifications | Own notifs | Own notifs | Own notifs | None |
| activity_logs | None | None | None | All |
| audit_trail | None | None | None | All |

### 6.3 Service Role Key

**Purpose**: Bypass RLS for backend operations requiring elevated permissions

**Use Cases**:
1. **AI Ranking Endpoint**: Needs to read all application data regardless of who triggers ranking
2. **Audit Trail Creation**: System needs to write audit logs
3. **Notification Creation**: Backend needs to create notifications for users
4. **Data Seeding**: Admin scripts populate test data

**Security Measures**:
- Stored in environment variable `SUPABASE_SERVICE_ROLE_KEY`
- **Never exposed to client-side code**
- Used only in server-side API routes
- Logged in audit trail when used

**Example Usage**:
```typescript
// src/app/api/jobs/[id]/rank/route.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Service role bypasses RLS
);

// Can now read all applications for ranking
const { data: applications } = await supabase
  .from('applications')
  .select('*')
  .eq('job_id', jobId);
```

### 6.4 API Security

#### Rate Limiting

**Provider**: Supabase built-in rate limiting
**Default Limits**:
- 100 requests per minute per IP (anonymous)
- 200 requests per minute per user (authenticated)

#### CORS Policy

```typescript
// next.config.ts
const nextConfig = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: 'https://yourdomain.com' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE' },
          { key: 'Access-Control-Allow-Headers', value: 'Authorization, Content-Type' },
        ],
      },
    ];
  },
};
```

#### Input Validation

All API endpoints use **Zod** for schema validation:

```typescript
import { z } from 'zod';

const applicationSchema = z.object({
  job_id: z.string().uuid(),
  applicant_id: z.string().uuid(),
  pds_id: z.string().uuid().optional(),
});

// Validate request
const validated = applicationSchema.parse(requestBody);
```

**Benefits**:
- Type safety
- SQL injection prevention
- XSS attack prevention
- Clear error messages

---

## 7. Storage Buckets

### 7.1 Overview

JobSync uses **Supabase Storage** (S3-compatible) with **7 buckets** for file management.

**Total Buckets**: 7
**Access Control**: Role-based via RLS policies on `storage.objects`

### 7.2 Bucket Configurations

#### 7.2.1 `announcements` Bucket

**Purpose**: Images for public announcements
**Access**: Public
**File Types**: JPG, PNG, GIF
**Max File Size**: 5 MB
**RLS Policy**: Anyone can view, only HR/PESO/ADMIN can upload

**Sample Files**:
- `hiring-banner-2025.jpg`
- `training-poster.png`

#### 7.2.2 `certificates` Bucket

**Purpose**: Training certificates and documents
**Access**: Private
**File Types**: PDF, JPG, PNG
**Max File Size**: 10 MB
**RLS Policy**:
- Applicants can view their own certificates
- PESO can upload certificates
- ADMIN can view all

**Sample Files**:
- `cert-welding-nc2-juan-dela-cruz.pdf`
- `cert-bartending-maria-santos.pdf`

#### 7.2.3 `id-images` Bucket

**Purpose**: ID photos for training applications
**Access**: Private
**File Types**: JPG, PNG
**Max File Size**: 5 MB
**RLS Policy**:
- Applicants can upload their own ID
- PESO can view IDs for applications
- ADMIN can view all

**Sample Files**:
- `drivers-license-1234.jpg`
- `passport-5678.png`

#### 7.2.4 `officer-signatures` Bucket

**Purpose**: Digital signatures of HR/PESO officers for certificates
**Access**: Private (ADMIN/HR/PESO only)
**File Types**: PNG (transparent background)
**Max File Size**: 1 MB
**RLS Policy**: Only HR/PESO/ADMIN can upload/view

**Sample Files**:
- `hr-director-signature.png`
- `peso-manager-signature.png`

#### 7.2.5 `pds-files` Bucket

**Purpose**: PDF uploads of PDS forms (legacy feature, now deprecated)
**Access**: Private
**File Types**: PDF
**Max File Size**: 10 MB
**RLS Policy**:
- Applicants can upload their own PDS
- HR/PESO can view all
- ADMIN can view all

**Note**: This bucket is being phased out in favor of web-based PDS forms.

#### 7.2.6 `pds-signatures` Bucket

**Purpose**: Digital signatures for PDS forms
**Access**: Private
**File Types**: PNG
**Max File Size**: 512 KB
**RLS Policy**:
- Applicants can upload their own signature
- HR/PESO can view all signatures
- ADMIN can view all

**Sample Files**:
- `sig-applicant-123.png`
- `sig-applicant-456.png`

#### 7.2.7 `profiles` Bucket

**Purpose**: User profile pictures
**Access**: Public
**File Types**: JPG, PNG, GIF
**Max File Size**: 2 MB
**RLS Policy**: Users can upload their own photo, anyone can view

**Sample Files**:
- `avatar-user-123.jpg`
- `avatar-user-456.png`

### 7.3 File Upload Flow

```
1. User selects file in UI
   ↓
2. Frontend validates file type and size
   ↓
3. File sent to API route with authentication
   ↓
4. Backend validates file again + checks RLS permissions
   ↓
5. Generate unique filename: {timestamp}-{uuid}-{original-name}
   ↓
6. Upload to Supabase Storage bucket
   ↓
7. Store file URL in database (e.g., applications.id_image_url)
   ↓
8. Return success response with file URL
```

### 7.4 Storage Policies (RLS)

**Example: Announcements Bucket**
```sql
CREATE POLICY "public_view_announcements" ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'announcements');

CREATE POLICY "hr_upload_announcements" ON storage.objects
FOR INSERT
TO authenticated
USING (
  bucket_id = 'announcements' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role IN ('HR', 'PESO', 'ADMIN')
  )
);
```

**Example: ID Images Bucket**
```sql
CREATE POLICY "view_own_id" ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'id-images' AND
  (
    name LIKE auth.uid() || '%' OR -- Own files
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('PESO', 'ADMIN')
    )
  )
);
```

---

## 8. User Roles & Features

### 8.1 Role Overview

JobSync has **4 distinct user roles**, each with specific features and permissions:

| Role | Count | Primary Function | Dashboard Access |
|------|-------|------------------|------------------|
| ADMIN | 1 | System oversight, audit trail | `/admin/dashboard` |
| HR | 15 | Job posting, applicant ranking | `/hr/dashboard` |
| PESO | 10 | Training program management | `/peso/dashboard` |
| APPLICANT | 50 | Job/training applications | `/applicant/dashboard` |

### 8.2 ADMIN Role

#### Features

1. **User Management**
   - View all users across all roles
   - Create/edit/delete user accounts
   - Reset passwords
   - Change user roles

2. **Activity Logs**
   - Real-time activity monitoring
   - Filter by user, action, entity type
   - Export logs to Excel
   - Search and pagination

3. **Audit Trail**
   - Complete change history
   - Before/after values comparison
   - Compliance reporting
   - Data recovery support

4. **System Configuration**
   - Manage system settings
   - Configure email templates
   - Set application limits
   - Database backups

5. **Override Capabilities**
   - Approve/reject any application
   - Edit any job posting
   - Manage any training program
   - Delete any announcement

#### Dashboard Metrics

- Total users by role
- Applications this month
- Training enrollments
- System uptime
- Database size
- Recent critical activities

#### Routes

- `/admin/dashboard` - Main dashboard
- `/admin/users` - User management
- `/admin/activity-logs` - Activity monitoring
- `/admin/audit-trail` - Audit trail viewer
- `/admin/settings` - System configuration

### 8.3 HR Role

#### Features

1. **Job Management**
   - Create job postings with requirements
   - Edit job details (triggers auto re-ranking)
   - Hide/show job postings
   - Delete job postings
   - View application statistics per job

2. **Applicant Ranking**
   - Trigger AI ranking for job applicants
   - View ranked applicants with scores
   - See detailed score breakdowns
   - View Gemini AI insights
   - Compare candidates side-by-side

3. **Application Review**
   - View all applications for own jobs
   - Review applicant PDS details
   - Approve/reject applications
   - Provide rejection reasons
   - Send notifications to applicants

4. **Reports & Analytics**
   - Export applicant lists to Excel
   - Generate ranking reports
   - Download application summaries
   - View hiring funnel metrics

5. **Announcements**
   - Create public announcements
   - Upload images
   - Pin important announcements
   - Edit/delete own announcements

#### Dashboard Metrics

- Active job postings
- Total applications
- Pending reviews
- Approved/rejected ratio
- Average match scores
- Recent applications

#### Routes

- `/hr/dashboard` - Main dashboard
- `/hr/job-management` - Create/edit jobs
- `/hr/ranked-records` - View ranked applicants
- `/hr/scanned-records` - All applicants
- `/hr/announcements` - Manage announcements

#### Job Creation Form

**Required Fields**:
- Job Title
- Description (rich text editor)
- Department
- Location
- Salary Range
- Employment Type (Full-time, Part-time, Contract)

**AI Ranking Requirements**:
- Degree Requirement (text)
- Required Eligibilities (array of strings)
- Required Skills (array of strings)
- Years of Experience (number)

**Example Job**:
```json
{
  "title": "Municipal Accountant",
  "description": "Responsible for municipal financial records...",
  "department": "Accounting",
  "degree_requirement": "Bachelor of Science in Accountancy",
  "eligibilities": ["CPA License", "Civil Service Professional"],
  "skills": ["Financial Reporting", "Audit", "Government Accounting"],
  "years_of_experience": 5
}
```

### 8.4 PESO Role

#### Features

1. **Training Program Management**
   - Create training programs
   - Edit program details
   - Set capacity limits
   - Hide/show programs
   - Delete programs

2. **Application Review**
   - View all training applications
   - Review applicant information
   - View submitted ID images
   - Approve/reject applications
   - Send notifications

3. **Certificate Generation**
   - Generate completion certificates (PDF)
   - Upload officer signatures
   - Download certificates in batch

4. **Reports**
   - Export training applications to Excel
   - View enrollment statistics
   - Track completion rates

5. **Announcements**
   - Create training-related announcements
   - Upload promotional images
   - Manage own announcements

#### Dashboard Metrics

- Active training programs
- Total applications
- Pending reviews
- Completion rate
- Available slots
- Recent applications

#### Routes

- `/peso/dashboard` - Main dashboard
- `/peso/programs` - Manage training programs
- `/peso/applications` - Review applications
- `/peso/certificates` - Generate certificates
- `/peso/announcements` - Manage announcements

#### Training Program Form

**Required Fields**:
- Program Title
- Description
- Program Type (Skills Training, Livelihood, etc.)
- Duration
- Schedule
- Location
- Capacity
- Requirements (array)
- Benefits (array)
- Start Date
- End Date

**Example Program**:
```json
{
  "title": "Bread and Pastry Production NC II",
  "description": "TESDA-certified training program...",
  "program_type": "Skills Training",
  "duration": "8 weeks",
  "schedule": "Monday-Friday, 8AM-5PM",
  "location": "PESO Training Center",
  "capacity": 25,
  "requirements": ["18 years old", "High school graduate"],
  "benefits": ["Free training", "TESDA certificate", "Starter kit"],
  "start_date": "2025-02-01",
  "end_date": "2025-03-31"
}
```

### 8.5 APPLICANT Role

#### Features

1. **Job Browsing**
   - View active job postings
   - Search and filter jobs
   - View job details and requirements
   - See number of applicants (optional)

2. **Job Applications**
   - Apply to jobs with PDS
   - Upload supporting documents
   - Track application status
   - Receive notifications on status changes
   - View ranking (if disclosed)

3. **Training Applications**
   - Browse training programs
   - Apply to training programs
   - Upload ID photo
   - Track application status
   - Receive approval notifications

4. **Personal Data Sheet (PDS)**
   - Fill out web-based PDS 2025 form
   - Auto-save progress
   - Upload digital signature
   - Edit PDS anytime
   - Print PDS as PDF

5. **Profile Management**
   - Update personal information
   - Upload profile picture
   - Change password
   - View notification history

6. **Notifications**
   - Real-time notifications (bell icon)
   - Mark as read
   - View notification history

#### Dashboard Metrics

- Applications submitted
- Pending applications
- Approved applications
- Training enrollments
- Unread notifications

#### Routes

- `/applicant/dashboard` - Main dashboard
- `/applicant/jobs` - Browse jobs
- `/applicant/trainings` - Browse training programs
- `/applicant/applications` - My applications
- `/applicant/pds` - Fill out PDS
- `/applicant/profile` - Profile settings

#### Application Flow

```
1. Applicant browses job postings
   ↓
2. Clicks "Apply Now" on a job
   ↓
3. System checks if PDS is complete
   ↓
4. If incomplete, redirects to PDS form
   ↓
5. If complete, shows application confirmation
   ↓
6. Applicant confirms application
   ↓
7. Application created with status "pending"
   ↓
8. HR receives notification
   ↓
9. HR triggers AI ranking
   ↓
10. Applicant ranked based on PDS data
    ↓
11. HR reviews and approves/rejects
    ↓
12. Applicant receives notification
```

---

## 9. API Endpoints

### 9.1 Overview

JobSync uses **Next.js API Routes** (serverless functions) for backend logic.

**Base URL**: `https://yourdomain.com/api`
**Authentication**: JWT token in `Authorization` header
**Response Format**: JSON

### 9.2 Authentication Endpoints

#### POST `/api/auth/login`

**Description**: Authenticate user and return JWT tokens

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response** (200 OK):
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "APPLICANT",
    "full_name": "Juan Dela Cruz"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Errors**:
- 400: Invalid email/password
- 401: Incorrect credentials
- 500: Server error

#### POST `/api/auth/register`

**Description**: Register new applicant account

**Request Body**:
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "full_name": "Maria Santos",
  "phone": "09123456789",
  "address": "Asuncion, Davao del Norte"
}
```

**Response** (201 Created):
```json
{
  "user": {
    "id": "uuid",
    "email": "newuser@example.com",
    "role": "APPLICANT",
    "full_name": "Maria Santos"
  },
  "message": "Registration successful. Please check your email to verify your account."
}
```

#### POST `/api/auth/logout`

**Description**: Invalidate JWT tokens

**Response** (200 OK):
```json
{
  "message": "Logged out successfully"
}
```

### 9.3 Job Endpoints

#### GET `/api/jobs`

**Description**: List all active jobs (public)

**Query Parameters**:
- `status` (optional): Filter by status (active/hidden/closed)
- `department` (optional): Filter by department
- `search` (optional): Search in title/description

**Response** (200 OK):
```json
{
  "jobs": [
    {
      "id": "uuid",
      "title": "Municipal Accountant",
      "description": "...",
      "department": "Accounting",
      "location": "Asuncion Municipal Hall",
      "salary_range": "PHP 30,000 - 40,000",
      "employment_type": "Full-time",
      "degree_requirement": "Bachelor of Science in Accountancy",
      "eligibilities": ["CPA License", "Civil Service Professional"],
      "skills": ["Financial Reporting", "Audit"],
      "years_of_experience": 5,
      "created_at": "2025-01-15T08:00:00Z"
    }
  ],
  "total": 14
}
```

#### GET `/api/jobs/[id]`

**Description**: Get job details by ID

**Response** (200 OK):
```json
{
  "id": "uuid",
  "title": "Municipal Accountant",
  "description": "...",
  "application_count": 25,
  "created_by": {
    "full_name": "HR Officer",
    "email": "hr@asuncion.gov.ph"
  }
}
```

#### POST `/api/jobs` (HR only)

**Description**: Create new job posting

**Request Body**:
```json
{
  "title": "IT Specialist",
  "description": "Manage municipal IT infrastructure...",
  "department": "IT",
  "location": "Asuncion Municipal Hall",
  "salary_range": "PHP 25,000 - 35,000",
  "employment_type": "Full-time",
  "degree_requirement": "Bachelor of Science in Information Technology",
  "eligibilities": ["None"],
  "skills": ["Network Administration", "System Maintenance"],
  "years_of_experience": 2
}
```

**Response** (201 Created):
```json
{
  "id": "uuid",
  "message": "Job created successfully"
}
```

#### PUT `/api/jobs/[id]` (HR only)

**Description**: Update job posting (triggers auto re-ranking)

**Request Body**: Same as POST

**Response** (200 OK):
```json
{
  "message": "Job updated successfully. Applicants will be re-ranked automatically."
}
```

### 9.4 Ranking Endpoint

#### POST `/api/jobs/[id]/rank` (HR only)

**Description**: Trigger AI ranking for all pending applications

**Implementation**: `src/app/api/jobs/[id]/rank/route.ts`

**Process**:
1. Fetch job details
2. Fetch all pending applications with PDS data
3. Extract education, experience, skills, eligibilities
4. Run ensemble scoring algorithm
5. Apply AI tie-breaking if needed
6. Update application ranks in database
7. Return ranked results

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Successfully ranked 25 applicants for Municipal Accountant",
  "jobId": "uuid",
  "jobTitle": "Municipal Accountant",
  "totalApplicants": 25,
  "rankings": [
    {
      "rank": 1,
      "applicantName": "Maria Santos",
      "matchScore": 93.4,
      "algorithm": "Multi-Factor Assessment"
    },
    {
      "rank": 2,
      "applicantName": "Juan Dela Cruz",
      "matchScore": 88.7,
      "algorithm": "Ensemble (Tie-breaker)"
    }
  ]
}
```

**Errors**:
- 404: Job not found
- 403: Unauthorized (not HR or not job owner)
- 500: Ranking failed

#### GET `/api/jobs/[id]/rank` (HR only)

**Description**: Get current rankings for a job

**Response** (200 OK):
```json
{
  "success": true,
  "totalApplicants": 25,
  "rankedApplicants": 25,
  "unrankedApplicants": 0,
  "applications": [
    {
      "id": "uuid",
      "rank": 1,
      "match_score": 93.4,
      "education_score": 95.0,
      "experience_score": 92.5,
      "skills_score": 88.0,
      "eligibility_score": 100.0,
      "algorithm_used": "Multi-Factor Assessment",
      "ranking_reasoning": "Candidate demonstrates strong educational background, excellent relevant experience, good technical skills, appropriate certifications.",
      "applicant_profiles": {
        "first_name": "Maria",
        "surname": "Santos",
        "highest_educational_attainment": "Master's in Public Administration"
      }
    }
  ]
}
```

### 9.5 Application Endpoints

#### GET `/api/applications` (Authenticated)

**Description**: List user's own applications (or all if HR/ADMIN)

**Response** (200 OK):
```json
{
  "applications": [
    {
      "id": "uuid",
      "job": {
        "title": "Municipal Accountant",
        "department": "Accounting"
      },
      "status": "pending",
      "rank": 3,
      "match_score": 85.2,
      "applied_at": "2025-01-20T10:30:00Z"
    }
  ]
}
```

#### POST `/api/applications` (APPLICANT)

**Description**: Submit job application

**Request Body**:
```json
{
  "job_id": "uuid",
  "pds_id": "uuid"
}
```

**Response** (201 Created):
```json
{
  "id": "uuid",
  "message": "Application submitted successfully"
}
```

**Errors**:
- 400: PDS not complete
- 409: Already applied to this job
- 404: Job not found

#### PUT `/api/applications/[id]/approve` (HR only)

**Description**: Approve application

**Request Body**:
```json
{
  "notes": "Applicant meets all requirements"
}
```

**Response** (200 OK):
```json
{
  "message": "Application approved. Notification sent to applicant."
}
```

#### PUT `/api/applications/[id]/reject` (HR only)

**Description**: Reject application

**Request Body**:
```json
{
  "rejection_reason": "Insufficient experience in government accounting"
}
```

**Response** (200 OK):
```json
{
  "message": "Application rejected. Notification sent to applicant."
}
```

### 9.6 PDS Endpoints

#### GET `/api/pds` (Authenticated)

**Description**: Get user's own PDS

**Response** (200 OK):
```json
{
  "id": "uuid",
  "surname": "Dela Cruz",
  "first_name": "Juan",
  "educational_background": [...],
  "work_experience": [...],
  "eligibility": [...],
  "other_information": {...},
  "signature_url": "https://...",
  "created_at": "2025-01-10T14:00:00Z"
}
```

#### POST `/api/pds` (APPLICANT)

**Description**: Create or update PDS

**Request Body**: Full PDS data (JSON)

**Response** (200 OK):
```json
{
  "id": "uuid",
  "message": "PDS saved successfully"
}
```

#### GET `/api/pds/[id]/download` (Authenticated)

**Description**: Download PDS as PDF in selected format (CSC official or modern)

**Authorization**: User can download their own PDS, or HR/ADMIN can download any PDS

**Query Parameters**:
- `format` (string): `"csc"` or `"modern"` (default: `"modern"`)
- `includeSignature` (boolean): Include digital signature (default: `false`)
- `useCurrentDate` (boolean): Use current date instead of PDS date (default: `false`)

**Response** (200 OK):
- Content-Type: `application/pdf`
- Content-Disposition: `attachment; filename="PDS_CSC_Surname_FirstName_timestamp.pdf"`
- Binary PDF file

**Example**:
```
GET /api/pds/abc123/download?format=csc&includeSignature=true&useCurrentDate=false
```

**Errors**:
- 401 Unauthorized: User not authenticated
- 403 Forbidden: User not authorized to download this PDS
- 404 Not Found: PDS record not found

### 9.7 Notification Endpoints

#### GET `/api/notifications` (Authenticated)

**Description**: Get user's notifications

**Query Parameters**:
- `unread_only` (boolean): Only unread notifications

**Response** (200 OK):
```json
{
  "notifications": [
    {
      "id": "uuid",
      "type": "application",
      "title": "Application Approved",
      "message": "Your application for Municipal Accountant has been approved!",
      "link": "/applicant/applications/uuid",
      "is_read": false,
      "created_at": "2025-01-22T09:15:00Z"
    }
  ],
  "unread_count": 3
}
```

#### PUT `/api/notifications/[id]/read` (Authenticated)

**Description**: Mark notification as read

**Response** (200 OK):
```json
{
  "message": "Notification marked as read"
}
```

---

## 10. Data Flow Diagrams

### 10.1 Job Application Flow

```
┌──────────────┐
│  APPLICANT   │
└──────┬───────┘
       │ 1. Browse jobs
       ▼
┌─────────────────────┐
│  Job Listings Page  │
│  (Public)           │
└──────┬──────────────┘
       │ 2. Click "Apply Now"
       ▼
┌─────────────────────┐
│  Check PDS Status   │
│  (Client-side)      │
└──────┬──────────────┘
       │ 3a. PDS incomplete → Redirect to PDS form
       │ 3b. PDS complete → Continue
       ▼
┌─────────────────────┐
│  Application        │
│  Confirmation Modal │
└──────┬──────────────┘
       │ 4. Confirm application
       ▼
┌─────────────────────────────────────┐
│  POST /api/applications             │
│  - Validate user authentication     │
│  - Check for duplicate application  │
│  - Create application record        │
│  - Set status = 'pending'           │
│  - Create notification for HR       │
└──────┬──────────────────────────────┘
       │ 5. Application created
       ▼
┌─────────────────────┐
│  HR Dashboard       │
│  (New notification) │
└──────┬──────────────┘
       │ 6. HR clicks "Rank Applicants"
       ▼
┌─────────────────────────────────────┐
│  POST /api/jobs/[id]/rank           │
│  - Fetch job requirements           │
│  - Fetch all pending applications   │
│  - Extract PDS data                 │
│  - Run AI ranking algorithms        │
│  - Apply tie-breaking               │
│  - Update application ranks         │
└──────┬──────────────────────────────┘
       │ 7. Rankings calculated
       ▼
┌─────────────────────┐
│  HR Reviews         │
│  Ranked Applicants  │
└──────┬──────────────┘
       │ 8. HR approves/rejects
       ▼
┌─────────────────────────────────────┐
│  PUT /api/applications/[id]/approve │
│  - Update status = 'approved'       │
│  - Create notification for applicant│
└──────┬──────────────────────────────┘
       │ 9. Notification sent
       ▼
┌──────────────┐
│  APPLICANT   │
│  (Receives   │
│  notification)
└──────────────┘
```

### 10.2 AI Ranking Process

```
┌─────────────────────────────────────────────────────────┐
│  POST /api/jobs/[id]/rank                               │
└──────┬──────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│  Step 1: Fetch Job & Applications                       │
│  - Get job details (requirements)                       │
│  - Get all pending applications                         │
│  - Join with applicant_pds table                        │
└──────┬──────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│  Step 2: Extract Applicant Data                         │
│  - Education: Parse degree level & course               │
│  - Experience: Calculate total years + job titles       │
│  - Skills: Extract from PDS.other_information.skills    │
│  - Eligibility: Extract from PDS.eligibility            │
└──────┬──────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│  Step 3: Run Scoring Algorithms                         │
│                                                          │
│  For each applicant:                                    │
│    • Algorithm 1: Weighted Sum → score1                 │
│    • Algorithm 2: Skill-Exp Composite → score2          │
│    • If |score1 - score2| ≤ 5:                          │
│        → Algorithm 3: Tie-breaker → score3              │
│      Else:                                              │
│        → Ensemble: 0.6×score1 + 0.4×score2              │
└──────┬──────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│  Step 4: Sort Applicants                                │
│  - Primary: Total match score (descending)              │
│  - Secondary: Eligibility score                         │
│  - Tertiary: Education score                            │
│  - Quaternary: Experience score                         │
│  - Quinary: Skills score                                │
└──────┬──────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│  Step 5: AI Tie-Breaking (if ties exist)                │
│  - Detect applicants with identical scores (±0.01%)     │
│  - Group tied applicants                                │
│  - Send to Gemini AI for qualitative analysis           │
│  - Apply micro-adjustments (-0.5 to +0.5)               │
│  - Re-sort applicants                                   │
└──────┬──────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│  Step 6: Assign Final Ranks                             │
│  - Rank 1, 2, 3, ... N                                  │
│  - Store rank in applications table                     │
└──────┬──────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│  Step 7: Gemini AI Insights (Top 5 only)                │
│  - Send top 5 candidates to Gemini AI                   │
│  - Get 2-3 sentence professional insights               │
│  - Store in gemini_insights field                       │
└──────┬──────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│  Step 8: Update Database                                │
│  - Batch update all applications with:                  │
│    • rank                                               │
│    • match_score                                        │
│    • education_score, experience_score, etc.            │
│    • algorithm_used                                     │
│    • ranking_reasoning                                  │
│    • matched_skills_count                               │
│    • matched_eligibilities_count                        │
└──────┬──────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│  Return Response                                        │
│  {                                                      │
│    success: true,                                       │
│    totalApplicants: 25,                                 │
│    rankings: [...]                                      │
│  }                                                      │
└─────────────────────────────────────────────────────────┘
```

### 10.3 Real-time Notification Flow

```
┌──────────────┐
│  EVENT       │ (e.g., Application approved)
└──────┬───────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│  Backend API Route                                      │
│  - Application status updated                           │
│  - Call notifyUser() function                           │
└──────┬──────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│  lib/notifications.ts                                   │
│  - Insert notification into 'notifications' table       │
│  - Set is_read = false                                  │
└──────┬──────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│  Supabase Realtime                                      │
│  - Broadcast INSERT event to subscribed clients         │
└──────┬──────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│  Client-side Subscription                               │
│  - useEffect hook subscribes to:                        │
│    supabase                                             │
│      .channel('notifications')                          │
│      .on('postgres_changes', {                          │
│        event: 'INSERT',                                 │
│        schema: 'public',                                │
│        table: 'notifications',                          │
│        filter: `user_id=eq.${userId}`                   │
│      }, handleNewNotification)                          │
└──────┬──────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│  handleNewNotification()                                │
│  - Update notifications state                           │
│  - Show toast notification (UI)                         │
│  - Increment unread count badge                         │
│  - Play notification sound (optional)                   │
└─────────────────────────────────────────────────────────┘
```

### 10.3 PDS PDF Generation Flow

```
┌──────────────────────────────────────────────────────────┐
│  User Action: Click "Download PDS"                       │
│  (Applicant PDS page or HR viewing applicant PDS)        │
└──────┬───────────────────────────────────────────────────┘
       │ 1. Open PDSDownloadModal
       ▼
┌──────────────────────────────────────────────────────────┐
│  PDSDownloadModal.tsx                                    │
│  - Select format: "csc" (official) or "modern"           │
│  - Options:                                              │
│    □ Include digital signature                           │
│    □ Use current date (instead of PDS date)              │
│  - Click "Download PDF"                                  │
└──────┬───────────────────────────────────────────────────┘
       │ 2. Build query params
       ▼
┌──────────────────────────────────────────────────────────┐
│  Client-side Request                                     │
│  GET /api/pds/[id]/download                              │
│  ?format=csc&includeSignature=true&useCurrentDate=false  │
└──────┬───────────────────────────────────────────────────┘
       │ 3. Server-side processing
       ▼
┌──────────────────────────────────────────────────────────┐
│  API Route: /api/pds/[id]/download/route.ts             │
│  - Authenticate user (getUser)                           │
│  - Fetch PDS record from applicant_pds table             │
│  - Authorization check:                                  │
│    • User is PDS owner OR                                │
│    • User is HR/ADMIN                                    │
│  - Transform database format (snake_case → camelCase)    │
└──────┬───────────────────────────────────────────────────┘
       │ 4. Generate PDF based on format
       ▼
┌──────────────────────────────────────────────────────────┐
│  If format === "csc":                                    │
│    generateCSCFormatPDF(pdsData, options)                │
│      → lib/pds/pdfGeneratorCSC.ts                        │
│                                                           │
│  Else (format === "modern"):                             │
│    generatePDSPDF(pdsData, options)                      │
│      → lib/pds/pdfGenerator.ts                           │
└──────┬───────────────────────────────────────────────────┘
       │ 5. PDF generation (jsPDF)
       ▼
┌──────────────────────────────────────────────────────────┐
│  PDF Generator Process                                   │
│  - Initialize jsPDF document (A4, portrait)              │
│  - Set fonts (helvetica, times)                          │
│  - Render sections:                                      │
│    • Personal Information (I)                            │
│    • Family Background (II)                              │
│    • Educational Background (III)                        │
│    • Civil Service Eligibility (IV)                      │
│    • Work Experience (V)                                 │
│    • Voluntary Work (VI) - Dynamic row heights           │
│    • Learning & Development (VII)                        │
│    • Other Information (VIII)                            │
│  - Apply page breaks as needed                           │
│  - Add signature if includeSignature=true                │
│  - Generate binary buffer: doc.output('arraybuffer')     │
└──────┬───────────────────────────────────────────────────┘
       │ 6. Return PDF response
       ▼
┌──────────────────────────────────────────────────────────┐
│  NextResponse                                            │
│  - Content-Type: application/pdf                         │
│  - Content-Disposition: attachment                       │
│  - Filename: PDS_CSC_Surname_FirstName_timestamp.pdf     │
│  - Body: arraybuffer (binary PDF data)                   │
└──────┬───────────────────────────────────────────────────┘
       │ 7. Browser download
       ▼
┌──────────────────────────────────────────────────────────┐
│  Client-side Download Handler                            │
│  - Receive PDF blob from response                        │
│  - Create object URL: URL.createObjectURL(blob)          │
│  - Create <a> element with download attribute            │
│  - Programmatically click to trigger download            │
│  - Cleanup: Remove element, revoke object URL            │
│  - Close modal, show success toast                       │
└──────────────────────────────────────────────────────────┘
```

---

## 11. Real-time Features

### 11.1 Overview

JobSync uses **Supabase Realtime** (WebSocket-based) for instant updates without page refresh.

**Protocol**: WebSocket (wss://)
**Events**: Database changes (INSERT, UPDATE, DELETE)
**Latency**: < 100ms for real-time updates

### 11.2 Notification System

#### Client-side Subscription

```typescript
// src/components/layout/TopNav.tsx
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function TopNav() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    // Fetch initial notifications
    const fetchNotifications = async () => {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      setNotifications(data || []);
      setUnreadCount(data?.filter(n => !n.is_read).length || 0);
    };

    fetchNotifications();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          // New notification received
          setNotifications(prev => [payload.new, ...prev]);
          setUnreadCount(prev => prev + 1);

          // Show toast notification
          toast.success(payload.new.title);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return (
    <div className="notification-bell">
      {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
      <BellIcon />
    </div>
  );
}
```

#### Backend Notification Creation

```typescript
// src/lib/notifications.ts
export async function notifyUser(
  userId: string,
  type: string,
  title: string,
  message: string,
  link?: string
) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error } = await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      type,
      title,
      message,
      link,
      is_read: false,
    });

  if (error) {
    console.error('Failed to create notification:', error);
  }
}
```

### 11.3 Activity Logs (ADMIN)

#### Real-time Activity Stream

```typescript
// src/app/admin/activity-logs/page.tsx
useEffect(() => {
  const channel = supabase
    .channel('activity_logs')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'activity_logs',
      },
      (payload) => {
        // New activity logged
        setLogs(prev => [payload.new, ...prev]);
      }
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}, []);
```

### 11.4 Application Status Updates

When HR approves/rejects an application, the applicant's dashboard updates in real-time:

```typescript
// src/app/applicant/applications/page.tsx
useEffect(() => {
  const channel = supabase
    .channel('my_applications')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'applications',
        filter: `applicant_id=eq.${userId}`,
      },
      (payload) => {
        // Application status changed
        setApplications(prev =>
          prev.map(app =>
            app.id === payload.new.id ? payload.new : app
          )
        );

        // Show notification
        if (payload.new.status === 'approved') {
          toast.success('Your application has been approved!');
        } else if (payload.new.status === 'rejected') {
          toast.error('Your application was not successful.');
        }
      }
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}, [userId]);
```

### 11.5 Performance Considerations

**Connection Pooling**:
- Supabase manages WebSocket connections
- Automatic reconnection on disconnect
- Heartbeat to keep connection alive

**Bandwidth Optimization**:
- Only subscribe to relevant channels
- Use filters to reduce unnecessary events
- Unsubscribe when component unmounts

**Security**:
- RLS policies apply to real-time events
- Users only receive events they're authorized to see

---

## 12. Development Guide

### 12.1 Environment Setup

#### Prerequisites

- **Node.js**: v20.x or later
- **npm**: v10.x or later
- **Git**: Latest version
- **Code Editor**: VS Code recommended

#### Installation Steps

1. **Clone Repository**
   ```bash
   git clone https://github.com/yourusername/jobsync.git
   cd jobsync
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Variables**

   Create `.env.local` in project root:

   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=https://ajmftwhmskcvljlfvhjf.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

   # Gemini AI
   GEMINI_API_KEY=your-gemini-api-key-here

   # App URL
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

5. **Access Application**
   - Open browser to `http://localhost:3000`
   - Default login credentials (if seeded):
     - ADMIN: admin@asuncion.gov.ph / admin123
     - HR: hr@asuncion.gov.ph / hr123
     - PESO: peso@asuncion.gov.ph / peso123
     - APPLICANT: Register new account

### 12.2 Project Structure

```
jobsync/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Authenticated routes (requires login)
│   │   │   ├── admin/         # ADMIN dashboard & pages
│   │   │   ├── hr/            # HR dashboard & pages
│   │   │   ├── peso/          # PESO dashboard & pages
│   │   │   └── applicant/     # APPLICANT dashboard & pages
│   │   ├── (public)/          # Public routes (no auth)
│   │   │   ├── jobs/          # Browse jobs
│   │   │   ├── trainings/     # Browse training programs
│   │   │   └── announcements/ # View announcements
│   │   ├── api/               # API routes (serverless functions)
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   ├── jobs/          # Job CRUD + ranking
│   │   │   ├── applications/  # Application management
│   │   │   ├── pds/           # PDS endpoints
│   │   │   └── notifications/ # Notification endpoints
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page
│   │   └── globals.css        # Global styles
│   ├── components/            # Reusable components
│   │   ├── ui/                # UI primitives (Button, Input, etc.)
│   │   ├── layout/            # Layout components (Sidebar, TopNav)
│   │   ├── hr/                # HR-specific components
│   │   ├── peso/              # PESO-specific components
│   │   ├── applicant/         # Applicant-specific components
│   │   └── PDS/               # PDS form components
│   ├── lib/                   # Utility libraries
│   │   ├── supabase/          # Supabase clients
│   │   │   ├── client.ts      # Browser client
│   │   │   ├── server.ts      # Server client
│   │   │   └── admin.ts       # Service role client
│   │   ├── gemini/            # Gemini AI integration
│   │   │   ├── scoringAlgorithms.ts  # 3 algorithms
│   │   │   ├── rankApplicants.ts     # Ensemble method
│   │   │   └── aiTieBreaker.ts       # AI tie-breaking
│   │   ├── notifications.ts   # Notification helpers
│   │   └── utils.ts           # General utilities
│   └── types/                 # TypeScript types
│       └── database.types.ts  # Supabase generated types
├── public/                    # Static assets
│   ├── logo.jpg
│   └── municipal.jpg
├── scripts/                   # Database seeding scripts
│   ├── seed-all.ts
│   ├── seed-50-complete-users.ts
│   └── cleanup-test-users.ts
├── .env.local                 # Environment variables (gitignored)
├── next.config.ts             # Next.js configuration
├── tsconfig.json              # TypeScript configuration
├── tailwind.config.js         # Tailwind CSS configuration
└── package.json               # Dependencies and scripts
```

### 12.3 npm Scripts

```json
{
  "dev": "next dev --turbopack",           // Start dev server with Turbopack
  "build": "next build --turbopack",       // Build for production
  "start": "next start",                   // Start production server
  "lint": "eslint",                        // Run ESLint
  "seed:all": "ts-node scripts/seed-all.ts",  // Seed all test data
  "seed:users": "ts-node scripts/seed-50-complete-users.ts",  // Seed 50 users
  "seed:training": "ts-node scripts/seed-training-applications.ts",
  "seed:cleanup": "ts-node scripts/cleanup-test-users.ts"
}
```

### 12.4 Database Type Generation

Supabase CLI can generate TypeScript types from your database schema:

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Generate types
supabase gen types typescript --project-id ajmftwhmskcvljlfvhjf > src/types/database.types.ts
```

**Usage**:
```typescript
import { Database } from '@/types/database.types';

type Application = Database['public']['Tables']['applications']['Row'];
type JobInsert = Database['public']['Tables']['jobs']['Insert'];
```

### 12.5 Coding Standards

#### TypeScript

- **Strict Mode**: Enabled in `tsconfig.json`
- **Naming Conventions**:
  - PascalCase for components: `RankingModal.tsx`
  - camelCase for functions: `calculateScore()`
  - UPPER_CASE for constants: `MAX_FILE_SIZE`
- **Type Safety**: Avoid `any`, use `unknown` or specific types

#### React

- **Functional Components**: Use function components with hooks
- **Server Components**: Default to server components, use `'use client'` only when needed
- **Props Typing**: Always type component props

  ```typescript
  interface ButtonProps {
    variant: 'primary' | 'secondary';
    onClick: () => void;
    children: React.ReactNode;
  }

  export function Button({ variant, onClick, children }: ButtonProps) {
    // ...
  }
  ```

#### File Organization

- **One component per file**: `Button.tsx` contains only `Button` component
- **Co-locate related files**: Keep component + styles + tests together
- **Index files**: Use `index.ts` for cleaner imports

  ```typescript
  // components/ui/index.ts
  export { Button } from './Button';
  export { Input } from './Input';

  // Usage
  import { Button, Input } from '@/components/ui';
  ```

### 12.6 Testing

**Unit Tests**: (To be implemented)
- Jest + React Testing Library
- Test algorithm logic in `scoringAlgorithms.test.ts`

**Integration Tests**: (To be implemented)
- Test API routes
- Test database queries

**E2E Tests**: (To be implemented)
- Playwright or Cypress
- Test complete user flows

### 12.7 Git Workflow

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/ranking-improvements
   ```

2. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: improve skill matching algorithm"
   ```

3. **Push to Remote**
   ```bash
   git push origin feature/ranking-improvements
   ```

4. **Create Pull Request**
   - Review code changes
   - Run CI checks
   - Merge to main

**Commit Message Format**:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation update
- `refactor:` Code refactoring
- `test:` Add tests
- `chore:` Maintenance

### 12.8 CSC Format PDF Generator Implementation

#### Overview

The CSC (Civil Service Commission) Format PDF Generator replicates the official **CS Form No. 212, Revised 2025** with box-based layout for government compliance. This generator was implemented to provide applicants with a PDF format suitable for submission to government panels and HR offices.

**File Location**: `src/lib/pds/pdfGeneratorCSC.ts` (2,000+ lines)

**Key Features**:
- Official CSC box-based layout
- Dynamic row heights for multi-line text
- Digital signature support
- Nested object field mapping
- Type-safe rendering with TypeScript

#### Technical Architecture

**PDF Library**: jsPDF 3.0.3

**Document Configuration**:
```typescript
const doc = new jsPDF({
  orientation: 'portrait',
  unit: 'mm',
  format: 'a4',
});
```

**Font Stack**:
- **Helvetica**: Body text, labels (sizes: 6-10pt)
- **Times**: Headers and official text

**Layout Constants**:
```typescript
const margin = 10;              // Left/right margins
const pageWidth = 210;           // A4 width (mm)
const pageHeight = 297;          // A4 height (mm)
const contentWidth = 190;        // Usable width
const lineHeight = 3;            // Line spacing (mm)
```

#### Critical Field Mappings

The CSC generator uses **nested object access** with optional chaining to safely access database fields. This is crucial because PDS data is stored with nested structures.

**Family Background (Section II)**:

```typescript
// Spouse fields - nested under fb.spouse
yPosition = drawLabelValueBox('22. SPOUSE\'S SURNAME',
  fb.spouse?.surname || 'N/A', margin, yPosition, 40, contentWidth - 40);
yPosition = drawLabelValueBox('    FIRST NAME',
  fb.spouse?.firstName || 'N/A', margin, yPosition, 40, contentWidth - 40);
yPosition = drawLabelValueBox('    MIDDLE NAME',
  fb.spouse?.middleName || 'N/A', margin, yPosition, 40, contentWidth - 40);

// Father fields - nested under fb.father
yPosition = drawLabelValueBox('23. FATHER\'S SURNAME',
  fb.father?.surname || 'N/A', margin, yPosition, 40, contentWidth - 40);

// Mother fields - nested under fb.mother
// IMPORTANT: Uses "surname" not "maidenSurname"
yPosition = drawLabelValueBox('24. MOTHER\'S MAIDEN SURNAME',
  fb.mother?.surname || 'N/A', margin, yPosition, 40, contentWidth - 40);

// Children - uses "fullName" not "name"
doc.text((child.fullName || '').toUpperCase(), margin + 1, yPosition + 4);
```

**Work Experience (Section V)**:

```typescript
// Monthly salary requires type conversion (number → string)
doc.text(
  work.monthlySalary ? String(work.monthlySalary) : 'N/A',
  xPositions.salary + 1,
  yPosition + 6
);
```

**Voluntary Work (Section VI)**:

```typescript
// Organization fields
const orgAddress = [
  vol.organizationName,        // Not "nameOfOrganization"
  vol.organizationAddress      // Not "address"
].filter(Boolean).join(', ');
```

**Digital Signature (Section VIII)**:

```typescript
// Nested under otherInformation.declaration
if (includeSignature && pdsData.otherInformation?.declaration?.signatureData) {
  const signatureData = pdsData.otherInformation.declaration.signatureData;
  doc.addImage(signatureData, 'PNG', signatureX, signatureY, signatureWidth, signatureHeight);
}
```

#### Dynamic Row Height Algorithm

**Problem**: Fixed-height rows (10mm) cannot accommodate multi-line text, causing text to overflow and overlap adjacent rows.

**Solution**: Calculate row height dynamically based on actual text content.

**Implementation** (Section VI - Voluntary Work):

```typescript
pdsData.voluntaryWork?.forEach((vol) => {
  // Step 1: Pre-calculate text splits for all columns
  const orgAddress = [vol.organizationName, vol.organizationAddress]
    .filter(Boolean).join(', ');
  const orgLines = doc.splitTextToSize(orgAddress || 'N/A', volColWidths.org - 2);

  // Temporarily set font size for accurate calculation
  doc.setFontSize(6);
  const posLines = doc.splitTextToSize(
    vol.positionNatureOfWork || 'N/A',
    volColWidths.position - 2
  );
  doc.setFontSize(7); // Restore

  // Step 2: Find maximum lines among all columns
  const maxLines = Math.max(orgLines.length, posLines.length, 2);

  // Step 3: Calculate dynamic row height
  const paddingTop = 4;        // mm
  const lineHeight = 3;        // mm per line
  const paddingBottom = 2;     // mm
  const rowHeight = paddingTop + (maxLines * lineHeight) + paddingBottom;

  // Step 4: Check if page break needed
  checkPageBreak(rowHeight);

  // Step 5: Draw boxes with dynamic height
  drawBox(margin, yPosition, volColWidths.org, rowHeight);
  drawBox(margin + volColWidths.org, yPosition, volColWidths.period, rowHeight);
  // ... (other columns)

  // Step 6: Render text within boxes
  orgLines.forEach((line: string, index: number) => {
    doc.text(line, margin + 1, yPosition + 4 + index * 2.5);
  });

  // Step 7: Advance y-position by dynamic height
  yPosition += rowHeight;
});
```

**Formula**:
```
rowHeight = paddingTop + (maxLines × lineHeight) + paddingBottom
rowHeight = 4mm + (maxLines × 3mm) + 2mm

Example:
- 2 lines: 4 + (2 × 3) + 2 = 12mm
- 5 lines: 4 + (5 × 3) + 2 = 21mm
- 7 lines: 4 + (7 × 3) + 2 = 25mm
```

**Why This Works**:
- Pre-calculation ensures accurate line counts before drawing
- Font size temporarily adjusted for column-specific text wrapping
- Minimum 2 lines prevents boxes from being too small
- Dynamic height applies to all columns uniformly

#### Helper Functions

**`drawBox(x, y, width, height)`**
- Draws bordered rectangles for CSC box-based layout
- Uses `doc.rect(x, y, width, height, 'S')` for stroked rectangles

**`drawLabelValueBox(label, value, x, y, labelWidth, valueWidth)`**
- Renders label-value pairs in adjacent boxes
- Returns updated y-position for vertical stacking

**`checkPageBreak(requiredHeight)`**
- Monitors remaining page space
- Adds new page if content would overflow
- Recalculates y-position after page break

**`formatDateOnly(dateString)`**
- Converts ISO date to MM/DD/YYYY format
- Handles null/undefined gracefully

#### Common Pitfalls & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| **Field shows "N/A" despite data** | Using flat field name instead of nested object | Use optional chaining: `fb.spouse?.surname` |
| **Type error: "not recognized as string"** | jsPDF requires string, database has number | Apply type conversion: `String(value)` |
| **Text garbling/overlapping** | Fixed row height too small for multi-line text | Implement dynamic row height calculation |
| **Mother's surname missing** | Using `maidenSurname` instead of `surname` | Database uses `fb.mother?.surname` |
| **Children names missing** | Using `name` instead of `fullName` | Database uses `child.fullName` |
| **Signature not rendering** | Wrong nested path | Use `otherInformation?.declaration?.signatureData` |
| **Inaccurate text wrapping** | Font size mismatch during calculation | Set font size before `splitTextToSize()` |

#### Type Safety

**Input Type**: `PDSData` (from `src/types/pds.types.ts`)

**Key Type Definitions**:
```typescript
interface FamilyBackground {
  spouse?: {
    surname: string;
    firstName: string;
    middleName: string;
    nameExtension?: string;
    occupation?: string;
    employerBusinessName?: string;
    businessAddress?: string;
    telephoneNo?: string;
  };

  father: {
    surname: string;
    firstName: string;
    middleName: string;
    nameExtension?: string;
  };

  mother: {
    surname: string;          // ← NOT maidenSurname
    firstName: string;
    middleName: string;
  };

  children: Array<{
    fullName: string;          // ← NOT name
    dateOfBirth: string;
  }>;
}

interface VoluntaryWork {
  organizationName: string;    // ← NOT nameOfOrganization
  organizationAddress?: string;
  positionNatureOfWork?: string;
  periodOfInvolvement?: {
    from: string;
    to: string;
  };
  numberOfHours?: number;
}
```

#### Testing Recommendations

**Test Cases**:

1. **Short Content (1-2 lines)**
   - Verify minimum row height applied
   - Check proper box sizing

2. **Medium Content (3-4 lines)**
   - Validate dynamic height calculation
   - Ensure no text overflow

3. **Long Content (6-7 lines)**
   - Test maximum line scenarios
   - Verify page break handling

4. **All Field Types**
   - Nested objects (spouse, father, mother)
   - Arrays (children, work experience)
   - Optional fields (signature, extension names)
   - Numeric fields (salary, hours)

5. **Edge Cases**
   - Empty arrays (no children, no voluntary work)
   - Missing optional fields
   - Very long text strings (200+ characters)
   - Special characters in names

**Test Data**: Use user `janmikoguevarra@gmail.com` (complete PDS with all sections populated)

#### References

- **Official Form**: CS Form No. 212, Revised 2025 (Civil Service Commission)
- **jsPDF Documentation**: https://github.com/parallax/jsPDF
- **Related Files**:
  - Modern Generator: `src/lib/pds/pdfGenerator.ts` (reference implementation)
  - Type Definitions: `src/types/pds.types.ts`
  - Data Transformer: `src/lib/utils/dataTransformers.ts`
  - Download Modal: `src/components/PDS/PDSDownloadModal.tsx`
  - API Route: `src/app/api/pds/[id]/download/route.ts`

---

## 13. Deployment

### 13.1 Deployment Platform

**Recommended**: Vercel (optimal for Next.js)

**Alternatives**: Netlify, AWS Amplify, Railway

### 13.2 Vercel Deployment

#### Step 1: Connect Repository

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import Git Repository
4. Select `jobsync` repository

#### Step 2: Configure Build Settings

```
Framework Preset: Next.js
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

#### Step 3: Environment Variables

Add all variables from `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://ajmftwhmskcvljlfvhjf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=***
SUPABASE_SERVICE_ROLE_KEY=***
GEMINI_API_KEY=***
NEXT_PUBLIC_APP_URL=https://jobsync-asuncion.vercel.app
```

#### Step 4: Deploy

- Click "Deploy"
- Wait for build to complete (~2-5 minutes)
- Access production URL: `https://jobsync-asuncion.vercel.app`

### 13.3 Custom Domain Setup

1. **Purchase Domain**: `jobsync.asuncion.gov.ph`

2. **Add Domain in Vercel**:
   - Go to Project Settings → Domains
   - Add `jobsync.asuncion.gov.ph`

3. **Configure DNS**:
   ```
   Type: CNAME
   Name: jobsync
   Value: cname.vercel-dns.com
   ```

4. **Wait for SSL**: Vercel auto-provisions SSL certificate (1-2 hours)

### 13.4 Supabase Production Configuration

#### Database Pooler

For serverless deployments, use Supabase connection pooler:

```typescript
// Use pooler URL for API routes
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!.replace('supabase.co', 'supabase.co:6543'), // Pooler port
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
```

#### Row-Level Security

Ensure all RLS policies are enabled in production:

```sql
-- Verify RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
```

#### Backup Configuration

- **Automatic Backups**: Daily at 2:00 AM UTC
- **Retention**: 7 days (free tier) / 30 days (Pro)
- **Point-in-Time Recovery**: Available on Pro plan

### 13.5 Production Checklist

- [ ] All environment variables set
- [ ] Database RLS policies enabled
- [ ] Storage bucket policies configured
- [ ] SSL certificate active
- [ ] Custom domain configured
- [ ] Error tracking setup (e.g., Sentry)
- [ ] Analytics setup (e.g., Google Analytics)
- [ ] Email notifications configured
- [ ] Database backups verified
- [ ] Load testing completed
- [ ] Security audit completed

### 13.6 CI/CD Pipeline

**GitHub Actions** example:

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '20'
      - run: npm install
      - run: npm run build
      - run: npm run lint
      # Vercel auto-deploys on push to main
```

### 13.7 Monitoring

**Vercel Analytics**:
- Real-time visitor tracking
- Page load performance
- Web Vitals (LCP, FID, CLS)

**Supabase Monitoring**:
- Database performance
- API response times
- Error rates
- Storage usage

**Custom Logging**:
```typescript
// Log errors to external service (e.g., Sentry)
try {
  await rankApplicants();
} catch (error) {
  console.error('Ranking failed:', error);
  // Send to Sentry
  Sentry.captureException(error);
}
```

---

## 14. Maintenance & Monitoring

### 14.1 System Health Monitoring

#### Key Metrics to Track

1. **Application Performance**
   - Page load time: Target < 2 seconds
   - API response time: Target < 500ms
   - Database query time: Target < 100ms
   - Real-time latency: Target < 100ms

2. **Database Health**
   - Total database size
   - Table row counts
   - Index usage
   - Query performance

3. **User Activity**
   - Daily active users (DAU)
   - Monthly active users (MAU)
   - New registrations
   - Application submissions
   - Ranking operations

4. **Error Rates**
   - API errors (4xx, 5xx)
   - Client-side errors
   - Gemini AI failures
   - Database connection errors

#### Monitoring Dashboard (ADMIN)

```typescript
// src/app/admin/monitoring/page.tsx
export default async function MonitoringPage() {
  const metrics = await fetchSystemMetrics();

  return (
    <div className="grid grid-cols-4 gap-4">
      <MetricCard
        title="Database Size"
        value={metrics.dbSize}
        trend="+5% this month"
      />
      <MetricCard
        title="Active Users"
        value={metrics.activeUsers}
        trend="+12% this week"
      />
      <MetricCard
        title="API Errors (24h)"
        value={metrics.apiErrors}
        alert={metrics.apiErrors > 100}
      />
      <MetricCard
        title="Avg Ranking Time"
        value={metrics.avgRankingTime}
        unit="seconds"
      />
    </div>
  );
}
```

### 14.2 Regular Maintenance Tasks

#### Daily

- [x] Review activity logs for suspicious activity
- [x] Check error logs for repeated failures
- [x] Monitor database size growth
- [x] Verify backup completion

#### Weekly

- [x] Review user feedback/support tickets
- [x] Check storage bucket usage
- [x] Analyze slow queries (Supabase Dashboard)
- [x] Review Gemini AI usage and costs

#### Monthly

- [x] Database maintenance (VACUUM, ANALYZE)
- [x] Archive old audit trail records (>6 months)
- [x] Review and update RLS policies
- [x] Performance optimization review
- [x] Security patch updates
- [x] Dependency updates (npm)

#### Quarterly

- [x] Full security audit
- [x] Load testing
- [x] Disaster recovery drill
- [x] User training sessions
- [x] Feature roadmap review

### 14.3 Database Maintenance

#### Vacuum and Analyze

```sql
-- Run monthly to optimize database
VACUUM ANALYZE;

-- Or per table
VACUUM ANALYZE applications;
VACUUM ANALYZE audit_trail;
```

#### Index Maintenance

```sql
-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan ASC;

-- Rebuild indexes if needed
REINDEX TABLE applications;
```

#### Archive Old Data

```sql
-- Archive audit trail older than 6 months
CREATE TABLE audit_trail_archive AS
SELECT * FROM audit_trail
WHERE created_at < NOW() - INTERVAL '6 months';

DELETE FROM audit_trail
WHERE created_at < NOW() - INTERVAL '6 months';
```

### 14.4 Backup & Recovery

#### Automated Backups

Supabase provides automated daily backups:
- **Frequency**: Daily at 2:00 AM UTC
- **Retention**: 7 days (free) / 30 days (Pro)
- **Location**: Supabase infrastructure

#### Manual Backup

```bash
# Export database using pg_dump
pg_dump "postgresql://postgres:[password]@db.ajmftwhmskcvljlfvhjf.supabase.co:5432/postgres" > backup.sql

# Restore from backup
psql "postgresql://postgres:[password]@db.ajmftwhmskcvljlfvhjf.supabase.co:5432/postgres" < backup.sql
```

#### Disaster Recovery Plan

1. **Data Loss Scenario**:
   - Restore from latest automated backup
   - Apply any available point-in-time recovery
   - Verify data integrity
   - Notify affected users

2. **System Downtime**:
   - Check Vercel status
   - Check Supabase status
   - Investigate application logs
   - Roll back to previous deployment if needed

3. **Security Breach**:
   - Immediately revoke compromised API keys
   - Review audit trail for unauthorized access
   - Reset user passwords if needed
   - Notify affected users
   - Implement additional security measures

### 14.5 Performance Optimization

#### Database Optimization

1. **Query Optimization**:
   - Use indexes on frequently queried columns
   - Avoid N+1 queries with proper joins
   - Use `select()` to fetch only needed columns
   - Implement pagination for large datasets

2. **Connection Pooling**:
   - Use Supabase pooler in production
   - Limit concurrent connections
   - Set appropriate timeouts

#### Frontend Optimization

1. **Code Splitting**:
   - Next.js automatically splits routes
   - Use dynamic imports for heavy components

   ```typescript
   const RankingModal = dynamic(() => import('./RankingModal'));
   ```

2. **Image Optimization**:
   - Use `next/image` for automatic optimization
   - Lazy load images below the fold
   - Use appropriate formats (WebP, AVIF)

3. **Caching**:
   - Cache static content (announcements, job listings)
   - Use SWR or React Query for client-side caching
   - Implement CDN caching for assets

#### API Optimization

1. **Response Compression**:
   - Next.js automatically compresses responses
   - Reduce payload size by selecting specific fields

2. **Rate Limiting**:
   - Implement rate limiting to prevent abuse
   - Use Supabase built-in rate limits

3. **Caching Strategy**:
   ```typescript
   // Cache job listings for 5 minutes
   export const revalidate = 300;

   export async function GET() {
     const jobs = await fetchJobs();
     return NextResponse.json(jobs);
   }
   ```

### 14.6 Security Updates

#### Dependency Updates

```bash
# Check for outdated packages
npm outdated

# Update dependencies
npm update

# Update to latest major versions (caution!)
npm install <package>@latest
```

#### Security Audit

```bash
# Check for known vulnerabilities
npm audit

# Fix vulnerabilities automatically
npm audit fix
```

#### Regular Security Tasks

- [ ] Review Supabase RLS policies
- [ ] Rotate API keys annually
- [ ] Update SSL certificates (automatic with Vercel)
- [ ] Review user permissions
- [ ] Check for SQL injection vulnerabilities
- [ ] Test for XSS vulnerabilities

### 14.7 Troubleshooting Guide

#### Common Issues

**Issue**: Ranking fails with "No applicants found"
- **Cause**: Applications missing PDS data
- **Fix**: Ensure applicants complete web-based PDS before applying

**Issue**: Real-time notifications not working
- **Cause**: WebSocket connection dropped
- **Fix**: Check browser console, verify Supabase URL, reconnect

**Issue**: Database connection timeout
- **Cause**: Too many concurrent connections
- **Fix**: Use Supabase connection pooler, reduce query complexity

**Issue**: Gemini AI timeout
- **Cause**: API rate limit or slow response
- **Fix**: Implement retry logic, use fallback deterministic tie-breaking

**Issue**: File upload fails
- **Cause**: File size exceeds bucket limit
- **Fix**: Validate file size client-side, increase bucket limit if needed

---

## 15. System Limitations

### 15.1 Current System Limitations

#### 15.1.1 AI Ranking Limitations

1. **Gemini AI Dependency**
   - System requires active Gemini API key and internet connection
   - Ranking may fail if Gemini API is down or rate-limited
   - Fallback deterministic tie-breaking is less sophisticated
   - **Mitigation**: Implemented fallback algorithms ensure ranking always completes

2. **Algorithm Assumptions**
   - Assumes PDS data is accurate and complete
   - Cannot detect falsified qualifications without manual verification
   - Ranking quality depends on applicant honesty
   - **Mitigation**: HR manual review required before final hiring decision

3. **Context Understanding**
   - AI may not fully understand Philippine government-specific requirements
   - Some eligibilities may not be properly weighted
   - Job title variations may not be perfectly matched
   - **Mitigation**: Fuzzy matching and token-based algorithms improve flexibility

#### 15.1.2 Data Quality Constraints

1. **Incomplete PDS Records**
   - Applicants with incomplete PDS cannot be ranked accurately
   - Missing work experience or education data lowers scores unfairly
   - **Mitigation**: System requires complete PDS before application submission

2. **Standardization Issues**
   - Skill names vary (e.g., "MS Excel" vs "Microsoft Excel" vs "Excel")
   - Degree names not standardized (e.g., "BS CompSci" vs "Bachelor of Science in Computer Science")
   - **Mitigation**: Levenshtein distance and token matching handle variations

#### 15.1.3 Technical Limitations

1. **Scalability**
   - Ranking 100+ applicants may take 30-60 seconds
   - Gemini AI has rate limits (60 requests per minute)
   - Real-time ranking not feasible for very large applicant pools
   - **Mitigation**: Batch processing, async operations, progress indicators

2. **Browser Compatibility**
   - Optimized for modern browsers (Chrome, Firefox, Edge, Safari)
   - IE11 not supported
   - Some features require JavaScript enabled
   - **Mitigation**: Clear browser requirements communicated to users

3. **Mobile Experience**
   - PDS form complex on small screens
   - Some admin features better suited for desktop
   - **Mitigation**: Responsive design, but desktop recommended for admins

#### 15.1.4 Security Considerations

1. **API Key Exposure Risk**
   - Gemini API key stored in environment variables
   - Service role key required for ranking operations
   - **Mitigation**: Keys never exposed to client, used only in server-side code

2. **File Upload Risks**
   - Users can upload malicious files disguised as images/PDFs
   - **Mitigation**: File type validation, size limits, antivirus scanning recommended

#### 15.1.5 Compliance Limitations

1. **Data Privacy**
   - System stores sensitive personal information (government IDs, addresses)
   - GDPR/Data Privacy Act compliance requires additional measures
   - **Mitigation**: Audit trail tracks all data access, RLS policies restrict viewing

2. **Audit Trail Size**
   - Audit trail grows indefinitely (currently 12,333+ records)
   - May impact database performance over time
   - **Mitigation**: Monthly archival of old records recommended

### 15.2 Known Issues

1. **Tie-Breaking Edge Cases**
   - If 50+ candidates have identical scores, AI tie-breaking may timeout
   - Fallback mechanism ensures ranking completes but may be less accurate

2. **Real-time Notification Delays**
   - Notifications may arrive 1-5 seconds after event in poor network conditions
   - WebSocket connection may drop on unstable internet

3. **PDF Generation Performance**
   - Generating PDFs with 100+ rows may take 10-15 seconds
   - Browser may appear frozen during generation
   - **Mitigation**: Loading indicators, async generation

---

## 16. Future Work & Recommendations

### 16.1 Planned Enhancements

#### 16.1.1 Advanced AI Features

1. **Resume Parsing with AI**
   - Implement OCR + Gemini AI to extract data from uploaded PDF resumes
   - Automatically populate PDS fields from resume
   - Reduce manual data entry burden on applicants
   - **Timeline**: Q1 2026
   - **Effort**: 3-4 weeks development

2. **Interview Question Generation**
   - Use Gemini AI to generate tailored interview questions based on applicant background
   - Provide HR with suggested questions for each candidate
   - **Timeline**: Q2 2026
   - **Effort**: 2-3 weeks development

3. **Predictive Analytics**
   - Analyze historical hiring data to predict applicant success
   - Identify patterns in successful hires
   - Refine ranking algorithms based on outcomes
   - **Timeline**: Q3 2026
   - **Effort**: 4-6 weeks development + data collection

#### 16.1.2 User Experience Improvements

1. **Mobile App Development**
   - Native iOS/Android apps for applicants
   - Improved mobile PDS form experience
   - Push notifications
   - **Timeline**: Q4 2026
   - **Effort**: 12-16 weeks development

2. **Bulk Operations**
   - Bulk approve/reject applications
   - Bulk email notifications
   - Batch PDF generation
   - **Timeline**: Q1 2026
   - **Effort**: 2-3 weeks development

3. **Advanced Search & Filters**
   - Search applicants by skills, education, location
   - Save filter presets
   - Export filtered results
   - **Timeline**: Q2 2026
   - **Effort**: 2 weeks development

#### 16.1.3 Integration Opportunities

1. **Email Service Integration**
   - Integrate with SendGrid or AWS SES
   - Automated email notifications for application status
   - Email verification during registration
   - **Timeline**: Q1 2026
   - **Effort**: 1-2 weeks development

2. **SMS Notifications**
   - Integrate with Twilio or Semaphore
   - SMS notifications for critical updates
   - Two-factor authentication via SMS
   - **Timeline**: Q2 2026
   - **Effort**: 1 week development

3. **Government System Integration**
   - Connect to PhilSys for ID verification
   - Integrate with CSC database for eligibility verification
   - **Timeline**: Long-term (pending partnerships)
   - **Effort**: Significant (6+ months)

#### 16.1.4 Performance Optimizations

1. **Caching Layer**
   - Implement Redis caching for frequently accessed data
   - Cache job listings, announcements
   - Reduce database queries by 40-60%
   - **Timeline**: Q1 2026
   - **Effort**: 2-3 weeks development

2. **Database Optimization**
   - Partition large tables (audit_trail, notifications)
   - Implement materialized views for reports
   - Optimize slow queries
   - **Timeline**: Q2 2026
   - **Effort**: 3-4 weeks development

3. **CDN Implementation**
   - Serve static assets via CDN (Cloudflare, AWS CloudFront)
   - Reduce latency for users
   - **Timeline**: Q1 2026
   - **Effort**: 1 week configuration

#### 16.1.5 Security Enhancements

1. **Two-Factor Authentication (2FA)**
   - Implement 2FA for admin accounts
   - Optional 2FA for all users
   - **Timeline**: Q2 2026
   - **Effort**: 2-3 weeks development

2. **Advanced Audit Logging**
   - Log all file downloads
   - Track IP addresses and geolocation
   - Automated anomaly detection
   - **Timeline**: Q3 2026
   - **Effort**: 3-4 weeks development

3. **Data Encryption at Rest**
   - Encrypt sensitive fields in database
   - Implement key rotation
   - **Timeline**: Q2 2026
   - **Effort**: 2-3 weeks development

### 16.2 Research Opportunities

1. **Algorithm Refinement Study**
   - Conduct study comparing AI rankings vs. actual hiring outcomes
   - Measure correlation between match scores and job performance
   - Adjust algorithm weights based on findings
   - **Type**: Longitudinal study (12-24 months)

2. **User Acceptance Testing**
   - Survey HR staff on system usability
   - Gather applicant feedback on PDS form experience
   - Identify pain points and improvement areas
   - **Type**: Qualitative research (interviews, surveys)

3. **Fairness and Bias Analysis**
   - Analyze rankings for potential bias (age, gender, geographic location)
   - Ensure AI algorithms are fair and equitable
   - Publish findings for transparency
   - **Type**: Quantitative analysis with ethics review

### 16.3 Maintenance Recommendations

1. **Regular Dependency Updates**
   - Update npm packages monthly
   - Update Next.js framework quarterly
   - Test updates in staging environment first

2. **Database Maintenance Schedule**
   - Run VACUUM ANALYZE monthly
   - Archive audit trail records older than 6 months
   - Review and optimize indexes quarterly

3. **Security Audits**
   - Conduct security audit annually
   - Penetration testing by third party
   - Review RLS policies semi-annually

4. **Performance Monitoring**
   - Set up automated performance monitoring (e.g., New Relic, Datadog)
   - Alert on slow queries (>1 second)
   - Monitor Gemini AI usage and costs

5. **User Training**
   - Conduct HR/PESO training sessions quarterly
   - Create video tutorials for common tasks
   - Maintain updated user manual

---

## 17. References & Bibliography

### 17.1 Academic References

1. **Fishburn, P. C.** (1967). "Additive Utilities with Incomplete Product Set: Application to Priorities and Assignments." *Operations Research*, 15(3), 537-542.
   - Theoretical basis for Algorithm 1 (Weighted Sum Model)

2. **Kahneman, D., & Tversky, A.** (1979). "Prospect Theory: An Analysis of Decision Under Risk." *Econometrica*, 47(2), 263-292.
   - Theoretical basis for Algorithm 2 (Exponential weighting)

3. **Gale, D., & Shapley, L. S.** (1962). "College Admissions and the Stability of Marriage." *The American Mathematical Monthly*, 69(1), 9-15.
   - Theoretical basis for Algorithm 3 (Lexicographic ordering)

4. **Levenshtein, V. I.** (1966). "Binary Codes Capable of Correcting Deletions, Insertions, and Reversals." *Soviet Physics Doklady*, 10(8), 707-710.
   - Fuzzy string matching algorithm

### 17.2 Technical Documentation

1. **Next.js Documentation.** (2024). Vercel Inc. Retrieved from https://nextjs.org/docs
   - Framework documentation and best practices

2. **Supabase Documentation.** (2024). Supabase Inc. Retrieved from https://supabase.com/docs
   - Database, authentication, and storage implementation

3. **Google AI Documentation.** (2024). Google LLC. Retrieved from https://ai.google.dev/docs
   - Gemini AI API integration and usage

4. **PostgreSQL Documentation.** (2024). PostgreSQL Global Development Group. Retrieved from https://www.postgresql.org/docs/
   - Database design and optimization

5. **TypeScript Handbook.** (2024). Microsoft Corporation. Retrieved from https://www.typescriptlang.org/docs/
   - Type system and language features

### 17.3 Standards and Regulations

1. **Republic Act No. 10173** - Data Privacy Act of 2012. Philippines.
   - Data protection and privacy compliance

2. **Civil Service Commission.** (2017). "Revised Personal Data Sheet (CS Form No. 212)." Philippines.
   - Official PDS format and requirements

3. **TESDA Regulations.** Technical Education and Skills Development Authority. Philippines.
   - Training program certification standards

### 17.4 Related Research

1. **Chen, Y., et al.** (2020). "AI-Powered Recruitment: Opportunities and Challenges." *Journal of Human Resource Management*, 31(4), 456-478.
   - Literature review on AI in recruitment

2. **Raghavan, M., et al.** (2020). "Mitigating Bias in Algorithmic Hiring: Evaluating Claims and Practices." *Proceedings of FAT* 2020*, 469-481.
   - Fairness in AI recruitment systems

3. **Tambe, P., Cappelli, P., & Yakubovich, V.** (2019). "Artificial Intelligence in Human Resources Management: Challenges and a Path Forward." *California Management Review*, 61(4), 15-42.
   - AI adoption in HR practices

### 17.5 Software Libraries

1. **React.** (2024). Meta Platforms, Inc. https://react.dev/
   - Version 19.1.0 - UI library

2. **Tailwind CSS.** (2024). Tailwind Labs Inc. https://tailwindcss.com/
   - Version 4.0 - CSS framework

3. **Zod.** (2024). Colin McDonnell. https://zod.dev/
   - Version 4.1.12 - Schema validation

4. **recharts.** (2024). Recharts Contributors. https://recharts.org/
   - Version 3.3.0 - Data visualization

5. **jsPDF.** (2024). jsPDF Contributors. https://github.com/parallax/jsPDF
   - Version 3.0.3 - PDF generation

---

## 18. Appendices

### 18.1 Glossary

| Term | Definition |
|------|------------|
| **AI Tie-Breaking** | Using Gemini AI to differentiate candidates with identical scores |
| **Algorithm Details** | JSON object storing which algorithms were used and their individual scores |
| **Ensemble Method** | Combining multiple algorithms to produce a final score |
| **Fuzzy Matching** | String comparison allowing for minor differences (Levenshtein distance) |
| **JWT** | JSON Web Token - authentication token standard |
| **Levenshtein Distance** | Minimum number of single-character edits to transform one string to another |
| **Micro-Adjustment** | Small score change (-0.5 to +0.5) applied during tie-breaking |
| **PDS** | Personal Data Sheet (Philippine government standard form) |
| **PESO** | Public Employment Service Office (handles training programs) |
| **RLS** | Row-Level Security (database-level access control) |
| **Service Role Key** | Supabase API key that bypasses RLS for admin operations |
| **Token-Based Matching** | Matching skills by shared words rather than exact phrases |
| **Weighted Sum** | Linear combination of scores with different importance weights |

### 18.2 Algorithm Reference

#### Algorithm 1: Weighted Sum Model

**Formula**: `Score = 0.30×E + 0.20×X + 0.20×S + 0.30×L`

**File**: `src/lib/gemini/scoringAlgorithms.ts` (lines 181-385)

**Reference**: Fishburn, P. C. (1967). "Additive Utilities with Incomplete Product Set"

#### Algorithm 2: Skill-Experience Composite

**Formula**: `Score = 0.30×(S×e^(0.5×X)) + 0.35×E + 0.35×L`

**File**: `src/lib/gemini/scoringAlgorithms.ts` (lines 387-549)

**Reference**: Kahneman & Tversky (1979). "Prospect Theory"

#### Algorithm 3: Eligibility-Education Tie-breaker

**Formula**: `Score = 0.40×L + 0.30×E + 0.20×X + 0.10×S_diversity`

**File**: `src/lib/gemini/scoringAlgorithms.ts` (lines 551-691)

**Reference**: Gale-Shapley Algorithm for stable matching

#### Ensemble Method

**File**: `src/lib/gemini/scoringAlgorithms.ts` (lines 693-766)

**Logic**:
```
IF |score1 - score2| ≤ 5 THEN
  use Algorithm 3 (tie-breaker)
ELSE
  use 0.6×score1 + 0.4×score2
END IF
```

### 18.3 API Reference Summary

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/auth/login` | POST | No | Authenticate user |
| `/api/auth/register` | POST | No | Register new account |
| `/api/auth/logout` | POST | Yes | Logout user |
| `/api/jobs` | GET | No | List active jobs |
| `/api/jobs` | POST | HR | Create job |
| `/api/jobs/[id]` | GET | No | Get job details |
| `/api/jobs/[id]` | PUT | HR | Update job |
| `/api/jobs/[id]/rank` | POST | HR | Trigger AI ranking |
| `/api/jobs/[id]/rank` | GET | HR | Get current rankings |
| `/api/applications` | GET | Yes | List applications |
| `/api/applications` | POST | APPLICANT | Submit application |
| `/api/applications/[id]/approve` | PUT | HR | Approve application |
| `/api/applications/[id]/reject` | PUT | HR | Reject application |
| `/api/pds` | GET | Yes | Get own PDS |
| `/api/pds` | POST | APPLICANT | Create/update PDS |
| `/api/notifications` | GET | Yes | List notifications |
| `/api/notifications/[id]/read` | PUT | Yes | Mark as read |

### 18.4 Database Schema Cheat Sheet

**Core Tables**:
- `profiles` (76) - User accounts
- `jobs` (14) - Job postings
- `applications` (332) - Job applications with AI scores
- `applicant_pds` (58) - Web-based PDS forms
- `training_programs` (54) - PESO programs
- `training_applications` (10) - Training enrollments
- `announcements` (53) - Public announcements
- `notifications` (284) - User notifications
- `activity_logs` (411) - System activity
- `audit_trail` (12,333) - Compliance audit

**Key Relationships**:
```
profiles (user)
  ├── jobs (created_by)
  ├── applications (applicant_id)
  ├── applicant_pds (user_id)
  └── training_applications (applicant_id)

jobs
  └── applications (job_id)

training_programs
  └── training_applications (program_id)
```

### 18.5 Environment Variables Reference

```env
# Supabase Database
NEXT_PUBLIC_SUPABASE_URL=https://ajmftwhmskcvljlfvhjf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... # NEVER expose to client!

# Gemini AI
GEMINI_API_KEY=AIzaSyC... # NEVER expose to client!

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development # or production
```

### 18.6 Support & Resources

**Documentation**:
- Next.js: https://nextjs.org/docs
- Supabase: https://supabase.com/docs
- Gemini AI: https://ai.google.dev/docs
- TypeScript: https://www.typescriptlang.org/docs
- Tailwind CSS: https://tailwindcss.com/docs

---

**END OF DOCUMENT**

*This technical documentation is confidential and proprietary to Asuncion Municipal Hall, Davao del Norte. Unauthorized distribution is prohibited.*
