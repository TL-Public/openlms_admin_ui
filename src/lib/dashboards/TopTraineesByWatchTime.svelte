<script>
	import { onMount, onDestroy, tick } from 'svelte';
	import DataCard from '$lib/dashboards/DataCard.svelte';
	import { debounce } from '$lib/utils/dashboard/helper.js';
	import { handleRedirection } from '$lib/utils/helper.js';
	import { page } from '$app/stores';

	export let selectedGlobalFilters = {};

	let data = [];
	let loading = true;
	let error = null;
	let currentAbortController = null;

	const debouncedFetchTopTrainees = debounce((globalFilters) => {
		// Cancel any ongoing request
		if (currentAbortController) {
			currentAbortController.abort();
		}

		// Create new AbortController
		currentAbortController = new AbortController();

		// Fetch data with abort signal
		fetchTopTrainees(globalFilters, currentAbortController.signal);
	}, 300);

	$: {
		debouncedFetchTopTrainees(selectedGlobalFilters);
	}

	// ------------------------------- Fetch Top Trainees by Watch Time -----------------------------------
	async function fetchTopTrainees(globalFilters, signal = null) {
		try {
			loading = true;
			error = null;
			const queryParams = new URLSearchParams();

			queryParams.append('limit', '5');


			const response = await fetch(
				`/apis/analytics/trainees/topByWatchTime?${queryParams.toString()}`
			);

			// console.log('Top Trainees by Watch Time response:', response);

			if (!response.ok) {
				if(response.status === 401) {
					handleRedirection(response?.status, $page.url.pathname, $page.url.search);
				}
				throw new Error(`Failed to fetch top trainees. Status: ${response.status}`);
			}

			const result = await response.json();

			// console.log('Top Trainees by Watch Time result:', result);

			if (!result.success) {
				throw new Error(result.error || 'Failed to fetch top trainees data');
			}

			const topTrainees = result.data?.topTrainees || [];

			// Transform API data to DataCard format
			data = topTrainees.map((trainee) => {
				// Convert seconds to hours and round to 1 decimal place
				const watchTimeHours = trainee.totalWatchtime ? (trainee.totalWatchtime / 3600).toFixed(1) : '0.0';
				
				return {
					title: trainee.traineeName || 'Unknown Trainee',
					subtitle: trainee.videosWatched ? `Videos watched: ${trainee.videosWatched}` : 'No videos watched',
					value: watchTimeHours,
					rank: trainee.rank || 0,
					// Add additional properties
					id: trainee.traineeId,
					totalWatchtimeSeconds: trainee.totalWatchtime || 0,
					videosWatched: trainee.videosWatched || 0
				};
			});

			await tick();
			loading = false;
		} catch (err) {
			console.error('Error fetching top trainees by watch time:', err);
			
			if (err.name === 'AbortError') {
				return;
			}

			error = err.message || 'Failed to load top trainees data';
			await tick();
			loading = false;
			data = [];
		}
	}

	onDestroy(() => {
		if (currentAbortController) {
			currentAbortController.abort();
		}
	});

	// Initial load on mount
	onMount(() => {
		fetchTopTrainees({});
	});
</script>

<DataCard
	title="Top Trainees - By Watch Time"
	subtitle="Based on watch time (hrs)"
	{data}
	{loading}
	{error}
	selectedGlobalFilters={selectedGlobalFilters}
/>