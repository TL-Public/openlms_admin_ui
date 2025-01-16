import adapter from 'amplify-adapter';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import path from 'path';
/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter(),
		alias: {
			$config: path.resolve('./src/config')
		}
	},
	preprocess: vitePreprocess()
};
export default config;
