"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight, CalendarIcon, Check } from "lucide-react"
import { addMonths, format, subMonths } from "date-fns"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
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
        // User wants "Next button disabled when we are in the current budgeting period"
        // So we shouldn't allow going to FUTURE cycles if the requirement is strict.
        // However, usually seeing 1 future cycle is good for planning. 
        // BUT the user specifically said "Next button should be disabled when we are in the current budgeting period".
        // This implies we cannot go past "Current".
        // I will generate 1 future cycle just in case they want to see it in the dropdown, 
        // but I'll implement the disabled logic based on "Current".

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

        const opts: { value: string; label: string; start: Date }[] = []

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

        return opts
    }, [cycleStartDay])

    const selectedOption = options.find(o => o.value === selectedDate)
    const selectedIndex = options.findIndex(o => o.value === selectedDate)

    // Current Cycle Logic
    const currentCycleStartDate = getCycleStartDate(format(new Date(), "yyyy-MM-dd"), cycleStartDay)

    // Disable logic
    // "Next button should be disabled when we are in the current budgeting period"
    // This meant if selectedDate === currentCycleStartDate, Next is disabled.
    // Note: options are sorted Future -> Past. So index 0 is Future, index 1 is Current (usually).
    // Next button (going forward in time) means moving to a LOWER index in `options`.

    const canGoNext = selectedDate !== currentCycleStartDate && selectedIndex > 0
    // Wait, if selectedDate is "Future" (index 0), then we definitely can't go next (index -1 doesn't exist).
    // User said "Next button should be disabled when we are in the CURRENT budgeting period".
    // This implies if I am at "Current", I cannot go to "Future".
    // So `canGoNext` should be false if `selectedDate === currentCycleStartDate`.

    const canGoPrev = selectedIndex < options.length - 1

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
        <div className="flex items-center space-x-2 bg-background p-1 rounded-md border shadow-sm">
            <Button
                variant="ghost"
                size="icon"
                onClick={handlePrev}
                disabled={!canGoPrev}
                className="h-8 w-8"
            >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Previous period</span>
            </Button>

            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-[240px] justify-between h-8 text-sm font-normal"
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
                </PopoverTrigger>
                <PopoverContent className="w-[240px] p-0">
                    <Command>
                        <CommandList>
                            <CommandEmpty>No period found.</CommandEmpty>
                            <CommandGroup>
                                {options.map((option) => (
                                    <CommandItem
                                        key={option.value}
                                        value={option.label} // Command filters by value/label
                                        onSelect={() => {
                                            onDateChange(option.value)
                                            setOpen(false)
                                        }}
                                        className="cursor-pointer"
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                option.value === selectedDate ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        <span className={cn(
                                            "flex-1",
                                            option.value === selectedDate ? "font-bold" : ""
                                        )}>
                                            {option.label}
                                        </span>
                                        {option.value === currentCycleStartDate && (
                                            <span className="ml-2 text-xs text-muted-foreground bg-secondary px-1 rounded">
                                                Current
                                            </span>
                                        )}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>

            <Button
                variant="ghost"
                size="icon"
                onClick={handleNext}
                disabled={!canGoNext}
                className="h-8 w-8"
            >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Next period</span>
            </Button>
        </div>
    )
}
