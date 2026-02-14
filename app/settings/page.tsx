import { getAccounts, getSettings } from "@/lib/actions"
import { AccountManager } from "@/components/account-manager"
import { SettingsForm } from "@/components/settings-form"

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
    const [accounts, settings] = await Promise.all([
        getAccounts(),
        getSettings()
    ])

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
            <header>
                <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
                <p className="text-sm text-muted-foreground">
                    Manage your accounts and preferences.
                </p>
            </header>

            <section>
                <AccountManager accounts={accounts} />
            </section>

            <section>
                <SettingsForm
                    initialCycleStartDay={settings.cycle_start_day}
                    initialCurrency={settings.currency}
                />
            </section>
        </div>
    )
}
