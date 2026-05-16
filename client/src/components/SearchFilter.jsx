export default function SearchFilter({ search, setSearch, sentiment, setSentiment }) {
  return (
    <div className="flex gap-3 mb-4">
      <input
        type="text"
        placeholder="Search comments..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
      />
      <select
        value={sentiment}
        onChange={e => setSentiment(e.target.value)}
        className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
      >
        <option value="">All Sentiments</option>
        <option value="positive">Positive</option>
        <option value="neutral">Neutral</option>
        <option value="negative">Negative</option>
      </select>
    </div>
  )
}