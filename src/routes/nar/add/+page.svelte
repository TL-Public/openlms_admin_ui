<script>
	import { page } from '$app/stores';
    import AddNarForm from '$lib/nar/addNar/AddNarForm.svelte';

</script>

<AddNarForm route={$page.route.id} params={$page.params}/>