"use client"

import { useState } from "react"
import { Calendar } from "lucide-react"
import { format } from "date-fns"

import { SummaryCards } from "@/components/summary-cards"
import { TransactionsList } from "@/components/transactions-list"
import { ExpenseChart } from "@/components/expense-chart"
import { CategoryBreakdown } from "@/components/category-breakdown"
import { Transaction, Category, Account } from "@/lib/definitions"
import { getCycleStartDate } from "@/lib/date-utils"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/layout/shell"


type FinancialTrackerDashboardProps = {
    transactions: Transaction[];
    categories: Category[];
    settings: { cycle_start_day: number; currency: string };
    accounts: Account[];
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

export function FinancialTrackerDashboard({ transactions, categories, settings, accounts }: FinancialTrackerDashboardProps) {
    const cycleStartDay = settings.cycle_start_day
    const currency = settings.currency || 'USD'

    // Account Selection: Default to first account or "all"
    const [selectedAccountId, setSelectedAccountId] = useState<string>(accounts[0]?.id || "all")

    // Default to current cycle
    const [selectedCycleStart, setSelectedCycleStart] = useState(() => {
        return getCycleStartDate(new Date().toISOString().split("T")[0], cycleStartDay)
    })

    // Filter Transactions by Cycle AND Account
    const filteredTransactions = transactions.filter((t) => {
        const txCycleStart = getCycleStartDate(t.date, cycleStartDay)
        const inCycle = txCycleStart === selectedCycleStart

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
                selectedAccountId={selectedAccountId}
                onAccountChange={setSelectedAccountId}
                selectedCycleStart={selectedCycleStart}
                onDateChange={setSelectedCycleStart}
            />
            <DashboardShell>
                {/* Summary Cards */}
                <section className="mb-8">
                    <SummaryCards transactions={filteredTransactions} currency={currency} />
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
