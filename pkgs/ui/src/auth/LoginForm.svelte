<script lang="ts">
	import { Block, List, ListInput, Button, Card } from 'konsta/svelte';

	interface Props {
		onSubmit?: (username: string, password: string) => void | Promise<void>;
		loading?: boolean;
	}

	let { onSubmit, loading = false }: Props = $props();

	let username = $state('');
	let password = $state('');

	async function handleSubmit() {
		if (onSubmit) {
			await onSubmit(username, password);
		}
	}
</script>

<Card class="glass-card">
	<Block>
		<div class="text-center mb-6">
			<h2 class="text-2xl font-bold text-white mb-2">Welcome Back</h2>
			<p class="text-white/70">Sign in to continue</p>
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
				type="password"
				placeholder="Password"
				bind:value={password}
				class="glass-input"
				disabled={loading}
			/>
		</List>

		<div class="mt-6">
			<Button onClick={handleSubmit} large class="glass-button w-full" disabled={loading}>
				{loading ? 'Signing in...' : 'Sign In'}
			</Button>
		</div>

		<div class="text-center mt-4">
			<a href="/forgot" class="text-white/70 hover:text-white text-sm">Forgot password?</a>
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
	}

	:global(.glass-button) {
		@apply backdrop-blur-lg bg-white/20 hover:bg-white/30 border border-white/30 text-white font-semibold;
		@apply transition-all duration-300 shadow-lg hover:shadow-xl;
	}
</style>
