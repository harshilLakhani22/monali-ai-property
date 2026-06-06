'use server'

import { prisma } from '@/lib/prisma'
import { requireUserProjectAccess } from '@/lib/auth-helpers'
import { generateObject } from 'ai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { ConceptGenerationSchema } from '../validations/concept'
import { revalidatePath } from 'next/cache'
import { Prisma } from '@prisma/client'

export async function getConceptsForProject(projectId: string) {
  await requireUserProjectAccess(projectId)
  
  const concepts = await prisma.concept.findMany({
    where: { projectId },
    include: {
      versions: {
        orderBy: { versionNum: 'desc' },
        take: 1
      }
    },
    orderBy: { name: 'asc' }
  })
  
  return concepts
}

export async function generateConceptsForProject(projectId: string) {
  await requireUserProjectAccess(projectId)

  // 1. Context Builder
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      brief: true,
      stand: true,
      constraints: {
        where: {
          extraction: { verified: true } // Or constraints are inherently verified? The task said "verified Constraint records".
          // Actually, our constraints table is populated when verified.
        }
      }
    }
  })

  if (!project) throw new Error('Project not found')

  // Extract relevant details
  const briefData = (project.brief?.data || {}) as Record<string, Prisma.InputJsonValue>
  const standData = (project.stand || {}) as Partial<import('@prisma/client').Stand>
  const constraints = project.constraints || []

  // Check for missing critical inputs
  const missingInputs: string[] = []
  if (!project.stand?.standArea) missingInputs.push('Stand Area')
  if (constraints.length === 0) missingInputs.push('Verified Rules/Constraints')

  let missingWarning = ''
  if (missingInputs.length > 0) {
    missingWarning = `WARNING: The following inputs are missing: ${missingInputs.join(', ')}. Do not invent them. State "Missing input" where applicable.`
  }

  const promptText = `
    You are an expert architect. Generate 2 to 3 early-stage architectural concepts for a property development project.
    
    IMPORTANT: Do not invent hard numbers. Hard values (setbacks, coverage, parking, height, area) must come ONLY from the provided constraints and stand details.
    ${missingWarning}

    === PROJECT BRIEF ===
    ${JSON.stringify(briefData, null, 2)}

    === STAND / SITE DETAILS ===
    Stand Area: ${standData.standArea}
    Road Access: ${standData.roadAccessSide}
    North Direction: ${standData.northDirection}
    Slope Condition: ${standData.slopeCondition}
    View Direction: ${standData.viewDirection}
    Privacy Notes: ${standData.privacyNotes}

    === VERIFIED CONSTRAINTS ===
    ${constraints.map(c => `- ${c.type}: ${c.value}`).join('\n')}

    === OUTPUT EXPECTATIONS ===
    For each concept, please return:
    - name, rationale, roomArrangement, siteResponse, complianceCheck, footprintLogic, riskNotes, scores.
    - exteriorDirection: Describe the intended style, materials, roof, landscape, and provide a highly detailed aiRenderPrompt for an image generator (describe the building, setting, lighting, materials, and mood).
    - layoutSchematic: Describe the footprint type (L-shape, Courtyard, Linear, Compact Block), primaryAccessSide, livingOrientation, bedroomOrientation, and privacyEdge.
  `

  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error("Missing GOOGLE_GENERATIVE_AI_API_KEY or GEMINI_API_KEY in frontend environment.")
  }

  const googleProvider = createGoogleGenerativeAI({
    apiKey: apiKey
  })

  const modelName = process.env.GOOGLE_GENERATIVE_AI_MODEL || "gemini-2.5-flash"

  // 2. LLM Call
  const { object } = await generateObject({
    model: googleProvider(modelName),
    schema: ConceptGenerationSchema,
    prompt: promptText,
    temperature: 0.7,
  })

  // 3. Store the result
  // We use a transaction to create multiple concepts
  await prisma.$transaction(
    object.concepts.map(conceptData => {
      const { name, rationale, scores, ...restData } = conceptData
      return prisma.concept.create({
        data: {
          projectId,
          name,
          versions: {
            create: {
              versionNum: 1,
              rationale,
              scores: scores as unknown as Prisma.InputJsonValue,
              data: restData as unknown as Prisma.InputJsonValue
            }
          }
        }
      })
    })
  )

  revalidatePath(`/projects/${projectId}/concepts`)
  
  return { success: true }
}
