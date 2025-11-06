<script lang="ts">
	import { Searchbar } from 'konsta/svelte';

	interface Props {
		placeholder?: string;
		value?: string;
		onSearch?: (query: string) => void | Promise<void>;
		onClear?: () => void;
		loading?: boolean;
		disabled?: boolean;
	}

	let {
		placeholder = 'Search...',
		value = $bindable(''),
		onSearch,
		onClear,
		loading = false,
		disabled = false,
	}: Props = $props();

	let searchValue = $state(value);

	// Debounce search
	let debounceTimer: ReturnType<typeof setTimeout> | null = null;

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		searchValue = target.value;
		value = searchValue;

		if (debounceTimer) {
			clearTimeout(debounceTimer);
		}

		debounceTimer = setTimeout(() => {
			if (onSearch) {
				onSearch(searchValue);
			}
		}, 300);
	}

	function handleClear() {
		searchValue = '';
		value = '';
		if (debounceTimer) {
			clearTimeout(debounceTimer);
		}
		if (onClear) {
			onClear();
		}
	}

	function handleSearch() {
		if (onSearch && !loading) {
			onSearch(searchValue);
		}
	}
</script>

<div class="glass-searchbar-container">
	<Searchbar
		bind:value={searchValue}
		{placeholder}
		{disabled}
		onInput={handleInput}
		onClear={handleClear}
		onClickButton={handleSearch}
		class="glass-searchbar"
		disableButton={loading || disabled}
	/>
	{#if loading}
		<div class="absolute right-4 top-1/2 -translate-y-1/2">
			<div class="glass-spinner"></div>
		</div>
	{/if}
</div>

<style>
	.glass-searchbar-container {
		@apply relative;
	}

	:global(.glass-searchbar) {
		@apply backdrop-blur-xl bg-white/10 border border-white/20;
		@apply transition-all duration-300;
	}

	:global(.glass-searchbar input) {
		@apply bg-white/5 text-white placeholder-white/50;
		@apply focus:bg-white/10 transition-colors duration-200;
	}

	:global(.glass-searchbar button) {
		@apply text-white/70 hover:text-white transition-colors duration-200;
	}

	.glass-spinner {
		@apply w-5 h-5 border-2 border-white/30 border-t-white rounded-full;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
