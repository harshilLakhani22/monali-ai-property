import { prisma } from '@/lib/prisma'
import { requireUserProjectAccess } from '@/lib/auth-helpers'
import { ReportClientView } from './ReportClientView'

export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await requireUserProjectAccess(id)

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      stand: true,
      constraints: { where: { extraction: { verified: true } } }
    }
  })
  
  if (!project) return <div>Project not found</div>

  const report = await prisma.report.findFirst({
    where: { projectId: id }
  })

  return (
    <div className="max-w-5xl mx-auto w-full pb-20 pt-6 px-4 sm:px-6 lg:px-8">
      <div className="mb-8 print:hidden">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Final Feasibility Report</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Compile extracted intelligence, concepts, and costing into a client-ready export.
        </p>
      </div>

      <ReportClientView 
        projectId={id} 
        initialReport={report} 
        projectName={project.name} 
        stand={project.stand}
        constraints={project.constraints}
      />
    </div>
  )
}
