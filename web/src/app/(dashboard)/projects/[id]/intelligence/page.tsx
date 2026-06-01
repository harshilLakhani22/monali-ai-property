import { prisma } from '@/lib/prisma'
import { IntelligenceClient } from './IntelligenceClient'

export default async function IntelligencePage({ params }: { params: { id: string } }) {
  // Fetch documents for the project, their intelligence extraction jobs, and extractions
  const documents = await prisma.document.findMany({
    where: { projectId: params.id },
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

  return (
    <div className="max-w-6xl mx-auto">
      <IntelligenceClient projectId={params.id} documents={formattedDocs} />
    </div>
  )
}
