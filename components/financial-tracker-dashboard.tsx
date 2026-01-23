"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar, Settings } from "lucide-react"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { addMonths, format, setDate, startOfMonth, subMonths } from "date-fns"

import { TransactionForm } from "@/components/transaction-form"
import { SummaryCards } from "@/components/summary-cards"
import { TransactionsList } from "@/components/transactions-list"
import { ExpenseChart } from "@/components/expense-chart"
import { CategoryBreakdown } from "@/components/category-breakdown"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Wallet } from "lucide-react"
import { Transaction, Category } from "@/lib/definitions"
import { updateSettings } from "@/lib/actions"
import { toast } from "sonner"

type FinancialTrackerDashboardProps = {
    transactions: Transaction[];
    categories: Category[];
    settings: { cycle_start_day: number; currency: string };
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

export function FinancialTrackerDashboard({ transactions, categories, settings }: FinancialTrackerDashboardProps) {
    const [cycleStartDay, setCycleStartDay] = useState(settings.cycle_start_day)
    const [tempStartDay, setTempStartDay] = useState(settings.cycle_start_day)
    const [currency, setCurrency] = useState(settings.currency || 'USD')
    const [tempCurrency, setTempCurrency] = useState(settings.currency || 'USD')
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)

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

    const handleSaveSettings = async () => {
        try {
            await updateSettings(tempStartDay, tempCurrency)
            setCycleStartDay(tempStartDay)
            setCurrency(tempCurrency)
            setIsSettingsOpen(false)
            toast.success("Settings updated")
        } catch (error) {
            toast.error("Failed to update settings")
        }
    }

    const filteredTransactions = transactions.filter((t) => {
        const txCycleStart = getCycleStartDate(t.date)
        return txCycleStart === selectedCycleStart
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
                            <div className="p-2 rounded-lg bg-primary">
                                <Wallet className="h-6 w-6 text-primary-foreground" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight">FinTrack</h1>
                                <p className="text-sm text-muted-foreground">
                                    Personal Finance Tracker
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                            <Popover open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" size="icon">
                                        <Settings className="h-4 w-4" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80">
                                    <div className="grid gap-4">
                                        <div className="space-y-2">
                                            <h4 className="font-medium leading-none">Settings</h4>
                                            <p className="text-sm text-muted-foreground">
                                                Configure your financial preferences.
                                            </p>
                                        </div>
                                        <div className="grid gap-2">
                                            <div className="grid grid-cols-3 items-center gap-4">
                                                <Label htmlFor="startDay">Start Day</Label>
                                                <Input
                                                    id="startDay"
                                                    type="number"
                                                    min={1}
                                                    max={31}
                                                    value={tempStartDay}
                                                    onChange={(e) => {
                                                        const val = parseInt(e.target.value)
                                                        if (val >= 1 && val <= 31) {
                                                            setTempStartDay(val)
                                                        }
                                                    }}
                                                    className="col-span-2 h-8"
                                                />
                                            </div>
                                            <div className="grid grid-cols-3 items-center gap-4">
                                                <Label htmlFor="currency">Currency</Label>
                                                <Select value={tempCurrency} onValueChange={setTempCurrency}>
                                                    <SelectTrigger id="currency" className="col-span-2 h-8">
                                                        <SelectValue placeholder="Select currency" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {CURRENCIES.map((c) => (
                                                            <SelectItem key={c.value} value={c.value}>
                                                                {c.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <Button size="sm" onClick={handleSaveSettings}>Save Changes</Button>
                                        </div>
                                    </div>
                                </PopoverContent>
                            </Popover>

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
                            <TransactionForm categories={categories} currency={currency} />
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
