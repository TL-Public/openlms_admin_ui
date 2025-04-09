<script>
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import AddTraineeFormNew from '$lib/trainees/addTrainee/AddTraineeFormNew.svelte';
	import ErrorMessage from '$lib/components/ErrorMessage.svelte';

	export let data;

	let { traineeDetailsData } = data;

	$: error = traineeDetailsData?.error ? true : false;
</script>

{#if !error}
	<AddTraineeFormNew route={$page.route.id} params={$page.params} formObject={traineeDetailsData} />
{:else}
	<ErrorMessage error={'Failed to fetch data'} />
{/if}
