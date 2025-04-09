<script>
	import { page } from '$app/stores';
	import AddUserForm from '$lib/users/addUser/AddUserForm.svelte';

	import { checkActionPermission } from '$lib/utils/helper.js';
	import { moduleNames, actionNames, roleIds, resourceNames } from '$lib/data.js';
	import ErrorMessage from '$lib/components/ErrorMessage.svelte';
	import SubmissionErrorMessage from '$lib/components/SubmissionErrorMessage.svelte';
	import { combineErrorMessages } from '$lib/utils/helper.js';

	export let data;
	let { rsetiData, stateData, userDetails } = data;

	//primary data is the most important data on the page. Error in loading this data means, the page itself will be shown as an error page
	$: primaryDataError = userDetails?.error ? userDetails?.error : '';

	//data other than primary data is considered secondary errors - shown at top of the page.
	$: secondaryErrors = combineErrorMessages(stateData?.error, rsetiData?.error);

	$: if (!rsetiData?.error) {
		rsetiData = rsetiData?.flatMap((rseti) => {
			if (!rseti.uuid || rseti.uuid === '0' || !rseti.translations) return []; // Return early if uuid is missing
			return rseti.translations
				.filter((translation) => translation?.languageCode === 'en')
				.map((translation) => ({
					name: translation.name,
					id: rseti.uuid,
					stateId: rseti.stateId
				}));
		});
	}

	$: if (!stateData?.error) {
		stateData =
			stateData?.flatMap((state) => {
				return state.uuid != 0 && state.languageCode === 'en'
					? [{ id: state?.extId, name: state?.name }]
					: [];
			}) || [];
	}
</script>

{#if secondaryErrors}
	<div class=" mb-4">
		<SubmissionErrorMessage errorMessage={secondaryErrors} />
	</div>
{/if}
{#if primaryDataError}
	<div class=" mb-4">
		<ErrorMessage error={primaryDataError} />
	</div>
{:else}
	<AddUserForm
		stateOptionList={stateData.error ? [] : stateData}
		rsetiOptionList={rsetiData.error ? [] : rsetiData}
		method="PUT"
		formObject={userDetails}
	/>
{/if}
