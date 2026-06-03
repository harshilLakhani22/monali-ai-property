import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function requireUserProjectAccess(projectId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id }
  })
  if (!dbUser) throw new Error('User not found in database')

  const project = await prisma.project.findUnique({
    where: { id: projectId }
  })
  if (!project) throw new Error('Project not found')

  if (project.userId !== user.id && project.organizationId !== dbUser.organizationId) {
    throw new Error('Forbidden: You do not have access to this project')
  }

  return { user: dbUser, project }
}
