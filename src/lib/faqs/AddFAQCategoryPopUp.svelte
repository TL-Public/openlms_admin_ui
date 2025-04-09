<script>
	import { onMount, onDestroy } from 'svelte';
	import { createEventDispatcher } from 'svelte';
	import DeletionErrorMessage from '$lib/components/DeletionErrorMessage.svelte';
	import InputField from '$lib/components/InputField.svelte';
	import LineLoader from '$lib/components/LineLoader.svelte';
	import Button from '$lib/components/Button.svelte';
	import { handleRedirection } from '$lib/utils/helper.js';
	import { page } from '$app/stores';

	export let formMode = 'POST'; // Determines if we are creating ('POST') or updating ('PUT')
	export let extId = null; // Tracks the `extId` from the first call
	export let formObject = {
		titleEn: '',
		titleHi: ''
	};

	let dispatch = createEventDispatcher();
	let errorMessage = '';
	let isSubmitting = false;
	let needsRetryHindi = false; // Tracks whether Hindi submission is pending

	// Track the initial state of titleHi (set this when initializing the form)
	let isNewHindiCategory = !formObject.titleHi; // True if titleHi was initially empty

	async function handleSubmit() {
		isSubmitting = true;
		errorMessage = '';

		// Prepare payloads
		let englishPayload =
			formMode === 'POST'
				? {
						category: formObject.titleEn,
						languageCode: 'en'
					}
				: {
						extId,
						category: formObject.titleEn,
						languageCode: 'en'
					};

		let hindiPayload = {
			extId,
			category: formObject.titleHi,
			languageCode: 'hi'
		};

		try {
			// If the first call (English) hasn't succeeded yet
			if (formMode === 'PUT' || !extId) {
				let method = formMode;

				let englishEndpoint =
					method === 'POST' ? '/apis/faqs/faqCategories' : `/apis/faqs/faqCategories/${extId}`;

				let englishResponse = await fetch(englishEndpoint, {
					method,
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify(englishPayload)
				});

				if (englishResponse?.status === 401) {
					handleRedirection(englishResponse.status, $page.url.pathname, $page.url.search);
				}
				if (englishResponse?.status === 409) {
					throw new Error('The English category name already exists. Please try again.');
				} else if (!englishResponse.ok) {
					throw new Error(
						`Failed to ${method === 'POST' ? 'add' : 'update'} the FAQ category. Please try again.`
					);
				} else {
					let englishResult = await englishResponse.json();
					extId = englishResult?.responseData?.extId; // Save extId for subsequent calls

					dispatch('handleAddFAQCategory', {
						englishResult: {
							extId,
							category: englishResult?.responseData?.category,
							languageCode: 'en'
						}
					});
				}
			}

			// If Hindi submission is pending or needs retry
			if (needsRetryHindi || formObject.titleHi) {
				let method;

				if (isNewHindiCategory) {
					method = 'POST'; // Use POST if the Hindi category is new
					hindiPayload.extId = extId;
				} else {
					method = 'PUT'; // Use PUT for updating existing data
					hindiPayload.extId = extId; // Ensure extId is included for PUT
				}

				let hindiEndpoint =
					method === 'POST' ? '/apis/faqs/faqCategories' : `/apis/faqs/faqCategories/${extId}`;

				hindiPayload.extId = extId; // Ensure extId is included

				let hindiResponse = await fetch(hindiEndpoint, {
					method,
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify(hindiPayload)
				});

				if (hindiResponse?.status === 401) {
					handleRedirection(hindiResponse.status, $page.url.pathname, $page.url.search);
				}

				if (hindiResponse.status === 409) {
					needsRetryHindi = true;
					throw new Error(
						`Successfully ${method === 'POST' ? 'added' : 'updated'} the English FAQ category, but the Hindi category name already exists.`
					);
				} else if (!hindiResponse.ok) {
					needsRetryHindi = true; // Mark Hindi submission as needing retry
					throw new Error(
						`Successfully ${method === 'POST' ? 'added' : 'updated'} the English FAQ category, but failed to ${method === 'POST' ? 'add' : 'update'} the Hindi category.`
					);
				} else {
					let hindiResult = await hindiResponse.json();

					dispatch('handleAddFAQCategory', {
						hindiResult: {
							extId,
							category: hindiResult?.responseData?.category,
							languageCode: 'hi'
						}
					});

					needsRetryHindi = false; // Clear retry flag on success
				}
			}

			// Clear form
			formObject = { titleEn: '', titleHi: '' };
			extId = null; // Reset extId for new submissions
			formMode = 'POST'; // Reset mode for next form submission
			dispatch('handleCancelSubmission');
		} catch (error) {
			errorMessage = error.message;
		} finally {
			isSubmitting = false;
		}
	}

	function handleCancel() {
		// Resets the form and related states
		formObject = { titleEn: '', titleHi: '' };
		isSubmitting = false;
		errorMessage = '';
		needsRetryHindi = false;
		extId = null;
		dispatch('handleCancelSubmission');
	}

	function handleErrorMessageClose() {
		errorMessage = '';
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
		on:click|stopPropagation
	></div>

	<form
		class="fixed inset-0 z-10 w-screen overflow-y-auto"
		id="form"
		on:submit|preventDefault={handleSubmit}
	>
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
						<DeletionErrorMessage
							{errorMessage}
							on:handleErrorMessageClose={handleErrorMessageClose}
						/>
					</div>
				{/if}
				<div class="mb-2">
					<h2 class=" heading-L">Add FAQ Category</h2>
					<div class="mt-4">
						<InputField
							label={'Category Name (in English)'}
							placeholder={'Enter Category Name'}
							name={'titleEn'}
							bind:value={formObject.titleEn}
							required={true}
						/>
					</div>
					<div class="mt-2 sm:mt-4">
						<InputField
							label={'Category Name (in Hindi)'}
							placeholder={'Enter Category Name'}
							name={'titleHi'}
							bind:value={formObject.titleHi}
							required={true}
						/>
					</div>

					<div class="mt-5 sm:mt-4 flex flex-col-reverse sm:flex-row-reverse gap-2">
						<Button type="submit" btnType="primary" disabled={isSubmitting || errorMessage}
							>Submit</Button
						>
						<Button
							type="button"
							btnType="secondary"
							disabled={isSubmitting}
							on:click={handleCancel}>Cancel</Button
						>
					</div>
				</div>
			</div>
		</div>
	</form>
</div>
