<script>
	import { createEventDispatcher } from 'svelte';
	import ReapLogo from '$lib/svgComponents/ReapLogo.svelte';
	import ReapLogoMobile from '$lib/svgComponents/ReapLogoMobile.svelte';
	import MenuSmallScreen from '$lib/menuForMobile/MenuSmallScreen.svelte';
	import { goto } from '$app/navigation';
	import { userDetails } from '/src/routes/store.js';
	import Button from '$lib/components/Button.svelte';
	import { onMount, onDestroy } from 'svelte';

	let dispatch = createEventDispatcher();
	let loggedIn = true;
	let burgerMenuOpen = false;
	let menuItemClicked = false;
	let showProfilePopup = false
	let profileRef;

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

	function handleClickOutside(event) {
		if (profileRef && !profileRef.contains(event.target)) {
			showProfilePopup = false;
		}
	}

	onMount(() => {
		if (typeof window !== 'undefined') {
			document.addEventListener('click', handleClickOutside);
		}
	});

	onDestroy(() => {
		if (typeof window !== 'undefined') {
			document.removeEventListener('click', handleClickOutside);
		}
	});

</script>

<header
	class=" h-16 sticky top-0 sm:h-20 py-2 px-4 flex justify-between lg:py-2 lg:px-20 items-center bg-offwhite text-darkGray shadow-md w-full z-10"
>
	<div on:click={handleLogoClick}>
		<a href="/">
			<span class="sr-only">Edureach Logo</span>

			<h1 class="flex items-center justify-center ">
			<img src="/eduReachSmallLogo.svg" alt="" class="h-6 md:h-6 lg:h-8 ">
			</h1>
		</a>
	</div>
	<!-- Desktop Header Menu Items -->
	<div class="hidden md:flex justify-between gap-8">
		<ul class="flex gap-1 lg:gap-4 text-sm">
			<!-- <li class="p-2"><a href="#" on:click={logout}>{loggedIn ? 'Logout' : 'Login'}</a></li> -->
			{#if loggedIn}
			<li class="relative">
			<button
				class="flex items-center gap-2 justify-center cursor-pointer"
				on:click|stopPropagation={() => (showProfilePopup = !showProfilePopup)}
			>
				<div
					class="flex items-center justify-center w-8 h-8 bg-secondary font-medium text-white capitalize text-xl rounded-full leading-none m-0 p-0"
				>
					{$userDetails?.name ? $userDetails.name[0] : ''}
				</div>
			</button>
			{#if showProfilePopup}
				<div
					bind:this={profileRef}
					class="absolute right-0 top-16 z-10 min-w-48  p-4 origin-top-right rounded-md bg-white shadow-md ring-1 ring-black ring-opacity-5 focus:outline-none transition ease-out duration-100"
					role="menu"
					aria-orientation="vertical"
					aria-labelledby="menu-button"
					tabindex="-1"
				>
					<div class="flex flex-col text-left items-center">
						<span class="text-sm font-medium flex gap-2 mb-4">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="1.5"
								stroke="currentColor"
								class=" w-1/5"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
								/>
							</svg>
							<span class="w-4/5 text-md ">
								{$userDetails.name ? $userDetails.name : ''}

							</span>
						</span>
						
					</div>
					<a href="/userProfile" class=" text-sm text-center pb-2 text-blue-600 underline hover:text-blue-800 flex justify-center ">View Profile</a>
					<Button customClass={'w-full'} on:click={logout}>Logout</Button>
				</div>
			{/if}
			</li>
			{/if}
		</ul>

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
