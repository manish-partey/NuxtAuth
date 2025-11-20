// utils/api.ts
// Utility functions for API calls to avoid TypeScript recursion issues

import type { FetchOptions } from '~/types/api'

/**
 * Type-safe wrapper around $fetch to avoid TypeScript recursion issues
 */
export function apiCall<T>(url: string, options: FetchOptions = {}): Promise<T> {
  return $fetch<T>(url, {
    credentials: 'include',
    ...options
  })
}

/**
 * Simplified GET request
 */
export function apiGet<T>(url: string, options: Omit<FetchOptions, 'method'> = {}): Promise<T> {
  return apiCall<T>(url, { ...options, method: 'GET' })
}

/**
 * Simplified POST request
 */
export function apiPost<T>(url: string, body?: any, options: Omit<FetchOptions, 'method' | 'body'> = {}): Promise<T> {
  return apiCall<T>(url, { ...options, method: 'POST', body })
}

/**
 * Simplified PUT request
 */
export function apiPut<T>(url: string, body?: any, options: Omit<FetchOptions, 'method' | 'body'> = {}): Promise<T> {
  return apiCall<T>(url, { ...options, method: 'PUT', body })
}

/**
 * Simplified DELETE request
 */
export function apiDelete<T>(url: string, options: Omit<FetchOptions, 'method'> = {}): Promise<T> {
  return apiCall<T>(url, { ...options, method: 'DELETE' })
}