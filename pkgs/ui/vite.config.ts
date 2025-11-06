import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
	plugins: [
		svelte(),
		dts({
			include: ['src/**/*.ts', 'src/**/*.svelte'],
			exclude: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
			insertTypesEntry: true
		})
	],
	build: {
		lib: {
			entry: {
				index: resolve(__dirname, 'src/index.ts'),
				'auth/index': resolve(__dirname, 'src/auth/index.ts'),
				'payment/index': resolve(__dirname, 'src/payment/index.ts'),
				'search/index': resolve(__dirname, 'src/search/index.ts'),
				'user/index': resolve(__dirname, 'src/user/index.ts'),
				'welcome/index': resolve(__dirname, 'src/welcome/index.ts')
			},
			formats: ['es']
		},
		rollupOptions: {
			external: ['svelte', 'svelte/internal', 'konsta']
		}
	}
});
