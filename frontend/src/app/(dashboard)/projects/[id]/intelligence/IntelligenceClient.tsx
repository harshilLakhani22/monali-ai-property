'use client'

import { useState } from 'react'
import { extractIntelligence, verifyExtraction, rejectExtraction, updateExtraction } from '@/app/actions/intelligence'
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
  rejected: boolean
  editedValue: string | null
  editedUnit: string | null
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
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<{ value: string, unit: string }>({ value: '', unit: '' })
  const [actionLoading, setActionLoading] = useState<Set<string>>(new Set())

  const handleExtract = async (documentId: string) => {
    setLoadingIds(prev => new Set(prev).add(documentId))
    await extractIntelligence(projectId, documentId)
  }

  const handleVerify = async (id: string) => {
    setActionLoading(prev => new Set(prev).add(id))
    await verifyExtraction(id, projectId)
    setActionLoading(prev => { const n = new Set(prev); n.delete(id); return n })
  }

  const handleReject = async (id: string) => {
    setActionLoading(prev => new Set(prev).add(id))
    await rejectExtraction(id, projectId, 'User rejected')
    setActionLoading(prev => { const n = new Set(prev); n.delete(id); return n })
  }

  const startEdit = (ext: Extraction) => {
    setEditingId(ext.id)
    setEditValues({
      value: ext.editedValue ?? ext.value,
      unit: ext.editedUnit ?? ext.unit ?? ''
    })
  }

  const saveEdit = async (id: string) => {
    setActionLoading(prev => new Set(prev).add(id))
    await updateExtraction(id, projectId, {
      value: editValues.value,
      unit: editValues.unit || undefined
    })
    setEditingId(null)
    setActionLoading(prev => { const n = new Set(prev); n.delete(id); return n })
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-medium text-zinc-900">Extracted Intelligence</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Review AI-extracted constraints. Edit or verify them to create project constraints.
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
                      {doc.extractions.map(ext => {
                        const isEditing = editingId === ext.id
                        const isLoading = actionLoading.has(ext.id)
                        const finalValue = ext.editedValue ?? ext.value
                        const finalUnit = ext.editedUnit ?? ext.unit

                        return (
                          <div key={ext.id} className={`rounded-lg border p-4 relative transition-colors ${
                            ext.rejected ? 'bg-zinc-50 border-zinc-100 opacity-60' :
                            ext.verified ? 'bg-emerald-50/30 border-emerald-100' :
                            'bg-white border-zinc-200'
                          }`}>
                            {/* Badges */}
                            <div className="absolute top-3 right-3 flex gap-2">
                              {ext.rejected ? (
                                <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-600">Rejected</span>
                              ) : ext.verified ? (
                                <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700">Verified</span>
                              ) : (
                                <span className="rounded bg-orange-100 px-1.5 py-0.5 text-[10px] font-medium text-orange-700">Unverified</span>
                              )}
                            </div>

                            <div className="text-xs font-medium text-zinc-500 mb-1">{ext.category} &bull; {ext.label}</div>
                            
                            {/* Editing / Display */}
                            {isEditing ? (
                              <div className="mt-2 flex items-center gap-2">
                                <input 
                                  className="w-20 border border-zinc-300 rounded px-2 py-1 text-sm text-zinc-900"
                                  value={editValues.value}
                                  onChange={e => setEditValues({...editValues, value: e.target.value})}
                                />
                                <input 
                                  className="w-16 border border-zinc-300 rounded px-2 py-1 text-sm text-zinc-900"
                                  value={editValues.unit}
                                  onChange={e => setEditValues({...editValues, unit: e.target.value})}
                                  placeholder="unit"
                                />
                                <Button size="sm" variant="default" onClick={() => saveEdit(ext.id)} disabled={isLoading}>Save</Button>
                                <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} disabled={isLoading}>Cancel</Button>
                              </div>
                            ) : (
                              <div className="text-lg font-semibold text-zinc-900 group flex items-center gap-2">
                                {finalValue} {finalUnit && <span className="text-sm font-normal text-zinc-500">{finalUnit}</span>}
                                {!ext.verified && !ext.rejected && (
                                  <button onClick={() => startEdit(ext)} className="text-xs text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">Edit</button>
                                )}
                              </div>
                            )}

                            {/* Source */}
                            <div className="mt-3 pt-3 border-t border-zinc-100">
                              <div className="text-[10px] font-medium text-zinc-400 mb-1 uppercase tracking-wider">Source Snippet</div>
                              <p className="text-xs text-zinc-600 italic line-clamp-3 bg-zinc-50 p-2 rounded">
                                &quot;{ext.sourceText}&quot;
                              </p>
                            </div>
                            
                            {/* Actions Footer */}
                            <div className="mt-4 flex justify-between items-center text-[10px] text-zinc-400">
                              <span>Conf: {Math.round(ext.confidence * 100)}%</span>
                              
                              <div className="flex gap-2">
                                {ext.rejected ? (
                                  <Button size="sm" variant="outline" className="h-6 text-xs px-2" onClick={() => handleVerify(ext.id)} disabled={isLoading}>Verify Instead</Button>
                                ) : ext.verified ? (
                                  <Button size="sm" variant="outline" className="h-6 text-xs px-2" onClick={() => handleReject(ext.id)} disabled={isLoading}>Revoke</Button>
                                ) : (
                                  <>
                                    <Button size="sm" variant="outline" className="h-6 text-xs px-2 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleReject(ext.id)} disabled={isLoading || isEditing}>Reject</Button>
                                    <Button size="sm" variant="default" className="h-6 text-xs px-2 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleVerify(ext.id)} disabled={isLoading || isEditing}>Verify</Button>
                                  </>
                                )}
                              </div>
                            </div>

                          </div>
                        )
                      })}
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
