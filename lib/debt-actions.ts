'use server';

import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { Debt } from './definitions';
import { addTransaction } from './actions';

export async function getDebts(): Promise<Debt[]> {
    try {
        const data = await sql<Debt>`
            SELECT 
                id,
                name,
                total_amount,
                current_balance,
                interest_rate,
                minimum_payment,
                TO_CHAR(due_date, 'YYYY-MM-DD') as due_date,
                TO_CHAR(start_date, 'YYYY-MM-DD') as start_date,
                notes
            FROM debts
            ORDER BY created_at DESC
        `;
        return data.rows.map(row => ({
            ...row,
            total_amount: Number(row.total_amount),
            current_balance: Number(row.current_balance),
            interest_rate: Number(row.interest_rate),
            minimum_payment: Number(row.minimum_payment),
        }));
    } catch (error) {
        console.error('Database Error:', error);
        return [];
    }
}

export async function addDebt(debt: Omit<Debt, 'id'>) {
    try {
        const {
            name,
            total_amount,
            current_balance,
            interest_rate,
            minimum_payment,
            due_date,
            start_date,
            notes
        } = debt;

        await sql`
            INSERT INTO debts (
                name, 
                total_amount, 
                current_balance, 
                interest_rate, 
                minimum_payment, 
                due_date, 
                start_date, 
                notes
            )
            VALUES (
                ${name}, 
                ${total_amount}, 
                ${current_balance}, 
                ${interest_rate}, 
                ${minimum_payment}, 
                ${due_date || null}, 
                ${start_date || null}, 
                ${notes || ''}
            )
        `;
        revalidatePath('/debt');
        revalidatePath('/'); // In case we show summary on dashboard
        return { message: 'Debt added successfully' };
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to add debt');
    }
}

export async function updateDebt(id: string, debt: Partial<Debt>) {
    try {
        // Construct dynamic query parts? 
        // For simplicity, we might just update all fields or specific ones.
        // But strict SQL with template literals and dynamic fields is tricky safely.
        // Usage pattern suggests full update often. 
        // Let's support specific fields if possible, but for now simple full update or specific logic.

        // Actually, let's just do a full update for the edit form scenario.
        // NOTE: If using partial, we need to handle undefineds. 
        // For this iteration, let's assume the Edit Form sends all fields.

        const {
            name,
            total_amount,
            current_balance,
            interest_rate,
            minimum_payment,
            due_date,
            start_date,
            notes
        } = debt as Debt; // Type assertion if we ensure all are passed

        await sql`
            UPDATE debts 
            SET 
                name = ${name}, 
                total_amount = ${total_amount}, 
                current_balance = ${current_balance}, 
                interest_rate = ${interest_rate}, 
                minimum_payment = ${minimum_payment}, 
                due_date = ${due_date || null}, 
                start_date = ${start_date || null}, 
                notes = ${notes || ''}
            WHERE id = ${id}
        `;

        revalidatePath('/debt');
        return { message: 'Debt updated successfully' };
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to update debt');
    }
}

export async function deleteDebt(id: string) {
    try {
        await sql`DELETE FROM debts WHERE id = ${id}`;
        revalidatePath('/debt');
        return { message: 'Debt deleted successfully' };
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to delete debt');
    }
}

export async function payDebt(
    debtId: string,
    accountId: string,
    amount: number,
    date: string,
    description?: string
) {
    try {
        // 1. Get Debt Details for naming/verification (optional but good)
        const debtResult = await sql`SELECT name, current_balance FROM debts WHERE id = ${debtId}`;
        if (debtResult.rowCount === 0) {
            return { error: 'Debt not found' };
        }
        const debt = debtResult.rows[0];

        // 2. Create Expense Transaction
        // We use the addTransaction action to ensure consistent logic (updating account balance, etc.)
        await addTransaction({
            account_id: accountId,
            type: 'expense',
            category: 'Debt Payment', // Or specific category?
            description: description || `Payment for ${debt.name}`,
            amount: amount,
            date: date
        });

        // 3. Update Debt Balance
        // Reduce the current balance by the payment amount
        await sql`
            UPDATE debts 
            SET current_balance = current_balance - ${amount}
            WHERE id = ${debtId}
        `;

        revalidatePath('/debt');
        revalidatePath('/'); // Dashboard might show net worth etc.
        return { message: 'Payment recorded successfully' };
    } catch (error) {
        console.error('Payment Error:', error);
        throw new Error('Failed to record payment');
    }
}
