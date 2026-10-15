import { useLiveQuery } from 'dexie-react-hooks'
import { Link } from 'react-router-dom'
import db from '../db/database'
import { EXPENSE_CATEGORIES } from '../types'

export default function Dashboard() {
  const transactions = useLiveQuery(() => db.transactions.orderBy('date').reverse().limit(10).toArray(), [])
  const budgets = useLiveQuery(() => db.budgets.toArray(), [])

  const now = new Date()
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  const monthlyTransactions = useLiveQuery(
    () => db.transactions.where('date').startsWith(currentMonth).toArray(),
    [currentMonth]
  )

  const totalIncome = monthlyTransactions?.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0) ?? 0
  const totalExpense = monthlyTransactions?.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0) ?? 0
  const balance = totalIncome - totalExpense

  const budgetStatus = budgets?.map(b => {
    const spent = monthlyTransactions?.filter(t => t.type === 'expense' && t.category === b.category).reduce((sum, t) => sum + t.amount, 0) ?? 0
    return { ...b, spent, remaining: b.limit - spent }
  }) ?? []

  const categorySpending = EXPENSE_CATEGORIES.map(cat => {
    const spent = monthlyTransactions?.filter(t => t.type === 'expense' && t.category === cat).reduce((sum, t) => sum + t.amount, 0) ?? 0
    return { category: cat, spent }
  }).filter(c => c.spent > 0).sort((a, b) => b.spent - a.spent)

  const maxSpending = Math.max(...categorySpending.map(c => c.spent), 1)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface rounded-lg border border-edge p-4">
          <p className="text-sm text-content-secondary">Monthly Income</p>
          <p className="text-2xl font-semibold text-success">${totalIncome.toFixed(2)}</p>
        </div>
        <div className="bg-surface rounded-lg border border-edge p-4">
          <p className="text-sm text-content-secondary">Monthly Expenses</p>
          <p className="text-2xl font-semibold text-danger">${totalExpense.toFixed(2)}</p>
        </div>
        <div className="bg-surface rounded-lg border border-edge p-4">
          <p className="text-sm text-content-secondary">Balance</p>
          <p className={`text-2xl font-semibold ${balance >= 0 ? 'text-success' : 'text-danger'}`}>
            ${balance.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface rounded-lg border border-edge p-4">
          <h2 className="text-base font-medium text-content mb-3">Spending by Category</h2>
          {categorySpending.length === 0 ? (
            <p className="text-sm text-content-tertiary">No expenses this month</p>
          ) : (
            <div className="space-y-2">
              {categorySpending.map(({ category, spent }) => (
                <div key={category}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-content-secondary">{category}</span>
                    <span className="text-content">${spent.toFixed(2)}</span>
                  </div>
                  <div className="h-2 bg-surface-bright rounded-full overflow-hidden">
                    <div
                      className="h-full bg-danger-light rounded-full"
                      style={{ width: `${(spent / maxSpending) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-surface rounded-lg border border-edge p-4">
          <h2 className="text-base font-medium text-content mb-3">Budget Status</h2>
          {budgetStatus.length === 0 ? (
            <p className="text-sm text-content-tertiary">No budgets set. <Link to="/budgets" className="text-primary hover:underline">Create one</Link></p>
          ) : (
            <div className="space-y-2">
              {budgetStatus.map(b => (
                <div key={b.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-content-secondary">{b.category}</span>
                    <span className={b.remaining < 0 ? 'text-danger' : 'text-content'}>
                      ${b.spent.toFixed(2)} / ${b.limit.toFixed(2)}
                    </span>
                  </div>
                  <div className="h-2 bg-surface-bright rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${b.remaining < 0 ? 'bg-danger' : 'bg-success'}`}
                      style={{ width: `${Math.min((b.spent / b.limit) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-surface rounded-lg border border-edge p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-medium text-content">Recent Transactions</h2>
          <Link to="/transactions" className="text-sm text-primary hover:underline">View all</Link>
        </div>
        {transactions?.length === 0 ? (
          <p className="text-sm text-content-tertiary">No transactions yet. <Link to="/transactions" className="text-primary hover:underline">Add one</Link></p>
        ) : (
          <div className="divide-y divide-edge">
            {transactions?.map(t => (
              <div key={t.id} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm text-content">{t.description}</p>
                  <p className="text-xs text-content-tertiary">{t.category} · {t.date}</p>
                </div>
                <span className={`text-sm font-medium ${t.type === 'income' ? 'text-success' : 'text-danger'}`}>
                  {t.type === 'income' ? '+' : '-'}${t.amount.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
