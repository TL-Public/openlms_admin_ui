<script>
	import Add from '$lib/trainingCenters/addTC/AddForm.svelte';
	import { page } from '$app/stores';
	import { checkActionPermission, combineErrorMessages } from '$lib/utils/helper.js';
	import { moduleNames, actionNames } from '$lib/data.js';
	import { onMount } from 'svelte';
	import SubmissionErrorMessage from '$lib/components/SubmissionErrorMessage.svelte';
	export let data;
	let { stateData, bankData } = data;
	$: secondaryErrors = combineErrorMessages(stateData?.error, bankData?.error);
</script>

{#if secondaryErrors}
	<div class=" mb-4">
		<SubmissionErrorMessage errorMessage={secondaryErrors} />
	</div>
{/if}
<Add {stateData} {bankData} route={$page.route.id} params={$page.params} />
