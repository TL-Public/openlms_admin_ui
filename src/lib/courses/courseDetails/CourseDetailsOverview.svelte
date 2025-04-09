<script>
	import AboutCourseCard from '$lib/courses/courseDetails/AboutCourseCard.svelte';
	import { courseStats } from '$lib/data.js';
	import IndividualStats from '$lib/components/IndividualStats.svelte';

	export let courseData;
	export let showHorizontalLine = true;




</script>

<!-- <section class="grid grid-cols-2 gap-4"> -->
	<div class="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-4 mb-4">
		{#each courseStats as stats, index (index)}
		<IndividualStats {stats} />
		{/each}
	</div>
	<div>
		<AboutCourseCard courseData={courseData}/>
	</div>
<!-- </section> -->

{#if showHorizontalLine}
	<hr class="border-t border-darkgray mt-6" />
{/if}
