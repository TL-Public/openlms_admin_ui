<script>
    import IndividualStats from '$lib/components/IndividualStats.svelte'
    import {traineeStats} from '$lib/data.js'

</script>
<h1 class="mb-4 heading-L">Trainees</h1>
<div class="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-4">
            {#each traineeStats as stats,index(index)}
            <IndividualStats {stats} />
            {/each}
</div>
