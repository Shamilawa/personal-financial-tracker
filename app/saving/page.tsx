import { getSavingsGoals } from "@/lib/saving-actions"
import { getSettings, getAccounts } from "@/lib/actions"
import { SavingDashboard } from "@/components/saving-dashboard"

export const dynamic = 'force-dynamic';

export default async function SavingPage() {
    const [goals, settings, accounts] = await Promise.all([
        getSavingsGoals(),
        getSettings(),
        getAccounts()
    ])

    return <SavingDashboard goals={goals} currency={settings.currency || "USD"} accounts={accounts} />
}
