import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { StandDetailsForm } from "./StandDetailsForm"

export const dynamic = 'force-dynamic';

export default async function StandDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = await params

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { stand: true }
  })

  if (!project) {
    notFound()
  }

  // Pass any existing stand data down, or null if it doesn't exist
  const initialData = project.stand || {}

  return (
    <div className="max-w-4xl space-y-8">
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold tracking-tight">Site & Stand Details</h2>
        <p className="text-sm text-muted-foreground">
          Define the physical characteristics of the stand to guide accurate layout and climate intelligence.
        </p>
      </div>

      <StandDetailsForm projectId={projectId} initialData={initialData} />
    </div>
  )
}
