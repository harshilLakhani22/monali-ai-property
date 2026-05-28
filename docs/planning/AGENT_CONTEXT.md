# Monali AI Property Development Platform — Project Context

## Client
Client name: Monali Kamffer  
Client type: Non-technical / business-focused property development operator  
Business context: She manages multiple property/development projects and wants an AI-assisted platform to help with land, property, estate, layout, design, costing, and reporting decisions.

## Core Problem
The client wants a system where property developers can upload land/project documents and basic development requirements, then receive AI-assisted analysis and concept outputs.

The platform should help answer:
1. What can be built on this land or stand?
2. What layout/design direction makes practical sense?
3. What are the constraints, risks, cost ranges, and next steps?

This is not meant to replace architects, engineers, or quantity surveyors in the MVP. It should produce early-stage concept intelligence and reports.

## Current Strategy
We are not building the full dream platform immediately.

We are building a focused MVP first:

**Single Stand / Spec House AI Concept Generator**

The MVP should prove the core workflow:
Create project → Upload documents → AI extracts rules/constraints → User fills house brief → AI generates concept options → System gives cost/design/buildability notes → Export PDF concept report.

## MVP Goal
Build a working web app where the client can:
- Create a property project
- Upload relevant documents
- Let AI summarize/extract useful rules and constraints
- Fill a guided house/development brief
- Generate 2–3 early concept options
- See rough cost range and buildability notes
- Export a simple concept report PDF

## MVP Included Features

### 1. Project Workspace
Each project should have:
- Project name
- Location / stand / erf details
- Project type: single stand, estate stand, spec house, revamp
- Documents
- Extracted AI notes
- Brief
- Concept options
- Cost estimate
- Exported report

### 2. Document Upload
User can upload:
- Zoning PDFs
- Estate guidelines
- Survey or contour files
- Site plans
- Reports
- Notes
- Images or reference files

For MVP, store documents and allow AI extraction from supported PDFs/text files.

### 3. AI Document Understanding
AI should extract:
- Project/property summary
- Important constraints
- Zoning/building rules if available
- Risks
- Design limitations
- Key requirements
- Open questions

Output should be stored as structured data.

### 4. Structured Brief Builder
User fills guided form:
- Bedrooms
- Bathrooms
- Garage size
- Storey preference
- Style preference
- Budget level
- Outdoor/patio/braai requirement
- Privacy/view priority
- Cost-saving priority
- Notes/free text

### 5. AI Concept Generation
Generate 2–3 concept options.

Each option should include:
- Concept name
- Short description
- Suggested layout logic
- Suggested site placement
- Garage/driveway logic
- Outdoor/patio logic
- Sun/privacy/access notes
- Buildability score
- Cost complexity score
- Pros and cons

For MVP, this can be text + simple schematic/visual option cards. Do not promise final architectural drawings.

### 6. Basic Visual Output
MVP visual output can be:
- Option cards
- Simple schematic floor/site layout
- SVG/canvas-style concept diagram
- Not full CAD
- Not final construction drawing

### 7. Cost Estimate
Generate rough early-stage cost guidance:
- Estimated build cost range
- Rate per square meter
- Complexity notes
- External works allowance
- Earthworks/retaining risk
- Cost-saving recommendations

This is not a final BOQ.

### 8. Export PDF Report
Export a clean report with:
- Project summary
- Uploaded document summary
- Extracted constraints
- User brief
- Concept options
- Cost range
- AI recommendations
- Next steps

## Out of Scope for MVP
Do not build these in the first version:
- Final architectural drawings
- Certified municipal submission plans
- Full CAD/DWG generation
- Accurate QS-level BOQ
- Full estate-wide automation
- Advanced 3D terrain engine
- Full solar/wind/climate simulation
- Legal/compliance guarantee

These belong to later phases.

## Recommended Tech Stack

Frontend:
- Next.js App Router
- TypeScript
- Tailwind CSS
- Shadcn/UI
- React Hook Form + Zod

Backend:
- Next.js API routes / server actions
- PostgreSQL
- Supabase for database, auth, and storage
- Prisma or Drizzle ORM

AI:
- OpenAI or Gemini API
- Structured JSON extraction with Zod schemas
- Separate prompts for document extraction, concept generation, cost estimation, and report writing

File Handling:
- Supabase Storage or S3-compatible storage
- PDF text extraction
- Optional OCR later for scanned PDFs

Report Export:
- React PDF or HTML-to-PDF using Playwright

Deployment:
- Vercel for app
- Supabase for backend/database/storage

## Suggested App Pages

1. `/dashboard`
Project list

2. `/projects/new`
Create new project

3. `/projects/[id]`
Project overview

4. `/projects/[id]/documents`
Upload and manage documents

5. `/projects/[id]/analysis`
AI extracted rules, constraints, risks, and summaries

6. `/projects/[id]/brief`
Guided brief builder

7. `/projects/[id]/concepts`
Generated concept options

8. `/projects/[id]/costing`
Rough cost estimate and buildability notes

9. `/projects/[id]/report`
Preview and export PDF report

## Database Entities

Core tables:
- users
- projects
- documents
- document_extractions
- briefs
- concept_options
- cost_estimates
- reports
- tasks_or_decisions

## Build Order

Phase 1:
- Setup Next.js project
- Setup UI layout
- Setup auth
- Setup database
- Create project CRUD

Phase 2:
- Document upload
- File storage
- Document list
- PDF extraction

Phase 3:
- AI document summary
- AI constraint extraction
- Store extracted structured data

Phase 4:
- Brief builder form
- Save brief data

Phase 5:
- AI concept generation
- Display 2–3 concept options
- Add scores, pros/cons, recommendations

Phase 6:
- Cost estimate logic
- PDF report generation

Phase 7:
- Polish UI
- Test with pilot project
- Prepare demo

## Important Product Positioning
The MVP should be described as:

“An AI-assisted property development concept platform that helps developers turn documents and project requirements into early-stage concept options, cost guidance, and decision reports.”

Do not describe it as:
- Fully automated architect
- Final plan generator
- Certified design tool
- Complete QS replacement

## First Task for Agent
Before writing code, review this context and propose:
1. Final MVP module list
2. Database schema
3. App route structure
4. AI workflow design
5. First 10 implementation tasks