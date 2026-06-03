'use server';


import { prisma } from '../prisma';
import { revalidatePath } from 'next/cache';
import { requireUserProjectAccess } from '../auth-helpers';

export async function getStandDetails(projectId: string) {
  try {
    await requireUserProjectAccess(projectId);

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { stand: true }
    });

    if (!project) {
      throw new Error('Project not found');
    }

    return { success: true, stand: project.stand };
  } catch (error: unknown) {
    console.error('Failed to get stand details:', error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

export async function upsertStandDetails(projectId: string, data: Omit<Partial<import('@prisma/client').Stand>, 'id' | 'projectId' | 'geometryJson' | 'sourceDocumentIds'>) {
  try {
    await requireUserProjectAccess(projectId);

    const stand = await prisma.stand.upsert({
      where: { projectId },
      update: data,
      create: {
        ...data,
        projectId
      }
    });

    revalidatePath(`/projects/${projectId}/stand`);
    revalidatePath(`/projects/${projectId}`);
    
    return { success: true, stand };
  } catch (error: unknown) {
    console.error('Failed to upsert stand details:', error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}
