<script>
	import { onMount, onDestroy, tick } from 'svelte';
	import DataCard from '$lib/dashboards/DataCard.svelte';
	import { debounce } from '$lib/utils/dashboard/helper.js';
	import { handleRedirection } from '$lib/utils/helper.js';
	import { page } from '$app/stores';

	export let selectedGlobalFilters = {};
	export let minimalStatesData = [];

	let data = [];
	let loading = true;
	let error = null;
	let currentAbortController = null;

	const debouncedFetchTopStates = debounce((globalFilters) => {
		// Cancel any ongoing request
		if (currentAbortController) {
			currentAbortController.abort();
		}

		// Create new AbortController
		currentAbortController = new AbortController();

		// Fetch data with abort signal
		fetchTopStates(globalFilters, currentAbortController.signal);
	}, 300);

	$: {
		debouncedFetchTopStates(selectedGlobalFilters);
	}

	// ------------------------------- Fetch Top States by Trainees Onboarded -----------------------------------
	async function fetchTopStates(globalFilters, signal = null) {
		try {
			loading = true;
			error = null;
			const queryParams = new URLSearchParams();

			const response = await fetch(
				`/apis/analytics/insights?${queryParams.toString()}`,
				{
					signal
				}
			);

			if (!response.ok) {
				if(response.status === 401) {
					handleRedirection(response?.status, $page.url.pathname, $page.url.search);
				}
				throw new Error(`Failed to fetch insights. Status: ${response.status}`);
			}

			const result = await response.json();

			if (!result.success) {
				throw new Error(result.error || 'Failed to fetch insights data');
			}

			const insights = result.data || {};

			// Handle arrays for states with most trainees
		let statesWithMostTrainees = [];
		if (Array.isArray(insights.statesWithMostTrainees)) {
			statesWithMostTrainees = insights.statesWithMostTrainees;
		} else if (insights.statesWithMostTrainees) {
			statesWithMostTrainees = [insights.statesWithMostTrainees];
		}

			// Map states with most trainees to data format
			data = statesWithMostTrainees.map((state, index) => ({
				title: state.stateName || getStateName(state.state),
				subtitle: state.state,
				value: state.traineeCount || 0,
				rank: index + 1,
				stateCode: state.state
			}));
			
			// Wait for DOM to update before setting loading to false
			await tick();
			loading = false;
		} catch (err) {
			// Don't set error if request was aborted
			if (err.name === 'AbortError') {
				return;
			}
			console.error('Error fetching top states data:', err);
			error = err.message || 'Failed to load top states data. Please try again.';
			await tick();
			loading = false;
		}
	}
	// ----------------------------------- Life cycle Function ------------------------------------

	onMount(() => {
		currentAbortController = new AbortController();
		fetchTopStates(selectedGlobalFilters, currentAbortController.signal);
	});

	onDestroy(() => {
		if (currentAbortController) {
			currentAbortController.abort();
		}
	});

	// ------------------------------ General Functions ---------------------------------------

	function getStateName(stateIsoCode) {
		if (!stateIsoCode || minimalStatesData.length === 0) {
			return 'Unknown State';
		}

		const state = minimalStatesData.find(
			(s) => s.isoCode === stateIsoCode || s.id === stateIsoCode
		);
		return state?.name || stateIsoCode;
	}
</script>

<DataCard
	title="Top States - Trainees onboarded"
	subtitle="Last 7 days"
	{data}
	{loading}
	{error}
/>
