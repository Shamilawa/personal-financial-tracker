'use server';

import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { SavingsGoal } from './definitions';
import { addTransaction } from './actions';

export async function getSavingsGoals(): Promise<SavingsGoal[]> {
    try {
        const data = await sql<SavingsGoal>`
            SELECT 
                id,
                name,
                target_amount,
                current_balance,
                TO_CHAR(target_date, 'YYYY-MM-DD') as target_date,
                linked_account_id,
                notes,
                TO_CHAR(created_at, 'YYYY-MM-DD') as created_at
            FROM savings_goals
            ORDER BY created_at DESC
        `;
        return data.rows.map(row => ({
            ...row,
            target_amount: Number(row.target_amount),
            current_balance: Number(row.current_balance),
        }));
    } catch (error) {
        console.error('Database Error:', error);
        return [];
    }
}

export async function addSavingsGoal(goal: Omit<SavingsGoal, 'id' | 'created_at'>) {
    try {
        const {
            name,
            target_amount,
            current_balance,
            target_date,
            linked_account_id,
            notes
        } = goal;

        await sql`
            INSERT INTO savings_goals (
                name, 
                target_amount, 
                current_balance, 
                target_date, 
                linked_account_id,
                notes
            )
            VALUES (
                ${name}, 
                ${target_amount}, 
                ${current_balance || 0}, 
                ${target_date || null}, 
                ${linked_account_id},
                ${notes || ''}
            )
        `;
        revalidatePath('/saving');
        revalidatePath('/');
        return { message: 'Savings goal added successfully' };
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to add savings goal');
    }
}

export async function updateSavingsGoal(id: string, goal: Partial<SavingsGoal>) {
    try {
        const {
            name,
            target_amount,
            current_balance,
            target_date,
            linked_account_id,
            notes
        } = goal as SavingsGoal;

        await sql`
            UPDATE savings_goals 
            SET 
                name = ${name}, 
                target_amount = ${target_amount}, 
                current_balance = ${current_balance}, 
                target_date = ${target_date || null}, 
                linked_account_id = ${linked_account_id},
                notes = ${notes || ''}
            WHERE id = ${id}
        `;

        revalidatePath('/saving');
        return { message: 'Savings goal updated successfully' };
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to update savings goal');
    }
}

export async function deleteSavingsGoal(id: string) {
    try {
        await sql`DELETE FROM savings_goals WHERE id = ${id}`;
        revalidatePath('/saving');
        return { message: 'Savings goal deleted successfully' };
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to delete savings goal');
    }
}

export async function addFundsToGoal(
    goalId: string,
    accountId: string,
    amount: number,
    date: string,
    description?: string
) {
    try {
        // 1. Get Goal Details
        const goalResult = await sql`SELECT name FROM savings_goals WHERE id = ${goalId}`;
        if (goalResult.rowCount === 0) {
            return { error: 'Savings goal not found' };
        }
        const goal = goalResult.rows[0];

        // 2. Create Transfer/Expense Transaction
        // Depending on if the savings goal linked_account is a real 'saving' account
        // Let's create an expense to move money "out" of standard circulation towards the goal.
        await addTransaction({
            account_id: accountId,
            type: 'expense',
            category: 'Savings Transfer',
            description: description || `Transfer to ${goal.name}`,
            amount: amount,
            date: date
        });

        // 3. Update Goal Balance
        await sql`
            UPDATE savings_goals 
            SET current_balance = current_balance + ${amount}
            WHERE id = ${goalId}
        `;

        revalidatePath('/saving');
        revalidatePath('/');
        return { message: 'Funds added successfully' };
    } catch (error) {
        console.error('Funding Error:', error);
        throw new Error('Failed to add funds to goal');
    }
}
