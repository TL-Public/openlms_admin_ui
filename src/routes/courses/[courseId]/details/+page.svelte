<script>
	import { page } from '$app/stores';
	import { onDestroy, onMount } from 'svelte';
	import { String_Constants } from '/src/config/constants.js';
	import { chapterSuccessMessage, chapterErrorMessage } from '/src/routes/courses/courseStore.js';
	import { message } from '/src/routes/courses/courseStore.js';
	import CourseDetailsOverview from '$lib/courses/courseDetails/CourseDetailsOverview.svelte';
	import CourseDetailsFilters from '$lib/courses/courseDetails/CourseDetailsFilters.svelte';
	import SyllabusSection from '$lib/courses/courseDetails/SyllabusSection.svelte';
	import ErrorMessage from '$lib/components/ErrorMessage.svelte';
	import ChaptersListing from '$lib/courses/courseDetails/ChaptersListing.svelte';
	import SuccessMessage from '$lib/components/SuccessMessage.svelte';
	import FilterComponent from '$lib/components/FilterComponent.svelte';

	export let data;

	let { stateData, videosData, courseDetailsData, coursesData } = data;
	let showHorizontalLine = videosData?.data?.length > 0 ? true : false;
	let coursesList = [];
	let filterOptions = [];
	let genderData = [
		{ id: '1', name: 'Female' },
		{ id: '2', name: 'Male' },
		{ id: '3', name: 'Trans Gender' }
	];
	let courseTitle = '';

	$: error = courseDetailsData?.error ? courseDetailsData?.error : '';

	$: if (!coursesData?.error) {
		coursesList = coursesData?.flatMap((course) => {
			if (!course.uuid || !course?.translations) return []; // Return early if uuid is missing
			return course?.translations
				.filter((translation) => translation?.languageCode === 'en')
				.map((translation) => ({
					name: translation?.title,
					id: course?.uuid,
					videos: course?.videos,
					chapters: course?.chapters
				}));
		});
	}

	$: if (!courseDetailsData?.error) {
		if (courseDetailsData?.translations) {
			const course =
				courseDetailsData?.translations?.find((item) => item?.languageCode === 'en') || {};
			courseTitle = course.title ? course.title : '';
		}
	}

	// Preparing the states data for the filter component
	$: {
		if (stateData && !stateData.error) {
			let formattedFilterArray = [];
			let formattedFilterValues = stateData?.map((item) => {
				let object = {
					id: item?.uuid,
					name: item?.title
				};
				if (Number(item?.uuid) !== 0) {
					formattedFilterArray.push(object);
				}
			});
			filterOptions = [
				{
					filterName: 'States',
					filterValue: formattedFilterArray
				}
			];
		}
		if (genderData) {
			filterOptions.push({
				filterName: 'Gender',
				filterValue: genderData
			});
		}
	}

	function handleSuccesMessageClose(e) {
		message.set('');
	}

	async function handleFilterApplied(event) {
		// extracting the filter values from the event
		let stateFilter = event.detail.stateFilter;

		let courses = [];
		// The filter logic is not finalised, the code will be added accordingly
		// 	if (rsetiFilter === String_Constants.ALL_COURSES) {
		// 		courses=coursesData;
		// 	} else {
		// 	loading = false;
		// }
	}

	onMount(() => {
		chapterSuccessMessage.set('');
	});

	onDestroy(() => {
		message.set('');
	});
</script>

<div class="mb-2">
	{#if $message}
		<SuccessMessage
			successMessage={$message}
			on:handleSuccessMessageClose={handleSuccesMessageClose}
		/>
	{/if}
</div>

<div class=" flex justify-between items-end mb-4 gap-4 flex-nowrap">
	<h1 class="mb-2 font-semibold text-primary">Course Details</h1>

	<FilterComponent on:filterApplied={handleFilterApplied} {filterOptions}>
		<span slot="btnContent" class="flex gap-2 items-center">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="20"
				height="20"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				class="feather feather-filter w-4 h-4"
				><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg
			> <span class="hidden sm:block text-sm">Stats Filter</span>
		</span>
	</FilterComponent>
</div>
{#if !error}
	<div class="">
		<CourseDetailsOverview courseData={courseDetailsData} {showHorizontalLine} />
	</div>
	<div class=" mt-8 mb-12">
		<!-- <hr class="my-8 horizontal-line" /> -->
		<ChaptersListing
			courseCode={courseDetailsData?.courseCode}
			chaptersData={courseDetailsData?.chapters}
			courseUuid={courseDetailsData?.uuid}
			{coursesList}
			{courseTitle}
		/>
	</div>
{:else}
	<ErrorMessage {error} />
{/if}
