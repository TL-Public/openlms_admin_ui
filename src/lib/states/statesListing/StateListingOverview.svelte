<!-- Design not yet finalised for this part -->
<script>
	import IndividualStats from '$lib/components/IndividualStats.svelte';
	import { courseStats } from '$lib/data.js';
	import RadioButton from '$lib/components/RadioButton.svelte';
</script>

<h1 class="mb-2 heading-L">States</h1>

<div class="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4">
	{#each courseStats as stats, index (index)}
		<IndividualStats {stats} />
	{/each}
</div>
