# 🔐 Create Admin User - Step-by-Step

## Method 1: Using Supabase Dashboard (Recommended)

### Step 1: Create the User
1. Open your Supabase Dashboard
2. Navigate to **Authentication** → **Users**
3. Click **"Add user"** button
4. Select **"Create new user"**
5. Enter:
   - **Email**: `admin@finmate.com` (or your preferred email)
   - **Password**: Create a strong password
   - **Auto Confirm User**: ✅ Check this (optional but recommended)
6. Click **"Create user"**
7. **IMPORTANT**: Copy the **User UID** - you'll need it in the next step

### Step 2: Grant Admin Privileges
1. Go to **SQL Editor** in your Supabase Dashboard
2. Click **"New query"**
3. Paste this SQL (replace `YOUR_USER_UID_HERE` with the UID from Step 1):

```sql
-- Grant admin privileges to your user
UPDATE public.profiles 
SET is_admin = true 
WHERE user_id = 'YOUR_USER_UID_HERE';
```

4. Click **"Run"**
5. You should see: `Success. No rows returned`

### Step 3: Verify Admin Status
Run this query to verify:

```sql
-- Check if admin flag is set
SELECT user_id, name, is_admin 
FROM public.profiles 
WHERE user_id = 'YOUR_USER_UID_HERE';
```

You should see `is_admin: true`

### Step 4: Test Login
1. Go to your admin dashboard: `http://localhost:3000`
2. Log in with the credentials you created
3. You should see all analytics and have full access

---

## Method 2: Using SQL Only (Advanced)

If you want to create everything via SQL:

### Step 1: Create Auth User (Must use Supabase Dashboard)
⚠️ **Note**: You CANNOT create auth.users directly via SQL for security reasons.
You MUST use the Supabase Dashboard Authentication → Users → "Add user"

### Step 2: After Creating User via Dashboard
Get the user UID and run:

```sql
-- Update the profile that was auto-created by the trigger
UPDATE public.profiles 
SET 
  is_admin = true,
  name = 'Admin User'  -- Optional: set admin name
WHERE user_id = 'YOUR_USER_UID_FROM_DASHBOARD';
```

---

## Method 3: Promote Existing User to Admin

If you already have a user account and want to make it admin:

### Option A: If you know the user's email
```sql
-- Find user_id by email
SELECT user_id, name, email 
FROM public.profiles 
JOIN auth.users ON profiles.user_id = auth.users.id
WHERE auth.users.email = 'user@example.com';

-- Then promote to admin (use the user_id from above)
UPDATE public.profiles 
SET is_admin = true 
WHERE user_id = 'user-id-from-query-above';
```

### Option B: If you know the user's name
```sql
-- Find and promote user by name
UPDATE public.profiles 
SET is_admin = true 
WHERE name = 'John Doe';

-- Verify
SELECT user_id, name, is_admin 
FROM public.profiles 
WHERE name = 'John Doe';
```

---

## Verification Checklist

After creating your admin user, verify these:

### ✅ Database Check
```sql
-- Check profiles table
SELECT 
  user_id, 
  name, 
  is_admin, 
  created_at 
FROM public.profiles 
WHERE is_admin = true;
```

Expected result: At least one row with `is_admin: true`

### ✅ RLS Policies Check
```sql
-- Verify admin RLS policies exist
SELECT 
  schemaname,
  tablename, 
  policyname 
FROM pg_policies 
WHERE policyname LIKE '%Admin%';
```

Expected result: Multiple policies with "Admin" in the name

### ✅ Login Test
1. Open `http://localhost:3000`
2. Enter admin credentials
3. Should redirect to dashboard
4. Check that you can see all users and data

---

## Troubleshooting

### ❌ "Profile not found" after creating user

**Problem**: The auto-trigger didn't create a profile

**Solution**:
```sql
-- Manually create profile for the user
INSERT INTO public.profiles (user_id, name)
VALUES ('YOUR_USER_UID', 'Admin User');

-- Then grant admin
UPDATE public.profiles 
SET is_admin = true 
WHERE user_id = 'YOUR_USER_UID';
```

### ❌ "Update returned no rows"

**Problem**: User ID doesn't exist in profiles table

**Solution**: Check if the profile exists:
```sql
-- List all profiles
SELECT * FROM public.profiles;

-- Check if trigger exists
SELECT * FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';
```

### ❌ Can't see other users' data even as admin

**Problem**: RLS policies not created or not working

**Solution**: 
1. Re-run the `database.sql` file
2. Verify policies exist:
```sql
SELECT * FROM pg_policies 
WHERE tablename IN ('profiles', 'transactions', 'incomes', 'budget_categories', 'goals');
```

### ❌ Login works but shows "Unauthorized"

**Problem**: `is_admin` flag not set

**Solution**:
```sql
-- Check current admin status
SELECT user_id, is_admin FROM public.profiles;

-- Force set admin flag
UPDATE public.profiles 
SET is_admin = true 
WHERE user_id = (
  SELECT id FROM auth.users 
  WHERE email = 'your-admin-email@example.com'
);
```

---

## Quick Reference

### Get User UID from Email
```sql
SELECT id, email FROM auth.users WHERE email = 'admin@finmate.com';
```

### List All Admin Users
```sql
SELECT 
  p.user_id, 
  p.name, 
  au.email, 
  p.is_admin,
  p.created_at
FROM public.profiles p
JOIN auth.users au ON p.user_id = au.id
WHERE p.is_admin = true;
```

### Remove Admin Privileges
```sql
UPDATE public.profiles 
SET is_admin = false 
WHERE user_id = 'USER_UID_HERE';
```

### Create Multiple Admins
```sql
-- Set multiple users as admin
UPDATE public.profiles 
SET is_admin = true 
WHERE user_id IN (
  'user-uid-1',
  'user-uid-2',
  'user-uid-3'
);
```

---

## Security Best Practices

1. **Strong Passwords**: Use at least 12 characters with mix of letters, numbers, symbols
2. **Unique Emails**: Use dedicated email for admin accounts
3. **MFA**: Enable Multi-Factor Authentication in Supabase settings
4. **Limit Admins**: Only create necessary admin accounts
5. **Monitor Access**: Regularly check admin login logs
6. **Rotate Credentials**: Change passwords periodically

---

## Next Steps After Creating Admin

1. ✅ Log in to verify access
2. ✅ Test all features (users, transactions, analytics)
3. ✅ Add sample data if needed
4. ✅ Configure real-time subscriptions
5. ✅ Set up email templates in Supabase
6. ✅ Enable MFA for production
7. ✅ Document admin procedures

---

## Example: Complete Setup

Here's a complete example of creating an admin user:

```sql
-- 1. After creating user via Supabase Dashboard with UID: abc123...

-- 2. Grant admin privileges
UPDATE public.profiles 
SET is_admin = true 
WHERE user_id = 'abc123-def456-ghi789';

-- 3. Update admin name (optional)
UPDATE public.profiles 
SET name = 'Super Admin'
WHERE user_id = 'abc123-def456-ghi789';

-- 4. Verify
SELECT 
  p.user_id, 
  p.name, 
  au.email, 
  p.is_admin,
  p.created_at
FROM public.profiles p
JOIN auth.users au ON p.user_id = au.id
WHERE p.user_id = 'abc123-def456-ghi789';
```

Expected result:
```
user_id: abc123-def456-ghi789
name: Super Admin
email: admin@finmate.com
is_admin: true
created_at: 2025-11-04 10:30:00
```

---

## 🎉 You're Done!

Your admin user is now created and ready to use the dashboard!

**Default Login**:
- Email: The email you set
- Password: The password you set
- Dashboard: `http://localhost:3000`

Happy administrating! 🚀
