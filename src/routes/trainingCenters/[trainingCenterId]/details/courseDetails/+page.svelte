<script>
	import { page } from '$app/stores';
	import ReviewForm from '$lib/components/ReviewForm.svelte';
	import { months } from '$lib/data.js';
	import { message } from '/src/routes/trainingCenters/tcStore.js';
	import SuccessMessage from '$lib/components/SuccessMessage.svelte';
	import { onDestroy } from 'svelte';


	let courseDataJson = JSON.parse($page.url.searchParams.get('data'));
	const coursesData = $page.data.coursesData;

	let coursename = '';
	const courseTranslation = coursesData.find(
		(t) => t.uuid?.toLowerCase().trim() === courseDataJson?.courseUuid?.toLowerCase().trim()
	)?.translations;

	if (courseTranslation) {
		coursename = courseTranslation?.find((t) => t.languageCode == 'en')?.title;
	}

	function formatDate(dateString) {
		if (typeof dateString !== 'string') return '';
		const [month, year] = dateString.split('/')||dateString.split('-');
		const monthName = months[month - 1];
		return `${monthName}-${year}`;
	}

	function handleSuccesMessageClose(e) {
		message.set('');
	}
	
	onDestroy(()=>{
		message.set('')
	})
</script>
{#if $message}
	<SuccessMessage
		successMessage={$message}
		on:handleSuccessMessageClose={handleSuccesMessageClose}
	/>
{/if}
<h2 class="heading-L mb-4">Training Course Details</h2>

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
