export type Transaction = {
    id: string; // UUID
    account_id: string; // UUID
    type: "income" | "expense";
    category: string;
    description: string;
    amount: number;
    date: string; // ISO Date string YYYY-MM-DD
};

export type Category = {
    id: string; // UUID
    name: string;
    type: "income" | "expense";
};

export type Settings = {
    id: string;
    cycle_start_day: number;
    currency: string;
};

export type Account = {
    id: string;
    name: string;
    type: "main" | "saving" | "custom";
    balance: number;
};

export type Debt = {
    id: string; // UUID
    name: string;
    total_amount: number;
    current_balance: number;
    interest_rate: number;
    minimum_payment: number;
    due_date?: string; // ISO Date string YYYY-MM-DD
    start_date?: string; // ISO Date string YYYY-MM-DD
    notes?: string;
};

export type RecurringTransaction = {
    id: string; // UUID
    account_id: string; // UUID (Source)
    to_account_id?: string; // UUID (Destination, for transfers)
    type: "income" | "expense" | "transfer";
    category: string;
    description: string;
    amount: number;
    interval_unit: "day" | "week" | "month" | "year";
    interval_value: number;
    start_date: string; // ISO Date
    next_run_date: string; // ISO Date
    last_run_date?: string; // ISO Date
    end_date?: string; // ISO Date
    is_active: boolean;
};
