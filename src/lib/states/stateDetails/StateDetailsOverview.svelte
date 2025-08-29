<script>
	import AboutStateCard from '$lib/states/stateDetails/AboutStateCard.svelte';
	import { tcStatsDetails } from '$lib/data.js';
	import IndividualStats from '$lib/components/IndividualStats.svelte';

	export let selectedLanguage = 'en';
	export let stateDetails;
</script>

<div class="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-4 mb-4">
	{#each tcStatsDetails as stats, index (index)}
		<IndividualStats {stats} />
	{/each}
</div>
<div class="">
	<AboutStateCard {stateDetails} {selectedLanguage} />
</div>

