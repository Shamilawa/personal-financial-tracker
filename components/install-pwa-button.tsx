"use client"

import * as React from "react"
import { Download } from "lucide-react"
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"

export function InstallPWAButton() {
    const [deferredPrompt, setDeferredPrompt] = React.useState<any>(null)
    const [isInstalled, setIsInstalled] = React.useState(false)

    React.useEffect(() => {
        const handler = (e: any) => {
            e.preventDefault()
            setDeferredPrompt(e)
        }

        window.addEventListener("beforeinstallprompt", handler)

        if (window.matchMedia("(display-mode: standalone)").matches) {
            setIsInstalled(true)
        }

        return () => {
            window.removeEventListener("beforeinstallprompt", handler)
        }
    }, [])

    const handleInstallClick = async () => {
        if (!deferredPrompt) return

        deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice

        if (outcome === "accepted") {
            setDeferredPrompt(null)
        }
    }

    if (!deferredPrompt || isInstalled) return null

    return (
        <SidebarMenuItem>
            <SidebarMenuButton onClick={handleInstallClick} tooltip="Install App">
                <Download />
                <span>Install App</span>
            </SidebarMenuButton>
        </SidebarMenuItem>
    )
}
