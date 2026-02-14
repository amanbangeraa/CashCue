export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      expenses: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          category: string;
          amount: number;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          category: string;
          amount: number;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          category?: string;
          amount?: number;
          description?: string | null;
          created_at?: string;
        };
      };
      stocks: {
        Row: {
          id: string;
          user_id: string;
          stock_name: string;
          ticker_symbol: string;
          quantity: number;
          buy_price: number;
          current_price: number;
          buy_date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          stock_name: string;
          ticker_symbol: string;
          quantity: number;
          buy_price: number;
          current_price: number;
          buy_date: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          stock_name?: string;
          ticker_symbol?: string;
          quantity?: number;
          buy_price?: number;
          current_price?: number;
          buy_date?: string;
          created_at?: string;
        };
      };
    };
  };
}
