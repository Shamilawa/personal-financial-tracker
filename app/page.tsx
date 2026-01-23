import { getTransactions, getCategories, getSettings } from "@/lib/actions"
import { FinancialTrackerDashboard } from "@/components/financial-tracker-dashboard"

export const dynamic = 'force-dynamic';

export default async function Page() {
  const [transactions, categories, settings] = await Promise.all([
    getTransactions(),
    getCategories(),
    getSettings()
  ])
  return <FinancialTrackerDashboard transactions={transactions} categories={categories} settings={settings} />
}
