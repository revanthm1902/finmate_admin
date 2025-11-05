import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';

const TransactionTable = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState(null);
  const itemsPerPage = 10;

  // Fetch all transactions
  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // First, get all transactions
      let query = supabase
        .from('transactions')
        .select('*', { count: 'exact' });

      // Apply type filter
      if (filterType !== 'all') {
        query = query.eq('type', filterType);
      }

      // Search filter
      if (searchTerm) {
        query = query.or(`description.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`);
      }

      // Pagination
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      const { data: transactionsData, error: transError, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (transError) {
        console.error('Transaction fetch error:', transError);
        setError(`Failed to fetch transactions: ${transError.message}`);
        throw transError;
      }

      console.log('Fetched transactions:', transactionsData);
      console.log('Total count:', count);

      if (!transactionsData || transactionsData.length === 0) {
        setTransactions([]);
        setTotalCount(0);
        setLoading(false);
        return;
      }

      // Get unique user IDs
      const userIds = [...new Set(transactionsData.map(t => t.user_id).filter(Boolean))];
      console.log('User IDs:', userIds);

      if (userIds.length === 0) {
        // No user IDs, just show transactions without user info
        setTransactions(transactionsData.map(t => ({ ...t, profiles: null })));
        setTotalCount(count || 0);
        setLoading(false);
        return;
      }

      // Fetch user profiles
      const { data: profilesData, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, name, email')
        .in('user_id', userIds);

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        // Continue without profile data
        setTransactions(transactionsData.map(t => ({ ...t, profiles: null })));
        setTotalCount(count || 0);
        setLoading(false);
        return;
      }

      console.log('Fetched profiles:', profilesData);

      // Create a map of user_id to profile
      const profileMap = {};
      profilesData?.forEach(profile => {
        profileMap[profile.user_id] = profile;
      });

      // Merge transactions with profiles
      const enrichedTransactions = transactionsData.map(transaction => ({
        ...transaction,
        profiles: profileMap[transaction.user_id] || null
      }));

      setTransactions(enrichedTransactions);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setError(error.message || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, filterType]);

  // Fetch transactions on mount and when filters change
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Poll for updates every 5 seconds - DISABLED (manual refresh only)
  // usePolling(fetchTransactions, 5000);

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const handleManualRefresh = () => {
    fetchTransactions();
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">All Transactions</h2>
          <button
            onClick={handleManualRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium transition"
          >
            <span className={loading ? 'animate-spin' : ''}>🔄</span>
            <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-3">
              <span className="text-red-600 text-xl">⚠️</span>
              <div>
                <h3 className="font-semibold text-red-900">Error Loading Transactions</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
                <p className="text-sm text-red-600 mt-2">
                  Please check the browser console for more details.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* No Data Message */}
        {!loading && !error && totalCount === 0 && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-3">
              <span className="text-yellow-600 text-xl">ℹ️</span>
              <div>
                <h3 className="font-semibold text-yellow-900">No Transactions Found</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Your database doesn't have any transaction data yet.
                </p>
                <p className="text-sm text-yellow-700 mt-2">
                  To add sample data, run the SQL script in <code className="bg-yellow-100 px-2 py-1 rounded">sample-data.sql</code> in your Supabase SQL Editor.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Search Input */}
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
          
          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
            <option value="transfer">Transfer</option>
          </select>

          {/* Results Count */}
          <div className="flex items-center px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
            <span className="text-sm text-gray-600">
              {totalCount} transaction{totalCount !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">User</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Description</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Category</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700">Amount</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array(5).fill(0).map((_, i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td colSpan="6" className="py-4">
                    <div className="h-4 bg-gray-200 animate-pulse rounded"></div>
                  </td>
                </tr>
              ))
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-8 text-gray-500">
                  No transactions found
                </td>
              </tr>
            ) : (
              transactions.map((transaction) => (
                <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {format(new Date(transaction.date), 'MMM dd, yyyy')}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900">
                    {transaction.profiles?.name || transaction.profiles?.email || 'Unknown'}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900">
                    {transaction.description || 'No description'}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {transaction.category || '-'}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        transaction.type === 'income'
                          ? 'bg-green-100 text-green-800'
                          : transaction.type === 'expense'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {transaction.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-right font-semibold">
                    <span
                      className={
                        transaction.type === 'income'
                          ? 'text-green-600'
                          : 'text-gray-900'
                      }
                    >
                      ${Number(transaction.amount).toFixed(2)}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-600">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
            {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} transactions
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionTable;


