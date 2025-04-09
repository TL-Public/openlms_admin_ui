<script>
	import NotFound from "$lib/svgComponents/NotFound.svelte";
    export let error='No Data Found'
</script>

<div class="flex flex-col items-center p-6 sm:gap-8 gap-4">
    <NotFound addClass="w-1/2 sm:w-1/3 h-auto"/>
    <h2 class="text-xl font-bold text-primary">{error}</h2>
</div>
