import { getDebts } from "@/lib/debt-actions"
import { getSettings, getAccounts } from "@/lib/actions"
import { DebtDashboard } from "@/components/debt-dashboard"

export const dynamic = 'force-dynamic';

export default async function DebtPage() {
    const [debts, settings, accounts] = await Promise.all([
        getDebts(),
        getSettings(),
        getAccounts()
    ])

    return <DebtDashboard debts={debts} currency={settings.currency || "USD"} accounts={accounts} />
}
