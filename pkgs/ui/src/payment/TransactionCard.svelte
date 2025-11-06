<script lang="ts">
	import { Card, Button, Badge } from 'konsta/svelte';

	interface Props {
		id: string;
		amount: string;
		currency?: string;
		recipient: string;
		timestamp: string | Date;
		status: 'pending' | 'completed' | 'failed';
		description?: string;
		onViewDetails?: () => void | Promise<void>;
	}

	let {
		id,
		amount,
		currency = 'SNOR',
		recipient,
		timestamp,
		status,
		description,
		onViewDetails,
	}: Props = $props();

	const statusIcons = {
		pending: '⏳',
		completed: '✅',
		failed: '❌',
	};

	const statusColors = {
		pending: 'text-yellow-400',
		completed: 'text-green-400',
		failed: 'text-red-400',
	};

	const statusLabels = {
		pending: 'Pending',
		completed: 'Completed',
		failed: 'Failed',
	};

	function formatDate(date: string | Date): string {
		const d = typeof date === 'string' ? new Date(date) : date;
		return d.toLocaleString('en-US', {
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
	}

	function formatAmount(amount: string): string {
		const num = parseFloat(amount);
		return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 });
	}
</script>

<Card class="glass-transaction-card">
	<div class="p-4">
		<div class="flex items-start justify-between mb-4">
			<div class="flex-1">
				<div class="flex items-center gap-2 mb-2">
					<span class="text-2xl font-bold text-white">{formatAmount(amount)}</span>
					<Badge class="glass-badge">{currency}</Badge>
				</div>
				<p class="text-white/70 text-sm">To: {recipient}</p>
				{#if description}
					<p class="text-white/60 text-xs mt-1 italic">{description}</p>
				{/if}
			</div>
			<div class="flex flex-col items-end gap-1">
				<span class="text-2xl">{statusIcons[status]}</span>
				<span class="{statusColors[status]} text-xs font-medium">{statusLabels[status]}</span>
			</div>
		</div>

		<div class="flex items-center justify-between text-sm border-t border-white/10 pt-3">
			<div class="flex flex-col gap-1">
				<span class="text-white/60 text-xs">Transaction ID</span>
				<span class="text-white/90 font-mono text-xs">{id.slice(0, 12)}...</span>
			</div>
			<div class="flex flex-col gap-1 items-end">
				<span class="text-white/60 text-xs">Time</span>
				<span class="text-white/90 text-xs">{formatDate(timestamp)}</span>
			</div>
		</div>

		{#if onViewDetails}
			<div class="mt-4">
				<Button onClick={onViewDetails} clear class="glass-button-outline w-full">
					View Details
				</Button>
			</div>
		{/if}
	</div>
</Card>

<style>
	:global(.glass-transaction-card) {
		@apply backdrop-blur-xl bg-white/10 border border-white/20 shadow-lg;
		@apply hover:bg-white/15 transition-all duration-300;
	}

	:global(.glass-badge) {
		@apply backdrop-blur-md bg-white/20 border border-white/30 text-white text-xs;
	}

	:global(.glass-button-outline) {
		@apply backdrop-blur-lg bg-white/5 hover:bg-white/15 border border-white/20 text-white;
		@apply transition-all duration-300;
	}
</style>
