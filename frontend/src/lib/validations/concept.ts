import { z } from 'zod'

export const ConceptV1Schema = z.object({
  name: z.string(),
  rationale: z.string().describe('Short design strategy.'),
  roomArrangement: z.string().describe('Summary of zones and room layout.'),
  siteResponse: z.object({
    access: z.string(),
    orientation: z.string(),
    views: z.string(),
    slope: z.string(),
    privacy: z.string()
  }).describe('How the design responds to the site.'),
  complianceCheck: z.object({
    setbacks: z.string(),
    coverage: z.string(),
    height: z.string(),
    parking: z.string(),
    notes: z.string()
  }).describe('Check of hard constraints. If a rule was missing, state "Missing input".'),
  footprintLogic: z.string().describe('Approximate footprint / floor area logic.'),
  riskNotes: z.array(z.string()).describe('List of risks or warnings.'),
  scores: z.object({
    buildability: z.number().min(1).max(10),
    costEfficiency: z.number().min(1).max(10),
    privacy: z.number().min(1).max(10),
    viewQuality: z.number().min(1).max(10),
    complianceConfidence: z.number().min(1).max(10)
  }).describe('Scores out of 10 for the concept.')
})

export type ConceptV1 = z.infer<typeof ConceptV1Schema>

export const ConceptGenerationSchema = z.object({
  concepts: z.array(ConceptV1Schema).min(2).max(3)
})
