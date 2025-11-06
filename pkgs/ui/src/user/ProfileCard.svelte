<script lang="ts">
	import { Card, Button, Badge } from 'konsta/svelte';

	interface Props {
		username: string;
		did?: string;
		avatar?: string;
		bio?: string;
		verified?: boolean;
		stats?: {
			followers?: number;
			following?: number;
			posts?: number;
		};
		onEdit?: () => void | Promise<void>;
		onViewDetails?: () => void | Promise<void>;
	}

	let { username, did, avatar, bio, verified = false, stats, onEdit, onViewDetails }: Props = $props();

	function formatNumber(num: number): string {
		if (num >= 1000000) {
			return (num / 1000000).toFixed(1) + 'M';
		}
		if (num >= 1000) {
			return (num / 1000).toFixed(1) + 'K';
		}
		return num.toString();
	}
</script>

<Card class="glass-profile-card">
	<div class="p-6">
		<div class="flex items-start gap-4 mb-4">
			{#if avatar}
				<div class="glass-avatar">
					<img src={avatar} alt={username} class="w-20 h-20 rounded-full object-cover" />
				</div>
			{:else}
				<div class="glass-avatar-placeholder">
					<span class="text-4xl">👤</span>
				</div>
			{/if}

			<div class="flex-1 min-w-0">
				<div class="flex items-center gap-2 mb-1">
					<h2 class="text-white text-2xl font-bold truncate">{username}</h2>
					{#if verified}
						<Badge class="glass-badge-verified">✓</Badge>
					{/if}
				</div>

				{#if did}
					<p class="text-white/60 text-xs font-mono mb-2">{did.slice(0, 24)}...</p>
				{/if}

				{#if bio}
					<p class="text-white/80 text-sm line-clamp-2">{bio}</p>
				{/if}
			</div>
		</div>

		{#if stats}
			<div class="flex gap-4 mb-4 pb-4 border-b border-white/10">
				{#if stats.posts !== undefined}
					<div class="glass-stat">
						<div class="text-white text-xl font-bold">{formatNumber(stats.posts)}</div>
						<div class="text-white/60 text-xs">Posts</div>
					</div>
				{/if}
				{#if stats.followers !== undefined}
					<div class="glass-stat">
						<div class="text-white text-xl font-bold">{formatNumber(stats.followers)}</div>
						<div class="text-white/60 text-xs">Followers</div>
					</div>
				{/if}
				{#if stats.following !== undefined}
					<div class="glass-stat">
						<div class="text-white text-xl font-bold">{formatNumber(stats.following)}</div>
						<div class="text-white/60 text-xs">Following</div>
					</div>
				{/if}
			</div>
		{/if}

		<div class="flex gap-2">
			{#if onEdit}
				<Button onClick={onEdit} class="glass-button flex-1">Edit Profile</Button>
			{/if}
			{#if onViewDetails}
				<Button onClick={onViewDetails} outline class="glass-button-outline flex-1">
					View Details
				</Button>
			{/if}
		</div>
	</div>
</Card>

<style>
	:global(.glass-profile-card) {
		@apply backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl;
	}

	.glass-avatar {
		@apply backdrop-blur-md bg-white/10 border-2 border-white/30 rounded-full overflow-hidden;
		@apply w-20 h-20 shrink-0;
	}

	.glass-avatar-placeholder {
		@apply backdrop-blur-md bg-white/10 border-2 border-white/30 rounded-full;
		@apply w-20 h-20 shrink-0 flex items-center justify-center;
	}

	:global(.glass-badge-verified) {
		@apply backdrop-blur-md bg-blue-500/30 border border-blue-400/40 text-blue-100;
	}

	.glass-stat {
		@apply text-center;
	}

	:global(.glass-button) {
		@apply backdrop-blur-lg bg-white/20 hover:bg-white/30 border border-white/30 text-white font-semibold;
		@apply transition-all duration-300 shadow-lg hover:shadow-xl;
	}

	:global(.glass-button-outline) {
		@apply backdrop-blur-lg bg-white/5 hover:bg-white/15 border border-white/20 text-white;
		@apply transition-all duration-300;
	}

	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
