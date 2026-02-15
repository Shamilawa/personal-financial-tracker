"use client"

import { Debt } from "@/lib/definitions"
import { DebtSummary } from "./debt-summary"
import { DebtList } from "./debt-list"
import { DebtForm } from "./debt-form"
import { Separator } from "@/components/ui/separator"

type DebtDashboardProps = {
    debts: Debt[]
}

export function DebtDashboard({ debts }: DebtDashboardProps) {
    return (
        <div className="flex flex-col gap-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Debt Tracking</h1>
                    <p className="text-muted-foreground">
                        Manage your liabilities and track repayment progress.
                    </p>
                </div>
                <DebtForm />
            </div>

            <DebtSummary debts={debts} />

            <Separator />

            <div>
                <h2 className="text-xl font-semibold mb-4">Your Debts</h2>
                <DebtList debts={debts} />
            </div>
        </div>
    )
}
