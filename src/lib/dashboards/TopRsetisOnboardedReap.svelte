<script>
	import { onMount, onDestroy } from 'svelte';
	import DataCard from '$lib/dashboards/DataCard.svelte';
	import { debounce } from '$lib/utils/dashboard/helper.js';

	export let selectedGlobalFilters = {};
	export let minimalRsetiData = [];
	export let minimalStatesData = [];

	let data = [];
	let loading = true;
	let error = null;

	// AbortController for handling race conditions
	let currentAbortController = null;

	// Helper function to get RSETI name from minimal data
	function getRsetiName(rsetiId) {
		const rseti = minimalRsetiData.find(r => r.id === rsetiId);
		return rseti?.name || `RSETI ${rsetiId}`;
	}

	// Helper function to get state name from minimal data  
	function getStateName(stateCode) {
		const state = minimalStatesData.find(s => s.isoCode === stateCode);
		return state?.name || stateCode;
	}

	// -------------------------------
	// API call to fetch top RSETIs by trainees onboarded to REAP (placeholder - API not ready)
	// -------------------------------
	async function fetchTopRsetis(globalFilters, signal = null) {
		try {
			loading = true;
			error = null;

			// Build query parameters (for future API integration)
			const queryParams = new URLSearchParams();
			
			// Set default limit for top RSETIs
			queryParams.append('limit', '10');

			// Add filters to query params
			if (globalFilters?.States?.id && globalFilters.States.id !== 'all') {
				queryParams.append('state', globalFilters.States.isoCode);
			}

			// TODO: Replace with actual API call when endpoint is ready
			// const response = await fetch(`/apis/analytics/rsetis/traineesOnboardedReap?${queryParams.toString()}`, {
			// 	signal
			// });

			// Placeholder: Mock response for development
			await new Promise((resolve) => setTimeout(resolve, 400)); // Simulate API delay

			// Mock data structure based on expected API response
			const mockResult = {
				success: true,
				data: {
					topRsetis: [
						{
							rsetiId: '31033',
							rseti_uuid: 'uuid-1',
							state: 'IN-MP',
							traineesEnrolled: 456,
							rank: 1
						},
						{
							rsetiId: '01002',
							rseti_uuid: 'uuid-2',
							state: 'IN-GJ',
							traineesEnrolled: 325,
							rank: 2
						},
						{
							rsetiId: '08052',
							rseti_uuid: 'uuid-3',
							state: 'IN-TN',
							traineesEnrolled: 165,
							rank: 3
						}
					]
				}
			};
						
		

			// console.log('Top RSETIs REAP onboarded (mock) result:', mockResult);

			if (!mockResult.success) {
				throw new Error(mockResult.error || 'Failed to fetch top RSETIs REAP onboarded data');
			}

			const topRsetis = mockResult.data?.topRsetis || [];

			// Transform API data to DataCard format
			data = topRsetis.map(rseti => ({
				title: getRsetiName(rseti.rsetiId),
				subtitle: getStateName(rseti.state),
				value: rseti.traineesEnrolled || 0, // API uses traineesEnrolled for REAP onboarded count
				// Add any additional properties that DataCard might need
				id: rseti.rsetiId,
				stateCode: rseti.state
			}));

			// Apply state filter to mock data if needed
			if (globalFilters?.States?.id && globalFilters.States.id !== 'all') {
				data = data.filter(item => item.stateCode === globalFilters.States.isoCode);
			}

		} catch (err) {
			// Don't set error if request was aborted
			if (err.name === 'AbortError') {
				// console.log('Top RSETIs REAP onboarded request was aborted');
				return;
			}
			console.error('Error fetching top RSETIs REAP onboarded data:', err);
			error = err.message || 'Failed to load top RSETIs REAP onboarded data. Please try again.';
		} finally {
			loading = false;
		}
	}

	// Debounced version of fetchTopRsetis to prevent excessive API calls
	const debouncedFetchTopRsetis = debounce((globalFilters) => {
		// Cancel any ongoing request
		if (currentAbortController) {
			currentAbortController.abort();
		}
		
		// Create new AbortController
		currentAbortController = new AbortController();
		
		// Fetch data with abort signal
		fetchTopRsetis(globalFilters, currentAbortController.signal);
	}, 300); // 300ms debounce delay

	// Fixed reactive statement - properly trigger when filters change
	$: {
		// Trigger debounced fetch when global filters change
		debouncedFetchTopRsetis(selectedGlobalFilters);
	}

	onMount(() => {
		// Initial fetch on mount with AbortController
		currentAbortController = new AbortController();
		fetchTopRsetis(selectedGlobalFilters, currentAbortController.signal);
	});

	onDestroy(() => {
		// Cleanup: abort any ongoing requests
		if (currentAbortController) {
			currentAbortController.abort();
		}
	});
</script>

<DataCard
	title="Top RSETIs - Trainees onboarded to REAP"
	subtitle="Last 7 days"
	{data}
	{loading}
	{error}
	{selectedGlobalFilters}
/>