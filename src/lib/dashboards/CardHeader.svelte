<script>
	import { createEventDispatcher } from 'svelte';
	import FilterComponent from '$lib/components/FilterComponent.svelte';

	export let title = '';
	export let subtitle = null;
	export let showFilters = false;
	export let filters = [];
	export let selectedGlobalFilters = {};

	let selectedFilters = {};

	const dispatch = createEventDispatcher();

	function handleFilterApplied(e) {
		selectedFilters = e.detail.selectedFilters;
		dispatch('filterChange', e.detail.selectedFilters);
	}

	function clearFilters() {
		selectedFilters = {};
		dispatch('filterChange', {});
	}
</script>

<div class="flex flex-col sm:flex-row gap-2 sm:justify-between sm:items-start">
	<div>
		<h3 class="dashboard-heading-L">{title}</h3>
		{#if subtitle}
			<p class="text-xs text-darkGray">{subtitle}</p>
		{/if}
	</div>

	{#if showFilters}
		<div class="flex flex-col items-end self-end gap-2">
			<FilterComponent
				filterOptions={filters}
				btnType="secondary"
				on:filterApplied={handleFilterApplied}
			>
				<!-- slot for button text -->
				<span slot="btnContent" class="text-xs flex gap-1 items-center">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="feather feather-filter"
					>
						<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
					</svg>
					Filters</span
				>
			</FilterComponent>
		</div>
	{/if}
</div>
{#if Number(Object.keys(selectedGlobalFilters)?.length) > 0}
	<div class="mt-2">
		<p class="text-xs font-semibold text-gray-600 mb-1">Global Filters applied:</p>
		<div class="flex flex-wrap gap-2">
			{#each Object.entries(selectedGlobalFilters) as [key, value]}
				<span class="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full border">
					<span class="capitalize">{key}</span>: {value?.name}
				</span>
			{/each}
		</div>
	</div>
{/if}

{#if Number(Object.keys(selectedFilters)?.length) > 0}
	<div class="mt-2">
		<p class="text-xs font-semibold text-gray-600 mb-1">Widget Filters applied:</p>
		<div class="flex flex-wrap gap-2">
			{#each Object.entries(selectedFilters) as [key, value]}
				<span
					class="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-200"
				>
					<span class="capitalize">{key}</span>: {value?.name}
				</span>
			{/each}
		</div>
	</div>
{/if}
