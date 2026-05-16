import { useQuery } from '@tanstack/react-query'
import api from '../api/axios'

export default function BillTimeline({ billId }) {
  const { data } = useQuery({
    queryKey: ['timeline', billId],
    queryFn: () => api.get(`/bills/${billId}/timeline`).then(r => r.data),
    enabled: !!billId,
  })

  const timeline = data?.timeline || []

  if (timeline.length === 0) return null

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
      <h2 className="font-semibold text-slate-800 mb-4">Bill Status Timeline</h2>
      <div className="flex items-center gap-0">
        {timeline.map((item, i) => (
          <div key={item.status} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                item.current
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : item.completed
                  ? 'bg-green-500 border-green-500 text-white'
                  : 'bg-white border-slate-300 text-slate-400'
              }`}>
                {item.completed ? '✓' : i + 1}
              </div>
              <span className={`text-xs mt-1 font-medium ${
                item.current ? 'text-blue-600' :
                item.completed ? 'text-green-600' : 'text-slate-400'
              }`}>
                {item.label}
              </span>
            </div>
            {i < timeline.length - 1 && (
              <div className={`h-0.5 flex-1 -mt-4 ${item.completed ? 'bg-green-400' : 'bg-slate-200'}`} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}