<script>
	import { onMount, onDestroy, tick } from 'svelte';
	import LineChartWrapper from '$lib/dashboards/LineChartWrapper.svelte';
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

	const categoryColors = {
		1: 'rgb(92, 160, 220)',    // Agricultural EDPs (Blue)
		2: 'rgb(255, 140, 154)',   // Process EDPs (Red)
		3: 'rgb(102, 174, 120)',   // Product EDPs (Green)
		4: 'rgb(255, 215, 128)',   // General EDPs (Yellow)
		0: 'rgb(138, 83, 167)'     // Total (Purple)
	};

	const categoryNames = {
		1: 'Agricultural EDPs',
		2: 'Process EDPs',
		3: 'Product EDPs',
		4: 'General EDPs',
		0: 'All Categories (Total)'
	};

	chartOptions = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: {
				display: true,
				position: 'top',
				align: 'center',
				labels: {
					usePointStyle: true,
					pointStyle: 'rect',
					color: '#555',
					font: { size: 10, weight: 'semibold' },
					padding: 10
				}
			},
			tooltip: {
				enabled: true,
				backgroundColor: 'rgba(0, 0, 0, 0.8)',
				titleColor: '#fff',
				bodyColor: '#fff',
				padding: 12
			}
		},
		scales: {
			x: {
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
			if (allFilters?.gender?.id) {
				queryParams.append('gender', allFilters.gender.id);
			}
			const response = await fetch(`/apis/analytics/trainees/onboardTrend/byCategory?${queryParams.toString()}`, {
				signal
			});
			
			if (!response.ok) {
				if(response.status === 401) {
					handleRedirection(response?.status, $page.url.pathname, $page.url.search);
				}
				throw new Error(`Failed to fetch data. Status: ${response.status}`);
			}
			const result = await response.json();
			if (!result.success) {
				throw new Error(result.error || 'Failed to fetch data');
			}
			const trends = result.data?.trends || [];

			// Group data by period and category
			const periodMap = new Map();
			const categoryIds = new Set([1, 2, 3, 4]);

			trends.forEach((trend) => {
				const periodKey = `${trend.periodStart}_${trend.periodEnd}`;
				if (!periodMap.has(periodKey)) {
					periodMap.set(periodKey, {
						periodStart: trend.periodStart,
						periodEnd: trend.periodEnd,
						categories: {}
					});
				}
				const periodData = periodMap.get(periodKey);
				const categoryId = trend.categoryId || 0;
				categoryIds.add(categoryId);
				periodData.categories[categoryId] = trend.traineesOnboarded || 0;
			});

			// Sort periods chronologically
			const sortedPeriods = Array.from(periodMap.values()).sort(
				(a, b) => new Date(a.periodStart) - new Date(b.periodStart)
			);

			// Generate labels
			const labels = sortedPeriods.map((period) => 
				formatChartLabel(period.periodStart, period.periodEnd, period)
			);

			// Create datasets for each category
			const datasets = [];
			const sortedCategoryIds = Array.from(categoryIds).sort((a, b) => a - b);

			sortedCategoryIds.forEach((categoryId) => {
				const data = sortedPeriods.map((period) => period.categories[categoryId] || 0);
				
				datasets.push({
					label: categoryNames[categoryId] || `Category ${categoryId}`,
					data: data,
					borderColor: categoryColors[categoryId] || 'rgb(128, 128, 128)',
					backgroundColor: categoryColors[categoryId] || 'rgb(128, 128, 128)',
					borderWidth: 2,
					fill: false,
					pointBackgroundColor: categoryColors[categoryId] || 'rgb(128, 128, 128)',
					pointBorderColor: '#fff',
					pointHoverBackgroundColor: '#fff',
					pointHoverBorderColor: categoryColors[categoryId] || 'rgb(128, 128, 128)',
					tension: 0.3,
					pointRadius: 4,
					pointHoverRadius: 6
				});
			});

			// Calculate and add total dataset
			const totalData = sortedPeriods.map((period) => {
				return Object.values(period.categories).reduce((sum, val) => sum + val, 0);
			});

			datasets.push({
				label: categoryNames[0],
				data: totalData,
				borderColor: categoryColors[0],
				backgroundColor: categoryColors[0],
				borderWidth: 2,
				fill: false,
				pointBackgroundColor: categoryColors[0],
				pointBorderColor: '#fff',
				pointHoverBackgroundColor: '#fff',
				pointHoverBorderColor: categoryColors[0],
				tension: 0.3,
				pointRadius: 4,
				pointHoverRadius: 6,
				borderDash: [5, 5] // Dashed line for total
			});

			chartData = {
				labels: labels,
				datasets: datasets
			};

			dateRange = formatDateRange(sortedPeriods, period);
		
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
	<LineChartWrapper
		title="Trainee Onboard Trend - Course Categories"
		subtitle="Based on all course categories"
		showFilters={false}
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
