import { cn } from "@/lib/utils"

interface DashboardShellProps extends React.HTMLAttributes<HTMLDivElement> { }

export function DashboardShell({ children, className, ...props }: DashboardShellProps) {
    return (
        <div className={cn("flex flex-col gap-8 p-8 container mx-auto max-w-7xl", className)} {...props}>
            {children}
        </div>
    )
}
