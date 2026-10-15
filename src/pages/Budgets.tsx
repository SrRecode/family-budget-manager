import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { v4 as uuidv4 } from 'uuid'
import db from '../db/database'
import { EXPENSE_CATEGORIES } from '../types'

export default function Budgets() {
  const [showForm, setShowForm] = useState(false)
  const [category, setCategory] = useState<string>(EXPENSE_CATEGORIES[0])
  const [limit, setLimit] = useState('')
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7))
  const [error, setError] = useState('')

  const budgets = useLiveQuery(() => db.budgets.toArray(), [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const numLimit = parseFloat(limit)
    if (!numLimit || numLimit <= 0) {
      setError('Enter a valid budget limit')
      return
    }
    if (!month) {
      setError('Select a month')
      return
    }

    const existing = budgets?.find(b => b.category === category && b.month === month)
    if (existing) {
      setError('A budget for this category and month already exists')
      return
    }

    await db.budgets.add({
      id: uuidv4(),
      category,
      limit: numLimit,
      month,
      createdAt: Date.now(),
    })

    setShowForm(false)
    setLimit('')
    setError('')
  }

  const handleDelete = async (id: string) => {
    await db.budgets.delete(id)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-content">Monthly Budgets</h2>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary-dark transition-colors"
        >
          New Budget
        </button>
      </div>

      {showForm && (
        <div className="bg-surface rounded-lg border border-edge p-4">
          <h3 className="text-base font-medium text-content mb-3">Create Budget</h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm text-content-secondary mb-1">Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-edge rounded-md text-content focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {EXPENSE_CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-content-secondary mb-1">Monthly Limit</label>
                <input
                  type="number"
                  step="0.01"
                  value={limit}
                  onChange={e => setLimit(e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-edge rounded-md text-content focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm text-content-secondary mb-1">Month</label>
                <input
                  type="month"
                  value={month}
                  onChange={e => setMonth(e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-edge rounded-md text-content focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            {error && <p className="text-sm text-danger">{error}</p>}
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary-dark transition-colors">
                Save
              </button>
              <button type="button" onClick={() => { setShowForm(false); setError('') }} className="px-4 py-2 bg-surface border border-edge text-content-secondary rounded-md text-sm font-medium hover:bg-surface-bright transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-surface rounded-lg border border-edge">
        {budgets?.length === 0 ? (
          <p className="p-4 text-sm text-content-tertiary">No budgets set yet</p>
        ) : (
          <div className="divide-y divide-edge">
            {budgets?.sort((a, b) => b.month.localeCompare(a.month)).map(b => (
              <div key={b.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm text-content">{b.category}</p>
                  <p className="text-xs text-content-tertiary">{b.month}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-content">${b.limit.toFixed(2)}</span>
                  <button onClick={() => handleDelete(b.id)} className="p-1 text-content-tertiary hover:text-danger transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
