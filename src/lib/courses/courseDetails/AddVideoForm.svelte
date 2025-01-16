<script>
	import { onMount, onDestroy, tick } from "svelte";
	import { createEventDispatcher } from 'svelte';
	import { languageArray } from '/src/config/constants.js';
	import InputField from '$lib/components/InputField.svelte';
	import VideoCamera from '$lib/svgComponents/VideoCamera.svelte';
	import DeletionErrorMessage from '$lib/components/DeletionErrorMessage.svelte';
	import DropDown from '$lib/components/DropDown.svelte';
	import LineLoader from '$lib/components/LineLoader.svelte';
	import Button from '$lib/components/Button.svelte';


	export let chapterUuid;
	export let courseUuid;
	export let selectedLanguage;
	export let orderNumber;
	export let chapterData={}

	let dispatch = createEventDispatcher();
	let errorMessage = '';
	let selectedItemCode = '';
	let validationErrors = '';
	let isSubmitting = false;
	let selectedItemName = selectedLanguage;

	let formObject = {
		url: '',
	};

	$: dataToSend = {
		url: formObject?.url,
		orderNumber: orderNumber,
		languageCode: selectedItemCode
	};

	function handleErrorMessageClose(){
		errorMessage=''
	}

	// Reactively update `selectedItemCode` when `selectedItemName` changes
	$: {   
		if (selectedItemName) {
			getCodeByName(selectedItemName);
			validationErrors=''
		}
	}

	// Function to map language name/code to the corresponding code
	function getCodeByName(name) {
		for (let item of languageArray) {
			if (item?.name?.toLowerCase().trim() === name?.toLowerCase().trim()) {
				selectedItemCode = item.code;
				dataToSend.languageCode=selectedItemCode
				return;
			}
			if (item?.code?.toLowerCase().trim() === name?.toLowerCase().trim()) {
				selectedItemName = item.name;
				selectedItemCode = item.code;
				dataToSend.languageCode=selectedItemCode
				return;
			}
		}
		dataToSend=dataToSend
		selectedItemCode = ''; // Reset if no match is found
	}

	function handleOutsideClick() {
		// Prevents any action when clicking outside the modal
		return;
	}

	function handleCancel() {
		errorMessage = '';
		validationErrors=''
		dispatch('handleCancelSubmission');
	}

	function handleCancelSelectionInDropDown() {
		formObject.languageCode = '';
		selectedItemCode=''
		selectedItemName = '';
		validationErrors=''
	}

	async function handleSubmit() {
		try {
			errorMessage = '';
			isSubmitting = true;
			validationErrors = '';

			if (!dataToSend?.languageCode) {
				validationErrors = `The field should not be empty.`;
				await tick()
				return;
			}
			 // Validate if the URL already exists
			 const duplicate = chapterData?.videos?.some((video) => video?.url === formObject?.url);
			 
				if (duplicate) {
					errorMessage = `Failed to add video. Video already exists.`;
					return;
				}

	
			const response = await fetch(
				`/apis/courses/details/${courseUuid}/chapters/${chapterUuid}/videos?courseUuid=${courseUuid}&&chapterUuid=${chapterUuid}`,
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(dataToSend)
				}
			);

			if (!response.ok) {
				errorMessage = `Failed to add video. Please try again!`;
				throw new Error('Failed to add video');
			}
			const resultOfApiCall = await response.json();
			let result
			
			if (!resultOfApiCall.error) {
				result = resultOfApiCall.responseData
				if(resultOfApiCall?.status===201){
					dispatch('handleAddVideo', { result });
				}
			} else {
				if(resultOfApiCall?.status===409){
				errorMessage = `Failed to add video. Video already exists.`
				}
				else{
					errorMessage = `Failed to add video. Please try again.`;
				}
			}
		} catch (error) {
			console.error('Error:', error);
		} finally {
			isSubmitting = false;
			if (!errorMessage && !validationErrors) {
				handleCancel();
			}
		}
	}

	onMount(() => {
		// Disable scrolling on the main page
		document.body.style.overflow = "hidden";

	});

	onDestroy(() => {
		// Re-enable scrolling when the modal is closed
		document.body.style.overflow = "";

	});
</script>

<div class="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
	<div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"
	on:click|stopPropagation={handleOutsideClick}></div>

	<form class="fixed inset-0 z-10 w-screen overflow-y-auto" id="form" on:submit|preventDefault={handleSubmit}>
		<div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
			<div
				class="relative transform rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6"
			>
			<div class="pb-2">
				{#if isSubmitting}
				<LineLoader />
				{/if}
			</div>
				{#if errorMessage}
					<div class="mb-4">
						<DeletionErrorMessage {errorMessage} 
						on:handleErrorMessageClose={handleErrorMessageClose}/>
					</div>
				{/if}
				<div class="mb-2">
					<div class="flex gap-1 items-center">
						<VideoCamera />

						<h2 class=" font-semibold">Add Video Details</h2>
					</div>
					<div class="mt-4">
						<InputField
							label={'Video URL'}
							placeholder={'Enter URL'}
							name={'urlEn'}
							bind:value={formObject.url}
							required={true}
						/>
					</div>
					<div class="mt-2 w-full">
    				<h1 class="block text-sm font-medium leading-6 text-gray-900 mb-1 capitalize">Language</h1>
						<DropDown
							on:handleCancelSelection={handleCancelSelectionInDropDown}
							bind:selectedItemName
							options={languageArray}
							placeholder={'Select language'}
							validationErrors={validationErrors ? validationErrors : ''}
							type={'langaugeList'}
						/>
					</div>
				</div>

				<div class="mt-5 sm:mt-4 flex gap-2 justify-end">
					<Button type='submit' disabled={isSubmitting || errorMessage }>Submit</Button>
					<Button btnType="secondary" disabled={isSubmitting} on:click={handleCancel}>Cancel</Button
					>
				</div>
			</div>
		</div>
	</form>
</div>