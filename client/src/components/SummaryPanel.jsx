export default function SummaryPanel({ data }) {
  if (!data) return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 h-full flex items-center justify-center">
      <p className="text-slate-400 text-sm text-center">No summary yet</p>
    </div>
  )

  const { summary, topics = [] } = data

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 h-full">
      <h2 className="font-semibold text-slate-800 mb-3">AI Summary</h2>

      <div className="bg-blue-50 rounded-lg p-4 mb-4">
        <p className="text-sm text-slate-700 leading-relaxed">
          {summary || 'Summary not yet generated. Submit and process comments first.'}
        </p>
      </div>

      {topics.length > 0 && (
        <>
          <h3 className="font-medium text-slate-700 mb-2 text-sm">Key Themes</h3>
          <div className="space-y-2">
            {topics.map((topic, i) => (
              <div key={i} className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs font-semibold text-slate-700 mb-1">{topic.label}</p>
                <div className="flex flex-wrap gap-1">
                  {topic.keywords?.slice(0, 5).map(kw => (
                    <span key={kw} className="text-xs bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded-full">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}