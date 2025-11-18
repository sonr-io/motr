import konstaConfig from 'konsta/config';

/** @type {import('tailwindcss').Config} */
export default konstaConfig({
	content: ['./src/**/*.{html,js,svelte,ts}', '../../node_modules/konsta/svelte/**/*.{js,svelte}'],
	darkMode: 'class',
	theme: {
		extend: {
			fontFamily: {
				sans: ['Roboto', 'system-ui', 'sans-serif']
			}
		}
	}
});
