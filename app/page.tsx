import { getTransactions, getCategories, getSettings, getAccounts } from "@/lib/actions"
import { FinancialTrackerDashboard } from "@/components/financial-tracker-dashboard"

export const dynamic = 'force-dynamic';

import { redirect } from "next/navigation"

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const [transactions, categories, settings, accounts] = await Promise.all([
    getTransactions(),
    getCategories(),
    getSettings(),
    getAccounts()
  ])

  const resolvedSearchParams = await searchParams
  const initialAccountId = typeof resolvedSearchParams.account === 'string' ? resolvedSearchParams.account : undefined

  // If no account is selected in URL, redirect to the first primary account
  if (!initialAccountId) {
    const primaryAccount = accounts.find(acc => acc.type === 'main')
    if (primaryAccount) {
      redirect(`/?account=${primaryAccount.id}`)
    }
  }

  return <FinancialTrackerDashboard
    transactions={transactions}
    categories={categories}
    settings={settings}
    accounts={accounts}
    initialAccountId={initialAccountId}
  />
}
