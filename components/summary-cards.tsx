import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Wallet, DollarSign } from "lucide-react"
import { Transaction, Account } from "@/lib/definitions"

type SummaryCardsProps = {
  transactions: Transaction[]
  currency: string
  accounts: Account[]
  selectedAccountId: string
}

export function SummaryCards({ transactions, currency, accounts, selectedAccountId }: SummaryCardsProps) {
  // --- Transaction Stats (Income/Expenses for Period) ---
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0)

  const periodBalance = totalIncome - totalExpenses

  // --- Account Stats (Live Balance) ---
  // If "all" selected, sum all accounts. If specific account, just that one.
  const currentTotalBalance = accounts
    .filter(acc => selectedAccountId === "all" || acc.id === selectedAccountId)
    .reduce((sum, acc) => sum + acc.balance, 0)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount)
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* 1. Total Balance (Live) */}
      <Card className="border-l-4 border-l-primary shadow-sm bg-gradient-to-br from-background to-secondary/10">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Current Balance
          </CardTitle>
          <Wallet className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">
            {formatCurrency(currentTotalBalance)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {selectedAccountId === "all" ? "All Accounts" : "Selected Account"}
          </p>
        </CardContent>
      </Card>

      {/* 2. Income (Period) */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Income
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-chart-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-chart-4">
            {formatCurrency(totalIncome)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {transactions.filter((t) => t.type === "income").length} txns (period)
          </p>
        </CardContent>
      </Card>

      {/* 3. Expenses (Period) */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Expenses
          </CardTitle>
          <TrendingDown className="h-4 w-4 text-chart-3" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-chart-3">
            {formatCurrency(totalExpenses)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {transactions.filter((t) => t.type === "expense").length} txns (period)
          </p>
        </CardContent>
      </Card>

      {/* 4. Net Flow (Period) */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Net Flow
          </CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${periodBalance >= 0 ? "text-chart-4" : "text-chart-3"
              }`}
          >
            {formatCurrency(periodBalance)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Income vs. Expenses
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
