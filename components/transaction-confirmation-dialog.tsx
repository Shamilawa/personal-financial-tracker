"use client"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Account } from "@/lib/definitions"
import { format } from "date-fns"
import { Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"

type TransactionDetails = {
    sourceAccountId: string;
    targetAccountId?: string; // For transfers
    amount?: number;
    description: string;
    date: string;
    type: "income" | "expense" | "transfer";
}

type TransactionConfirmationDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: (amount?: number) => void;
    details: TransactionDetails | null;
    accounts: Account[];
    isLoading?: boolean;
    title?: string;
    editableAmount?: boolean;
    currency?: string;
}

export function TransactionConfirmationDialog({
    open,
    onOpenChange,
    onConfirm,
    details,
    accounts,
    isLoading = false,
    title = "Confirm Transaction",
    editableAmount = false,
    currency = "$"
}: TransactionConfirmationDialogProps) {
    const [amountStr, setAmountStr] = useState("")

    useEffect(() => {
        if (open && details) {
            setAmountStr(details.amount !== undefined && details.amount !== null ? details.amount.toString() : "")
        }
    }, [open])

    if (!details) return null;

    const sourceAccount = accounts.find(a => a.id === details.sourceAccountId);
    const targetAccount = details.targetAccountId ? accounts.find(a => a.id === details.targetAccountId) : null;

    // Helper to format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency === "$" ? 'USD' : currency }).format(amount).replace('USD', '$');
        // Quick fallback for formatting. Ideally we use the currency code.
        // If currency is just a symbol like "$", Intl might not like it.
        // But in our app currency is likely "USD", "EUR" etc.
        // If currency IS the code (e.g. USD), straightforward.
    }

    // Better formatted wrapper
    const displayCurrency = (val: number) => {
        try {
            return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(val);
        } catch {
            return `${currency}${val.toFixed(2)}`;
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>
                        Please review {editableAmount ? "and enter" : ""} the transaction details below.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-3 py-3 text-sm">
                    <div className="flex justify-between border-b pb-2">
                        <span className="text-muted-foreground">Type</span>
                        <span className="font-medium capitalize">{details.type}</span>
                    </div>

                    <div className="flex justify-between items-center border-b pb-2">
                        <span className="text-muted-foreground">Amount</span>
                        {editableAmount ? (
                            <div className="w-full flex justify-center py-4">
                                <div className="flex items-baseline gap-2 border-b border-border hover:border-foreground/50 focus-within:border-foreground transition-colors px-4 pb-1">
                                    <span className="text-3xl text-muted-foreground font-medium self-center">{currency}</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={amountStr}
                                        onChange={(e) => setAmountStr(e.target.value)}
                                        className="text-right font-bold text-6xl border-0 p-0 focus:ring-0 focus:outline-none w-[180px] text-left bg-transparent placeholder:text-muted-foreground/20 caret-primary"
                                        placeholder="0"
                                        autoFocus
                                    />
                                </div>
                            </div>
                        ) : (
                            <span className="font-bold text-lg">{displayCurrency(details.amount || 0)}</span>
                        )}
                    </div>
// ... rest of component

                    {details.type === 'transfer' ? (
                        <>
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-muted-foreground">From Account</span>
                                <span className="font-medium">{sourceAccount?.name}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-muted-foreground">To Account</span>
                                <span className="font-medium">{targetAccount?.name}</span>
                            </div>
                        </>
                    ) : (
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-muted-foreground">Account</span>
                            <span className="font-medium">{sourceAccount?.name}</span>
                        </div>
                    )}

                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Description</span>
                        <span className="font-medium">{details.description}</span>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>Cancel</Button>
                    <Button onClick={(e) => {
                        e.preventDefault();
                        onConfirm(amountStr ? Number(amountStr) : undefined);
                    }} disabled={isLoading || (editableAmount && !amountStr)}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Confirm Payment
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
