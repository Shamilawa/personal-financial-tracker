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
import { Account, Category } from "@/lib/definitions"
import { addRecurringTransaction } from "@/lib/recurring-actions"
import { toast } from "sonner"
import { Loader2, Plus } from "lucide-react"

type CreateRecurringDialogProps = {
    accounts: Account[]
    categories: Category[]
    onTransactionAdded?: () => void
}

export function CreateRecurringDialog({ accounts, categories, onTransactionAdded }: CreateRecurringDialogProps) {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    // Form State
    const [type, setType] = useState<"transfer" | "expense" | "income">("expense")
    const [accountId, setAccountId] = useState("")
    const [toAccountId, setToAccountId] = useState("") // For transfer
    const [categoryId, setCategoryId] = useState("")   // For income/expense
    const [amount, setAmount] = useState("")
    const [description, setDescription] = useState("")
    const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0])

    // Recurrence
    const [intervalUnit, setIntervalUnit] = useState<"day" | "week" | "month" | "year">("month")
    const [intervalValue, setIntervalValue] = useState(1)
    const [endDate, setEndDate] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validation
        if (!accountId || !startDate || !description) {
            toast.error("Please fill in all required fields")
            return
        }
        if (type === 'transfer' && !toAccountId) {
            toast.error("Please select a destination account")
            return
        }
        if (type === 'transfer' && accountId === toAccountId) {
            toast.error("Source and destination must be different")
            return
        }
        if (type !== 'transfer' && !categoryId) {
            toast.error("Please select a category")
            return
        }

        setIsLoading(true)
        try {
            const result = await addRecurringTransaction({
                account_id: accountId,
                to_account_id: type === 'transfer' ? toAccountId : undefined,
                type,
                category: type === 'transfer' ? 'Transfer' : categories.find(c => c.id === categoryId)?.name || 'Uncategorized',
                description,
                amount: amount ? Number(amount) : undefined,
                interval_unit: intervalUnit,
                interval_value: intervalValue,
                start_date: startDate,
                end_date: endDate || undefined
            })

            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success("Recurring transaction created")
                setOpen(false)
                resetForm()
                onTransactionAdded?.()
            }
        } catch (error) {
            toast.error("Failed to create transaction")
        } finally {
            setIsLoading(false)
        }
    }

    const resetForm = () => {
        setAmount("")
        setDescription("")
        // Keep repetitive settings for convenience?
        // Maybe reset category/accounts
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2 w-full sm:w-auto">
                    <Plus className="h-4 w-4" />
                    New Recurring Payment
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Create Recurring Payment</DialogTitle>
                    <DialogDescription>
                        Set up a new recurring transaction rule.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="grid gap-4 py-4">

                    {/* Type Selection */}
                    <div className="grid grid-cols-3 gap-2">
                        <Button
                            type="button"
                            variant={type === 'expense' ? 'default' : 'outline'}
                            onClick={() => setType('expense')}
                            className="w-full"
                        >
                            Expense
                        </Button>
                        <Button
                            type="button"
                            variant={type === 'transfer' ? 'default' : 'outline'}
                            onClick={() => setType('transfer')}
                            className="w-full"
                        >
                            Transfer
                        </Button>
                        <Button
                            type="button"
                            variant={type === 'income' ? 'default' : 'outline'}
                            onClick={() => setType('income')}
                            className="w-full"
                        >
                            Income
                        </Button>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label>Account</Label>
                            <Select value={accountId} onValueChange={setAccountId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Account" />
                                </SelectTrigger>
                                <SelectContent>
                                    {accounts.map(acc => (
                                        <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {type === 'transfer' ? (
                            <div className="grid gap-2">
                                <Label>To Account</Label>
                                <Select value={toAccountId} onValueChange={setToAccountId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Destination" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {accounts.filter(a => a.id !== accountId).map(acc => (
                                            <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        ) : (
                            <div className="grid gap-2">
                                <Label>Category</Label>
                                <Select value={categoryId} onValueChange={setCategoryId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.filter(c => c.type === type).map(cat => (
                                            <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label>Description</Label>
                        <Input
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="e.g. Rent, Netflix, Savings"
                        />
                    </div>

                    {/* Amount removed as per request */}
                    {/* <div className="grid gap-2">
                        <Label>Amount</Label>
                        <Input 
                            type="number" 
                            step="0.01" 
                            value={amount} 
                            onChange={e => setAmount(e.target.value)}
                            placeholder="0.00"
                        />
                    </div> */}

                    <div className="grid gap-4 pt-2 border-t mt-2">
                        <Label className="text-base font-semibold">Schedule</Label>

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
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Start Date</Label>
                                <Input
                                    type="date"
                                    value={startDate}
                                    onChange={e => setStartDate(e.target.value)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>End Date (Optional)</Label>
                                <Input
                                    type="date"
                                    value={endDate}
                                    onChange={e => setEndDate(e.target.value)}
                                    min={startDate}
                                />
                            </div>
                        </div>
                    </div>

                    <Button type="submit" disabled={isLoading} className="w-full mt-4">
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Create Recurring Rule
                    </Button>

                </form>
            </DialogContent>
        </Dialog>
    )
}
