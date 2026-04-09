import React, { useEffect, useMemo, useState } from 'react'
import { Heart, Search } from 'lucide-react'
import Header from '../components/Header'
import BranchCard from '../components/BranchCard'
import API from '../api/api'
import { getBranchImage } from '../utils/branchImages'
import PageLoader from '../components/PageLoader'

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
    <div className="min-h-screen" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
      <Header />

      <div className="max-w-7xl mx-auto px-6 pt-28 pb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase"
          style={{ border: '1px solid color-mix(in srgb, var(--primary) 30%, transparent)', background: 'color-mix(in srgb, var(--primary) 10%, transparent)', color: 'var(--primary)' }}>
          <Heart size={12} fill="currentColor" />
          Our Network
        </div>

        <h1 className="mt-5 text-4xl md:text-6xl font-semibold tracking-tight" style={{ color: 'var(--foreground)' }}>Hospital Branches</h1>
        <p className="mt-3 max-w-2xl" style={{ color: 'var(--muted-foreground)' }}>
          Live branch data from backend. Search by branch name, address, email, or contact number.
        </p>

        <div className="mt-8 flex items-center gap-3 rounded-xl px-4 py-3 max-w-2xl"
          style={{ border: '1px solid var(--border)', background: 'var(--card)' }}>
          <Search size={18} style={{ color: 'var(--primary)' }} />
          <input
            className="w-full bg-transparent outline-none"
            style={{ color: 'var(--foreground)' }}
            placeholder="Search branch..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div className="rounded-2xl px-4 py-3" style={{ border: '1px solid var(--border)', background: 'var(--card)' }}>
            <div className="text-xs uppercase tracking-widest" style={{ color: 'var(--muted-foreground)' }}>Total Branches</div>
            <div className="mt-1 text-2xl font-semibold" style={{ color: 'var(--foreground)' }}>{stats.total}</div>
          </div>
          <div className="rounded-2xl px-4 py-3" style={{ border: '1px solid var(--border)', background: 'var(--card)' }}>
            <div className="text-xs uppercase tracking-widest" style={{ color: 'var(--muted-foreground)' }}>24×7 Ready</div>
            <div className="mt-1 text-2xl font-semibold" style={{ color: 'var(--foreground)' }}>{stats.openAllDay}</div>
          </div>
          <div className="rounded-2xl px-4 py-3" style={{ border: '1px solid var(--border)', background: 'var(--card)' }}>
            <div className="text-xs uppercase tracking-widest" style={{ color: 'var(--muted-foreground)' }}>ICU Support</div>
            <div className="mt-1 text-2xl font-semibold" style={{ color: 'var(--foreground)' }}>{stats.icuReady}</div>
          </div>
        </div>
        <div className="mt-6 text-sm" style={{ color: 'var(--muted-foreground)' }}>
          {loading ? <PageLoader fullPage={false} size='md' bg='Transparent' message='Branch loading...'/> : `${filtered.length} branch${filtered.length !== 1 ? 'es' : ''} found`}
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {!loading && filtered.map((branch, i) => (
            <BranchCard key={branch.id ?? `${branch.name}-${i}`} branch={branch} index={i} />
          ))}
        </div>

        {!loading && filtered.length === 0 && (
          <div className="mt-12 text-center" style={{ color: 'var(--muted-foreground)' }}>No branches found</div>
        )}
      </div>
    </div>
  )
}

export default Branch




