'use client'

import { useState } from 'react'
import { extractIntelligence } from '@/app/actions/intelligence'
import { Button } from '@/components/ui/button'

type Extraction = {
  id: string
  fieldKey: string
  label: string
  category: string
  value: string
  unit: string | null
  sourceText: string
  confidence: number
  verified: boolean
}

type AIJob = {
  id: string
  status: string
  errorLog: string | null
  createdAt: Date
}

type DocumentWithJob = {
  id: string
  fileName: string
  status: string
  intelligenceJob?: AIJob
  extractions: Extraction[]
}

export function IntelligenceClient({ 
  projectId, 
  documents 
}: { 
  projectId: string, 
  documents: DocumentWithJob[] 
}) {
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set())

  const handleExtract = async (documentId: string) => {
    setLoadingIds(prev => new Set(prev).add(documentId))
    await extractIntelligence(projectId, documentId)
    // We don't remove from loadingIds immediately because we want the UI to reflect the 'pending'/'running' job status from the server
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-medium text-zinc-900">Extracted Intelligence</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Run Gemini on classified document chunks to extract structured constraints.
        </p>
      </div>

      {documents.length === 0 ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm text-zinc-500">No documents found in this project.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {documents.map((doc) => {
            const isExtracting = doc.intelligenceJob?.status === 'pending' || doc.intelligenceJob?.status === 'running' || loadingIds.has(doc.id)
            const hasJob = !!doc.intelligenceJob
            const jobFailed = doc.intelligenceJob?.status === 'failed'

            return (
              <div key={doc.id} className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-zinc-100 bg-zinc-50/50 p-4">
                  <div>
                    <h3 className="text-sm font-medium text-zinc-900">{doc.fileName}</h3>
                    <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500">
                      <span>Doc Status: {doc.status}</span>
                      {hasJob && (
                        <>
                          <span>&bull;</span>
                          <span className={`font-medium ${
                            doc.intelligenceJob?.status === 'completed' ? 'text-emerald-600' :
                            jobFailed ? 'text-red-600' : 'text-blue-600'
                          }`}>
                            Job: {doc.intelligenceJob?.status}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <Button 
                    onClick={() => handleExtract(doc.id)} 
                    disabled={isExtracting}
                    variant="outline"
                    size="sm"
                  >
                    {isExtracting ? 'Extracting...' : 'Extract Intelligence'}
                  </Button>
                </div>

                {/* Error Log */}
                {jobFailed && doc.intelligenceJob?.errorLog && (
                  <div className="bg-red-50 p-4 text-xs text-red-600 border-b border-red-100">
                    <span className="font-semibold">Error: </span>{doc.intelligenceJob.errorLog}
                  </div>
                )}

                {/* Extractions Grid */}
                <div className="p-4">
                  {doc.extractions.length === 0 ? (
                    <div className="text-center py-6 text-sm text-zinc-400">
                      {isExtracting ? 'Analyzing document with Gemini...' : 'No data extracted yet. Click the button above to begin.'}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {doc.extractions.map(ext => (
                        <div key={ext.id} className="rounded-lg border border-zinc-200 p-4 relative">
                          {/* Unverified Badge */}
                          {!ext.verified && (
                            <span className="absolute top-3 right-3 rounded bg-orange-100 px-1.5 py-0.5 text-[10px] font-medium text-orange-700">
                              Unverified
                            </span>
                          )}
                          <div className="text-xs font-medium text-zinc-500 mb-1">{ext.category} &bull; {ext.label}</div>
                          <div className="text-lg font-semibold text-zinc-900">
                            {ext.value} {ext.unit && <span className="text-sm font-normal text-zinc-500">{ext.unit}</span>}
                          </div>
                          
                          <div className="mt-3 pt-3 border-t border-zinc-100">
                            <div className="text-[10px] font-medium text-zinc-400 mb-1 uppercase tracking-wider">Source Snippet</div>
                            <p className="text-xs text-zinc-600 italic line-clamp-3 bg-zinc-50 p-2 rounded">
                              &quot;{ext.sourceText}&quot;
                            </p>
                          </div>
                          
                          <div className="mt-3 flex justify-between items-center text-[10px] text-zinc-400">
                            <span>Conf: {Math.round(ext.confidence * 100)}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
