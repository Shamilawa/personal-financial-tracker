"use client"

import { useState } from "react"
import { Calendar } from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { format } from "date-fns"

import { TransactionForm } from "@/components/transaction-form"
import { TransferForm } from "@/components/transfer-form"
import { SummaryCards } from "@/components/summary-cards"
import { TransactionsList } from "@/components/transactions-list"
import { ExpenseChart } from "@/components/expense-chart"
import { CategoryBreakdown } from "@/components/category-breakdown"
import { DateRangeNavigator } from "@/components/date-range-navigator"
import { Wallet } from "lucide-react"
import { Transaction, Category, Account } from "@/lib/definitions"
import { getCycleStartDate } from "@/lib/date-utils"


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
        <main className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                {/* Header */}
                <header className="flex flex-col gap-4 mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            {/* <div className="p-2 rounded-lg bg-primary"> 
                                <Wallet className="h-6 w-6 text-primary-foreground" />
                            </div> */}
                            {/* Removed Title/Logo since it's in Sidebar now, or we can keep it as page title */}
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
                                {/* <p className="text-sm text-muted-foreground">
                                    Personal Finance Tracker
                                </p> */}
                            </div>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                            {/* Account Selector */}
                            <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select Account" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Accounts</SelectItem>
                                    {accounts.map(acc => (
                                        <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <DateRangeNavigator
                                cycleStartDay={cycleStartDay}
                                selectedDate={selectedCycleStart}
                                onDateChange={setSelectedCycleStart}
                            />

                            <TransferForm accounts={accounts} />

                            <TransactionForm
                                categories={categories}
                                currency={currency}
                                accounts={accounts}
                                defaultAccountId={selectedAccountId !== "all" ? selectedAccountId : undefined}
                            />
                        </div>
                    </div>
                </header>

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
            </div>
        </main>
    )
}
