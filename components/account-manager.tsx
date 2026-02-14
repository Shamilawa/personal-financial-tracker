"use client"

import { useState } from "react"
import { Account } from "@/lib/definitions"
import { createAccount, updateAccount, deleteAccount } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react"

type AccountManagerProps = {
    accounts: Account[]
}

export function AccountManager({ accounts }: AccountManagerProps) {
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [editingAccount, setEditingAccount] = useState<Account | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    // Form states
    const [name, setName] = useState("")
    const [type, setType] = useState<"main" | "saving" | "custom">("custom")
    const [balance, setBalance] = useState("")

    const resetForm = () => {
        setName("")
        setType("custom")
        setBalance("")
        setEditingAccount(null)
    }

    const handleAddAccount = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        try {
            await createAccount(name, type, Number(balance) || 0)
            toast.success("Account created successfully")
            setIsAddOpen(false)
            resetForm()
        } catch (error) {
            toast.error("Failed to create account")
        } finally {
            setIsLoading(false)
        }
    }

    const handleEditClick = (account: Account) => {
        setEditingAccount(account)
        setName(account.name)
        setType(account.type)
        setIsEditOpen(true)
    }

    const handleUpdateAccount = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingAccount) return

        setIsLoading(true)
        try {
            await updateAccount(editingAccount.id, name, type)
            toast.success("Account updated successfully")
            setIsEditOpen(false)
            resetForm()
        } catch (error) {
            toast.error("Failed to update account")
        } finally {
            setIsLoading(false)
        }
    }

    const handleDeleteAccount = async (id: string) => {
        if (!confirm("Are you sure? This will delete all associated transactions.")) return

        try {
            await deleteAccount(id)
            toast.success("Account deleted successfully")
        } catch (error) {
            toast.error("Failed to delete account")
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Accounts</h2>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" onClick={resetForm}>
                            <Plus className="mr-2 h-4 w-4" /> Add Account
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <form onSubmit={handleAddAccount}>
                            <DialogHeader>
                                <DialogTitle>Add Account</DialogTitle>
                                <DialogDescription>Create a new account to track.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="type">Type</Label>
                                    <Select value={type} onValueChange={(v: any) => setType(v)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="main">Main</SelectItem>
                                            <SelectItem value="saving">Saving</SelectItem>
                                            <SelectItem value="custom">Custom</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="balance">Initial Balance</Label>
                                    <Input
                                        id="balance"
                                        type="number"
                                        step="0.01"
                                        value={balance}
                                        onChange={(e) => setBalance(e.target.value)}
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Create Account
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {accounts.map((account) => (
                    <Card key={account.id}>
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-base">{account.name}</CardTitle>
                                    <CardDescription className="capitalize">{account.type}</CardDescription>
                                </div>
                                <div className="flex gap-1">
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditClick(account)}>
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteAccount(account.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(account.balance)}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Edit Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <form onSubmit={handleUpdateAccount}>
                        <DialogHeader>
                            <DialogTitle>Edit Account</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-name">Name</Label>
                                <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-type">Type</Label>
                                <Select value={type} onValueChange={(v: any) => setType(v)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="main">Main</SelectItem>
                                        <SelectItem value="saving">Saving</SelectItem>
                                        <SelectItem value="custom">Custom</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
