import { getTransactions, getCategories, getSettings, getAccounts } from "@/lib/actions"
import { FinancialTrackerDashboard } from "@/components/financial-tracker-dashboard"

export const dynamic = 'force-dynamic';

export default async function Page() {
  const [transactions, categories, settings, accounts] = await Promise.all([
    getTransactions(),
    getCategories(),
    getSettings(),
    getAccounts()
  ])
  return <FinancialTrackerDashboard
    transactions={transactions}
    categories={categories}
    settings={settings}
    accounts={accounts}
  />
}
