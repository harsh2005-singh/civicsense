import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../api/axios'
import SentimentCharts from '../components/SentimentCharts'
import WordCloudView from '../components/WordCloudView'
import SummaryPanel from '../components/SummaryPanel'
import CommentsTable from '../components/CommentsTable'

// paste your demo bill ID here after running the seed script
const DEMO_BILL_ID = '6a08df0f074535d148c2046e'

export default function Demo() {
  const { data: sentimentData, isLoading: loadingSentiment } = useQuery({
    queryKey: ['sentiment', DEMO_BILL_ID],
    queryFn: () => api.get(`/analysis/sentiment?billId=${DEMO_BILL_ID}`).then(r => r.data),
  })

  const { data: keywordsData, isLoading: loadingKeywords } = useQuery({
    queryKey: ['keywords', DEMO_BILL_ID],
    queryFn: () => api.get(`/analysis/keywords?billId=${DEMO_BILL_ID}`).then(r => r.data),
  })

  const { data: summaryData } = useQuery({
    queryKey: ['summary', DEMO_BILL_ID],
    queryFn: () => api.get(`/analysis/summary?billId=${DEMO_BILL_ID}`).then(r => r.data),
  })

  const { data: commentsData } = useQuery({
    queryKey: ['comments', DEMO_BILL_ID],
    queryFn: () => api.get(`/comments?billId=${DEMO_BILL_ID}&limit=100`).then(r => r.data),
  })

  const comments = commentsData?.comments || []
  const completedComments = comments.filter(c => c.status === 'completed')

  return (
    <div className="min-h-screen bg-slate-50">

      {/* demo navbar */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-sm">CS</span>
          </div>
          <span className="font-bold text-slate-800 text-lg">CivicSense</span>
          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium ml-2">
            Demo Mode
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/" className="text-sm text-slate-600 hover:text-blue-600">Home</Link>
          <Link
            to="/register"
            className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Sign Up Free →
          </Link>
        </div>
      </nav>

      {/* guest banner */}
      <div className="bg-blue-600 text-white py-3 px-6 text-center text-sm">
        👋 You're viewing demo data for the <strong>Clean Energy Transition Act 2025</strong> ·{' '}
        <Link to="/register" className="underline font-medium hover:text-blue-200">
          Sign up to analyze your own bills →
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* bill info */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-800">Clean Energy Transition Act 2025</h1>
              <p className="text-slate-500 text-sm mt-1">DEMO-2025-001 · Environment</p>
              <p className="text-slate-600 text-sm mt-2 max-w-2xl">
                A comprehensive bill to accelerate the transition to renewable energy sources,
                reduce carbon emissions, and create sustainable jobs in the green energy sector.
              </p>
            </div>
            <span className="bg-green-100 text-green-700 text-xs font-medium px-3 py-1 rounded-full">
              Open
            </span>
          </div>
        </div>

        {/* stat cards */}
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

        {/* charts */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <SentimentCharts data={sentimentData} loading={loadingSentiment} />
          <WordCloudView data={keywordsData} loading={loadingKeywords} />
        </div>

        {/* summary + comments */}
        <div className="grid grid-cols-5 gap-6 mb-8">
          <div className="col-span-2">
            <SummaryPanel data={summaryData} />
          </div>
          <div className="col-span-3">
            <CommentsTable comments={completedComments} />
          </div>
        </div>

        {/* bottom CTA */}
        <div className="bg-blue-600 rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-2">Ready to analyze your own legislation?</h2>
          <p className="text-blue-200 mb-6">Create a free account and start processing stakeholder feedback in minutes</p>
          <Link
            to="/register"
            className="bg-white text-blue-600 px-8 py-3 rounded-xl font-semibold hover:bg-blue-50 transition inline-block"
          >
            Get Started Free →
          </Link>
        </div>
      </div>
    </div>
  )
}