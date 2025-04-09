<script>
	import { page } from '$app/stores';
	import ReviewForm from '$lib/components/ReviewForm.svelte';
	import { months } from '$lib/data.js';
	import { message } from '/src/routes/trainingCenters/tcStore.js';
	import SuccessMessage from '$lib/components/SuccessMessage.svelte';
	import { onDestroy } from 'svelte';
	import { combineErrorMessages } from '$lib/utils/helper.js';
	import SubmissionErrorMessage from '$lib/components/SubmissionErrorMessage.svelte';
	import ErrorMessage from '$lib/components/ErrorMessage.svelte';

	let courseDataJson = JSON.parse($page.url.searchParams.get('data'));

	const coursesData = !$page?.data?.coursesData?.error ? $page?.data?.coursesData : [];

	//primary data is the most important data on the page. Error in loading this data means, the page itself will be shown as an error page
	$: primaryDataError = courseDataJson
		? ''
		: 'Something went wrong. Please go back and select the Course again.';

	//data other than primary data is considered secondary errors - shown at top of the page.
	$: secondaryErrors = combineErrorMessages($page?.data?.coursesData?.error);

	let coursename = '';
	const courseTranslation = coursesData?.find(
		(t) => t.uuid?.toLowerCase().trim() === courseDataJson?.courseUuid?.toLowerCase().trim()
	)?.translations;

	if (courseTranslation) {
		coursename = courseTranslation?.find((t) => t.languageCode == 'en')?.title;
	}

	function formatDate(dateString) {
		if (typeof dateString !== 'string') return '';
		const [month, year] = dateString.split('/') || dateString.split('-');
		const monthName = months[month - 1];
		return `${monthName}-${year}`;
	}

	function handleSuccesMessageClose(e) {
		message.set('');
	}

	onDestroy(() => {
		message.set('');
	});
</script>

{#if $message}
	<SuccessMessage
		successMessage={$message}
		on:handleSuccessMessageClose={handleSuccesMessageClose}
	/>
{/if}

{#if secondaryErrors}
	<div class=" mb-4">
		<SubmissionErrorMessage errorMessage={secondaryErrors} />
	</div>
{/if}

<h2 class="heading-L mb-4">Training Course Details</h2>

{#if !primaryDataError}
	<div class="mb-2 lg:mb-4 w-full">
		<ReviewForm>
			<div class="flex flex-col gap-2 form">
				<div>
					<!-- <div class="text-base font-semibold"></div> -->
					<h1 class="heading-L mb-2">Course : {coursename}</h1>
				</div>
				<div class="text-sm">
					<span class="label">Start month : </span>{formatDate(courseDataJson.startDate)}
				</div>

				<div class="text-sm">
					<span class="label">End month : </span>{formatDate(courseDataJson.endDate)}
				</div>
			</div>
		</ReviewForm>
	</div>
{:else}
	<ErrorMessage error={primaryDataError} />
{/if}
