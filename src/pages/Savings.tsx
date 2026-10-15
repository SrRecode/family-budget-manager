import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { v4 as uuidv4 } from 'uuid'
import db from '../db/database'

export default function Savings() {
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [currentAmount, setCurrentAmount] = useState('')
  const [deadline, setDeadline] = useState('')
  const [error, setError] = useState('')

  const goals = useLiveQuery(() => db.savingsGoals.toArray(), [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const target = parseFloat(targetAmount)
    const current = parseFloat(currentAmount) || 0

    if (!name.trim()) {
      setError('Enter a goal name')
      return
    }
    if (!target || target <= 0) {
      setError('Enter a valid target amount')
      return
    }
    if (current < 0) {
      setError('Current amount cannot be negative')
      return
    }
    if (!deadline) {
      setError('Select a deadline')
      return
    }

    await db.savingsGoals.add({
      id: uuidv4(),
      name: name.trim(),
      targetAmount: target,
      currentAmount: current,
      deadline,
      createdAt: Date.now(),
    })

    setShowForm(false)
    setName('')
    setTargetAmount('')
    setCurrentAmount('')
    setDeadline('')
    setError('')
  }

  const handleDelete = async (id: string) => {
    await db.savingsGoals.delete(id)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-content">Savings Goals</h2>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary-dark transition-colors"
        >
          New Goal
        </button>
      </div>

      {showForm && (
        <div className="bg-surface rounded-lg border border-edge p-4">
          <h3 className="text-base font-medium text-content mb-3">Create Savings Goal</h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm text-content-secondary mb-1">Goal Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-edge rounded-md text-content focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g., Emergency Fund"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm text-content-secondary mb-1">Target Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={targetAmount}
                  onChange={e => setTargetAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-edge rounded-md text-content focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm text-content-secondary mb-1">Current Savings</label>
                <input
                  type="number"
                  step="0.01"
                  value={currentAmount}
                  onChange={e => setCurrentAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-edge rounded-md text-content focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm text-content-secondary mb-1">Deadline</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={e => setDeadline(e.target.value)}
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {goals?.length === 0 ? (
          <p className="text-sm text-content-tertiary col-span-full">No savings goals yet</p>
        ) : (
          goals?.map(g => {
            const progress = Math.min((g.currentAmount / g.targetAmount) * 100, 100)
            const remaining = g.targetAmount - g.currentAmount
            return (
              <div key={g.id} className="bg-surface rounded-lg border border-edge p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-base font-medium text-content">{g.name}</h3>
                    <p className="text-xs text-content-tertiary">Target: {g.deadline}</p>
                  </div>
                  <button onClick={() => handleDelete(g.id)} className="p-1 text-content-tertiary hover:text-danger transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-success font-medium">${g.currentAmount.toFixed(2)}</span>
                    <span className="text-content-secondary">${g.targetAmount.toFixed(2)}</span>
                  </div>
                  <div className="h-2 bg-surface-bright rounded-full overflow-hidden">
                    <div className="h-full bg-success rounded-full" style={{ width: `${progress}%` }} />
                  </div>
                  <p className="text-xs text-content-tertiary">
                    {remaining > 0 ? `$${remaining.toFixed(2)} remaining` : 'Goal reached'}
                  </p>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
