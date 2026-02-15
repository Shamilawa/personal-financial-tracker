import { getAccounts, getSettings } from "@/lib/actions"
import { AccountManager } from "@/components/account-manager"
import { SettingsForm } from "@/components/settings-form"
import { DashboardShell } from "@/components/layout/shell"
import { PageHeader } from "@/components/layout/header"

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
    const [accounts, settings] = await Promise.all([
        getAccounts(),
        getSettings()
    ])

    return (
        <>
            <PageHeader heading="Settings" text="Manage your accounts and preferences." />
            <DashboardShell className="max-w-4xl">
                <div className="space-y-8">
                    <section>
                        <AccountManager accounts={accounts} currency={settings.currency || "USD"} />
                    </section>

                    <section>
                        <SettingsForm
                            initialCycleStartDay={settings.cycle_start_day}
                            initialCurrency={settings.currency}
                        />
                    </section>
                </div>
            </DashboardShell>
        </>
    )
}
