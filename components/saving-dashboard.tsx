"use client"

import { SavingsGoal, Account } from "@/lib/definitions"
import { SavingList } from "./saving-list"
import { SavingForm } from "./saving-form"
import { Separator } from "@/components/ui/separator"
import { DashboardShell } from "@/components/layout/shell"
import { PageHeader } from "@/components/layout/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PiggyBank, Target, TrendingUp } from "lucide-react"

type SavingDashboardProps = {
    goals: SavingsGoal[]
    currency: string
    accounts: Account[]
}

export function SavingDashboard({ goals, currency, accounts }: SavingDashboardProps) {
    const totalSaved = goals.reduce((sum, goal) => sum + goal.current_balance, 0)
    const totalTarget = goals.reduce((sum, goal) => sum + goal.target_amount, 0)

    // Calculate overall progress percentage
    const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-US", { style: "currency", currency: currency || "USD" }).format(amount)
    }

    return (
        <>
            <PageHeader heading="Savings Goals" text="Track your financial targets and manage your saving progress.">
                <SavingForm accounts={accounts} currency={currency} />
            </PageHeader>
            <DashboardShell>
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Saved</CardTitle>
                            <PiggyBank className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(totalSaved)}</div>
                            <p className="text-xs text-muted-foreground mt-1 text-green-600 font-medium">
                                Keep it up!
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Target</CardTitle>
                            <Target className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(totalTarget)}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Across {goals.length} active {goals.length === 1 ? 'goal' : 'goals'}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{overallProgress.toFixed(1)}%</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                of your total savings target
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Separator />

                <div>
                    <h2 className="text-xl font-semibold mb-6">Your Goals</h2>
                    <SavingList goals={goals} currency={currency} accounts={accounts} />
                </div>
            </DashboardShell>
        </>
    )
}
