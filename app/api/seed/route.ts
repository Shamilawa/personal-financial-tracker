import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import { ensureRecurringTable } from '@/lib/recurring-actions';

export async function GET() {
  try {
    // 1. Create Accounts Table
    await sql`
      CREATE TABLE IF NOT EXISTS accounts (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL, 
        balance NUMERIC(15, 2) DEFAULT 0.00,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 2. Insert Default 'Main' Account if no accounts exist
    const accountsCount = await sql`SELECT count(*) FROM accounts`;
    let mainAccountId = '';

    if (Number(accountsCount.rows[0].count) === 0) {
      const inserted = await sql`
        INSERT INTO accounts (name, type, balance)
        VALUES ('Main Wallet', 'main', 0.00)
        RETURNING id;
      `;
      mainAccountId = inserted.rows[0].id;
    } else {
      // Get the first account to use as default for migration
      const existing = await sql`SELECT id FROM accounts LIMIT 1`;
      mainAccountId = existing.rows[0].id;
    }

    // 3. Create Transactions Table (if not exists)
    await sql`
      CREATE TABLE IF NOT EXISTS transactions (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        account_id UUID REFERENCES accounts(id),
        type VARCHAR(50) NOT NULL,
        category VARCHAR(255) NOT NULL,
        description TEXT,
        amount NUMERIC(10, 2) NOT NULL,
        date DATE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 4. Migrate Existing Transactions: Add account_id column if it doesn't exist
    try {
      await sql`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS account_id UUID REFERENCES accounts(id)`;

      // Backfill account_id for existing transactions that are null
      if (mainAccountId) {
        await sql`UPDATE transactions SET account_id = ${mainAccountId} WHERE account_id IS NULL`;
      }

    } catch (e) {
      console.log("Migration finished or error:", e);
    }


    await sql`
      CREATE TABLE IF NOT EXISTS categories (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        UNIQUE(name, type)
      );
    `;

    await sql`
      INSERT INTO categories (name, type)
      VALUES 
        ('Salary', 'income'),
        ('Freelance', 'income'),
        ('Investments', 'income'),
        ('Other Income', 'income'),
        ('Housing', 'expense'),
        ('Food', 'expense'),
        ('Transportation', 'expense'),
        ('Utilities', 'expense'),
        ('Entertainment', 'expense'),
        ('Healthcare', 'expense'),
        ('Shopping', 'expense'),
        ('Other', 'expense')
      ON CONFLICT (name, type) DO NOTHING;
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS settings (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        cycle_start_day INTEGER NOT NULL DEFAULT 1,
        currency VARCHAR(10) NOT NULL DEFAULT 'USD'
      );
    `;

    // Attempt to add column if it doesn't exist (manual migration for dev)
    try {
      await sql`ALTER TABLE settings ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'USD'`;
    } catch (e) {
      // ignore
    }

    // Ensure we have at least one settings row
    await sql`
      INSERT INTO settings (id, cycle_start_day, currency)
      VALUES (gen_random_uuid(), 1, 'USD')
      ON CONFLICT DO NOTHING;
    `;

    // Check if we need to insert a default row (if table was just created or empty)
    const settingsCount = await sql`SELECT count(*) FROM settings`;
    if (Number(settingsCount.rows[0].count) === 0) {
      await sql`INSERT INTO settings (cycle_start_day, currency) VALUES (1, 'USD')`;
    }

    // 5. Create Debts Table
    await sql`
      CREATE TABLE IF NOT EXISTS debts (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        total_amount NUMERIC(15, 2) NOT NULL,
        current_balance NUMERIC(15, 2) NOT NULL,
        interest_rate NUMERIC(5, 2) DEFAULT 0.00,
        minimum_payment NUMERIC(15, 2) DEFAULT 0.00,
        due_date DATE,
        start_date DATE,
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 6. Ensure Recurring Transactions Table
    await ensureRecurringTable();

    return NextResponse.json({ message: "Database seeded and migrated successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
