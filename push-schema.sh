#!/bin/bash

# Script to push schema to Supabase database
# This uses the Supabase Management API to execute SQL

SUPABASE_URL=$(grep VITE_SUPABASE_URL .env | cut -d '=' -f2 | tr -d ' \r\n')
SUPABASE_ANON_KEY=$(grep VITE_SUPABASE_ANON_KEY .env | cut -d '=' -f2 | tr -d ' \r\n')
PROJECT_REF=$(echo $SUPABASE_URL | sed 's|https://||' | sed 's|.supabase.co||')

echo "🚀 Pushing schema to Supabase..."
echo "Project: $PROJECT_REF"
echo ""

# Read the migration file
SQL_CONTENT=$(cat supabase/migrations/20260215000000_initial_schema.sql)

# You need to run this SQL manually in Supabase Dashboard
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 TO APPLY SCHEMA:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Go to: https://supabase.com/dashboard/project/$PROJECT_REF/sql/new"
echo ""
echo "2. Copy and paste this SQL:"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cat supabase/migrations/20260215000000_initial_schema.sql
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "3. Click 'RUN' to create tables"
echo ""
echo "✅ After running the SQL, your database will be ready!"
echo ""
