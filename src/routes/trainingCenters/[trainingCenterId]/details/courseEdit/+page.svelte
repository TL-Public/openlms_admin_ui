<script>
	import InputField from '$lib/components/InputField.svelte';
	import Filter from '$lib/components/Filter.svelte';
	import { page } from '$app/stores';
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { message } from '/src/routes/trainingCenters/tcStore.js';
	import Button from '$lib/components/Button.svelte';
	import AddCourseToTcForm from '$lib/trainingCenters/tcDetails/tcCourses/AddCourseToTCForm.svelte';
	import { combineErrorMessages } from '$lib/utils/helper.js';
	import SubmissionErrorMessage from '$lib/components/SubmissionErrorMessage.svelte';
	import ErrorMessage from '$lib/components/ErrorMessage.svelte';

	export let data;
	const { courseList } = data;

	const tcDataJSON = $page.url.searchParams.get('data');
	let datafromParams = JSON.parse(tcDataJSON);

	let courseName = datafromParams.name || '-';
	let startDate = '';
	let endDate = '';
	let formObject = {};
	const method = 'PUT';

	$: primaryDataError = tcDataJSON
		? ''
		: 'Something went wrong. Please go back and select the Training center again';

	$: secondaryErrors = combineErrorMessages(courseList?.error);

	if (datafromParams.startDate && datafromParams.endDate) {
		const [startMonth, startYear] = datafromParams.startDate.split(' / ');
		const [endMonth, endYear] = datafromParams.endDate.split(' / ');

		startDate = `${startYear}-${startMonth.padStart(2, '0')}`;
		endDate = `${endYear}-${endMonth.padStart(2, '0')}`;
	}

	$: if (datafromParams) {
		formObject = {
			courseUuid: datafromParams?.courseUuid,
			rsetiCourseuuid: datafromParams?.rsetiCourseuuid,
			startDate: datafromParams?.startDate,
			endDate: datafromParams?.endDate
		};
	}
</script>

{#if secondaryErrors}
	<div class=" mb-4">
		<SubmissionErrorMessage errorMessage={secondaryErrors} />
	</div>
{/if}

{#if primaryDataError}
	<div class=" mb-4">
		<ErrorMessage error={primaryDataError} />
	</div>
{:else}
	<AddCourseToTcForm {formObject} {method} {data} />
{/if}
