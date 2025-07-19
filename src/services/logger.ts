// src/services/logger.ts

// Define log level priorities
const LEVEL_PRIORITIES = {
    debug: 10,
    info: 20,
    warn: 30,
    error: 40,
} as const;

type LogLevel = keyof typeof LEVEL_PRIORITIES;

// Determine the current log level from environment variables
const LOG_LEVEL: LogLevel = (import.meta.env.VITE_LOG_LEVEL as LogLevel)
    ?? (import.meta.env.DEV ? 'debug' : 'info');

// Type for log context - can be extended as needed
interface LogContext {
    [key: string]: string | number | boolean | null | undefined | Error | object;
}

// Type for structured log object
interface LogObject {
    timestamp: string;
    level: LogLevel;
    message: string;
    context: LogContext;
}

/**
 * The active transport layer.
 * This can be replaced with a more advanced remote logging service.
 * For now, it maps log levels to the appropriate console method.
 */
const transport = (level: LogLevel, logObject: LogObject): void => {
    // In development, use pretty-print; in production, use compact JSON
    const logString = import.meta.env.DEV
        ? JSON.stringify(logObject, null, 2)
        : JSON.stringify(logObject);

    switch (level) {
        case 'debug':
            console.debug(logString);
            break;
        case 'info':
            console.info(logString);
            break;
        case 'warn':
            console.warn(logString);
            break;
        case 'error':
            console.error(logString);
            break;
    }
};

// Internal log handler that formats the log and sends to the transport
function handleLog(level: LogLevel, message: string, context: LogContext = {}): void {
    // Always log errors, otherwise check the configured level
    if (level !== 'error' && LEVEL_PRIORITIES[level] < LEVEL_PRIORITIES[LOG_LEVEL]) {
        return;
    }

    const logObject: LogObject = {
        timestamp: new Date().toISOString(),
        level,
        message,
        context,
    };

    transport(level, logObject);
}

/**
 * The single, unified logger for the application.
 * Usage:
 * logger.debug('Debug message', { userId: 123 });
 * logger.info('User logged in', { email: 'user@example.com' });
 * logger.warn('API rate limit approaching', { remaining: 10 });
 * logger.error('Failed to process order', { orderId: 456, error: err });
 */
export const logger = {
    debug: (message: string, context?: LogContext) => handleLog('debug', message, context),
    info: (message: string, context?: LogContext) => handleLog('info', message, context),
    warn: (message: string, context?: LogContext) => handleLog('warn', message, context),
    error: (message: string, context?: LogContext) => handleLog('error', message, context),
};

// Export types for use in other files
export type { LogLevel, LogContext, LogObject };
