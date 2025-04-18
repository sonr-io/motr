export { default } from "./build/worker.mjs";
import { DurableObject } from "cloudflare:workers";
import createPlugin from "@extism/extism";
import { createHelia } from "helia";
import { strings } from "@helia/strings";
import { json } from "@helia/json";
import { dagJson } from "@helia/dag-json";
import { dagCbor } from "@helia/dag-cbor";
import { unixfs } from "@helia/unixfs";

export class Vault extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.state = ctx;
    this.env = env;

    // Initialize Helia node and related components when the DO is created
    this.initializeHelia();
    this.initializePlugin();
  }

  async initializePlugin() {
    try {
      this.plugin = await createPlugin("https://cdn.sonr.io/bin/signer.wasm", {
        useWasi: true,
      });
    } catch (error) {
      throw new Error(`Failed to initialize plugin: ${error.message}`);
    }
  }

  async initializeHelia() {
    try {
      // Create a Helia node with memory blockstore and datastore
      this.helia = await createHelia({
        blockstore: { type: "memory" },
        datastore: { type: "memory" },
        // Disable libp2p networking for Cloudflare Workers environment
        libp2p: {
          start: false,
          addresses: { listen: [] },
        },
      });

      // Initialize various data handlers
      this.stringHandler = strings(this.helia);
      this.jsonHandler = json(this.helia);
      this.dagJsonHandler = dagJson(this.helia);
      this.dagCborHandler = dagCbor(this.helia);
      this.fsHandler = unixfs(this.helia);

      console.log("Helia node initialized successfully");
      return true;
    } catch (error) {
      console.error("Failed to initialize Helia node:", error);
      return false;
    }
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

  // RPC method to get IPFS node status
  async getStatus() {
    if (!this.helia) {
      await this.initializeHelia();
    }

    return {
      status: this.helia ? "online" : "offline",
      type: "helia-memory-node",
    };
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
      return { cid: cid.toString() };
    } catch (error) {
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
      return { cid: cid.toString() };
    } catch (error) {
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
          throw new Error("Failed to retrieve content");
        }
      }
    } catch (error) {
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
      return { cid: cid.toString() };
    } catch (error) {
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
      return { cid: cid.toString() };
    } catch (error) {
      throw new Error(`Failed to add DAG-CBOR: ${error.message}`);
    }
  }

  // Legacy fetch handler for backward compatibility
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === "/vault/sign") {
      try {
        const body = await request.json();
        const result = await this.sign(body);
        return new Response(JSON.stringify(result), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }
}
