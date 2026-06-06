'use server';


import { prisma } from '../prisma';
import { revalidatePath } from 'next/cache';
import { requireUserProjectAccess } from '../auth-helpers';
import { generateObject } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { z } from 'zod';

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

export async function suggestSiteDetails(projectId: string) {
  try {
    await requireUserProjectAccess(projectId);
    
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return { success: false, error: 'AI provider not configured (Missing Gemini Key). Vertex AI transition is planned for Phase 11/12.' };
    }

    const constraints = await prisma.constraint.findMany({ 
      where: { projectId },
      include: { extraction: true }
    });
    const extractions = await prisma.extraction.findMany({ 
      where: { projectId, rejected: false } 
    });

    if (constraints.length === 0 && extractions.length === 0) {
      return { success: false, error: 'No documents processed or verified constraints found yet.' };
    }

    const genAI = createGoogleGenerativeAI({ apiKey });
    const modelName = process.env.GOOGLE_GENERATIVE_AI_MODEL || 'gemini-2.5-flash';
    const model = genAI(modelName);

    const schema = z.object({
      suggestions: z.array(z.object({
        field: z.enum(['erfNumber', 'standArea', 'roadAccessSide', 'slopeCondition', 'contourNotes', 'siteRisks', 'viewDirection', 'privacyNotes', 'latitude', 'longitude', 'googlePinUrl']),
        suggestedValue: z.any().describe('The mapped value appropriate for the form input. (e.g. number for standArea, string for roadAccessSide)'),
        sourceType: z.enum(['Constraint', 'Extraction']),
        snippet: z.string().optional().describe('Brief snippet or reason from the source data supporting this suggestion.'),
        confidence: z.number().optional().describe('Confidence percentage (1-100)')
      }))
    });

    const prompt = `You are an architectural assistant mapping raw intelligence to a Stand Details form.
    Review the following trusted CONSTRAINTS and untrusted EXTRACTIONS to suggest form fields.
    Constraints are human-verified and MUST be prioritized. Extractions are candidate suggestions only.
    Map only what you can find clearly. Do not guess.
    
    Fields you can suggest:
    - erfNumber (string, e.g. "1234")
    - standArea (number, in sqm)
    - roadAccessSide (string, e.g. "North", "South")
    - slopeCondition (string, e.g. "Flat", "Steep")
    - contourNotes (string)
    - siteRisks (string)
    - viewDirection (string)
    - privacyNotes (string)
    - latitude (number)
    - longitude (number)
    - googlePinUrl (string)

    CONSTRAINTS:
    ${JSON.stringify(constraints.map(c => ({ label: c.extraction?.label || c.type, value: c.value, unit: c.extraction?.unit, source: c.extraction?.sourceText })), null, 2)}

    EXTRACTIONS:
    ${JSON.stringify(extractions.map(e => ({ label: e.label, value: e.value, unit: e.unit, source: e.sourceText, verified: e.verified })), null, 2)}
    `;

    const result = await generateObject({
      model,
      schema,
      prompt,
      temperature: 0.2
    });

    return { success: true, suggestions: result.object.suggestions };
  } catch (error: unknown) {
    console.error('Failed to auto-suggest site details:', error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}
