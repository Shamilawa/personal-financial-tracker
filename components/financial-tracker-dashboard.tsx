"use client"

import { useState, useEffect } from "react"
import { Calendar } from "lucide-react"
import { format } from "date-fns"

import { SummaryCards } from "@/components/summary-cards"
import { TransactionsList } from "@/components/transactions-list"
import { ExpenseChart } from "@/components/expense-chart"
import { CategoryBreakdown } from "@/components/category-breakdown"
import { Transaction, Category, Account, RecurringTransaction } from "@/lib/definitions"
import { getCycleStartDate } from "@/lib/date-utils"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/layout/shell"


type FinancialTrackerDashboardProps = {
    transactions: Transaction[];
    categories: Category[];
    settings: { cycle_start_day: number; currency: string };
    accounts: Account[];
    initialAccountId?: string;
    recurringTransactions: RecurringTransaction[];
}

const CURRENCIES = [
    { value: "USD", label: "USD ($)" },
    { value: "EUR", label: "EUR (€)" },
    { value: "GBP", label: "GBP (£)" },
    { value: "JPY", label: "JPY (¥)" },
    { value: "LKR", label: "LKR (Rs)" },
    { value: "AUD", label: "AUD ($)" },
    { value: "CAD", label: "CAD ($)" },
];

export function FinancialTrackerDashboard({ transactions, categories, settings, accounts, initialAccountId, recurringTransactions }: FinancialTrackerDashboardProps) {
    const cycleStartDay = settings.cycle_start_day
    const currency = settings.currency || 'USD'

    // Account Selection: Default to passed prop, or First "main" account, or first account, or "all"
    const [selectedAccountId, setSelectedAccountId] = useState<string>(() => {
        if (initialAccountId) return initialAccountId;

        // Find first primary account
        const primaryAccount = accounts.find(acc => acc.type === 'main');
        if (primaryAccount) return primaryAccount.id;

        // Fallback to first available account
        if (accounts.length > 0) return accounts[0].id;

        return "all";
    })

    // Sync with prop if it changes (e.g. navigation)
    useEffect(() => {
        if (initialAccountId) {
            setSelectedAccountId(initialAccountId)
        }
    }, [initialAccountId])

    // Default to "overall" (All Time)
    const [selectedCycleStart, setSelectedCycleStart] = useState("overall")

    // Filter Transactions by Cycle AND Account
    const filteredTransactions = transactions.filter((t) => {
        const isOverall = selectedCycleStart === "overall"
        const txCycleStart = getCycleStartDate(t.date, cycleStartDay)
        const inCycle = isOverall ? true : txCycleStart === selectedCycleStart

        let inAccount = true
        if (selectedAccountId !== "all") {
            inAccount = t.account_id === selectedAccountId
        }

        return inCycle && inAccount
    })

    return (
        <>
            <DashboardHeader
                accounts={accounts}
                categories={categories}
                currency={currency}
                cycleStartDay={cycleStartDay}
                selectedCycleStart={selectedCycleStart}
                onDateChange={setSelectedCycleStart}
                recurringTransactions={recurringTransactions}
            />
            <DashboardShell>
                {/* Summary Cards */}
                <section className="mb-8">
                    <SummaryCards
                        transactions={filteredTransactions}
                        currency={currency}
                        accounts={accounts}
                        selectedAccountId={selectedAccountId}
                    />
                </section>

                {/* Charts and Breakdown */}
                <section className="grid gap-6 lg:grid-cols-2 mb-8">
                    <ExpenseChart transactions={filteredTransactions} currency={currency} />
                    <CategoryBreakdown transactions={filteredTransactions} currency={currency} />
                </section>

                {/* Transactions List */}
                <section>
                    <TransactionsList
                        transactions={filteredTransactions}
                        currency={currency}
                    />
                </section>
            </DashboardShell>
        </>
    )
}
