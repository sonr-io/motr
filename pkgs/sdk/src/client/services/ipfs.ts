/**
 * IPFS Client for enclave data storage using Helia
 */

import { type Strings, strings } from "@helia/strings";
import { type UnixFS, unixfs } from "@helia/unixfs";
import { verifiedFetch as heliaVerifiedFetch } from "@helia/verified-fetch";
import { createHelia, type Helia } from "helia";

/**
 * IPFS client configuration
 */
export interface IPFSClientConfig {
  /** Gateway URLs for IPFS access */
  gateways?: string[];
  /** Enable local persistence */
  enablePersistence?: boolean;
  /** libp2p configuration for IPFS node */
  libp2pConfig?: any;
  /** API endpoint for IPFS node */
  apiEndpoint?: string;
}

/**
 * IPFS storage result
 */
export interface IPFSStorageResult {
  /** Content identifier (CID) */
  cid: string;
  /** Size in bytes */
  size: number;
  /** Timestamp when stored */
  timestamp: number;
}

/**
 * IPFS node status
 */
export interface IPFSNodeStatus {
  /** Whether the node is online */
  online: boolean;
  /** Peer count */
  peerCount?: number;
  /** Node version */
  version?: string;
  /** Repository stats */
  repoStats?: {
    numObjects: number;
    repoSize: number;
  };
}

/**
 * IPFS Client interface for enclave data operations
 */
export interface IPFSClient {
  /** Initialize the IPFS client */
  initialize(): Promise<void>;

  /** Add enclave data to IPFS */
  addEnclaveData(data: Uint8Array): Promise<IPFSStorageResult>;

  /** Get enclave data from IPFS */
  getEnclaveData(cid: string): Promise<Uint8Array>;

  /** Verified fetch using Helia */
  verifiedFetch(cid: string): Promise<Response>;

  /** Pin content */
  pin(cid: string): Promise<void>;

  /** Unpin content */
  unpin(cid: string): Promise<void>;

  /** Check if content is pinned */
  isPinned(cid: string): Promise<boolean>;

  /** List all pinned CIDs */
  listPins(): Promise<string[]>;

  /** Get node status */
  getNodeStatus(): Promise<IPFSNodeStatus>;

  /** Check if client is initialized */
  isInitialized(): boolean;

  /** Cleanup and shutdown */
  cleanup(): Promise<void>;

  /** Add string data */
  addString(data: string): Promise<string>;

  /** Get string data */
  getString(cid: string): Promise<string>;
}

/**
 * Browser-based IPFS client implementation using Helia
 */
export class BrowserIPFSClient implements IPFSClient {
  private config: IPFSClientConfig;
  private helia: Helia | null = null;
  private fs: UnixFS | null = null;
  private strings: Strings | null = null;
  private initialized = false;
  private pinnedCIDs: Set<string> = new Set();

  constructor(config: IPFSClientConfig = {}) {
    this.config = {
      gateways: config.gateways || [
        "https://ipfs.io",
        "https://dweb.link",
        "https://cloudflare-ipfs.com",
      ],
      enablePersistence: config.enablePersistence ?? true,
      apiEndpoint: config.apiEndpoint || "http://127.0.0.1:5001",
      ...config,
    };
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      // Create Helia node
      this.helia = await createHelia({
        // Enable libp2p if config provided
        ...(this.config.libp2pConfig && { libp2p: this.config.libp2pConfig }),
      });

      // Initialize UnixFS for file operations
      this.fs = unixfs(this.helia);

      // Initialize Strings for string operations
      this.strings = strings(this.helia);

      this.initialized = true;
    } catch (error) {
      const err = new Error(`Failed to initialize Helia: ${error}`);
      (err as any).cause = error;
      throw err;
    }
  }

  async addEnclaveData(data: Uint8Array): Promise<IPFSStorageResult> {
    if (!this.initialized || !this.fs) {
      throw new Error("IPFS client not initialized");
    }

    try {
      // Add data to IPFS using UnixFS
      const cid = await this.fs.addBytes(data);

      return {
        cid: cid.toString(),
        size: data.length,
        timestamp: Date.now(),
      };
    } catch (error) {
      const err = new Error(`Failed to add enclave data: ${error}`);
      (err as any).cause = error;
      throw err;
    }
  }

  async getEnclaveData(cid: string): Promise<Uint8Array> {
    if (!this.initialized || !this.fs) {
      throw new Error("IPFS client not initialized");
    }

    try {
      // Get data from IPFS using UnixFS
      const chunks: Uint8Array[] = [];

      for await (const chunk of this.fs.cat(cid as any)) {
        chunks.push(chunk);
      }

      // Combine chunks into single Uint8Array
      const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
      const result = new Uint8Array(totalLength);
      let offset = 0;

      for (const chunk of chunks) {
        result.set(chunk, offset);
        offset += chunk.length;
      }

      return result;
    } catch (error) {
      const err = new Error(`Failed to get enclave data: ${error}`);
      (err as any).cause = error;
      throw err;
    }
  }

  async verifiedFetch(cid: string): Promise<Response> {
    if (!this.initialized || !this.helia) {
      throw new Error("IPFS client not initialized");
    }

    try {
      // Use Helia's verified fetch
      return await heliaVerifiedFetch(`ipfs://${cid}`);
    } catch (error) {
      const err = new Error(`Failed to fetch CID ${cid}: ${error}`);
      (err as any).cause = error;
      throw err;
    }
  }

  async pin(cid: string): Promise<void> {
    if (!this.initialized || !this.helia) {
      throw new Error("IPFS client not initialized");
    }

    try {
      // Pin the CID
      await this.helia.pins.add(cid as any);
      this.pinnedCIDs.add(cid);
    } catch (error) {
      const err = new Error(`Failed to pin CID ${cid}: ${error}`);
      (err as any).cause = error;
      throw err;
    }
  }

  async unpin(cid: string): Promise<void> {
    if (!this.initialized || !this.helia) {
      throw new Error("IPFS client not initialized");
    }

    try {
      // Unpin the CID
      await this.helia.pins.rm(cid as any);
      this.pinnedCIDs.delete(cid);
    } catch (error) {
      const err = new Error(`Failed to unpin CID ${cid}: ${error}`);
      (err as any).cause = error;
      throw err;
    }
  }

  async isPinned(cid: string): Promise<boolean> {
    if (!this.initialized || !this.helia) {
      throw new Error("IPFS client not initialized");
    }

    try {
      // Check if CID is pinned
      for await (const pin of this.helia.pins.ls()) {
        if (pin.toString() === cid) {
          return true;
        }
      }
      return false;
    } catch {
      // If there's an error, fall back to local tracking
      return this.pinnedCIDs.has(cid);
    }
  }

  async listPins(): Promise<string[]> {
    if (!this.initialized || !this.helia) {
      throw new Error("IPFS client not initialized");
    }

    try {
      const pins: string[] = [];

      for await (const pin of this.helia.pins.ls()) {
        pins.push(pin.toString());
      }

      return pins;
    } catch {
      // If there's an error, fall back to local tracking
      return Array.from(this.pinnedCIDs);
    }
  }

  async getNodeStatus(): Promise<IPFSNodeStatus> {
    if (!this.initialized || !this.helia) {
      throw new Error("IPFS client not initialized");
    }

    try {
      // Get libp2p peer count
      const libp2p = (this.helia as any).libp2p;
      const peers = libp2p ? await libp2p.getPeers() : [];

      return {
        online: this.initialized,
        peerCount: peers.length,
        version: "4.0.0", // Helia version
      };
    } catch {
      return {
        online: this.initialized,
        peerCount: 0,
        version: "4.0.0",
      };
    }
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  async cleanup(): Promise<void> {
    if (this.helia) {
      await this.helia.stop();
      this.helia = null;
    }

    this.fs = null;
    this.strings = null;
    this.initialized = false;
    this.pinnedCIDs.clear();
  }

  async addString(data: string): Promise<string> {
    if (!this.initialized || !this.strings) {
      throw new Error("IPFS client not initialized");
    }

    try {
      const cid = await this.strings.add(data);
      return cid.toString();
    } catch (error) {
      const err = new Error(`Failed to add string: ${error}`);
      (err as any).cause = error;
      throw err;
    }
  }

  async getString(cid: string): Promise<string> {
    if (!this.initialized || !this.strings) {
      throw new Error("IPFS client not initialized");
    }

    try {
      return await this.strings.get(cid as any);
    } catch (error) {
      const err = new Error(`Failed to get string: ${error}`);
      (err as any).cause = error;
      throw err;
    }
  }
}

/**
 * Create an IPFS client instance
 */
export async function createIPFSClient(
  config?: IPFSClientConfig,
): Promise<IPFSClient> {
  const client = new BrowserIPFSClient(config);
  await client.initialize();
  return client;
}

/**
 * Default IPFS client instance
 */
let defaultClient: IPFSClient | null = null;

/**
 * Get or create the default IPFS client
 */
export async function getDefaultIPFSClient(
  config?: IPFSClientConfig,
): Promise<IPFSClient> {
  if (!defaultClient) {
    defaultClient = await createIPFSClient(config);
  }
  return defaultClient;
}
