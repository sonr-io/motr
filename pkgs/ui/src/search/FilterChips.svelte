<script lang="ts">
	import { Chip } from 'konsta/svelte';

	interface Filter {
		id: string;
		label: string;
		icon?: string;
	}

	interface Props {
		filters: Filter[];
		selected?: string[];
		onFilterChange?: (selected: string[]) => void;
		multiSelect?: boolean;
	}

	let { filters, selected = $bindable([]), onFilterChange, multiSelect = true }: Props = $props();

	function toggleFilter(filterId: string) {
		let newSelected: string[];

		if (multiSelect) {
			if (selected.includes(filterId)) {
				newSelected = selected.filter((id) => id !== filterId);
			} else {
				newSelected = [...selected, filterId];
			}
		} else {
			newSelected = selected.includes(filterId) ? [] : [filterId];
		}

		selected = newSelected;

		if (onFilterChange) {
			onFilterChange(newSelected);
		}
	}

	function isSelected(filterId: string): boolean {
		return selected.includes(filterId);
	}
</script>

<div class="glass-filter-chips">
	<div class="flex flex-wrap gap-2">
		{#each filters as filter (filter.id)}
			<Chip
				onClick={() => toggleFilter(filter.id)}
				class={isSelected(filter.id)
					? 'glass-chip glass-chip-selected'
					: 'glass-chip glass-chip-unselected'}
			>
				{#if filter.icon}
					<span class="mr-1">{filter.icon}</span>
				{/if}
				{filter.label}
			</Chip>
		{/each}
	</div>
</div>

<style>
	.glass-filter-chips {
		@apply w-full;
	}

	:global(.glass-chip) {
		@apply backdrop-blur-md border text-sm font-medium;
		@apply transition-all duration-300 cursor-pointer;
	}

	:global(.glass-chip-unselected) {
		@apply bg-white/10 border-white/20 text-white/70;
		@apply hover:bg-white/15 hover:border-white/30 hover:text-white;
	}

	:global(.glass-chip-selected) {
		@apply bg-white/30 border-white/40 text-white;
		@apply shadow-lg;
	}

	:global(.glass-chip-selected:hover) {
		@apply bg-white/35 border-white/50;
	}
</style>
