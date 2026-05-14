import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend, ResponsiveContainer
} from 'recharts'

const COLORS = { positive: '#10b981', neutral: '#f59e0b', negative: '#ef4444' }

export default function SentimentCharts({ data, loading }) {
  if (loading) return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 flex items-center justify-center h-72">
      <div className="animate-pulse text-slate-400">Loading charts...</div>
    </div>
  )

  if (!data) return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 flex items-center justify-center h-72">
      <p className="text-slate-400 text-sm">No sentiment data yet</p>
    </div>
  )

  const { stats = {}, averageScore, totalAnalyzed } = data

  const barData = [
    { name: 'Positive', value: stats.positive || 0, fill: '#10b981' },
    { name: 'Neutral',  value: stats.neutral  || 0, fill: '#f59e0b' },
    { name: 'Negative', value: stats.negative || 0, fill: '#ef4444' },
  ]

  const pieData = barData.filter(d => d.value > 0)

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-slate-800">Sentiment Analysis</h2>
        <div className="text-right">
          <div className="text-sm text-slate-500">Avg Score</div>
          <div className="text-lg font-bold text-blue-600">{averageScore}</div>
        </div>
      </div>

      <div className="flex gap-4">
        {/* bar chart */}
        <div className="flex-1">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={barData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {barData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* pie chart */}
        <div className="w-40">
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%" cy="50%"
                innerRadius={35}
                outerRadius={60}
                dataKey="value"
              >
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="flex gap-3 mt-2">
        {barData.map(d => (
          <div key={d.name} className="flex items-center gap-1.5 text-xs text-slate-600">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.fill }} />
            {d.name}: <span className="font-semibold">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}