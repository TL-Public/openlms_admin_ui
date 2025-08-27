<script>
	import AddTraineeToACourseForm from '$lib/trainees/addTraineeToACourse/AddTraineeToACourseForm.svelte';
	import { page } from '$app/stores';
	import ErrorMessage from '$lib/components/ErrorMessage.svelte';
	import { onDestroy } from 'svelte';
	import { message } from '/src/routes/trainees/traineeStore.js';
	import { combineErrorMessages } from '$lib/utils/helper.js';
	import SubmissionErrorMessage from '$lib/components/SubmissionErrorMessage.svelte';

	export let data;
	let { coursesData, rsetiData, traineeDetailsData } = data;
	let rsetiList = [];

	$: primaryDataError = traineeDetailsData?.error ? traineeDetailsData?.error : '';
	$: secondaryErrors = combineErrorMessages(coursesData?.error, rsetiData?.error);

	$: if (!rsetiData?.error) {
		rsetiList =
			rsetiData?.map((rseti) => {
				if (!rseti?.uuid || rseti?.uuid === '0') return null;
				const enTranslation = rseti?.translations?.find(t => t?.languageCode === 'en');
				if (!enTranslation) return null;
				return {
					name: enTranslation?.name,
					id: rseti?.uuid
				};
			}).filter(Boolean) || [];
	}
</script>

{#if secondaryErrors}
	<div class="mb-4">
		<SubmissionErrorMessage errorMessage={secondaryErrors} />
	</div>
{/if}
{#if !primaryDataError}
	<AddTraineeToACourseForm {rsetiList} {coursesData} {traineeDetailsData} route={$page.route.id} />
{:else}
	<ErrorMessage errorMessage={'Failed to fetch trainee details'} />
{/if}
