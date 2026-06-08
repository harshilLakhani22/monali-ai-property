import { prisma } from '@/lib/prisma'
import { IntelligenceClient } from './IntelligenceClient'
import { PendingJobPoller } from '@/components/PendingJobPoller'

export default async function IntelligencePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = await params;
  // Fetch documents for the project, their intelligence extraction jobs, and extractions
  const documents = await prisma.document.findMany({
    where: { projectId },
    include: {
      aiJobs: {
        where: { type: 'intelligence_extraction' },
        orderBy: { createdAt: 'desc' },
        take: 1
      },
      extractions: {
        orderBy: { category: 'asc' }
      }
    }
  })

  // Format data for the client
  const formattedDocs = documents.map(doc => ({
    id: doc.id,
    fileName: doc.name,
    status: doc.status,
    intelligenceJob: doc.aiJobs[0] || undefined,
    extractions: doc.extractions
  }))

  const hasPendingJobs = formattedDocs.some(doc => 
    doc.intelligenceJob && doc.intelligenceJob.status !== 'completed' && doc.intelligenceJob.status !== 'failed'
  )

  return (
    <div className="max-w-6xl mx-auto">
      <PendingJobPoller hasPendingJobs={hasPendingJobs} />
      <IntelligenceClient projectId={projectId} documents={formattedDocs} />
    </div>
  )
}
