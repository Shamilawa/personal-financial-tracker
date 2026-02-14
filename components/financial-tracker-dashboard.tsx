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
import { addMonths, format, setDate, startOfMonth, subMonths } from "date-fns"

import { TransactionForm } from "@/components/transaction-form"
import { TransferForm } from "@/components/transfer-form"
import { SummaryCards } from "@/components/summary-cards"
import { TransactionsList } from "@/components/transactions-list"
import { ExpenseChart } from "@/components/expense-chart"
import { CategoryBreakdown } from "@/components/category-breakdown"
import { Wallet } from "lucide-react"
import { Transaction, Category, Account } from "@/lib/definitions"


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

    // Helper to get the cycle for a given date based on start day
    const getCycleStartDate = (dateStr: string) => {
        const date = new Date(dateStr)
        const day = date.getDate()

        let cycleStart = new Date(date.getFullYear(), date.getMonth(), cycleStartDay)

        const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
        if (cycleStartDay > daysInMonth) {
            cycleStart = new Date(date.getFullYear(), date.getMonth(), daysInMonth)
        }

        if (day < cycleStart.getDate()) {
            cycleStart = subMonths(cycleStart, 1)
            const prevMonthDays = new Date(cycleStart.getFullYear(), cycleStart.getMonth() + 1, 0).getDate()
            if (cycleStartDay > prevMonthDays) {
                cycleStart.setDate(prevMonthDays);
            } else {
                cycleStart.setDate(cycleStartDay);
            }
        }

        return format(cycleStart, "yyyy-MM-dd")
    }

    // Default to current cycle
    const [selectedCycleStart, setSelectedCycleStart] = useState(() => {
        return getCycleStartDate(new Date().toISOString().split("T")[0])
    })

    // Filter Transactions by Cycle AND Account
    const filteredTransactions = transactions.filter((t) => {
        const txCycleStart = getCycleStartDate(t.date)
        const inCycle = txCycleStart === selectedCycleStart

        let inAccount = true
        if (selectedAccountId !== "all") {
            inAccount = t.account_id === selectedAccountId
        }

        return inCycle && inAccount
    })

    // Generate month options dynamically based on available data + some buffer
    const generateMonthOptions = () => {
        const today = new Date()

        // Find the start date of the CURRENT cycle
        const currentCycleStartStr = getCycleStartDate(format(today, "yyyy-MM-dd"));
        const currentCycleStart = new Date(currentCycleStartStr);

        // We want to show a range of cycles.
        // e.g. 1 future cycle, current cycle, and 11 past cycles
        const cyclesToShow = 13;
        const futureCycles = 1;

        // Generate a base list of start dates
        // Start from (Current + futureCycles) down to (Current - (cyclesToShow - futureCycles))
        const cycleStarts: Date[] = [];

        // Start with the furthest future cycle
        let iterDate = new Date(currentCycleStart);
        // Advance to furthest future
        for (let i = 0; i < futureCycles; i++) {
            iterDate = addMonths(iterDate, 1);
            const daysInMonth = new Date(iterDate.getFullYear(), iterDate.getMonth() + 1, 0).getDate();
            if (cycleStartDay > daysInMonth) {
                iterDate.setDate(daysInMonth);
            } else {
                iterDate.setDate(cycleStartDay);
            }
        }

        // Now push 'cyclesToShow' number of cycles moving backwards
        for (let i = 0; i < cyclesToShow; i++) {
            cycleStarts.push(new Date(iterDate));

            // Move back 1 month
            iterDate = subMonths(iterDate, 1);
            const daysInMonth = new Date(iterDate.getFullYear(), iterDate.getMonth() + 1, 0).getDate();
            if (cycleStartDay > daysInMonth) {
                iterDate.setDate(daysInMonth);
            } else {
                iterDate.setDate(cycleStartDay);
            }
        }

        const options = [];

        // Recalculate the "Next" cycle for the very first item to get its end date
        let nextCycleStart = addMonths(cycleStarts[0], 1);
        const daysInNextMonth = new Date(nextCycleStart.getFullYear(), nextCycleStart.getMonth() + 1, 0).getDate();
        if (cycleStartDay > daysInNextMonth) {
            nextCycleStart.setDate(daysInNextMonth);
        } else {
            nextCycleStart.setDate(cycleStartDay);
        }

        for (const start of cycleStarts) {
            const end = new Date(nextCycleStart);
            end.setDate(end.getDate() - 1);

            const label = `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`;

            options.push({
                value: format(start, "yyyy-MM-dd"),
                label: label
            });

            nextCycleStart = start;
        }

        return options;
    }

    const months = generateMonthOptions()

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

                            <Select value={selectedCycleStart} onValueChange={setSelectedCycleStart}>
                                <SelectTrigger className="w-[180px] sm:w-[240px]">
                                    <SelectValue placeholder="Select period" />
                                </SelectTrigger>
                                <SelectContent>
                                    {months.map((month) => (
                                        <SelectItem key={month.value} value={month.value}>
                                            {month.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

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
