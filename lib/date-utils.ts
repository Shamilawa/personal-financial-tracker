import { format, subMonths } from "date-fns"

export function getCycleStartDate(dateStr: string, cycleStartDay: number): string {
    const date = new Date(dateStr)
    const day = date.getDate()

    let cycleStart = new Date(date.getFullYear(), date.getMonth(), cycleStartDay)

    const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
    if (cycleStartDay > daysInMonth) {
        cycleStart = new Date(date.getFullYear(), date.getMonth(), daysInMonth)
    }

    if (day < cycleStart.getDate()) {
        cycleStart = subMonths(cycleStart, 1)
        const prevMonthDays = new Date(cycleStart.getFullYear(), cycleStart.getMonth() + 1, 0).getDate()
        if (cycleStartDay > prevMonthDays) {
            cycleStart.setDate(prevMonthDays);
        } else {
            cycleStart.setDate(cycleStartDay);
        }
    }

    return format(cycleStart, "yyyy-MM-dd")
}
