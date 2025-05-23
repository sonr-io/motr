export { default } from "./build/worker.mjs";
import { DurableObject } from "cloudflare:workers";
import createPlugin from "@extism/extism";
import { createHelia } from "helia";
import { strings } from "@helia/strings";
import { json } from "@helia/json";
import { dagJson } from "@helia/dag-json";
import { dagCbor } from "@helia/dag-cbor";
import { unixfs } from "@helia/unixfs";
import { serialiseSignDoc } from "sonr-cosmes/codec";
import { broadcastTx, RpcClient } from "sonr-cosmes/client";
import {
  DidV1MsgRegisterController,
  DwnV1QuerySpawnRequest,
} from "sonr-cosmes/protobufs";

export class Vault extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
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
    this.initializePlugins();
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

  // initializePlugins initializes the signer plugin
  async initializePlugins() {
    try {
      // 1. Initialize the enclave plugin
      this.addLog("Initializing enclave plugin...");
      this.enclavePlugin = await createPlugin(
        "https://cdn.sonr.io/bin/enclave.wasm",
        {
          useWasi: true,
        },
      );
      this.addLog("Enclave plugin initialized successfully");

      // 2. Initialize the signer plugin
      this.addLog("Initializing signer plugin...");
      this.signerPlugin = await createPlugin(
        "https://cdn.sonr.io/bin/signer.wasm",
        {
          useWasi: true,
        },
      );
      this.addLog("Signer plugin initialized successfully");

      // 3. Initialize the verifier plugin
      this.addLog("Initializing verifier plugin...");
      this.verifierPlugin = await createPlugin(
        "https://cdn.sonr.io/bin/verifier.wasm",
        {
          useWasi: true,
        },
      );
      this.addLog("Verifier plugin initialized successfully");
      return true;
    } catch (error) {
      this.addLog(`Failed to initialize plugin: ${error.message}`);
      console.error("Failed to initialize plugin:", error);
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
      let out = await this.plugin.call("sign", JSON.stringify(data));
      return JSON.parse(out.text());
    } catch (error) {
      throw new Error(`Signing failed: ${error.message}`);
    }
  }

  // Creates and signs a transaction
  async createAndSignTx(msg, signer, options = {}) {
    this.addLog(`Creating transaction with message type: ${msg.typeUrl}`);

    try {
      // Default options
      const defaultOptions = {
        memo: "",
        fee: {
          amount: [{ denom: "usnr", amount: "1000" }],
          gas_limit: "200000",
        },
        chainId: this.env.SONR_CHAIN_ID || "sonr-testnet-1",
      };

      const txOptions = { ...defaultOptions, ...options };

      // Create the sign doc
      const signDoc = {
        chainId: txOptions.chainId,
        accountNumber: options.accountNumber || "0",
        sequence: options.sequence || "0",
        fee: txOptions.fee,
        msgs: [msg],
        memo: txOptions.memo,
      };

      // Serialize the sign doc
      const signBytes = serialiseSignDoc(signDoc);

      // Sign the transaction
      this.addLog(`Signing transaction for ${signer}`);
      const signature = await this.sign({
        bytes: Buffer.from(signBytes).toString("base64"),
        publicKey: options.publicKey,
      });

      // Create the signed transaction
      const signedTx = {
        signDoc,
        signature: {
          signature: signature.signature,
          pub_key: {
            type: "tendermint/PubKeySecp256k1",
            value: signature.publicKey,
          },
        },
      };

      this.addLog("Transaction created and signed successfully");
      return signedTx;
    } catch (error) {
      this.addLog(`Failed to create and sign transaction: ${error.message}`);
      throw new Error(`Transaction creation failed: ${error.message}`);
    }
  }

  // Broadcasts a signed transaction to the network
  async broadcastTransaction(signedTx, broadcastMode = "BROADCAST_MODE_SYNC") {
    this.addLog("Broadcasting transaction to network");

    try {
      const rpcUrl = this.env.SONR_RPC_URL || "https://rpc.sonr.io";
      this.addLog(`Using RPC URL: ${rpcUrl}`);

      const response = await broadcastTx(rpcUrl, signedTx, broadcastMode);

      if (response.tx_response && response.tx_response.code === 0) {
        this.addLog(
          `Transaction broadcast successful. Hash: ${response.tx_response.txhash}`,
        );
      } else {
        this.addLog(
          `Transaction broadcast failed: ${JSON.stringify(response.tx_response)}`,
        );
      }

      return response;
    } catch (error) {
      this.addLog(`Failed to broadcast transaction: ${error.message}`);
      throw new Error(`Transaction broadcast failed: ${error.message}`);
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

  async registerDidController(did, controller, signer, options = {}) {
    this.addLog(`Registering DID controller: ${controller} for DID: ${did}`);

    try {
      // Create the message
      const msg = DidV1MsgRegisterController.create({
        did: did,
        controller: controller,
      });

      // Create and sign transaction
      const signedTx = await this.createAndSignTx(msg, signer, options);

      // Broadcast transaction
      const response = await this.broadcastTransaction(signedTx);

      this.addLog(
        `DID controller registration response: ${JSON.stringify(response)}`,
      );
      return response;
    } catch (error) {
      this.addLog(`Failed to register DID controller: ${error.message}`);
      throw new Error(`DID controller registration failed: ${error.message}`);
    }
  }

  async spawnDwnVault(address, redirect, options = {}) {
    this.addLog(
      `Spawning DWN vault for address: ${address}, redirect: ${redirect}`,
    );

    try {
      // Use RPC client to make the query
      const rpcUrl =
        options.rpcUrl || this.env.SONR_RPC_URL || "https://rpc.sonr.io";
      this.addLog(`Using RPC URL: ${rpcUrl}`);

      return new Promise((resolve, reject) => {
        RpcClient.newBatchQuery(rpcUrl)
          .add(
            DwnV1QuerySpawnRequest,
            {
              cid: address,
              redirect: redirect,
            },
            (err, res) => {
              if (err) {
                this.addLog(`Spawn DWN vault failed: ${err.message}`);
                reject(err);
              } else {
                this.addLog(`Spawn DWN vault response: ${JSON.stringify(res)}`);
                resolve(res);
              }
            },
          )
          .send();
      });
    } catch (error) {
      this.addLog(`Failed to spawn DWN vault: ${error.message}`);
      throw new Error(`DWN vault spawn failed: ${error.message}`);
    }
  }

  // Retrieves account information needed for transaction signing
  async getAccountInfo(address) {
    this.addLog(`Getting account info for address: ${address}`);

    try {
      const rpcUrl = this.env.SONR_RPC_URL || "https://rpc.sonr.io";

      const client = new RpcClient(rpcUrl);
      const accountInfo = await client.getAccount(address);

      this.addLog(`Account info retrieved successfully`);
      return {
        accountNumber: accountInfo.account_number,
        sequence: accountInfo.sequence,
      };
    } catch (error) {
      this.addLog(`Failed to get account info: ${error.message}`);
      throw new Error(`Account info retrieval failed: ${error.message}`);
    }
  }

  // Fetch handler for backward compatibility and Go WASM server interaction
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    try {
      // Handle different API endpoints based on the path

      // Helia node status endpoints
      if (path === "/helia/status") {
        return new Response(JSON.stringify(await this.getNodeStatus()), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      if (path === "/helia/node-id") {
        return new Response(JSON.stringify(await this.getNodeId()), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      if (path === "/helia/discovered-peers") {
        return new Response(JSON.stringify(await this.getDiscoveredPeers()), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      if (path === "/helia/connected-peers") {
        return new Response(JSON.stringify(await this.getConnectedPeers()), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      if (path === "/helia/logs") {
        const limitParam = url.searchParams.get("limit");
        const limit = limitParam ? parseInt(limitParam, 10) : 50;
        return new Response(JSON.stringify(await this.getLogs(limit)), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      // IPFS content endpoints
      if (path === "/ipfs/add/string" && method === "POST") {
        const content = await request.text();
        return new Response(JSON.stringify(await this.addString(content)), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      if (path === "/ipfs/add/json" && method === "POST") {
        const content = await request.json();
        return new Response(JSON.stringify(await this.addJson(content)), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      if (path.startsWith("/ipfs/get/") && method === "GET") {
        const cid = path.replace("/ipfs/get/", "");
        const result = await this.getContent(cid);

        if (result.type === "json") {
          return new Response(JSON.stringify(result.content), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        } else {
          return new Response(result.content, {
            status: 200,
            headers: { "Content-Type": "text/plain" },
          });
        }
      }

      if (path === "/ipfs/dag/json" && method === "POST") {
        const content = await request.json();
        return new Response(JSON.stringify(await this.addDagJson(content)), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      if (path === "/ipfs/dag/cbor" && method === "POST") {
        const content = await request.json();
        return new Response(JSON.stringify(await this.addDagCbor(content)), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Signing endpoint
      if (path === "/vault/sign" && method === "POST") {
        const data = await request.json();
        return new Response(JSON.stringify(await this.sign(data)), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      // DID controller registration endpoint
      if (path === "/did/register-controller" && method === "POST") {
        const data = await request.json();
        const { did, controller, signer, options } = data;

        return new Response(
          JSON.stringify(
            await this.registerDidController(did, controller, signer, options),
          ),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      // DWN vault spawning endpoint
      if (path === "/dwn/spawn" && method === "POST") {
        const data = await request.json();
        const { address, redirect, options } = data;

        return new Response(
          JSON.stringify(await this.spawnDwnVault(address, redirect, options)),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      // Account info endpoint
      if (path === "/account/info" && method === "GET") {
        const address = url.searchParams.get("address");
        if (!address) {
          return new Response(
            JSON.stringify({ error: "Address parameter is required" }),
            {
              status: 400,
              headers: { "Content-Type": "application/json" },
            },
          );
        }

        return new Response(
          JSON.stringify(await this.getAccountInfo(address)),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      // Default response for unhandled paths
      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      // Log the error
      this.addLog(`Error handling request to ${path}: ${error.message}`);

      // Return error response
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }
}
