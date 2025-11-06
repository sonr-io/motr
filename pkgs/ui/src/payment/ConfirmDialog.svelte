<script lang="ts">
	import { Dialog, DialogButton, Block, List, ListItem } from 'konsta/svelte';

	interface TransactionDetails {
		amount: string;
		currency: string;
		recipient: string;
		fee?: string;
		description?: string;
	}

	interface Props {
		opened: boolean;
		title?: string;
		transaction: TransactionDetails;
		onConfirm?: () => void | Promise<void>;
		onCancel?: () => void;
		loading?: boolean;
	}

	let {
		opened = $bindable(),
		title = 'Confirm Transaction',
		transaction,
		onConfirm,
		onCancel,
		loading = false,
	}: Props = $props();

	async function handleConfirm() {
		if (onConfirm && !loading) {
			await onConfirm();
		}
	}

	function handleCancel() {
		if (onCancel && !loading) {
			onCancel();
		}
		opened = false;
	}

	function formatAmount(amount: string): string {
		const num = parseFloat(amount);
		return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 });
	}

	const totalAmount = $derived(() => {
		const base = parseFloat(transaction.amount);
		const fee = transaction.fee ? parseFloat(transaction.fee) : 0;
		return (base + fee).toFixed(6);
	});
</script>

<Dialog bind:opened class="glass-dialog">
	<div class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6">
		<div class="text-center mb-6">
			<h3 class="text-2xl font-bold text-white mb-2">{title}</h3>
			<p class="text-white/70 text-sm">Review the transaction details below</p>
		</div>

		<Block class="glass-block mb-6">
			<List class="glass-list">
				<ListItem title="Amount" class="glass-list-item">
					<div slot="after" class="text-white font-semibold">
						{formatAmount(transaction.amount)} {transaction.currency}
					</div>
				</ListItem>

				<ListItem title="Recipient" class="glass-list-item">
					<div slot="after" class="text-white/90 font-mono text-sm">
						{transaction.recipient.slice(0, 16)}...
					</div>
				</ListItem>

				{#if transaction.fee}
					<ListItem title="Network Fee" class="glass-list-item">
						<div slot="after" class="text-white/70">
							{formatAmount(transaction.fee)} {transaction.currency}
						</div>
					</ListItem>
				{/if}

				{#if transaction.description}
					<ListItem title="Description" class="glass-list-item">
						<div slot="after" class="text-white/80 text-sm italic">
							{transaction.description}
						</div>
					</ListItem>
				{/if}

				<ListItem title="Total" class="glass-list-item border-t border-white/20 pt-3">
					<div slot="after" class="text-white font-bold text-lg">
						{formatAmount(totalAmount())} {transaction.currency}
					</div>
				</ListItem>
			</List>
		</Block>

		<div class="flex gap-3">
			<DialogButton onClick={handleCancel} class="glass-button-cancel flex-1" disabled={loading}>
				Cancel
			</DialogButton>
			<DialogButton onClick={handleConfirm} class="glass-button-confirm flex-1" disabled={loading}>
				{loading ? 'Processing...' : 'Confirm'}
			</DialogButton>
		</div>
	</div>
</Dialog>

<style>
	:global(.glass-dialog) {
		@apply backdrop-blur-2xl;
	}

	:global(.glass-block) {
		@apply backdrop-blur-lg bg-white/5 rounded-2xl;
	}

	:global(.glass-list) {
		@apply bg-transparent;
	}

	:global(.glass-list-item) {
		@apply bg-white/5 border-white/10 text-white;
		@apply hover:bg-white/10 transition-colors duration-200;
	}

	:global(.glass-button-cancel) {
		@apply backdrop-blur-lg bg-white/10 hover:bg-white/15 border border-white/20 text-white;
		@apply transition-all duration-300;
	}

	:global(.glass-button-confirm) {
		@apply backdrop-blur-lg bg-white/20 hover:bg-white/30 border border-white/30 text-white font-semibold;
		@apply transition-all duration-300 shadow-lg hover:shadow-xl;
	}

	:global(.glass-button-confirm:disabled),
	:global(.glass-button-cancel:disabled) {
		@apply opacity-50 cursor-not-allowed;
	}
</style>
