import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Realtime Diagnostics Panel
 * 
 * This component helps diagnose real-time connection issues.
 * Add it temporarily to your Dashboard to debug real-time problems.
 * 
 * Usage:
 * import RealtimeDiagnostics from './RealtimeDiagnostics';
 * <RealtimeDiagnostics />
 */
export default function RealtimeDiagnostics() {
  const [diagnostics, setDiagnostics] = useState({
    clientInitialized: false,
    envConfigured: false,
    databaseConnected: false,
    realtimeStatus: 'checking',
    websocketConnected: false,
    channelSubscribed: false,
    lastEvent: null,
    eventCount: 0,
    errors: []
  });

  const [isVisible, setIsVisible] = useState(true);
  const [testChannel, setTestChannel] = useState(null);

  useEffect(() => {
    runDiagnostics();
  }, []);

  const runDiagnostics = async () => {
    const results = { ...diagnostics };

    // Test 1: Check Supabase client
    try {
      results.clientInitialized = !!supabase;
    } catch (error) {
      results.errors.push('Supabase client not initialized');
    }

    // Test 2: Check environment variables
    const url = process.env.REACT_APP_SUPABASE_URL;
    const key = process.env.REACT_APP_SUPABASE_ANON_KEY;
    results.envConfigured = !!(url && key);
    if (!results.envConfigured) {
      results.errors.push('Environment variables not configured');
    }

    // Test 3: Test database connection
    try {
      const { data, error } = await supabase.from('transactions').select('count');
      results.databaseConnected = !error;
      if (error) results.errors.push(`Database error: ${error.message}`);
    } catch (error) {
      results.errors.push(`Database connection failed: ${error.message}`);
    }

    // Test 4: Test real-time subscription
    const channel = supabase
      .channel('diagnostics-test')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'transactions'
      }, (payload) => {
        setDiagnostics(prev => ({
          ...prev,
          lastEvent: new Date().toLocaleTimeString(),
          eventCount: prev.eventCount + 1,
          websocketConnected: true,
          channelSubscribed: true
        }));
      })
      .subscribe((status) => {
        setDiagnostics(prev => ({
          ...prev,
          realtimeStatus: status,
          websocketConnected: status === 'SUBSCRIBED',
          channelSubscribed: status === 'SUBSCRIBED'
        }));

        if (status === 'CHANNEL_ERROR') {
          results.errors.push('Realtime channel error - check if replication is enabled');
        }
      });

    setTestChannel(channel);
    setDiagnostics(results);
  };

  useEffect(() => {
    return () => {
      if (testChannel) {
        supabase.removeChannel(testChannel);
      }
    };
  }, [testChannel]);

  const getStatusColor = (status) => {
    if (status === true) return 'text-green-600';
    if (status === false) return 'text-red-600';
    return 'text-yellow-600';
  };

  const getStatusIcon = (status) => {
    if (status === true) return '✅';
    if (status === false) return '❌';
    return '⏳';
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700"
      >
        Show Diagnostics
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-white rounded-lg shadow-2xl border-2 border-gray-200 z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <h3 className="text-lg font-bold text-gray-900">🔍 Realtime Diagnostics</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      {/* Diagnostic Results */}
      <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
        {/* Test Results */}
        <div className="space-y-2">
          <DiagnosticItem
            label="Supabase Client"
            status={diagnostics.clientInitialized}
          />
          <DiagnosticItem
            label="Environment Config"
            status={diagnostics.envConfigured}
          />
          <DiagnosticItem
            label="Database Connection"
            status={diagnostics.databaseConnected}
          />
          <DiagnosticItem
            label="WebSocket Connected"
            status={diagnostics.websocketConnected}
          />
          <DiagnosticItem
            label="Channel Subscribed"
            status={diagnostics.channelSubscribed}
          />
        </div>

        {/* Realtime Status */}
        <div className="pt-3 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Realtime Status:</span>
            <span className={`text-sm font-bold ${getStatusColor(diagnostics.websocketConnected)}`}>
              {diagnostics.realtimeStatus}
            </span>
          </div>
        </div>

        {/* Event Counter */}
        <div className="pt-3 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Events Received:</span>
            <span className="text-sm font-bold text-blue-600">
              {diagnostics.eventCount}
            </span>
          </div>
          {diagnostics.lastEvent && (
            <div className="text-xs text-gray-500 mt-1">
              Last event: {diagnostics.lastEvent}
            </div>
          )}
        </div>

        {/* Errors */}
        {diagnostics.errors.length > 0 && (
          <div className="pt-3 border-t border-gray-200">
            <div className="text-sm font-medium text-red-600 mb-2">Errors:</div>
            <div className="space-y-1">
              {diagnostics.errors.map((error, index) => (
                <div key={index} className="text-xs text-red-500 bg-red-50 p-2 rounded">
                  {error}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="pt-3 border-t border-gray-200">
          <div className="text-xs text-gray-600 space-y-2">
            {!diagnostics.websocketConnected && (
              <div className="bg-yellow-50 p-3 rounded">
                <div className="font-bold text-yellow-800 mb-1">⚠️ Realtime Not Connected</div>
                <div className="text-yellow-700">
                  Go to Supabase Dashboard → Database → Replication
                  <br />
                  Enable replication for the 'transactions' table
                </div>
              </div>
            )}
            {diagnostics.websocketConnected && (
              <div className="bg-green-50 p-3 rounded">
                <div className="font-bold text-green-800 mb-1">✅ Realtime Connected!</div>
                <div className="text-green-700">
                  Insert a transaction in Supabase to test real-time updates.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="pt-3 border-t border-gray-200 flex gap-2">
          <button
            onClick={runDiagnostics}
            className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
          >
            Rerun Tests
          </button>
          <button
            onClick={() => window.location.reload()}
            className="flex-1 px-3 py-2 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
          >
            Reload Page
          </button>
        </div>
      </div>
    </div>
  );
}

function DiagnosticItem({ label, status }) {
  const getStatusColor = (status) => {
    if (status === true) return 'text-green-600';
    if (status === false) return 'text-red-600';
    return 'text-yellow-600';
  };

  const getStatusIcon = (status) => {
    if (status === true) return '✅';
    if (status === false) return '❌';
    return '⏳';
  };

  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-gray-700">{label}</span>
      <span className={`text-sm font-medium ${getStatusColor(status)}`}>
        {getStatusIcon(status)}
      </span>
    </div>
  );
}
