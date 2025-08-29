<script>
	import AddStateForm from '$lib/states/addState/AddStateForm.svelte';
	import { page } from '$app/stores';
	
</script>

<AddStateForm route={$page.route.id} params={$page.params}/>