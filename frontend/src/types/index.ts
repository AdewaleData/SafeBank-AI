export interface DashboardData {
  balance: number;
  account_number: string;
  is_frozen: boolean;
  income: number;
  expenses: number;
  savings_progress: number;
  fraud_score: number;
  insights: string[];
  recent_transactions: TransactionItem[];
}

export interface TransactionItem {
  id: string;
  amount: number;
  type: string;
  status: string;
  reference: string;
  description?: string | null;
  category?: string | null;
  created_at: string;
  direction?: string;
  counterparty_name?: string;
}

export interface FraudAlertItem {
  id: string;
  risk_level: string;
  reason: string;
  resolved: boolean;
  created_at: string;
}

export interface AnalyticsData {
  total_expenses: number;
  breakdown: { category: string; amount: number; percentage: number }[];
  chart_data: { name: string; value: number }[];
  monthly_chart: { month: string; amount: number }[];
  insight: string;
}
