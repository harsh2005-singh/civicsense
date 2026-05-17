import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useBills, useSentiment, useKeywords, useSummary, useComments } from '../api/hooks'
import SentimentCharts from '../components/SentimentCharts'
import WordCloudView from '../components/WordCloudView'
import SummaryPanel from '../components/SummaryPanel'
import CommentsTable from '../components/CommentsTable'
import BillTimeline from '../components/BillTimeline'

export default function Analysis() {
  const [searchParams] = useSearchParams()
  const [selectedBill, setSelectedBill] = useState(searchParams.get('billId') || '')

  const { data: billsData } = useBills()
  const bills = billsData?.bills || []

  const { data: sentimentData, isLoading: loadingSentiment } = useSentiment(selectedBill)
  const { data: keywordsData, isLoading: loadingKeywords } = useKeywords(selectedBill)
  const { data: summaryData } = useSummary(selectedBill)
  const { data: commentsData } = useComments(selectedBill)

  const comments = commentsData?.comments || []
  const completedComments = comments.filter(c => c.status === 'completed')

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* top bar with selector + PDF button */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Analysis</h1>
            <p className="text-slate-500 mt-1">AI-generated insights per bill</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={selectedBill}
              onChange={e => setSelectedBill(e.target.value)}
              className="px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white min-w-64"
            >
              <option value="">-- Select a bill to analyze --</option>
              {bills.map(b => (
                <option key={b._id} value={b._id}>{b.title}</option>
              ))}
            </select>

            {selectedBill && (
              <button
                onClick={() => {
                  const token = localStorage.getItem('token')
                  window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/reports/export?billId=${selectedBill}&token=${token}`, '_blank')
                }}
                className="bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition text-sm font-medium"
              >
                ⬇ Download PDF
              </button>
            )}
          </div>
        </div>

        {!selectedBill && (
          <div className="bg-white rounded-xl border border-slate-200 p-16 text-center">
            <div className="text-5xl mb-4">📊</div>
            <p className="text-lg font-medium text-slate-700">Select a bill to view analysis</p>
            <p className="text-slate-400 text-sm mt-1">Sentiment, keywords, summary and comments will appear here</p>
          </div>
        )}

        {selectedBill && (
          <>
            <BillTimeline billId={selectedBill} />
            <div className="grid grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Total Comments', value: comments.length, color: 'bg-blue-600' },
                { label: 'Analyzed', value: completedComments.length, color: 'bg-green-500' },
                { label: 'Positive', value: sentimentData?.stats?.positive || 0, color: 'bg-emerald-500' },
                { label: 'Negative', value: sentimentData?.stats?.negative || 0, color: 'bg-red-500' },
              ].map(stat => (
                <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
                  <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center`}>
                    <span className="text-white font-bold text-sm">{stat.value}</span>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-slate-800">{stat.value}</div>
                    <div className="text-xs text-slate-500">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <SentimentCharts data={sentimentData} loading={loadingSentiment} />
              <WordCloudView data={keywordsData} loading={loadingKeywords} />
            </div>

            <div className="grid grid-cols-5 gap-6 mb-6">
              <div className="col-span-2">
                <SummaryPanel data={summaryData} />
              </div>
              <div className="col-span-3">
                <CommentsTable comments={completedComments} billId={selectedBill} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}