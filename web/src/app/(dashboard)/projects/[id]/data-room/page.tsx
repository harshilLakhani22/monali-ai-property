import { uploadDocument } from "@/lib/actions/documents";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";

export default async function DataRoomPage({ params }: { params: { id: string } }) {
  const projectId = params.id;

  // Fetch documents and their related AI jobs
  const documents = await prisma.document.findMany({
    where: { projectId },
    orderBy: { status: 'desc' },
  });

  const aiJobs = await prisma.aIJob.findMany({
    where: { projectId, type: 'extraction' },
    orderBy: { startedAt: 'desc' },
  });

  async function handleUpload(formData: FormData) {
    'use server';
    await uploadDocument(projectId, formData);
  }

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
                <div key={doc.id} className="flex items-center justify-between p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
                  <div>
                    <p className="font-medium text-white">{doc.name}</p>
                    <p className="text-sm text-zinc-500">Status: {doc.status}</p>
                  </div>
                  <div className="text-right">
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
                          <p className="text-xs text-red-400 mt-1 max-w-[200px] truncate">{relatedJob.errorLog}</p>
                        )}
                      </>
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
