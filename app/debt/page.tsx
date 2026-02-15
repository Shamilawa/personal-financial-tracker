import { getDebts } from "@/lib/debt-actions"
import { getSettings } from "@/lib/actions"
import { DebtDashboard } from "@/components/debt-dashboard"

export const dynamic = 'force-dynamic';

export default async function DebtPage() {
    const [debts, settings] = await Promise.all([
        getDebts(),
        getSettings()
    ])

    return <DebtDashboard debts={debts} currency={settings.currency || "USD"} />
}
