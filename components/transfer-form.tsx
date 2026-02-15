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
import { ArrowRightLeft, Loader2 } from "lucide-react"
import { transferFunds } from "@/lib/actions"
import { toast } from "sonner"
import { Account } from "@/lib/definitions"

type TransferFormProps = {
    accounts: Account[]
}

export function TransferForm({ accounts }: TransferFormProps) {
    const [open, setOpen] = useState(false)
    const [sourceId, setSourceId] = useState("")
    const [destId, setDestId] = useState("")
    const [amount, setAmount] = useState("")
    const [date, setDate] = useState(new Date().toISOString().split("T")[0])
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!sourceId || !destId || !amount || !date) {
            toast.error("Please fill in all fields")
            return
        }
        if (sourceId === destId) {
            toast.error("Source and destination accounts must be different")
            return
        }

        setIsLoading(true)
        try {
            await transferFunds(sourceId, destId, Number(amount), date)
            toast.success("Transfer successful")
            setOpen(false)
            setAmount("")
            // Keep date
        } catch (error) {
            toast.error("Failed to transfer funds")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="secondary" className="gap-2">
                    <ArrowRightLeft className="h-4 w-4" />
                    Transfer
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Transfer Funds</DialogTitle>
                    <DialogDescription>
                        Move money between your accounts.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="source">Source Account</Label>
                        <Select value={sourceId} onValueChange={setSourceId}>
                            <SelectTrigger id="source">
                                <SelectValue placeholder="Select source" />
                            </SelectTrigger>
                            <SelectContent>
                                {accounts.map((acc) => (
                                    <SelectItem key={acc.id} value={acc.id}>
                                        {acc.name} (Cur: {acc.balance})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="dest">Destination Account</Label>
                        <Select value={destId} onValueChange={setDestId}>
                            <SelectTrigger id="dest">
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
                    <div className="grid gap-2">
                        <Label htmlFor="amount">Amount</Label>
                        <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            required
                        />
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
                    <Button type="submit" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Transfer
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}
