'use server';

import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { RecurringTransaction } from './definitions';
import { addTransaction } from './actions';
import { addDays, addWeeks, addMonths, addYears, format, isBefore, isSameDay, parseISO } from 'date-fns';

// 1. Ensure Table Exists
export async function ensureRecurringTable() {
    try {
        await sql`
            CREATE TABLE IF NOT EXISTS recurring_transactions (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                account_id UUID NOT NULL REFERENCES accounts(id),
                to_account_id UUID REFERENCES accounts(id), -- For transfers
                type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
                category VARCHAR(255) NOT NULL,
                description TEXT,
                amount DECIMAL(10, 2) NOT NULL,
                interval_unit VARCHAR(10) NOT NULL CHECK (interval_unit IN ('day', 'week', 'month', 'year')),
                interval_value INTEGER NOT NULL DEFAULT 1,
                start_date DATE NOT NULL,
                next_run_date DATE NOT NULL,
                last_run_date DATE,
                end_date DATE,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;
        // Create index for performance
        await sql`CREATE INDEX IF NOT EXISTS idx_next_run_date ON recurring_transactions(next_run_date) WHERE is_active = TRUE;`;
        console.log("Recurring transactions table ensured.");
    } catch (error) {
        console.error("Failed to ensure recurring table:", error);
    }
}

// 2. Get Rules
export async function getRecurringTransactions(): Promise<RecurringTransaction[]> {
    try {
        const data = await sql<RecurringTransaction>`
            SELECT * FROM recurring_transactions 
            ORDER BY next_run_date ASC
        `;
        return data.rows.map(row => ({
            ...row,
            amount: Number(row.amount),
            start_date: format(row.start_date, 'yyyy-MM-dd'),
            next_run_date: format(row.next_run_date, 'yyyy-MM-dd'),
            last_run_date: row.last_run_date ? format(row.last_run_date, 'yyyy-MM-dd') : undefined,
            end_date: row.end_date ? format(row.end_date, 'yyyy-MM-dd') : undefined,
        }));
    } catch (error) {
        console.error('Database Error:', error);
        return [];
    }
}

// 3. Add Rule
export async function addRecurringTransaction(data: Omit<RecurringTransaction, 'id' | 'next_run_date' | 'last_run_date' | 'is_active'>) {
    try {
        const { account_id, to_account_id, type, category, description, amount, interval_unit, interval_value, start_date, end_date } = data;

        // Initial next_run_date is the start_date
        const next_run_date = start_date;

        await sql`
            INSERT INTO recurring_transactions (
                account_id, to_account_id, type, category, description, amount, 
                interval_unit, interval_value, start_date, next_run_date, end_date
            )
            VALUES (
                ${account_id}, ${to_account_id || null}, ${type}, ${category}, ${description}, ${amount},
                ${interval_unit}, ${interval_value}, ${start_date}, ${next_run_date}, ${end_date || null}
            )
        `;
        revalidatePath('/');
        return { message: 'Recurring transaction added' };
    } catch (error) {
        console.error('Database Error:', error);
        return { error: 'Failed to add recurring transaction' };
    }
}

// 4. Delete Rule
export async function deleteRecurringTransaction(id: string) {
    try {
        await sql`DELETE FROM recurring_transactions WHERE id = ${id}`;
        revalidatePath('/');
        return { message: 'Recurring transaction deleted' };
    } catch (error) {
        console.error('Database Error:', error);
        return { error: 'Failed to delete transaction' };
    }
}


// 5. TRIGGER MANUAL PAYMENT
export async function triggerRecurringTransaction(id: string) {
    try {
        // Fetch item
        const result = await sql<RecurringTransaction>`SELECT * FROM recurring_transactions WHERE id = ${id}`;
        if (result.rowCount === 0) return { error: "Transaction not found" };

        const item = result.rows[0];

        // 1. Create Transaction (Effective Date = Today, or next_run_date? Let's use Today as user is paying NOW)
        // User requested "As soon as user clicked on Pay... confirmation...". 
        // This function is called AFTER confirmation.
        const dateStr = format(new Date(), 'yyyy-MM-dd');

        if (item.type === 'transfer' && item.to_account_id) {
            // Handle Transfer
            await addTransaction({
                account_id: item.account_id,
                type: 'expense',
                category: 'Transfer',
                description: `Recurring Transfer to ${item.to_account_id} (${item.description})`,
                amount: Number(item.amount),
                date: dateStr
            });
            await addTransaction({
                account_id: item.to_account_id,
                type: 'income',
                category: 'Transfer',
                description: `Recurring Transfer from ${item.account_id} (${item.description})`,
                amount: Number(item.amount),
                date: dateStr
            });
        } else {
            // Income or Expense
            await addTransaction({
                account_id: item.account_id,
                type: item.type as "income" | "expense",
                category: item.category,
                description: `Recurring: ${item.description}`,
                amount: Number(item.amount),
                date: dateStr
            });
        }

        // 2. Calculate NEXT Date (Advance from previous next_run_date, or from Today?)
        // Standard practice: maintain the original schedule. If it was due on 1st, and paid on 3rd, next is due on 1st next month.
        const currentRunDate = parseISO(format(item.next_run_date, 'yyyy-MM-dd'));
        const interval = Number(item.interval_value);
        let nextDate = currentRunDate;

        switch (item.interval_unit) {
            case 'day': nextDate = addDays(currentRunDate, interval); break;
            case 'week': nextDate = addWeeks(currentRunDate, interval); break;
            case 'month': nextDate = addMonths(currentRunDate, interval); break;
            case 'year': nextDate = addYears(currentRunDate, interval); break;
        }

        // Update DB
        await sql`
            UPDATE recurring_transactions 
            SET next_run_date = ${format(nextDate, 'yyyy-MM-dd')}, 
                last_run_date = ${dateStr}
            WHERE id = ${item.id}
        `;

        revalidatePath('/');
        return { message: "Payment processed successfully" };

    } catch (error) {
        console.error("Manual Processing Error:", error);
        return { error: "Failed to process payment" };
    }
}
