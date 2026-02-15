import { Debt } from "@/lib/definitions"
import { DebtSummary } from "./debt-summary"
import { DebtList } from "./debt-list"
import { DebtForm } from "./debt-form"
import { Separator } from "@/components/ui/separator"
import { DashboardShell } from "@/components/layout/shell"
import { PageHeader } from "@/components/layout/header"

type DebtDashboardProps = {
    debts: Debt[]
    currency: string
}

export function DebtDashboard({ debts, currency }: DebtDashboardProps) {
    return (
        <>
            <PageHeader heading="Debt Tracking" text="Manage your liabilities and track repayment progress.">
                <DebtForm />
            </PageHeader>
            <DashboardShell>
                <DebtSummary debts={debts} currency={currency} />

                <Separator />

                <div>
                    <h2 className="text-xl font-semibold mb-4">Your Debts</h2>
                    <DebtList debts={debts} currency={currency} />
                </div>
            </DashboardShell>
        </>
    )
}
