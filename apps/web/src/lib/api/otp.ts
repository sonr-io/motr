/**
 * OTP API
 * One-time password generation and verification
 */

import { post } from './client';

export type OTPPurpose = 'email_verification' | 'login' | 'password_reset';

export interface GenerateOTPRequest {
	email: string;
	purpose?: OTPPurpose;
}

export interface GenerateOTPResponse {
	success: boolean;
	message: string;
	code?: string; // Only in development
	expiresIn: number; // Seconds
}

export interface VerifyOTPRequest {
	email: string;
	code: string;
}

export interface VerifyOTPResponse {
	success: boolean;
	message: string;
	email?: string;
	purpose?: OTPPurpose;
	error?: string;
	remainingAttempts?: number;
}

/**
 * Generate an OTP for email verification
 */
export async function generateOTP(
	email: string,
	purpose: OTPPurpose = 'email_verification'
): Promise<GenerateOTPResponse> {
	return post<GenerateOTPResponse>('/otp/generate', {
		email,
		purpose,
	});
}

/**
 * Verify an OTP code
 */
export async function verifyOTP(email: string, code: string): Promise<VerifyOTPResponse> {
	return post<VerifyOTPResponse>('/otp/verify', {
		email,
		code,
	});
}
