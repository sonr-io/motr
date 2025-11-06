/**
 * API Client
 * Base HTTP client with fetch wrapper for API requests
 */

import { API_BASE_URL } from '$lib/config';

export interface ApiResponse<T = unknown> {
	data?: T;
	error?: string;
	message?: string;
	timestamp?: string;
}

export interface ApiError {
	error: string;
	message?: string;
	status: number;
	timestamp?: string;
}

class ApiClientError extends Error {
	constructor(
		message: string,
		public status: number,
		public error: string,
		public timestamp?: string
	) {
		super(message);
		this.name = 'ApiClientError';
	}
}

/**
 * Make an API request with automatic error handling
 */
async function request<T>(
	endpoint: string,
	options: RequestInit = {}
): Promise<T> {
	const url = `${API_BASE_URL}${endpoint}`;

	const defaultHeaders: HeadersInit = {
		'Content-Type': 'application/json',
		...options.headers,
	};

	try {
		const response = await fetch(url, {
			...options,
			headers: defaultHeaders,
			credentials: 'include', // Include cookies for session
		});

		const data = await response.json();

		if (!response.ok) {
			throw new ApiClientError(
				data.message || data.error || 'API request failed',
				response.status,
				data.error || 'Unknown error',
				data.timestamp
			);
		}

		return data as T;
	} catch (error) {
		if (error instanceof ApiClientError) {
			throw error;
		}

		// Network or parsing error
		throw new ApiClientError(
			error instanceof Error ? error.message : 'Network error',
			0,
			'NetworkError'
		);
	}
}

/**
 * GET request
 */
export async function get<T>(endpoint: string, options?: RequestInit): Promise<T> {
	return request<T>(endpoint, {
		...options,
		method: 'GET',
	});
}

/**
 * POST request
 */
export async function post<T>(
	endpoint: string,
	body?: unknown,
	options?: RequestInit
): Promise<T> {
	return request<T>(endpoint, {
		...options,
		method: 'POST',
		body: body ? JSON.stringify(body) : undefined,
	});
}

/**
 * PUT request
 */
export async function put<T>(
	endpoint: string,
	body?: unknown,
	options?: RequestInit
): Promise<T> {
	return request<T>(endpoint, {
		...options,
		method: 'PUT',
		body: body ? JSON.stringify(body) : undefined,
	});
}

/**
 * DELETE request
 */
export async function del<T>(endpoint: string, options?: RequestInit): Promise<T> {
	return request<T>(endpoint, {
		...options,
		method: 'DELETE',
	});
}

/**
 * PATCH request
 */
export async function patch<T>(
	endpoint: string,
	body?: unknown,
	options?: RequestInit
): Promise<T> {
	return request<T>(endpoint, {
		...options,
		method: 'PATCH',
		body: body ? JSON.stringify(body) : undefined,
	});
}

export { ApiClientError };
