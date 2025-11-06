/**
 * OTP Routes
 * One-time password generation and verification
 */

import { Hono } from 'hono';
import type { Bindings, OTPData } from '../types';

const otp = new Hono<{ Bindings: Bindings }>();

const OTP_CONFIG = {
  LENGTH: 6,
  EXPIRY_MINUTES: 10,
  MAX_ATTEMPTS: 3,
} as const;

/**
 * Generate a random OTP code
 */
function generateOTPCode(): string {
  const digits = '0123456789';
  let code = '';
  for (let i = 0; i < OTP_CONFIG.LENGTH; i++) {
    code += digits[Math.floor(Math.random() * digits.length)];
  }
  return code;
}

/**
 * POST /otp/generate - Generate OTP for email verification
 */
otp.post('/generate', async (c) => {
  try {
    const body = await c.req.json<{
      email: string;
      purpose?: 'email_verification' | 'login' | 'password_reset';
    }>();

    if (!body.email || !isValidEmail(body.email)) {
      return c.json({ error: 'Valid email is required' }, 400);
    }

    const code = generateOTPCode();
    const now = Date.now();
    const expiresAt = now + OTP_CONFIG.EXPIRY_MINUTES * 60 * 1000;

    const otpData: OTPData = {
      code,
      email: body.email.toLowerCase(),
      purpose: body.purpose || 'email_verification',
      createdAt: now,
      expiresAt,
      attempts: 0,
    };

    // Store OTP with email as key
    const otpKey = `otp:${body.email.toLowerCase()}`;
    await c.env.OTP_STORE.put(otpKey, JSON.stringify(otpData), {
      expirationTtl: OTP_CONFIG.EXPIRY_MINUTES * 60,
    });

    // In development, return the code for testing
    if (c.env.ENVIRONMENT === 'development') {
      return c.json({
        success: true,
        message: 'OTP generated successfully',
        code, // Only in development
        expiresIn: OTP_CONFIG.EXPIRY_MINUTES * 60,
      });
    }

    // In production, don't return the code (send via email instead)
    return c.json({
      success: true,
      message: 'OTP sent to your email',
      expiresIn: OTP_CONFIG.EXPIRY_MINUTES * 60,
    });
  } catch (error) {
    console.error('[OTP Generation Error]', error);
    return c.json({ error: 'Failed to generate OTP' }, 500);
  }
});

/**
 * POST /otp/verify - Verify OTP
 */
otp.post('/verify', async (c) => {
  try {
    const body = await c.req.json<{
      email: string;
      code: string;
    }>();

    if (!body.email || !body.code) {
      return c.json({ error: 'Email and code are required' }, 400);
    }

    const otpKey = `otp:${body.email.toLowerCase()}`;
    const storedOTP = await c.env.OTP_STORE.get<OTPData>(otpKey, 'json');

    if (!storedOTP) {
      return c.json({ error: 'OTP not found or expired' }, 404);
    }

    // Check if expired
    if (Date.now() > storedOTP.expiresAt) {
      await c.env.OTP_STORE.delete(otpKey);
      return c.json({ error: 'OTP has expired' }, 400);
    }

    // Check attempts
    if (storedOTP.attempts >= OTP_CONFIG.MAX_ATTEMPTS) {
      await c.env.OTP_STORE.delete(otpKey);
      return c.json({ error: 'Maximum verification attempts exceeded' }, 429);
    }

    // Verify code
    if (storedOTP.code !== body.code) {
      // Increment attempts
      storedOTP.attempts++;
      const ttl = Math.floor((storedOTP.expiresAt - Date.now()) / 1000);

      if (ttl > 0) {
        await c.env.OTP_STORE.put(otpKey, JSON.stringify(storedOTP), {
          expirationTtl: ttl,
        });
      }

      const remainingAttempts = OTP_CONFIG.MAX_ATTEMPTS - storedOTP.attempts;
      return c.json(
        {
          error: 'Invalid OTP code',
          remainingAttempts,
        },
        400
      );
    }

    // OTP verified successfully - delete it
    await c.env.OTP_STORE.delete(otpKey);

    return c.json({
      success: true,
      message: 'OTP verified successfully',
      email: storedOTP.email,
      purpose: storedOTP.purpose,
    });
  } catch (error) {
    console.error('[OTP Verification Error]', error);
    return c.json({ error: 'Failed to verify OTP' }, 500);
  }
});

/**
 * Simple email validation
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export default otp;
