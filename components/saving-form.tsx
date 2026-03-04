"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Plus, Loader2 } from "lucide-react"
import { addSavingsGoal, updateSavingsGoal } from "@/lib/saving-actions"
import { toast } from "sonner"
import { SavingsGoal, Account } from "@/lib/definitions"

type SavingFormProps = {
    accounts: Account[]
    currency: string
    goalToEdit?: SavingsGoal
    open?: boolean
    onOpenChange?: (open: boolean) => void
    trigger?: React.ReactNode
}

export function SavingForm({ accounts, currency, goalToEdit, open: controlledOpen, onOpenChange: setControlledOpen, trigger }: SavingFormProps) {
    const [internalOpen, setInternalOpen] = useState(false)
    const isControlled = controlledOpen !== undefined
    const open = isControlled ? controlledOpen : internalOpen

    const setOpen = (value: boolean) => {
        if (isControlled) {
            setControlledOpen?.(value)
        } else {
            setInternalOpen(value)
        }
    }

    const formatCurrencyPlaceholder = () => {
        return new Intl.NumberFormat("en-US", { style: "currency", currency: currency || "USD" }).format(0).replace(/\d.*$/, '0.00')
    }

    const [name, setName] = useState("")
    const [targetAmount, setTargetAmount] = useState("")
    const [currentBalance, setCurrentBalance] = useState("0")
    const [targetDate, setTargetDate] = useState("")
    const [linkedAccountId, setLinkedAccountId] = useState("")
    const [notes, setNotes] = useState("")
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (goalToEdit) {
            setName(goalToEdit.name)
            setTargetAmount(goalToEdit.target_amount.toString())
            setCurrentBalance(goalToEdit.current_balance.toString())
            setTargetDate(goalToEdit.target_date || "")
            setLinkedAccountId(goalToEdit.linked_account_id)
            setNotes(goalToEdit.notes || "")
        } else {
            if (open) {
                setName("")
                setTargetAmount("")
                setCurrentBalance("0")
                setTargetDate("")

                // Pre-select the first 'saving' or 'main' account
                const preferredAccount = accounts.find(a => a.type === 'saving') || accounts[0]
                setLinkedAccountId(preferredAccount?.id || "")

                setNotes("")
            }
        }
    }, [goalToEdit, open, accounts])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!name || !targetAmount || !linkedAccountId) {
            toast.error("Please fill in required fields (Name, Target Amount, Linked Account)")
            return
        }

        const numericTarget = Number(targetAmount)
        if (numericTarget <= 0) {
            toast.error("Target amount must be greater than zero.")
            return
        }

        setLoading(true)
        try {
            const goalData = {
                name,
                target_amount: numericTarget,
                current_balance: Number(currentBalance) || 0,
                target_date: targetDate || undefined,
                linked_account_id: linkedAccountId,
                notes,
            }

            if (goalToEdit) {
                await updateSavingsGoal(goalToEdit.id, goalData)
                toast.success("Goal updated successfully")
            } else {
                await addSavingsGoal(goalData)
                toast.success("Goal created successfully")
            }

            setOpen(false)
        } catch (error) {
            toast.error(goalToEdit ? "Failed to update goal" : "Failed to create goal")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {trigger ? (
                <DialogTrigger asChild>{trigger}</DialogTrigger>
            ) : (
                <DialogTrigger asChild>
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Create Goal
                    </Button>
                </DialogTrigger>
            )}
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{goalToEdit ? "Edit Savings Goal" : "Create Savings Goal"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Goal Name <span className="text-destructive">*</span></Label>
                        <Input
                            id="name"
                            placeholder="e.g. Dream Vacation, Red Ferrari"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            maxLength={50}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="targetAmount">Target Amount <span className="text-destructive">*</span></Label>
                            <Input
                                id="targetAmount"
                                type="number"
                                step="0.01"
                                min="0.01"
                                placeholder={formatCurrencyPlaceholder()}
                                value={targetAmount}
                                onChange={(e) => setTargetAmount(e.target.value)}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="currentBalance">Initial/Current Saved</Label>
                            <Input
                                id="currentBalance"
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder={formatCurrencyPlaceholder()}
                                value={currentBalance}
                                onChange={(e) => setCurrentBalance(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="linkedAccount">Linked Account <span className="text-destructive">*</span></Label>
                            <Select value={linkedAccountId} onValueChange={setLinkedAccountId} required>
                                <SelectTrigger id="linkedAccount">
                                    <SelectValue placeholder="Select an account" />
                                </SelectTrigger>
                                <SelectContent>
                                    {accounts.map(account => (
                                        <SelectItem key={account.id} value={account.id}>
                                            {account.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="targetDate">Target Date (Optional)</Label>
                            <Input
                                id="targetDate"
                                type="date"
                                value={targetDate}
                                onChange={(e) => setTargetDate(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="notes">Motivation / Notes</Label>
                        <Textarea
                            id="notes"
                            placeholder="Why are you saving for this?"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="resize-none"
                        />
                    </div>

                    <DialogFooter className="mt-4">
                        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {goalToEdit ? "Save Changes" : "Create Goal"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
