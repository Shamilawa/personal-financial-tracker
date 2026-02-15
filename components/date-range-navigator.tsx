"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight, CalendarIcon, Check } from "lucide-react"
import { addMonths, format, subMonths } from "date-fns"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { getCycleStartDate } from "@/lib/date-utils"

interface DateRangeNavigatorProps {
    cycleStartDay: number
    selectedDate: string
    onDateChange: (date: string) => void
}

export function DateRangeNavigator({
    cycleStartDay,
    selectedDate,
    onDateChange,
}: DateRangeNavigatorProps) {
    const [open, setOpen] = React.useState(false)

    // Generate options
    const options = React.useMemo(() => {
        const today = new Date()
        const currentCycleStartStr = getCycleStartDate(format(today, "yyyy-MM-dd"), cycleStartDay)
        const currentCycleStart = new Date(currentCycleStartStr)

        // Range configuration
        const cyclesToShow = 13 // 1 future + current + 11 past
        const futureCycles = 1

        const cycleStarts: Date[] = []
        let iterDate = new Date(currentCycleStart)

        // Go into future
        for (let i = 0; i < futureCycles; i++) {
            iterDate = addMonths(iterDate, 1)
            const daysInMonth = new Date(iterDate.getFullYear(), iterDate.getMonth() + 1, 0).getDate()
            if (cycleStartDay > daysInMonth) {
                iterDate.setDate(daysInMonth)
            } else {
                iterDate.setDate(cycleStartDay)
            }
        }

        for (let i = 0; i < cyclesToShow; i++) {
            cycleStarts.push(new Date(iterDate))

            iterDate = subMonths(iterDate, 1)
            const daysInMonth = new Date(iterDate.getFullYear(), iterDate.getMonth() + 1, 0).getDate()
            if (cycleStartDay > daysInMonth) {
                iterDate.setDate(daysInMonth)
            } else {
                iterDate.setDate(cycleStartDay)
            }
        }

        const opts: { value: string; label: string; start: Date | null }[] = []

        let nextCycleStart = addMonths(cycleStarts[0], 1)
        const daysInNextMonth = new Date(nextCycleStart.getFullYear(), nextCycleStart.getMonth() + 1, 0).getDate()
        if (cycleStartDay > daysInNextMonth) {
            nextCycleStart.setDate(daysInNextMonth)
        } else {
            nextCycleStart.setDate(cycleStartDay)
        }

        for (const start of cycleStarts) {
            const end = new Date(nextCycleStart)
            end.setDate(end.getDate() - 1)

            const label = `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`
            opts.push({
                value: format(start, "yyyy-MM-dd"),
                label: label,
                start: start
            })
            nextCycleStart = start
        }

        // Add "Overall" option at the end
        opts.push({
            value: "overall",
            label: "Overall (All Time)",
            start: null
        })

        return opts
    }, [cycleStartDay])

    const selectedOption = options.find(o => o.value === selectedDate)
    const selectedIndex = options.findIndex(o => o.value === selectedDate)

    const isOverall = selectedDate === "overall"

    // Current Cycle Logic
    const currentCycleStartDate = getCycleStartDate(format(new Date(), "yyyy-MM-dd"), cycleStartDay)

    const canGoNext = !isOverall && selectedDate !== currentCycleStartDate && selectedIndex > 0
    const canGoPrev = !isOverall && selectedIndex < options.length - 2 // -2 because last option is "Overall"

    const handlePrev = () => {
        if (canGoPrev) {
            onDateChange(options[selectedIndex + 1].value)
        }
    }

    const handleNext = () => {
        if (canGoNext) {
            onDateChange(options[selectedIndex - 1].value)
        }
    }

    return (
        <div className="flex items-center gap-1">
            <Button
                variant="outline"
                size="icon"
                onClick={handlePrev}
                disabled={!canGoPrev}
                className="h-9 w-9"
            >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Previous period</span>
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button
                        variant="outline"
                        className="w-[240px] justify-between h-9 text-sm font-normal"
                    >
                        {selectedOption ? (
                            <span className="flex items-center gap-2">
                                <CalendarIcon className="h-4 w-4 opacity-50" />
                                {selectedOption.label}
                            </span>
                        ) : (
                            "Select period..."
                        )}
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Select Period</DialogTitle>
                        <DialogDescription>
                            Choose a budgeting cycle to view.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="bg-muted/50 p-4 rounded-lg text-sm space-y-2 mb-4">
                        <p className="font-medium text-primary">Budgeting Cycle Configuration</p>
                        <p className="text-muted-foreground">
                            Your billing cycle is configured to start on <span className="font-semibold text-foreground">day {cycleStartDay}</span> of each month.
                        </p>
                        <p className="text-muted-foreground text-xs">
                            This typically aligns with your salary date or primary income source. You can adjust this in Settings.
                        </p>
                    </div>

                    <ScrollArea className="h-[300px] pr-4">
                        <div className="space-y-1">
                            {options.map((option) => (
                                <Button
                                    key={option.value}
                                    variant={option.value === selectedDate ? "secondary" : "ghost"}
                                    className={cn(
                                        "w-full justify-start font-normal h-auto py-3",
                                        option.value === selectedDate && "font-medium"
                                    )}
                                    onClick={() => {
                                        onDateChange(option.value)
                                        setOpen(false)
                                    }}
                                >
                                    <div className="flex flex-col items-start gap-1">
                                        <div className="flex items-center gap-2">
                                            {option.value === currentCycleStartDate && option.value !== "overall" && (
                                                <Badge variant="default" className="text-[10px] h-5 px-1.5">
                                                    Current
                                                </Badge>
                                            )}
                                            <span>{option.label}</span>
                                        </div>
                                    </div>
                                    {option.value === selectedDate && (
                                        <Check className="ml-auto h-4 w-4 opacity-50" />
                                    )}
                                </Button>
                            ))}
                        </div>
                    </ScrollArea>
                </DialogContent>
            </Dialog>

            <Button
                variant="outline"
                size="icon"
                onClick={handleNext}
                disabled={!canGoNext}
                className="h-9 w-9"
            >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Next period</span>
            </Button>
        </div>
    )
}
