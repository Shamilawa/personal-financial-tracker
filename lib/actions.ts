'use server';

import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { Transaction, Category, Settings } from './definitions';


export async function getSettings(): Promise<Settings> {
    try {
        const data = await sql<Settings>`
      SELECT * FROM settings LIMIT 1
    `;
        return data.rows[0] || { id: '', cycle_start_day: 1, currency: 'USD' };
    } catch (error) {
        console.error('Database Error:', error);
        return { id: '', cycle_start_day: 1, currency: 'USD' };
    }
}

export async function updateSettings(cycleStartDay: number, currency: string) {
    try {
        const count = await sql`SELECT count(*) FROM settings`;
        if (Number(count.rows[0].count) === 0) {
            await sql`INSERT INTO settings (cycle_start_day, currency) VALUES (${cycleStartDay}, ${currency})`;
        } else {
            await sql`UPDATE settings SET cycle_start_day = ${cycleStartDay}, currency = ${currency}`;
        }

        revalidatePath('/');
        return { message: 'Settings updated successfully' };
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to update settings');
    }
}

export async function getCategories(): Promise<Category[]> {
    try {
        const data = await sql<Category>`
      SELECT * FROM categories
      ORDER BY name ASC
    `;
        return data.rows;
    } catch (error) {
        console.error('Database Error:', error);
        return [];
    }
}

export async function addCategory(name: string, type: 'income' | 'expense') {
    try {
        const normalizedName = name.trim();

        // Check if category already exists (case-insensitive) for the same type
        const existing = await sql`
      SELECT id FROM categories 
      WHERE LOWER(name) = LOWER(${normalizedName}) AND type = ${type}
    `;

        if (existing.rowCount && existing.rowCount > 0) {
            return { error: 'Category already exists' };
        }

        await sql`
      INSERT INTO categories (name, type)
      VALUES (${normalizedName}, ${type})
    `;
        revalidatePath('/');
        return { message: 'Category added successfully' };
    } catch (error) {
        console.error('Database Error:', error);
        return { error: 'Failed to add category' };
    }
}


export async function getTransactions(): Promise<Transaction[]> {
    try {
        const data = await sql<Transaction>`
      SELECT 
        id, 
        type, 
        category, 
        description, 
        amount, 
        TO_CHAR(date, 'YYYY-MM-DD') as date 
      FROM transactions
      ORDER BY date DESC, created_at DESC
    `;
        // CAST amount to number because node-postgres returns numeric as string
        return data.rows.map(row => ({
            ...row,
            amount: Number(row.amount),
            // date is already string YYYY-MM-DD from TO_CHAR
        }));
    } catch (error) {
        console.error('Database Error:', error);
        return [];
    }
}

export async function addTransaction(transaction: Omit<Transaction, 'id'>) {
    try {
        const { type, category, description, amount, date } = transaction;

        await sql`
      INSERT INTO transactions (type, category, description, amount, date)
      VALUES (${type}, ${category}, ${description}, ${amount}, ${date})
    `;

        revalidatePath('/');
        return { message: 'Transaction added successfully' };
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to add transaction');
    }
}

export async function deleteTransaction(id: string) {
    try {
        await sql`DELETE FROM transactions WHERE id = ${id}`;
        revalidatePath('/');
        return { message: 'Transaction deleted successfully' };
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to delete transaction');
    }
}
