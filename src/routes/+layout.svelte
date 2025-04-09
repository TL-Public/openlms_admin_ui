<script>
	import { page } from '$app/stores';
	import {browser} from '$app/environment'
	import Sidebar from '$lib/components/Sidebar.svelte';
	import '../app.css';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import LoginPopup from '$lib/components/LoginPopup.svelte';
	import { navigating } from '$app/stores';
	import { tokenExpired } from '/src/stores/store.js';
	import WormLoader from '$lib/components/WormLoader.svelte';
	import BreadCrumbs from '$lib/components/BreadCrumbs.svelte';

	// varibale to track loading state
	let loading = false;
	$: loading = !!$navigating;

	// check which route we are on
	$: route = $page.url.pathname;
	const routesWithoutHeader = ['/login'];
</script>

<!-- Componet to render when loading state is true -->

{#if loading}
	<WormLoader />
{/if}

{#if !routesWithoutHeader.includes(route)}
	<Header />
{/if}
<main class="flex min-h-screen bg-gray-5 overflow-x-hidden">
	{#if $tokenExpired}
		<LoginPopup />
	{/if}
	{#if route !== '/login'}
		<Sidebar route={$page.route.id} />

		<section class="w-full max-w-full 2xl:max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 my-8">
			<div class="mb-4 md:mb-8">
				<BreadCrumbs route={$page.route.id} params={$page.params} searchParams={$page.url.searchParams.toString()} />
			</div>
			<slot />
		</section>
	{:else}
		<slot />
	{/if}
</main>
<Footer />
