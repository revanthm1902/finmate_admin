# 🚀 GET STARTED - FinMate Admin Dashboard

## 📋 What You Need

Before starting, make sure you have:
- ✅ Node.js 14+ installed ([Download](https://nodejs.org/))
- ✅ A Supabase account ([Sign up free](https://supabase.com/))
- ✅ Your Supabase project created
- ✅ 10 minutes of your time

---

## ⚡ Quick Start (Fastest Way)

### Option 1: Automated Setup (Windows)
```bash
cd c:\Users\naidu\OneDrive\Documents\Projects\finmate_admin
setup.bat
```

### Option 2: Automated Setup (Mac/Linux)
```bash
cd /path/to/finmate_admin
chmod +x setup.sh
./setup.sh
```

### Option 3: Manual Setup (All Platforms)

**Step 1: Install Dependencies**
```bash
npm install
```

**Step 2: Configure Environment**
```bash
# Copy the example file
copy .env.example .env   # Windows
# or
cp .env.example .env     # Mac/Linux

# Edit .env and add your Supabase credentials
```

**Step 3: Set Up Database**
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy contents of `database.sql`
4. Paste and run

**Step 4: Create Admin User**
1. Go to Authentication → Users
2. Click "Add user" → "Create new user"
3. Enter email and password
4. Copy the User UID
5. Run in SQL Editor:
```sql
UPDATE public.profiles 
SET is_admin = true 
WHERE user_id = 'YOUR_USER_UID_HERE';
```

**Step 5: Enable Real-time**
1. Go to Database → Replication
2. Enable for: transactions, profiles, incomes, budget_categories, goals

**Step 6: Start Dashboard**
```bash
npm start
```

---

## 📚 Documentation

Choose your path:

### 🏃‍♂️ I want to start NOW!
→ Read: [`QUICKSTART.md`](QUICKSTART.md) (5 minutes)

### 🔐 I need to create an admin
→ Read: [`CREATE_ADMIN.md`](CREATE_ADMIN.md) (Step-by-step guide)

### 🛠️ I want detailed setup
→ Read: [`SETUP_ADMIN.md`](SETUP_ADMIN.md) (Complete guide)

### 📖 I want to understand everything
→ Read: [`README.md`](README.md) (Full documentation)

### 🎨 I want to see what it looks like
→ Read: [`DASHBOARD_PREVIEW.md`](DASHBOARD_PREVIEW.md) (Visual preview)

### 📝 I want project overview
→ Read: [`PROJECT_SUMMARY.md`](PROJECT_SUMMARY.md) (Complete summary)

---

## 🎯 After Setup

Once your dashboard is running, you can:

### 📊 View Analytics
- Total users, transactions, income, expenses
- Interactive charts and graphs
- Real-time updates

### 💳 Manage Transactions
- Search and filter transactions
- View all user transactions
- Real-time transaction feed

### 👥 Manage Users
- View all registered users
- Suspend/activate accounts
- Search by name, email, or student ID

### 📈 Advanced Analytics
- Budget vs Spent analysis
- Budget distribution charts
- User goals tracking
- Progress monitoring

---

## 🆘 Common Issues

### ❌ "Module not found"
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json  # Mac/Linux
rmdir /s node_modules & del package-lock.json  # Windows
npm install
```

### ❌ "Supabase credentials invalid"
1. Check `.env` file exists
2. Verify `REACT_APP_SUPABASE_URL` is correct
3. Verify `REACT_APP_SUPABASE_ANON_KEY` is correct
4. Restart the server: Stop (Ctrl+C) and run `npm start` again

### ❌ "Can't see data"
1. Make sure you created admin user
2. Verify `is_admin = true` in database
3. Check RLS policies are created
4. Enable real-time replication

### ❌ "Port 3000 already in use"
```bash
# Option 1: Use different port
set PORT=3001 && npm start  # Windows
PORT=3001 npm start          # Mac/Linux

# Option 2: Kill process using port 3000
# Windows: Open Task Manager, find Node.js, End Task
# Mac/Linux: lsof -ti:3000 | xargs kill -9
```

### ❌ Charts not showing
```bash
# Reinstall recharts
npm install recharts@^2.10.0
```

---

## 📞 Need Help?

1. **Check the docs** in this folder
2. **Review Supabase logs**: Dashboard → Logs
3. **Check browser console**: F12 → Console tab
4. **Verify database setup**: Run queries in SQL Editor

---

## 🎉 You're Ready!

Your admin dashboard is set up and ready to use!

**Login at**: `http://localhost:3000`

**Default structure**:
```
Your Dashboard
├── 📊 Overview - Analytics and charts
├── 💳 Transactions - All transactions
├── 👥 Users - User management
└── 📈 Analytics - Detailed insights
```

---

## 🚢 Deploy to Production

When ready to deploy:

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm run build
# Drag and drop 'build' folder to Netlify
```

### Other platforms
```bash
npm run build
# Deploy 'build' folder to your hosting
```

**Remember to**:
- ✅ Set environment variables in hosting platform
- ✅ Use production Supabase project
- ✅ Enable HTTPS
- ✅ Configure custom domain

---

## 📈 Next Steps

1. ✅ Test all features
2. ✅ Add sample data (optional)
3. ✅ Customize colors/branding
4. ✅ Set up monitoring
5. ✅ Configure backups
6. ✅ Deploy to production

---

**Built with ❤️ for FinMate**

Happy administrating! 🚀
