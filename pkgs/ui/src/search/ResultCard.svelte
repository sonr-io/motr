<script lang="ts">
	import { Card, Badge } from 'konsta/svelte';

	interface Props {
		title: string;
		description?: string;
		type?: string;
		metadata?: Record<string, string>;
		thumbnail?: string;
		onClick?: () => void | Promise<void>;
		highlighted?: boolean;
	}

	let {
		title,
		description,
		type,
		metadata = {},
		thumbnail,
		onClick,
		highlighted = false,
	}: Props = $props();

	const typeIcons: Record<string, string> = {
		user: '👤',
		document: '📄',
		image: '🖼️',
		video: '🎥',
		audio: '🎵',
		link: '🔗',
		file: '📁',
	};

	const typeIcon = $derived(type ? typeIcons[type] || '📌' : '📌');
</script>

<Card class="glass-result-card {highlighted ? 'glass-result-highlighted' : ''}" onClick={onClick}>
	<div class="p-4">
		<div class="flex gap-4">
			{#if thumbnail}
				<div class="glass-thumbnail">
					<img src={thumbnail} alt={title} class="w-16 h-16 object-cover rounded-lg" />
				</div>
			{:else}
				<div class="glass-thumbnail-placeholder">
					<span class="text-3xl">{typeIcon}</span>
				</div>
			{/if}

			<div class="flex-1 min-w-0">
				<div class="flex items-start justify-between gap-2 mb-2">
					<h3 class="text-white font-semibold text-lg truncate">{title}</h3>
					{#if type}
						<Badge class="glass-badge shrink-0">{type}</Badge>
					{/if}
				</div>

				{#if description}
					<p class="text-white/70 text-sm line-clamp-2 mb-3">{description}</p>
				{/if}

				{#if Object.keys(metadata).length > 0}
					<div class="flex flex-wrap gap-2">
						{#each Object.entries(metadata) as [key, value]}
							<div class="glass-metadata">
								<span class="text-white/50 text-xs">{key}:</span>
								<span class="text-white/80 text-xs ml-1">{value}</span>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</div>
</Card>

<style>
	:global(.glass-result-card) {
		@apply backdrop-blur-xl bg-white/10 border border-white/20 shadow-lg;
		@apply hover:bg-white/15 cursor-pointer transition-all duration-300;
	}

	:global(.glass-result-highlighted) {
		@apply ring-2 ring-white/40 bg-white/20;
	}

	.glass-thumbnail {
		@apply backdrop-blur-md bg-white/5 border border-white/10 rounded-lg overflow-hidden;
		@apply w-16 h-16 shrink-0;
	}

	.glass-thumbnail-placeholder {
		@apply backdrop-blur-md bg-white/10 border border-white/20 rounded-lg;
		@apply w-16 h-16 shrink-0 flex items-center justify-center;
	}

	:global(.glass-badge) {
		@apply backdrop-blur-md bg-white/20 border border-white/30 text-white text-xs;
	}

	.glass-metadata {
		@apply backdrop-blur-md bg-white/5 border border-white/10 rounded px-2 py-0.5;
	}

	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
