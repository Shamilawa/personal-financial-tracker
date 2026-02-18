"use client"

import { useState } from "react"
import { RecurringTransaction, Account } from "@/lib/definitions"
import { Button } from "@/components/ui/button"
import { Trash2, RefreshCw, Play, Loader2 } from "lucide-react"
import { deleteRecurringTransaction, triggerRecurringTransaction } from "@/lib/recurring-actions"
import { toast } from "sonner"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { TransactionConfirmationDialog } from "@/components/transaction-confirmation-dialog"
import { isBefore, parseISO, startOfDay } from "date-fns"

type RecurringListProps = {
    transactions: RecurringTransaction[]
    accounts: Account[]
}

export function RecurringList({ transactions, accounts }: RecurringListProps) {

    const [isLoadingId, setIsLoadingId] = useState<string | null>(null)
    const [confirmPayItem, setConfirmPayItem] = useState<RecurringTransaction | null>(null)
    const [showPayConfirm, setShowPayConfirm] = useState(false)

    const handleDelete = async (id: string) => {
        try {
            await deleteRecurringTransaction(id)
            toast.success("Recurring transaction deleted")
        } catch (error) {
            toast.error("Failed to delete transaction")
        }
    }

    const handlePayClick = (tx: RecurringTransaction) => {
        setConfirmPayItem(tx)
        setShowPayConfirm(true)
    }

    const processPayment = async () => {
        if (!confirmPayItem) return

        setIsLoadingId(confirmPayItem.id)
        setShowPayConfirm(false)

        try {
            const result = await triggerRecurringTransaction(confirmPayItem.id)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success("Payment processed successfully")
            }
        } catch (error) {
            toast.error("Failed to process payment")
        } finally {
            setIsLoadingId(null)
            setConfirmPayItem(null)
        }
    }

    const getAccountName = (id: string) => accounts.find(a => a.id === id)?.name || "Unknown Account"

    // Helper to check if due
    const isDue = (dateStr: string) => {
        const today = startOfDay(new Date())
        const nextRun = parseISO(dateStr)
        return isBefore(nextRun, today) || nextRun.getTime() === today.getTime()
    }

    if (transactions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center border rounded-md border-dashed">
                <RefreshCw className="h-8 w-8 text-muted-foreground mb-3 opacity-50" />
                <h3 className="font-semibold text-lg">No Recurring Payments</h3>
                <p className="text-sm text-muted-foreground mt-1">
                    Set up recurring transfers or payments in the "Transfer" or "Add Transaction" tabs.
                </p>
            </div>
        )
    }

    return (
        <>
            <div className="space-y-4">
                {transactions.map((tx) => {
                    const due = isDue(tx.next_run_date)
                    return (
                        <div key={tx.id} className={`flex items-center justify-between p-3 border rounded-lg bg-card text-card-foreground shadow-sm ${due ? 'border-primary/50 bg-primary/5' : ''}`}>
                            <div className="flex flex-col gap-1 overflow-hidden">
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full uppercase ${tx.type === 'income' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                            tx.type === 'expense' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                        }`}>
                                        {tx.type}
                                    </span>
                                    <span className="font-medium truncate">{tx.description}</span>
                                    {due && <span className="text-[10px] font-bold text-primary uppercase border border-primary px-1 rounded">Due</span>}
                                </div>
                                <div className="text-xs text-muted-foreground space-y-0.5">
                                    <p>
                                        {getAccountName(tx.account_id)}
                                        {tx.to_account_id && ` → ${getAccountName(tx.to_account_id)}`}
                                    </p>
                                    <p>
                                        Every {tx.interval_value} {tx.interval_unit}(s) • Next: {tx.next_run_date}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="text-right mr-2 hidden sm:block">
                                    <p className="font-bold">
                                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(tx.amount)}
                                    </p>
                                </div>

                                <Button
                                    size="sm"
                                    variant={due ? "default" : "outline"}
                                    className="h-8 gap-1"
                                    onClick={() => handlePayClick(tx)}
                                    disabled={isLoadingId === tx.id}
                                >
                                    {isLoadingId === tx.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
                                    Pay
                                </Button>

                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive/90">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Stop Recurring Payment?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This will permanently delete this recurring rule. Past transactions created by this rule will remain.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDelete(tx.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                                Stop Payment
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </div>
                    )
                })}
            </div>

            <TransactionConfirmationDialog
                open={showPayConfirm}
                onOpenChange={setShowPayConfirm}
                onConfirm={processPayment}
                accounts={accounts}
                title="Confirm Recurring Payment"
                isLoading={!!isLoadingId}
                details={confirmPayItem ? {
                    sourceAccountId: confirmPayItem.account_id,
                    targetAccountId: confirmPayItem.to_account_id,
                    amount: confirmPayItem.amount,
                    description: confirmPayItem.description,
                    date: new Date().toISOString(), // Pay NOW
                    type: confirmPayItem.type
                } : null}
            />
        </>
    )
}
