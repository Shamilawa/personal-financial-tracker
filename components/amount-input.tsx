
import * as React from "react"
import { cn } from "@/lib/utils"

interface AmountInputProps {
    value: string | number
    onChange: (value: string) => void
    currency: string
    placeholder?: string
    autoFocus?: boolean
    className?: string
}

export function AmountInput({
    value,
    onChange,
    currency,
    placeholder = "0",
    autoFocus = false,
    className
}: AmountInputProps) {
    return (
        <div className={cn("flex justify-center py-6", className)}>
            <div className="flex items-baseline gap-2 border-b border-border hover:border-foreground/50 focus-within:border-foreground transition-colors px-8 pb-2">
                <input
                    type="text"
                    inputMode="decimal"
                    value={value}
                    onChange={(e) => {
                        const val = e.target.value;
                        // Allow digits, commas, and one decimal point
                        if (/^[\d,]*\.?[\d]*$/.test(val)) {
                            // Strip commas to get raw number
                            const clean = val.replace(/,/g, '');
                            if (clean === '' || clean === '.') {
                                onChange(val);
                                return;
                            }

                            const parts = clean.split('.');
                            // Format integer part with commas
                            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");

                            // Reassemble
                            onChange(parts.join('.'));
                        }
                    }}
                    className="font-bold text-4xl border-0 p-0 focus:ring-0 focus:outline-none min-w-[200px] max-w-[200px] text-center bg-transparent placeholder:text-muted-foreground/20 caret-primary"
                    placeholder={placeholder}
                    autoFocus={autoFocus}
                />
                <span className="text-3xl text-gray-400 font-bold self-center">{currency}</span>
            </div>
        </div>
    )
}
