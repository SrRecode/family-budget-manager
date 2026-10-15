import Dexie, { type EntityTable } from 'dexie'
import type { Transaction, Budget, SavingsGoal } from '../types'

export class DevShowcaseDB extends Dexie {
  transactions!: EntityTable<Transaction, 'id'>
  budgets!: EntityTable<Budget, 'id'>
  savingsGoals!: EntityTable<SavingsGoal, 'id'>

  constructor() {
    super('DevShowcaseDB')
    this.version(1).stores({
      transactions: 'id, type, category, date, createdAt',
      budgets: 'id, category, month, createdAt',
      savingsGoals: 'id, deadline, createdAt',
    })
  }
}

const db = new DevShowcaseDB()

export default db
