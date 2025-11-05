import React from 'react';

export default function RealtimeStatus() {
  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Status Indicator */}
      <div className="flex items-center gap-2">
        <span className="inline-block w-3 h-3 rounded-full bg-green-500"></span>
        <span className="text-sm font-medium text-gray-700">
          Manual Refresh
        </span>
      </div>

      {/* Description */}
      <div className="h-4 w-px bg-gray-300"></div>
      <span className="text-xs text-gray-500">
        Click refresh buttons to update
      </span>
    </div>
  );
}
