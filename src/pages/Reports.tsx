import { useLiveQuery } from 'dexie-react-hooks'
import db from '../db/database'
import { EXPENSE_CATEGORIES } from '../types'

export default function Reports() {
  const transactions = useLiveQuery(() => db.transactions.toArray(), [])

  const now = new Date()
  const months: { label: string; key: string }[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push({
      label: d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
    })
  }

  const monthlyData = months.map(m => {
    const monthTxns = transactions?.filter(t => t.date.startsWith(m.key)) ?? []
    const income = monthTxns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    const expense = monthTxns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
    return { ...m, income, expense, net: income - expense }
  })

  const maxAmount = Math.max(...monthlyData.flatMap(m => [m.income, m.expense]), 1)

  const categoryTotals = EXPENSE_CATEGORIES.map(cat => {
    const total = transactions?.filter(t => t.type === 'expense' && t.category === cat).reduce((s, t) => s + t.amount, 0) ?? 0
    return { category: cat, total }
  }).filter(c => c.total > 0).sort((a, b) => b.total - a.total)

  const maxCategory = Math.max(...categoryTotals.map(c => c.total), 1)

  const exportCSV = () => {
    if (!transactions?.length) return
    const header = 'Date,Type,Category,Description,Amount\n'
    const rows = transactions.map(t => `${t.date},${t.type},${t.category},"${t.description}",${t.amount}`).join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `budget-report-${now.toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-content">Reports</h2>
        <button
          onClick={exportCSV}
          disabled={!transactions?.length}
          className="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
        >
          Export CSV
        </button>
      </div>

      <div className="bg-surface rounded-lg border border-edge p-4">
        <h3 className="text-base font-medium text-content mb-4">Income vs Expenses (6 months)</h3>
        <div className="flex items-end gap-2 h-48">
          {monthlyData.map(m => (
            <div key={m.key} className="flex-1 flex flex-col items-center gap-1">
              <div className="flex gap-1 items-end w-full justify-center">
                <div
                  className="w-3 bg-success rounded-t"
                  style={{ height: `${(m.income / maxAmount) * 160}px` }}
                  title={`Income: $${m.income.toFixed(2)}`}
                />
                <div
                  className="w-3 bg-danger rounded-t"
                  style={{ height: `${(m.expense / maxAmount) * 160}px` }}
                  title={`Expense: $${m.expense.toFixed(2)}`}
                />
              </div>
              <span className="text-xs text-content-tertiary mt-1">{m.label}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-4 mt-3 justify-center">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-success rounded" />
            <span className="text-xs text-content-secondary">Income</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-danger rounded" />
            <span className="text-xs text-content-secondary">Expenses</span>
          </div>
        </div>
      </div>

      <div className="bg-surface rounded-lg border border-edge p-4">
        <h3 className="text-base font-medium text-content mb-3">Spending by Category (All Time)</h3>
        {categoryTotals.length === 0 ? (
          <p className="text-sm text-content-tertiary">No expense data yet</p>
        ) : (
          <div className="space-y-2">
            {categoryTotals.map(({ category, total }) => (
              <div key={category}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-content-secondary">{category}</span>
                  <span className="text-content">${total.toFixed(2)}</span>
                </div>
                <div className="h-2 bg-surface-bright rounded-full overflow-hidden">
                  <div
                    className="h-full bg-danger-light rounded-full"
                    style={{ width: `${(total / maxCategory) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-surface rounded-lg border border-edge p-4">
        <h3 className="text-base font-medium text-content mb-3">Monthly Summary</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-edge">
                <th className="text-left py-2 text-content-secondary font-medium">Month</th>
                <th className="text-right py-2 text-content-secondary font-medium">Income</th>
                <th className="text-right py-2 text-content-secondary font-medium">Expenses</th>
                <th className="text-right py-2 text-content-secondary font-medium">Net</th>
              </tr>
            </thead>
            <tbody>
              {monthlyData.map(m => (
                <tr key={m.key} className="border-b border-edge last:border-0">
                  <td className="py-2 text-content">{m.label}</td>
                  <td className="py-2 text-right text-success">${m.income.toFixed(2)}</td>
                  <td className="py-2 text-right text-danger">${m.expense.toFixed(2)}</td>
                  <td className={`py-2 text-right ${m.net >= 0 ? 'text-success' : 'text-danger'}`}>
                    ${m.net.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
