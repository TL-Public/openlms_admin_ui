<script>
	import BrokenLamp from '$lib/svgComponents/BrokenLamp.svelte';
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import { userDetails } from '/src/routes/store.js'
	import { onMount } from 'svelte';

	let isNotFound = $page?.status === 404;
	let errorTitle = isNotFound ? "Page Not Found" : "Unexpected Error Occured";

	onMount(() => {
		if (browser) {
			userDetails?.set($page.data?.user);
		}
	});
</script>

<div class="flex items-center justify-center px-4 pt-0 mt-0">
	<div class="flex flex-row items-center space-y-8 md:space-y-0 md:space-x-12 gap-6">
		<BrokenLamp addClass="h-40 md:h-64 w-auto" />
		<div class="text-center md:text-left">
			<h1 class="text-6xl md:text-8xl font-bold text-primary mb-2">
				{$page?.status ?? 500}
			</h1>
			<h2 class="text-xl md:text-2xl font-semibold text-primary mb-6">
				{errorTitle}
			</h2>
			<a href="/" class="text-sm rounded-md font-semibold text-white bg-accent px-4 sm:px-6 py-2">
				Go to Home
			</a>
		</div>
	</div>
</div>