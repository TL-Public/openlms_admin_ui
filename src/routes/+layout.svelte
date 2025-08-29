<script>
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import '../app.css';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { navigating } from '$app/stores';
	import WormLoader from '$lib/components/WormLoader.svelte';
	import BreadCrumbs from '$lib/components/BreadCrumbs.svelte';
	import {showLoadingSpinner} from '/src/routes/store.js'
	import Spinner from '$lib/components/Spinner.svelte';
	import HeaderOLMS from '$lib/components/edureach/HeaderOLMS.svelte';
	import FooterOLMS from '$lib/components/edureach/FooterOLMS.svelte';

	export let data

	let {openLMS} = data;


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
{#if !openLMS}
	<Header />
{:else}
<HeaderOLMS />
{/if}
{/if}
<main class="flex min-h-screen bg-gray-5 overflow-x-hidden">
	{#if $showLoadingSpinner === true}
	<Spinner size={48} overlay={true} color={'#206FC9'}/>
	{/if}
	
	{#if route !== '/login'}
		<Sidebar route={$page.route.id} />

		<section class="w-full max-w-full 2xl:max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 my-8">
			<div class="mb-4 md:mb-8">
				<BreadCrumbs
					route={$page.route.id}
					params={$page.params}
					searchParams={$page.url.searchParams.toString()}
				/>
			</div>
			<slot />
		</section>
	{:else}
		<slot />
	{/if}
</main>
{#if !openLMS}
<Footer />
{:else}
<FooterOLMS />
{/if}
