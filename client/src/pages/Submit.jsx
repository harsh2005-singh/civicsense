import { useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useDropzone } from 'react-dropzone'
import api from '../api/axios'
import toast from 'react-hot-toast'

export default function Submit() {
  const [searchParams] = useSearchParams()
  const defaultBillId = searchParams.get('billId') || ''

  const [billId, setBillId] = useState(defaultBillId)
  const [text, setText] = useState('')
  const [mode, setMode] = useState('text') // 'text' or 'csv'
  const [result, setResult] = useState(null)

  const { data: billsData } = useQuery({
    queryKey: ['bills'],
    queryFn: () => api.get('/bills').then(r => r.data),
  })
  const bills = billsData?.bills || []

  // text submission
  const textMutation = useMutation({
    mutationFn: ({ billId, comments }) => api.post('/comments', { billId, comments }),
    onSuccess: (res) => {
      setResult(res.data.results)
      toast.success(`${res.data.results.inserted} comments submitted!`)
      setText('')
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed'),
  })

  // csv submission
  const csvMutation = useMutation({
    mutationFn: (formData) => api.post('/comments/csv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    onSuccess: (res) => {
      setResult(res.data.results)
      toast.success(`CSV processed! ${res.data.results.inserted} inserted`)
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed'),
  })

  const handleTextSubmit = () => {
    if (!billId) return toast.error('Select a bill first')
    const comments = text.split('\n').map(l => l.trim()).filter(Boolean)
    if (comments.length === 0) return toast.error('Enter at least one comment')
    textMutation.mutate({ billId, comments })
  }

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    accept: { 'text/csv': ['.csv'] },
    maxFiles: 1,
    onDrop: (files) => {
      if (!billId) return toast.error('Select a bill first')
      const fd = new FormData()
      fd.append('file', files[0])
      fd.append('billId', billId)
      csvMutation.mutate(fd)
    }
  })

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-sm">CS</span>
          </div>
          <span className="font-bold text-slate-800 text-lg">CivicSense</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/" className="text-sm text-slate-600 hover:text-blue-600">Dashboard</Link>
          <Link to="/bills" className="text-sm text-slate-600 hover:text-blue-600">Bills</Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Submit Comments</h1>
        <p className="text-slate-500 mb-6">Submit stakeholder feedback for AI analysis</p>

        {/* bill selector */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-2">Select Bill</label>
          <select
            value={billId}
            onChange={e => setBillId(e.target.value)}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="">-- Select a bill --</option>
            {bills.map(b => (
              <option key={b._id} value={b._id}>{b.title} ({b.billNumber})</option>
            ))}
          </select>
        </div>

        {/* mode toggle */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setMode('text')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${mode === 'text' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}
          >
            Text Input
          </button>
          <button
            onClick={() => setMode('csv')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${mode === 'csv' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}
          >
            CSV Upload
          </button>
        </div>

        {/* text input */}
        {mode === 'text' && (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Comments <span className="text-slate-400">(one per line)</span>
            </label>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              rows={8}
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none font-mono"
              placeholder={"This bill will help the environment\nI strongly oppose this policy\nNeed more clarity on implementation..."}
            />
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-slate-400">
                {text.split('\n').filter(Boolean).length} comments
              </span>
              <button
                onClick={handleTextSubmit}
                disabled={textMutation.isPending}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium disabled:opacity-50"
              >
                {textMutation.isPending ? 'Processing...' : 'Submit for Analysis'}
              </button>
            </div>
          </div>
        )}

        {/* csv upload */}
        {mode === 'csv' && (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <p className="text-sm text-slate-500 mb-3">
              CSV must have a column named <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">text</code>, <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">comment</code>, or <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">feedback</code>
            </p>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-blue-400'}`}
            >
              <input {...getInputProps()} />
              <p className="text-slate-500 text-sm">
                {isDragActive ? 'Drop the CSV here...' : 'Drag & drop a CSV file, or click to browse'}
              </p>
              {acceptedFiles[0] && (
                <p className="text-blue-600 text-sm font-medium mt-2">{acceptedFiles[0].name}</p>
              )}
            </div>
            {csvMutation.isPending && (
              <p className="text-center text-blue-600 text-sm mt-3 animate-pulse">Processing CSV...</p>
            )}
          </div>
        )}

        {/* result */}
        {result && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 mt-4">
            <h3 className="font-semibold text-slate-800 mb-3">Submission Result</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{result.inserted}</div>
                <div className="text-xs text-slate-500 mt-1">Inserted</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{result.duplicates}</div>
                <div className="text-xs text-slate-500 mt-1">Duplicates</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{result.errors?.length || 0}</div>
                <div className="text-xs text-slate-500 mt-1">Errors</div>
              </div>
            </div>
            <p className="text-sm text-slate-500 mt-3 text-center">
              AI analysis is running in the background — check the dashboard for results
            </p>
          </div>
        )}
      </div>
    </div>
  )
}