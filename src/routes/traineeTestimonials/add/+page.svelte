<script>
	import { page } from '$app/stores';
	import AddTraineeTestimonialForm from '$lib/traineeTestimonials/add/AddTraineeTestimonialForm.svelte';
	import { combineErrorMessages } from '$lib/utils/helper.js';
	import SubmissionErrorMessage from '$lib/components/SubmissionErrorMessage.svelte';

	export let data;
	let { coursesData } = data;
	let coursesList = [];

	//data other than primary data is considered secondary errors - shown at top of the page.
	$: secondaryErrors = combineErrorMessages(coursesData?.error);

	$: if (!coursesData.error) {
		coursesList =
			coursesData?.flatMap((course) => {
				if (!course.uuid || !course.translations) return []; // Return early if uuid is missing
				return course?.translations
					.filter((translation) => translation?.languageCode === 'en' && translation?.title)
					.map((translation) => ({
						name: translation?.title,
						id: course?.uuid
					}));
			}) || [];
	}
</script>

{#if secondaryErrors}
	<div class=" mb-4">
		<SubmissionErrorMessage errorMessage={secondaryErrors} />
	</div>
{/if}
<AddTraineeTestimonialForm route={$page.route.id} params={$page.params} {coursesList} />
