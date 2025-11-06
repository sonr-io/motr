<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { App } from 'konsta/svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<App theme="material">
	{@render children()}
</App>
