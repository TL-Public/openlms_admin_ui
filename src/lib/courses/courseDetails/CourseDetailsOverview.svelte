<script>
	import AboutCourseCard from '$lib/courses/courseDetails/AboutCourseCard.svelte';
	import { courseStats } from '$lib/data.js';
	import IndividualStats from '$lib/components/IndividualStats.svelte';
	import IntroVideoCard from '$lib/courses/courseDetails/IntroVideoCard.svelte';

	export let courseData;
	export let introVideos = [];
	export let showHorizontalLine = true;
	export let deletedIntroVideoLanguageCode = null

	let introVideosCopy = introVideos

</script>

<!-- <section class="grid grid-cols-2 gap-4"> -->
	<div class="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-4 mb-4">
		{#each courseStats as stats, index (index)}
		<IndividualStats {stats} />
		{/each}
	</div>
	<div>
		<AboutCourseCard courseData={courseData} {deletedIntroVideoLanguageCode}/>
	</div>
	<div>
		<IntroVideoCard courseData={courseData} {deletedIntroVideoLanguageCode} introVideos={introVideosCopy} on:introVideoAdded={(e)=>introVideosCopy=e.detail}
		on:introVideoDeleted={(e)=>introVideosCopy=e.detail}/>
	</div>
<!-- </section> -->

{#if showHorizontalLine}
	<hr class="border-t border-darkgray mt-6" />
{/if}
