/**
 * Service Worker TypeScript Type Definitions
 *
 * Comprehensive type definitions for Service Worker APIs following W3C standards
 * and MDN documentation for 2025.
 *
 * These types extend the built-in TypeScript Service Worker types with additional
 * Motor Vault-specific types and modern Service Worker features.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
 */

// Extend Window interface for Service Worker registration
declare global {
  interface Window {
    __SW_VERSION__?: string;
    __SW_UPDATE_AVAILABLE__?: boolean;
  }

  interface Navigator {
    readonly serviceWorker: ServiceWorkerContainer;
  }
}

// Service Worker Global Scope extensions
declare const self: ServiceWorkerGlobalScope;

export interface ServiceWorkerGlobalScope extends WorkerGlobalScope {
  readonly clients: Clients;
  readonly registration: ServiceWorkerRegistration;
  readonly serviceWorker: ServiceWorker;

  addEventListener<K extends keyof ServiceWorkerGlobalScopeEventMap>(
    type: K,
    listener: (
      this: ServiceWorkerGlobalScope,
      ev: ServiceWorkerGlobalScopeEventMap[K],
    ) => any,
    options?: boolean | AddEventListenerOptions,
  ): void;

  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ): void;

  skipWaiting(): Promise<void>;
}

// Service Worker event maps
export interface ServiceWorkerGlobalScopeEventMap
  extends WorkerGlobalScopeEventMap {
  install: ExtendableEvent;
  activate: ExtendableEvent;
  fetch: FetchEvent;
  message: ExtendableMessageEvent;
  messageerror: MessageEvent;
  sync: SyncEvent;
  push: PushEvent;
  pushsubscriptionchange: PushSubscriptionChangeEvent;
  notificationclick: NotificationEvent;
  notificationclose: NotificationEvent;
}

// Cache Storage types
export interface CacheStorage {
  delete(cacheName: string): Promise<boolean>;
  has(cacheName: string): Promise<boolean>;
  keys(): Promise<string[]>;
  match(
    request: RequestInfo | URL,
    options?: CacheQueryOptions,
  ): Promise<Response | undefined>;
  open(cacheName: string): Promise<Cache>;
}

export interface Cache {
  add(request: RequestInfo | URL): Promise<void>;
  addAll(requests: (RequestInfo | URL)[]): Promise<void>;
  delete(
    request: RequestInfo | URL,
    options?: CacheQueryOptions,
  ): Promise<boolean>;
  keys(
    request?: RequestInfo | URL,
    options?: CacheQueryOptions,
  ): Promise<readonly Request[]>;
  match(
    request: RequestInfo | URL,
    options?: CacheQueryOptions,
  ): Promise<Response | undefined>;
  matchAll(
    request?: RequestInfo | URL,
    options?: CacheQueryOptions,
  ): Promise<readonly Response[]>;
  put(request: RequestInfo | URL, response: Response): Promise<void>;
}

export interface CacheQueryOptions {
  ignoreMethod?: boolean;
  ignoreSearch?: boolean;
  ignoreVary?: boolean;
}

// Clients API types
export interface Clients {
  claim(): Promise<void>;
  get(id: string): Promise<Client | undefined>;
  matchAll<T extends ClientQueryOptions>(
    options?: T,
  ): Promise<ReadonlyArray<ClientType<T>>>;
  openWindow(url: string | URL): Promise<WindowClient | null>;
}

export interface Client {
  readonly frameType: FrameType;
  readonly id: string;
  readonly type: ClientType;
  readonly url: string;
  postMessage(message: any, transfer?: Transferable[]): void;
  postMessage(message: any, options?: StructuredSerializeOptions): void;
}

export interface WindowClient extends Client {
  readonly focused: boolean;
  readonly visibilityState: DocumentVisibilityState;
  readonly ancestorOrigins: readonly string[];
  focus(): Promise<WindowClient>;
  navigate(url: string | URL): Promise<WindowClient>;
}

export type FrameType = "auxiliary" | "top-level" | "nested" | "none";
export type ClientType = "window" | "worker" | "sharedworker" | "all";

export interface ClientQueryOptions {
  includeUncontrolled?: boolean;
  type?: ClientType;
}

type ResolvedClientType<T extends ClientQueryOptions> = T extends {
  type: "window";
}
  ? WindowClient
  : T extends { type: "worker" | "sharedworker" }
    ? Client
    : Client | WindowClient;

// Extended event types
export interface ExtendableEvent extends Event {
  waitUntil(f: Promise<any>): void;
}

export interface FetchEvent extends ExtendableEvent {
  readonly clientId: string;
  readonly handled: Promise<undefined>;
  readonly preloadResponse: Promise<Response | undefined>;
  readonly replacesClientId: string;
  readonly request: Request;
  readonly resultingClientId: string;
  respondWith(r: Response | Promise<Response>): void;
}

export interface ExtendableMessageEvent extends ExtendableEvent {
  readonly data: any;
  readonly lastEventId: string;
  readonly origin: string;
  readonly ports: ReadonlyArray<MessagePort>;
  readonly source: Client | ServiceWorker | MessagePort | null;
}

export interface SyncEvent extends ExtendableEvent {
  readonly lastChance: boolean;
  readonly tag: string;
}

export interface PushEvent extends ExtendableEvent {
  readonly data: PushMessageData | null;
}

export interface PushMessageData {
  arrayBuffer(): ArrayBuffer;
  blob(): Blob;
  json(): any;
  text(): string;
}

export interface PushSubscriptionChangeEvent extends ExtendableEvent {
  readonly newSubscription: PushSubscription | null;
  readonly oldSubscription: PushSubscription | null;
}

export interface NotificationEvent extends ExtendableEvent {
  readonly action: string;
  readonly notification: Notification;
  readonly reply: string;
}

// Background Sync types
export interface SyncManager {
  register(tag: string): Promise<void>;
  getTags(): Promise<string[]>;
}

// Push API types
export interface PushManager {
  getSubscription(): Promise<PushSubscription | null>;
  permissionState(
    options?: PushSubscriptionOptionsInit,
  ): Promise<PushPermissionState>;
  subscribe(options?: PushSubscriptionOptionsInit): Promise<PushSubscription>;
}

export interface PushSubscription {
  readonly endpoint: string;
  readonly expirationTime: DOMHighResTimeStamp | null;
  readonly options: PushSubscriptionOptions;
  getKey(name: PushEncryptionKeyName): ArrayBuffer | null;
  toJSON(): PushSubscriptionJSON;
  unsubscribe(): Promise<boolean>;
}

export type PushPermissionState = "denied" | "granted" | "prompt";
export type PushEncryptionKeyName = "auth" | "p256dh";

export interface PushSubscriptionOptions {
  readonly applicationServerKey: ArrayBuffer | null;
  readonly userVisibleOnly: boolean;
}

export interface PushSubscriptionOptionsInit {
  applicationServerKey?: BufferSource | string | null;
  userVisibleOnly?: boolean;
}

export interface PushSubscriptionJSON {
  endpoint?: string;
  expirationTime?: DOMHighResTimeStamp | null;
  keys?: Record<string, string>;
}

// Notification types
export interface NotificationOptions {
  actions?: NotificationAction[];
  badge?: string;
  body?: string;
  data?: any;
  dir?: NotificationDirection;
  icon?: string;
  image?: string;
  lang?: string;
  renotify?: boolean;
  requireInteraction?: boolean;
  silent?: boolean | null;
  tag?: string;
  timestamp?: DOMTimeStamp;
  vibrate?: VibratePattern;
}

export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

export type NotificationDirection = "auto" | "ltr" | "rtl";
export type VibratePattern = number | number[];

// Motor Vault specific message types
export interface VaultServiceWorkerMessage {
  type: VaultMessageType;
  payload?: any;
}

export type VaultMessageType =
  | "SKIP_WAITING"
  | "CLAIM_CLIENTS"
  | "CLEAR_CACHE"
  | "GET_VERSION"
  | "CACHE_URLS"
  | "SYNC_VAULT"
  | "UPDATE_CONFIG";

export interface VaultCacheMessage extends VaultServiceWorkerMessage {
  type: "CACHE_URLS";
  payload: {
    urls: string[];
  };
}

export interface VaultVersionResponse {
  version: string;
  buildTime?: string;
  features?: string[];
}

// Cache strategy types
export type CacheStrategy =
  | "network-first"
  | "cache-first"
  | "stale-while-revalidate"
  | "network-only"
  | "cache-only";

export interface CacheStrategyConfig {
  strategy: CacheStrategy;
  cacheName?: string;
  maxAge?: number;
  maxEntries?: number;
  plugins?: CachePlugin[];
}

export interface CachePlugin {
  cacheWillUpdate?: (options: {
    request: Request;
    response: Response;
  }) => Promise<Response | null> | Response | null;

  cachedResponseWillBeUsed?: (options: {
    request: Request;
    cachedResponse: Response | null;
  }) => Promise<Response | null> | Response | null;

  requestWillFetch?: (options: {
    request: Request;
  }) => Promise<Request> | Request;

  fetchDidFail?: (options: {
    request: Request;
    error: Error;
  }) => Promise<void> | void;
}

// Route matching types
export type RouteMatchCallback = (options: {
  url: URL;
  request: Request;
  event: FetchEvent;
}) => boolean;

export type RouteHandler = (options: {
  url: URL;
  request: Request;
  event: FetchEvent;
  params?: Record<string, string>;
}) => Promise<Response> | Response;

export interface RouteDefinition {
  match: RegExp | RouteMatchCallback;
  handler: RouteHandler;
  method?: string;
}
