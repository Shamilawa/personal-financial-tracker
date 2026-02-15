"use client"

import React, { useState } from "react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { MoreHorizontal, Pencil, Trash2, CalendarIcon } from "lucide-react"
import { Debt } from "@/lib/definitions"
import { deleteDebt } from "@/lib/debt-actions"
import { toast } from "sonner"
import { DebtForm } from "./debt-form"
import { DataTable, Column } from "@/components/ui/data-table"

type DebtListProps = {
    debts: Debt[]
    currency: string
}

export function DebtList({ debts, currency }: DebtListProps) {
    const [editingDebt, setEditingDebt] = useState<Debt | null>(null)
    const [isEditOpen, setIsEditOpen] = useState(false)

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this debt?")) {
            try {
                await deleteDebt(id)
                toast.success("Debt deleted")
            } catch (error) {
                toast.error("Failed to delete debt")
            }
        }
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-US", { style: "currency", currency: currency || "USD" }).format(amount)
    }

    const columns: Column<Debt>[] = [
        {
            header: "Name",
            className: "w-[200px]",
            cell: (debt) => (
                <div className="flex flex-col">
                    <span className="font-medium">{debt.name}</span>
                    {debt.due_date && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <CalendarIcon className="h-3 w-3" /> Due: {debt.due_date}
                        </span>
                    )}
                </div>
            ),
        },
        {
            header: "Start Date",
            className: "text-muted-foreground",
            accessorKey: "start_date",
        },
        {
            header: "Balance / Total",
            cell: (debt) => (
                <div className="flex flex-col">
                    <span className="font-bold">{formatCurrency(debt.current_balance)}</span>
                    <span className="text-xs text-muted-foreground">of {formatCurrency(debt.total_amount)}</span>
                </div>
            ),
        },
        {
            header: "Progress",
            className: "w-[200px]",
            cell: (debt) => {
                const paid = debt.total_amount - debt.current_balance
                const percent = Math.max(0, Math.min(100, (paid / debt.total_amount) * 100)) || 0
                return (
                    <div className="flex flex-col gap-1">
                        <Progress value={percent} className="h-2" />
                        <span className="text-xs text-right text-muted-foreground">{percent.toFixed(1)}% paid</span>
                    </div>
                )
            },
        },
        {
            header: "Rate",
            cell: (debt) => `${debt.interest_rate}%`,
        },
        {
            header: "Min. Pay",
            cell: (debt) => formatCurrency(debt.minimum_payment),
        },
        {
            header: "",
            className: "w-[50px]",
            cell: (debt) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                            onClick={() => {
                                setEditingDebt(debt)
                                setIsEditOpen(true)
                            }}
                        >
                            <Pencil className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDelete(debt.id)}
                        >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ]

    return (
        <>
            <DataTable
                data={debts}
                columns={columns}
                keyExtractor={(item) => item.id}
                emptyMessage={
                    <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                        <p>No debts found. Add one to get started.</p>
                    </div>
                }
            />

            <DebtForm
                open={isEditOpen}
                onOpenChange={(open) => {
                    setIsEditOpen(open)
                    if (!open) setEditingDebt(null)
                }}
                debtToEdit={editingDebt || undefined}
            />
        </>
    )
}
