// Export passkey authentication functions

// Export types
export type {
  PasskeyLoginOptions,
  PasskeyLoginResult,
  PasskeyRegistrationOptions,
  PasskeyRegistrationResult,
  WebAuthnConfig,
} from './webauthn';
export {
  base64urlToBuffer,
  // Utility functions
  bufferToBase64url,
  // Enhanced utilities
  checkConditionalMediationSupport,
  createLoginButton,
  createRegistrationButton,
  // Configuration and presets
  DEFAULT_WEBAUTHN_CONFIG,
  isConditionalMediationAvailable,
  isWebAuthnAvailable,
  isWebAuthnSupported,
  loginWithPasskey,
  registerWithPasskey,
  WEBAUTHN_PRESETS,
} from './webauthn';
