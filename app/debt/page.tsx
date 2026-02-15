import { getDebts } from "@/lib/debt-actions"
import { DebtDashboard } from "@/components/debt-dashboard"

export const dynamic = 'force-dynamic';

export default async function DebtPage() {
    const debts = await getDebts()

    return <DebtDashboard debts={debts} />
}
