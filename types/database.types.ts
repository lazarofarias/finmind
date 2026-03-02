// types/database.types.ts
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type TransactionType = 'fixo' | 'variavel' | 'receita'
export type InvestmentType = 'pos_fixado' | 'pre_fixado' | 'acoes' | 'fii' | 'etf' | 'cripto' | 'internacional' | 'previdencia' | 'outro'
export type InvestorProfile = 'conservador' | 'moderado' | 'arrojado'
export type TransactionStatus = 'pending' | 'confirmed'
export type AccountType = 'checking' | 'savings' | 'credit_card' | 'investment' | 'wallet'
export type BudgetPeriod = 'monthly' | 'yearly'
export type AiInsightType = 'anomaly' | 'tip' | 'alert' | 'report'
export type PdfUploadStatus = 'pending' | 'processing' | 'done' | 'error'

export interface Database {
    public: {
        Tables: {
            profiles: { Row: Profile; Insert: ProfileInsert; Update: ProfileUpdate }
            accounts: { Row: Account; Insert: AccountInsert; Update: AccountUpdate }
            categories: { Row: Category; Insert: CategoryInsert; Update: CategoryUpdate }
            transactions: { Row: Transaction; Insert: TransactionInsert; Update: TransactionUpdate }
            investments: { Row: Investment; Insert: InvestmentInsert; Update: InvestmentUpdate }
            budgets: { Row: Budget; Insert: BudgetInsert; Update: BudgetUpdate }
            ai_insights: { Row: AiInsight; Insert: AiInsightInsert; Update: AiInsightUpdate }
            pdf_uploads: { Row: PdfUpload; Insert: PdfUploadInsert; Update: PdfUploadUpdate }
        }
        Views: Record<string, never>
        Functions: Record<string, never>
        Enums: {
            transaction_type: TransactionType
            investment_type: InvestmentType
            investor_profile: InvestorProfile
            transaction_status: TransactionStatus
            account_type: AccountType
            budget_period: BudgetPeriod
            ai_insight_type: AiInsightType
        }
        CompositeTypes: Record<string, never>
    }
}

export interface Profile {
    id: string
    full_name: string | null
    avatar_url: string | null
    investor_profile: InvestorProfile
    financial_score: number
    monthly_income_goal: number
    created_at: string
    updated_at: string
}
export type ProfileInsert = Omit<Profile, 'created_at' | 'updated_at'> & { created_at?: string; updated_at?: string; investor_profile?: InvestorProfile; financial_score?: number; monthly_income_goal?: number }
export type ProfileUpdate = Partial<ProfileInsert>

export interface Account {
    id: string
    user_id: string
    name: string
    type: AccountType
    balance: number
    color_hex: string | null
    icon: string | null
    is_active: boolean
    created_at: string
    updated_at: string
}
export type AccountInsert = Omit<Account, 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string; type?: AccountType; balance?: number; color_hex?: string | null; icon?: string | null; is_active?: boolean }
export type AccountUpdate = Partial<AccountInsert>

export interface Category {
    id: string
    user_id: string | null
    name: string
    icon: string
    color: string
    is_default: boolean
    created_at: string
}
export type CategoryInsert = Omit<Category, 'id' | 'is_default' | 'created_at'> & { id?: string; created_at?: string; icon?: string; color?: string }
export type CategoryUpdate = Partial<Omit<CategoryInsert, 'user_id'>>

export interface Transaction {
    id: string
    user_id: string
    account_id: string
    category_id: string | null
    amount: number
    description: string | null
    type: TransactionType
    status: TransactionStatus
    date: string
    is_recurring: boolean
    installment_current: number | null
    installment_total: number | null
    notes: string | null
    created_at: string
    updated_at: string
}
export type TransactionInsert = Omit<Transaction, 'id' | 'created_at' | 'updated_at' | 'installment_current' | 'installment_total' | 'notes' | 'category_id' | 'description' | 'status' | 'is_recurring'> & {
    id?: string
    created_at?: string
    updated_at?: string
    status?: TransactionStatus
    is_recurring?: boolean
    installment_current?: number | null
    installment_total?: number | null
    notes?: string | null
    category_id?: string | null
    description?: string | null
}
export type TransactionUpdate = Partial<TransactionInsert>

export interface Investment {
    id: string
    user_id: string
    ticker: string | null
    name: string
    type: InvestmentType
    quantity: number
    average_price: number
    current_price: number | null
    last_sync_at: string | null
    broker: string | null
    notes: string | null
    created_at: string
    updated_at: string
}
export type InvestmentInsert = Omit<Investment, 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string }
export type InvestmentUpdate = Partial<InvestmentInsert>

export interface Budget {
    id: string
    user_id: string
    category_id: string
    limit_amount: number
    period: BudgetPeriod
    created_at: string
    updated_at: string
}
export type BudgetInsert = Omit<Budget, 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string; period?: BudgetPeriod }
export type BudgetUpdate = Partial<BudgetInsert>

export interface AiInsight {
    id: string
    user_id: string
    type: AiInsightType
    title: string
    content: string
    read_status: boolean
    metadata: Json
    expires_at: string | null
    created_at: string
}
export type AiInsightInsert = Omit<AiInsight, 'id' | 'created_at'> & { id?: string; created_at?: string; read_status?: boolean; metadata?: Json; expires_at?: string | null }
export type AiInsightUpdate = Partial<AiInsightInsert>

export interface PdfUpload {
    id: string
    user_id: string
    file_path: string
    original_name: string
    status: PdfUploadStatus
    extracted_transactions: Json
    error_logs: string | null
    bank_detected: string | null
    created_at: string
    updated_at: string
}
export type PdfUploadInsert = Omit<PdfUpload, 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string; status?: PdfUploadStatus; extracted_transactions?: Json; error_logs?: string | null; bank_detected?: string | null }
export type PdfUploadUpdate = Partial<PdfUploadInsert>

// --- Joined types ---
export interface TransactionWithRelations extends Transaction {
    account: Pick<Account, 'id' | 'name' | 'color_hex' | 'type'>
    category: Pick<Category, 'id' | 'name' | 'icon' | 'color'> | null
}

export interface BudgetWithSpent extends Budget {
    spent_amount: number
    remaining_amount: number
    percentage_used: number
    category: Pick<Category, 'id' | 'name' | 'icon' | 'color'>
}

export interface ExtractedTransaction {
    date: string
    description: string
    amount: number
    category_suggestion: string
    isDuplicate?: boolean
}
