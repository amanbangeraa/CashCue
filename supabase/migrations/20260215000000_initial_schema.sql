-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  date DATE NOT NULL,
  category TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create stocks/portfolio table
CREATE TABLE IF NOT EXISTS stocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  stock_name TEXT NOT NULL,
  ticker_symbol TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  buy_price NUMERIC(10, 2) NOT NULL,
  current_price NUMERIC(10, 2) NOT NULL,
  buy_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE stocks ENABLE ROW LEVEL SECURITY;

-- Create policies for expenses
CREATE POLICY "Users can view their own expenses"
  ON expenses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own expenses"
  ON expenses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own expenses"
  ON expenses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own expenses"
  ON expenses FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for stocks
CREATE POLICY "Users can view their own stocks"
  ON stocks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stocks"
  ON stocks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stocks"
  ON stocks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own stocks"
  ON stocks FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS expenses_user_id_idx ON expenses(user_id);
CREATE INDEX IF NOT EXISTS expenses_date_idx ON expenses(date);
CREATE INDEX IF NOT EXISTS stocks_user_id_idx ON stocks(user_id);

-- Create budget_configs table
CREATE TABLE IF NOT EXISTS budget_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  monthly_salary NUMERIC(12, 2) NOT NULL,
  monthly_savings_goal NUMERIC(12, 2) NOT NULL,
  month TEXT NOT NULL, -- Format: YYYY-MM
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, month)
);

-- Enable Row Level Security
ALTER TABLE budget_configs ENABLE ROW LEVEL SECURITY;

-- Create policies for budget_configs
CREATE POLICY "Users can view their own budget configs"
  ON budget_configs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own budget configs"
  ON budget_configs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own budget configs"
  ON budget_configs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own budget configs"
  ON budget_configs FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS budget_configs_user_id_month_idx ON budget_configs(user_id, month);
