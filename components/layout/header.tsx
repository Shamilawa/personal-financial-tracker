import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"

interface PageHeaderProps {
    heading: string
    text?: string
    children?: React.ReactNode
}

export function PageHeader({ heading, text, children }: PageHeaderProps) {
    return (
        <header className="sticky top-0 z-10 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 items-center gap-2 px-4">
                <SidebarTrigger />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <div className="flex flex-1 items-center justify-between">
                    <div>
                        <h1 className="font-semibold">{heading}</h1>
                        {text && <p className="text-xs text-muted-foreground hidden sm:block">{text}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                        {children}
                    </div>
                </div>
            </div>
        </header>
    )
}
