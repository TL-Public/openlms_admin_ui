<script>
	import { createEventDispatcher } from 'svelte';
	import ReapLogo from '$lib/svgComponents/ReapLogo.svelte';
	import ReapLogoMobile from '$lib/svgComponents/ReapLogoMobile.svelte';
	import MenuSmallScreen from '$lib/menuForMobile/MenuSmallScreen.svelte';
	import { goto } from '$app/navigation';

	let dispatch = createEventDispatcher();
	let loggedIn = true;
	let burgerMenuOpen = false;
	let menuItemClicked = false;

	// Dispatcher is created for conditionally hiding the page content when menu is open.(Yet to be implemented)
	function handleClick() {
		menuItemClicked = false;
		burgerMenuOpen = !burgerMenuOpen;
		dispatch('burgerMenuOpen', burgerMenuOpen);
	}

	function handleLogoClick() {
		burgerMenuOpen = false;
	}

	async function logout() {
		await fetch('/apis/auth/logout', { method: 'POST' });
		goto('/login');
	}
</script>

<header
	class=" h-16 sticky top-0 sm:h-20 py-2 px-4 flex justify-between lg:py-2 lg:px-20 items-center bg-ivory text-darkGray shadow-md w-full z-50 "
>
	<div on:click={handleLogoClick}>
		<a href="/">
			<span class="sr-only">Reap Logo</span>
			<div class="hidden sm:block">
				<ReapLogo />
			</div>
			<div class="sm:hidden">
				<ReapLogoMobile />
			</div>
		</a>
	</div>
	<!-- Desktop Header Menu Items -->
	<div class="hidden md:flex justify-between gap-8">
		<ul class="flex gap-1 lg:gap-4 text-sm">
			<li class="p-2"><a href="#" on:click={logout}>{loggedIn ? 'Logout' : 'Login'}</a></li>
		</ul>
		{#if loggedIn}
			<div class="p-2">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="size-6"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
					/>
				</svg>
			</div>
		{/if}
	</div>

	<!-- Mobile Header Button -->

	<div class="md:hidden">
		{#if burgerMenuOpen}
			<!-- Button on Menu open state -->

			<button
				type="button"
				class=" rounded-md text-gray-700 absolute right-4 top-5"
				on:click={handleClick}
			>
				<span class="sr-only">Close menu</span>
				<svg
					class="h-6 w-6"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					aria-hidden="true"
				>
					<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
		{:else}
			<!-- Button on menu closed state -->
			<button
				type="button"
				class=" rounded-md text-gray-700 absolute right-4 top-5"
				on:click={handleClick}
			>
				<span class="sr-only">Open menu</span>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="size-6"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
					/>
				</svg>
			</button>
		{/if}
	</div>
</header>

<!-- Mobile Menu Items -->

<MenuSmallScreen bind:burgerMenuOpen bind:menuItemClicked bind:loggedIn />
