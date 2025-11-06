<script lang="ts">
	import { Block, List, ListItem, Card } from 'konsta/svelte';

	interface SettingItem {
		id: string;
		title: string;
		description?: string;
		icon?: string;
		onClick?: () => void | Promise<void>;
		rightContent?: string;
	}

	interface SettingGroup {
		title: string;
		items: SettingItem[];
	}

	interface Props {
		groups: SettingGroup[];
	}

	let { groups }: Props = $props();

	async function handleItemClick(item: SettingItem) {
		if (item.onClick) {
			await item.onClick();
		}
	}
</script>

<Card class="glass-settings-panel">
	<Block>
		{#each groups as group, groupIndex (groupIndex)}
			<div class="mb-6 last:mb-0">
				<h3 class="text-white/70 text-sm font-semibold uppercase tracking-wider px-4 mb-3">
					{group.title}
				</h3>

				<List class="glass-list">
					{#each group.items as item (item.id)}
						<ListItem
							title={item.title}
							after={item.rightContent}
							link
							chevronIos
							onClick={() => handleItemClick(item)}
							class="glass-list-item"
						>
							{#snippet media()}
								{#if item.icon}
									<div class="text-2xl mr-2">
										{item.icon}
									</div>
								{/if}
							{/snippet}
							{#snippet text()}
								{#if item.description}
									<div class="text-white/60 text-sm">
										{item.description}
									</div>
								{/if}
							{/snippet}
						</ListItem>
					{/each}
				</List>
			</div>
		{/each}
	</Block>
</Card>

<style>
	:global(.glass-settings-panel) {
		@apply backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl;
	}

	:global(.glass-list) {
		@apply backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl overflow-hidden;
	}

	:global(.glass-list-item) {
		@apply bg-transparent border-white/5 text-white;
		@apply hover:bg-white/10 active:bg-white/15 transition-colors duration-200;
	}

	:global(.glass-list-item .item-title) {
		@apply text-white font-medium;
	}

	:global(.glass-list-item .item-after) {
		@apply text-white/60;
	}
</style>
