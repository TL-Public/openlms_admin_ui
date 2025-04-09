<script>
	import AddCourseForm from '$lib/courses/addCourse/AddCourseForm.svelte';
	import { page } from '$app/stores';

	export let data;
	
</script>

<AddCourseForm route={$page.route.id} params={$page.params}/>
