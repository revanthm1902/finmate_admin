# FinMate Admin Dashboard

A modern, responsive admin dashboard for managing your finance management application built with React, Tailwind CSS, and Supabase.

## Features

- 📊 **Real-time Analytics**: Monitor total users, transactions, income, expenses, budgets, and goals
- 📈 **Interactive Charts**: Visualize data with line charts, bar charts, and pie charts using Recharts
- 💳 **Transaction Management**: View, search, filter, and sort all transactions
- 👥 **User Management**: View, suspend, and delete user accounts
- � **Budget Analytics**: Track budget allocation and spending across categories
- 🎯 **Goals Overview**: Monitor user financial goals and progress
- �🔄 **Real-time Updates**: Automatic updates when new transactions are added
- 🔐 **Secure Authentication**: Admin-only access with Supabase Auth
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices

## Prerequisites

- Node.js 14 or higher
- A Supabase project with the required database schema (see Database Setup section)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd finmate-admin
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

4. Update the `.env` file with your Supabase credentials:
```
REACT_APP_SUPABASE_URL=your-supabase-url
REACT_APP_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Database Setup

### 1. Run the Database Schema

Execute the SQL script provided in your database to create the following tables:
- `profiles` - User profile information
- `transactions` - Financial transactions (income/expense)
- `incomes` - Income sources
- `budget_categories` - Budget tracking by category
- `goals` - User financial goals

### 2. Set Up Admin Access

Run the `database.sql` file in your Supabase SQL Editor to:
- Add admin columns to profiles table
- Create RLS policies for admin access
- Set up indexes for performance
- Create helper views for analytics

### 3. Create Your First Admin User

Follow the instructions in `SETUP_ADMIN.md` to:
1. Create an admin user in Supabase Auth
2. Grant admin privileges to your user
3. Configure security policies

Quick steps:
```sql
-- After creating a user in Supabase Auth, run:
UPDATE public.profiles 
SET is_admin = true 
WHERE user_id = 'YOUR_USER_ID_HERE';
```

### 4. Enable Real-time

In your Supabase dashboard:
1. Go to Database > Replication
2. Enable replication for: `transactions`, `profiles`, `incomes`, `budget_categories`, `goals`

## Running the Application

Start the development server:
```bash
npm start
```

The application will open at `http://localhost:3000`.

## Project Structure

```
finmate-admin/
├── public/
├── src/
│   ├── components/
│   │   ├── AnalyticsCard.js      # Reusable analytics card component
│   │   ├── BudgetAnalytics.js    # Budget analytics with charts
│   │   ├── GoalsOverview.js      # User goals tracking
│   │   ├── Navbar.js              # Top navigation bar
│   │   ├── Sidebar.js             # Side navigation menu
│   │   ├── TransactionTable.js    # Transaction list with filters
│   │   └── UserManagement.js      # User management interface
│   ├── contexts/
│   │   └── AuthContext.js         # Authentication context
│   ├── lib/
│   │   └── supabase.js            # Supabase client configuration
│   ├── pages/
│   │   ├── Analytics.js           # Analytics page with charts
│   │   ├── Dashboard.js           # Main dashboard layout
│   │   ├── Login.js               # Login page
│   │   ├── Overview.js            # Dashboard overview with analytics
│   │   ├── Transactions.js        # Full transactions page
│   │   └── Users.js               # User management page
│   ├── App.js                     # Main app component
│   ├── index.css                  # Tailwind CSS imports
│   └── index.js                   # App entry point
├── .env.example                   # Environment variables template
├── database.sql                   # Database setup SQL
├── SETUP_ADMIN.md                 # Admin setup guide
├── package.json
├── tailwind.config.js
└── README.md
```

## Features Explained

### Dashboard Overview
- 6 analytics cards showing key metrics
- 7-day transaction trend chart (line chart)
- Income vs Expenses pie chart
- Expense breakdown by category (bar chart)
- Real-time transaction list

### Transaction Management
- Search by description or category
- Filter by type (income/expense/transfer)
- Pagination for large datasets
- Real-time updates
- User information display

### User Management
- View all registered users
- Search by name, university, or student ID
- Suspend/activate user accounts
- Delete user accounts (with confirmation)
- Display profile images

### Analytics Page
- Budget vs Spent comparison (bar chart)
- Budget distribution (pie chart)
- Total budget/spent/remaining summary
- User goals progress tracking
- Days remaining until goal deadline

### Real-time Updates
The dashboard uses Supabase's real-time capabilities:

```javascript
const channel = supabase
  .channel('analytics-updates')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'transactions'
  }, (payload) => {
    fetchAnalytics(); // Refresh data
  })
  .subscribe();
```

## Building for Production

Build the production-ready app:
```bash
npm run build
```

The optimized files will be in the `build/` directory.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `REACT_APP_SUPABASE_URL` | Your Supabase project URL |
| `REACT_APP_SUPABASE_ANON_KEY` | Your Supabase anonymous key |

## Security Best Practices

1. **Never commit `.env` files** - Keep your credentials secure
2. **Implement RLS policies** - Restrict database access to admin users only
3. **Use environment variables** - Store sensitive data in environment variables
4. **Validate admin access** - Check user roles before allowing admin operations
5. **Enable HTTPS** - Always use HTTPS in production
6. **Regular backups** - Set up automated database backups
7. **Monitor access logs** - Track admin activities

## Admin Privileges

Admins can:
- ✅ View all user profiles
- ✅ View all transactions across all users
- ✅ View all budgets and goals
- ✅ Suspend/activate user accounts
- ✅ Access analytics and insights
- ✅ Search and filter all data

Regular users can only access their own data through RLS policies.

## Troubleshooting

### Charts not displaying
- Ensure `recharts` is installed: `npm install recharts`
- Check browser console for errors

### Real-time not working
- Ensure replication is enabled for your tables in Supabase
- Check that your RLS policies allow the authenticated user to read data

### Authentication errors
- Verify your Supabase credentials in `.env`
- Ensure the user has `is_admin = true` in the profiles table

### Can't delete users
- User deletion requires admin privileges in Supabase
- Consider using Supabase Dashboard for user deletion
- Or implement an Edge Function (see SETUP_ADMIN.md)

## Performance Optimization

- Database indexes are created for frequently queried columns
- Pagination limits data fetching
- Real-time subscriptions are properly cleaned up
- Charts use memoization to prevent unnecessary re-renders

## License

MIT

## Support

For issues and questions:
1. Check the `SETUP_ADMIN.md` file
2. Review Supabase logs in Dashboard > Logs
3. Check browser console for errors
4. Open an issue in the repository

