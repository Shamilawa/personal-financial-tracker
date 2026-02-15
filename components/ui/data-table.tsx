"use client"

import * as React from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

export interface Column<T> {
    header: React.ReactNode
    accessorKey?: keyof T
    cell?: (item: T) => React.ReactNode
    className?: string
}

interface DataTableProps<T> {
    data: T[]
    columns: Column<T>[]
    onRowClick?: (item: T) => void
    keyExtractor: (item: T) => string
    emptyMessage?: React.ReactNode
}

export function DataTable<T>({
    data,
    columns,
    onRowClick,
    keyExtractor,
    emptyMessage = "No results.",
}: DataTableProps<T>) {
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        {columns.map((column, index) => (
                            <TableHead key={index} className={column.className}>
                                {column.header}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.length ? (
                        data.map((item) => (
                            <TableRow
                                key={keyExtractor(item)}
                                data-state={onRowClick ? "clickable" : undefined}
                                className={cn(onRowClick && "cursor-pointer hover:bg-muted/50")}
                                onClick={() => onRowClick?.(item)}
                            >
                                {columns.map((column, index) => (
                                    <TableCell key={index} className={column.className}>
                                        {column.cell
                                            ? column.cell(item)
                                            : column.accessorKey
                                                ? (item[column.accessorKey] as React.ReactNode)
                                                : null}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell
                                colSpan={columns.length}
                                className="h-24 text-center text-muted-foreground"
                            >
                                {emptyMessage}
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
