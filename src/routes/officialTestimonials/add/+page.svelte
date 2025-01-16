<script>
	import { page } from '$app/stores';
	import AddOffTestimonialForm from '$lib/officialTestimonials/AddOffTestimonialForm.svelte';

	export let data;
</script>

<AddOffTestimonialForm route={$page.route.id} params={$page.params} />
