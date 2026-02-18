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
}

export function TransactionConfirmationDialog({
    open,
    onOpenChange,
    onConfirm,
    details,
    accounts,
    isLoading = false,
    title = "Confirm Transaction",
    editableAmount = false
}: TransactionConfirmationDialogProps) {
    const [amountStr, setAmountStr] = useState("")

    useEffect(() => {
        if (open && details) {
            // Only set initial value when opening.
            // If details.amount is 0 or undefined, set to empty string for cleaner input? 
            // Or keep 0 if it's explicitly 0.
            // If details.amount is undefined (variable), it's empty.
            setAmountStr(details.amount !== undefined && details.amount !== null ? details.amount.toString() : "")
        }
    }, [open])

    if (!details) return null;

    const sourceAccount = accounts.find(a => a.id === details.sourceAccountId);
    const targetAccount = details.targetAccountId ? accounts.find(a => a.id === details.targetAccountId) : null;

    // Helper to format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
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
                                <div className="flex items-baseline gap-1 border-b border-border hover:border-foreground/50 focus-within:border-foreground transition-colors px-4 pb-1">
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={amountStr}
                                        onChange={(e) => setAmountStr(e.target.value)}
                                        className="text-right font-bold text-5xl h-auto border-0 p-0 focus-visible:ring-0 w-[180px] text-center bg-transparent shadow-none"
                                        placeholder="0"
                                        autoFocus
                                    />
                                    <span className="text-3xl text-muted-foreground font-medium">$</span>
                                </div>
                            </div>
                        ) : (
                            <span className="font-bold text-lg">{formatCurrency(details.amount || 0)}</span>
                        )}
                    </div>

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
