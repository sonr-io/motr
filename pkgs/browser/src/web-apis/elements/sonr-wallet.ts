/**
 * <sonr-wallet> Custom Element
 *
 * Web Component for displaying and managing Sonr wallet state.
 * Follows W3C Custom Elements v1 specification.
 *
 * Features:
 * - Automatic connection to Sonr browser client
 * - Reactive state updates
 * - Shadow DOM with isolated styles
 * - Accessible HTML structure
 * - Custom events for user interactions
 *
 * @example
 * ```html
 * <sonr-wallet
 *   network="testnet"
 *   theme="dark"
 *   show-balance="true">
 * </sonr-wallet>
 * ```
 *
 * @example
 * ```typescript
 * const wallet = document.querySelector('sonr-wallet');
 * wallet.addEventListener('wallet:connected', (e) => {
 *   console.log('Wallet connected:', e.detail);
 * });
 * ```
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements
 */

import { getSonrBrowser, SonrBrowser, BrowserClientState } from "../../client/browser-client.js";

/**
 * Sonr Wallet Element Events
 */
export interface SonrWalletEvents {
  "wallet:connected": { address: string; did: string };
  "wallet:disconnected": { address: string };
  "wallet:error": { error: Error };
  "wallet:balance-updated": { balance: string; denom: string };
}

/**
 * Sonr Wallet Custom Element
 */
export class SonrWalletElement extends HTMLElement {
  private shadow: ShadowRoot;
  private browser?: SonrBrowser;
  private connected = false;
  private address?: string;
  private balance = "0";
  private denom = "SNR";

  // Observed attributes
  static get observedAttributes() {
    return ["network", "theme", "show-balance", "compact"];
  }

  constructor() {
    super();

    // Create shadow root
    this.shadow = this.attachShadow({ mode: "open" });

    // Initial render
    this.render();
  }

  /**
   * Component lifecycle: connected to DOM
   */
  async connectedCallback() {
    try {
      // Get or create browser client
      this.browser = await getSonrBrowser({
        network: this.getAttribute("network") || "testnet",
        autoConnect: true,
      });

      // Setup event listeners
      this.setupEventListeners();

      // Check if already connected
      if (this.browser.isConnected()) {
        await this.handleConnection();
      }
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  /**
   * Component lifecycle: disconnected from DOM
   */
  disconnectedCallback() {
    this.cleanup();
  }

  /**
   * Component lifecycle: attribute changed
   */
  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (oldValue === newValue) return;

    switch (name) {
      case "theme":
        this.updateTheme(newValue);
        break;
      case "show-balance":
        this.render();
        break;
      case "compact":
        this.render();
        break;
      default:
        break;
    }
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners() {
    if (!this.browser) return;

    // Listen to browser state changes
    this.browser.on("state:changed", (event) => {
      const { state } = event.detail;

      if (state === BrowserClientState.CONNECTED) {
        this.handleConnection();
      } else if (state === BrowserClientState.READY) {
        this.handleDisconnection();
      }
    });

    // Listen to auth events
    this.browser.on("auth:authenticated", (event) => {
      this.address = event.detail.address;
      this.render();
      this.emitEvent("wallet:connected", {
        address: event.detail.address,
        did: "",
      });
    });

    this.browser.on("auth:logout", (event) => {
      this.handleDisconnection();
    });

    // Listen to errors
    this.browser.on("error", (event) => {
      this.handleError(event.detail.error);
    });
  }

  /**
   * Handle connection
   */
  private async handleConnection() {
    this.connected = true;
    this.render();

    // Fetch wallet data
    await this.fetchWalletData();
  }

  /**
   * Handle disconnection
   */
  private handleDisconnection() {
    this.connected = false;
    this.address = undefined;
    this.balance = "0";
    this.render();

    if (this.address) {
      this.emitEvent("wallet:disconnected", { address: this.address });
    }
  }

  /**
   * Fetch wallet data
   */
  private async fetchWalletData() {
    try {
      if (!this.browser || !this.connected) return;

      // Fetch balance from RPC
      // const balance = await this.browser.rpc.getBalance(this.address);
      // this.balance = balance.amount;
      // this.denom = balance.denom;

      // For now, mock data
      this.balance = "1000";
      this.denom = "SNR";

      this.render();
      this.emitEvent("wallet:balance-updated", {
        balance: this.balance,
        denom: this.denom,
      });
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  /**
   * Handle errors
   */
  private handleError(error: Error) {
    console.error("[SonrWallet] Error:", error);
    this.emitEvent("wallet:error", { error });
  }

  /**
   * Render component
   */
  private render() {
    const theme = this.getAttribute("theme") || "light";
    const showBalance = this.getAttribute("show-balance") !== "false";
    const compact = this.getAttribute("compact") === "true";

    this.shadow.innerHTML = `
      ${this.getStyles(theme)}
      <div class="sonr-wallet ${compact ? "compact" : ""}">
        ${this.connected ? this.renderConnected(showBalance) : this.renderDisconnected()}
      </div>
    `;

    // Add event listeners to buttons
    this.attachButtonListeners();
  }

  /**
   * Render connected state
   */
  private renderConnected(showBalance: boolean): string {
    return `
      <div class="wallet-header">
        <div class="status-indicator connected"></div>
        <span class="status-text">Connected</span>
      </div>

      ${this.address ? `
        <div class="wallet-address">
          <span class="address-label">Address:</span>
          <code class="address-value">${this.formatAddress(this.address)}</code>
          <button class="copy-button" data-action="copy-address" title="Copy address">
            📋
          </button>
        </div>
      ` : ""}

      ${showBalance ? `
        <div class="wallet-balance">
          <span class="balance-label">Balance:</span>
          <span class="balance-value">${this.balance} ${this.denom}</span>
          <button class="refresh-button" data-action="refresh" title="Refresh balance">
            🔄
          </button>
        </div>
      ` : ""}

      <div class="wallet-actions">
        <button class="action-button" data-action="disconnect">
          Disconnect
        </button>
      </div>
    `;
  }

  /**
   * Render disconnected state
   */
  private renderDisconnected(): string {
    return `
      <div class="wallet-header">
        <div class="status-indicator disconnected"></div>
        <span class="status-text">Not Connected</span>
      </div>

      <div class="wallet-actions">
        <button class="action-button primary" data-action="connect">
          Connect Wallet
        </button>
      </div>
    `;
  }

  /**
   * Get component styles
   */
  private getStyles(theme: string): string {
    const isDark = theme === "dark";

    return `
      <style>
        :host {
          display: block;
          font-family: system-ui, -apple-system, sans-serif;
          font-size: 14px;
        }

        .sonr-wallet {
          background: ${isDark ? "#1a1a1a" : "#ffffff"};
          color: ${isDark ? "#e0e0e0" : "#1a1a1a"};
          border: 1px solid ${isDark ? "#333" : "#ddd"};
          border-radius: 12px;
          padding: 20px;
          min-width: 300px;
          max-width: 400px;
        }

        .sonr-wallet.compact {
          padding: 12px;
          min-width: 200px;
        }

        .wallet-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
        }

        .status-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .status-indicator.connected {
          background: #22c55e;
          box-shadow: 0 0 8px #22c55e;
        }

        .status-indicator.disconnected {
          background: #94a3b8;
        }

        .status-text {
          font-weight: 600;
          font-size: 16px;
        }

        .wallet-address,
        .wallet-balance {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
          padding: 12px;
          background: ${isDark ? "#252525" : "#f8f9fa"};
          border-radius: 8px;
        }

        .address-label,
        .balance-label {
          font-weight: 500;
          color: ${isDark ? "#a0a0a0" : "#64748b"};
        }

        .address-value {
          flex: 1;
          font-family: 'Monaco', 'Courier New', monospace;
          font-size: 12px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .balance-value {
          flex: 1;
          font-weight: 600;
          font-size: 16px;
        }

        .copy-button,
        .refresh-button {
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 14px;
          transition: background 0.2s;
        }

        .copy-button:hover,
        .refresh-button:hover {
          background: ${isDark ? "#333" : "#e2e8f0"};
        }

        .wallet-actions {
          display: flex;
          gap: 8px;
          margin-top: 16px;
        }

        .action-button {
          flex: 1;
          padding: 10px 16px;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          background: ${isDark ? "#333" : "#e2e8f0"};
          color: ${isDark ? "#e0e0e0" : "#1a1a1a"};
        }

        .action-button.primary {
          background: #3b82f6;
          color: white;
        }

        .action-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .action-button:active {
          transform: translateY(0);
        }
      </style>
    `;
  }

  /**
   * Attach button event listeners
   */
  private attachButtonListeners() {
    const buttons = this.shadow.querySelectorAll("button[data-action]");

    buttons.forEach((button) => {
      const action = button.getAttribute("data-action");

      button.addEventListener("click", async () => {
        switch (action) {
          case "connect":
            await this.handleConnectClick();
            break;
          case "disconnect":
            await this.handleDisconnectClick();
            break;
          case "copy-address":
            await this.handleCopyAddress();
            break;
          case "refresh":
            await this.fetchWalletData();
            break;
        }
      });
    });
  }

  /**
   * Handle connect button click
   */
  private async handleConnectClick() {
    try {
      if (!this.browser) {
        throw new Error("Browser client not initialized");
      }

      await this.browser.connect();
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  /**
   * Handle disconnect button click
   */
  private async handleDisconnectClick() {
    try {
      if (!this.browser) return;

      await this.browser.disconnect();
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  /**
   * Handle copy address
   */
  private async handleCopyAddress() {
    if (!this.address) return;

    try {
      await navigator.clipboard.writeText(this.address);

      // Show feedback
      const button = this.shadow.querySelector('button[data-action="copy-address"]');
      if (button) {
        const originalText = button.textContent;
        button.textContent = "✓";
        setTimeout(() => {
          button.textContent = originalText;
        }, 1000);
      }
    } catch (error) {
      console.error("Failed to copy address:", error);
    }
  }

  /**
   * Format address for display
   */
  private formatAddress(address: string): string {
    if (address.length <= 16) return address;
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  }

  /**
   * Update theme
   */
  private updateTheme(theme: string) {
    this.render();
  }

  /**
   * Cleanup resources
   */
  private cleanup() {
    // Cleanup would happen here
  }

  /**
   * Emit typed custom event
   */
  private emitEvent<K extends keyof SonrWalletEvents>(
    type: K,
    detail: SonrWalletEvents[K],
  ): void {
    this.dispatchEvent(new CustomEvent(type, { detail, bubbles: true, composed: true }));
  }

  /**
   * Public API: Refresh wallet data
   */
  async refresh() {
    await this.fetchWalletData();
  }

  /**
   * Public API: Get current address
   */
  getAddress(): string | undefined {
    return this.address;
  }

  /**
   * Public API: Get current balance
   */
  getBalance(): { amount: string; denom: string } {
    return {
      amount: this.balance,
      denom: this.denom,
    };
  }

  /**
   * Public API: Check if connected
   */
  isConnected(): boolean {
    return this.connected;
  }
}

/**
 * Register custom element
 */
export function registerSonrWallet() {
  if (!customElements.get("sonr-wallet")) {
    customElements.define("sonr-wallet", SonrWalletElement);
  }
}

/**
 * Auto-register if in browser
 */
if (typeof window !== "undefined" && typeof customElements !== "undefined") {
  registerSonrWallet();
}
