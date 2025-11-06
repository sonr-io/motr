<script lang="ts">
	interface Props {
		title: string;
		subtitle?: string;
		logo?: string;
		animated?: boolean;
	}

	let { title, subtitle, logo, animated = true }: Props = $props();
</script>

<div class="glass-welcome-header {animated ? 'animated' : ''}">
	{#if logo}
		<div class="glass-logo-container mb-6">
			<img src={logo} alt="Logo" class="w-24 h-24 object-contain" />
		</div>
	{/if}

	<h1 class="text-white text-4xl md:text-5xl font-bold mb-4 text-center">{title}</h1>

	{#if subtitle}
		<p class="text-white/70 text-lg md:text-xl text-center max-w-2xl mx-auto">{subtitle}</p>
	{/if}
</div>

<style>
	.glass-welcome-header {
		@apply backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl;
		@apply rounded-3xl p-8 md:p-12 text-center;
	}

	.glass-logo-container {
		@apply backdrop-blur-md bg-white/10 border border-white/20 rounded-full;
		@apply w-32 h-32 mx-auto flex items-center justify-center p-4;
	}

	.animated {
		animation: fadeInUp 0.8s ease-out;
	}

	@keyframes fadeInUp {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
