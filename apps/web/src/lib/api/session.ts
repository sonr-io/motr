/**
 * Session API
 * User session management endpoints
 */

import { get, post } from './client';

export interface SessionData {
	authenticated: boolean;
	userId?: string;
	username?: string;
}

export interface AuthenticateRequest {
	userId: string;
	username: string;
}

export interface AuthenticateResponse {
	success: boolean;
	session: SessionData;
}

export interface LogoutResponse {
	success: boolean;
}

/**
 * Get current session
 * Creates a new session if one doesn't exist
 */
export async function getSession(): Promise<SessionData> {
	return get<SessionData>('/session');
}

/**
 * Authenticate session with user data
 */
export async function authenticate(
	userId: string,
	username: string
): Promise<AuthenticateResponse> {
	return post<AuthenticateResponse>('/session/authenticate', {
		userId,
		username,
	});
}

/**
 * Logout and destroy session
 */
export async function logout(): Promise<LogoutResponse> {
	return post<LogoutResponse>('/session/logout');
}
