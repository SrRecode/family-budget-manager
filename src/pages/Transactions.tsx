import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { v4 as uuidv4 } from 'uuid'
import db from '../db/database'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, type Transaction } from '../types'

export default function Transactions() {
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Transaction | null>(null)
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all')
  const [type, setType] = useState<'income' | 'expense'>('expense')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState<string>(EXPENSE_CATEGORIES[0])
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [error, setError] = useState('')

  const transactions = useLiveQuery(
    () => db.transactions.orderBy('date').reverse().toArray(),
    []
  )

  const filtered = filter === 'all' ? transactions : transactions?.filter(t => t.type === filter)

  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES

  const handleTypeChange = (newType: 'income' | 'expense') => {
    setType(newType)
    setCategory(newType === 'expense' ? EXPENSE_CATEGORIES[0] : INCOME_CATEGORIES[0])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const numAmount = parseFloat(amount)
    if (!numAmount || numAmount <= 0) {
      setError('Enter a valid amount')
      return
    }
    if (!category) {
      setError('Select a category')
      return
    }
    if (!date) {
      setError('Select a date')
      return
    }

    if (editing) {
      await db.transactions.update(editing.id, {
        type,
        amount: numAmount,
        category,
        description: description.trim() || category,
        date,
      })
    } else {
      await db.transactions.add({
        id: uuidv4(),
        type,
        amount: numAmount,
        category,
        description: description.trim() || category,
        date,
        createdAt: Date.now(),
      })
    }

    resetForm()
  }

  const resetForm = () => {
    setShowForm(false)
    setEditing(null)
    setAmount('')
    setDescription('')
    setDate(new Date().toISOString().split('T')[0])
    setError('')
  }

  const startEdit = (t: Transaction) => {
    setEditing(t)
    setType(t.type)
    setAmount(t.amount.toString())
    setCategory(t.category)
    setDescription(t.description)
    setDate(t.date)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    await db.transactions.delete(id)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {(['all', 'income', 'expense'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                filter === f ? 'bg-primary text-white' : 'bg-surface border border-edge text-content-secondary hover:bg-surface-bright'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true) }}
          className="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary-dark transition-colors"
        >
          Add Transaction
        </button>
      </div>

      {showForm && (
        <div className="bg-surface rounded-lg border border-edge p-4">
          <h3 className="text-base font-medium text-content mb-3">
            {editing ? 'Edit Transaction' : 'New Transaction'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleTypeChange('expense')}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                  type === 'expense' ? 'bg-danger text-white' : 'bg-surface border border-edge text-content-secondary'
                }`}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('income')}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                  type === 'income' ? 'bg-success text-white' : 'bg-surface border border-edge text-content-secondary'
                }`}
              >
                Income
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-content-secondary mb-1">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-edge rounded-md text-content focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm text-content-secondary mb-1">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-edge rounded-md text-content focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-content-secondary mb-1">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-edge rounded-md text-content focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-content-secondary mb-1">Description</label>
              <input
                type="text"
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-edge rounded-md text-content focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Optional description"
              />
            </div>
            {error && <p className="text-sm text-danger">{error}</p>}
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary-dark transition-colors">
                {editing ? 'Update' : 'Save'}
              </button>
              <button type="button" onClick={resetForm} className="px-4 py-2 bg-surface border border-edge text-content-secondary rounded-md text-sm font-medium hover:bg-surface-bright transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-surface rounded-lg border border-edge">
        {filtered?.length === 0 ? (
          <p className="p-4 text-sm text-content-tertiary">No transactions found</p>
        ) : (
          <div className="divide-y divide-edge">
            {filtered?.map(t => (
              <div key={t.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-content truncate">{t.description}</p>
                  <p className="text-xs text-content-tertiary">{t.category} · {t.date}</p>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <span className={`text-sm font-medium ${t.type === 'income' ? 'text-success' : 'text-danger'}`}>
                    {t.type === 'income' ? '+' : '-'}${t.amount.toFixed(2)}
                  </span>
                  <button onClick={() => startEdit(t)} className="p-1 text-content-tertiary hover:text-content transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button onClick={() => handleDelete(t.id)} className="p-1 text-content-tertiary hover:text-danger transition-colors">
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
