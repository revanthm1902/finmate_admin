-- FinMate Admin Dashboard - Complete Database Setup
-- Run this in your Supabase SQL Editor

-- 1. Ensure profiles table has admin columns
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- 2. Create RLS policies for admin access

-- Admins can view all profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid() AND profiles.is_admin = true
    )
  );

-- Admins can update all profiles
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid() AND profiles.is_admin = true
    )
  );

-- Admins can view all transactions
DROP POLICY IF EXISTS "Admins can view all transactions" ON public.transactions;
CREATE POLICY "Admins can view all transactions" ON public.transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid() AND profiles.is_admin = true
    )
  );

-- Admins can view all incomes
DROP POLICY IF EXISTS "Admins can view all incomes" ON public.incomes;
CREATE POLICY "Admins can view all incomes" ON public.incomes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid() AND profiles.is_admin = true
    )
  );

-- Admins can view all budget categories
DROP POLICY IF EXISTS "Admins can view all budget categories" ON public.budget_categories;
CREATE POLICY "Admins can view all budget categories" ON public.budget_categories
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid() AND profiles.is_admin = true
    )
  );

-- Admins can view all goals
DROP POLICY IF EXISTS "Admins can view all goals" ON public.goals;
CREATE POLICY "Admins can view all goals" ON public.goals
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid() AND profiles.is_admin = true
    )
  );

-- 3. Create function to prevent unauthorized admin elevation
CREATE OR REPLACE FUNCTION public.prevent_admin_elevation()
RETURNS TRIGGER AS $$
BEGIN
  -- Only allow changes to is_admin if the current user is already an admin
  IF NEW.is_admin != OLD.is_admin THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND is_admin = true
    ) THEN
      RAISE EXCEPTION 'Only admins can grant admin privileges';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for admin elevation prevention
DROP TRIGGER IF EXISTS prevent_admin_elevation_trigger ON public.profiles;
CREATE TRIGGER prevent_admin_elevation_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_admin_elevation();

-- 4. Grant admin privileges to your user
-- IMPORTANT: Replace 'YOUR_USER_ID_HERE' with your actual user ID from Supabase Auth
-- UPDATE public.profiles SET is_admin = true WHERE user_id = 'YOUR_USER_ID_HERE';

-- 5. Enable realtime for admin dashboard
-- Go to Database > Replication in Supabase Dashboard and enable for these tables:
-- - transactions
-- - profiles
-- - incomes
-- - budget_categories
-- - goals

-- 6. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(date);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON public.profiles(is_admin);
CREATE INDEX IF NOT EXISTS idx_incomes_user_id ON public.incomes(user_id);
CREATE INDEX IF NOT EXISTS idx_budget_categories_user_id ON public.budget_categories(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON public.goals(user_id);

-- 7. Create a view for admin analytics (optional but useful)
CREATE OR REPLACE VIEW public.admin_analytics AS
SELECT
  (SELECT COUNT(*) FROM public.profiles) as total_users,
  (SELECT COUNT(*) FROM public.transactions) as total_transactions,
  (SELECT COALESCE(SUM(amount), 0) FROM public.transactions WHERE type = 'income') as total_income,
  (SELECT COALESCE(SUM(amount), 0) FROM public.transactions WHERE type = 'expense') as total_expenses,
  (SELECT COALESCE(SUM(budget), 0) FROM public.budget_categories) as total_budget,
  (SELECT COUNT(*) FROM public.goals) as total_goals;

-- Grant access to the view
GRANT SELECT ON public.admin_analytics TO authenticated;

COMMENT ON VIEW public.admin_analytics IS 'Aggregated analytics for admin dashboard';
