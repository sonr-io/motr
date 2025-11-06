<script lang="ts">
	import { Block, List, ListInput, Button, Card, Checkbox } from 'konsta/svelte';

	interface Props {
		onSubmit?: (data: {
			username: string;
			email: string;
			password: string;
		}) => void | Promise<void>;
		loading?: boolean;
	}

	let { onSubmit, loading = false }: Props = $props();

	let username = $state('');
	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let agreeToTerms = $state(false);

	const passwordsMatch = $derived(password === confirmPassword || confirmPassword === '');
	const canSubmit = $derived(
		username && email && password && confirmPassword && passwordsMatch && agreeToTerms && !loading
	);

	async function handleSubmit() {
		if (canSubmit && onSubmit) {
			await onSubmit({ username, email, password });
		}
	}
</script>

<Card class="glass-card">
	<Block>
		<div class="text-center mb-6">
			<h2 class="text-2xl font-bold text-white mb-2">Create Account</h2>
			<p class="text-white/70">Join Sonr today</p>
		</div>

		<List class="glass-list">
			<ListInput
				type="text"
				placeholder="Username"
				bind:value={username}
				class="glass-input"
				disabled={loading}
			/>
			<ListInput
				type="email"
				placeholder="Email"
				bind:value={email}
				class="glass-input"
				disabled={loading}
			/>
			<ListInput
				type="password"
				placeholder="Password"
				bind:value={password}
				class="glass-input"
				disabled={loading}
			/>
			<ListInput
				type="password"
				placeholder="Confirm Password"
				bind:value={confirmPassword}
				class="glass-input {!passwordsMatch ? 'border-red-400/50' : ''}"
				disabled={loading}
			/>
		</List>

		{#if !passwordsMatch && confirmPassword}
			<p class="text-red-400 text-sm mt-2 ml-4">Passwords do not match</p>
		{/if}

		<div class="mt-4 px-4">
			<label class="flex items-center gap-3 cursor-pointer">
				<Checkbox bind:checked={agreeToTerms} disabled={loading} class="glass-checkbox" />
				<span class="text-white/70 text-sm">
					I agree to the <a href="/terms" class="text-white hover:underline">Terms of Service</a>
				</span>
			</label>
		</div>

		<div class="mt-6">
			<Button onClick={handleSubmit} large class="glass-button w-full" disabled={!canSubmit}>
				{loading ? 'Creating account...' : 'Create Account'}
			</Button>
		</div>

		<div class="text-center mt-4">
			<span class="text-white/70 text-sm">
				Already have an account?
				<a href="/login" class="text-white hover:underline">Sign in</a>
			</span>
		</div>
	</Block>
</Card>

<style>
	:global(.glass-card) {
		@apply backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl;
	}

	:global(.glass-list) {
		@apply backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl;
	}

	:global(.glass-input) {
		@apply bg-white/5 border-white/10 text-white placeholder-white/50;
		@apply transition-all duration-200;
	}

	:global(.glass-input:focus) {
		@apply border-white/30 bg-white/10;
	}

	:global(.glass-button) {
		@apply backdrop-blur-lg bg-white/20 hover:bg-white/30 border border-white/30 text-white font-semibold;
		@apply transition-all duration-300 shadow-lg hover:shadow-xl;
	}

	:global(.glass-button:disabled) {
		@apply opacity-50 cursor-not-allowed;
	}

	:global(.glass-checkbox) {
		@apply bg-white/10 border-white/30;
	}
</style>
