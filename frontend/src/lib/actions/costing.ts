'use server'

import { requireUserProjectAccess } from '@/lib/auth-helpers'
import { prisma } from '../prisma'
import { COST_RATES } from '../costing/rates'
import { costNarrativeSchema, CostCategoryBreakdown, CostEstimateData } from '../validations/costing'
import { revalidatePath } from 'next/cache'
import { generateObject } from 'ai'
import { google } from '@ai-sdk/google'

export async function generateCostEstimate(projectId: string, conceptVersionId: string) {
  await requireUserProjectAccess(projectId)

  // 1. Fetch Data
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      brief: true,
      stand: true,
    }
  })

  const conceptVersion = await prisma.conceptVersion.findUnique({
    where: { id: conceptVersionId },
    include: { concept: true }
  })

  if (!project || !conceptVersion) {
    throw new Error("Project or Concept not found")
  }

  if (conceptVersion.concept.projectId !== projectId) {
    throw new Error("Forbidden: ConceptVersion does not belong to this Project")
  }

  const missingInputs: string[] = []
  const assumptions: string[] = []

  type BriefData = {
    roomsAndSpaces?: { bedrooms?: number | string, bathrooms?: number | string, livingDining?: boolean, garageBays?: number | string },
    projectIntent?: { budgetRange?: string, targetFloorArea?: number | string }
  }
  const briefData = (project.brief?.data as BriefData) || {}
  const reqBeds = parseInt(String(briefData.roomsAndSpaces?.bedrooms || '0')) || 0
  const reqBaths = parseInt(String(briefData.roomsAndSpaces?.bathrooms || '0')) || 0
  const reqLiving = briefData.roomsAndSpaces?.livingDining ? 1 : 0
  const reqGarage = parseInt(String(briefData.roomsAndSpaces?.garageBays || '0')) || 0
  const briefBudgetLimit = parseInt(String(briefData.projectIntent?.budgetRange || '0').replace(/\D/g, '')) || 0
  const briefQuality = String(briefData.projectIntent?.budgetRange || 'mid_range').toLowerCase()

  // 3. Area Calculation Priority
  let baseArea = 0
  let areaSource = ''
  const conceptData = (conceptVersion.data as Record<string, unknown>) || {}
  
  if (briefData.projectIntent?.targetFloorArea) {
    baseArea = parseInt(String(briefData.projectIntent.targetFloorArea).replace(/\D/g, '')) || 0
    if (baseArea > 0) {
      areaSource = 'brief.targetFloorArea'
      assumptions.push(`Area Source: ${areaSource}`)
    }
  }

  if (baseArea === 0 && (conceptData.footprintLogic || conceptData.area)) {
    const footprintLogicStr = String(conceptData.footprintLogic || '')
    const match = footprintLogicStr.match(/(\d+)\s*(m2|m²|sqm|sq m)/i)
    if (match) {
      baseArea = parseInt(match[1]) || 0
    }
    if (baseArea === 0 && conceptData.area) {
      baseArea = parseInt(conceptData.area.toString().replace(/\D/g, '')) || 0
    }
    
    if (baseArea > 0) {
      areaSource = 'concept.footprintLogic'
      assumptions.push(`Area Source: ${areaSource}`)
    }
  }

  if (baseArea === 0) {
    missingInputs.push("Missing exact CAD/measured area or target floor area")
    baseArea = (reqBeds * 25) + (reqBaths * 10) + (reqLiving * 60)
    if (baseArea === 0) baseArea = 150 // ultimate fallback
    areaSource = 'room-count fallback'
    assumptions.push(`Area Source: ${areaSource}`)
    assumptions.push(`Area estimated heuristically based on room counts (${reqBeds} beds, ${reqBaths} baths, ${reqLiving} living).`)
  }

  // 3.5 Garage Calculation Priority
  let finalGarageCount = reqGarage
  let garageSource = ''
  
  if (finalGarageCount > 0) {
    garageSource = 'brief.garages'
    assumptions.push(`Garage Source: ${garageSource}`)
  } else {
    const complianceStr = String(conceptData.compliance || '')
    const roomArrangementStr = String(conceptData.roomArrangement || '')
    const combinedStr = (complianceStr + ' ' + roomArrangementStr).toLowerCase()
    
    const garageMatch = combinedStr.match(/(\d+)(?:\s*|-)(?:car|vehicle)\s*(?:garage|parking)/i) 
      || combinedStr.match(/(?:garage|parking)\s*(?:for)?\s*(\d+)/i)
    
    if (garageMatch) {
      finalGarageCount = parseInt(garageMatch[1]) || 0
    }
    if (finalGarageCount === 0) {
      if (combinedStr.includes('double garage') || combinedStr.includes('two car garage') || combinedStr.includes('two-car garage') || combinedStr.includes('2-car')) finalGarageCount = 2
      else if (combinedStr.includes('single garage') || combinedStr.includes('one car garage') || combinedStr.includes('one-car garage') || combinedStr.includes('1-car')) finalGarageCount = 1
    }
    
    if (finalGarageCount > 0) {
      garageSource = 'concept.roomArrangement/compliance'
      assumptions.push(`Garage Source: ${garageSource}`)
    } else {
      missingInputs.push("Missing garage/parking data")
      garageSource = 'missing'
      assumptions.push(`Garage Source: ${garageSource}`)
    }
  }

  const garageArea = finalGarageCount * 25

  // 4. Base Rate
  let baseRate: number = COST_RATES.baseRates.mid_range
  if (briefQuality.includes('economy')) baseRate = COST_RATES.baseRates.economy
  if (briefQuality.includes('premium') || briefQuality.includes('luxury')) baseRate = COST_RATES.baseRates.premium
  
  assumptions.push(`Base rate assumed at ${COST_RATES.currency} ${baseRate}/m² based on ${briefQuality} quality.`)

  // 5. Multipliers
  let slopeMultiplier: number = COST_RATES.multipliers.slope.flat
  const slope = project.stand?.slopeCondition?.toLowerCase() || ''
  if (slope.includes('moderate')) slopeMultiplier = COST_RATES.multipliers.slope.moderate
  else if (slope.includes('steep')) slopeMultiplier = COST_RATES.multipliers.slope.steep
  else if (!slope) {
    missingInputs.push("Missing slope data")
    assumptions.push("Assuming flat terrain due to missing slope data.")
  }

  let complexityMultiplier: number = COST_RATES.multipliers.complexity.rectangular
  const footprint = (conceptData.footprintLogic as string)?.toLowerCase() || ''
  if (footprint.includes('l-shape')) complexityMultiplier = COST_RATES.multipliers.complexity.l_shape
  else if (footprint.includes('courtyard')) complexityMultiplier = COST_RATES.multipliers.complexity.courtyard

  // 6. Math Compilation
  const baseConstruction = baseArea * baseRate
  const garageCost = garageArea * (baseRate * COST_RATES.garageRateMultiplier)
  const slopeRisk = baseConstruction * (slopeMultiplier - 1)
  const complexityRisk = baseConstruction * (complexityMultiplier - 1)
  const externalWorks = COST_RATES.allowances.externalWorks
  
  const subTotal = baseConstruction + garageCost + slopeRisk + complexityRisk + externalWorks
  const contingency = subTotal * COST_RATES.contingencyPercent
  
  const total = subTotal + contingency
  
  const lowCost = total * COST_RATES.ranges.low
  const highCost = total * COST_RATES.ranges.high

  const breakdown: CostCategoryBreakdown = {
    baseConstruction,
    garage: garageCost,
    externalWorks,
    slopeRisk,
    complexityRisk,
    contingency,
    total
  }

  // 7. Budget Alignment
  let budgetAlignment: 'under_budget' | 'within_budget' | 'above_budget' | 'unknown' = 'unknown'
  if (!briefBudgetLimit) {
    missingInputs.push("Missing budget cap in Brief")
  } else {
    if (highCost <= briefBudgetLimit) budgetAlignment = 'under_budget'
    else if (lowCost > briefBudgetLimit) budgetAlignment = 'above_budget'
    else budgetAlignment = 'within_budget'
  }

  missingInputs.push("Missing local contractor rate source (MVP defaults applied)")

  let confidenceScore = 80
  if (missingInputs.length > 2) confidenceScore = 60
  if (missingInputs.length > 4) confidenceScore = 40

  // 8. Gemini Narrative (Optional)
  let narrative = {
    costAssumptions: assumptions,
    costDrivers: `The primary cost drivers are the base floor area (${baseArea}m²) and the chosen ${briefQuality} finish level.`,
    riskFactors: `Standard risks apply. Contingency of 10% has been included.`
  }

  try {
    if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      const prompt = `
        You are an expert Quantity Surveyor reviewing a conceptual architectural layout.
        Do NOT invent or guess any financial numbers. Do NOT provide math.
        
        Given these deterministic calculations:
        - Base Area: ${baseArea}m2
        - Garage Area: ${garageArea}m2
        - Slope Multiplier: ${slopeMultiplier}
        - Complexity Multiplier: ${complexityMultiplier}
        - Footprint logic: ${conceptData.footprintLogic}
        - Concept name: ${conceptVersion.concept.name}
        
        Generate a short narrative explaining the cost drivers and risk factors.
      `
      
      const { object } = await generateObject({
        model: google('gemini-2.5-flash'),
        schema: costNarrativeSchema,
        prompt
      })
      
      narrative = {
        costAssumptions: assumptions, // override LLM assumptions to keep deterministic
        costDrivers: object.costDrivers,
        riskFactors: object.riskFactors
      }
    }
  } catch (error) {
    console.error("Gemini Cost Narrative failed, using generic fallback:", error)
    // Silently continue with generic fallback narrative already defined
  }

  // 9. Prisma Upsert
  const estimateData: CostEstimateData = {
    breakdown,
    narrative,
    budgetAlignment,
    missingInputs,
    confidenceScore,
    currency: COST_RATES.currency
  }

  await prisma.costEstimate.upsert({
    where: { conceptVersionId },
    update: {
      area: baseArea,
      ratePerM2: baseRate,
      multiplier: slopeMultiplier * complexityMultiplier,
      totalRange: { min: lowCost, max: highCost },
      assumptions: assumptions,
      data: estimateData as unknown as import('@prisma/client').Prisma.InputJsonValue
    },
    create: {
      projectId,
      conceptVersionId,
      area: baseArea,
      ratePerM2: baseRate,
      multiplier: slopeMultiplier * complexityMultiplier,
      totalRange: { min: lowCost, max: highCost },
      assumptions: assumptions,
      data: estimateData as unknown as import('@prisma/client').Prisma.InputJsonValue
    }
  })

  revalidatePath(`/projects/${projectId}/costing`)
}
