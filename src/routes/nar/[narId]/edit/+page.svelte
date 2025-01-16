<script>
	import { page } from '$app/stores';
	import AddNarForm from '$lib/nar/addNar/AddNarForm.svelte';
	import ErrorMessage from '$lib/components/ErrorMessage.svelte';

	export let data;

	let {narDetails} = data
	let formObject = [];
	$:error = narDetails?.error?true:false

	$: if(!error) {
		let nar = narDetails[0];
		let phoneNumberArray = [];
		let emailArray = [];
	
		if (nar?.phoneNumber) {
			phoneNumberArray = nar?.phoneNumber.split(';');
		}
		if (nar?.email) {
			emailArray = nar?.email.split(';');
		}

		formObject = {
			address:nar?.address,
			phoneno1: phoneNumberArray[0],
			phoneno2: phoneNumberArray[1],
			email1: emailArray[0],
			email2: emailArray[1],
			uuid: nar?.uuid
		};
	}

</script>

{#if !error}
<AddNarForm route={$page.route.id} params={$page.params} {formObject} />
{:else}
	<ErrorMessage error={'Failed to fetch data'} />
{/if}
