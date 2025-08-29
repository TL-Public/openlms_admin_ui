<script>
	import { tcStatsDetails } from '$lib/data.js';
	import IndividualStats from '$lib/components/IndividualStats.svelte';
</script>

<div class="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-4">
	{#each tcStatsDetails as stats, index (index)}
		<IndividualStats {stats} />
	{/each}
</div>
