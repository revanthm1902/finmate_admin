import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
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

const BudgetAnalytics = () => {
  const [budgetData, setBudgetData] = useState([]);
  const [summary, setSummary] = useState({ totalBudget: 0, totalSpent: 0, remaining: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBudgetData();
  }, []);

  const fetchBudgetData = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('budget_categories')
        .select('*')
        .order('budget', { ascending: false });

      if (error) throw error;

      const totalBudget = data?.reduce((sum, b) => sum + Number(b.budget), 0) || 0;
      const totalSpent = data?.reduce((sum, b) => sum + Number(b.spent), 0) || 0;

      setSummary({
        totalBudget,
        totalSpent,
        remaining: totalBudget - totalSpent,
      });

      const chartData = data?.map(b => ({
        name: b.name,
        budget: Number(b.budget),
        spent: Number(b.spent),
        remaining: Number(b.budget) - Number(b.spent),
      })) || [];

      setBudgetData(chartData);
    } catch (error) {
      console.error('Error fetching budget data:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
          <p className="text-sm font-medium text-gray-600">Total Budget</p>
          <h3 className="text-2xl font-bold text-gray-900">
            ${summary.totalBudget.toFixed(2)}
          </h3>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500">
          <p className="text-sm font-medium text-gray-600">Total Spent</p>
          <h3 className="text-2xl font-bold text-gray-900">
            ${summary.totalSpent.toFixed(2)}
          </h3>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
          <p className="text-sm font-medium text-gray-600">Remaining</p>
          <h3 className="text-2xl font-bold text-gray-900">
            ${summary.remaining.toFixed(2)}
          </h3>
        </div>
      </div>

      {/* Budget vs Spent Chart */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Budget vs Spent by Category
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={budgetData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
            <Legend />
            <Bar dataKey="budget" fill="#0ea5e9" name="Budget" />
            <Bar dataKey="spent" fill="#ef4444" name="Spent" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Budget Distribution Pie Chart */}
      {budgetData.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Budget Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={budgetData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="budget"
              >
                {budgetData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default BudgetAnalytics;
