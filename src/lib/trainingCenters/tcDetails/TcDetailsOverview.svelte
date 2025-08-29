<script>
	import AboutTCDetails from '$lib/trainingCenters/tcDetails/AboutTcDetails.svelte';
	import { tcStatsDetails } from '$lib/data.js';
	import IndividualStats from '$lib/components/IndividualStats.svelte';
	export let langauageSelected;
	export let tcDetailsData;
</script>

<h1 class="mb-8 heading-L">Training Center Details</h1>
<div class="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-4 mb-4">
	{#each tcStatsDetails as stats, index (index)}
		<IndividualStats {stats} showValueTxt={false} />
	{/each}
</div>
<div class="">
	<AboutTCDetails {tcDetailsData} bind:langauageSelected />
</div>

<hr class="border-t border-darkgray mt-6" />
