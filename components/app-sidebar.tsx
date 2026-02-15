"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
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

// Menu items.
const items = [
    {
        title: "Dashboard",
        url: "/",
        icon: LayoutDashboard,
    },
    {
        url: "/settings",
        icon: Settings,
    },
    {
        title: "Debts",
        url: "/debt",
        icon: Wallet,
    },
]

export function AppSidebar() {
    const pathname = usePathname()
    const [isLoading, setIsLoading] = React.useState<string | null>(null)

    React.useEffect(() => {
        setIsLoading(null)
    }, [pathname])

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <a href="#">
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                    <Wallet className="size-4" />
                                </div>
                                <div className="flex flex-col gap-0.5 leading-none">
                                    <span className="font-semibold">FinTrack</span>
                                    <span className="text-xs text-muted-foreground">v1.1.0</span>
                                </div>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
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
                <div className="p-2">
                    {/* Placeholder for footer content if needed */}
                </div>
            </SidebarFooter>
        </Sidebar>
    )
}
