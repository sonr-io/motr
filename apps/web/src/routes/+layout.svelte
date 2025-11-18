<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { App } from 'konsta/svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<meta name="apple-mobile-web-app-capable" content="yes" />
	<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
	<meta name="theme-color" content="#007aff" />
</svelte:head>

<App theme="ios" dark={false} safeAreas={true}>
	{@render children()}
</App>
