import { WorkflowEntrypoint, WorkflowStep, WorkflowEvent } from 'cloudflare:workers';

/**
 * OTPEmailWorkflow - Sends OTP verification emails using Resend
 *
 * This workflow handles the complete OTP email sending flow:
 * 1. Generate OTP code
 * 2. Send email via Resend
 * 3. Store OTP with expiration
 * 4. Handle retries and errors
 */

export interface OTPEmailParams {
  email: string;
  username?: string;
  purpose?: 'registration' | 'login' | 'password-reset';
  expiresInMinutes?: number;
}

export interface OTPEmailResult {
  success: boolean;
  otpCode?: string;
  emailId?: string;
  expiresAt?: number;
  error?: string;
}

export class OTPEmailWorkflow extends WorkflowEntrypoint<Env, OTPEmailParams, OTPEmailResult> {
  async run(event: WorkflowEvent<OTPEmailParams>, step: WorkflowStep): Promise<OTPEmailResult> {
    const { email, username, purpose = 'registration', expiresInMinutes = 10 } = event.payload;

    console.log('[OTPEmailWorkflow] Starting workflow for:', email);

    // Step 1: Generate OTP code
    const otpCode = await step.do('generate-otp', async () => {
      console.log('[OTPEmailWorkflow] Generating OTP code');
      return this.generateOTP();
    });

    // Step 2: Calculate expiration
    const expiresAt = await step.do('calculate-expiration', async () => {
      const expiration = Date.now() + expiresInMinutes * 60 * 1000;
      console.log('[OTPEmailWorkflow] OTP expires at:', new Date(expiration).toISOString());
      return expiration;
    });

    // Step 3: Send email via Resend
    const emailResult = await step.do('send-email', async () => {
      console.log('[OTPEmailWorkflow] Sending email via Resend');
      return await this.sendOTPEmail(email, otpCode, username, purpose, expiresInMinutes);
    });

    if (!emailResult.success) {
      console.error('[OTPEmailWorkflow] Failed to send email:', emailResult.error);
      return {
        success: false,
        error: emailResult.error || 'Failed to send email'
      };
    }

    // Step 4: Store OTP in KV or Durable Object for validation
    await step.do('store-otp', async () => {
      console.log('[OTPEmailWorkflow] Storing OTP for validation');
      await this.storeOTP(email, otpCode, expiresAt);
    });

    console.log('[OTPEmailWorkflow] Workflow completed successfully');

    return {
      success: true,
      otpCode, // In production, don't return this!
      emailId: emailResult.emailId,
      expiresAt
    };
  }

  /**
   * Generate a 6-digit OTP code
   */
  private generateOTP(): string {
    // Generate 6-digit code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('[OTPEmailWorkflow] Generated OTP:', otp);
    return otp;
  }

  /**
   * Send OTP email via Resend API
   */
  private async sendOTPEmail(
    email: string,
    otpCode: string,
    username: string | undefined,
    purpose: string,
    expiresInMinutes: number
  ): Promise<{ success: boolean; emailId?: string; error?: string }> {
    try {
      const resendApiKey = this.env.RESEND_API_KEY;

      if (!resendApiKey) {
        throw new Error('RESEND_API_KEY environment variable not configured');
      }

      // Render email HTML template
      const emailHtml = this.renderEmailHTML(otpCode, username, purpose, expiresInMinutes);

      // Send via Resend
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: this.env.EMAIL_FROM || 'Sonr Identity <noreply@sonr.id>',
          to: [email],
          subject: this.getEmailSubject(purpose),
          html: emailHtml
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Resend API error: ${error}`);
      }

      const result = await response.json() as { id: string };

      console.log('[OTPEmailWorkflow] Email sent successfully, ID:', result.id);

      return {
        success: true,
        emailId: result.id
      };
    } catch (error) {
      console.error('[OTPEmailWorkflow] Error sending email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Store OTP in KV for later validation
   */
  private async storeOTP(email: string, otpCode: string, expiresAt: number): Promise<void> {
    if (!this.env.OTP_STORE) {
      console.warn('[OTPEmailWorkflow] OTP_STORE KV namespace not configured, skipping storage');
      return;
    }

    const key = `otp:${email}`;
    const value = JSON.stringify({
      code: otpCode,
      expiresAt,
      createdAt: Date.now()
    });

    // Store with TTL matching expiration
    const ttl = Math.floor((expiresAt - Date.now()) / 1000);
    await this.env.OTP_STORE.put(key, value, { expirationTtl: ttl });

    console.log('[OTPEmailWorkflow] OTP stored in KV with key:', key);
  }

  /**
   * Get email subject based on purpose
   */
  private getEmailSubject(purpose: string): string {
    switch (purpose) {
      case 'registration':
        return 'Welcome to Sonr - Verify Your Email';
      case 'login':
        return 'Sonr Login Verification Code';
      case 'password-reset':
        return 'Reset Your Sonr Password';
      default:
        return 'Sonr Verification Code';
    }
  }

  /**
   * Render OTP email HTML template
   */
  private renderEmailHTML(
    otpCode: string,
    username: string | undefined,
    purpose: string,
    expiresInMinutes: number
  ): string {
    const greeting = username ? `Hi ${username}` : 'Hello';
    const purposeText = this.getPurposeText(purpose);

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sonr Verification Code</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">Sonr Identity</h1>
    </div>

    <!-- Content -->
    <div style="padding: 40px 30px;">
      <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 24px;">${greeting}!</h2>

      <p style="color: #666666; margin: 0 0 30px 0; font-size: 16px; line-height: 1.5;">
        ${purposeText}
      </p>

      <!-- OTP Code -->
      <div style="background-color: #f8f9fa; border: 2px dashed #667eea; border-radius: 8px; padding: 30px; text-align: center; margin: 30px 0;">
        <p style="color: #666666; margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
          Your Verification Code
        </p>
        <div style="font-size: 42px; font-weight: 700; color: #667eea; letter-spacing: 8px; font-family: 'Courier New', monospace;">
          ${otpCode}
        </div>
        <p style="color: #999999; margin: 15px 0 0 0; font-size: 13px;">
          Valid for ${expiresInMinutes} minutes
        </p>
      </div>

      <p style="color: #666666; margin: 30px 0 0 0; font-size: 14px; line-height: 1.5;">
        If you didn't request this code, please ignore this email or contact our support team if you have concerns.
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
      <p style="color: #999999; margin: 0; font-size: 13px;">
        © ${new Date().getFullYear()} Sonr. All rights reserved.
      </p>
      <p style="color: #999999; margin: 10px 0 0 0; font-size: 13px;">
        Secure Identity Gateway for the Modern Web
      </p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  /**
   * Get purpose-specific message text
   */
  private getPurposeText(purpose: string): string {
    switch (purpose) {
      case 'registration':
        return 'Thank you for joining Sonr! To complete your registration and verify your email address, please use the verification code below:';
      case 'login':
        return 'We received a request to sign in to your Sonr account. Please use the verification code below to complete your login:';
      case 'password-reset':
        return 'We received a request to reset your Sonr password. Please use the verification code below to proceed:';
      default:
        return 'Please use the verification code below to complete your action:';
    }
  }
}

/**
 * Environment bindings interface
 */
export interface Env {
  // Resend API key for sending emails
  RESEND_API_KEY: string;

  // Email sender address
  EMAIL_FROM?: string;

  // KV namespace for storing OTP codes
  OTP_STORE?: KVNamespace;
}
