import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';

export interface OTPEmailProps {
  otpCode: string;
  username?: string;
  purpose?: 'registration' | 'login' | 'password-reset';
  expiresInMinutes?: number;
}

export function OTPEmail({
  otpCode,
  username,
  purpose = 'registration',
  expiresInMinutes = 10,
}: OTPEmailProps) {
  const greeting = username ? `Hi ${username}` : 'Hello';
  const purposeText = getPurposeText(purpose);
  const subject = getEmailSubject(purpose);

  return (
    <Html>
      <Head />
      <Preview>{subject}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={headerTitle}>Sonr Identity</Heading>
          </Section>

          {/* Content */}
          <Section style={content}>
            <Heading style={h2}>{greeting}!</Heading>

            <Text style={text}>{purposeText}</Text>

            {/* OTP Code */}
            <Section style={otpContainer}>
              <Text style={otpLabel}>Your Verification Code</Text>
              <Text style={otpCodeStyle}>{otpCode}</Text>
              <Text style={otpExpiry}>Valid for {expiresInMinutes} minutes</Text>
            </Section>

            <Text style={disclaimer}>
              If you didn't request this code, please ignore this email or contact our support team
              if you have concerns.
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              © {new Date().getFullYear()} Sonr. All rights reserved.
            </Text>
            <Text style={footerText}>Secure Identity Gateway for the Modern Web</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

OTPEmail.PreviewProps = {
  otpCode: '123456',
  username: 'John Doe',
  purpose: 'registration',
  expiresInMinutes: 10,
} as OTPEmailProps;

export default OTPEmail;

// Helper functions
function getPurposeText(purpose: string): string {
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

function getEmailSubject(purpose: string): string {
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

// Styles
const main = {
  backgroundColor: '#f5f5f5',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
};

const container = {
  maxWidth: '600px',
  margin: '40px auto',
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  overflow: 'hidden',
};

const header = {
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  padding: '40px 30px',
  textAlign: 'center' as const,
};

const headerTitle = {
  color: '#ffffff',
  margin: 0,
  fontSize: '28px',
  fontWeight: 600,
};

const content = {
  padding: '40px 30px',
};

const h2 = {
  color: '#333333',
  margin: '0 0 20px 0',
  fontSize: '24px',
};

const text = {
  color: '#666666',
  margin: '0 0 30px 0',
  fontSize: '16px',
  lineHeight: '1.5',
};

const otpContainer = {
  backgroundColor: '#f8f9fa',
  border: '2px dashed #667eea',
  borderRadius: '8px',
  padding: '30px',
  textAlign: 'center' as const,
  margin: '30px 0',
};

const otpLabel = {
  color: '#666666',
  margin: '0 0 10px 0',
  fontSize: '14px',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
};

const otpCodeStyle = {
  fontSize: '42px',
  fontWeight: 700,
  color: '#667eea',
  letterSpacing: '8px',
  fontFamily: '"Courier New", monospace',
  margin: '0',
};

const otpExpiry = {
  color: '#999999',
  margin: '15px 0 0 0',
  fontSize: '13px',
};

const disclaimer = {
  color: '#666666',
  margin: '30px 0 0 0',
  fontSize: '14px',
  lineHeight: '1.5',
};

const footer = {
  backgroundColor: '#f8f9fa',
  padding: '30px',
  textAlign: 'center' as const,
  borderTop: '1px solid #e9ecef',
};

const footerText = {
  color: '#999999',
  margin: '0',
  fontSize: '13px',
};
