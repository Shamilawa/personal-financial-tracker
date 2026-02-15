"use client"

import { Wallet } from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import { TransactionForm } from "@/components/transaction-form"
import { TransferForm } from "@/components/transfer-form"
import { DateRangeNavigator } from "@/components/date-range-navigator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Transaction, Category, Account } from "@/lib/definitions"

interface DashboardHeaderProps {
    accounts: Account[]
    categories: Category[]
    currency: string
    cycleStartDay: number
    selectedAccountId: string
    onAccountChange: (value: string) => void
    selectedCycleStart: string
    onDateChange: (date: string) => void
}

export function DashboardHeader({
    accounts,
    categories,
    currency,
    cycleStartDay,
    selectedAccountId,
    onAccountChange,
    selectedCycleStart,
    onDateChange,
}: DashboardHeaderProps) {
    return (
        <header className="sticky top-0 z-10 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-4 py-3 w-full">
                <div className="flex items-center gap-3">
                    <SidebarTrigger className="-ml-1" />
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">Dashboard</h1>
                    </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    {/* Context / Filters Group */}
                    <div className="flex items-center gap-2">
                        <Select value={selectedAccountId} onValueChange={onAccountChange}>
                            <SelectTrigger className="w-[200px] h-9 font-bold">
                                <div className="flex items-center gap-2 truncate">
                                    <Wallet className="h-4 w-4 shrink-0 text-primary" />
                                    <SelectValue placeholder="Select Account" />
                                </div>
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
                            onDateChange={onDateChange}
                        />
                    </div>

                    {/* Separator */}
                    <div className="h-6 w-px bg-border mx-2 hidden sm:block" />

                    {/* Actions Group */}
                    <div className="flex items-center gap-2">
                        <TransferForm accounts={accounts} />

                        <TransactionForm
                            categories={categories}
                            currency={currency}
                            accounts={accounts}
                            defaultAccountId={selectedAccountId !== "all" ? selectedAccountId : undefined}
                        />
                    </div>
                </div>
            </div>
        </header>
    )
}
