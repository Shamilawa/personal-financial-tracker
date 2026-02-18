"use client"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Account } from "@/lib/definitions"
import { format } from "date-fns"
import { Loader2 } from "lucide-react"

type TransactionDetails = {
    sourceAccountId: string;
    targetAccountId?: string; // For transfers
    amount: number;
    description: string;
    date: string;
    type: "income" | "expense" | "transfer";
}

type TransactionConfirmationDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    details: TransactionDetails | null;
    accounts: Account[];
    isLoading?: boolean;
    title?: string;
}

export function TransactionConfirmationDialog({
    open,
    onOpenChange,
    onConfirm,
    details,
    accounts,
    isLoading = false,
    title = "Confirm Transaction"
}: TransactionConfirmationDialogProps) {
    if (!details) return null;

    const sourceAccount = accounts.find(a => a.id === details.sourceAccountId);
    const targetAccount = details.targetAccountId ? accounts.find(a => a.id === details.targetAccountId) : null;

    // Helper to format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    }

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>
                        Please review the transaction details below.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="grid gap-3 py-3 text-sm">
                    <div className="flex justify-between border-b pb-2">
                        <span className="text-muted-foreground">Type</span>
                        <span className="font-medium capitalize">{details.type}</span>
                    </div>

                    <div className="flex justify-between border-b pb-2">
                        <span className="text-muted-foreground">Date</span>
                        <span className="font-medium">{format(new Date(details.date), 'PPP')}</span>
                    </div>

                    <div className="flex justify-between border-b pb-2">
                        <span className="text-muted-foreground">Amount</span>
                        <span className="font-bold text-lg">{formatCurrency(details.amount)}</span>
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

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={(e) => {
                        e.preventDefault();
                        onConfirm();
                    }} disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Confirm Payment
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
