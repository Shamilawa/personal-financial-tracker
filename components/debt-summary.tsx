"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Debt } from "@/lib/definitions"
import { DollarSign, Percent, CalendarClock } from "lucide-react"

type DebtSummaryProps = {
    debts: Debt[]
    currency: string
}

export function DebtSummary({ debts, currency }: DebtSummaryProps) {
    const totalDebt = debts.reduce((sum, debt) => sum + debt.current_balance, 0)
    const totalMonthlyPayment = debts.reduce((sum, debt) => sum + debt.minimum_payment, 0)

    // Weighted Average Interest Rate
    // (Sum of (Balance * Rate)) / Total Balance
    const weightedInterestRate = totalDebt > 0
        ? debts.reduce((sum, debt) => sum + (debt.current_balance * debt.interest_rate), 0) / totalDebt
        : 0

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-US", { style: "currency", currency: currency || "USD" }).format(amount)
    }

    return (
        <div className="grid gap-4 md:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Debt Assessment</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(totalDebt)}</div>
                    <p className="text-xs text-muted-foreground">
                        across {debts.length} active debts
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Monthly Commitments</CardTitle>
                    <CalendarClock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(totalMonthlyPayment)}</div>
                    <p className="text-xs text-muted-foreground">
                        total minimum payments
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg. Interest Rate</CardTitle>
                    <Percent className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{weightedInterestRate.toFixed(2)}%</div>
                    <p className="text-xs text-muted-foreground">
                        weighted by current balance
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
