# Monali AI Platform

Monali AI is an advanced Minimum Viable Product (MVP) platform designed for automated architectural feasibility studies, intelligence extraction, and conceptual generation. It bridges the gap between raw client property data and actionable massing concepts.

## 🎯 Current MVP Workflow
1. **Data Room:** Upload raw PDF documents (Title Deeds, Zoning certificates, etc.). The AI extracts, chunks, and classifies unstructured data into verified property constraints.
2. **Site Details & Brief:** Capture precise geographical details and user functional requirements.
3. **Concepts:** Auto-generate conceptual block layouts and massing abstractions based on strict, verified constraints.
4. **Cost Estimation:** Auto-calculate deterministic feasibility costs based on concept area and configurable rates.
5. **Final Report:** *(Upcoming in Phase 9)*

## 📂 Repository Structure
- `/frontend`: Next.js App Router SaaS application. Handles UI, routing, database state, Server Actions, and lightweight API calls. (See `frontend/README.md` for local setup).
- `/backend`: Python FastAPI microservice. Handles heavy document processing, PyMuPDF parsing, and heuristic chunking.
- `/docs`: Contains planning materials and architecture documentation. *(Note: Planning documents here are internal. Do not expose them to public repositories).*
- `/supabase`: Contains database schema migrations, seed data, and Row Level Security (RLS) policies.

## ✅ Completed Phases
- Phase 1 & 2: Shell & Backend Wiring (Supabase Auth, Prisma)
- Phase 3 & 4: Data Room Intelligence (PDF -> AI Verification)
- Phase 5: Site Details
- Phase 6: Brief Builder
- Phase 7: Concept Generation v1
- Phase 8: Cost Estimation
- Phase 9: Final Report Generation

## 🔒 Security Note
This platform implements strict security:
- **Supabase RLS:** All tables enforce Row Level Security, scoped by `organizationId`.
- **Server Actions:** Idempotent, project-scoped data access enforced via `requireUserProjectAccess()`.
- **Environment Variables:** Must NEVER be committed.
