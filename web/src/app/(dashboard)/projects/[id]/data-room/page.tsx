import { uploadDocument } from "@/lib/actions/documents";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";

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
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-light tracking-tight text-white">Data Room</h1>
      <p className="text-zinc-400">Upload your zoning certificates, architectural guidelines, and surveyor diagrams here. Our AI will automatically extract the core rules and constraints.</p>

      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8 backdrop-blur-sm">
        <form action={handleUpload} className="flex flex-col space-y-4 items-start">
          <input 
            type="file" 
            name="file" 
            accept="application/pdf"
            required 
            className="text-zinc-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-zinc-800 file:text-white hover:file:bg-zinc-700"
          />
          <Button type="submit" variant="default" className="bg-white text-black hover:bg-zinc-200">
            Upload & Process PDF
          </Button>
        </form>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-medium text-white">Uploaded Documents</h2>
        {documents.length === 0 ? (
          <p className="text-zinc-500">No documents uploaded yet.</p>
        ) : (
          <div className="grid gap-4">
            {documents.map(doc => {
              const relatedJob = aiJobs.find(job => job.documentId === doc.id);
              return (
                <div key={doc.id} className="flex flex-col bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-medium text-white">{doc.name}</p>
                      <p className="text-sm text-zinc-500">Status: {doc.status}</p>
                      {doc.chunks.length > 0 && (
                        <p className="text-xs text-zinc-400 mt-1">{doc.chunks.length} chunks extracted</p>
                      )}
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                      {relatedJob && (
                        <>
                          <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                            relatedJob.status === 'completed' ? 'bg-green-500/10 text-green-400' :
                            relatedJob.status === 'failed' ? 'bg-red-500/10 text-red-400' :
                            'bg-blue-500/10 text-blue-400'
                          }`}>
                            AI: {relatedJob.status.toUpperCase()}
                          </span>
                          {relatedJob.errorLog && (
                            <p className="text-xs text-red-400 max-w-[200px] truncate">{relatedJob.errorLog}</p>
                          )}
                          {relatedJob.status === 'failed' && (
                            <Button variant="outline" size="sm" className="h-7 text-xs border-zinc-700 text-zinc-300 hover:text-white">
                              Retry Processing
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  {doc.chunks.length > 0 && (
                    <details className="border-t border-zinc-800 p-4">
                      <summary className="text-sm text-zinc-400 cursor-pointer hover:text-white">View Extracted Chunks</summary>
                      <div className="mt-4 space-y-4 max-h-96 overflow-y-auto pr-2">
                        {doc.chunks.map((chunk) => (
                          <div key={chunk.id} className="p-3 bg-black/40 rounded border border-zinc-800/50">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-xs text-zinc-500">Page {chunk.pageRef}</span>
                              {chunk.classification && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300">
                                  {chunk.classification}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-zinc-300 whitespace-pre-wrap font-mono line-clamp-4 hover:line-clamp-none">
                              {chunk.text}
                            </p>
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  );
}
