import { getConceptsForProject } from '@/lib/actions/concepts'
import { ConceptGenerator } from './ConceptGenerator'
import { ConceptCard } from './ConceptCard'

export default async function ConceptsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const concepts = await getConceptsForProject(id)

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h2 className="text-lg font-medium text-zinc-900">Concept Generation v1</h2>
        <p className="mt-1 text-sm text-zinc-500 max-w-3xl">
          Early-stage architectural concepts synthesized from your verified constraints, brief, and stand details.
        </p>
      </div>

      {concepts.length === 0 ? (
        <ConceptGenerator projectId={id} />
      ) : (
        <div>
          <div className="flex justify-end mb-6">
            <ConceptGenerator projectId={id} hasConcepts={true} />
          </div>
          <div className="space-y-8">
            {concepts.map((concept) => (
              <ConceptCard key={concept.id} concept={concept} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
