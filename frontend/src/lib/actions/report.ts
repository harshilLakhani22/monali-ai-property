/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'

import { prisma } from '@/lib/prisma'
import { requireUserProjectAccess } from '@/lib/auth-helpers'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { revalidatePath } from 'next/cache'

export async function generateFinalReport(projectId: string) {
  await requireUserProjectAccess(projectId)

  // Fetch all necessary data
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      stand: true,
      brief: true,
      concepts: {
        include: {
          versions: { 
            orderBy: { versionNum: 'desc' }, 
            take: 1,
            include: {
              costEstimate: true
            }
          }
        }
      }
    }
  })

  if (!project) throw new Error('Project not found')

  const stand = project.stand
  const brief = project.brief
  const briefData = brief?.data as any
  const concepts = project.concepts

  // Sort concepts by latest version createdAt descending, and take top 3
  const sortedConcepts = [...concepts].sort((a, b) => {
    const aTime = a.versions?.[0]?.createdAt?.getTime() || 0
    const bTime = b.versions?.[0]?.createdAt?.getTime() || 0
    return bTime - aTime
  }).slice(0, 3)

  // Fetch Constraints explicitly (only trusted Constraint rows)
  const constraints = await prisma.constraint.findMany({
    where: { projectId: projectId }
  })

  // Format concepts data
  const conceptData = sortedConcepts.map(concept => {
    const latestVersion = concept.versions[0]
    let costEstimateData = null
    
    if (latestVersion && latestVersion.costEstimate) {
      const data = latestVersion.costEstimate.data as unknown as any
      costEstimateData = {
        rangeMin: data?.breakdown?.total || 0,
        rangeMax: (data?.breakdown?.total || 0) * 1.2, // Feasibility high range
        currency: data?.currency || 'ZAR',
        baseArea: latestVersion.costEstimate.area,
        ratePerM2: latestVersion.costEstimate.ratePerM2,
        breakdown: data?.breakdown,
        assumptions: data?.narrative?.costAssumptions || [],
        riskFactors: data?.narrative?.riskFactors || '',
        confidenceScore: data?.confidenceScore || 70,
        budgetStatus: data?.budgetAlignment || 'unknown'
      }
    }

    return {
      id: concept.id,
      name: concept.name,
      rationale: latestVersion?.rationale || '',
      roomArrangement: latestVersion?.data ? (latestVersion.data as unknown as any).roomArrangement : '',
      siteResponse: latestVersion?.data ? (latestVersion.data as unknown as any).siteResponse : '',
      complianceCheck: latestVersion?.data ? (latestVersion.data as unknown as any).compliance : '',
      riskNotes: latestVersion?.data ? (latestVersion.data as unknown as any).riskNotes : '',
      scores: latestVersion?.scores,
      costEstimate: costEstimateData,
      rawConceptData: latestVersion?.data
    }
  })

  // Deterministic Narrative Fallback
  let executiveNarrative = `This is a conceptual feasibility report for the ${project.name} project. `
  if (briefData) {
    executiveNarrative += `The proposed development is a ${briefData.storeys || 'multi'}-storey ${briefData.buildingType || 'building'}. `
  }
  executiveNarrative += `${concepts.length} concept options have been generated based on ${constraints.length} verified site constraints.`

  // Optional Gemini Narrative
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
  if (apiKey) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey)
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
      
      const prompt = `Write a professional, 2-paragraph executive summary for a property development feasibility report.
Project Name: ${project.name}
Site: ${stand ? stand.standArea + ' sqm' : 'Unknown size'}
Building Type: ${briefData ? briefData.buildingType : 'Unknown'}
Constraints analyzed: ${constraints.length}
Concepts generated: ${concepts.length}
DO NOT invent costs, constraints, or missing data. Keep it factual, professional, and highlight that this is a conceptual feasibility review.`

      const result = await model.generateContent(prompt)
      const response = await result.response
      executiveNarrative = response.text()
    } catch (e) {
      console.error('Gemini error, using fallback narrative', e)
    }
  }

  // Calculate missing inputs
  const missingInputs: string[] = []
  if (!stand) {
    missingInputs.push("Missing Site Details (Stand/Erf data)")
  } else {
    if (!stand.erfNumber) missingInputs.push("Missing Erf Number")
    if (!stand.standArea) missingInputs.push("Missing Stand Area")
  }
  
  if (!brief) {
    missingInputs.push("Missing Client Brief")
  } else if (briefData) {
    if (!briefData.projectIntent?.targetBuildingType) missingInputs.push("Missing Building Type in Brief")
    if (!briefData.projectIntent?.storeys) missingInputs.push("Missing Storeys in Brief")
    if (!briefData.projectIntent?.targetFloorArea) missingInputs.push("Missing Target Floor Area in Brief")
    if (!briefData.designPreferences?.architecturalStyle) missingInputs.push("Missing Style Preferences in Brief")
  }

  if (constraints.length === 0) missingInputs.push("No verified Constraints found")
  if (concepts.length === 0) missingInputs.push("No Concepts generated")

  // Assemble ReportData
  const reportData = {
    executiveSummary: {
      narrative: executiveNarrative,
      bestConceptRecommendation: concepts.length > 0 ? concepts[0].name : 'N/A'
    },
    siteSummary: {
      erfNumber: stand?.erfNumber || 'Unknown',
      standArea: stand?.standArea ? `${stand.standArea} m²` : 'Unknown',
      coordinates: (stand?.latitude && stand?.longitude) ? `${stand.latitude}, ${stand.longitude}` : 'Unknown',
      roadAccess: stand?.roadAccessSide || 'Unknown',
      northOrientation: stand?.northDirection || 'Unknown',
      slope: stand?.slopeCondition || 'Unknown',
      views: stand?.viewDirection || 'Unknown',
      siteRisks: stand?.siteRisks ? [stand.siteRisks] : []
    },
    constraints: constraints.map(c => ({
      category: c.type,
      description: c.value,
      source: 'Verified'
    })),
    briefSummary: {
      buildingType: briefData?.projectIntent?.targetBuildingType || 'Unknown',
      storeys: briefData?.projectIntent?.storeys || 0,
      rooms: briefData?.roomsAndSpaces || {},
      targetFloorArea: briefData?.projectIntent?.targetFloorArea || null,
      stylePreferences: [
        briefData?.designPreferences?.architecturalStyle,
        briefData?.designPreferences?.roofPreference,
        briefData?.designPreferences?.preferredMaterials
      ].filter(Boolean).join(', ') || 'None specified',
      specialRequirements: briefData?.specialRequirements || 'None',
      priorities: briefData?.priorities || {}
    },
    concepts: conceptData,
    missingInputs,
    nextSteps: [
      "Review this conceptual report with the client.",
      "Confirm any missing inputs or unverified constraints.",
      "Validate the preferred concept direction.",
      "Proceed to detailed schematic design (CAD/BIM) and formal BOQ."
    ]
  }

  // Upsert the Report record (strict 1:1 using unique projectId)
  let report = await prisma.report.findFirst({ where: { projectId } })
  const reportPayload = {
    name: `${project.name} - Final Feasibility Report`,
    status: 'ready',
    data: reportData as unknown as any
  }
  
  if (report) {
    report = await prisma.report.update({
      where: { id: report.id },
      data: reportPayload
    })
  } else {
    report = await prisma.report.create({
      data: {
        projectId,
        ...reportPayload
      }
    })
  }

  revalidatePath(`/projects/${projectId}/report`)
  return { success: true, reportId: report.id }
}
