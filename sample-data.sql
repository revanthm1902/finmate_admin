-- Quick Test Data for FinMate Admin Dashboard
-- Run this in Supabase SQL Editor to add sample transactions

-- First, make sure you have at least one user profile
-- If you don't have any profiles, create one:
INSERT INTO public.profiles (user_id, name, email, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Test User',
  'test@example.com',
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.profiles LIMIT 1);

-- Now insert sample transactions using the first user_id
-- Insert 20 sample transactions
INSERT INTO public.transactions (user_id, description, amount, date, category, type, created_at, updated_at)
SELECT 
  (SELECT user_id FROM public.profiles LIMIT 1),
  description,
  amount,
  date,
  category,
  type,
  NOW(),
  NOW()
FROM (
  VALUES
  -- Income transactions
  ('Monthly Salary', 5000.00, CURRENT_DATE - INTERVAL '1 day', 'Salary', 'income'),
  ('Freelance Project', 1200.00, CURRENT_DATE - INTERVAL '2 days', 'Freelance', 'income'),
  ('Investment Returns', 350.00, CURRENT_DATE - INTERVAL '3 days', 'Investments', 'income'),
  ('Side Hustle', 450.00, CURRENT_DATE - INTERVAL '4 days', 'Side Business', 'income'),
  ('Bonus', 1000.00, CURRENT_DATE - INTERVAL '5 days', 'Salary', 'income'),
  
  -- Expense transactions
  ('Grocery Shopping', 150.00, CURRENT_DATE - INTERVAL '1 day', 'Groceries', 'expense'),
  ('Electricity Bill', 85.50, CURRENT_DATE - INTERVAL '1 day', 'Utilities', 'expense'),
  ('Restaurant Dinner', 65.00, CURRENT_DATE - INTERVAL '2 days', 'Food & Dining', 'expense'),
  ('Gas Station', 45.00, CURRENT_DATE - INTERVAL '2 days', 'Transportation', 'expense'),
  ('Netflix Subscription', 15.99, CURRENT_DATE - INTERVAL '3 days', 'Entertainment', 'expense'),
  ('Gym Membership', 50.00, CURRENT_DATE - INTERVAL '3 days', 'Health & Fitness', 'expense'),
  ('Amazon Purchase', 125.00, CURRENT_DATE - INTERVAL '4 days', 'Shopping', 'expense'),
  ('Coffee Shop', 12.50, CURRENT_DATE - INTERVAL '4 days', 'Food & Dining', 'expense'),
  ('Internet Bill', 60.00, CURRENT_DATE - INTERVAL '5 days', 'Utilities', 'expense'),
  ('Uber Ride', 25.00, CURRENT_DATE - INTERVAL '5 days', 'Transportation', 'expense'),
  ('Book Purchase', 35.00, CURRENT_DATE - INTERVAL '6 days', 'Education', 'expense'),
  ('Pharmacy', 40.00, CURRENT_DATE - INTERVAL '6 days', 'Health & Fitness', 'expense'),
  ('Movie Tickets', 30.00, CURRENT_DATE - INTERVAL '7 days', 'Entertainment', 'expense'),
  ('Haircut', 35.00, CURRENT_DATE - INTERVAL '7 days', 'Personal Care', 'expense'),
  ('Phone Bill', 55.00, CURRENT_DATE - INTERVAL '8 days', 'Utilities', 'expense')
) AS t(description, amount, date, category, type);

-- Insert some budget categories
INSERT INTO public.budget_categories (user_id, category, budget, spent, period, created_at, updated_at)
SELECT 
  (SELECT user_id FROM public.profiles LIMIT 1),
  category,
  budget,
  spent,
  'monthly',
  NOW(),
  NOW()
FROM (
  VALUES
  ('Groceries', 500.00, 150.00),
  ('Utilities', 300.00, 200.50),
  ('Food & Dining', 400.00, 77.50),
  ('Transportation', 200.00, 70.00),
  ('Entertainment', 150.00, 45.99),
  ('Shopping', 300.00, 125.00),
  ('Health & Fitness', 150.00, 90.00)
) AS t(category, budget, spent)
ON CONFLICT DO NOTHING;

-- Insert some savings goals
INSERT INTO public.goals (user_id, name, target_amount, current_amount, deadline, status, created_at, updated_at)
SELECT 
  (SELECT user_id FROM public.profiles LIMIT 1),
  name,
  target_amount,
  current_amount,
  deadline,
  'active',
  NOW(),
  NOW()
FROM (
  VALUES
  ('Emergency Fund', 10000.00, 3500.00, CURRENT_DATE + INTERVAL '6 months'),
  ('Vacation Savings', 5000.00, 1200.00, CURRENT_DATE + INTERVAL '4 months'),
  ('New Laptop', 2000.00, 850.00, CURRENT_DATE + INTERVAL '2 months'),
  ('Investment Portfolio', 15000.00, 6000.00, CURRENT_DATE + INTERVAL '12 months')
) AS t(name, target_amount, current_amount, deadline)
ON CONFLICT DO NOTHING;

-- Insert income records
INSERT INTO public.incomes (user_id, source, amount, frequency, created_at, updated_at)
SELECT 
  (SELECT user_id FROM public.profiles LIMIT 1),
  source,
  amount,
  frequency,
  NOW(),
  NOW()
FROM (
  VALUES
  ('Full-time Job', 5000.00, 'monthly'),
  ('Freelance Work', 1200.00, 'monthly'),
  ('Investments', 350.00, 'monthly')
) AS t(source, amount, frequency)
ON CONFLICT DO NOTHING;

-- Verify the data was inserted
SELECT 'Transactions inserted:' as info, COUNT(*) as count FROM public.transactions
UNION ALL
SELECT 'Budget categories inserted:', COUNT(*) FROM public.budget_categories
UNION ALL
SELECT 'Goals inserted:', COUNT(*) FROM public.goals
UNION ALL
SELECT 'Income sources inserted:', COUNT(*) FROM public.incomes;
