<script>
	import MostViewed from "$lib/components/MostViewed.svelte";
    import IndividualStats from '$lib/components/IndividualStats.svelte';
    import {courseStats} from '$lib/data.js'

</script>
<h1 class="heading-L mb-2">Videos</h1>
<div class="flex bp-900px:gap-4 gap-8 items-stretch bp-900px:flex-row flex-col">
	<div class="bp-900px:w-1/2">
		<div class="grid bp-420px:grid-cols-2 grid-cols-1 gap-3">
			{#each courseStats as stats, index (index)}
				<IndividualStats {stats} />
			{/each}
		</div>
	</div>
	<div class="mt-4 bp-900px:mt-0 bp-900px:w-1/2 relative">
		<div class="mb-2 font-semibold text-sm absolute -top-6 text-primary">Most Viewed</div>
		<MostViewed />
	</div>
</div>

