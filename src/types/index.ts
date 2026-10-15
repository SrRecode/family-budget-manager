export interface Transaction {
  id: string
  type: 'income' | 'expense'
  amount: number
  category: string
  description: string
  date: string
  createdAt: number
}

export interface Budget {
  id: string
  category: string
  limit: number
  month: string
  createdAt: number
}

export interface SavingsGoal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  deadline: string
  createdAt: number
}

export const EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Housing & Rent',
  'Utilities',
  'Healthcare',
  'Entertainment',
  'Shopping',
  'Education',
  'Personal Care',
  'Insurance',
  'Savings & Investments',
  'Debt Payments',
  'Other',
] as const

export const INCOME_CATEGORIES = [
  'Salary',
  'Freelance',
  'Business',
  'Investments',
  'Rental Income',
  'Gifts',
  'Other',
] as const
