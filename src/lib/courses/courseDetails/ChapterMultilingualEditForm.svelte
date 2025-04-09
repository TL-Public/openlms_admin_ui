<script>
	import { onMount, onDestroy } from 'svelte';
	import { createEventDispatcher } from 'svelte';
	import InputField from '$lib/components/InputField.svelte';
	import TextDescriptionField from '$lib/components/TextDescriptionField.svelte';
	import DeletionErrorMessage from '$lib/components/DeletionErrorMessage.svelte';
	import LineLoader from '$lib/components/LineLoader.svelte';
	import Book from '$lib/svgComponents/Book.svelte';
	import Button from '$lib/components/Button.svelte';

	export let name = '';
	export let name2 = '';
	export let description = '';
	export let description2 = '';
	export let uuid;
	export let orderNumber;
	export let courseUuid;

	let dispatch = createEventDispatcher();
	let errorMessage = '';
	let previousName = name ? name : '';
	let isSubmitting = false;

	$: formObject = {
		titleEn: name ? name : '',
		titleHi: name2 ? name2 : '',
		descriptionEn: description ? description : '',
		descriptionHi: description2 ? description2 : ''
	};

	$: dataToSend = {
		orderNumber: orderNumber,
		translations: [
			{
				title: formObject?.titleEn,
				description: formObject?.descriptionEn,
				languageCode: 'en'
			},
			{
				title: formObject?.titleHi,
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
		dispatch('handleCancelSubmission');
	}

	async function handleSubmit() {
		try {
			errorMessage = '';
			isSubmitting = true;
			const response = await fetch(
				`/apis/courses/details/${courseUuid}/chapters/${uuid}?courseUuid=${courseUuid}&&uuid=${uuid}`,
				{
					method: 'PUT',
					body: JSON.stringify(dataToSend)
				}
			);

			if (!response.ok) {
				errorMessage = `Failed to edit chapter. Please try again!`;
				throw new Error('Failed to edit chapter');
			}
			const result = await response.json();
			if (!result.error) {
				dispatch('handleEditChapter', { result, previousTitle: previousName });
			} else {
				errorMessage = `Failed to edit chapter. Please try again!`;
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

<div
	class="relative z-10 "
	aria-labelledby="modal-title"
	role="dialog"
	aria-modal="true"
>
	<div
		class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity pointer-events-none"
		aria-hidden="true"
		on:click|stopPropagation={handleOutsideClick}
	></div>

	<div class="fixed inset-0 z-10 w-screen overflow-y-auto" id="form">
		<div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
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

						<h2 class=" font-semibold text-primary">Edit Chapter Details</h2>
					</div>
					<h4 class=" text-xs mb-4">
						Language wise details are necessary for multi-lingual support
					</h4>
					<!-- First Row -->

					<div class="flex items-center space-x-2 mb-4">
						<div class="flex">
							<h3 class="font-semibold">English</h3>
							<span class="text-red-500">*</span>
						</div>
						<span class="text-xs">(Fill the details in english)</span>
					</div>

					<div class="grid grid-cols-1 mb-4 gap-2">
						<InputField
							label={'Chapter Title'}
							placeholder={'Enter Chapter Title'}
							name={'titleEn'}
							bind:value={formObject.titleEn}
							required
						/>
						<TextDescriptionField
							label={'Description'}
							placeholder={'Enter Chapter Description'}
							name={'descriptionEn'}
							bind:value={formObject.descriptionEn}
						/>
					</div>
					<hr class="my-4 border-t border-darkGray" />
					<div class="flex items-center space-x-2 mb-4">
						<div class="flex">
							<h3 class="font-semibold">Hindi</h3>
						</div>
						<span class="text-xs">(Fill the details in hindi)</span>
					</div>

					<div class="grid grid-cols-1 mb-4 gap-2">
						<InputField
							label={'Chapter Title'}
							placeholder={'Enter Chapter Title'}
							name={'titleHi'}
							bind:value={formObject.titleHi}
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
					<Button on:click={handleSubmit} disabled={isSubmitting}>Submit</Button>
					<Button btnType="secondary" disabled={isSubmitting} on:click={handleCancel}>Cancel</Button
					>
				</div>
			</div>
		</div>
	</div>
</div>

