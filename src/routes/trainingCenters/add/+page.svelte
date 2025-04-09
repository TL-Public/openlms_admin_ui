<script>
	import Add from '$lib/trainingCenters/addTC/AddForm.svelte';
	import { page } from '$app/stores';
	export let data;
	let { stateData, bankData } = data;
</script>

<Add {stateData} {bankData} route={$page.route.id} params={$page.params} />
