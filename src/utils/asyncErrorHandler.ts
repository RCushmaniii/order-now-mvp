// src/utils/asyncErrorHandler.ts

import { logger } from '../services/logger';

/**
 * Wraps an async function with error logging
 * @param fn The async function to wrap
 * @param context Additional context to log on error
 * @returns The wrapped function
 */
export function withErrorLogging<T extends (...args: unknown[]) => Promise<unknown>>(
    fn: T,
    context?: Record<string, string | number | boolean | null | undefined>
): T {
    return (async (...args: Parameters<T>) => {
        try {
            return await fn(...args);
        } catch (error) {
            const errorDetails = {
                functionName: fn.name || 'anonymous',
                arguments: JSON.stringify(args),
                ...context,
                error: error instanceof Error ? error : new Error(String(error)),
            };

            logger.error('Async function error', errorDetails);
            throw error; // Re-throw to allow caller to handle
        }
    }) as T;
}

/**
 * Tries to execute an async function and returns a result object
 * @param fn The async function to execute
 * @param fallback Optional fallback value on error
 * @returns Object with either data or error
 */
export async function tryAsync<T>(
    fn: () => Promise<T>,
    fallback?: T
): Promise<{ data?: T; error?: Error }> {
    try {
        const data = await fn();
        return { data };
    } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        logger.error('tryAsync caught error', {
            error: err.message,
            stack: err.stack
        });

        if (fallback !== undefined) {
            return { data: fallback, error: err };
        }

        return { error: err };
    }
}

/**
 * Example usage for API calls
 */
export class ApiClient {
    static async fetchWithLogging(url: string, options?: RequestInit) {
        const startTime = Date.now();

        try {
            logger.debug('API request started', { url, method: options?.method || 'GET' });

            const response = await fetch(url, options);
            const duration = Date.now() - startTime;

            if (!response.ok) {
                logger.warn('API request failed', {
                    url,
                    status: response.status,
                    statusText: response.statusText,
                    duration,
                });
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            logger.info('API request successful', {
                url,
                status: response.status,
                duration,
            });

            return response;
        } catch (error) {
            const duration = Date.now() - startTime;
            logger.error('API request error', {
                url,
                duration,
                error: error instanceof Error ? error : new Error(String(error)),
            });
            throw error;
        }
    }
}