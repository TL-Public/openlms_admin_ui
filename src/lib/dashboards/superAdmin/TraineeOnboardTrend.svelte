<script>
	import { onMount, onDestroy, tick } from 'svelte';
	import BarChartWrapper from '$lib/dashboards/BarChartWrapper.svelte';
	import { 
		formatChartLabel, 
		formatDateRange, 
		mapRangeToPeriod, 
		debounce 
	} from '$lib/utils/dashboard/helper.js';
	import { handleRedirection } from '$lib/utils/helper.js';
	import { page } from '$app/stores';

	export let filters = [];
	export let selectedGlobalFilters = {};

	let chartData = null;
	let chartOptions = {};
	let selectedFilters = {};
	let selectedRange = '1W';
	let dateRange = '';
	let isLoading = true;
	let error = null;
	let currentAbortController = null;

	chartOptions = {
		responsive: true,
		maintainAspectRatio: false,
		interaction: { mode: 'index', intersect: false },
		plugins: {
			legend: {
				display: false,
				labels: {
					color: '#143164',
					font: { size: 12 }
				}
			},
			tooltip: {
				enabled: true
			}
		},
		scales: {
			x: {
				barPercentage: 0.5,
				categoryPercentage: 0.6,
				grid: { color: '#eee' },
				ticks: { color: '#555' }
			},
			y: {
				beginAtZero: true,
				grace: '5%',
				grid: { color: '#eee' },
				ticks: { 
					color: '#555',
					precision: 0
				}
			}
		}
	};

		const debouncedFetchChartData = debounce((range, localFilters, globalFilters) => {
		// Cancel any ongoing request
		if (currentAbortController) {
			currentAbortController.abort();
		}
		
		// Create new AbortController
		currentAbortController = new AbortController();
		
		// Fetch data with abort signal
		fetchChartData(range, localFilters, globalFilters, currentAbortController.signal);
	}, 300); 

// ----------------------------------- Reactive Statements -------------------------------------------

	$: {
		debouncedFetchChartData(selectedRange, selectedFilters, selectedGlobalFilters);
	}

// -------------------------------- Filter and Range Handlers ------------------------------------------
	function handleRangeChange(e) {
		selectedRange = e.detail;
	}

	function handleFilterChange(e) {
		selectedFilters = e.detail;
	}



// ----------------------------------- Fetch Trainee Onboard Trend with Analytics API ------------------------------------------
	async function fetchChartData(range, localFilters, globalFilters, signal = null) {
		try {
			isLoading = true;
			error = null;

			const period = mapRangeToPeriod(range);
			const queryParams = new URLSearchParams();
			queryParams.append('period', period);


			let allFilters = { ...globalFilters, ...localFilters };

			if (allFilters?.States?.id && allFilters.States.id !== 'all') {
				queryParams.append('state', allFilters.States.isoCode);
			}
			if (allFilters?.RSETI?.extId) {
				queryParams.append('rseti', allFilters.RSETI.extId);
			}
			if (allFilters?.course?.courseCode) {
				queryParams.append('course', allFilters.course.courseCode);
			}
			if (allFilters?.gender?.id) {
				queryParams.append('gender', allFilters.gender.id);
			}

			// Add date filters if available
			if (allFilters?.date_from) {
				queryParams.append('date_from', allFilters.date_from);
			}
			if (allFilters?.date_to) {
				queryParams.append('date_to', allFilters.date_to);
			}

			const response = await fetch(`/apis/analytics/trainees/onboardTrend?${queryParams.toString()}`, {
				signal
			});

			// console.log('Trainee onboard trend response:', response);
			
			if (!response.ok) {
				if(response.status === 401) {
					handleRedirection(response?.status, $page.url.pathname, $page.url.search);
				}
				throw new Error(`Failed to fetch trainee onboard trends. Status: ${response.status}`);
			}

			const result = await response.json();

			// console.log('Trainee onboard trend result:', result);

			if (!result.success) {
				throw new Error(result.error || 'Failed to fetch trainee onboard trends');
			}

			const trends = result.data?.trends || [];
			// console.log('Trainee onboard trends:', trends);

			// Transform API data to chart format using utilities
			const labels = [];
			const onboardCounts = [];

			trends.forEach((trend) => {
				const label = formatChartLabel(trend.periodStart, trend.periodEnd, period);
				labels.push(label);
				onboardCounts.push(trend.traineesOnboarded || 0);
			});

			chartData = {
				labels: labels,
				datasets: [
					{
						label: 'New Trainees',
						data: onboardCounts,
					backgroundColor: 'rgba(75, 192, 192, 0.5)',
					borderColor: 'rgba(75, 192, 192, 1)',
					borderWidth: 1,
					barPercentage: 0.5,
					categoryPercentage: 0.6
				}
			]
		};

		dateRange = formatDateRange(trends, period);
		
		// Wait for DOM to update before setting loading to false
			await tick();
			isLoading = false;
		} catch (err) {
			// Don't set error if request was aborted
			if (err.name === 'AbortError') {
				// console.log('Trainee onboard trend request was aborted');
				return;
			}
			console.error('Error fetching trainee onboard trend data:', err);
			error = err.message || 'Something went wrong';
			await tick();
			isLoading = false;
		}
	}

	// ----------------------------------- Life cycle Function ------------------------------------
	onMount(() => {
		currentAbortController = new AbortController();
		fetchChartData(selectedRange, selectedFilters, selectedGlobalFilters, currentAbortController.signal);
	});

	onDestroy(() => {
		// Cleanup: abort any ongoing requests
		if (currentAbortController) {
			currentAbortController.abort();
		}
	});
</script>

<!-- Page Layout -->
<div class="">
	<BarChartWrapper
		title="Trainee Onboard Trend"
		subtitle="Based on trainee enrollments"
		showFilters={true}
		{filters}
		showTimeRange={true}
		{selectedRange}
		{dateRange}
		{chartData}
		{chartOptions}
		{isLoading}
		{error}
		{selectedGlobalFilters}
		on:rangeChange={handleRangeChange}
		on:filterChange={handleFilterChange}
	/>
</div>
