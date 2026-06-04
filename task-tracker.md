# Monali AI - MVP Task Tracker

This document tracks the high-level milestones for the Monali AI Minimum Viable Product (MVP).

## 🟢 Milestone 1: Frontend UI/UX Shell (Completed)
**Goal:** Establish the premium visual identity and routing structure for the SaaS application.
**What we implemented:**
- Initialized Next.js App Router with Tailwind CSS, TypeScript, and shadcn/ui components.
- Designed high-end, premium aesthetic Login and Signup screens.
- Built the main Dashboard with a portfolio overview and metrics.
- Built the Project Workspace shell (`/projects/[id]`) with navigation sidebar.

## 🟢 Milestone 2: SaaS Backend Wiring (Completed)
**Goal:** Connect the frontend shell to a real database and authentication system.
**What we implemented:**
- Set up **Supabase Auth** (Next.js Server Actions, Cookie Management, Callback Routes).
- Configured **Prisma ORM** with Supabase PostgreSQL.
- Auto-provisioned a "My Workspace" Organization for new users upon signup.

## 🟢 Milestone 3: FastAPI AI Microservice (Completed)
**Goal:** Initialize the dedicated Python backend for heavy AI processing.
**What we implemented:**
- Create the Python virtual environment and FastAPI server structure.
- Build basic endpoints (Health Check, Generate Concept stub).
- Set up CORS to communicate securely with the Next.js frontend.

## 🟢 Milestone 4: Data Room & Document Processing (Completed)
**Goal:** Process uploaded PDFs, extract text, and classify heuristic chunks.
- **Phase 4A:** Next.js -> Supabase Storage -> FastAPI -> PyMuPDF chunking pipeline.
- **Phase 4B:** Chunk classification heuristic and Next.js processing status UI.
- **Phase 4C:** Gemini structured extraction.
- **Phase 4D:** Intelligence verification workflow and Constraint promotion.

## 🟢 Security Hardening (Completed)
- Supabase RLS SELECT-only policies.
- `requireUserProjectAccess` helper.
- Patched project-scoped Server Actions.

## 🟢 Milestone 5: Site & Stand Details (Completed)
**Goal:** Capture exact physical and geographical property information as the foundation for AI layout generation.
- Extended the Prisma `Stand` model.
- Built the **Site Details** interactive form with strict dropdowns and responsive states.

## 🟢 Milestone 6: Brief Builder (Completed)
**Goal:** Capture user functional requirements.
- Completed the UI for interactive client & functional brief requirements.

## 🟢 Milestone 7: Concept Generation v1 (Completed)
**Goal:** Auto-generate conceptual layouts based on extracted constraints and the brief.
- Generates 2 concept options using the Vercel AI SDK and Gemini model.
- Includes Concept Scores, room arrangement, footprint logic, compliance, site response, and risk notes.
- MVP Visual Conceptual Schematic diagram.

## 🟡 Upcoming Milestones
- **Milestone 8: Cost Estimation**
- **Milestone 9: Final Report Generation**

## ⚪ Later / Post-MVP
- CAD/BIM
- Detailed BOQ
- Municipal-readiness checks
- PostGIS/spatial automation
- Advanced terrain/layout engines.

---

### Summary of Progress
We have successfully built the complete architectural foundation for Monali AI, including the full intelligence extraction and concept generation pipelines. The Next.js + PostgreSQL SaaS shell securely handles users, routing, and database state. The Python FastAPI microservice is actively communicating with the Next.js frontend. Heavy AI logic has been injected and successfully proven in the Data Room intelligence workflow (Phase 4) and Concept Generation (Phase 7). We are now moving forward to Cost Estimation.
