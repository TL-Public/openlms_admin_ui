
<script>
	import { page } from '$app/stores';
	import { message } from '/src/routes/nar/narStore.js';
	import AboutNarCard from '$lib/nar/narDetails/AboutNarCard.svelte';
	import SuccessMessage from '$lib/components/SuccessMessage.svelte';
	import ErrorMessage from '$lib/components/ErrorMessage.svelte';
	import { onDestroy } from 'svelte';

	export let data;

	let error = data?.narDetails?.error ? true : false;
	let narDetails = data?.narDetails[0];

	function handleSuccesMessageClose(e) {
		message.set('');
	}

onDestroy(()=>{
	message.set('');
})
</script>
{#if $message}
<SuccessMessage
	successMessage={$message}
	on:handleSuccessMessageClose={handleSuccesMessageClose}
/>
{/if}

{#if !error}
	<div class="mt-4 mb-4">
		<AboutNarCard {narDetails} />
	</div>
{:else}
	<ErrorMessage />
{/if}
