import { prisma } from '@/lib/prisma'
import { requireUserProjectAccess } from '@/lib/auth-helpers'
import { CostingClientView } from './CostingClientView'

export default async function CostingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await requireUserProjectAccess(id)

  const concepts = await prisma.concept.findMany({
    where: { projectId: id },
    include: {
      versions: {
        include: {
          costEstimate: true
        },
        orderBy: { versionNum: 'desc' }
      }
    }
  })

  // We only care about the latest version of each concept for the MVP
  const latestVersions = concepts.map(c => {
    return {
      ...c.versions[0],
      concept: { id: c.id, name: c.name, projectId: c.projectId }
    }
  }).filter(v => !!v)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-semibold text-zinc-900 tracking-tight">Cost Estimates</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Generate feasibility-level cost estimates for each concept.
          </p>
        </div>
      </div>
      
      <CostingClientView projectId={id} conceptVersions={latestVersions} />
    </div>
  )
}
