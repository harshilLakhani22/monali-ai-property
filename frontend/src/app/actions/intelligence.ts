'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { requireUserProjectAccess } from '@/lib/auth-helpers'

export async function extractIntelligence(projectId: string, documentId: string) {
  await requireUserProjectAccess(projectId)
  try {
    // 1. Create a new AIJob for extraction
    const aiJob = await prisma.aIJob.create({
      data: {
        projectId,
        documentId,
        type: 'intelligence_extraction',
        status: 'pending'
      }
    })

    // 2. Call FastAPI backend
    const fastApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    const res = await fetch(`${fastApiUrl}/api/documents/extract-intelligence`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        project_id: projectId,
        document_id: documentId
      })
    })

    if (!res.ok) {
      console.error('FastAPI error', await res.text())
      await prisma.aIJob.update({
        where: { id: aiJob.id },
        data: { status: 'failed', errorLog: 'Failed to contact FastAPI' }
      })
      throw new Error('Failed to start extraction')
    }

    try { revalidatePath(`/projects/${projectId}/intelligence`) } catch {}
    return { success: true }
  } catch (error) {
    console.error('Extraction trigger error:', error)
    return { success: false, error: 'Failed to trigger extraction' }
  }
}

export async function updateExtraction(extractionId: string, projectId: string, data: { value?: string, unit?: string, label?: string, category?: string }) {
  await requireUserProjectAccess(projectId)
  await prisma.extraction.update({
    where: { id: extractionId },
    data: {
      editedValue: data.value,
      editedUnit: data.unit,
      editedLabel: data.label,
      editedCategory: data.category,
      editedAt: new Date(),
    }
  })
  try { revalidatePath(`/projects/${projectId}/intelligence`) } catch {}
}

export async function verifyExtraction(extractionId: string, projectId: string) {
  await requireUserProjectAccess(projectId)
  const extraction = await prisma.extraction.findUnique({ where: { id: extractionId } })
  if (!extraction) throw new Error('Extraction not found')

  // Update Extraction to verified
  const updatedExt = await prisma.extraction.update({
    where: { id: extractionId },
    data: {
      verified: true,
      rejected: false,
      verifiedAt: new Date()
    }
  })

  // Upsert Constraint using extractionId
  const finalValueStr = updatedExt.editedValue ?? updatedExt.value
  const finalUnitStr = updatedExt.editedUnit ?? updatedExt.unit
  const fullValue = finalUnitStr ? `${finalValueStr} ${finalUnitStr}`.trim() : finalValueStr
  const finalType = updatedExt.editedCategory ?? updatedExt.category

  await prisma.constraint.upsert({
    where: { extractionId: extraction.id },
    create: {
      projectId: extraction.projectId,
      extractionId: extraction.id,
      type: finalType,
      value: fullValue
    },
    update: {
      type: finalType,
      value: fullValue
    }
  })

  try { revalidatePath(`/projects/${projectId}/intelligence`) } catch {}
}

export async function rejectExtraction(extractionId: string, projectId: string, reason?: string) {
  await requireUserProjectAccess(projectId)
  await prisma.extraction.update({
    where: { id: extractionId },
    data: {
      rejected: true,
      verified: false,
      rejectionReason: reason || null
    }
  })
  
  // If it was previously verified, remove the constraint
  try {
    await prisma.constraint.delete({
      where: { extractionId: extractionId }
    })
  } catch {
    // Ignore if not found
  }
  try { revalidatePath(`/projects/${projectId}/intelligence`) } catch {}
}
