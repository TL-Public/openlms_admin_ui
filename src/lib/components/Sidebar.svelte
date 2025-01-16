<script>
	import GoogleMatrialIcon from './GoogleMatrialIcon.svelte';
	export let route = '';

	// this function checks which of the side bar is currently active
	function compareRouteBase(route1, route2) {
		// remove '/' from the front
		route1 = route1?.slice(1);
		route2 = route2?.slice(1);

		// separeate all using the '/'
		route1 = route1?.split('/');
		route2 = route2?.split('/');

		// compair the first of each array to check if they are same then base route is same
		if (route1?.[0] == route2?.[0]) {
			return true;
		}
		return false;
	}

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

	let sidebarOpen = false;
	function toogleMenu() {
		sidebarOpen = !sidebarOpen;
	}
</script>

<div class="w-1/5 min-w-40 p-4 border-r border-gray-50 md:block hidden bg-sibebarGray">
	{#each sidebarList as item, index (index)}
		<div
			aria-current={compareRouteBase(item.link, route) ? 'page' : undefined}
			class="p-2 hover:bg-gray-10 rounded-md font-medium mb-2 text-primary text-sm 2xl:text-base {compareRouteBase(
				item.link,
				route
			)
				? 'bg-gray-30 font-semibold active-route highlight hover:bg-gray-30'
				: ''}"
		>
			<a href={item.link}>
				<h3>{item.name}</h3>
			</a>
		</div>
	{/each}
</div>

<!-- Hamburger Button -->
<!-- <button class=" bg-white-100 fixed top-20 left-4 border rounded-sm lg:hidden" 
on:click={toogleMenu}>
<GoogleMatrialIcon iconName="menu" addClass="" />
</button>
<div class="fixed inset-0 bg-white-100 z-50 w-72 {sidebarOpen?'left-0':'-left-72'}  transition-all  p-4 border-r border-gray-90 lg:hidden fixed top-0" 

>
<div class="flex justify-end">

    <button 
    on:click={toogleMenu}
    >
    <GoogleMatrialIcon iconName="close" />
</button>
</div>
    {#each sidebarList as item, index (index) }
    <div class="p-2 hover:bg-gray-10 rounded-md">
        <a href={item.link} on:click={toogleMenu}>

            <h3>{item.name}</h3>
        </a>
    </div>    
    {/each}

</div> -->
