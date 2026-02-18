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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { ArrowRightLeft, Loader2 } from "lucide-react"
import { transferFunds } from "@/lib/actions"
import { addRecurringTransaction } from "@/lib/recurring-actions"
import { toast } from "sonner"
import { Account, RecurringTransaction } from "@/lib/definitions"
import { RecurringList } from "@/components/recurring-list"
import { TransactionConfirmationDialog } from "@/components/transaction-confirmation-dialog"

type TransferFormProps = {
    accounts: Account[]
    recurringTransactions: RecurringTransaction[]
}

export function TransferForm({ accounts, recurringTransactions }: TransferFormProps) {
    const [open, setOpen] = useState(false)
    const [activeTab, setActiveTab] = useState("transfer")

    // Transfer Form State
    const [sourceId, setSourceId] = useState("")
    const [destId, setDestId] = useState("")
    const [amount, setAmount] = useState("")
    const [date, setDate] = useState(new Date().toISOString().split("T")[0])
    const [isLoading, setIsLoading] = useState(false)

    // Recurring State
    const [isRecurring, setIsRecurring] = useState(false)
    const [intervalUnit, setIntervalUnit] = useState<"day" | "week" | "month" | "year">("month")
    const [intervalValue, setIntervalValue] = useState(1)
    const [endDate, setEndDate] = useState("")

    // Confirmation State
    const [showConfirm, setShowConfirm] = useState(false)
    const [confirmDetails, setConfirmDetails] = useState<any>(null)

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!sourceId || !destId || !amount || !date) {
            toast.error("Please fill in all fields")
            return
        }
        if (sourceId === destId) {
            toast.error("Source and destination accounts must be different")
            return
        }

        if (isRecurring) {
            // Direct submit for creating a recurring rule? Or confirm that too?
            // Usually creating a rule doesn't need "Payment" confirmation, but maybe "Creation" confirmation?
            // The user asked for "Confirmation dialog... showing the From and To account...".
            // Let's assume standard transfer needs confirmation. 
            // Creating a recurring rule is technically not a payment YET.
            // But let's confirm the creation if they want? 
            // Actually, the prompt says "As soon as user clicked on the Pay button a confirmation dialog..." referring to the Recurring LIST pay button.
            // For standard transfer, let's add confirmation too as good practice.

            // For now, let's just process Creation directly, as it's not a payment.
            processSubmit();
        } else {
            // Show Confirmation for One-Time Transfer
            setConfirmDetails({
                sourceAccountId: sourceId,
                targetAccountId: destId,
                amount: Number(amount),
                description: `Transfer to ${accounts.find(a => a.id === destId)?.name}`,
                date: date,
                type: 'transfer'
            })
            setShowConfirm(true)
        }
    }

    const processSubmit = async () => {
        setIsLoading(true)
        setShowConfirm(false) // Close confirm if open

        try {
            if (isRecurring) {
                // Add Recurring Rule
                const result = await addRecurringTransaction({
                    account_id: sourceId,
                    to_account_id: destId,
                    type: 'transfer',
                    category: 'Transfer',
                    description: `Transfer to ${accounts.find(a => a.id === destId)?.name}`,
                    amount: Number(amount),
                    interval_unit: intervalUnit,
                    interval_value: intervalValue,
                    start_date: date,
                    end_date: endDate || undefined
                })

                if (result.error) {
                    toast.error(result.error)
                } else {
                    toast.success("Recurring transfer scheduled")
                    setOpen(false)
                    resetForm()
                }

            } else {
                // One-time Transfer
                await transferFunds(sourceId, destId, Number(amount), date)
                toast.success("Transfer successful")
                setOpen(false)
                resetForm()
            }
        } catch (error) {
            toast.error("Failed to process request")
        } finally {
            setIsLoading(false)
        }
    }

    const resetForm = () => {
        setAmount("")
        setIsRecurring(false)
        setSourceId("")
        setDestId("")
        // Keep date
    }

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button variant="secondary" className="gap-2">
                        <ArrowRightLeft className="h-4 w-4" />
                        Move Money
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[550px]">
                    <DialogHeader>
                        <DialogTitle>Move Money</DialogTitle>
                        <DialogDescription>
                            Transfer funds between accounts or manage recurring payments.
                        </DialogDescription>
                    </DialogHeader>

                    <Tabs defaultValue="transfer" value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="transfer">Transfer</TabsTrigger>
                            <TabsTrigger value="recurring">Recurring</TabsTrigger>
                        </TabsList>

                        <TabsContent value="transfer">
                            <form onSubmit={handleFormSubmit} className="grid gap-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="source">From</Label>
                                        <Select value={sourceId} onValueChange={setSourceId}>
                                            <SelectTrigger className="w-full" id="source">
                                                <SelectValue placeholder="Select source" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {accounts.map((acc) => (
                                                    <SelectItem key={acc.id} value={acc.id}>
                                                        {acc.name} ({acc.balance})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="dest">To</Label>
                                        <Select value={destId} onValueChange={setDestId}>
                                            <SelectTrigger className="w-full" id="dest">
                                                <SelectValue placeholder="Select destination" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {accounts.map((acc) => (
                                                    <SelectItem key={acc.id} value={acc.id} disabled={acc.id === sourceId}>
                                                        {acc.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="amount">Amount</Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                                        <Input
                                            id="amount"
                                            type="number"
                                            step="0.01"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            placeholder="0.00"
                                            className="pl-7"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="date">Date</Label>
                                    <Input
                                        id="date"
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        required
                                    />
                                </div>

                                {/* Recurring Toggle */}
                                <div className="flex flex-col gap-4 border rounded-lg p-4 bg-muted/30">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label className="text-base">Recurring Transfer?</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Schedule this transfer to repeat automatically.
                                            </p>
                                        </div>
                                        <Switch
                                            checked={isRecurring}
                                            onCheckedChange={setIsRecurring}
                                        />
                                    </div>

                                    {isRecurring && (
                                        <div className="grid gap-4 pt-2 animate-in fade-in slide-in-from-top-2">
                                            <div className="flex gap-2 items-end">
                                                <div className="grid gap-2 flex-1">
                                                    <Label>Repeat Every</Label>
                                                    <div className="flex gap-2">
                                                        <Input
                                                            type="number"
                                                            min="1"
                                                            value={intervalValue}
                                                            onChange={(e) => setIntervalValue(Number(e.target.value))}
                                                            className="w-20"
                                                        />
                                                        <Select value={intervalUnit} onValueChange={(val: any) => setIntervalUnit(val)}>
                                                            <SelectTrigger>
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="day">Day(s)</SelectItem>
                                                                <SelectItem value="week">Week(s)</SelectItem>
                                                                <SelectItem value="month">Month(s)</SelectItem>
                                                                <SelectItem value="year">Year(s)</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                                <div className="grid gap-2 flex-1">
                                                    <Label>End Date (Optional)</Label>
                                                    <Input
                                                        type="date"
                                                        value={endDate}
                                                        onChange={(e) => setEndDate(e.target.value)}
                                                        min={date}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <Button type="submit" disabled={isLoading} className="w-full mt-2">
                                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    {isRecurring ? "Schedule Recurring Transfer" : "Transfer Funds"}
                                </Button>
                            </form>
                        </TabsContent>

                        <TabsContent value="recurring" className="mt-4">
                            <RecurringList transactions={recurringTransactions} accounts={accounts} />
                        </TabsContent>
                    </Tabs>
                </DialogContent>
            </Dialog>

            <TransactionConfirmationDialog
                open={showConfirm}
                onOpenChange={setShowConfirm}
                onConfirm={processSubmit}
                details={confirmDetails}
                accounts={accounts}
                isLoading={isLoading}
            />
        </>
    )
}
