-- 1. Enable RLS on all public tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Organization" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Project" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Stand" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Brief" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Document" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DocumentChunk" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AIJob" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Extraction" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Constraint" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Concept" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ConceptVersion" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CostEstimate" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Report" ENABLE ROW LEVEL SECURITY;

-- 2. User Policy (SELECT Only)
DROP POLICY IF EXISTS "Users can view their own data" ON "User";
CREATE POLICY "Users can view their own data" 
ON "User" 
FOR SELECT 
TO authenticated 
USING (id = auth.uid()::text);

-- 3. Organization Policy (SELECT Only)
DROP POLICY IF EXISTS "Users view their organization" ON "Organization";
CREATE POLICY "Users view their organization" 
ON "Organization" 
FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM "User" 
    WHERE "User"."organizationId" = "Organization".id 
    AND "User".id = auth.uid()::text
  )
);

-- 4. Project Policy (SELECT Only)
DROP POLICY IF EXISTS "Users view their projects" ON "Project";
CREATE POLICY "Users view their projects" 
ON "Project" 
FOR SELECT 
TO authenticated 
USING (
  "userId" = auth.uid()::text OR 
  EXISTS (
    SELECT 1 FROM "User" 
    WHERE "User".id = auth.uid()::text 
    AND "User"."organizationId" = "Project"."organizationId"
  )
);

-- 5. Level 1 Project Assets Helper Template (SELECT Only)
-- Used for: Stand, Brief, Document, AIJob, Extraction, Constraint, Concept, CostEstimate, Report
DROP POLICY IF EXISTS "Project assets access" ON "Stand";
CREATE POLICY "Project assets access" ON "Stand" FOR SELECT TO authenticated 
USING (EXISTS (
  SELECT 1 FROM "Project" 
  WHERE id = "Stand"."projectId"
  AND (
    "Project"."userId" = auth.uid()::text OR 
    EXISTS (
      SELECT 1 FROM "User" 
      WHERE "User".id = auth.uid()::text 
      AND "User"."organizationId" = "Project"."organizationId"
    )
  )
));

DROP POLICY IF EXISTS "Project assets access" ON "Brief";
CREATE POLICY "Project assets access" ON "Brief" FOR SELECT TO authenticated 
USING (EXISTS (
  SELECT 1 FROM "Project" 
  WHERE id = "Brief"."projectId"
  AND (
    "Project"."userId" = auth.uid()::text OR 
    EXISTS (
      SELECT 1 FROM "User" 
      WHERE "User".id = auth.uid()::text 
      AND "User"."organizationId" = "Project"."organizationId"
    )
  )
));

DROP POLICY IF EXISTS "Project assets access" ON "Document";
CREATE POLICY "Project assets access" ON "Document" FOR SELECT TO authenticated 
USING (EXISTS (
  SELECT 1 FROM "Project" 
  WHERE id = "Document"."projectId"
  AND (
    "Project"."userId" = auth.uid()::text OR 
    EXISTS (
      SELECT 1 FROM "User" 
      WHERE "User".id = auth.uid()::text 
      AND "User"."organizationId" = "Project"."organizationId"
    )
  )
));

DROP POLICY IF EXISTS "Project assets access" ON "AIJob";
CREATE POLICY "Project assets access" ON "AIJob" FOR SELECT TO authenticated 
USING (EXISTS (
  SELECT 1 FROM "Project" 
  WHERE id = "AIJob"."projectId"
  AND (
    "Project"."userId" = auth.uid()::text OR 
    EXISTS (
      SELECT 1 FROM "User" 
      WHERE "User".id = auth.uid()::text 
      AND "User"."organizationId" = "Project"."organizationId"
    )
  )
));

DROP POLICY IF EXISTS "Project assets access" ON "Extraction";
CREATE POLICY "Project assets access" ON "Extraction" FOR SELECT TO authenticated 
USING (EXISTS (
  SELECT 1 FROM "Project" 
  WHERE id = "Extraction"."projectId"
  AND (
    "Project"."userId" = auth.uid()::text OR 
    EXISTS (
      SELECT 1 FROM "User" 
      WHERE "User".id = auth.uid()::text 
      AND "User"."organizationId" = "Project"."organizationId"
    )
  )
));

DROP POLICY IF EXISTS "Project assets access" ON "Constraint";
CREATE POLICY "Project assets access" ON "Constraint" FOR SELECT TO authenticated 
USING (EXISTS (
  SELECT 1 FROM "Project" 
  WHERE id = "Constraint"."projectId"
  AND (
    "Project"."userId" = auth.uid()::text OR 
    EXISTS (
      SELECT 1 FROM "User" 
      WHERE "User".id = auth.uid()::text 
      AND "User"."organizationId" = "Project"."organizationId"
    )
  )
));

DROP POLICY IF EXISTS "Project assets access" ON "Concept";
CREATE POLICY "Project assets access" ON "Concept" FOR SELECT TO authenticated 
USING (EXISTS (
  SELECT 1 FROM "Project" 
  WHERE id = "Concept"."projectId"
  AND (
    "Project"."userId" = auth.uid()::text OR 
    EXISTS (
      SELECT 1 FROM "User" 
      WHERE "User".id = auth.uid()::text 
      AND "User"."organizationId" = "Project"."organizationId"
    )
  )
));

DROP POLICY IF EXISTS "Project assets access" ON "CostEstimate";
CREATE POLICY "Project assets access" ON "CostEstimate" FOR SELECT TO authenticated 
USING (EXISTS (
  SELECT 1 FROM "Project" 
  WHERE id = "CostEstimate"."projectId"
  AND (
    "Project"."userId" = auth.uid()::text OR 
    EXISTS (
      SELECT 1 FROM "User" 
      WHERE "User".id = auth.uid()::text 
      AND "User"."organizationId" = "Project"."organizationId"
    )
  )
));

DROP POLICY IF EXISTS "Project assets access" ON "Report";
CREATE POLICY "Project assets access" ON "Report" FOR SELECT TO authenticated 
USING (EXISTS (
  SELECT 1 FROM "Project" 
  WHERE id = "Report"."projectId"
  AND (
    "Project"."userId" = auth.uid()::text OR 
    EXISTS (
      SELECT 1 FROM "User" 
      WHERE "User".id = auth.uid()::text 
      AND "User"."organizationId" = "Project"."organizationId"
    )
  )
));

-- 6. Level 2 Nested Assets (SELECT Only)
DROP POLICY IF EXISTS "Document chunks access" ON "DocumentChunk";
CREATE POLICY "Document chunks access" ON "DocumentChunk" FOR SELECT TO authenticated 
USING (EXISTS (
  SELECT 1 FROM "Document"
  JOIN "Project" ON "Project".id = "Document"."projectId"
  WHERE "Document".id = "DocumentChunk"."documentId"
  AND (
    "Project"."userId" = auth.uid()::text OR 
    EXISTS (
      SELECT 1 FROM "User" 
      WHERE "User".id = auth.uid()::text 
      AND "User"."organizationId" = "Project"."organizationId"
    )
  )
));

DROP POLICY IF EXISTS "Concept versions access" ON "ConceptVersion";
CREATE POLICY "Concept versions access" ON "ConceptVersion" FOR SELECT TO authenticated 
USING (EXISTS (
  SELECT 1 FROM "Concept"
  JOIN "Project" ON "Project".id = "Concept"."projectId"
  WHERE "Concept".id = "ConceptVersion"."conceptId"
  AND (
    "Project"."userId" = auth.uid()::text OR 
    EXISTS (
      SELECT 1 FROM "User" 
      WHERE "User".id = auth.uid()::text 
      AND "User"."organizationId" = "Project"."organizationId"
    )
  )
));
