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
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { payDebt } from "@/lib/debt-actions"
import { toast } from "sonner"
import { AmountInput } from "@/components/amount-input"


// We need to ensure we have the correct types. 
// From previous reads, Account has id, name, balance, type.
// Debt has id, name, current_balance, etc.
import { Account, Debt } from "@/lib/definitions"

type DebtPaymentDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    debt: Debt | null
    accounts: Account[]
    currency: string
}

export function DebtPaymentDialog({ open, onOpenChange, debt, accounts, currency }: DebtPaymentDialogProps) {
    const [accountId, setAccountId] = useState("")
    const [amount, setAmount] = useState("")
    const [date, setDate] = useState(new Date().toISOString().split("T")[0])
    const [loading, setLoading] = useState(false)

    // Reset form when opening for a new debt
    useEffect(() => {
        if (open && debt) {
            setAmount(debt.minimum_payment > 0 ? debt.minimum_payment.toString() : "")
            if (accounts.length > 0 && !accountId) {
                setAccountId(accounts[0].id)
            }
        }
    }, [open, debt, accounts, accountId])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!debt || !accountId || !amount) {
            toast.error("Please fill in all fields")
            return
        }

        setLoading(true)
        try {
            await payDebt(
                debt.id,
                accountId,
                Number(amount),
                date
            )
            toast.success("Payment recorded successfully")
            onOpenChange(false)
        } catch (error) {
            toast.error("Failed to record payment")
        } finally {
            setLoading(false)
        }
    }



    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat("en-US", { style: "currency", currency: currency || "USD" }).format(val)
    }

    // Helper to get currency code
    const currencyCode = currency || "USD";

    const amountVal = Number(amount)
    const isFormValid = !loading && !!debt && !!accountId && !!date && !isNaN(amountVal) && amountVal > 0

    if (!debt) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Make a Payment</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label>Paying Debt</Label>
                        <div className="font-medium">{debt.name}</div>
                        <div className="text-sm text-muted-foreground">
                            Balance: {formatCurrency(debt.current_balance)}
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="account">Pay From Account</Label>
                        <Select value={accountId} onValueChange={setAccountId}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select account" />
                            </SelectTrigger>
                            <SelectContent>
                                {accounts.map((acc) => (
                                    <SelectItem key={acc.id} value={acc.id}>
                                        {acc.name} ({formatCurrency(acc.balance)})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
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

                    <AmountInput
                        value={amount}
                        onChange={setAmount}
                        currency={currencyCode}
                    />

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={!isFormValid}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Confirm Payment
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
