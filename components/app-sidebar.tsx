"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Wallet, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const sidebarItems = [
    {
        title: "Dashboard",
        href: "/",
        icon: LayoutDashboard,
    },
    {
        title: "Settings",
        href: "/settings",
        icon: Settings,
    },
]

export function AppSidebar() {
    const pathname = usePathname()

    return (
        <div className="flex h-full w-[250px] flex-col gap-4 border-r bg-background p-4 hidden md:flex fixed left-0 top-0 bottom-0 z-30">
            <div className="flex items-center gap-2 px-2 py-6">
                <div className="p-2 rounded-lg bg-primary">
                    <Wallet className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                    <h1 className="text-xl font-bold tracking-tight">FinTrack</h1>
                </div>
            </div>
            <nav className="flex flex-col gap-2">
                {sidebarItems.map((item) => (
                    <Button
                        key={item.href}
                        variant={pathname === item.href ? "secondary" : "ghost"}
                        className={cn("justify-start gap-2", pathname === item.href && "bg-secondary")}
                        asChild
                    >
                        <Link href={item.href}>
                            <item.icon className="h-4 w-4" />
                            {item.title}
                        </Link>
                    </Button>

                ))}
            </nav>
            <div className="mt-auto p-4 border-t">
                <p className="text-xs text-muted-foreground text-center">
                    v1.1.0
                </p>
            </div>
        </div>
    )
}
