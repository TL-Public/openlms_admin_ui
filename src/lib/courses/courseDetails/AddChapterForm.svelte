<script>
	import { onMount, onDestroy } from 'svelte';
	import { createEventDispatcher } from 'svelte';
	import DeletionErrorMessage from '$lib/components/DeletionErrorMessage.svelte';
	import InputField from '$lib/components/InputField.svelte';
	import TextDescriptionField from '$lib/components/TextDescriptionField.svelte';
	import Book from '$lib/svgComponents/Book.svelte';
	import LineLoader from '$lib/components/LineLoader.svelte';
	import Button from '$lib/components/Button.svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { getErrorMessage } from '$lib/utils/helper.js';
	import { resourceNames, userActions } from '$lib/data.js';

	export let courseUuid;
	export let orderNumber;

	let dispatch = createEventDispatcher();
	let errorMessage = '';
	let isSubmitting = false;
	let formObject = {
		chapterNameEn: '',
		chapterNameHi: '',
		descriptionEn: '',
		descriptionHi: ''
	};

	$: dataToSend = {
		orderNumber: orderNumber,
		translations: [
			{
				title: formObject?.chapterNameEn,
				description: formObject?.descriptionEn,
				languageCode: 'en'
			},
			{
				title: formObject?.chapterNameHi,
				description: formObject?.descriptionHi,
				languageCode: 'hi'
			}
		]
	};

	function handleOutsideClick() {
		// Prevents any action when clicking outside the modal
		return;
	}

	function handleCancel() {
		errorMessage = '';
		dispatch('handleCancelSubmission');
	}

	async function handleSubmit(e) {
		// Using fetch functions and not using form wont trigger required automatically hence using this logic
		// Collect all inputs inside your modal
		const inputs = Array.from(document.querySelectorAll('input[required], textarea[required]'));

		// Check if all required fields are valid
		const allValid = inputs.every((input) => input.checkValidity());

		if (!allValid) {
			// If not valid, trigger native error display
			inputs.forEach((input) => input.reportValidity());
			return; // Stop submission if any field is invalid
		}
		let response;
		try {
			errorMessage = '';
			isSubmitting = true;
			response = await fetch(`/apis/courses/details/${courseUuid}/chapters`, {
				method: 'POST',
				body: JSON.stringify(dataToSend)
			});

			if (!response.ok || response.status != 201) {
				const { errorMsg, redirectUser } = getErrorMessage({
					status: response?.status,
					action: userActions.ADD,
					module: resourceNames.CHAPTER
				});

				if (redirectUser) {
					handleRedirection(response.status, $page.url.pathname, $page.url.search);
				}

				errorMessage = errorMsg;
			}

			const result = await response.json();

			if (!result.error) {
				dispatch('handleAddChapter', { result, titleEn: formObject?.chapterNameEn });
			}
		} catch (error) {
			console.error('Error:', error);
		} finally {
			isSubmitting = false;
			if (!errorMessage) {
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
		on:click|preventDefault
	></div>

	<div class="fixed inset-0 z-10 w-screen overflow-y-auto" id="form">
		<div class="flex min-h-full justify-center p-4 text-center items-center sm:p-0">
			<div
				class="relative transform overflow-hidden rounded-lg bg-gray-10 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6"
				on:click|stopPropagation
			>
				<div class="pb-2">
					{#if isSubmitting}
						<LineLoader />
					{/if}
				</div>
				{#if errorMessage}
					<div class="mb-4">
						<DeletionErrorMessage {errorMessage} />
					</div>
				{/if}

				<div class="text-darkGray">
					<div class="flex gap-1 items-center">
						<Book stroke={'#FF6A1F'} />

						<h2 class=" font-semibold text-primary">Add Chapter Details</h2>
					</div>
					<h4 class=" text-xs mb-4 text-darkGray">
						Language wise details are necessary for multi-lingual support
					</h4>
					<!-- First Row -->
					<div class="flex mb-2">
						<h3>
							<span class="font-semibold mb-2">English</span> <span class="text-red-500">*</span>
							<span class="text-xs">(Fill the details in hindi)</span>
						</h3>
					</div>

					<div class="grid grid-cols-1 gap-2">
						<InputField
							label={'Chapter Name'}
							placeholder={'Chapter Name'}
							name={'topicEn'}
							bind:value={formObject.chapterNameEn}
							required
						/>
						<TextDescriptionField
							label={'Description'}
							placeholder={'Enter Chapter Description'}
							name={'descriptionEn'}
							bind:value={formObject.descriptionEn}
						/>
					</div>
					<hr class="my-6 horizontal-line" />
					<h3 class="mb-2">
						<span class="font-semibold"> Hindi </span>
						<span class="text-xs">(Fill the details in hindi)</span>
					</h3>
					<div class="grid grid-cols-1 mb-4 gap-2">
						<InputField
							label={'Chapter Name'}
							placeholder={'Enter Chapter Name'}
							name={'topicHi'}
							bind:value={formObject.chapterNameHi}
						/>
						<TextDescriptionField
							label={'Description'}
							placeholder={'Enter Chapter Description'}
							name={'descriptionHi'}
							bind:value={formObject.descriptionHi}
						/>
					</div>
				</div>

				<div class="mt-5 sm:mt-4 flex gap-2 justify-end">
					<Button btnType="secondary" disabled={isSubmitting} on:click={handleCancel}>Cancel</Button
					>
					<Button on:click={handleSubmit} disabled={isSubmitting}>Submit</Button>
				</div>
			</div>
		</div>
	</div>
</div>
