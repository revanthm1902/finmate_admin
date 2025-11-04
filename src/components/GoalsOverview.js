import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { format, differenceInDays } from 'date-fns';

const GoalsOverview = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('goals')
        .select('*, profiles:user_id(name)')
        .order('target_date', { ascending: true });

      if (error) throw error;
      setGoals(data || []);
    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProgressPercentage = (current, target) => {
    return Math.min((current / target) * 100, 100);
  };

  const getDaysRemaining = (targetDate) => {
    return differenceInDays(new Date(targetDate), new Date());
  };

  const getStatusColor = (percentage) => {
    if (percentage >= 75) return 'bg-green-500';
    if (percentage >= 50) return 'bg-blue-500';
    if (percentage >= 25) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">User Goals Overview</h3>
      
      {goals.length === 0 ? (
        <p className="text-center text-gray-500 py-8">No goals found</p>
      ) : (
        <div className="space-y-4">
          {goals.map((goal) => {
            const progress = getProgressPercentage(goal.current_amount, goal.target_amount);
            const daysLeft = getDaysRemaining(goal.target_date);
            
            return (
              <div key={goal.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-900">{goal.name}</h4>
                    <p className="text-sm text-gray-600">{goal.profiles?.name || 'Unknown User'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      ${Number(goal.current_amount).toFixed(2)} / ${Number(goal.target_amount).toFixed(2)}
                    </p>
                    <p className={`text-xs ${daysLeft < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                      {daysLeft < 0 ? 'Overdue' : `${daysLeft} days left`}
                    </p>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                  <div
                    className={`h-3 rounded-full transition-all duration-300 ${getStatusColor(progress)}`}
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between text-xs text-gray-600">
                  <span>{progress.toFixed(1)}% complete</span>
                  <span>Due: {format(new Date(goal.target_date), 'MMM dd, yyyy')}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GoalsOverview;
