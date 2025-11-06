<script lang="ts">
	import { Page, Navbar, Block, Button, Card } from 'konsta/svelte';
</script>

<Page>
	<Navbar title="Sonr" />
	<Block>
		<Card>
			<h1 class="text-2xl font-bold mb-4">Welcome to Sonr</h1>
			<p class="mb-4">
				This is a SvelteKit application with Konsta UI components.
			</p>
			<Button>Get Started</Button>
		</Card>
	</Block>
</Page>
