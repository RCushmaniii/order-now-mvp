// src/components/DebugPanel.tsx

import React, { useState, useEffect } from 'react';
import { logger, LogObject } from '../services/logger';

interface DebugPanelProps {
    maxLogs?: number;
}

const DebugPanel: React.FC<DebugPanelProps> = ({ maxLogs = 50 }) => {
    const [logs, setLogs] = useState<LogObject[]>([]);
    const [isMinimized, setIsMinimized] = useState(false);
    const [filter, setFilter] = useState<string>('all');

    useEffect(() => {
        // Intercept console methods to capture logs
        const originalMethods = {
            debug: console.debug,
            info: console.info,
            warn: console.warn,
            error: console.error,
        };

        const interceptLog = (level: string) => (...args: unknown[]) => {
            // Call original method
            originalMethods[level as keyof typeof originalMethods](...args);

            // Parse JSON logs if they're from our logger
            if (args.length === 1 && typeof args[0] === 'string') {
                try {
                    const logObject = JSON.parse(args[0]);
                    if (logObject.timestamp && logObject.level && logObject.message) {
                        setLogs(prev => [...prev.slice(-(maxLogs - 1)), logObject]);
                    }
                } catch {
                    // Not a JSON log, ignore
                }
            }
        };

        // Override console methods
        console.debug = interceptLog('debug');
        console.info = interceptLog('info');
        console.warn = interceptLog('warn');
        console.error = interceptLog('error');

        // Log that debug panel is active
        logger.debug('Debug panel activated', { maxLogs });

        // Cleanup
        return () => {
            console.debug = originalMethods.debug;
            console.info = originalMethods.info;
            console.warn = originalMethods.warn;
            console.error = originalMethods.error;
        };
    }, [maxLogs]);

    const filteredLogs = logs.filter(log =>
        filter === 'all' || log.level === filter
    );

    const clearLogs = () => setLogs([]);

    const levelColors = {
        debug: 'text-gray-600 bg-gray-100',
        info: 'text-blue-600 bg-blue-100',
        warn: 'text-yellow-600 bg-yellow-100',
        error: 'text-red-600 bg-red-100',
    };

    if (isMinimized) {
        return (
            <div className="fixed bottom-4 right-4 z-50">
                <button
                    onClick={() => setIsMinimized(false)}
                    className="bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-gray-700 flex items-center space-x-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span>Debug Panel ({filteredLogs.length})</span>
                </button>
            </div>
        );
    }

    return (
        <div className="fixed bottom-4 right-4 w-96 max-h-96 bg-white rounded-lg shadow-xl z-50 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b bg-gray-50 rounded-t-lg">
                <h3 className="text-sm font-semibold text-gray-700">Debug Panel</h3>
                <div className="flex items-center space-x-2">
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="text-xs px-2 py-1 border rounded"
                    >
                        <option value="all">All</option>
                        <option value="debug">Debug</option>
                        <option value="info">Info</option>
                        <option value="warn">Warn</option>
                        <option value="error">Error</option>
                    </select>
                    <button
                        onClick={clearLogs}
                        className="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded"
                    >
                        Clear
                    </button>
                    <button
                        onClick={() => setIsMinimized(true)}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Logs */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-64">
                {filteredLogs.length === 0 ? (
                    <p className="text-xs text-gray-500 text-center">No logs yet...</p>
                ) : (
                    filteredLogs.map((log, index) => (
                        <div key={index} className="text-xs border rounded p-2">
                            <div className="flex items-center justify-between mb-1">
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${levelColors[log.level]}`}>
                                    {log.level.toUpperCase()}
                                </span>
                                <span className="text-gray-400">
                                    {new Date(log.timestamp).toLocaleTimeString()}
                                </span>
                            </div>
                            <div className="text-gray-700 font-medium">{log.message}</div>
                            {Object.keys(log.context).length > 0 && (
                                <details className="mt-1">
                                    <summary className="cursor-pointer text-gray-500">Context</summary>
                                    <pre className="mt-1 p-1 bg-gray-50 rounded text-xs overflow-x-auto">
                                        {JSON.stringify(log.context, null, 2)}
                                    </pre>
                                </details>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default DebugPanel;