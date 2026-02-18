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
import { Plus, Loader2 } from "lucide-react"
import { addDebt, updateDebt } from "@/lib/debt-actions"
import { toast } from "sonner"
import { Debt } from "@/lib/definitions"

type DebtFormProps = {
    debtToEdit?: Debt
    open?: boolean
    onOpenChange?: (open: boolean) => void
    trigger?: React.ReactNode
}

export function DebtForm({ debtToEdit, open: controlledOpen, onOpenChange: setControlledOpen, trigger }: DebtFormProps) {
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

    const [name, setName] = useState("")
    const [totalAmount, setTotalAmount] = useState("")
    const [currentBalance, setCurrentBalance] = useState("")
    const [interestRate, setInterestRate] = useState("")
    const [minimumPayment, setMinimumPayment] = useState("")
    const [dueDate, setDueDate] = useState("")
    const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0])
    const [notes, setNotes] = useState("")
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (debtToEdit) {
            setName(debtToEdit.name)
            setTotalAmount(debtToEdit.total_amount.toString())
            setCurrentBalance(debtToEdit.current_balance.toString())
            setInterestRate(debtToEdit.interest_rate.toString())
            setMinimumPayment(debtToEdit.minimum_payment.toString())
            setDueDate(debtToEdit.due_date || "")
            setStartDate(debtToEdit.start_date || new Date().toISOString().split("T")[0])
            setNotes(debtToEdit.notes || "")
        } else {
            // Reset if opening new
            if (open) {
                setName("")
                setTotalAmount("")
                setCurrentBalance("")
                setInterestRate("")
                setMinimumPayment("")
                setDueDate("")
                setStartDate(new Date().toISOString().split("T")[0])
                setNotes("")
            }
        }
    }, [debtToEdit, open])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name || !totalAmount || !currentBalance) {
            toast.error("Please fill in required fields (Name, Amounts)")
            return
        }

        setLoading(true)
        try {
            const debtData = {
                name,
                total_amount: Number(totalAmount),
                current_balance: Number(currentBalance),
                interest_rate: Number(interestRate) || 0,
                minimum_payment: Number(minimumPayment) || 0,
                due_date: dueDate || undefined,
                start_date: startDate || undefined,
                notes,
            }

            if (debtToEdit) {
                await updateDebt(debtToEdit.id, debtData)
                toast.success("Debt updated successfully")
            } else {
                await addDebt(debtData)
                toast.success("Debt added successfully")
            }

            setOpen(false)
            if (!debtToEdit) {
                setName("")
                setTotalAmount("")
                setCurrentBalance("")
                setInterestRate("")
                setMinimumPayment("")
                setDueDate("")
                setNotes("")
            }
        } catch (error) {
            toast.error(debtToEdit ? "Failed to update debt" : "Failed to add debt")
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
                        Add Debt
                    </Button>
                </DialogTrigger>
            )}
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{debtToEdit ? "Edit Debt" : "Add New Debt"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Debt Name</Label>
                        <Input
                            id="name"
                            placeholder="e.g. Chase Sapphire, Student Loan"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="totalAmount">Total Amount</Label>
                            <Input
                                id="totalAmount"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={totalAmount}
                                onChange={(e) => setTotalAmount(e.target.value)}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="currentBalance">Current Balance</Label>
                            <Input
                                id="currentBalance"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={currentBalance}
                                onChange={(e) => setCurrentBalance(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="interestRate">Interest Rate (%)</Label>
                            <Input
                                id="interestRate"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={interestRate}
                                onChange={(e) => setInterestRate(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="minPayment">Min. Payment</Label>
                            <Input
                                id="minPayment"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={minimumPayment}
                                onChange={(e) => setMinimumPayment(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="startDate">Start Date</Label>
                            <Input
                                id="startDate"
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="dueDate">Next Due Date</Label>
                            <Input
                                id="dueDate"
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                            id="notes"
                            placeholder="Optional notes..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {debtToEdit ? "Save Changes" : "Add Debt"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
