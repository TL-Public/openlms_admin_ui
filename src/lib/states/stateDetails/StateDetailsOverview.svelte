<script>
	import AboutStateCard from '$lib/states/stateDetails/AboutStateCard.svelte';
	import IndividualStats from '$lib/components/IndividualStats.svelte';
	import { courseStats } from '$lib/data.js';

	export let stateDetailsData;
</script>

<div class="grid gap-4 lg:grid-cols-2 md:grid-cols-1">

	<div class="grid grid-cols-1 sm:grid-cols-2 gap-3 md:order-1 lg:order-2">
		{#each courseStats as stats, index (index)}
			<IndividualStats {stats} />
		{/each}
	</div>

	
	<div class="md:order-2 lg:order-1 grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-4">
		<AboutStateCard stateDetails={stateDetailsData} />
	</div>
</div>
