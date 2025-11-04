import React from 'react';
import BudgetAnalytics from '../components/BudgetAnalytics';
import GoalsOverview from '../components/GoalsOverview';

const Analytics = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics & Insights</h1>
        <p className="text-gray-600">Detailed analytics for budgets and goals</p>
      </div>

      {/* Budget Analytics */}
      <BudgetAnalytics />

      {/* Goals Overview */}
      <GoalsOverview />
    </div>
  );
};

export default Analytics;
