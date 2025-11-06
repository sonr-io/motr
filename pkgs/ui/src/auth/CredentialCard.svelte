<script lang="ts">
	import { Card, Button, Badge } from 'konsta/svelte';

	interface Props {
		credentialId: string;
		name?: string;
		createdAt: string | Date;
		lastUsed?: string | Date;
		type?: 'passkey' | 'security-key' | 'biometric';
		onRemove?: () => void | Promise<void>;
	}

	let { credentialId, name, createdAt, lastUsed, type = 'passkey', onRemove }: Props = $props();

	const typeIcons = {
		passkey: '🔑',
		'security-key': '🔐',
		biometric: '👤',
	};

	const typeLabels = {
		passkey: 'Passkey',
		'security-key': 'Security Key',
		biometric: 'Biometric',
	};

	function formatDate(date: string | Date): string {
		const d = typeof date === 'string' ? new Date(date) : date;
		return d.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		});
	}
</script>

<Card class="glass-credential-card">
	<div class="p-4">
		<div class="flex items-start justify-between mb-3">
			<div class="flex items-center gap-3">
				<div class="text-3xl">{typeIcons[type]}</div>
				<div>
					<h3 class="text-white font-semibold">
						{name || 'Unnamed Credential'}
					</h3>
					<Badge class="glass-badge mt-1">{typeLabels[type]}</Badge>
				</div>
			</div>
			{#if onRemove}
				<Button onClick={onRemove} clear class="text-red-400 hover:text-red-300">
					Remove
				</Button>
			{/if}
		</div>

		<div class="space-y-2 text-sm">
			<div class="flex justify-between text-white/60">
				<span>Created</span>
				<span class="text-white/90">{formatDate(createdAt)}</span>
			</div>
			{#if lastUsed}
				<div class="flex justify-between text-white/60">
					<span>Last used</span>
					<span class="text-white/90">{formatDate(lastUsed)}</span>
				</div>
			{/if}
			<div class="flex justify-between text-white/60">
				<span>ID</span>
				<span class="text-white/90 font-mono text-xs">{credentialId.slice(0, 16)}...</span>
			</div>
		</div>
	</div>
</Card>

<style>
	:global(.glass-credential-card) {
		@apply backdrop-blur-xl bg-white/10 border border-white/20 shadow-lg;
		@apply hover:bg-white/15 transition-all duration-300;
	}

	:global(.glass-badge) {
		@apply backdrop-blur-md bg-white/20 border border-white/30 text-white text-xs;
	}
</style>
