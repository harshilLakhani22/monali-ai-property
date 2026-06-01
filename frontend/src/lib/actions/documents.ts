'use server';

import { createClient } from '../supabase/server';
import { prisma } from '../prisma';
import { revalidatePath } from 'next/cache';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export async function uploadDocument(projectId: string, formData: FormData) {
  try {
    const file = formData.get('file') as File;
    if (!file) {
      throw new Error('No file provided');
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error('Not authenticated');
    }

    // 1. Upload to Supabase Storage (documents bucket)
    const timestamp = Date.now();
    const filePath = `${projectId}/${timestamp}_${file.name}`;
    
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    // 2. Generate a Signed URL (valid for 15 minutes = 900 seconds)
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from('documents')
      .createSignedUrl(filePath, 900);

    if (signedUrlError || !signedUrlData) {
      throw new Error(`Failed to generate signed URL: ${signedUrlError?.message}`);
    }

    // 3. Create Document Record
    const document = await prisma.document.create({
      data: {
        projectId,
        name: file.name,
        type: 'unknown', // We will classify later, or derive from name
        url: filePath, // Storing the path, not the signed URL, since signed URLs expire
        status: 'processing',
      }
    });

    // 4. Create AIJob Record
    await prisma.aIJob.create({
      data: {
        projectId,
        documentId: document.id,
        type: 'extraction',
        status: 'pending',
      }
    });

    // 5. Ping FastAPI backend
    try {
      const response = await fetch(`${API_URL}/documents/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          document_id: document.id,
          project_id: projectId,
          file_url: signedUrlData.signedUrl,
        }),
      });

      if (!response.ok) {
        console.error('FastAPI returned error:', await response.text());
        // We don't throw here, we let the job stay pending/failed so the user sees it in the UI
      }
    } catch (apiError) {
      console.error('Failed to ping FastAPI:', apiError);
    }

    revalidatePath(`/projects/${projectId}/data-room`);
    
    return { success: true, document };
  } catch (error: unknown) {
    console.error('Document upload error:', error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}
