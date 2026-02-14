-- Create income_sources table
CREATE TABLE IF NOT EXISTS income_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('salary', 'freelance', 'rental', 'investment', 'business', 'other')),
  source_name TEXT NOT NULL,
  monthly_amount NUMERIC(12, 2) NOT NULL CHECK (monthly_amount >= 0),
  yearly_amount NUMERIC(12, 2) NOT NULL CHECK (yearly_amount >= 0),
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_date_range CHECK (end_date IS NULL OR end_date >= start_date)
);

-- Create tax_deductions table
CREATE TABLE IF NOT EXISTS tax_deductions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  income_source_id UUID REFERENCES income_sources ON DELETE CASCADE,
  deduction_type TEXT NOT NULL CHECK (deduction_type IN ('HRA', 'LTA', 'Professional Tax', 'TDS', 'Insurance', 'EPF', 'NPS', 'Other')),
  deduction_name TEXT NOT NULL,
  monthly_amount NUMERIC(12, 2) NOT NULL CHECK (monthly_amount >= 0),
  yearly_amount NUMERIC(12, 2) NOT NULL CHECK (yearly_amount >= 0),
  is_applicable BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create income_projection table
CREATE TABLE IF NOT EXISTS income_projection (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  projection_month DATE NOT NULL,
  total_gross_income NUMERIC(12, 2) NOT NULL,
  total_deductions NUMERIC(12, 2) NOT NULL,
  net_income NUMERIC(12, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, projection_month)
);

-- Enable Row Level Security
ALTER TABLE income_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_deductions ENABLE ROW LEVEL SECURITY;
ALTER TABLE income_projection ENABLE ROW LEVEL SECURITY;

-- Create policies for income_sources
CREATE POLICY "Users can view their own income sources"
  ON income_sources FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own income sources"
  ON income_sources FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own income sources"
  ON income_sources FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own income sources"
  ON income_sources FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for tax_deductions
CREATE POLICY "Users can view their own tax deductions"
  ON tax_deductions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tax deductions"
  ON tax_deductions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tax deductions"
  ON tax_deductions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tax deductions"
  ON tax_deductions FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for income_projection
CREATE POLICY "Users can view their own income projections"
  ON income_projection FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own income projections"
  ON income_projection FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own income projections"
  ON income_projection FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own income projections"
  ON income_projection FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS income_sources_user_id_idx ON income_sources(user_id);
CREATE INDEX IF NOT EXISTS income_sources_is_active_idx ON income_sources(is_active);
CREATE INDEX IF NOT EXISTS tax_deductions_user_id_idx ON tax_deductions(user_id);
CREATE INDEX IF NOT EXISTS tax_deductions_income_source_id_idx ON tax_deductions(income_source_id);
CREATE INDEX IF NOT EXISTS income_projection_user_id_month_idx ON income_projection(user_id, projection_month);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_income_sources_updated_at
  BEFORE UPDATE ON income_sources
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tax_deductions_updated_at
  BEFORE UPDATE ON tax_deductions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_income_projection_updated_at
  BEFORE UPDATE ON income_projection
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
