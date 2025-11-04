import React from 'react';
import TransactionTable from '../components/TransactionTable';

const Transactions = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">All Transactions</h1>
        <p className="text-gray-600">View and manage all user transactions</p>
      </div>

      <TransactionTable />
    </div>
  );
};

export default Transactions;
