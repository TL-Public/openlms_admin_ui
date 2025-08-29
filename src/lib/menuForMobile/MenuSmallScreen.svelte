<script>
	import { userDetails } from '/src/routes/store.js';
	import Button from '$lib/components/Button.svelte';
	import { goto } from '$app/navigation';
	import { roles } from '$lib/config.js';
	import { onMount } from 'svelte';
	import { menuItems, rolesWithCentreDetailsLabel, rolesWithStateDetailsLabel } from '$lib/data.js';


	export let burgerMenuOpen;
	export let menuItemClicked;
	export let loggedIn;
	let filteredSidebarList = [];
	let sidebarList = [
		{
			name: 'My Profile',
			link: '/userProfile',
			key: menuItems?.MY_PROFILE
		},
		{
			name: 'Dashboard',
			link: '/dashboard',
			key: menuItems?.DASHBOARD
		},
		{
			name: 'NAR',
			link: '/nar',
			key: menuItems?.NAR
		},
		{
			name: 'States',
			link: '/states',
			key: menuItems?.STATES
		},
		{
			name: 'Training Centers',
			link: '/trainingCenters',
			key: menuItems?.TRAINING_CENTERS
		},
		{
			name: 'Courses',
			link: '/courses',
			key: menuItems?.COURSES
		},
		{
			name: 'Videos',
			link: '/videos',
			key: menuItems?.VIDEOS
		},
		{
			name: 'Users',
			link: '/users',
			key: menuItems?.USERS
		},
		{
			name: 'Trainees',
			link: '/trainees',
			key: menuItems?.TRAINEES
		},
		{
			name: 'FAQs',
			link: '/FAQs',
			key: menuItems?.FAQS
		},
		{
			name: 'Official Testimonials',
			link: '/officialTestimonials',
			key: menuItems?.OFFICIAL_TESTIMONIALS
		},
		{
			name: 'Trainee Testimonials',
			link: '/traineeTestimonials',
			key: menuItems?.TRAINEE_TESTIMONIALS
		},
		{
			name: 'Configurations',
			link: '/config',
			key: menuItems?.CONFIG
		},
		{
			name: 'Upload History',
			link: '/uploadHistory',
			key: menuItems?.UPLOAD_HISTORY
		}
	];

	function handleMenuItemClick() {
		menuItemClicked = true;
		burgerMenuOpen = false;
	}

	async function logout() {

		await fetch('/apis/auth/logout', { method: 'POST' });
		goto('/login');
	}

	// ---------------------------------- Role based functions --------------------------------
	function roleBasedAcessSetting() {
		// Filter the sidebar list by checking if the item's key is not in the restrictedMenuList
		filteredSidebarList = sidebarList?.filter(
			(item) => !roles[$userDetails?.role]?.restrictedMenuList?.includes(item?.key)
		);

		if (rolesWithCentreDetailsLabel?.includes(Number($userDetails?.role))) {
			filteredSidebarList.forEach((item) => {
				if (item?.key === menuItems?.TRAINING_CENTERS) {
					item.name = 'Center Details';
					item.link = `/trainingCenters/${$userDetails?.rsetiId}/details`;
				}
			});
		}

		if (rolesWithStateDetailsLabel?.includes(Number($userDetails?.role))) {
			filteredSidebarList.forEach((item) => {
				if (item?.key === menuItems?.STATES) {
					item.name = 'State Details';
					item.link = `/states/${$userDetails?.stateId}/details`;
				}
			});
		}
	}

	onMount(() => {
		const unsubscribe = userDetails?.subscribe((user) => {
			if (user && Object.keys(user)?.length > 0) {
				roleBasedAcessSetting(user);
			}
		});

		return () => unsubscribe(); // Cleanup subscription
	});
</script>

<!-- Menu items on smaller screen -->

<div
	class=" md:hidden fixed w-72 z-20 mx-0 flow-root h-full bg-white shadow-md transition-all ease-in-out duration-500 border-l overflow-y-auto {burgerMenuOpen
		? 'right-0'
		: '-right-72'}"
>
	<nav class="-my-6 divide-y divide-gray-500/10 bg-white">
		<div class="space-y-2 py-2">
			<ul
				class="flex flex-col items-center gap-2 mt-6 lg:gap-4 text-sm mb-4"
				on:click={handleMenuItemClick}
				on:keypress={handleMenuItemClick}
			>
			{#if $userDetails?.name}
					<li class=" w-full flex gap-4 items-center mt-auto   pt-2 pl-4">
						<div
							class="flex items-center justify-center w-8 h-8 bg-accent font-medium text-white capitalize text-xl rounded-full leading-none m-0 p-0"
						>
							{$userDetails?.name ? $userDetails.name[0] : ''}
						</div>
						<div class="flex flex-col">
							 <span class="font-medium text-base">
								 {$userDetails?.name}
							</span>
							<a href="/userProfile" class=" text-sm pb-2 text-blue-600 underline hover:text-blue-800">View Profile</a>
						</div>
					</li>
					<div class="p-4 pb-6 pt-0 border-b w-full">
						<Button type='submit' customClass={'w-full'} on:click={logout}>Logout</Button>
					</div>
				{/if}
				{#each filteredSidebarList as item, index (index)}
					<li class="w-full p-2 border-b text-center"><a href={item.link}>{item.name}</a></li>
				{/each}
			</ul>
		</div>
	</nav>
</div>
