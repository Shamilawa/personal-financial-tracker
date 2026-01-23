"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { Transaction } from "@/lib/definitions"
import { deleteTransaction } from "@/lib/actions"
import { toast } from "sonner"

type TransactionsListProps = {
  transactions: Transaction[]
  currency: string
}

export function TransactionsList({
  transactions,
  currency,
}: TransactionsListProps) {
  const handleDelete = async (id: string) => {
    try {
      await deleteTransaction(id)
      toast.success("Transaction deleted successfully")
    } catch (error) {
      toast.error("Failed to delete transaction")
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        {sortedTransactions.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No transactions yet. Add your first transaction to get started.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[100px]">Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="hidden md:table-cell">Description</TableHead>
                  <TableHead className="hidden sm:table-cell">Type</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="w-[50px]">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="text-muted-foreground whitespace-nowrap">
                      {formatDate(transaction.date)}
                    </TableCell>
                    <TableCell className="font-medium whitespace-nowrap">
                      {transaction.category}
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-[200px] truncate hidden md:table-cell">
                      {transaction.description || "-"}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${transaction.type === "income"
                          ? "bg-chart-4/15 text-chart-4"
                          : "bg-chart-3/15 text-chart-3"
                          }`}
                      >
                        {transaction.type === "income" ? "Income" : "Expense"}
                      </span>
                    </TableCell>
                    <TableCell
                      className={`text-right font-semibold whitespace-nowrap ${transaction.type === "income"
                        ? "text-chart-4"
                        : "text-chart-3"
                        }`}
                    >
                      {transaction.type === "income" ? "+" : "-"}
                      {formatCurrency(transaction.amount)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(transaction.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete transaction</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
