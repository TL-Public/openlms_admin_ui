<script>
	import AboutTraineeCard from '$lib/trainees/traineeDetails/AboutTraineeCard.svelte';
	import IndividualStats from '$lib/components/IndividualStats.svelte';
	import { traineeDetailsStats } from '$lib/data.js';

	export let traineeDetailsData;

</script>

<h1 class="mb-8 heading-L">Trainee Details</h1>
<div class="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-4 mb-4">
	{#each traineeDetailsStats as stats, index (index)}
		<IndividualStats {stats} showValueTxt={false} />
	{/each}
</div>
<div class="">
	<AboutTraineeCard {traineeDetailsData} />
</div>

<!-- <hr class="border-t border-darkgray mt-6" /> -->
<hr class="horizontal-line mt-8 mb-4" />
