import { Transaction } from '@/types/database.types'

export interface MonthTotals {
    income: number
    fixed: number
    variable: number
    balance: number
    available: number
}

export interface ChartMonth {
    label: string
    income: number
    expenses: number
    month: string // YYYY-MM
}

export function calculateTotals(
    transactions: Transaction[],
    monthStart: string,
    monthEnd: string
): MonthTotals {
    const current = transactions.filter(t => t.date >= monthStart && t.date <= monthEnd)

    const income = current.filter(t => t.type === 'receita').reduce((s, t) => s + t.amount, 0)
    const fixed = current.filter(t => t.type === 'fixo').reduce((s, t) => s + t.amount, 0)
    const variable = current.filter(t => t.type === 'variavel').reduce((s, t) => s + t.amount, 0)
    const balance = income - fixed - variable
    const available = income - fixed

    return { income, fixed, variable, balance, available }
}

export function buildChartData(transactions: Transaction[]): ChartMonth[] {
    const now = new Date()
    const months: ChartMonth[] = []

    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        const label = d.toLocaleDateString('pt-BR', { month: 'short' })

        const monthTx = transactions.filter(t => t.date.startsWith(monthKey))
        const income = monthTx.filter(t => t.type === 'receita').reduce((s, t) => s + t.amount, 0)
        const expenses = monthTx.filter(t => t.type !== 'receita').reduce((s, t) => s + t.amount, 0)

        months.push({ label, income, expenses, month: monthKey })
    }

    return months
}
