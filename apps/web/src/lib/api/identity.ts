/**
 * Identity API
 * DID and WebAuthn operations (proxied to Enclave worker)
 */

import { get, post } from './client';

export interface DIDDocument {
	id: string;
	controller: string;
	verificationMethod: VerificationMethod[];
	authentication: string[];
	assertionMethod: string[];
}

export interface VerificationMethod {
	id: string;
	type: string;
	controller: string;
	publicKeyMultibase?: string;
	publicKeyJwk?: Record<string, unknown>;
}

export interface WebAuthnCredential {
	id: string;
	rawId: ArrayBuffer;
	type: 'public-key';
	response: AuthenticatorAttestationResponse | AuthenticatorAssertionResponse;
}

export interface RegisterDIDRequest {
	username: string;
	credential?: WebAuthnCredential;
}

export interface RegisterDIDResponse {
	success: boolean;
	did: string;
	document: DIDDocument;
}

export interface ResolveDIDResponse {
	document: DIDDocument;
	metadata?: Record<string, unknown>;
}

/**
 * Register a new DID
 */
export async function registerDID(
	username: string,
	credential?: WebAuthnCredential
): Promise<RegisterDIDResponse> {
	return post<RegisterDIDResponse>('/identity/register', {
		username,
		credential,
	});
}

/**
 * Resolve a DID to its document
 */
export async function resolveDID(did: string): Promise<ResolveDIDResponse> {
	return get<ResolveDIDResponse>(`/identity/resolve/${encodeURIComponent(did)}`);
}

/**
 * Get current user's DID
 */
export async function getMyDID(): Promise<ResolveDIDResponse> {
	return get<ResolveDIDResponse>('/identity/me');
}

/**
 * Update DID document
 */
export async function updateDID(
	did: string,
	document: Partial<DIDDocument>
): Promise<RegisterDIDResponse> {
	return post<RegisterDIDResponse>(`/identity/update/${encodeURIComponent(did)}`, document);
}
