import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import AnalyticsCard from '../components/AnalyticsCard';
import TransactionTable from '../components/TransactionTable';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format, subDays, startOfDay } from 'date-fns';

const Overview = () => {
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    totalTransactions: 0,
    totalIncome: 0,
    totalExpenses: 0,
    totalBudget: 0,
    totalGoals: 0,
  });
  const [transactionTrend, setTransactionTrend] = useState([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const [incomeVsExpense, setIncomeVsExpense] = useState([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('all');

  // Fetch all users for the dropdown
  const fetchUsers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, name, email')
        .order('name');

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }, []);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch total users from profiles
      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Build query for transactions with optional user filter
      let transactionQuery = supabase
        .from('transactions')
        .select('*', { count: 'exact' });

      if (selectedUserId !== 'all') {
        transactionQuery = transactionQuery.eq('user_id', selectedUserId);
      }

      const { count: transactionCount, data: allTransactions } = await transactionQuery;

      // Calculate total income and expenses
      const totalIncome = allTransactions
        ?.filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

      const totalExpenses = allTransactions
        ?.filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

      // Fetch budget data
      const { data: budgetData } = await supabase
        .from('budget_categories')
        .select('budget, spent');

      const totalBudget = budgetData?.reduce((sum, b) => sum + Number(b.budget), 0) || 0;

      // Fetch goals count
      const { count: goalsCount } = await supabase
        .from('goals')
        .select('*', { count: 'exact', head: true });

      setAnalytics({
        totalUsers: userCount || 0,
        totalTransactions: transactionCount || 0,
        totalIncome,
        totalExpenses,
        totalBudget,
        totalGoals: goalsCount || 0,
      });

      // Generate transaction trend for last 7 days
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = startOfDay(subDays(new Date(), 6 - i));
        return format(date, 'yyyy-MM-dd');
      });

      const trendData = last7Days.map(date => {
        const dayTransactions = allTransactions?.filter(
          t => format(new Date(t.date), 'yyyy-MM-dd') === date
        ) || [];
        
        const income = dayTransactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + Number(t.amount), 0);
        
        const expense = dayTransactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + Number(t.amount), 0);

        return {
          date: format(new Date(date), 'MMM dd'),
          income,
          expense,
        };
      });

      setTransactionTrend(trendData);

      // Category breakdown for pie chart
      const categoryMap = {};
      allTransactions?.forEach(t => {
        if (t.type === 'expense') {
          categoryMap[t.category] = (categoryMap[t.category] || 0) + Number(t.amount);
        }
      });

      const categoryData = Object.entries(categoryMap).map(([name, value]) => ({
        name,
        value,
      }));

      setCategoryBreakdown(categoryData);

      // Income vs Expense comparison
      setIncomeVsExpense([
        { name: 'Income', value: totalIncome },
        { name: 'Expenses', value: totalExpenses },
      ]);

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedUserId]);

  // Fetch users on mount
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Fetch analytics when user selection changes
  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Use polling to fetch data every 5 seconds - DISABLED (manual refresh only)
  // usePolling(fetchAnalytics, 5000);

  const handleManualRefresh = () => {
    fetchAnalytics();
  };

  const COLORS = ['#0ea5e9', '#f59e0b', '#ef4444', '#10b981', '#8b5cf6', '#ec4899', '#14b8a6'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
          <p className="text-gray-600">Monitor your finance management platform</p>
        </div>

        {/* User Filter and Refresh Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleManualRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium transition"
          >
            <span className={loading ? 'animate-spin' : ''}>🔄</span>
            <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
          </button>
          <label className="text-sm font-medium text-gray-700">Filter by User:</label>
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white min-w-[200px]"
          >
            <option value="all">All Users ({users.length})</option>
            {users.map(user => (
              <option key={user.user_id} value={user.user_id}>
                {user.name || user.email}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnalyticsCard
          title="Total Users"
          value={analytics.totalUsers.toLocaleString()}
          icon="👥"
          loading={loading}
        />
        <AnalyticsCard
          title={selectedUserId === 'all' ? 'Total Transactions' : 'User Transactions'}
          value={analytics.totalTransactions.toLocaleString()}
          icon="💳"
          loading={loading}
        />
        <AnalyticsCard
          title={selectedUserId === 'all' ? 'Total Income' : 'User Income'}
          value={`$${analytics.totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon="💰"
          loading={loading}
        />
        <AnalyticsCard
          title={selectedUserId === 'all' ? 'Total Expenses' : 'User Expenses'}
          value={`$${analytics.totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon="💸"
          loading={loading}
        />
        <AnalyticsCard
          title="Total Budget"
          value={`$${analytics.totalBudget.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon="💵"
          loading={loading}
        />
        <AnalyticsCard
          title="Active Goals"
          value={analytics.totalGoals.toLocaleString()}
          icon="🎯"
          loading={loading}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transaction Trend Chart */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            7-Day Transaction Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={transactionTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
              <Legend />
              <Line
                type="monotone"
                dataKey="income"
                stroke="#10b981"
                strokeWidth={2}
                name="Income"
              />
              <Line
                type="monotone"
                dataKey="expense"
                stroke="#ef4444"
                strokeWidth={2}
                name="Expenses"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Income vs Expense Pie Chart */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Income vs Expenses
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={incomeVsExpense}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: $${Number(value).toFixed(2)}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {incomeVsExpense.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#ef4444'} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Category Breakdown */}
        {categoryBreakdown.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6 lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Expense by Category
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryBreakdown}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
                <Bar dataKey="value" fill="#0ea5e9">
                  {categoryBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Recent Transactions */}
      <TransactionTable />
    </div>
  );
};

export default Overview;
