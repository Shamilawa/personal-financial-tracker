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
import { ArrowRightLeft, Loader2 } from "lucide-react"
import { transferFunds } from "@/lib/actions"
import { toast } from "sonner"
import { Account, RecurringTransaction, Category } from "@/lib/definitions"
import { RecurringList } from "@/components/recurring-list"
import { TransactionConfirmationDialog } from "@/components/transaction-confirmation-dialog"
import { CreateRecurringDialog } from "@/components/create-recurring-dialog"

type TransferFormProps = {
    accounts: Account[]
    recurringTransactions: RecurringTransaction[]
    categories: Category[]
}

export function TransferForm({ accounts, recurringTransactions, categories }: TransferFormProps) {
    const [open, setOpen] = useState(false)
    const [activeTab, setActiveTab] = useState("transfer")

    // Transfer Form State
    const [sourceId, setSourceId] = useState("")
    const [destId, setDestId] = useState("")
    const [amount, setAmount] = useState("")
    const [date, setDate] = useState(new Date().toISOString().split("T")[0])
    const [isLoading, setIsLoading] = useState(false)

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

    const processSubmit = async () => {
        setIsLoading(true)
        setShowConfirm(false) // Close confirm if open

        try {
            // One-time Transfer
            await transferFunds(sourceId, destId, Number(amount), date)
            toast.success("Transfer successful")
            setOpen(false)
            resetForm()
        } catch (error) {
            toast.error("Failed to process request")
        } finally {
            setIsLoading(false)
        }
    }

    const resetForm = () => {
        setAmount("")
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
                <DialogContent className="sm:max-w-[600px] h-[80vh] sm:h-auto overflow-y-auto">
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

                                <div className="flex justify-center py-6">
                                    <div className="flex items-baseline gap-1 border-b border-border hover:border-foreground/50 focus-within:border-foreground transition-colors px-8 pb-2">
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            className="font-bold text-6xl h-auto border-0 p-0 focus-visible:ring-0 w-[240px] text-center bg-transparent shadow-none placeholder:text-muted-foreground/20"
                                            placeholder="0"
                                        />
                                        <span className="text-4xl text-muted-foreground font-medium">$</span>
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

                                <Button type="submit" disabled={isLoading} className="w-full mt-4">
                                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    Transfer Funds
                                </Button>
                            </form>
                        </TabsContent>

                        <TabsContent value="recurring" className="mt-4 space-y-4">
                            <div className="flex justify-end">
                                <CreateRecurringDialog accounts={accounts} categories={categories} />
                            </div>
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
