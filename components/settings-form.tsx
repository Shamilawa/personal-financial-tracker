"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { updateSettings } from "@/lib/actions"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

const CURRENCIES = [
    { value: "USD", label: "USD ($)" },
    { value: "EUR", label: "EUR (€)" },
    { value: "GBP", label: "GBP (£)" },
    { value: "JPY", label: "JPY (¥)" },
    { value: "LKR", label: "LKR (Rs)" },
    { value: "AUD", label: "AUD ($)" },
    { value: "CAD", label: "CAD ($)" },
];

type SettingsFormProps = {
    initialCycleStartDay: number
    initialCurrency: string
}

export function SettingsForm({ initialCycleStartDay, initialCurrency }: SettingsFormProps) {
    const [cycleStartDay, setCycleStartDay] = useState(initialCycleStartDay)
    const [currency, setCurrency] = useState(initialCurrency)
    const [isLoading, setIsLoading] = useState(false)

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        try {
            await updateSettings(cycleStartDay, currency)
            toast.success("Settings updated successfully")
        } catch (error) {
            toast.error("Failed to update settings")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Preferences</CardTitle>
                <CardDescription>
                    Manage your global application settings.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSave} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="currency">Currency</Label>
                        <Select value={currency} onValueChange={setCurrency}>
                            <SelectTrigger id="currency">
                                <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                            <SelectContent>
                                {CURRENCIES.map((c) => (
                                    <SelectItem key={c.value} value={c.value}>
                                        {c.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="cycleDay">Cycle Start Day</Label>
                        <Input
                            id="cycleDay"
                            type="number"
                            min={1}
                            max={31}
                            value={cycleStartDay}
                            onChange={(e) => setCycleStartDay(parseInt(e.target.value))}
                        />
                        <p className="text-xs text-muted-foreground">
                            The day of the month your budget cycle resets.
                        </p>
                    </div>

                    <Button type="submit" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Preferences
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
