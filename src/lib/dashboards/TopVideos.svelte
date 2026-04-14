<script>
	import VideoPodSmall from '$lib/components/VideoPodSmall.svelte';
	import CardHeader from '$lib/dashboards/CardHeader.svelte';
	import VideoPodSkeleton from '$lib/components/VideoPodSmallSkeleton.svelte';
	import ErrorMessage from '$lib/components/ErrorMessage.svelte';
	import { onMount, onDestroy, tick } from 'svelte';
	import { debounce } from '$lib/utils/dashboard/helper.js';
	import { handleRedirection } from '$lib/utils/helper.js';
	import { page } from '$app/stores';

	export let filters = [];
	export let selectedGlobalFilters = {};

	let videos = [];
	let loading = true;
	let error = null;
	let dummyVideoPodDetails = new Array(6);
	let currentAbortController = null;

	const defaultVisible = 6;
	let showAll = false;

	let widgetFilters = {};

	const debouncedFetchTopVideos = debounce((filters) => {
		// Cancel any ongoing request
		if (currentAbortController) {
			currentAbortController.abort();
		}
		
		// Create new AbortController
		currentAbortController = new AbortController();
		
		// Fetch data with abort signal
		fetchTopVideos(filters, currentAbortController.signal);
	}, 300); 

	$: {
		debouncedFetchTopVideos({ ...selectedGlobalFilters, ...widgetFilters });
	}

	async function handleFilterChange(event) {
		widgetFilters = event.detail;
	}

	// ----------------------------------- Fetch Top Videos with Analytics API ------------------------------------------

	async function fetchTopVideos(selectedFilters = {}, signal = null) {
		loading = true;
		error = null;

		try {
			const queryParams = new URLSearchParams();
			
			queryParams.append('limit', '10');

			if (selectedFilters?.States?.id && selectedFilters.States.id !== 'all') {
				queryParams.append('state', selectedFilters.States.isoCode);
			}
			if (selectedFilters?.RSETI?.extId) {
				queryParams.append('rseti', selectedFilters.RSETI.extId);
			}
			if (selectedFilters?.course?.courseCode) {
				queryParams.append('course', selectedFilters.course.courseCode);
			}
			if (selectedFilters?.gender?.id) {
				queryParams.append('gender', selectedFilters.gender.id);
			}

			const response = await fetch(`/apis/analytics/videos/popularity?${queryParams.toString()}`, {
				signal
			});

			// console.log('Top videos response:', response);

			if (!response.ok) {
				if(response.status === 401) {
					handleRedirection(response?.status, $page.url.pathname, $page.url.search);
				}
				throw new Error(`Failed to fetch top videos. Status: ${response.status}`);
			}

			const result = await response.json();
			// console.log('Top videos result:', result);

			if (!result.success) {
				throw new Error(result.error || 'Failed to fetch top videos');
			}

			const topVideos = result.data?.topVideos || [];
			

			videos = topVideos.map(video => ({
				uuid: video.videoUuid,
				name: video.videoName || 'Untitled Video',
				courseCode: video.courseCode,
				totalViews: video.totalViews,
				totalWatchtime: video.totalWatchtime,
				rank: video.rank,
				thumbnail: video.thumbnail || null, 
				description: video.description || null,
				duration: null
			}));

			showAll = false;
			
			// Wait for DOM to update before setting loading to false
			await tick();
			loading = false;
		} catch (err) {
			// Don't set error if request was aborted
			if (err.name === 'AbortError') {
				// console.log('Top videos request was aborted');
				return;
			}
			console.error('Error fetching top videos:', err);
			error = err.message || 'Failed to load top videos. Please try again.';
			await tick();
			loading = false;
		}
	}

	// ------------------------------ Life cycle Function ------------------------------------

	onMount(async () => {
		currentAbortController = new AbortController();
		await fetchTopVideos({}, currentAbortController.signal);
	});

	onDestroy(() => {
		if (currentAbortController) {
			currentAbortController.abort();
		}
	});
</script>

<div class="bg-white w-full flex flex-col p-4 md:p-6 rounded-lg shadow-sm">
	<div class="mb-4 sm:mb-8">
		<CardHeader
			title="Top Videos"
			subtitle="Based on views"
			showFilters={true}
			{filters}
			{selectedGlobalFilters}
			on:filterChange={handleFilterChange}
		/>
	</div>

	<!-- Video Grid with Loading and Error States -->
	<div class="grid grid-cols-1 sm:grid-cols-2 bp-900px:grid-cols-1 xl:grid-cols-2 gap-4">
		{#if loading}
			{#each dummyVideoPodDetails as videoPod, index (index)}
				<VideoPodSkeleton />
			{/each}
		{:else if error}
			<div class="col-span-2 text-center text-darkGray text-sm py-8">
				<ErrorMessage {error} />
			</div>
		{:else if !loading && videos.length === 0}
			<div class="col-span-2 text-center text-darkGray text-sm py-8">
				<ErrorMessage error={'No data available.'} />
			</div>
		{:else}
			{#each showAll ? videos : videos.slice(0, defaultVisible) as video (video.uuid)}
				<VideoPodSmall {video} showDeleteIcon={false} showEditIcon={false} sizeSmall={true} />
			{/each}
		{/if}
	</div>
	<!-- Show More / Show Less button -->
	{#if !loading && !error && videos.length > defaultVisible}
		<div class="mt-4 flex justify-center">
			<button class="text-blue-400 text-sm hover:underline" on:click={() => (showAll = !showAll)}>
				{showAll ? 'See Less' : 'See More'}
			</button>
		</div>
	{/if}
</div>
