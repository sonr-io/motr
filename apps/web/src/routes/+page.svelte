<script lang="ts">
	import { Page, Navbar, Block, Button, Card, List, ListItem } from 'konsta/svelte';
	import { onMount } from 'svelte';
	import * as sessionApi from '$lib/api/session';
	import * as otpApi from '$lib/api/otp';
	import * as registryApi from '$lib/api/registry';

	let session = $state<sessionApi.SessionData | null>(null);
	let chains = $state<registryApi.ChainInfo[]>([]);
	let otpCode = $state<string>('');
	let loading = $state(false);
	let error = $state<string>('');

	/**
	 * Test session API
	 */
	async function testSession() {
		try {
			loading = true;
			error = '';
			session = await sessionApi.getSession();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to get session';
		} finally {
			loading = false;
		}
	}

	/**
	 * Test OTP API
	 */
	async function testOTP() {
		try {
			loading = true;
			error = '';
			const result = await otpApi.generateOTP('test@example.com');
			otpCode = result.code || 'Check email';
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to generate OTP';
		} finally {
			loading = false;
		}
	}

	/**
	 * Test registry API
	 */
	async function testRegistry() {
		try {
			loading = true;
			error = '';
			const result = await registryApi.listChains();
			chains = result.chains;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to get chains';
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		// Load session on mount
		testSession();
	});
</script>

<Page>
	<Navbar title="Sonr API Test" />
	<Block>
		<Card>
			<h1 class="text-2xl font-bold mb-4">API Integration Test</h1>
			<p class="mb-4">
				Testing API client library with SvelteKit integration.
			</p>

			{#if error}
				<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
					{error}
				</div>
			{/if}

			<div class="space-y-4">
				<!-- Session Test -->
				<div>
					<h2 class="text-xl font-semibold mb-2">Session</h2>
					{#if session}
						<p class="text-sm text-gray-600 mb-2">
							Authenticated: {session.authenticated ? 'Yes' : 'No'}
						</p>
						{#if session.userId}
							<p class="text-sm text-gray-600">User ID: {session.userId}</p>
						{/if}
						{#if session.username}
							<p class="text-sm text-gray-600">Username: {session.username}</p>
						{/if}
					{:else}
						<p class="text-sm text-gray-500">No session data</p>
					{/if}
					<Button onClick={testSession} disabled={loading} class="mt-2">
						{loading ? 'Loading...' : 'Refresh Session'}
					</Button>
				</div>

				<!-- OTP Test -->
				<div>
					<h2 class="text-xl font-semibold mb-2">OTP</h2>
					{#if otpCode}
						<p class="text-sm text-gray-600 mb-2">Code: <strong>{otpCode}</strong></p>
					{:else}
						<p class="text-sm text-gray-500">No OTP generated</p>
					{/if}
					<Button onClick={testOTP} disabled={loading} class="mt-2">
						{loading ? 'Loading...' : 'Generate OTP'}
					</Button>
				</div>

				<!-- Registry Test -->
				<div>
					<h2 class="text-xl font-semibold mb-2">Chain Registry</h2>
					{#if chains.length > 0}
						<List>
							{#each chains as chain}
								<ListItem title={chain.chainName} subtitle={chain.chainId} />
							{/each}
						</List>
					{:else}
						<p class="text-sm text-gray-500">No chains registered</p>
					{/if}
					<Button onClick={testRegistry} disabled={loading} class="mt-2">
						{loading ? 'Loading...' : 'Load Chains'}
					</Button>
				</div>
			</div>
		</Card>
	</Block>
</Page>
