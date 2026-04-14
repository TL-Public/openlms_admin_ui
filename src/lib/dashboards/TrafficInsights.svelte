<script>
	import { onMount, onDestroy, tick } from 'svelte';
	import LineChartWrapper from '$lib/dashboards/LineChartWrapper.svelte';
	import { debounce } from '$lib/utils/dashboard/helper.js';
	import { handleRedirection } from '$lib/utils/helper.js';
	import { page } from '$app/stores';

	export let filters = [];
	export let selectedGlobalFilters = {};

	let widgetFilters = {};
	let chartData = {};
	let isLoading = true;
	let error = null;
	let currentAbortController = null;
	let selectedDate = null;

	// Chart configuration
	const chartOptions = {
		responsive: true,
		maintainAspectRatio: false,
		interaction: {
			intersect: false,
			mode: 'index'
		},
		plugins: {
			legend: {
				display: false,
				position: 'top',
				labels: {
					color: '#555',
					usePointStyle: true,
					padding: 15
				}
			},
			tooltip: {
				backgroundColor: 'rgba(0, 0, 0, 0.8)',
				titleColor: '#fff',
				bodyColor: '#fff',
				padding: 12,
				displayColors: true,
				callbacks: {
					title: function(context) {
						const hour = context[0].label;
						return `Hour: ${hour}:00`;
					},
					label: function(context) {
						return `${context.dataset.label}: ${context.parsed.y.toLocaleString()} views`;
					}
				}
			}
		},
		scales: {
			x: {
				title: {
					display: true,
					text: 'Hour of Day (0-23)',
					color: '#555',
					font: {
						size: 12,
						weight: 'bold'
					}
				},
				grid: { color: '#eee' },
				ticks: { color: '#555' }
			},
			y: {
				beginAtZero: true,
				grace: '5%',
				title: {
					display: true,
					text: 'Video Views',
					color: '#555',
					font: {
						size: 12,
						weight: 'bold'
					}
				},
				grid: { color: '#eee' },
				ticks: {
					color: '#555',
					precision: 0,
					callback: function(value) {
						return value.toLocaleString();
					}
				}
			}
		}
	};

	const debouncedFetchChartData = debounce((date, localFilters, globalFilters) => {
		if (currentAbortController) {
			currentAbortController.abort();
		}
		currentAbortController = new AbortController();
		fetchChartData(date, localFilters, globalFilters, currentAbortController.signal);
	}, 300);

	// ------------------------- Data Fetching -----------------------------
	async function fetchChartData(date, localFilters, globalFilters, signal = null) {
		try {
			isLoading = true;
			error = null;

			const queryParams = new URLSearchParams();
			let formattedDate = date;

			if (formattedDate) {
				queryParams.append('date', formattedDate);
			}
	
			const response = await fetch(
				`/apis/analytics/videos/hourly-views?${queryParams.toString()}`,
				{ signal }
			);
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
			const trafficData = result.data?.hourlyData || [];

			// Create labels for all 24 hours
			const labels = Array.from({ length: 24 }, (_, i) => i.toString());

			// Create a map of hour to views
			const viewsMap = new Map();
			trafficData.forEach(item => {
				viewsMap.set(item.hour, item.views || 0);
			});

			// Fill in data for all 24 hours (0 if no data)
			const data = labels.map(hour => viewsMap.get(parseInt(hour)) || 0);

			chartData = {
				labels: labels,
				datasets: [
					{
						label: 'Video Views',
						data: data,
						fill: false,
						borderColor: 'rgba(75, 192, 192, 1)',
						backgroundColor: 'rgba(75, 192, 192, 0.5)',
						pointBackgroundColor: 'rgba(75, 192, 192, 1)',
						pointBorderColor: '#fff',
						pointHoverBackgroundColor: '#fff',
						pointHoverBorderColor: 'rgba(75, 192, 192, 1)',
						borderWidth: 2,
						tension: 0.3,
						pointRadius: 4,
						pointHoverRadius: 6
					}
				]
			};

			await tick();
			isLoading = false;
		} catch (err) {
			if (err.name === 'AbortError') {
				return;
			}
			console.error('Error fetching traffic insights:', err);
			error = err.message || 'Failed to load data. Please try again.';
			await tick();
			isLoading = false;
		}
	}

	// ------------------------- Filter related functions -------------------------------

	function handleFilterChange(event) {
		widgetFilters = event.detail;
		
		if (widgetFilters?.Date) {
			selectedDate = widgetFilters.Date.value;
		} else {
			selectedDate = getPreviousDay();
		}

		debouncedFetchChartData(selectedDate, widgetFilters, selectedGlobalFilters);
	}

	// ------------------ Life cycle hooks ------------------------

	onMount(() => {
		selectedDate = getPreviousDay();
		currentAbortController = new AbortController();
		fetchChartData(selectedDate, widgetFilters, selectedGlobalFilters, currentAbortController.signal);
	});

	onDestroy(() => {
		if (currentAbortController) {
			currentAbortController.abort();
		}
	});

	// ----------------------General Helpers --------------------------
	
	function getPreviousDay() {
		const yesterday = new Date();
		yesterday.setDate(yesterday.getDate() - 1);
		const day = String(yesterday.getDate()).padStart(2, '0');
		const month = String(yesterday.getMonth() + 1).padStart(2, '0');
		const year = yesterday.getFullYear();
		return `${day}-${month}-${year}`; // DD-MM-YYYY format
	}

</script>

<LineChartWrapper
	title="Traffic Insights - Hourly Video Views ({selectedDate || ''})"
	subtitle=""
	showFilters={true}
	{filters}
	showTimeRange={false}
	{chartData}
	{chartOptions}
	{isLoading}
	{error}
	{selectedGlobalFilters}
	on:filterChange={handleFilterChange}
/>
