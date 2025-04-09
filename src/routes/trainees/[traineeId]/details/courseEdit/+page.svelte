<script>
	import { page } from '$app/stores';
	import ErrorMessage from '$lib/components/ErrorMessage.svelte';
	import AddTraineeToACourseForm from '$lib/trainees/addTraineeToACourse/AddTraineeToACourseForm.svelte';
	import { onMount } from 'svelte';
	import { combineErrorMessages } from '$lib/utils/helper.js';
	import SubmissionErrorMessage from '$lib/components/SubmissionErrorMessage.svelte';

	export let data;
	let { coursesData, rsetiData, traineeDetailsData } = data;

	let formObject = {};
	let method = 'PUT';

	let traineeDataJSON = $page.url.searchParams.get('data');
	let datafromParams = JSON.parse(traineeDataJSON) || null;
	let rsetiCourseUuid;
	let rsetiCourseName = '';
	let rsetiUuid;
	let rsetiName;
	let rsetiList = [];
	// Have to send the rseto course anme and uuid as an array of object as well other wise searchable combobox wont show value for empty optionslist.
	let coursesList = [];

	$: primaryDataError = datafromParams
		? ''
		: 'Something went wrong. Please go back and select the Trainee again';

	$: secondaryErrors = combineErrorMessages(
		traineeDetailsData?.error,
		coursesData?.error,
		rsetiData?.error
	);

	$: if (!rsetiData?.error) {
		rsetiList = rsetiData?.flatMap((rseti) => {
			if (!rseti?.uuid || rseti?.uuid === '0') return []; // Return early if uuid is missing
			return rseti?.translations
				.filter((translation) => translation?.languageCode === 'en')
				.map((translation) => ({
					name: translation?.name,
					id: rseti?.uuid
				}));
		});
	}

	async function populateCourseEditData() {
		(rsetiCourseUuid = datafromParams?.rsetiCourseUuid || ''),
			(rsetiUuid = datafromParams?.rsetiUuid || ''),
			(rsetiName = datafromParams?.rsetiName || ''),
			(formObject = {
				traineeUuid: datafromParams?.traineeUuid || '',
				enrollmentDate: datafromParams?.enrolledOn || ''
			});

		if (method === 'PUT' && rsetiCourseUuid && rsetiUuid) {
			await fetchRsetiCourseName(rsetiUuid, rsetiCourseUuid);
		} else {
			rsetiCourseName = 'Error fetching course name';
		}
	}

	async function fetchRsetiCourseName(selectedRsetiUuid, selectedRsetiCourseUuid) {
		try {
			const response = await fetch(`/apis/trainingCenters/${selectedRsetiUuid}/courses`, {
				method: 'GET',
				headers: { 'Content-Type': 'application/json' }
			});

			if (!response.ok) {
				throw new Error('Failed to fetch courses of the RSETI');
			}

			const result = await response.json();
			const course = result?.find((c) => c?.uuid === selectedRsetiCourseUuid);

			if (course) {
				const courseDetails = coursesData.find((c) => c?.uuid === course?.courseUuid);
				const englishTranslation = courseDetails?.translations?.find(
					(t) => t?.languageCode === 'en'
				);
				const title = englishTranslation?.title || 'No English Title';

				const formatter = new Intl.DateTimeFormat('en', { month: 'short', year: '2-digit' });
				const from = formatter?.format(new Date(course?.startYear, course?.startMonth - 1));
				const to = formatter?.format(new Date(course?.endYear, course?.endMonth - 1));

				rsetiCourseName = `${title} (${from} - ${to})`;
			} else {
				rsetiCourseName = 'No Course Found';
			}
		} catch (error) {
			console.error(error.message);
			rsetiCourseName = 'Error fetching course name';
		} finally {
			coursesList = [{ id: rsetiCourseUuid, name: rsetiCourseName }];
		}
	}

	onMount(() => {
		if (datafromParams) {
			populateCourseEditData(datafromParams);
		}
	});
</script>

{#if secondaryErrors}
	<div class="mb-4">
		<SubmissionErrorMessage errorMessage={secondaryErrors} />
	</div>
{/if}

{#if !primaryDataError}
	<AddTraineeToACourseForm
		dataToSend={formObject}
		selectedCourseUuid={rsetiCourseUuid}
		selectedRsetiUuid={rsetiUuid}
		selectedRsetiName={rsetiName}
		selectedCourseName={rsetiCourseName}
		{method}
		{traineeDetailsData}
		{rsetiList}
		{coursesList}
	/>
{:else}
	<ErrorMessage error={primaryDataError} />
{/if}
