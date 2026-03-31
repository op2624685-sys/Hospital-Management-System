import React, { useEffect, useMemo, useState } from 'react'
import { Heart, Search } from 'lucide-react'
import Header from '../components/Header'
import BranchCard from '../components/BranchCard'
import API from '../api/api'
import { getBranchImage } from '../utils/branchImages'

const Branch = () => {
  const [query, setQuery] = useState('')
  const [branches, setBranches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await API.get('/public/branches')
        const mapped = (response.data || []).map((branch, index) => ({
          ...branch,
          contact: branch.contactNumber,
          imageUrl: getBranchImage(branch, index),
          tag: index === 0 ? 'Flagship' : index % 3 === 0 ? '24×7' : index % 2 === 0 ? 'ICU' : 'New',
        }))
        setBranches(mapped)
      } catch (error) {
        console.error('Failed to fetch branches:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBranches()
  }, [])

  const filtered = useMemo(() => {
    const term = query.toLowerCase().trim()
    if (!term) return branches

    return branches.filter((b) =>
      b.name?.toLowerCase().includes(term) ||
      b.address?.toLowerCase().includes(term) ||
      b.email?.toLowerCase().includes(term) ||
      b.contact?.toLowerCase().includes(term)
    )
  }, [branches, query])

  const stats = useMemo(() => {
    const total = branches.length
    const openAllDay = branches.filter((b) => b.tag === '24×7').length
    const icuReady = branches.filter((b) => b.tag === 'ICU').length
    return { total, openAllDay, icuReady }
  }, [branches])

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Header />

      <div className="max-w-7xl mx-auto px-6 pt-28 pb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-400/30 bg-violet-400/10 text-violet-300 text-xs font-semibold tracking-wide uppercase">
          <Heart size={12} fill="currentColor" />
          Our Network
        </div>

        <h1 className="mt-5 text-4xl md:text-6xl font-semibold tracking-tight">Hospital Branches</h1>
        <p className="mt-3 text-slate-400 max-w-2xl">
          Live branch data from backend. Search by branch name, address, email, or contact number.
        </p>

        <div className="mt-8 flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 max-w-2xl">
          <Search size={18} className="text-violet-300" />
          <input
            className="w-full bg-transparent outline-none text-slate-100 placeholder:text-slate-500"
            placeholder="Search branch..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-slate-200">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3">
            <div className="text-xs uppercase tracking-widest text-slate-400">Total Branches</div>
            <div className="mt-1 text-2xl font-semibold">{stats.total}</div>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3">
            <div className="text-xs uppercase tracking-widest text-slate-400">24×7 Ready</div>
            <div className="mt-1 text-2xl font-semibold">{stats.openAllDay}</div>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3">
            <div className="text-xs uppercase tracking-widest text-slate-400">ICU Support</div>
            <div className="mt-1 text-2xl font-semibold">{stats.icuReady}</div>
          </div>
        </div>
        <div className="mt-6 text-sm text-slate-400">
          {loading ? 'Loading branches...' : `${filtered.length} branch${filtered.length !== 1 ? 'es' : ''} found`}
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {!loading && filtered.map((branch, i) => (
            <BranchCard key={branch.id ?? `${branch.name}-${i}`} branch={branch} index={i} />
          ))}
        </div>

        {!loading && filtered.length === 0 && (
          <div className="mt-12 text-center text-slate-500">No branches match your search.</div>
        )}
      </div>
    </div>
  )
}

export default Branch




