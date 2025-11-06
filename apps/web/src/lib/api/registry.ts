/**
 * Registry API
 * Chain and asset registry operations
 */

import { get, post, del } from './client';

export interface ChainInfo {
	chainId: string;
	chainName: string;
	nativeCurrency: {
		name: string;
		symbol: string;
		decimals: number;
	};
	rpcUrls: string[];
	blockExplorerUrls?: string[];
	iconUrl?: string;
	network?: string;
}

export interface AssetInfo {
	assetId: string;
	chainId: string;
	address?: string;
	symbol: string;
	name: string;
	decimals: number;
	logoUri?: string;
	coingeckoId?: string;
}

export interface ChainListResponse {
	chains: ChainInfo[];
	count: number;
}

export interface AssetListResponse {
	assets: AssetInfo[];
	count: number;
}

export interface AddChainRequest {
	chain: ChainInfo;
}

export interface AddAssetRequest {
	asset: AssetInfo;
}

export interface OperationResponse {
	success: boolean;
	message?: string;
}

/**
 * List all registered chains
 */
export async function listChains(): Promise<ChainListResponse> {
	return get<ChainListResponse>('/registry/chains');
}

/**
 * Get specific chain info
 */
export async function getChain(chainId: string): Promise<ChainInfo> {
	return get<ChainInfo>(`/registry/chains/${encodeURIComponent(chainId)}`);
}

/**
 * Add or update a chain
 */
export async function addChain(chain: ChainInfo): Promise<OperationResponse> {
	return post<OperationResponse>('/registry/chains', { chain });
}

/**
 * Remove a chain
 */
export async function removeChain(chainId: string): Promise<OperationResponse> {
	return del<OperationResponse>(`/registry/chains/${encodeURIComponent(chainId)}`);
}

/**
 * List all registered assets
 * Optionally filter by chainId
 */
export async function listAssets(chainId?: string): Promise<AssetListResponse> {
	const query = chainId ? `?chainId=${encodeURIComponent(chainId)}` : '';
	return get<AssetListResponse>(`/registry/assets${query}`);
}

/**
 * Get specific asset info
 */
export async function getAsset(assetId: string): Promise<AssetInfo> {
	return get<AssetInfo>(`/registry/assets/${encodeURIComponent(assetId)}`);
}

/**
 * Add or update an asset
 */
export async function addAsset(asset: AssetInfo): Promise<OperationResponse> {
	return post<OperationResponse>('/registry/assets', { asset });
}

/**
 * Remove an asset
 */
export async function removeAsset(assetId: string): Promise<OperationResponse> {
	return del<OperationResponse>(`/registry/assets/${encodeURIComponent(assetId)}`);
}
