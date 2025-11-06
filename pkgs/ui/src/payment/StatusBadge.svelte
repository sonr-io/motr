<script lang="ts">
	import { Badge } from 'konsta/svelte';

	interface Props {
		status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
		size?: 'small' | 'medium' | 'large';
		showIcon?: boolean;
	}

	let { status, size = 'medium', showIcon = true }: Props = $props();

	const statusConfig = {
		pending: {
			icon: '⏳',
			label: 'Pending',
			class: 'glass-badge-pending',
		},
		processing: {
			icon: '⚙️',
			label: 'Processing',
			class: 'glass-badge-processing',
		},
		completed: {
			icon: '✅',
			label: 'Completed',
			class: 'glass-badge-completed',
		},
		failed: {
			icon: '❌',
			label: 'Failed',
			class: 'glass-badge-failed',
		},
		cancelled: {
			icon: '🚫',
			label: 'Cancelled',
			class: 'glass-badge-cancelled',
		},
	};

	const sizeClasses = {
		small: 'text-xs px-2 py-0.5',
		medium: 'text-sm px-3 py-1',
		large: 'text-base px-4 py-1.5',
	};

	const config = $derived(statusConfig[status]);
	const sizeClass = $derived(sizeClasses[size]);
</script>

<Badge class="{config.class} {sizeClass} glass-badge-base">
	{#if showIcon}
		<span class="mr-1">{config.icon}</span>
	{/if}
	{config.label}
</Badge>

<style>
	:global(.glass-badge-base) {
		@apply backdrop-blur-md border font-medium inline-flex items-center;
		@apply transition-all duration-300;
	}

	:global(.glass-badge-pending) {
		@apply bg-yellow-500/20 border-yellow-400/40 text-yellow-100;
	}

	:global(.glass-badge-processing) {
		@apply bg-blue-500/20 border-blue-400/40 text-blue-100;
		animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
	}

	:global(.glass-badge-completed) {
		@apply bg-green-500/20 border-green-400/40 text-green-100;
	}

	:global(.glass-badge-failed) {
		@apply bg-red-500/20 border-red-400/40 text-red-100;
	}

	:global(.glass-badge-cancelled) {
		@apply bg-gray-500/20 border-gray-400/40 text-gray-100;
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.7;
		}
	}
</style>
