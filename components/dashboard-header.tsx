import { TransactionForm } from "@/components/transaction-form"
import { TransferForm } from "@/components/transfer-form"
import { DateRangeNavigator } from "@/components/date-range-navigator"
import { Transaction, Category, Account, RecurringTransaction } from "@/lib/definitions"
import { PageHeader } from "@/components/layout/header"

interface DashboardHeaderProps {
    accounts: Account[]
    categories: Category[]
    currency: string
    cycleStartDay: number
    selectedCycleStart: string
    onDateChange: (date: string) => void
    recurringTransactions: RecurringTransaction[]
}

export function DashboardHeader({
    accounts,
    categories,
    currency,
    cycleStartDay,
    selectedCycleStart,
    onDateChange,
    recurringTransactions,
}: DashboardHeaderProps) {
    return (
        <PageHeader heading="Dashboard">
            <div className="flex items-center gap-2 max-w-[calc(100vw-150px)] overflow-x-auto no-scrollbar">
                {/* Context / Filters Group */}
                <div className="flex items-center gap-2">
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
                    <TransferForm accounts={accounts} recurringTransactions={recurringTransactions} categories={categories} />

                    <TransactionForm
                        categories={categories}
                        currency={currency}
                        accounts={accounts}
                    />
                </div>
            </div>
        </PageHeader>
    )
}
