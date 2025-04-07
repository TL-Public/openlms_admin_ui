<script>
	import AddCourseToTcForm from '$lib/trainingCenters/tcDetails/tcCourses/AddCourseToTCForm.svelte';
	import { combineErrorMessages } from '$lib/utils/helper.js';
	import SubmissionErrorMessage from '$lib/components/SubmissionErrorMessage.svelte';
	export let data;
	let { courseList } = data;

	$: secondaryErrors = combineErrorMessages(courseList?.error);
</script>

{#if secondaryErrors}
	<div class=" mb-4">
		<SubmissionErrorMessage errorMessage={secondaryErrors} />
	</div>
{/if}

<AddCourseToTcForm {data} />
