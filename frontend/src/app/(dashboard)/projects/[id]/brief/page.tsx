import { getBriefForProject } from "@/lib/actions/brief"
import { prisma } from "@/lib/prisma"
import { BriefBuilderForm } from "./BriefBuilderForm"

export const dynamic = 'force-dynamic'

export default async function BriefPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = await params

  // 1. Fetch Existing Brief (if any)
  const brief = await getBriefForProject(projectId)

  // 2. Fetch Read-Only Context (Stand & Verified Constraints)
  const stand = await prisma.stand.findUnique({ where: { projectId } })
  const verifiedConstraints = await prisma.constraint.findMany({ 
    where: { projectId },
    orderBy: { type: 'asc' }
  })

  return (
    <div className="grid gap-8 md:grid-cols-3 xl:grid-cols-4">
      {/* Main Form Area */}
      <div className="md:col-span-2 xl:col-span-3 space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground font-sans">Project Brief</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Define the functional and design requirements for this property.
          </p>
        </div>
        
        <BriefBuilderForm projectId={projectId} initialData={brief || {}} />
      </div>

      {/* Read-Only Context Summary */}
      <div className="md:col-span-1 xl:col-span-1">
        <div className="sticky top-6 flex flex-col gap-6">
          
          {/* Site & Stand Summary */}
          <div className="p-5 bg-card rounded-2xl border border-border/50 shadow-sm">
            <h3 className="font-semibold text-lg mb-4 text-foreground border-b border-border/50 pb-2">Site & Stand</h3>
            <div className="space-y-3 text-sm">
              {stand ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Area</span>
                    <span className="font-medium">{stand.standArea ? `${stand.standArea} m²` : 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Topography</span>
                    <span className="font-medium">{stand.slopeCondition || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Orientation</span>
                    <span className="font-medium">{stand.northDirection || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Access</span>
                    <span className="font-medium">{stand.roadAccessSide || 'Unknown'}</span>
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground italic">No stand details saved yet.</p>
              )}
            </div>
          </div>

          {/* Constraints Summary */}
          <div className="p-5 bg-card rounded-2xl border border-border/50 shadow-sm">
            <h3 className="font-semibold text-lg mb-4 text-foreground border-b border-border/50 pb-2">Constraints</h3>
            <div className="space-y-3 text-sm">
              {verifiedConstraints.length > 0 ? (
                verifiedConstraints.map(c => (
                  <div key={c.id} className="flex justify-between gap-4">
                    <span className="text-muted-foreground capitalize break-words">{c.type.replace(/_/g, ' ')}</span>
                    <span className="font-medium text-right">{c.value}</span>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground italic">No verified constraints found.</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
