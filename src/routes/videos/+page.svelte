<script>
	import { page } from '$app/stores';
	import { String_Constants } from '/src/config/constants.js';
	import { onMount } from 'svelte';
	import Filters from '$lib/states/statesListing/Filters.svelte';
	import VideoListingOverview from '$lib/videos/videoListing/VideoListingOverview.svelte';
	import BreadCrumbs from '$lib/components/BreadCrumbs.svelte';
	import VideoGrid from '$lib/components/VideoGrid.svelte';
	import ErrorMessage from '$lib/components/ErrorMessage.svelte';
	import ErrorMessageComponent from '$lib/components/ErrorMessage.svelte';
	import VideoPodSkeleton from '$lib/components/VideoPodSkeleton.svelte';
	import Button from '$lib/components/Button.svelte';


	export let data;

	let videoList = [];
	let { rsetiData, stateData, coursesData } = data;
	let rsetiFilterValue = String_Constants.ALL_RSETIS;
	let stateFilterValue = String_Constants.ALL_STATES;
	let currentPage = 0;
	const itemsPerPage = 20;
	let totalPages = 0;
	let errorMessage = '';
	let remainingVideosCount = 0;
	let allVideosLoaded = false;
	let hideButton = false;
	let isSubmitting = false;
	let noVideos = false;
	let videosResult = false;
	let loadRemainingVideos = false;
	let filterOptions = [];
	let dummyVideoPodDetails = new Array(4);
	let loadingInVideos = true;
	let coursesList;

	$: if (!coursesData?.error) {
		coursesList = coursesData?.flatMap((course) => {
			if (!course.uuid) return []; // Return early if uuid is missing
			return course.translations
				.filter((translation) => translation.languageCode === 'en')
				.map((translation) => ({
					name: translation.title,
					id: course.uuid,
					courseCode: course?.courseCode,
					videos: course?.videos,
					chapters: course?.chapters
				}));
		});
	}


$:{
	if(coursesList){
	filterOptions = [{
		filterName:'Course',
		filterValue:coursesList
	}]
}
}

	async function handleFilter(event) {
		// extracting the filter values from the event
		let stateFilter = event.detail.stateFilter;
		let rsetiFilter = event.detail.rsetiFilter;

		let courses = [];
		// The filter logic is not finalised, the code will be added accordingly
		// 	if (rsetiFilter === String_Constants.ALL_COURSES) {
		// 		courses=coursesData;
		// 	} else {
		// 	loading = false;
		// }
	}

	// Fetch videos from the API with error handling
	async function fetchVideos() {
		hideButton = false;
		errorMessage = '';
		isSubmitting = true;
		noVideos = false;
		videosResult = false;
		loadingInVideos = true;

		try {
			const response = await fetch(`/apis/videos?page=${currentPage}&size=${itemsPerPage}`);
			if (!response?.ok) {
				throw new Error('Error fetching videos');
			}

			const data = await response.json();
			if (!data?.content || data?.content.length === 0) {
				noVideos = true;
				hideButton = true;
				if (currentPage === 0) {
					errorMessage = 'No videos found.';
				}
				return;
			}

			// Append new videos to the existing list
			videoList = [...videoList, ...data.content];

			totalPages = data.page.totalPages;
			currentPage++;

			// If all pages have been fetched, hide the "Show More" button
			if (currentPage >= totalPages) {
				allVideosLoaded = true;
			}
		} catch (error) {
			console.error('Error fetching videos:', error);

			// If the error occurs, calculate remaining videos
			if (currentPage > 0) {
				loadRemainingVideos = true;
				remainingVideosCount = Math.max(0, totalPages * itemsPerPage - videoList.length);
			} else {
				errorMessage = 'Failed to load videos.';
				hideButton = true;
			}
		} finally {
			isSubmitting = false;
			loadingInVideos = false;
		}
	}

	async function fetchRemainingVideos() {
		loadRemainingVideos = false; // Hide the retry button while fetching
		try {
			await fetchVideos(); // Continue from where it left off
		} catch (error) {
			console.error('Error fetching remaining videos:', error);
		}
	}

	function handleShowMoreButton(e) {
		videosResult = e.detail;
	}

	onMount(() => {
		fetchVideos();
	});
</script>

<!-- <div class="mt-4 mb-4">
	<Filters
		on:handleFilters={handleFilter}
		bind:rsetiFilterValue
		bind:stateFilterValue
		rsetiFilterOptionList={rsetiData}
		stateFilterOptionList={stateData}
	/>
</div> -->

<div class="mb-6 mt-4">
	<VideoListingOverview />
</div>

<hr class="horizontal-line my-8" />


{#if loadingInVideos}
	<div class="grid sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-4 mt-4 mx-6 mb-4">
		{#each dummyVideoPodDetails as videoPod, index (index)}
			<VideoPodSkeleton />
		{/each}
	</div>
{/if}

{#if !loadingInVideos}
	<div class="mt-4 mb-4" class:min-h-40={!noVideos}>
		{#if errorMessage}
			<ErrorMessage error={errorMessage} />
		{:else}
			<VideoGrid
				videos={videoList}
				showModuleFilter={noVideos ? false : true}
				searchValue=""
				showSearchBar={noVideos ? false : true}
				showEditIcon={false}
				showDeleteIcon={false}
				{filterOptions}
				on:handleShowMoreButton={handleShowMoreButton}
			/>
		{/if}
	</div>

	<!-- Show More Button -->
	{#if !videosResult}
		{#if !allVideosLoaded && !hideButton}
			<div
				class="flex justify-center m-8 {loadRemainingVideos && remainingVideosCount > 0
					? 'mb-2'
					: 'mb-8'}"
			>
				<Button
					disabled={isSubmitting}
					on:click={fetchVideos}
				>
					Show More
				</Button>
			</div>
		{:else if allVideosLoaded && !errorMessage}
			<div class="flex justify-center mb-8 text-sm">
				<p class="text-darkGray">All videos have been fetched.</p>
			</div>
		{/if}
	{/if}

	{#if noVideos}
		<ErrorMessageComponent />
	{/if}

	{#if loadRemainingVideos && remainingVideosCount > 0}
		<p class="text-sm text-center mb-4">
			{remainingVideosCount} videos couldn't be loaded.
			<a class=" text-sm text-blue-500 rounded underline" on:click={fetchRemainingVideos}>
				Click here
			</a>to load remaining videos.
		</p>
	{/if}
{/if}
