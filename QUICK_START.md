# 🚀 Quick Start Guide - CashCue with Supabase

This guide will help you set up CashCue with Supabase database integration.

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- A Supabase account (free tier available)

## 🔧 Setup Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click **"New Project"**
3. Fill in project details:
   - **Name**: CashCue (or any name)
   - **Database Password**: Choose a strong password
   - **Region**: Select closest to your location
4. Wait for project to be provisioned (~2 minutes)

### 3. Set Up Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **"New Query"**
3. Copy and paste this SQL schema:

```sql
-- Create expenses table
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  date DATE NOT NULL,
  category TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create stocks/portfolio table
CREATE TABLE stocks (
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
CREATE INDEX expenses_user_id_idx ON expenses(user_id);
CREATE INDEX expenses_date_idx ON expenses(date);
CREATE INDEX stocks_user_id_idx ON stocks(user_id);
```

4. Click **"Run"** to execute the schema

### 4. Configure Environment Variables

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public key** (starts with `eyJ...`)

3. Create a `.env` file in your project root:

```bash
cp .env.example .env
```

4. Edit `.env` and add your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 5. Enable Authentication (Optional but Recommended)

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Configure email templates if needed
4. For development, you can disable email confirmation:
   - Go to **Authentication** → **Settings**
   - Uncheck **"Enable email confirmations"**

### 6. Run the Application

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 🔐 Authentication Setup

To add user authentication to your app, you'll need to create login/signup components. Here's a simple example:

### Create Auth Component

Create `src/components/auth/LoginForm.tsx`:

```typescript
import { useState } from 'react';
import { supabase } from '../../lib/supabase';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) alert(error.message);
    else alert('Check your email for confirmation!');
    setLoading(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <form className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 border rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 border rounded"
        />
        <div className="flex gap-2">
          <button
            onClick={handleSignIn}
            disabled={loading}
            className="flex-1 bg-blue-500 text-white py-2 rounded"
          >
            Sign In
          </button>
          <button
            onClick={handleSignUp}
            disabled={loading}
            className="flex-1 bg-green-500 text-white py-2 rounded"
          >
            Sign Up
          </button>
        </div>
      </form>
    </div>
  );
}
```

## 🎯 How It Works

### Without Authentication
- App uses demo data by default
- Data is stored locally in component state
- Perfect for testing and development

### With Authentication
- Users must sign up/login
- Data is automatically synced with Supabase
- Each user only sees their own data (via Row Level Security)
- Data persists across devices

## 📊 Data Migration

To migrate existing localStorage data to Supabase:

1. Export your current data (you can add this temporarily to your app)
2. Sign up/login to your account
3. Import the data using the add functions

## 🔍 Troubleshooting

### "Missing Supabase environment variables"
- Make sure `.env` file exists in project root
- Check that variable names start with `VITE_`
- Restart dev server after changing `.env`

### "Row Level Security policy violation"
- User must be logged in to insert/update data
- Check that auth is working: `await supabase.auth.getUser()`

### Database connection fails
- Verify Project URL is correct
- Check anon key is the **public anon** key, not service role key
- Ensure project is not paused (Supabase pauses inactive projects)

## 🚀 Next Steps

1. **Add Authentication UI**: Create login/signup pages
2. **Add Loading States**: Show spinners while data loads
3. **Add Error Handling**: Display error messages to users
4. **Enable Real-time**: Subscribe to database changes
5. **Add User Profile**: Store user preferences

## 📚 Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase React Tutorial](https://supabase.com/docs/guides/getting-started/tutorials/with-react)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

## 🆘 Need Help?

- Check [Supabase Discord](https://discord.supabase.com)
- Review [GitHub Issues](https://github.com/supabase/supabase/issues)
- Read the error messages in browser console
 