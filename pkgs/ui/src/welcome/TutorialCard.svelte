<script lang="ts">
	import { Card, Button, Badge } from 'konsta/svelte';

	interface Props {
		title: string;
		description: string;
		icon?: string;
		image?: string;
		duration?: string;
		difficulty?: 'beginner' | 'intermediate' | 'advanced';
		completed?: boolean;
		onStart?: () => void | Promise<void>;
		onContinue?: () => void | Promise<void>;
	}

	let {
		title,
		description,
		icon,
		image,
		duration,
		difficulty,
		completed = false,
		onStart,
		onContinue,
	}: Props = $props();

	const difficultyColors = {
		beginner: 'glass-badge-beginner',
		intermediate: 'glass-badge-intermediate',
		advanced: 'glass-badge-advanced',
	};

	const difficultyLabels = {
		beginner: 'Beginner',
		intermediate: 'Intermediate',
		advanced: 'Advanced',
	};

	async function handleAction() {
		if (completed && onContinue) {
			await onContinue();
		} else if (onStart) {
			await onStart();
		}
	}
</script>

<Card class="glass-tutorial-card {completed ? 'glass-tutorial-completed' : ''}">
	<div class="p-5">
		{#if image}
			<div class="glass-tutorial-image mb-4">
				<img src={image} alt={title} class="w-full h-40 object-cover rounded-xl" />
			</div>
		{:else if icon}
			<div class="text-5xl mb-4 text-center">{icon}</div>
		{/if}

		<div class="mb-4">
			<div class="flex items-start justify-between gap-2 mb-2">
				<h3 class="text-white text-xl font-bold flex-1">{title}</h3>
				{#if completed}
					<Badge class="glass-badge-completed shrink-0">✓ Done</Badge>
				{/if}
			</div>

			<p class="text-white/70 text-sm mb-3">{description}</p>

			<div class="flex flex-wrap gap-2">
				{#if duration}
					<Badge class="glass-badge">⏱️ {duration}</Badge>
				{/if}
				{#if difficulty}
					<Badge class="{difficultyColors[difficulty]} glass-badge">
						{difficultyLabels[difficulty]}
					</Badge>
				{/if}
			</div>
		</div>

		<Button onClick={handleAction} class="glass-button w-full">
			{completed ? 'Review' : 'Start Tutorial'}
		</Button>
	</div>
</Card>

<style>
	:global(.glass-tutorial-card) {
		@apply backdrop-blur-xl bg-white/10 border border-white/20 shadow-lg;
		@apply hover:bg-white/15 transition-all duration-300;
	}

	:global(.glass-tutorial-completed) {
		@apply bg-white/15 border-white/30;
	}

	.glass-tutorial-image {
		@apply backdrop-blur-md bg-white/5 border border-white/10 rounded-xl overflow-hidden;
	}

	:global(.glass-badge) {
		@apply backdrop-blur-md bg-white/20 border border-white/30 text-white text-xs;
	}

	:global(.glass-badge-completed) {
		@apply backdrop-blur-md bg-green-500/30 border border-green-400/40 text-green-100;
	}

	:global(.glass-badge-beginner) {
		@apply backdrop-blur-md bg-green-500/20 border border-green-400/30 text-green-100;
	}

	:global(.glass-badge-intermediate) {
		@apply backdrop-blur-md bg-yellow-500/20 border border-yellow-400/30 text-yellow-100;
	}

	:global(.glass-badge-advanced) {
		@apply backdrop-blur-md bg-red-500/20 border border-red-400/30 text-red-100;
	}

	:global(.glass-button) {
		@apply backdrop-blur-lg bg-white/20 hover:bg-white/30 border border-white/30 text-white font-semibold;
		@apply transition-all duration-300 shadow-lg hover:shadow-xl;
	}
</style>
