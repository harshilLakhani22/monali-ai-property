"use server"

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function createProject(formData: FormData) {
  const name = formData.get('name') as string
  const type = formData.get('type') as string

  if (!name || !type) return { error: 'Name and type are required' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  // Get user's org
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id }
  })

  if (!dbUser?.organizationId) {
    return { error: 'No organization found' }
  }

  // Create Project in Prisma
  const project = await prisma.project.create({
    data: {
      name,
      type,
      status: 'active',
      userId: user.id,
      organizationId: dbUser.organizationId,
      // Create empty Brief and empty Stand automatically
      brief: { create: { data: {} } },
      stand: { create: {} }
    }
  })

  revalidatePath('/')
  redirect(`/projects/${project.id}`)
}
