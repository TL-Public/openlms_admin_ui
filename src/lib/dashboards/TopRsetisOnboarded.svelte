<script>
	import { onMount, onDestroy, tick } from 'svelte';
	import DataCard from '$lib/dashboards/DataCard.svelte';
	import { debounce } from '$lib/utils/dashboard/helper.js';
	import { handleRedirection } from '$lib/utils/helper.js';
	import { page } from '$app/stores';

	export let selectedGlobalFilters = {};
	export let minimalRsetiData = [];
	export let minimalStatesData = [];

	let data = [];
	let loading = true;
	let error = null;
	let currentAbortController = null;

	const debouncedFetchTopRsetis = debounce((globalFilters) => {
		// Cancel any ongoing request
		if (currentAbortController) {
			currentAbortController.abort();
		}

		// Create new AbortController
		currentAbortController = new AbortController();

		// Fetch data with abort signal
		fetchTopRsetis(globalFilters, currentAbortController.signal);
	}, 300);

	$: {
		debouncedFetchTopRsetis(selectedGlobalFilters);
	}

	// ------------------------------- Fetch Top RSETIs by Trainees Onboarded -----------------------------------
	async function fetchTopRsetis(globalFilters, signal = null) {
		try {
			loading = true;
			error = null;
			const queryParams = new URLSearchParams();

			queryParams.append('limit', '5');

			if (globalFilters?.States?.id && globalFilters.States.id !== 'all') {
				queryParams.append('state', globalFilters.States.isoCode);
			}

			const response = await fetch(
				`/apis/analytics/rsetis/traineesOnboarded?${queryParams.toString()}`,
				{
					signal
				}
			);

			// console.log('Top RSETIs onboarded response:', response);

			if (!response.ok) {
				if(response.status === 401) {
					handleRedirection(response?.status, $page.url.pathname, $page.url.search);
				}
				throw new Error(`Failed to fetch top RSETIs. Status: ${response.status}`);
			}

			const result = await response.json();

			// console.log('Top RSETIs onboarded result:', result);

			if (!result.success) {
				throw new Error(result.error || 'Failed to fetch top RSETIs data');
			}

			const topRsetis = result.data?.topRsetis || [];
			// console.log('Top RSETIs:', topRsetis);

			// Transform API data to DataCard format with name lookups
			data = topRsetis.map((rseti) => {
				const rsetiName = getRsetiName(rseti.rsetiId, rseti.rseti_uuid);
				const stateName = getStateName(rseti.state);

				return {
					title: rsetiName,
					subtitle: stateName,
					value: rseti.traineesEnrolled || 0,
					rank: rseti.rank || 0,
					// Add additional properties
					id: rseti.rsetiId,
					uuid: rseti.rseti_uuid,
					stateCode: rseti.state
				};
			});
			
			// Wait for DOM to update before setting loading to false
			await tick();
			loading = false;
		} catch (err) {
			// Don't set error if request was aborted
			if (err.name === 'AbortError') {
				// console.log('Top RSETIs request was aborted');
				return;
			}
			console.error('Error fetching top RSETIs data:', err);
			error = err.message || 'Failed to load top RSETIs data. Please try again.';
			await tick();
			loading = false;
		}
	}
	// ----------------------------------- Life cycle Function ------------------------------------

	onMount(() => {
		currentAbortController = new AbortController();
		fetchTopRsetis(selectedGlobalFilters, currentAbortController.signal);
	});

	onDestroy(() => {
		if (currentAbortController) {
			currentAbortController.abort();
		}
	});

	// ------------------------------ General Functions ---------------------------------------

	function getRsetiName(rsetiId, rsetiUuid) {
		// Try to find by rsetiId first, then by rsetiUuid if available
		let rseti = null;

		if (rsetiUuid && minimalRsetiData.length > 0) {
			rseti = minimalRsetiData.find((r) => r.uuid === rsetiUuid || r.id === rsetiUuid);
		}

		if (!rseti && rsetiId && minimalRsetiData.length > 0) {
			rseti = minimalRsetiData.find((r) => r.id === rsetiId || r.uuid === rsetiId);
		}

		return rseti?.name || `RSETI ${rsetiId || rsetiUuid || 'Unknown'}`;
	}

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
	title="Top RSETIs - Trainees onboarded"
	subtitle="Last 7 days"
	{data}
	{loading}
	{error}
	selectedGlobalFilters={selectedGlobalFilters?.States ? { States: selectedGlobalFilters.States } : {}}
/>
