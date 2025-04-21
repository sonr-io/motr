export { default } from "./build/worker.mjs";
import createPlugin from "@extism/extism";
import { createHelia } from "helia";
import { strings } from "@helia/strings";
import { json } from "@helia/json";
import { dagJson } from "@helia/dag-json";
import { dagCbor } from "@helia/dag-cbor";
import { unixfs } from "@helia/unixfs";

export class Vault {
  constructor(ctx, env) {
    this.state = ctx;
    this.env = env;

    // Initialize node state
    this.nodeState = {
      status: "offline",
      nodeId: null,
      discoveredPeers: new Map(),
      connectedPeers: new Map(),
      logs: [],
    };

    // Initialize Helia node and related components when the DO is created
    this.initializeHelia();
    this.initializePlugin();
  }

  // Helper method to add a log entry
  addLog(message) {
    const timestamp = new Date().toISOString();
    const logEntry = { timestamp, message };
    this.nodeState.logs.push(logEntry);

    // Keep only the last 100 log entries
    if (this.nodeState.logs.length > 100) {
      this.nodeState.logs.shift();
    }

    return logEntry;
  }

  async initializePlugin() {
    try {
      this.addLog("Initializing signer plugin...");
      this.plugin = await createPlugin("https://cdn.sonr.io/bin/signer.wasm", {
        useWasi: true,
      });
      this.addLog("Signer plugin initialized successfully");
      return true;
    } catch (error) {
      this.addLog(`Failed to initialize signer plugin: ${error.message}`);
      console.error("Failed to initialize signer plugin:", error);
      return false;
    }
  }

  async initializeHelia() {
    try {
      this.addLog("Initializing Helia node...");

      // Create a Helia node with memory blockstore and datastore
      this.helia = await createHelia({
        blockstore: { type: "memory" },
        datastore: { type: "memory" },
        // Configure libp2p for Cloudflare Workers environment
        libp2p: {
          start: true,
          addresses: { listen: [] },
          connectionManager: {
            minConnections: 0,
          },
        },
      });

      // Initialize various data handlers
      this.stringHandler = strings(this.helia);
      this.jsonHandler = json(this.helia);
      this.dagJsonHandler = dagJson(this.helia);
      this.dagCborHandler = dagCbor(this.helia);
      this.fsHandler = unixfs(this.helia);

      // Update node state
      this.nodeState.status = this.helia.libp2p.status;
      this.nodeState.nodeId = this.helia.libp2p.peerId.toString();

      // Set up event listeners
      this.helia.libp2p.addEventListener("peer:discovery", (evt) => {
        const peerId = evt.detail.id.toString();
        this.nodeState.discoveredPeers.set(peerId, {
          id: peerId,
          multiaddrs: evt.detail.multiaddrs
            ? evt.detail.multiaddrs.map((ma) => ma.toString())
            : [],
          discoveredAt: new Date().toISOString(),
        });
        this.addLog(`Discovered peer ${peerId}`);
      });

      this.helia.libp2p.addEventListener("peer:connect", (evt) => {
        const peerId = evt.detail.toString();
        this.nodeState.connectedPeers.set(peerId, {
          id: peerId,
          connectedAt: new Date().toISOString(),
        });
        this.addLog(`Connected to ${peerId}`);
      });

      this.helia.libp2p.addEventListener("peer:disconnect", (evt) => {
        const peerId = evt.detail.toString();
        this.nodeState.connectedPeers.delete(peerId);
        this.addLog(`Disconnected from ${peerId}`);
      });

      this.addLog("Helia node initialized successfully");
      return true;
    } catch (error) {
      this.addLog(`Failed to initialize Helia node: ${error.message}`);
      console.error("Failed to initialize Helia node:", error);
      return false;
    }
  }

  // RPC method to get node status
  async getNodeStatus() {
    if (!this.helia) {
      await this.initializeHelia();
    }

    return {
      status: this.nodeState.status,
      nodeId: this.nodeState.nodeId,
      discoveredPeersCount: this.nodeState.discoveredPeers.size,
      connectedPeersCount: this.nodeState.connectedPeers.size,
    };
  }

  // RPC method to get node ID
  async getNodeId() {
    if (!this.helia) {
      await this.initializeHelia();
    }

    return {
      nodeId: this.nodeState.nodeId,
    };
  }

  // RPC method to get discovered peers
  async getDiscoveredPeers() {
    if (!this.helia) {
      await this.initializeHelia();
    }

    return {
      count: this.nodeState.discoveredPeers.size,
      peers: Array.from(this.nodeState.discoveredPeers.values()),
    };
  }

  // RPC method to get connected peers
  async getConnectedPeers() {
    if (!this.helia) {
      await this.initializeHelia();
    }

    return {
      count: this.nodeState.connectedPeers.size,
      peers: Array.from(this.nodeState.connectedPeers.values()),
    };
  }

  // RPC method to get logs
  async getLogs(limit = 50) {
    if (!this.helia) {
      await this.initializeHelia();
    }

    const logs = [...this.nodeState.logs];
    return {
      count: logs.length,
      logs: logs.slice(-limit), // Return the most recent logs up to the limit
    };
  }

  // RPC method to sign data
  async sign(data) {
    if (!this.plugin) {
      await this.initializePlugin();
    }
    try {
      let out = await plugin.call("sign", JSON.stringify(data));
      return JSON.parse(out.text());
    } catch (error) {
      throw new Error(`Signing failed: ${error.message}`);
    }
  }

  // RPC method to add string content to IPFS
  async addString(content) {
    if (!this.helia) {
      await this.initializeHelia();
    }

    if (!this.helia) {
      throw new Error("Helia node not available");
    }

    try {
      const cid = await this.stringHandler.add(content);
      this.addLog(`Added string content with CID: ${cid.toString()}`);
      return { cid: cid.toString() };
    } catch (error) {
      this.addLog(`Failed to add string: ${error.message}`);
      throw new Error(`Failed to add string: ${error.message}`);
    }
  }

  // RPC method to add JSON content to IPFS
  async addJson(content) {
    if (!this.helia) {
      await this.initializeHelia();
    }

    if (!this.helia) {
      throw new Error("Helia node not available");
    }

    try {
      const cid = await this.jsonHandler.add(content);
      this.addLog(`Added JSON content with CID: ${cid.toString()}`);
      return { cid: cid.toString() };
    } catch (error) {
      this.addLog(`Failed to add JSON: ${error.message}`);
      throw new Error(`Failed to add JSON: ${error.message}`);
    }
  }

  // RPC method to get content from IPFS by CID
  async getContent(cid) {
    if (!this.helia) {
      await this.initializeHelia();
    }

    if (!this.helia) {
      throw new Error("Helia node not available");
    }

    try {
      this.addLog(`Retrieving content for CID: ${cid}`);
      // Try to get as JSON first
      try {
        const jsonData = await this.jsonHandler.get(cid);
        return { type: "json", content: jsonData };
      } catch (e) {
        // Fall back to string if JSON fails
        try {
          const stringData = await this.stringHandler.get(cid);
          return { type: "string", content: stringData };
        } catch (e2) {
          this.addLog(`Failed to retrieve content for CID: ${cid}`);
          throw new Error("Failed to retrieve content");
        }
      }
    } catch (error) {
      this.addLog(`Error getting content: ${error.message}`);
      throw new Error(`Failed to get content: ${error.message}`);
    }
  }

  // RPC method to add DAG-JSON content to IPFS
  async addDagJson(content) {
    if (!this.helia) {
      await this.initializeHelia();
    }

    if (!this.helia) {
      throw new Error("Helia node not available");
    }

    try {
      const cid = await this.dagJsonHandler.add(content);
      this.addLog(`Added DAG-JSON content with CID: ${cid.toString()}`);
      return { cid: cid.toString() };
    } catch (error) {
      this.addLog(`Failed to add DAG-JSON: ${error.message}`);
      throw new Error(`Failed to add DAG-JSON: ${error.message}`);
    }
  }

  // RPC method to add DAG-CBOR content to IPFS
  async addDagCbor(content) {
    if (!this.helia) {
      await this.initializeHelia();
    }

    if (!this.helia) {
      throw new Error("Helia node not available");
    }

    try {
      const cid = await this.dagCborHandler.add(content);
      this.addLog(`Added DAG-CBOR content with CID: ${cid.toString()}`);
      return { cid: cid.toString() };
    } catch (error) {
      this.addLog(`Failed to add DAG-CBOR: ${error.message}`);
      throw new Error(`Failed to add DAG-CBOR: ${error.message}`);
    }
  }
}
