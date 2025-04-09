<script>
	import { page } from '$app/stores';
    import AddTraineeTestimonialForm from '$lib/traineeTestimonials/add/AddTraineeTestimonialForm.svelte';

	export let data;
    let {coursesData} = data

    $: coursesList = coursesData?.flatMap((course) => {
		if (!course.uuid) return []; // Return early if uuid is missing
		return course.translations
			.filter((translation) => translation.languageCode === 'en')
			.map((translation) => ({
				name: translation.title,
				id: course.uuid,

			}));
	});

</script>

<AddTraineeTestimonialForm route={$page.route.id} params={$page.params} {coursesList}/>
