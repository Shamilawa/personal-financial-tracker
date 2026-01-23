"use client"

import { ChartTooltipContent } from "@/components/ui/chart"

import { ChartTooltip } from "@/components/ui/chart"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, type ChartConfig } from "@/components/ui/chart"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  type TooltipProps,
} from "recharts"
import { Transaction } from "@/lib/definitions"

type ExpenseChartProps = {
  transactions: Transaction[]
  currency: string
}

function CustomTooltip({
  active,
  payload,
  label,
  currency, // Accept currency here implies we need to pass it or use context. Recharts custom tooltip logic is tricky with props.
  // Better to wrap the CustomTooltip in the main component scope or use a closure.
}: TooltipProps<number, string> & { currency: string }) {
  if (!active || !payload || payload.length === 0) {
    return null
  }

  return (
    <div className="rounded-lg border border-border bg-background p-3 shadow-lg">
      <p className="mb-2 font-medium text-foreground">{label}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center gap-2 text-sm">
          <div
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-mono font-medium text-foreground">
            ${(entry.value ?? 0).toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  )
}

export function ExpenseChart({ transactions, currency }: ExpenseChartProps) {
  // Group transactions by date and calculate daily totals
  const dailyData = transactions.reduce(
    (acc, transaction) => {
      const date = transaction.date
      if (!acc[date]) {
        acc[date] = { date, income: 0, expenses: 0 }
      }
      if (transaction.type === "income") {
        acc[date].income += transaction.amount
      } else {
        acc[date].expenses += transaction.amount
      }
      return acc
    },
    {} as Record<string, { date: string; income: number; expenses: number }>
  )

  const chartData = Object.values(dailyData)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((item) => ({
      ...item,
      displayDate: new Date(item.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
    }))

  const chartConfig: ChartConfig = {
    income: {
      label: "Income",
      color: "var(--color-chart-4)",
    },
    expenses: {
      label: "Expenses",
      color: "var(--color-chart-3)",
    },
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Define CustomTooltip inside component to access formatCurrency closure easily
  // Or pass formatCurrency as prop. 
  // Let's keep it simple and move CustomTooltip inside or use render prop if possible.
  // Actually Recharts CustomTooltip receives payload.

  const CustomTooltipInternal = ({ active, payload, label }: any) => {
    if (!active || !payload || payload.length === 0) {
      return null
    }
    return (
      <div className="rounded-lg border border-border bg-background p-3 shadow-lg">
        <p className="mb-2 font-medium text-foreground">{label}</p>
        {payload.map((entry: any) => (
          <div key={entry.dataKey} className="flex items-center gap-2 text-sm">
            <div
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-mono font-medium text-foreground">
              {formatCurrency(entry.value)}
            </span>
          </div>
        ))}
      </div>
    )
  }

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Income vs Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-16">
            Add transactions to see your spending trends.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Income vs Expenses</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              dataKey="displayDate"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              className="text-xs"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => formatCurrency(value)}
              className="text-xs"
            />
            <Tooltip content={<CustomTooltipInternal />} />
            <Area
              type="monotone"
              dataKey="income"
              stackId="1"
              stroke="var(--color-chart-4)"
              fill="var(--color-chart-4)"
              fillOpacity={0.4}
            />
            <Area
              type="monotone"
              dataKey="expenses"
              stackId="2"
              stroke="var(--color-chart-3)"
              fill="var(--color-chart-3)"
              fillOpacity={0.4}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
