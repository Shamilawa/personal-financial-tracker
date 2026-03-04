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
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { MoreHorizontal, Pencil, Trash2, CalendarIcon, Plus, Wallet, Target } from "lucide-react"
import { SavingsGoal, Account } from "@/lib/definitions"
import { deleteSavingsGoal } from "@/lib/saving-actions"
import { toast } from "sonner"
import { SavingForm } from "./saving-form"
import { SavingAddFundsDialog } from "./saving-add-funds-dialog"

type SavingListProps = {
    goals: SavingsGoal[]
    currency: string
    accounts: Account[]
}

export function SavingList({ goals, currency, accounts }: SavingListProps) {
    const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null)
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [fundingGoal, setFundingGoal] = useState<SavingsGoal | null>(null)
    const [isFundingOpen, setIsFundingOpen] = useState(false)

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this goal?")) {
            try {
                await deleteSavingsGoal(id)
                toast.success("Savings goal deleted")
            } catch (error) {
                toast.error("Failed to delete savings goal")
            }
        }
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-US", { style: "currency", currency: currency || "USD" }).format(amount)
    }

    if (goals.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center border rounded-xl bg-muted/20 border-dashed">
                <Target className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-lg font-medium">No savings goals yet</h3>
                <p className="text-muted-foreground max-w-sm mt-2 mb-6">
                    Start planning for your next vacation, a new car, or an emergency fund to secure your financial future.
                </p>
                <div className="w-48">
                    <SavingForm accounts={accounts} currency={currency} trigger={
                        <Button className="w-full gap-2">
                            <Plus className="h-4 w-4" /> Create Your First Goal
                        </Button>
                    } />
                </div>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goals.map((goal) => {
                const percent = Math.max(0, Math.min(100, (goal.current_balance / goal.target_amount) * 100)) || 0
                const isComplete = percent >= 100
                const linkedAccount = accounts.find(a => a.id === goal.linked_account_id)

                return (
                    <Card key={goal.id} className="flex flex-col h-full overflow-hidden transition-all hover:shadow-md">
                        <CardHeader className="pb-4">
                            <div className="flex items-start justify-between">
                                <CardTitle className="text-xl font-bold line-clamp-1" title={goal.name}>
                                    {goal.name}
                                </CardTitle>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0 -mt-1 -mr-2">
                                            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuItem
                                            onClick={() => {
                                                setFundingGoal(goal)
                                                setIsFundingOpen(true)
                                            }}
                                        >
                                            <Plus className="mr-2 h-4 w-4" /> Add Funds
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => {
                                                setEditingGoal(goal)
                                                setIsEditOpen(true)
                                            }}
                                        >
                                            <Pencil className="mr-2 h-4 w-4" /> Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            className="text-destructive font-medium"
                                            onClick={() => handleDelete(goal.id)}
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            <div className="mt-4 flex items-baseline gap-2">
                                <span className="text-3xl font-extrabold tracking-tight">
                                    {formatCurrency(goal.current_balance)}
                                </span>
                                <span className="text-sm font-medium text-muted-foreground">
                                    of {formatCurrency(goal.target_amount)}
                                </span>
                            </div>
                        </CardHeader>

                        <CardContent className="flex-grow pt-0 pb-4">
                            <div className="flex flex-col gap-3">
                                <div className="space-y-1.5">
                                    <Progress
                                        value={percent}
                                        className={`h-2.5 bg-secondary ${isComplete ? '[&>div]:bg-green-500' : ''}`}
                                    />
                                    <div className="flex justify-between text-xs font-medium text-muted-foreground">
                                        <span className={isComplete ? "text-green-600 font-bold" : ""}>
                                            {isComplete ? "Goal Reached! 🎉" : `${percent.toFixed(1)}%`}
                                        </span>
                                        {!isComplete && (
                                            <span>{formatCurrency(Math.max(0, goal.target_amount - goal.current_balance))} to go</span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-xs text-muted-foreground bg-muted/30 p-2 rounded-md">
                                    <div className="flex items-center gap-1.5" title="Linked Account">
                                        <Wallet className="h-3.5 w-3.5 opacity-70" />
                                        <span className="font-medium truncate max-w-[100px]">
                                            {linkedAccount?.name || "Unknown"}
                                        </span>
                                    </div>
                                    {goal.target_date && (
                                        <div className="flex items-center gap-1.5">
                                            <CalendarIcon className="h-3.5 w-3.5 opacity-70" />
                                            <span>{goal.target_date}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>

                        <CardFooter className="pt-2 pb-4 px-6 border-t bg-muted/10">
                            <Button
                                variant={isComplete ? "outline" : "secondary"}
                                className="w-full font-semibold shadow-sm"
                                onClick={() => {
                                    setFundingGoal(goal)
                                    setIsFundingOpen(true)
                                }}
                            >
                                <Plus className="mr-2 h-4 w-4" /> {isComplete ? "Add More Funds" : "Add Funds"}
                            </Button>
                        </CardFooter>
                    </Card>
                )
            })}

            <SavingForm
                accounts={accounts}
                currency={currency}
                open={isEditOpen}
                onOpenChange={(open) => {
                    setIsEditOpen(open)
                    if (!open) setEditingGoal(null)
                }}
                goalToEdit={editingGoal || undefined}
            />

            <SavingAddFundsDialog
                open={isFundingOpen}
                onOpenChange={(open) => {
                    setIsFundingOpen(open)
                    if (!open) setFundingGoal(null)
                }}
                goal={fundingGoal}
                accounts={accounts}
                currency={currency}
            />
        </div>
    )
}
