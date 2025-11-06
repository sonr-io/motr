<script lang="ts">
	import { Card, Button, Stepper } from 'konsta/svelte';

	interface Step {
		id: string;
		title: string;
		description: string;
		icon?: string;
	}

	interface Props {
		steps: Step[];
		currentStep?: number;
		onNext?: () => void | Promise<void>;
		onPrevious?: () => void;
		onSkip?: () => void;
		onComplete?: () => void | Promise<void>;
		loading?: boolean;
	}

	let {
		steps,
		currentStep = $bindable(0),
		onNext,
		onPrevious,
		onSkip,
		onComplete,
		loading = false,
	}: Props = $props();

	const isFirstStep = $derived(currentStep === 0);
	const isLastStep = $derived(currentStep === steps.length - 1);
	const progress = $derived(((currentStep + 1) / steps.length) * 100);

	async function handleNext() {
		if (isLastStep && onComplete) {
			await onComplete();
		} else if (onNext) {
			await onNext();
		}
	}

	function handlePrevious() {
		if (!isFirstStep && onPrevious) {
			onPrevious();
		}
	}

	function handleSkip() {
		if (onSkip) {
			onSkip();
		}
	}
</script>

<Card class="glass-onboarding-card">
	<div class="p-6">
		<!-- Progress bar -->
		<div class="mb-6">
			<div class="glass-progress-bar">
				<div class="glass-progress-fill" style="width: {progress}%"></div>
			</div>
			<div class="flex justify-between mt-2">
				<span class="text-white/60 text-sm">Step {currentStep + 1} of {steps.length}</span>
				<span class="text-white/60 text-sm">{Math.round(progress)}% complete</span>
			</div>
		</div>

		<!-- Current step content -->
		{#if steps[currentStep]}
			<div class="mb-8 text-center">
				{#if steps[currentStep].icon}
					<div class="text-6xl mb-6">{steps[currentStep].icon}</div>
				{/if}

				<h2 class="text-white text-2xl font-bold mb-3">{steps[currentStep].title}</h2>
				<p class="text-white/70 text-base">{steps[currentStep].description}</p>
			</div>
		{/if}

		<!-- Navigation buttons -->
		<div class="flex gap-3">
			{#if !isFirstStep}
				<Button onClick={handlePrevious} outline class="glass-button-outline" disabled={loading}>
					Previous
				</Button>
			{/if}

			<Button onClick={handleNext} class="glass-button flex-1" disabled={loading}>
				{loading ? 'Processing...' : isLastStep ? 'Get Started' : 'Next'}
			</Button>

			{#if !isLastStep && onSkip}
				<Button onClick={handleSkip} clear class="text-white/70 hover:text-white" disabled={loading}>
					Skip
				</Button>
			{/if}
		</div>
	</div>
</Card>

<style>
	:global(.glass-onboarding-card) {
		@apply backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl;
	}

	.glass-progress-bar {
		@apply w-full h-2 backdrop-blur-md bg-white/10 border border-white/20 rounded-full overflow-hidden;
	}

	.glass-progress-fill {
		@apply h-full backdrop-blur-lg bg-white/40 border-r border-white/50;
		@apply transition-all duration-500 ease-out;
	}

	:global(.glass-button) {
		@apply backdrop-blur-lg bg-white/20 hover:bg-white/30 border border-white/30 text-white font-semibold;
		@apply transition-all duration-300 shadow-lg hover:shadow-xl;
	}

	:global(.glass-button:disabled) {
		@apply opacity-50 cursor-not-allowed;
	}

	:global(.glass-button-outline) {
		@apply backdrop-blur-lg bg-white/5 hover:bg-white/15 border border-white/20 text-white;
		@apply transition-all duration-300;
	}
</style>
