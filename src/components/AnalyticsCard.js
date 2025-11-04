import React from 'react';

const AnalyticsCard = ({ title, value, icon, trend, trendValue, loading }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition duration-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          {loading ? (
            <div className="h-8 w-24 bg-gray-200 animate-pulse rounded"></div>
          ) : (
            <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
          )}
          {trend && trendValue && (
            <div className="flex items-center mt-2">
              <span
                className={`text-sm font-medium ${
                  trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {trend === 'up' ? '↑' : '↓'} {trendValue}
              </span>
              <span className="text-xs text-gray-500 ml-2">vs last month</span>
            </div>
          )}
        </div>
        <div className="ml-4">
          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-2xl">
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsCard;
