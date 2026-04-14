<script>
	import CardHeader from '$lib/dashboards/CardHeader.svelte';
	import LineChart from '$lib/components/LineChart.svelte';
	import TimeRangeSelector from '$lib/dashboards/TimeRangeSelector.svelte';
	import Spinner from '$lib/components/Spinner.svelte';
	import ErrorMessage from '$lib/components/ErrorMessage.svelte';

	export let title = '';
	export let subtitle = '';
	export let showFilters = false;
	export let filters = [];
	export let chartData = {};
	export let chartOptions = {};
	export let isLoading = true;
	export let error = null;
	export let selectedGlobalFilters ={}

	export let showTimeRange = false; 
	export let timeRanges = ['1W', '1M', '3M', '1Y', 'YTD'];
	export let selectedRange = '1W';
	export let dateRange = '';
</script>

<div class="rounded-lg border border-gray-200 bg-white shadow-sm p-4 md:pt-6 md:px-4">
	<!-- Card Header -->
	<div class="mb-4">
		<CardHeader {title} {subtitle} {showFilters} {filters} {selectedGlobalFilters} on:filterChange />
	</div>

	{#if showTimeRange}
		<div class="flex flex-col sm:flex-row justify-between items-center mb-2">
			<!-- Time range selector -->
			<TimeRangeSelector ranges={timeRanges} selected={selectedRange} on:rangeChange />

			<!-- Date range -->
			{#if dateRange}
				<div class="text-xs text-gray-500 flex-shrink-0 self-end sm:self-none mt-1 sm:mt-0">{dateRange}</div>
			{/if}
		</div>
	{/if}

	<!-- Chart -->
	<div class="w-full">
		{#if isLoading}
			<div
				class="rounded-lg border border-gray-200 bg-white shadow-sm p-4 md:pt-6 md:px-4 min-h-80 flex justify-center items-center"
			>
				<Spinner size={60} />
			</div>
		{:else if error}
		<div class="min-h-40">
			<ErrorMessage error={error || 'No data available.'} />
		</div>
		{:else if !chartData || !chartData.labels || chartData.labels.length === 0}
		<div class="min-h-40">
			<ErrorMessage error={'No data available.'} />
		</div>
		{:else}
			<LineChart {chartData} {chartOptions} />
		{/if}
	</div>
</div>
