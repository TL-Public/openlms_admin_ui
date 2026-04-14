<script>
	import { createEventDispatcher } from 'svelte';
	import CardHeader from '$lib/dashboards/CardHeader.svelte';
	import ErrorMessage from '$lib/components/ErrorMessage.svelte';
	import Spinner from '$lib/components/Spinner.svelte';

	export let title = '';
	export let subtitle = '';
	export let data = [];
	export let loading = true;
	export let error = null;
	export let selectedGlobalFilters = {}

	const dispatch = createEventDispatcher();

	// Handle button clicks for items with isButton: true
	function handleButtonClick(item) {
		dispatch('buttonClick', item);
	}

	// Example shape:
	// [
	//   { title: "APJ Abdul Kalam Centre of ...", subtitle: "Bhopal, Madhya Pradesh", value: 456 },
	//   { title: "Varghese Kurien Memorial...", subtitle: "Anand, Gujarat", value: 325 }
	// ]
</script>

<div class="rounded-lg border border-gray-200 bg-white shadow-sm p-4 md:pt-6 md:px-4 w-full">
	<!-- Reusable Card Header -->
	<div class="mb-4">
		<CardHeader {title} {subtitle} {selectedGlobalFilters} />
	</div>

	<div class="space-y-2 flex items-start justify-center">
		{#if loading}
			<!-- Loading -->
			<Spinner size={60} />
		{:else if error}
			<!-- Error -->
			<ErrorMessage {error} />
		{:else if !data || data.length === 0}
			<!-- No Data -->
			<ErrorMessage error="No data available." />
		{:else}
			<!-- Data Display -->
			<div class="w-full space-y-4">
				{#each data as item, index (index)}
					<div class="flex items-center rounded-md p-2 py-2 px-4 transition w-full bg-neutral-100 gap-2 ">
						<!-- Left section: Name + subtitle -->
						<div class="flex flex-col w-2/3">
							<span
								class="text-sm font-semibold text-darkGray w-full flex-wrap"
								title={item?.title}
							>
								{item.title || '-'}
							</span>
							<span class="text-xs text-gray-500 w-full flex-wrap" title={item?.subtitle}>
								{item?.subtitle || '-'}
							</span>
						</div>

						<!-- Right section: Value -->
						{#if item?.isButton}
							<button
								type="button"
								class="text-sm underline text-blue-400 hover:text-blue-600 w-1/3 text-right bp-420px:text-center bp-900px:text-right flex-wrap cursor-pointer"
								on:click={() => handleButtonClick(item)}
							>
								{item?.value}
							</button>
						{:else if item?.link}
							<a
								href={item?.src}
								class="text-sm underline text-blue-400 w-1/3 text-right bp-420px:text-center bp-900px:text-right flex-wrap"
								>{item?.value}</a
							>
						{:else}
							<span
								class="text-sm text-darkGray w-1/3 text-right bp-420px:text-center bp-900px:text-right flex-wrap"
								title={item?.value}
							>
								{item.value}
							</span>
						{/if}
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>
