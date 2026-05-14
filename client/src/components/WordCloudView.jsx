import { useEffect, useRef } from 'react'

export default function WordCloudView({ data, loading }) {
  if (loading) return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 flex items-center justify-center h-72">
      <div className="animate-pulse text-slate-400">Loading word cloud...</div>
    </div>
  )

  const keywords = data?.keywords || []

  if (keywords.length === 0) return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 flex items-center justify-center h-72">
      <p className="text-slate-400 text-sm">No keywords yet — submit comments first</p>
    </div>
  )

  // sort by weight
  const sorted = [...keywords].sort((a, b) => b.weight - a.weight)
  const max = sorted[0]?.weight || 1

  const colors = ['#2563eb', '#7c3aed', '#0891b2', '#059669', '#d97706', '#dc2626', '#db2777']

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h2 className="font-semibold text-slate-800 mb-4">Keyword Word Cloud</h2>

      {/* manual word cloud using flex wrap */}
      <div className="flex flex-wrap gap-2 items-center justify-center min-h-40 p-4 bg-slate-50 rounded-lg">
        {sorted.slice(0, 30).map((kw, i) => {
          const size = 12 + Math.round((kw.weight / max) * 28)
          const color = colors[i % colors.length]
          return (
            <span
              key={kw.word}
              style={{ fontSize: size, color, fontWeight: size > 28 ? 700 : size > 20 ? 600 : 400 }}
              className="cursor-default hover:opacity-70 transition"
              title={`Weight: ${(kw.weight * 100).toFixed(0)}`}
            >
              {kw.word}
            </span>
          )
        })}
      </div>

      {/* top keywords chips */}
      <div className="mt-3 flex flex-wrap gap-2">
        {sorted.slice(0, 8).map(kw => (
          <span
            key={kw.word}
            className="text-xs px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full font-medium"
          >
            {kw.word} ({(kw.weight * 100).toFixed(0)})
          </span>
        ))}
      </div>
    </div>
  )
}