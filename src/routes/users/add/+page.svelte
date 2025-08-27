<script>
	import { page } from '$app/stores';
	import AddUserForm from '$lib/users/addUser/AddUserForm.svelte';
	import SubmissionErrorMessage from '$lib/components/SubmissionErrorMessage.svelte';
	import { combineErrorMessages } from '$lib/utils/helper.js';

	let userData = {};

	export let data;
	let { rsetiData, stateData } = data;

	//primary data is the most important data on the page. Error in loading this data means, the page itself will be shown as an error page
	// in add page, there is no primary data to be loaded.

	//data other than primary data is considered secondary errors - shown at top of the page.
	$: secondaryErrors = combineErrorMessages(stateData?.error, rsetiData?.error);

	$: if (!rsetiData?.error) {
		rsetiData =
			rsetiData?.map((rseti) => {
				if (!rseti?.uuid || rseti?.uuid === '0' || !rseti.translations) return null;
				const enTranslation = rseti?.translations?.find(t => t?.languageCode === 'en');
				if (!enTranslation) return null;
				return {
					name: enTranslation?.name,
					id: rseti?.uuid,
					stateId: rseti?.stateId
				};
			}).filter(Boolean) || [];
	}

	$: if (!stateData?.error) {
		stateData =
			stateData?.flatMap((state) => {
				return state.uuid != 0 && state.languageCode === 'en'
					? [{ id: state?.extId, name: state?.name }]
					: [];
			}) || [];
	}
	function handleUserdata(event) {
		userData = event.details;
	}
</script>

{#if secondaryErrors}
	<div class=" mb-4">
		<SubmissionErrorMessage errorMessage={secondaryErrors} />
	</div>
{/if}

<AddUserForm
	on:userData={handleUserdata}
	stateOptionList={stateData.error ? [] : stateData}
	rsetiOptionList={rsetiData.error ? [] : rsetiData}
/>
