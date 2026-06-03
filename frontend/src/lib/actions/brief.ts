'use server'

import { prisma } from '@/lib/prisma'
import { BriefSchema, BriefData } from '../validations/brief'
import { revalidatePath } from 'next/cache'

export async function getBriefForProject(projectId: string) {
  const brief = await prisma.brief.findUnique({
    where: { projectId }
  })
  
  if (!brief) return null

  // Safely parse the JSON data from DB
  const parsed = BriefSchema.safeParse(brief.data)
  if (parsed.success) {
    return parsed.data
  }

  // If there's invalid old data, return partial or empty
  return null
}

import { Prisma } from '@prisma/client'

export async function upsertBrief(projectId: string, data: BriefData) {
  const parsed = BriefSchema.safeParse(data)
  
  if (!parsed.success) {
    throw new Error('Invalid brief data format')
  }

  const savedBrief = await prisma.brief.upsert({
    where: { projectId },
    create: {
      projectId,
      data: parsed.data as unknown as Prisma.InputJsonValue
    },
    update: {
      data: parsed.data as unknown as Prisma.InputJsonValue
    }
  })

  // Revalidate the brief page so the new data shows up
  try { revalidatePath(`/projects/${projectId}/brief`) } catch {}

  return savedBrief
}
