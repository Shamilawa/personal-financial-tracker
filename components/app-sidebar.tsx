"use client"

import * as React from "react"
import { usePathname, useSearchParams } from "next/navigation"
import Link from "next/link"
import { LayoutDashboard, Settings, Wallet, Loader2 } from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Account } from "@/lib/definitions"

// Menu items.
const items = [
    {
        title: "Debts",
        url: "/debt",
        icon: Wallet,
    },
]

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
    accounts?: Account[]
    currency?: string
}

export function AppSidebar({ accounts = [], currency = 'USD', ...props }: AppSidebarProps) {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const currentAccountId = searchParams.get("account")

    const [isLoading, setIsLoading] = React.useState<string | null>(null)

    React.useEffect(() => {
        setIsLoading(null)
    }, [pathname, currentAccountId])

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount)
    }

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/">
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                    <Wallet className="size-4" />
                                </div>
                                <div className="flex flex-col gap-0.5 leading-none">
                                    <span className="font-semibold">FinTrack</span>
                                    <span className="text-xs text-muted-foreground">v1.1.0</span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>


                {/* Accounts Section */}
                <SidebarGroup>
                    <SidebarGroupLabel>Accounts</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {accounts.map((acc) => {
                                const isActive = currentAccountId === acc.id
                                const isAccountLoading = isLoading === acc.id

                                return (
                                    <SidebarMenuItem key={acc.id}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={isActive}
                                            tooltip={`${acc.name}: ${formatCurrency(acc.balance)}`}
                                            onClick={() => {
                                                if (!isActive) {
                                                    setIsLoading(acc.id)
                                                }
                                            }}
                                            className="data-[active=true]:text-primary data-[active=true]:bg-primary/10 data-[active=true]:hover:bg-primary/15 data-[active=true]:hover:text-primary"
                                        >
                                            <Link href={`/?account=${acc.id}`}>
                                                <span className="truncate flex-1">{acc.name}</span>
                                                <span className="text-xs text-muted-foreground tabular-nums">
                                                    {formatCurrency(acc.balance)}
                                                </span>
                                                {isAccountLoading && (
                                                    <Loader2 className="ml-auto size-4 animate-spin" />
                                                )}
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel>Application</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={pathname === item.url}
                                        tooltip={item.title}
                                        onClick={() => {
                                            if (pathname !== item.url) {
                                                setIsLoading(item.url)
                                            }
                                        }}
                                        className="data-[active=true]:text-primary data-[active=true]:bg-primary/10 data-[active=true]:hover:bg-primary/15 data-[active=true]:hover:text-primary"
                                    >
                                        <Link href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                            {isLoading === item.url && (
                                                <Loader2 className="ml-auto size-4 animate-spin" />
                                            )}
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            isActive={pathname === "/settings"}
                            tooltip="Settings"
                            onClick={() => {
                                if (pathname !== "/settings") {
                                    setIsLoading("/settings")
                                }
                            }}
                        >
                            <Link href="/settings">
                                <Settings />
                                <span className="flex-1">Settings</span>
                                {isLoading === "/settings" && (
                                    <Loader2 className="ml-auto size-4 animate-spin" />
                                )}
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}
