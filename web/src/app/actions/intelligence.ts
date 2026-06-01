'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function extractIntelligence(projectId: string, documentId: string) {
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

    revalidatePath(`/projects/${projectId}/intelligence`)
    return { success: true }
  } catch (error) {
    console.error('Extraction trigger error:', error)
    return { success: false, error: 'Failed to trigger extraction' }
  }
}
