"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Transaction } from "@/lib/definitions"

type CategoryBreakdownProps = {
  transactions: Transaction[]
  currency: string
}

export function CategoryBreakdown({ transactions, currency }: CategoryBreakdownProps) {
  const expenses = transactions.filter((t) => t.type === "expense")
  const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0)

  // Group expenses by category
  const categoryTotals = expenses.reduce(
    (acc, transaction) => {
      if (!acc[transaction.category]) {
        acc[transaction.category] = 0
      }
      acc[transaction.category] += transaction.amount
      return acc
    },
    {} as Record<string, number>
  )

  const sortedCategories = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
    }))

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const getCategoryColor = (index: number) => {
    const colors = [
      "bg-chart-1",
      "bg-chart-2",
      "bg-chart-3",
      "bg-chart-4",
      "bg-chart-5",
    ]
    return colors[index % colors.length]
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expense Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        {sortedCategories.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No expenses recorded yet.
          </p>
        ) : (
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-4">
              {sortedCategories.map((item, index) => (
                <div key={item.category} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{item.category}</span>
                    <span className="text-muted-foreground">
                      {formatCurrency(item.amount)} ({item.percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="relative">
                    <Progress
                      value={item.percentage}
                      className="h-2 bg-secondary"
                    />
                    <div
                      className={`absolute top-0 left-0 h-2 rounded-full ${getCategoryColor(index)}`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
