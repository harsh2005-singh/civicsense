const sentimentColors = {
  positive: 'bg-emerald-100 text-emerald-700',
  neutral:  'bg-yellow-100 text-yellow-700',
  negative: 'bg-red-100 text-red-700',
}

export default function CommentsTable({ comments }) {
  if (!comments || comments.length === 0) return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 flex items-center justify-center h-full">
      <p className="text-slate-400 text-sm">No analyzed comments yet</p>
    </div>
  )

  return (
    <div className="bg-white rounded-xl border border-slate-200 h-full overflow-hidden flex flex-col">
      <div className="px-6 py-4 border-b border-slate-200">
        <h2 className="font-semibold text-slate-800">Analyzed Comments</h2>
        <p className="text-xs text-slate-500 mt-0.5">{comments.length} comments processed</p>
      </div>

      <div className="overflow-y-auto flex-1">
        {comments.map(comment => (
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
        ))}
      </div>
    </div>
  )
}