import { useState } from 'react'
import SearchFilter from './SearchFilter'

const sentimentColors = {
  positive: 'bg-emerald-100 text-emerald-700',
  neutral:  'bg-yellow-100 text-yellow-700',
  negative: 'bg-red-100 text-red-700',
}

export default function CommentsTable({ comments, billId }) {
  const [search, setSearch] = useState('')
  const [sentiment, setSentiment] = useState('')

  if (!comments || comments.length === 0) return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 flex items-center justify-center h-full">
      <p className="text-slate-400 text-sm">No analyzed comments yet</p>
    </div>
  )

  const filtered = comments.filter(c => {
    const matchSearch = search === '' || c.text.toLowerCase().includes(search.toLowerCase())
    const matchSentiment = sentiment === '' || c.sentimentLabel === sentiment
    return matchSearch && matchSentiment
  })

  const handleExportCSV = () => {
    const token = localStorage.getItem('token')
    window.open(`http://localhost:3001/api/analysis/export?billId=${billId}&token=${token}`, '_blank')
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 h-full overflow-hidden flex flex-col">
      <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-slate-800">Analyzed Comments</h2>
          <p className="text-xs text-slate-500 mt-0.5">{filtered.length} of {comments.length} shown</p>
        </div>
        {billId && (
          <button
            onClick={handleExportCSV}
            className="text-xs bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded-lg hover:bg-green-100 transition font-medium"
          >
            ⬇ Export CSV
          </button>
        )}
      </div>

      <div className="px-6 pt-3">
        <SearchFilter
          search={search} setSearch={setSearch}
          sentiment={sentiment} setSentiment={setSentiment}
        />
      </div>

      <div className="overflow-y-auto flex-1">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">No comments match your search</div>
        ) : (
          filtered.map(comment => (
            <div key={comment._id} className="px-6 py-3 border-b border-slate-100 hover:bg-slate-50">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm text-slate-700 flex-1 leading-relaxed">{comment.text}</p>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${sentimentColors[comment.sentimentLabel] || 'bg-slate-100 text-slate-600'}`}>
                    {comment.sentimentLabel || 'pending'}
                  </span>
                  {comment.sentimentScore && (
                    <span className="text-xs text-slate-400">
                      {(comment.sentimentScore * 100).toFixed(0)}%
                    </span>
                  )}
                </div>
              </div>
              {comment.keywords?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {comment.keywords.slice(0, 4).map(kw => (
                    <span key={kw.word} className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                      {kw.word}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}