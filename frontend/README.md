# Monali AI Frontend

This is the Next.js frontend application for the **Monali AI Minimum Viable Product (MVP)**. It serves as the primary user interface and SaaS shell, communicating with Supabase for the database/auth and our FastAPI backend for heavy PDF extraction and document chunking.

## 🚀 Tech Stack
- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Styling:** Tailwind CSS + shadcn/ui + Framer Motion
- **Database / ORM:** Prisma ORM
- **Auth & Storage:** Supabase (Auth, Postgres, Storage)
- **AI Integration:** Vercel AI SDK + Google Gemini (`gemini-3.1-flash-lite`)
- **Backend microservice:** FastAPI (Python) for processing

## 🛠️ Local Setup

1. **Install Dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Required Environment Variables:**
   Create a `.env` file in the `frontend` root. **🚨 WARNING: NEVER commit `.env` files to Git. They are ignored by `.gitignore`.**

   ```env
   # Frontend Database connection (Prisma)
   DATABASE_URL="postgresql://user:password@aws-0-xyz.pooler.supabase.com:6543/postgres?pgbouncer=true"
   DIRECT_URL="postgresql://user:password@aws-0-xyz.pooler.supabase.com:5432/postgres"

   # Supabase Keys
   NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
   SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

   # Google Generative AI (Vercel AI SDK)
   GOOGLE_GENERATIVE_AI_API_KEY="your-gemini-key"
   GOOGLE_GENERATIVE_AI_MODEL="gemini-3.1-flash-lite"
   ```

3. **Required Backend Environment Variables:**
   The Python backend (FastAPI) requires its own `.env` file in the `backend` folder:
   ```env
   DATABASE_URL="postgresql://user:password@aws-0-xyz.pooler.supabase.com:6543/postgres"
   GEMINI_API_KEY="your-gemini-key"
   GEMINI_MODEL="gemini-3.1-flash-lite"
   ```

## 🏃‍♂️ How to Run

1. **Run the Frontend (Next.js):**
   ```bash
   cd frontend
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

2. **Run the Backend (FastAPI):**
   Open a separate terminal:
   ```bash
   cd backend
   fastapi dev app/main.py
   ```

3. **Lint & Build (Testing before commit):**
   ```bash
   cd frontend
   npm run lint
   npm run build
   ```

## 🏗️ Completed Modules (Current State)
- **Milestone 1:** Frontend UI/UX Shell & Routing
- **Milestone 2:** SaaS Backend Wiring & Auth (Supabase)
- **Milestone 3:** FastAPI Microservice Initialization
- **Milestone 4:** Data Room & Document Intelligence Processing (PDF -> FastAPI -> Gemini Verification)
- **Security:** RLS policies and Server Action ownership checks
- **Milestone 5:** Site & Stand Details Workflow
- **Milestone 6:** Brief Builder Workflow
- **Milestone 7:** Concept Generation v1 (AI-driven layout abstraction)

## 🚧 Remaining Modules
- **Milestone 8:** Cost Estimation
- **Milestone 9:** Final Report Generation
- **Later/Post-MVP:** CAD/BIM integration, detailed BOQ, spatial automation.
