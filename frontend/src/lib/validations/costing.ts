import * as z from 'zod'

export const costCategoryBreakdownSchema = z.object({
  baseConstruction: z.number(),
  garage: z.number(),
  externalWorks: z.number(),
  slopeRisk: z.number(),
  complexityRisk: z.number(),
  contingency: z.number(),
  total: z.number(),
})

export type CostCategoryBreakdown = z.infer<typeof costCategoryBreakdownSchema>

export const costNarrativeSchema = z.object({
  costAssumptions: z.array(z.string()),
  costDrivers: z.string(),
  riskFactors: z.string(),
})

export type CostNarrative = z.infer<typeof costNarrativeSchema>

export const costEstimateDataSchema = z.object({
  breakdown: costCategoryBreakdownSchema,
  narrative: costNarrativeSchema,
  budgetAlignment: z.enum(['under_budget', 'within_budget', 'above_budget', 'unknown']),
  missingInputs: z.array(z.string()),
  confidenceScore: z.number().min(0).max(100),
  currency: z.string(),
})

export type CostEstimateData = z.infer<typeof costEstimateDataSchema>
