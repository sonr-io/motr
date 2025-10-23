"use strict";
/**
 * Motr Orchestrator Worker
 *
 * Central Cloudflare Worker that routes requests to different frontend apps
 * based on session state, subdomain, and path routing.
 *
 * Architecture:
 * - Routes to auth app for authentication flows
 * - Routes to console app for authenticated admin/dev flows
 * - Routes to profile app for user profile management
 * - Routes to search app for search functionality
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    fetch: function (request, env, ctx) {
        return __awaiter(this, void 0, void 0, function () {
            var url, session, subdomain, defaultApp;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        url = new URL(request.url);
                        console.log("[Orchestrator] ".concat(request.method, " ").concat(url.hostname).concat(url.pathname));
                        // Health check endpoint
                        if (url.pathname === '/health') {
                            return [2 /*return*/, Response.json({
                                    status: 'ok',
                                    service: 'motr-orchestrator',
                                    environment: env.ENVIRONMENT,
                                    timestamp: new Date().toISOString(),
                                })];
                        }
                        return [4 /*yield*/, getSession(request, env)];
                    case 1:
                        session = _b.sent();
                        console.log("[Orchestrator] Session: authenticated=".concat(session.authenticated, ", userId=").concat(session.userId));
                        subdomain = url.hostname.split('.')[0];
                        // Explicit subdomain routing
                        if (subdomain === 'console') {
                            return [2 /*return*/, routeToApp(env.CONSOLE_APP, request, session)];
                        }
                        if (subdomain === 'profile') {
                            return [2 /*return*/, routeToApp(env.PROFILE_APP, request, session)];
                        }
                        if (subdomain === 'search') {
                            return [2 /*return*/, routeToApp(env.SEARCH_APP, request, session)];
                        }
                        // Path-based routing for main domain
                        if (url.pathname.startsWith('/console')) {
                            return [2 /*return*/, routeToApp(env.CONSOLE_APP, request, session)];
                        }
                        if (url.pathname.startsWith('/profile')) {
                            return [2 /*return*/, routeToApp(env.PROFILE_APP, request, session)];
                        }
                        if (url.pathname.startsWith('/search')) {
                            return [2 /*return*/, routeToApp(env.SEARCH_APP, request, session)];
                        }
                        // Session-based routing for authenticated users
                        if (session.authenticated) {
                            defaultApp = (_a = session.preferences) === null || _a === void 0 ? void 0 : _a.defaultApp;
                            if (defaultApp === 'console') {
                                return [2 /*return*/, routeToApp(env.CONSOLE_APP, request, session)];
                            }
                            if (defaultApp === 'profile') {
                                return [2 /*return*/, routeToApp(env.PROFILE_APP, request, session)];
                            }
                            if (defaultApp === 'search') {
                                return [2 /*return*/, routeToApp(env.SEARCH_APP, request, session)];
                            }
                            // Default to console for authenticated users
                            return [2 /*return*/, routeToApp(env.CONSOLE_APP, request, session)];
                        }
                        // Default: route unauthenticated users to auth app
                        return [2 /*return*/, routeToApp(env.AUTH_APP, request, session)];
                }
            });
        });
    },
};
/**
 * Get or create session from request
 */
function getSession(request, env) {
    return __awaiter(this, void 0, void 0, function () {
        var cookieHeader, sessionIdMatch, sessionId, sessionData, now, sessionAge, maxAge;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    cookieHeader = request.headers.get('Cookie');
                    if (!cookieHeader) {
                        return [2 /*return*/, createNewSession()];
                    }
                    sessionIdMatch = cookieHeader.match(/session_id=([^;]+)/);
                    if (!sessionIdMatch) {
                        return [2 /*return*/, createNewSession()];
                    }
                    sessionId = sessionIdMatch[1];
                    return [4 /*yield*/, env.SESSIONS.get(sessionId, 'json')];
                case 1:
                    sessionData = _a.sent();
                    if (!sessionData) {
                        return [2 /*return*/, createNewSession()];
                    }
                    now = Date.now();
                    sessionAge = now - sessionData.createdAt;
                    maxAge = 24 * 60 * 60 * 1000;
                    if (sessionAge > maxAge) {
                        return [2 /*return*/, createNewSession()];
                    }
                    // Update last activity
                    sessionData.lastActivityAt = now;
                    return [2 /*return*/, sessionData];
            }
        });
    });
}
/**
 * Create a new session
 */
function createNewSession() {
    return {
        authenticated: false,
        createdAt: Date.now(),
        lastActivityAt: Date.now(),
    };
}
/**
 * Route request to a specific app service
 */
function routeToApp(app, request, session) {
    return __awaiter(this, void 0, void 0, function () {
        var headers, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    headers = new Headers(request.headers);
                    headers.set('X-Session-Authenticated', session.authenticated.toString());
                    if (session.userId) {
                        headers.set('X-Session-User-Id', session.userId);
                    }
                    if (session.username) {
                        headers.set('X-Session-Username', session.username);
                    }
                    return [4 /*yield*/, app.fetch(request.url, {
                            method: request.method,
                            headers: headers,
                            body: request.body,
                        })];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response];
            }
        });
    });
}
/**
 * Session management API endpoints
 */
function handleSessionAPI(request, env, session) {
    return __awaiter(this, void 0, void 0, function () {
        var url, body, sessionId, cookieHeader, sessionIdMatch;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    url = new URL(request.url);
                    // Get session info
                    if (url.pathname === '/api/session' && request.method === 'GET') {
                        return [2 /*return*/, Response.json({
                                authenticated: session.authenticated,
                                userId: session.userId,
                                username: session.username,
                                preferences: session.preferences,
                            })];
                    }
                    if (!(url.pathname === '/api/session/preferences' && request.method === 'POST')) return [3 /*break*/, 3];
                    return [4 /*yield*/, request.json()];
                case 1:
                    body = _a.sent();
                    session.preferences = __assign(__assign({}, session.preferences), body);
                    sessionId = crypto.randomUUID();
                    return [4 /*yield*/, env.SESSIONS.put(sessionId, JSON.stringify(session), {
                            expirationTtl: 24 * 60 * 60, // 24 hours
                        })];
                case 2:
                    _a.sent();
                    return [2 /*return*/, Response.json({
                            success: true,
                            preferences: session.preferences,
                        })];
                case 3:
                    if (!(url.pathname === '/api/session/logout' && request.method === 'POST')) return [3 /*break*/, 6];
                    cookieHeader = request.headers.get('Cookie');
                    sessionIdMatch = cookieHeader === null || cookieHeader === void 0 ? void 0 : cookieHeader.match(/session_id=([^;]+)/);
                    if (!sessionIdMatch) return [3 /*break*/, 5];
                    return [4 /*yield*/, env.SESSIONS.delete(sessionIdMatch[1])];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5: return [2 /*return*/, Response.json({ success: true })];
                case 6: return [2 /*return*/, new Response('Not Found', { status: 404 })];
            }
        });
    });
}
