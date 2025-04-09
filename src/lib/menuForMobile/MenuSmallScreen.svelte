<script>
	export let burgerMenuOpen;
	export let menuItemClicked;
	export let loggedIn;
	let sidebarList = [
		{
			name: 'Dashboard',
			link: '/dashboard'
		},
		{
			name: 'NAR',
			link: '/nar'
		},
		{
			name: 'States',
			link: '/states'
		},
		{
			name: 'Training Centers',
			link: '/trainingCenters'
		},
		{
			name: 'Courses',
			link: '/courses'
		},
		{
			name: 'Videos',
			link: '/videos'
		},
		{
			name: 'Users',
			link: '/users'
		},
		{
			name: 'Trainees',
			link: '/trainees'
		},
		{
			name: 'FAQs',
			link: '/FAQs'
		},
		{
			name: 'Official Testimonials',
			link: '/officialTestimonials'
		},
		{
			name: 'Trainee Testimonials',
			link: '/traineeTestimonials'
		}
	];

	function handleMenuItemClick() {
		menuItemClicked = true;
		burgerMenuOpen = false;
	}
</script>

<!-- Menu items on smaller screen -->

<div
	class=" md:hidden fixed w-72 z-20 mx-0 flow-root h-full bg-white transition-all ease-in-out duration-500 border-l overflow-y-auto {burgerMenuOpen
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
				{#each sidebarList as item, index (index)}
					<li class="w-full p-2 border-b text-center"><a href={item.link}>{item.name}</a></li>
				{/each}
			</ul>
		</div>
	</nav>
</div>
