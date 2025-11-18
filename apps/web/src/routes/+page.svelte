<script lang="ts">
	import {
		Page,
		Navbar,
		Block,
		Button,
		Card,
		List,
		ListItem,
		BlockTitle,
		Chip,
		Badge
	} from 'konsta/svelte';
	import { onMount } from 'svelte';
	import * as sessionApi from '$lib/api/session';
	import * as otpApi from '$lib/api/otp';
	import * as registryApi from '$lib/api/registry';
	import * as identityApi from '$lib/api/identity';

	// Session state
	let session = $state<sessionApi.SessionData | null>(null);

	// Identity state
	let myDid = $state<identityApi.ResolveDIDResponse | null>(null);
	let resolvedDid = $state<identityApi.ResolveDIDResponse | null>(null);
	let didToResolve = $state<string>('');
	let newUsername = $state<string>('');

	// Registry state
	let chains = $state<registryApi.ChainInfo[]>([]);
	let assets = $state<registryApi.AssetInfo[]>([]);
	let selectedChainId = $state<string>('');

	// OTP state
	let otpEmail = $state<string>('test@example.com');
	let otpCode = $state<string>('');
	let otpVerifyCode = $state<string>('');
	let otpVerifyResult = $state<boolean | null>(null);

	// UI state
	let loading = $state<Record<string, boolean>>({});
	let error = $state<string>('');
	let success = $state<string>('');
	let activeTab = $state<string>('overview');

	/**
	 * Set loading state for a specific operation
	 */
	function setLoading(key: string, value: boolean) {
		loading = { ...loading, [key]: value };
	}

	/**
	 * Clear messages
	 */
	function clearMessages() {
		error = '';
		success = '';
	}

	/**
	 * Session operations
	 */
	async function loadSession() {
		try {
			setLoading('session', true);
			clearMessages();
			session = await sessionApi.getSession();
			success = 'Session loaded successfully';
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load session';
		} finally {
			setLoading('session', false);
		}
	}

	async function createSession() {
		try {
			setLoading('createSession', true);
			clearMessages();
			const userId = `user_${Date.now()}`;
			const username = `user${Math.floor(Math.random() * 10000)}`;
			session = await sessionApi.createSession(userId, username);
			success = `Session created for ${username}`;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to create session';
		} finally {
			setLoading('createSession', false);
		}
	}

	async function destroySession() {
		try {
			setLoading('destroySession', true);
			clearMessages();
			await sessionApi.destroySession();
			session = null;
			success = 'Session destroyed successfully';
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to destroy session';
		} finally {
			setLoading('destroySession', false);
		}
	}

	/**
	 * Identity operations
	 */
	async function loadMyDid() {
		try {
			setLoading('myDid', true);
			clearMessages();
			myDid = await identityApi.getMyDID();
			success = 'DID loaded successfully';
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load DID';
		} finally {
			setLoading('myDid', false);
		}
	}

	async function registerDid() {
		try {
			setLoading('registerDid', true);
			clearMessages();
			if (!newUsername) {
				throw new Error('Username is required');
			}
			const result = await identityApi.registerDID(newUsername);
			myDid = { document: result.document };
			success = `DID registered: ${result.did}`;
			newUsername = '';
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to register DID';
		} finally {
			setLoading('registerDid', false);
		}
	}

	async function resolveDid() {
		try {
			setLoading('resolveDid', true);
			clearMessages();
			if (!didToResolve) {
				throw new Error('DID is required');
			}
			resolvedDid = await identityApi.resolveDID(didToResolve);
			success = 'DID resolved successfully';
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to resolve DID';
		} finally {
			setLoading('resolveDid', false);
		}
	}

	/**
	 * Registry operations
	 */
	async function loadChains() {
		try {
			setLoading('chains', true);
			clearMessages();
			const result = await registryApi.listChains();
			chains = result.chains;
			success = `Loaded ${result.count} chains`;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load chains';
		} finally {
			setLoading('chains', false);
		}
	}

	async function loadAssets() {
		try {
			setLoading('assets', true);
			clearMessages();
			const result = await registryApi.listAssets(selectedChainId || undefined);
			assets = result.assets;
			success = `Loaded ${result.count} assets`;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load assets';
		} finally {
			setLoading('assets', false);
		}
	}

	/**
	 * OTP operations
	 */
	async function generateOTP() {
		try {
			setLoading('generateOtp', true);
			clearMessages();
			if (!otpEmail) {
				throw new Error('Email is required');
			}
			const result = await otpApi.generateOTP(otpEmail);
			otpCode = result.code || 'Check email';
			success = 'OTP generated successfully';
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to generate OTP';
		} finally {
			setLoading('generateOtp', false);
		}
	}

	async function verifyOTP() {
		try {
			setLoading('verifyOtp', true);
			clearMessages();
			if (!otpEmail || !otpVerifyCode) {
				throw new Error('Email and code are required');
			}
			const result = await otpApi.verifyOTP(otpEmail, otpVerifyCode);
			otpVerifyResult = result.valid;
			success = result.valid ? 'OTP verified successfully' : 'Invalid OTP';
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to verify OTP';
		} finally {
			setLoading('verifyOtp', false);
		}
	}

	/**
	 * Stats calculation
	 */
	function getStats() {
		return {
			totalChains: chains.length,
			totalAssets: assets.length,
			sessionActive: session?.authenticated || false,
			didRegistered: !!myDid,
		};
	}

	onMount(() => {
		// Load initial data
		loadSession();
		loadChains();
		loadAssets();
	});
</script>

<Page>
	<!-- iOS Large Title Navbar -->
	<Navbar title="Sonr Platform" subtitle="API Integration Demo" large ios />

	<!-- Stats Overview -->
	<Block>
		<div class="grid grid-cols-2 gap-4">
			<Card ios>
				<div class="text-center py-4">
					<div class="text-3xl font-bold">{getStats().totalChains}</div>
					<div class="text-sm mt-1">Chains</div>
				</div>
			</Card>
			<Card ios>
				<div class="text-center py-4">
					<div class="text-3xl font-bold">{getStats().totalAssets}</div>
					<div class="text-sm mt-1">Assets</div>
				</div>
			</Card>
		</div>
	</Block>

	<!-- Tab Navigation -->
	<Block>
		<div class="flex gap-2 overflow-x-auto no-scrollbar">
			<Chip ios outline={activeTab !== 'overview'} onClick={() => (activeTab = 'overview')}>
				Overview
			</Chip>
			<Chip ios outline={activeTab !== 'session'} onClick={() => (activeTab = 'session')}>
				Session
			</Chip>
			<Chip ios outline={activeTab !== 'identity'} onClick={() => (activeTab = 'identity')}>
				Identity
			</Chip>
			<Chip ios outline={activeTab !== 'registry'} onClick={() => (activeTab = 'registry')}>
				Registry
			</Chip>
			<Chip ios outline={activeTab !== 'otp'} onClick={() => (activeTab = 'otp')}>
				Security
			</Chip>
		</div>
	</Block>

	<!-- Messages -->
	{#if error || success}
		<Block>
			{#if error}
				<Card ios>
					<div class="text-sm">{error}</div>
				</Card>
			{/if}
			{#if success}
				<Card ios>
					<div class="text-sm">{success}</div>
				</Card>
			{/if}
		</Block>
	{/if}

	<!-- Tab Content -->
	{#if activeTab === 'overview'}
		<Block>
			<Card ios>
				<div class="p-4">
					<h2 class="text-2xl font-bold mb-4">Platform Status</h2>

					<div class="grid grid-cols-2 gap-4 mb-6">
						<div class="p-4 text-center">
							<div class="text-2xl mb-1">
								{getStats().sessionActive ? '✓' : '○'}
							</div>
							<div class="text-xs">Session</div>
						</div>

						<div class="p-4 text-center">
							<div class="text-2xl mb-1">
								{getStats().didRegistered ? '✓' : '○'}
							</div>
							<div class="text-xs">DID</div>
						</div>
					</div>

					<p class="text-sm mb-4">
						Welcome to the Sonr API demo. Use the tabs above to explore different features of our
						decentralized identity and registry platform.
					</p>

					<Button ios large onClick={() => (activeTab = 'session')}>
						Get Started
					</Button>
				</div>
			</Card>
		</Block>
	{:else if activeTab === 'session'}
		<BlockTitle ios>Session Management</BlockTitle>
		<List strongIos insetIos>
			<ListItem
				ios
				title="Session Status"
				after={session?.authenticated ? 'Active' : 'Inactive'}
			>
				{#snippet media()}
					<Badge ios />
				{/snippet}
			</ListItem>
			{#if session?.userId}
				<ListItem ios title="User ID" after={session.userId} />
			{/if}
			{#if session?.username}
				<ListItem ios title="Username" after={session.username} />
			{/if}
		</List>

		<Block class="space-y-3">
			<Button ios large onClick={loadSession} disabled={loading.session}>
				{loading.session ? 'Loading...' : 'Refresh Session'}
			</Button>
			<Button ios large outline onClick={createSession} disabled={loading.createSession}>
				{loading.createSession ? 'Creating...' : 'Create New Session'}
			</Button>
			<Button ios large outline onClick={destroySession} disabled={loading.destroySession}>
				{loading.destroySession ? 'Destroying...' : 'Destroy Session'}
			</Button>
		</Block>
	{:else if activeTab === 'identity'}
		<BlockTitle ios>Decentralized Identity</BlockTitle>

		{#if myDid}
			<Block>
				<Card ios>
					<div class="p-4">
						<h3 class="text-lg font-semibold mb-3">My DID</h3>
						<div class="text-xs break-all">
							<div class="mb-2">
								<span class="font-medium">ID:</span>
								<div class="mt-1">{myDid.document.id}</div>
							</div>
							<div>
								<span class="font-medium">Controller:</span>
								<div class="mt-1">{myDid.document.controller}</div>
							</div>
						</div>
					</div>
				</Card>
			</Block>
		{/if}

		<Block>
			<Card ios>
				<div class="p-4">
					<h3 class="text-lg font-semibold mb-3">Register New DID</h3>
					<input
						type="text"
						bind:value={newUsername}
						placeholder="Enter username"
						class="w-full px-4 py-3 mb-4"
					/>
					<Button ios large onClick={registerDid} disabled={loading.registerDid}>
						{loading.registerDid ? 'Registering...' : 'Register DID'}
					</Button>
				</div>
			</Card>
		</Block>

		<Block>
			<Card ios>
				<div class="p-4">
					<h3 class="text-lg font-semibold mb-3">Resolve DID</h3>
					<input
						type="text"
						bind:value={didToResolve}
						placeholder="did:sonr:..."
						class="w-full px-4 py-3 mb-4"
					/>
					<Button ios large outline onClick={resolveDid} disabled={loading.resolveDid}>
						{loading.resolveDid ? 'Resolving...' : 'Resolve'}
					</Button>

					{#if resolvedDid}
						<div class="mt-4 text-xs break-all">
							<div class="mb-2">
								<span class="font-medium">ID:</span>
								<div class="mt-1">{resolvedDid.document.id}</div>
							</div>
							<div>
								<span class="font-medium">Controller:</span>
								<div class="mt-1">{resolvedDid.document.controller}</div>
							</div>
						</div>
					{/if}
				</div>
			</Card>
		</Block>
	{:else if activeTab === 'registry'}
		<BlockTitle ios>Chain Registry ({chains.length})</BlockTitle>

		<List strongIos insetIos>
			{#each chains.slice(0, 5) as chain}
				<ListItem
					ios
					link
					chevronIos
					title={chain.chainName}
					after={chain.nativeCurrency.symbol}
					subtitle={chain.chainId}
				/>
			{/each}
			{#if chains.length === 0}
				<ListItem ios title="No chains registered" />
			{/if}
		</List>

		<Block>
			<Button ios large outline onClick={loadChains} disabled={loading.chains}>
				{loading.chains ? 'Loading...' : 'Refresh Chains'}
			</Button>
		</Block>

		<BlockTitle ios>Asset Registry ({assets.length})</BlockTitle>

		<List strongIos insetIos>
			{#each assets.slice(0, 5) as asset}
				<ListItem
					ios
					link
					chevronIos
					title={asset.name}
					after={asset.symbol}
					subtitle={`${asset.chainId} • ${asset.decimals} decimals`}
				/>
			{/each}
			{#if assets.length === 0}
				<ListItem ios title="No assets registered" />
			{/if}
		</List>

		<Block>
			<Button ios large outline onClick={loadAssets} disabled={loading.assets}>
				{loading.assets ? 'Loading...' : 'Refresh Assets'}
			</Button>
		</Block>
	{:else if activeTab === 'otp'}
		<BlockTitle ios>One-Time Password</BlockTitle>

		<Block>
			<Card ios>
				<div class="p-4">
					<h3 class="text-lg font-semibold mb-3">Generate OTP</h3>
					<input
						type="email"
						bind:value={otpEmail}
						placeholder="Enter email address"
						class="w-full px-4 py-3 mb-4"
					/>
					<Button ios large onClick={generateOTP} disabled={loading.generateOtp}>
						{loading.generateOtp ? 'Generating...' : 'Generate Code'}
					</Button>

					{#if otpCode}
						<div class="mt-4 p-4 text-center">
							<div class="text-sm mb-1">Your Code</div>
							<div class="text-3xl font-bold tracking-wider">{otpCode}</div>
						</div>
					{/if}
				</div>
			</Card>
		</Block>

		<Block>
			<Card ios>
				<div class="p-4">
					<h3 class="text-lg font-semibold mb-3">Verify OTP</h3>
					<input
						type="text"
						bind:value={otpVerifyCode}
						placeholder="Enter OTP code"
						class="w-full px-4 py-3 mb-4"
					/>
					<Button ios large outline onClick={verifyOTP} disabled={loading.verifyOtp}>
						{loading.verifyOtp ? 'Verifying...' : 'Verify Code'}
					</Button>

					{#if otpVerifyResult !== null}
						<div class="mt-4 p-4 text-center">
							<div class="text-2xl mb-1">
								{otpVerifyResult ? '✓' : '✗'}
							</div>
							<div class="text-sm">
								{otpVerifyResult ? 'Valid Code' : 'Invalid Code'}
							</div>
						</div>
					{/if}
				</div>
			</Card>
		</Block>
	{/if}

	<!-- Bottom Spacer for iOS -->
	<Block class="h-20"></Block>
</Page>

<style>
	/* Hide scrollbar for tab navigation */
	.no-scrollbar::-webkit-scrollbar {
		display: none;
	}
	.no-scrollbar {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
</style>
