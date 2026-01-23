import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS transactions (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        type VARCHAR(50) NOT NULL,
        category VARCHAR(255) NOT NULL,
        description TEXT,
        amount NUMERIC(10, 2) NOT NULL,
        date DATE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

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

    return NextResponse.json({ message: "Database seeded successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
