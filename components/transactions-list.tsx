"use client"

import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { Transaction } from "@/lib/definitions"
import { deleteTransaction } from "@/lib/actions"
import { toast } from "sonner"
import { DataTable, Column } from "@/components/ui/data-table"

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

  const columns: Column<Transaction>[] = [
    {
      header: "Date",
      className: "min-w-[100px]",
      cell: (t) => (
        <span className="text-muted-foreground whitespace-nowrap">
          {formatDate(t.date)}
        </span>
      ),
    },
    {
      header: "Category",
      cell: (t) => (
        <span className="font-medium whitespace-nowrap">{t.category}</span>
      ),
    },
    {
      header: "Description",
      className: "hidden md:table-cell",
      cell: (t) => (
        <span className="text-muted-foreground max-w-[200px] truncate block">
          {t.description || "-"}
        </span>
      ),
    },
    {
      header: "Type",
      className: "hidden sm:table-cell",
      cell: (t) => (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${t.type === "income"
            ? "bg-chart-4/15 text-chart-4"
            : "bg-chart-3/15 text-chart-3"
            }`}
        >
          {t.type === "income" ? "Income" : "Expense"}
        </span>
      ),
    },
    {
      header: "Amount",
      className: "text-right",
      cell: (t) => (
        <span
          className={`font-semibold whitespace-nowrap ${t.type === "income" ? "text-chart-4" : "text-chart-3"
            }`}
        >
          {t.type === "income" ? "+" : "-"}
          {formatCurrency(t.amount)}
        </span>
      ),
    },
    {
      header: <span className="sr-only">Actions</span>,
      className: "w-[50px]",
      cell: (t) => (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          onClick={() => handleDelete(t.id)}
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Delete transaction</span>
        </Button>
      ),
    },
  ]

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
      <DataTable
        data={sortedTransactions}
        columns={columns}
        keyExtractor={(item) => item.id}
        emptyMessage={
          <div className="text-center text-muted-foreground py-8">
            No transactions yet. Add your first transaction to get started.
          </div>
        }
      />
    </div>
  )
}
