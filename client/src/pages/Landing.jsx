import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../api/axios'

export default function Landing() {
  const { data: stats } = useQuery({
    queryKey: ['globalstats'],
    queryFn: () => api.get('/analysis/globalstats').then(r => r.data),
  })

  return (
    <div className="min-h-screen bg-white">

      {/* navbar */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-sm">CS</span>
          </div>
          <span className="font-bold text-slate-800 text-lg">CivicSense</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/demo" className="text-sm text-slate-600 hover:text-blue-600 font-medium">Live Demo</Link>
          <Link to="/login" className="text-sm text-slate-600 hover:text-blue-600 font-medium">Sign In</Link>
          <Link to="/register" className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium">
            Get Started
          </Link>
        </div>
      </nav>

      {/* hero */}
      <section className="max-w-6xl mx-auto px-8 py-24 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-sm font-medium px-4 py-2 rounded-full mb-8">
          <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
          AI-Powered Civic Technology
        </div>
        <h1 className="text-6xl font-black text-slate-900 leading-tight mb-6">
          Turn thousands of comments<br />
          into <span className="text-blue-600">instant insights</span>
        </h1>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          CivicSense uses AI to automatically analyze stakeholder feedback on draft legislation —
          detecting sentiment, extracting keywords, and generating summaries in seconds.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            to="/register"
            className="bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-200"
          >
            Start Analyzing Free →
          </Link>
          <Link
            to="/demo"
            className="bg-slate-100 text-slate-700 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-slate-200 transition"
          >
            View Live Demo
          </Link>
        </div>
      </section>

      {/* stats bar */}
      <section className="bg-blue-600 py-10">
        <div className="max-w-4xl mx-auto px-8 grid grid-cols-3 gap-8 text-center">
          {[
            { value: stats?.analyzed || '0', label: 'Comments Analyzed' },
            { value: stats?.totalBills || '0', label: 'Bills Processed' },
            { value: stats?.positive ? Math.round((stats.positive / stats.analyzed) * 100) + '%' : '0%', label: 'Average Positive Rate' },
          ].map(stat => (
            <div key={stat.label}>
              <div className="text-4xl font-black text-white">{stat.value}</div>
              <div className="text-blue-200 text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* features */}
      <section className="max-w-6xl mx-auto px-8 py-24">
        <h2 className="text-4xl font-black text-slate-900 text-center mb-4">Everything you need</h2>
        <p className="text-slate-500 text-center mb-16">Powered by state-of-the-art AI models</p>

        <div className="grid grid-cols-3 gap-8">
          {[
            {
              emoji: '😊',
              title: 'Sentiment Analysis',
              desc: 'Every comment is classified as positive, neutral, or negative using RoBERTa — a transformer model trained on millions of texts.',
              color: 'bg-green-50 border-green-100',
            },
            {
              emoji: '☁️',
              title: 'Keyword Visualization',
              desc: 'KeyBERT extracts the most important keywords from all comments and visualizes them in an interactive word cloud with entity recognition.',
              color: 'bg-blue-50 border-blue-100',
            },
            {
              emoji: '📝',
              title: 'AI Summaries',
              desc: 'Get a concise executive summary of all feedback — automatically generated so decision makers can understand public opinion at a glance.',
              color: 'bg-purple-50 border-purple-100',
            },
            {
              emoji: '📊',
              title: 'Interactive Charts',
              desc: 'Beautiful bar charts and pie charts show sentiment distribution. Filter by date, sentiment, or keyword in real time.',
              color: 'bg-amber-50 border-amber-100',
            },
            {
              emoji: '📄',
              title: 'PDF Reports',
              desc: 'Generate professional PDF reports for any bill with one click — ready to present to policymakers and stakeholders.',
              color: 'bg-red-50 border-red-100',
            },
            {
              emoji: '🔒',
              title: 'Role-Based Access',
              desc: 'Admin, Analyst, and Viewer roles ensure the right people have the right access. Secure JWT authentication throughout.',
              color: 'bg-slate-50 border-slate-100',
            },
          ].map(f => (
            <div key={f.title} className={`${f.color} border rounded-2xl p-6`}>
              <div className="text-3xl mb-3">{f.emoji}</div>
              <h3 className="font-bold text-slate-800 text-lg mb-2">{f.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* how it works */}
      <section className="bg-slate-50 py-24">
        <div className="max-w-4xl mx-auto px-8">
          <h2 className="text-4xl font-black text-slate-900 text-center mb-4">How it works</h2>
          <p className="text-slate-500 text-center mb-16">From raw comments to actionable insights in seconds</p>

          <div className="grid grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Submit Feedback', desc: 'Paste comments directly or upload a CSV file with thousands of responses at once.' },
              { step: '02', title: 'AI Processes', desc: 'Our pipeline runs sentiment analysis, keyword extraction, and summarization automatically.' },
              { step: '03', title: 'Get Insights', desc: 'View charts, word clouds, summaries, and download a professional PDF report.' },
            ].map(s => (
              <div key={s.step} className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-black text-lg">{s.step}</span>
                </div>
                <h3 className="font-bold text-slate-800 text-lg mb-2">{s.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-8 py-24 text-center">
        <h2 className="text-4xl font-black text-slate-900 mb-4">Ready to get started?</h2>
        <p className="text-slate-500 mb-8">Join CivicSense and transform how you process public feedback</p>
        <div className="flex items-center justify-center gap-4">
          <Link
            to="/register"
            className="bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-700 transition"
          >
            Create Free Account →
          </Link>
          <Link
            to="/demo"
            className="text-blue-600 font-semibold hover:underline"
          >
            View demo first
          </Link>
        </div>
      </section>

      {/* footer */}
      <footer className="border-t border-slate-100 py-8 text-center text-sm text-slate-400">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">CS</span>
          </div>
          <span className="font-semibold text-slate-600">CivicSense</span>
        </div>
        Built by Harsh Singh ·{' '}
        <a href="https://github.com/harsh2005-singh/civicsense" className="hover:text-blue-600" target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
      </footer>
    </div>
  )
}