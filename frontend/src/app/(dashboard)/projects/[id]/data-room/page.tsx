import { uploadDocument, deleteDocument } from "@/lib/actions/documents";
import { prisma } from "@/lib/prisma";
import { UploadZone } from "@/components/UploadZone";
import { PendingJobPoller } from "@/components/PendingJobPoller";
import { Button } from "@/components/ui/button";
import { DeleteDocumentButton } from "@/components/documents/DeleteDocumentButton";

export const dynamic = 'force-dynamic';

export default async function DataRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = await params;

  // Fetch documents and their related AI jobs
  const documents = await prisma.document.findMany({
    where: { projectId },
    orderBy: { status: 'desc' },
    include: {
      chunks: true
    }
  });

  const aiJobs = await prisma.aIJob.findMany({
    where: { projectId, type: 'extraction' },
    orderBy: { startedAt: 'desc' },
  });

  async function handleUpload(formData: FormData) {
    'use server';
    await uploadDocument(projectId, formData);
  }

  // NOTE: A real retry button would call a server action that recreates the AIJob and hits FastAPI.
  // For now, we'll just show it visually if job failed.

  const hasPendingJobs = aiJobs.some(job => job.status === 'pending');

  return (
    <div className="max-w-4xl space-y-8">
      <PendingJobPoller hasPendingJobs={hasPendingJobs} />

      <UploadZone action={handleUpload} />

      <div className="space-y-6 pt-6">
        <h2 className="text-xl font-semibold tracking-tight flex items-center gap-3">
          <span className="rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-medium bg-primary/10 text-primary">FILES</span>
          Uploaded Documents
        </h2>
        
        {documents.length === 0 ? (
          <p className="text-muted-foreground bg-card p-6 rounded-2xl border border-border text-center">No documents uploaded yet.</p>
        ) : (
          <div className="grid gap-4">
            {documents.map(doc => {
              const relatedJob = aiJobs.find(job => job.documentId === doc.id);
              return (
                <div key={doc.id} className="p-1 rounded-2xl bg-black/5 dark:bg-white/5 border border-border/50">
                  <div className="flex flex-col bg-card border border-border/50 rounded-[calc(1rem-0.25rem)] overflow-hidden shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 gap-4">
                      <div>
                        <p className="font-semibold text-foreground text-lg">{doc.name}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-sm font-medium text-muted-foreground capitalize">Status: {doc.status}</span>
                          {doc.chunks.length > 0 && (
                            <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">{doc.chunks.length} chunks extracted</span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col sm:items-end gap-2">
                        {relatedJob && (
                          <>
                            <span className={`inline-block px-3 py-1.5 text-xs font-semibold rounded-full ${
                              relatedJob.status === 'completed' ? 'bg-green-500/10 text-green-600 dark:text-green-400' :
                              relatedJob.status === 'failed' ? 'bg-destructive/10 text-destructive' :
                              'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                            }`}>
                              AI: {relatedJob.status.toUpperCase()}
                            </span>
                            {relatedJob.message && relatedJob.status !== 'completed' && relatedJob.status !== 'failed' && (
                              <p className="text-[10px] uppercase font-bold tracking-widest text-blue-500 animate-pulse mt-1.5">{relatedJob.message}</p>
                            )}
                            {relatedJob.errorLog && (
                              <p className="text-xs text-destructive max-w-[200px] truncate">{relatedJob.errorLog}</p>
                            )}
                            {relatedJob.status === 'failed' && (
                              <Button variant="outline" size="sm" className="h-8 text-xs rounded-full">
                                Retry Processing
                              </Button>
                            )}
                          </>
                        )}
                        <form action={async () => {
                          'use server';
                          await deleteDocument(doc.id, projectId);
                        }}>
                          <DeleteDocumentButton />
                        </form>
                      </div>
                    </div>
                    {doc.chunks.length > 0 && (
                      <details className="border-t border-border/50 p-5 group">
                        <summary className="text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors outline-none list-none flex items-center gap-2">
                          <svg className="w-4 h-4 transition-transform group-open:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                          View Extracted Chunks
                        </summary>
                        <div className="mt-6 space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                          {doc.chunks.map((chunk) => (
                            <div key={chunk.id} className="p-4 bg-black/5 dark:bg-white/5 rounded-xl border border-border/50">
                              <div className="flex justify-between items-center mb-3">
                                <span className="text-xs font-medium text-muted-foreground">Page {chunk.pageRef}</span>
                                {chunk.classification && (
                                  <span className="text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full bg-background border border-border text-foreground font-semibold">
                                    {chunk.classification}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-foreground/80 whitespace-pre-wrap font-mono line-clamp-4 hover:line-clamp-none transition-all">
                                {chunk.text}
                              </p>
                            </div>
                          ))}
                        </div>
                      </details>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  );
}
