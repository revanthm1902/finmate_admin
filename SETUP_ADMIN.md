# Admin Setup Guide

This guide will help you set up an admin user for your FinMate Admin Dashboard.

## Prerequisites

- Supabase project created
- Database tables created (profiles, transactions, incomes, budget_categories, goals)
- Row Level Security (RLS) policies enabled

## Step 1: Add is_suspended column to profiles

Run this SQL in your Supabase SQL Editor:

```sql
-- Add is_suspended column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT FALSE;

-- Add is_admin column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;
```

## Step 2: Create Admin RLS Policies

Run this SQL to allow admins to view and manage all data:

```sql
-- Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid() AND profiles.is_admin = true
    )
  );

-- Allow admins to update all profiles
CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid() AND profiles.is_admin = true
    )
  );

-- Allow admins to view all transactions
CREATE POLICY "Admins can view all transactions" ON public.transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid() AND profiles.is_admin = true
    )
  );

-- Allow admins to view all incomes
CREATE POLICY "Admins can view all incomes" ON public.incomes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid() AND profiles.is_admin = true
    )
  );

-- Allow admins to view all budget categories
CREATE POLICY "Admins can view all budget categories" ON public.budget_categories
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid() AND profiles.is_admin = true
    )
  );

-- Allow admins to view all goals
CREATE POLICY "Admins can view all goals" ON public.goals
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid() AND profiles.is_admin = true
    )
  );
```

## Step 3: Create Your Admin User

### Option A: Create via Supabase Dashboard

1. Go to Authentication > Users in your Supabase dashboard
2. Click "Add user" > "Create new user"
3. Enter email and password
4. Click "Create user"
5. Copy the User ID

### Option B: Create via SQL

```sql
-- This will be done through Supabase Auth Dashboard
-- After creating the user, note the user_id
```

## Step 4: Grant Admin Privileges

Replace `YOUR_USER_ID_HERE` with the actual user ID from Step 3:

```sql
-- Set admin flag for your user
UPDATE public.profiles
SET is_admin = true
WHERE user_id = 'YOUR_USER_ID_HERE';
```

## Step 5: Verify Admin Access

1. Log in to your admin dashboard using the admin credentials
2. You should now see all users, transactions, and analytics
3. Test the user management features (suspend/activate users)

## Security Best Practices

### 1. Restrict Admin User Creation

```sql
-- Create a function to prevent regular users from setting is_admin
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

-- Create trigger
CREATE TRIGGER prevent_admin_elevation_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_admin_elevation();
```

### 2. Enable Email Confirmation

In your Supabase dashboard:
1. Go to Authentication > Settings
2. Enable "Confirm email" option
3. Configure email templates

### 3. Set Up MFA (Multi-Factor Authentication)

For extra security on admin accounts:
1. Go to Authentication > Settings
2. Enable "Multi-factor authentication"
3. Admin users should enable MFA in their account settings

## Troubleshooting

### Can't see other users' data

Make sure:
- The admin RLS policies are created
- Your user has `is_admin = true` in the profiles table
- You're logged in with the admin account

### Delete user not working

The delete function uses `supabase.auth.admin.deleteUser()` which requires:
- Service role key (not anon key) for admin operations
- Or use Supabase Dashboard to delete users manually

To enable admin user deletion from the dashboard, you need to:

1. Create a Supabase Edge Function for user deletion
2. Or grant your admin users the service role key (NOT RECOMMENDED for client apps)
3. Or manually delete users through Supabase Dashboard

### Recommended: Use Edge Function for User Deletion

Create a Supabase Edge Function:

```typescript
// supabase/functions/delete-user/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const { userId } = await req.json()
  
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  // Verify requester is admin
  const { data: { user } } = await supabaseAdmin.auth.getUser(
    req.headers.get('Authorization')?.replace('Bearer ', '') ?? ''
  )

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('is_admin')
    .eq('user_id', user?.id)
    .single()

  if (!profile?.is_admin) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 403 }
    )
  }

  // Delete user
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    )
  }

  return new Response(
    JSON.stringify({ success: true }),
    { status: 200 }
  )
})
```

## Next Steps

1. Test all admin functionalities
2. Set up monitoring and logging
3. Configure backup strategies
4. Set up alerts for suspicious activities
5. Document admin procedures for your team

## Support

For issues with setup, check:
- Supabase logs in Dashboard > Logs
- Browser console for errors
- Network tab for failed requests
