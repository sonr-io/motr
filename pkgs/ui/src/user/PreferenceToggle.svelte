<script lang="ts">
	import { List, ListItem, Toggle } from 'konsta/svelte';

	interface Props {
		label: string;
		description?: string;
		icon?: string;
		checked?: boolean;
		onChange?: (checked: boolean) => void | Promise<void>;
		disabled?: boolean;
	}

	let { label, description, icon, checked = $bindable(false), onChange, disabled = false }: Props =
		$props();

	async function handleToggle() {
		if (!disabled) {
			checked = !checked;
			if (onChange) {
				await onChange(checked);
			}
		}
	}
</script>

<List class="glass-preference-list">
	<ListItem title={label} class="glass-preference-item">
		{#snippet media()}
			{#if icon}
				<div class="text-2xl mr-2">
					{icon}
				</div>
			{/if}
		{/snippet}

		{#snippet text()}
			{#if description}
				<div class="text-white/60 text-sm">
					{description}
				</div>
			{/if}
		{/snippet}

		{#snippet after()}
			<Toggle
				bind:checked
				{disabled}
				onChange={handleToggle}
				class="glass-toggle {checked ? 'glass-toggle-checked' : 'glass-toggle-unchecked'}"
			/>
		{/snippet}
	</ListItem>
</List>

<style>
	:global(.glass-preference-list) {
		@apply backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl overflow-hidden;
	}

	:global(.glass-preference-item) {
		@apply bg-transparent border-white/5 text-white;
		@apply transition-colors duration-200;
	}

	:global(.glass-preference-item .item-title) {
		@apply text-white font-medium;
	}

	:global(.glass-toggle) {
		@apply transition-all duration-300;
	}

	:global(.glass-toggle-unchecked) {
		@apply bg-white/20 border-white/30;
	}

	:global(.glass-toggle-checked) {
		@apply bg-white/40 border-white/50;
	}

	:global(.glass-toggle:disabled) {
		@apply opacity-50 cursor-not-allowed;
	}
</style>
