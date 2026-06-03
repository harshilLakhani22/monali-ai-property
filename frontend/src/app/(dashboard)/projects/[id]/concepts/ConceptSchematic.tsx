import { ConceptV1 } from '@/lib/validations/concept'

export function ConceptSchematic({ data }: { data: ConceptV1 }) {
  const footprint = data.footprintLogic?.toLowerCase() || ''
  const isLShape = footprint.includes('l-shape')
  const isCourtyard = footprint.includes('courtyard')

  return (
    <div className="relative w-full min-h-[350px] bg-zinc-50 rounded-xl border border-zinc-200 overflow-hidden font-sans flex items-center justify-center p-6">
      
      {/* Background Grid */}
      <div className="absolute inset-0 z-0 opacity-[0.15] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#52525b 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

      {/* Diagram Container */}
      <div className="relative z-10 w-full max-w-2xl aspect-[16/9] border-2 border-dashed border-zinc-300 rounded-xl flex items-center justify-center bg-white/40 p-8 shadow-sm">
        
        {/* Site Boundary Label */}
        <div className="absolute top-2 left-3 text-[10px] font-medium text-zinc-400 uppercase tracking-wider">
          Site Boundary
        </div>

        {/* Road Access Label */}
        <div className="absolute bottom-0 inset-x-0 h-10 border-t-2 border-dashed border-zinc-300 bg-zinc-100/80 flex items-center justify-center rounded-b-xl">
          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
            Road Access: {data.siteResponse.access}
          </span>
        </div>

        {/* Blocks Rendering based on footprint */}
        <div className="relative w-full max-w-md h-full mb-8 flex">
          {isCourtyard ? (
             <div className="w-full h-full border-4 border-zinc-800 bg-white rounded-lg relative flex flex-col justify-between shadow-md">
                <div className="w-full h-[40%] border-b-2 border-zinc-200 flex items-center justify-center bg-zinc-50">
                   <span className="text-xs font-bold text-zinc-600 uppercase tracking-wide">Living / Dining</span>
                </div>
                <div className="w-full flex-1 flex justify-between">
                   <div className="w-1/3 h-full border-r-2 border-zinc-200 flex items-center justify-center bg-zinc-50">
                      <span className="text-xs font-bold text-zinc-600 uppercase -rotate-90 tracking-wide">Bedrooms</span>
                   </div>
                   <div className="flex-1 flex items-center justify-center bg-green-50/50 border-x-2 border-dashed border-green-200">
                      <span className="text-xs font-bold text-green-700 uppercase tracking-wide text-center">Courtyard<br/><span className="text-[9px] font-medium">Patio / Garden</span></span>
                   </div>
                   <div className="w-1/3 h-full border-l-2 border-zinc-200 flex items-center justify-center bg-zinc-100">
                      <span className="text-xs font-bold text-zinc-500 uppercase tracking-wide text-center">Entry<br/>Garage</span>
                   </div>
                </div>
             </div>
          ) : isLShape ? (
             <div className="w-full h-full relative pt-4 pl-4">
                <div className="absolute inset-0 top-4 left-4 bg-green-50/50 border-2 border-dashed border-green-300 rounded-lg flex items-start justify-end p-4">
                   <span className="text-xs font-bold text-green-700 uppercase tracking-wide">Garden / Patio</span>
                </div>
                <div className="absolute top-0 left-0 bottom-12 w-[35%] border-4 border-zinc-800 bg-white rounded-lg flex items-center justify-center shadow-md">
                   <span className="text-xs font-bold text-zinc-600 uppercase tracking-wide -rotate-90">Bedrooms</span>
                </div>
                <div className="absolute bottom-0 left-0 right-8 h-[35%] border-4 border-zinc-800 bg-white rounded-lg flex items-center justify-center flex-col shadow-md">
                   <span className="text-xs font-bold text-zinc-600 uppercase tracking-wide">Living & Entry</span>
                   <span className="text-[10px] text-zinc-400 mt-1 font-medium">Garage Integration</span>
                </div>
             </div>
          ) : (
             <div className="w-full h-full relative flex items-center justify-center">
                <div className="absolute top-8 inset-x-8 bottom-12 border-4 border-zinc-800 bg-white rounded-lg flex flex-col shadow-md overflow-hidden">
                   <div className="w-full h-1/2 border-b-2 border-zinc-100 flex items-center justify-center bg-zinc-50/50">
                      <span className="text-xs font-bold text-zinc-600 uppercase tracking-wide">Bedrooms</span>
                   </div>
                   <div className="w-full h-1/2 flex items-center justify-center bg-white">
                      <span className="text-xs font-bold text-zinc-800 uppercase tracking-wide">Living / Dining</span>
                   </div>
                </div>
                <div className="absolute bottom-6 right-16 w-24 h-16 border-2 border-zinc-400 bg-zinc-100 rounded flex items-center justify-center shadow-sm">
                   <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">Garage / Entry</span>
                </div>
                <div className="absolute top-2 inset-x-12 h-10 border-2 border-dashed border-green-400 bg-green-50/50 flex items-center justify-center rounded-lg">
                   <span className="text-[10px] font-bold text-green-700 uppercase tracking-wide">Patio / Views</span>
                </div>
             </div>
          )}
        </div>

        {/* North Arrow */}
        <div className="absolute top-4 right-4 flex flex-col items-center">
          <div className="w-8 h-8 rounded-full border-2 border-zinc-400 bg-white flex items-center justify-center relative shadow-sm">
            <div className="absolute top-[4px] w-0 h-0 border-l-[5px] border-r-[5px] border-b-[10px] border-transparent border-b-red-500"></div>
          </div>
          <span className="text-[10px] font-bold text-zinc-600 mt-1">N</span>
        </div>

      </div>

      {/* Floating Info Cards */}
      <div className="absolute top-4 left-4 max-w-[200px] flex flex-col gap-2 z-20">
        <div className="bg-white/95 backdrop-blur-sm border border-zinc-200 p-3 rounded-lg shadow-sm">
          <div className="text-[9px] font-bold text-zinc-800 uppercase mb-1.5 tracking-wider flex items-center gap-1.5">
            <svg className="w-3 h-3 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            Orientation & Views
          </div>
          <div className="text-[10px] text-zinc-600 leading-snug line-clamp-2" title={data.siteResponse.orientation}><span className="font-medium text-zinc-700">Sun:</span> {data.siteResponse.orientation}</div>
          <div className="text-[10px] text-zinc-600 leading-snug mt-1 line-clamp-2" title={data.siteResponse.views}><span className="font-medium text-zinc-700">Views:</span> {data.siteResponse.views}</div>
        </div>
      </div>

      <div className="absolute top-4 right-20 max-w-[200px] flex flex-col gap-2 z-20">
        {data.siteResponse.slope && data.siteResponse.slope.toLowerCase() !== 'flat' && data.siteResponse.slope.toLowerCase() !== 'none' && (
          <div className="bg-amber-50/95 backdrop-blur-sm border border-amber-200 p-3 rounded-lg shadow-sm">
            <div className="text-[9px] font-bold text-amber-800 uppercase mb-1.5 tracking-wider flex items-center gap-1.5">
              <svg className="w-3 h-3 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
              Slope Condition
            </div>
            <div className="text-[10px] text-amber-700 leading-snug line-clamp-2" title={data.siteResponse.slope}>{data.siteResponse.slope}</div>
          </div>
        )}
      </div>

      {/* Watermark */}
      <div className="absolute bottom-3 right-4 z-20">
        <span className="text-[9px] font-semibold text-zinc-400 uppercase tracking-widest bg-white/80 px-2.5 py-1.5 rounded-md border border-zinc-200/50 backdrop-blur-sm">
          Conceptual block layout – not final architectural drawing
        </span>
      </div>

    </div>
  )
}
