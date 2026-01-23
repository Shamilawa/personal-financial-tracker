"use client"

import React, { useState } from "react"
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
import { Plus } from "lucide-react"
import { addTransaction, addCategory } from "@/lib/actions"
import { toast } from "sonner"
import { Category } from "@/lib/definitions"

type TransactionFormProps = {
  categories: Category[]
  currency: string
}

export function TransactionForm({ categories, currency }: TransactionFormProps) {
  const [open, setOpen] = useState(false)
  const [type, setType] = useState<"income" | "expense">("expense")
  const [category, setCategory] = useState("")
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [loading, setLoading] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [isCreatingCategory, setIsCreatingCategory] = useState(false)

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

  // Helper to format number with commas
  const formatAmount = (val: string) => {
    if (!val) return val
    const number = parseFloat(val.replace(/,/g, ""))
    if (isNaN(number)) return val
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(number)
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Allow digits, commas, and one decimal point
    if (/^[\d,]*\.?[\d]*$/.test(value)) {
      setAmount(value)
    }
  }

  const handleAmountBlur = () => {
    setAmount(formatAmount(amount))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!category || !amount || !date) return

    setLoading(true)
    try {
      await addTransaction({
        type,
        category,
        description,
        amount: Number.parseFloat(amount.replace(/,/g, "")),
        date,
      })
      toast.success("Transaction added successfully")
      setOpen(false)
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Transaction
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 pt-4">
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
            <Label htmlFor="amount">Amount</Label>
            <div className="flex h-9 w-full items-center rounded-md border border-input bg-transparent px-3 py-1 shadow-sm transition-colors focus-within:ring-1 focus-within:ring-ring focus-within:border-ring">
              <span className="text-sm font-medium text-muted-foreground mr-2 shrink-0">
                {currencySymbol}
              </span>
              <input
                id="amount"
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={handleAmountChange}
                onBlur={handleAmountBlur}
                placeholder="0.00"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                required
              />
            </div>
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

          <Button type="submit" className="mt-2" disabled={loading}>
            {loading ? "Adding..." : "Add Transaction"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
