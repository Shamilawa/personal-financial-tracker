"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { CalendarIcon, Plus, Loader2 } from "lucide-react"
import { AmountInput } from "@/components/amount-input"
import { addTransaction, addCategory } from "@/lib/actions"
import { toast } from "sonner"
import { Category, Account } from "@/lib/definitions"

type TransactionFormProps = {
  categories: Category[]
  accounts: Account[]
  currency: string
  defaultAccountId?: string
}

export function TransactionForm({ categories, accounts, currency, defaultAccountId }: TransactionFormProps) {
  const [open, setOpen] = useState(false)
  const [type, setType] = useState<"income" | "expense">("expense")
  const [category, setCategory] = useState("")
  const [accountId, setAccountId] = useState(defaultAccountId || (accounts[0]?.id || ""))
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [loading, setLoading] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [isCreatingCategory, setIsCreatingCategory] = useState(false)

  // Update accountId if default changes
  useEffect(() => {
    if (defaultAccountId) {
      setAccountId(defaultAccountId)
    } else if (!accountId && accounts.length > 0) {
      setAccountId(accounts[0].id)
    }
  }, [defaultAccountId, accounts])

  const filteredCategories = categories.filter((c) => c.type === type)

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return

    setLoading(true)
    try {
      const result = await addCategory(newCategoryName, type)
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success("Category created successfully")
      setCategory(newCategoryName) // Auto-select the new category
      setNewCategoryName("")
      setIsCreatingCategory(false)
    } catch (error) {
      toast.error("Failed to create category")
    } finally {
      setLoading(false)
    }
  }



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!category || !amount || !date || !accountId) {
      toast.error("Please fill in all required fields")
      return
    }

    const val = Number.parseFloat(amount.replace(/,/g, ""))
    if (isNaN(val) || val <= 0) {
      toast.error("Amount must be greater than 0")
      return
    }

    if (type === "expense") {
      const account = accounts.find((a) => a.id === accountId)
      if (account && account.balance < val) {
        toast.error("Insufficient funds")
        return
      }
    }

    setLoading(true)
    try {
      await addTransaction({
        account_id: accountId,
        type,
        category,
        description,
        amount: Number.parseFloat(amount.replace(/,/g, "")),
        date,
      })
      toast.success("Transaction added successfully")
      setOpen(false)
      // Reset some fields
      setCategory("")
      setDescription("")
      setAmount("")
      setDate(new Date().toISOString().split("T")[0])
    } catch (error) {
      toast.error("Failed to add transaction")
    } finally {
      setLoading(false)
    }
  }

  // Helper to get symbol
  const getCurrencySymbol = (curr: string) => {
    try {
      return new Intl.NumberFormat("en-US", { style: "currency", currency: curr }).formatToParts(0).find(part => part.type === "currency")?.value || curr;
    } catch (e) {
      return curr;
    }
  }

  const currencySymbol = getCurrencySymbol(currency);

  const amountVal = Number.parseFloat(amount.replace(/,/g, ""))
  const isFormValid =
    !loading &&
    !!accountId &&
    !!date &&
    (isCreatingCategory ? !!newCategoryName.trim() : !!category) &&
    !isNaN(amountVal) &&
    amountVal > 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 font-semibold shadow-sm">
          <Plus className="h-4 w-4" />
          Add Transaction
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 pt-4">

          {/* Account Selection */}
          <div className="grid gap-2">
            <Label htmlFor="account">Account</Label>
            <Select value={accountId} onValueChange={setAccountId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((acc) => (
                  <SelectItem key={acc.id} value={acc.id}>
                    {acc.name} ({getCurrencySymbol(currency)}{acc.balance})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Type</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={type === "income" ? "default" : "outline"}
                className="flex-1"
                onClick={() => {
                  setType("income")
                  setCategory("")
                  setIsCreatingCategory(false)
                }}
              >
                Income
              </Button>
              <Button
                type="button"
                variant={type === "expense" ? "default" : "outline"}
                className="flex-1"
                onClick={() => {
                  setType("expense")
                  setCategory("")
                  setIsCreatingCategory(false)
                }}
              >
                Expense
              </Button>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="category">Category</Label>
            {!isCreatingCategory ? (
              <div className="flex gap-2">
                <Select value={category} onValueChange={(val) => {
                  if (val === "new") {
                    setIsCreatingCategory(true)
                  } else {
                    setCategory(val)
                  }
                }}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.name}>
                        {cat.name}
                      </SelectItem>
                    ))}
                    <SelectItem value="new" className="text-primary font-medium">
                      + Create new category
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <Select
                    value={type}
                    onValueChange={(val: "income" | "expense") => {
                      setType(val);
                    }}
                  >
                    <SelectTrigger className="w-[110px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Category name"
                    className="flex-1"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsCreatingCategory(false)}
                    size="sm"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleCreateCategory}
                    disabled={loading || !newCategoryName.trim()}
                    size="sm"
                  >
                    Create
                  </Button>
                </div>
              </div>
            )}
          </div>



          <div className="grid gap-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description"
            />
          </div>



          <div className="grid gap-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <AmountInput
            value={amount}
            onChange={setAmount}
            currency={currencySymbol}
          />

          <Button type="submit" className="mt-2" disabled={!isFormValid}>
            {loading ? "Adding..." : "Add Transaction"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
