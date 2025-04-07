<script>
	import Button from '$lib/components/Button.svelte';
	export let retryHandler = () => {};
	export let errorMessage = '';
</script>

<div class="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700 flex justify-between items-center">
	<span>{errorMessage}</span>
	<Button
		on:click={retryHandler}
		class="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
	>
		Retry
	</Button>
</div>
