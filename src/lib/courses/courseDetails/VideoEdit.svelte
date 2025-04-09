<script>
	import { onMount, onDestroy, tick } from 'svelte';
	import { createEventDispatcher } from 'svelte';
	import InputField from '$lib/components/InputField.svelte';
	import VideoCamera from '$lib/svgComponents/VideoCamera.svelte';
	import DeletionErrorMessage from '$lib/components/DeletionErrorMessage.svelte';
	import LineLoader from '$lib/components/LineLoader.svelte';
	import Button from '$lib/components/Button.svelte';
	import { page } from '$app/stores';
	import { getErrorMessage, handleRedirection } from '$lib/utils/helper.js';
	import { resourceNames, userActions } from '$lib/data.js';
	import TextDescriptionField from '$lib/components/TextDescriptionField.svelte';


	export let video;
	
	let dispatch = createEventDispatcher();
	let errorMessage = '';
	let isSubmitting = false;


	let formObject = {
		name:video?.name,
		description:video?.description
	};

	$: dataToSend = {
		name:formObject?.name,
		description:formObject?.description,
		languageCode:video?.languageCode
	};

	function handleErrorMessageClose() {
		errorMessage = '';
	}


	function handleOutsideClick() {
		// Prevents any action when clicking outside the modal
		return;
	}

	function handleCancel() {
		errorMessage = '';
		dispatch('handleCancelSubmission');
	}


	async function handleSubmit() {
		let response;
		try {
			errorMessage = '';
			isSubmitting = true;

			response = await fetch(
				`/apis/videos/${video.uuid}`,
				{
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(dataToSend)
				}
			);
			
			if (!response.ok) {
				const { errorMsg, redirectUser } = getErrorMessage({
					status: response?.status,
					action: userActions.EDIT,
					module: resourceNames.VIDEO
				});

				if (redirectUser) {
					handleRedirection(response.status, $page.url.pathname, $page.url.search);
				}

				errorMessage = errorMsg;
			}

			const resultOfApiCall = await response.json();

			if (!resultOfApiCall.error) {
				if (response?.status === 200) {
					dispatch('handleEditVideo', { result:resultOfApiCall });
				}
			}
		} catch (error) {
		} finally {
			isSubmitting = false;
			if (!errorMessage ) {
				handleCancel();
			}
		}
	}

	onMount(() => {
		// Disable scrolling on the main page
		document.body.style.overflow = 'hidden';
	});

	onDestroy(() => {
		// Re-enable scrolling when the modal is closed
		document.body.style.overflow = '';
	});
</script>

<div class="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
	<div
		class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
		aria-hidden="true"
		on:click|stopPropagation={handleOutsideClick}
	></div>

	<form
		class="fixed inset-0 z-10 w-screen overflow-y-auto"
		id="form"
		on:submit|preventDefault={handleSubmit}
	>
		<div class="flex min-h-full justify-center p-4 text-center items-center sm:p-0">
			<div
				class="relative transform rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 w-full sm:w-full sm:max-w-lg sm:p-6"
			>
				<div class="pb-2">
					{#if isSubmitting}
						<LineLoader />
					{/if}
				</div>
				{#if errorMessage}
					<div class="mb-4">
						<DeletionErrorMessage
							{errorMessage}
							on:handleErrorMessageClose={handleErrorMessageClose}
						/>
					</div>
				{/if}
				<div class="mb-2">
					<div class="flex gap-1 items-center mb-4">
						<VideoCamera />

						<h2 class=" font-semibold">Edit Video Details</h2>
					</div>
					<div class="mt-4">
						<InputField
							label={'Name'}
							placeholder={'Enter name'}
							name={'name'}
							bind:value={formObject.name}
							required={true}
						/>
					</div>
					<div class="mt-4">
						<TextDescriptionField
						label={'Description'}
						placeholder={'Enter Video Description'}
						name={'video'}
						bind:value={formObject.description}
						required
					/>
					</div>
	
				</div>

				<div class="mt-5 sm:mt-4 flex gap-2 justify-end">
					<Button btnType="secondary" disabled={isSubmitting} on:click={handleCancel}>Cancel</Button
					>
					<Button type="submit" disabled={isSubmitting || errorMessage}>Submit</Button>
				</div>
			</div>
		</div>
	</form>
</div>
