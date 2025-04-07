<script>
	import UserDetailsPreview from '$lib/users/UserDetailsPreview.svelte';
	import { page } from '$app/stores';
	import { onMount, onDestroy } from 'svelte';
	import { rolesList } from '$lib/data.js';
	import { message } from '/src/routes/users/userStore.js';
	import SuccessMessage from '$lib/components/SuccessMessage.svelte';
	import ErrorMessage from '$lib/components/ErrorMessage.svelte';
	import SubmissionErrorMessage from '$lib/components/SubmissionErrorMessage.svelte';
	import { combineErrorMessages } from '$lib/utils/helper.js';

	export let data;
	let { userDetails, stateData, rsetiData } = data;

	//primary data is the most important data on the page. Error in loading this data means, the page itself will be shown as an error page
	$: primaryDataError = userDetails?.error ? userDetails?.error : '';

	//data other than primary data is considered secondary errors - shown at top of the page.
	$: secondaryErrors = combineErrorMessages(stateData?.error, rsetiData?.error);

	let stateName = !stateData.error
		? stateData?.find((item) => item.languageCode === 'en' && item.extId === userDetails.stateId)
				?.name
		: '';

	const rsetiDetails = !rsetiData.error
		? rsetiData?.find((item) => item?.uuid === userDetails?.rsetiId)
		: {};

	let rsetiName = rsetiDetails?.translations?.find((item) => item?.languageCode === 'en')?.name;

	function handleSuccesMessageClose(e) {
		message.set('');
	}

	onDestroy(() => {
		message.set('');
	});
</script>

<div class="mb-2">
	{#if $message}
		<SuccessMessage
			successMessage={$message}
			on:handleSuccessMessageClose={handleSuccesMessageClose}
		/>
	{/if}

	{#if secondaryErrors}
		<div class=" mb-4">
			<SubmissionErrorMessage errorMessage={secondaryErrors} />
		</div>
	{/if}
</div>


{#if primaryDataError}
	<div class=" mb-4">
		<ErrorMessage error={primaryDataError} />
	</div>
{:else}
	<div class="bg-white lg:p-6 p-4 rounded-lg">
		<UserDetailsPreview
			route={$page.route.id}
			params={$page.params}
			userData={userDetails}
			{rolesList}
			{stateName}
			{rsetiName}
      enableEdit={true}
			imageUrl={userDetails.photoUrl ? `${userDetails.photoUrl}?t=${Date.now()}` : ''}
		/>
	</div>
{/if}

