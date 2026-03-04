"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { addFundsToGoal } from "@/lib/saving-actions"
import { toast } from "sonner"
import { SavingsGoal, Account } from "@/lib/definitions"

type SavingAddFundsDialogProps = {
    goal: SavingsGoal | null
    accounts: Account[]
    currency: string
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function SavingAddFundsDialog({
    goal,
    accounts,
    currency,
    open,
    onOpenChange,
}: SavingAddFundsDialogProps) {
    const [amount, setAmount] = useState("")
    const [sourceAccountId, setSourceAccountId] = useState("")
    const [date, setDate] = useState(new Date().toISOString().split("T")[0])
    const [loading, setLoading] = useState(false)

    // Derived states
    const selectedAccount = accounts.find((a) => a.id === sourceAccountId)
    const amountNum = Number(amount)
    const isInsufficient = selectedAccount ? selectedAccount.balance < amountNum : false

    useEffect(() => {
        if (open && goal) {
            setAmount("")
            setDate(new Date().toISOString().split("T")[0])
            setSourceAccountId(goal.linked_account_id)
        }
    }, [open, goal])

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat("en-US", { style: "currency", currency: currency || "USD" }).format(val)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!goal || !amount || !sourceAccountId) return

        if (amountNum <= 0) {
            toast.error("Amount must be greater than zero")
            return
        }

        if (isInsufficient) {
            toast.error("Insufficient balance in the selected account")
            return
        }

        setLoading(true)
        try {
            await addFundsToGoal(goal.id, sourceAccountId, amountNum, date)
            toast.success(`Successfully added funds to ${goal.name}`)
            onOpenChange(false)
        } catch (error) {
            toast.error("Failed to add funds")
        } finally {
            setLoading(false)
        }
    }

    if (!goal) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Funds to Goal</DialogTitle>
                    <DialogDescription>
                        Transfer money towards <span className="font-semibold text-foreground">{goal.name}</span>.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-5 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="fundingAmount">Amount to Add</Label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground font-medium">
                                {new Intl.NumberFormat("en-US", { style: "currency", currency: currency || "USD" }).format(0).replace(/\d.*$/, '')}
                            </div>
                            <Input
                                id="fundingAmount"
                                type="number"
                                step="0.01"
                                min="0.01"
                                placeholder="0.00"
                                className="pl-8 text-lg font-semibold"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                autoFocus
                                required
                            />
                        </div>
                        {amountNum > 0 && goal.target_amount && (
                            <p className="text-xs text-muted-foreground mt-1">
                                Will bring balance to <span className="font-medium text-foreground">{formatCurrency(goal.current_balance + amountNum)}</span>
                                {goal.current_balance + amountNum >= goal.target_amount && " 🎉"}
                            </p>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="sourceAccount">Take from Account</Label>
                        <Select value={sourceAccountId} onValueChange={setSourceAccountId} required>
                            <SelectTrigger id="sourceAccount" className={isInsufficient ? "border-destructive text-destructive focus:ring-destructive" : ""}>
                                <SelectValue placeholder="Select account" />
                            </SelectTrigger>
                            <SelectContent>
                                {accounts.map((account) => (
                                    <SelectItem key={account.id} value={account.id}>
                                        <div className="flex justify-between items-center w-full min-w-[200px]">
                                            <span>{account.name}</span>
                                            <span className="text-muted-foreground text-xs ml-4">
                                                {formatCurrency(account.balance)}
                                            </span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {isInsufficient && (
                            <p className="text-xs font-medium text-destructive mt-1">
                                Insufficient balance. Available: {formatCurrency(selectedAccount?.balance || 0)}
                            </p>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="fundingDate">Date</Label>
                        <Input
                            id="fundingDate"
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required
                        />
                    </div>

                    <DialogFooter className="mt-2">
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading || isInsufficient || !amount}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Confirm Transfer
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
