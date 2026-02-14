export type IncomeSourceType = 'salary' | 'freelance' | 'rental' | 'investment' | 'business' | 'other';

export type DeductionType = 'HRA' | 'LTA' | 'Professional Tax' | 'TDS' | 'Insurance' | 'EPF' | 'NPS' | 'Other';

export interface IncomeSource {
  id: string;
  user_id?: string;
  source_type: IncomeSourceType;
  source_name: string;
  monthly_amount: number;
  yearly_amount: number;
  start_date: string;
  end_date?: string;
  is_active: boolean;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TaxDeduction {
  id: string;
  user_id?: string;
  income_source_id?: string;
  deduction_type: DeductionType;
  deduction_name: string;
  monthly_amount: number;
  yearly_amount: number;
  is_applicable: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface IncomeProjection {
  id: string;
  user_id?: string;
  projection_month: string;
  total_gross_income: number;
  total_deductions: number;
  net_income: number;
  created_at?: string;
  updated_at?: string;
}

export interface IncomeSummary {
  totalMonthlyGross: number;
  totalYearlyGross: number;
  totalMonthlyDeductions: number;
  totalYearlyDeductions: number;
  totalMonthlyNet: number;
  totalYearlyNet: number;
  activeSourcesCount: number;
  effectiveTaxRate: number;
}
