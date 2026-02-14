'use server';

import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { Transaction, Category, Settings, Account } from './definitions';


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


export async function getTransactions(accountId?: string): Promise<Transaction[]> {
    try {
        let data;
        if (accountId) {
            data = await sql<Transaction>`
                SELECT 
                    id, 
                    account_id,
                    type, 
                    category, 
                    description, 
                    amount, 
                    TO_CHAR(date, 'YYYY-MM-DD') as date 
                FROM transactions
                WHERE account_id = ${accountId}
                ORDER BY date DESC, created_at DESC
            `;
        } else {
            data = await sql<Transaction>`
                SELECT 
                    id, 
                    account_id,
                    type, 
                    category, 
                    description, 
                    amount, 
                    TO_CHAR(date, 'YYYY-MM-DD') as date 
                FROM transactions
                ORDER BY date DESC, created_at DESC
            `;
        }

        return data.rows.map(row => ({
            ...row,
            amount: Number(row.amount),
        }));
    } catch (error) {
        console.error('Database Error:', error);
        return [];
    }
}

export async function addTransaction(transaction: Omit<Transaction, 'id'>) {
    try {
        const { account_id, type, category, description, amount, date } = transaction;

        // 1. Insert Transaction
        await sql`
            INSERT INTO transactions (account_id, type, category, description, amount, date)
            VALUES (${account_id}, ${type}, ${category}, ${description}, ${amount}, ${date})
        `;

        // 2. Update Account Balance
        if (type === 'income') {
            await sql`UPDATE accounts SET balance = balance + ${amount} WHERE id = ${account_id}`;
        } else {
            await sql`UPDATE accounts SET balance = balance - ${amount} WHERE id = ${account_id}`;
        }

        revalidatePath('/');
        return { message: 'Transaction added successfully' };
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to add transaction');
    }
}

export async function deleteTransaction(id: string) {
    try {
        // 1. Get transaction details to revert balance
        const txResult = await sql`SELECT account_id, type, amount FROM transactions WHERE id = ${id}`;
        if (txResult.rowCount === 0) return { message: 'Transaction not found' };

        const { account_id, type, amount } = txResult.rows[0];

        // 2. Delete Transaction
        await sql`DELETE FROM transactions WHERE id = ${id}`;

        // 3. Revert Account Balance
        if (type === 'income') {
            await sql`UPDATE accounts SET balance = balance - ${amount} WHERE id = ${account_id}`;
        } else {
            await sql`UPDATE accounts SET balance = balance + ${amount} WHERE id = ${account_id}`;
        }

        revalidatePath('/');
        return { message: 'Transaction deleted successfully' };
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to delete transaction');
    }
}

// --- Account Actions ---

export async function getAccounts(): Promise<Account[]> {
    try {
        const data = await sql<Account>`
            SELECT * FROM accounts ORDER BY created_at ASC
        `;
        return data.rows.map(row => ({
            ...row,
            balance: Number(row.balance)
        }));
    } catch (error) {
        console.error('Database Error:', error);
        return [];
    }
}

export async function createAccount(name: string, type: 'main' | 'saving' | 'custom', initialBalance: number) {
    try {
        await sql`
            INSERT INTO accounts (name, type, balance)
            VALUES (${name}, ${type}, ${initialBalance})
        `;
        revalidatePath('/');
        return { message: 'Account created successfully' };
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to create account');
    }
}

export async function updateAccount(id: string, name: string, type: 'main' | 'saving' | 'custom') {
    try {
        await sql`
            UPDATE accounts SET name = ${name}, type = ${type} WHERE id = ${id}
        `;
        revalidatePath('/');
        return { message: 'Account updated successfully' };
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to update account');
    }
}

export async function deleteAccount(id: string) {
    try {
        // Optionally delete transactions associated? Or prevent delete?
        // For now, let's CASCADE delete via logic or let DB handling filtering.
        // Better to delete transactions first.
        await sql`DELETE FROM transactions WHERE account_id = ${id}`;
        await sql`DELETE FROM accounts WHERE id = ${id}`;

        revalidatePath('/');
        return { message: 'Account deleted successfully' };
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to delete account');
    }
}

export async function transferFunds(sourceId: string, destId: string, amount: number, date: string) {
    try {
        // 1. Deduct from Source (Expense)
        await addTransaction({
            account_id: sourceId,
            type: 'expense',
            category: 'Transfer',
            description: 'Transfer to ' + destId, // Could look up name ideally
            amount: amount,
            date: date
        });

        // 2. Add to Destination (Income)
        await addTransaction({
            account_id: destId,
            type: 'income',
            category: 'Transfer',
            description: 'Transfer from ' + sourceId,
            amount: amount,
            date: date
        });

        revalidatePath('/');
        return { message: 'Transfer successful' };
    } catch (error) {
        console.error('Transfer Error:', error);
        throw new Error('Failed to transfer funds');
    }
}
