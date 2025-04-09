<script>
	import { onMount, onDestroy } from 'svelte';
	import { createEventDispatcher } from 'svelte';
	import DeletionErrorMessage from '$lib/components/DeletionErrorMessage.svelte';
	import InputField from '$lib/components/InputField.svelte';
	import LineLoader from '$lib/components/LineLoader.svelte';
	import Button from '$lib/components/Button.svelte';
	import { handleRedirection } from '$lib/utils/helper.js';
	import { page } from '$app/stores';

	export let formObject = { key: '', value: '' };
	export let formMode = 'POST';
	export let key = '';

	let dispatch = createEventDispatcher();
	let errorMessage = '';
	let isSubmitting = false;

	async function handleSubmit() {
		isSubmitting = true;
		errorMessage = '';

		let endPoint = formMode === 'POST' ? '/apis/config' : `/apis/config/${key}`;

		try {
			let response = await fetch(endPoint, {
				method: formMode,
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(formObject)
			});

			if (response?.status === 401) {
				handleRedirection(response.status, $page.url.pathname, $page.url.search);
			}
			if (response?.status === 409) {
				throw new Error('This configuration key already exists. Please try again.');
			} else if (!response.ok) {
				throw new Error('Failed to add the config. Please try again.');
			} else {
				let result = await response.json();
				dispatch('handleConfigAddition', result);
			}

			formObject = { key: '', value: '' };

			dispatch('handleCancelSubmission');
		} catch (error) {
			errorMessage = error.message;
		} finally {
			isSubmitting = false;
		}
	}

	function handleCancel() {
		formObject = { key: '', value: '' };
		isSubmitting = false;
		errorMessage = '';
		dispatch('handleCancelSubmission');
	}

	function handleErrorMessageClose() {
		errorMessage = '';
	}

	onMount(() => {
		document.body.style.overflow = 'hidden';
	});

	onDestroy(() => {
		document.body.style.overflow = '';
	});
</script>

<div class="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
	<div
		class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
		aria-hidden="true"
		on:click|stopPropagation
	></div>

	<form class="fixed inset-0 z-10 w-screen overflow-y-auto" on:submit|preventDefault={handleSubmit}>
		<div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
			<div
				class="relative transform rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6"
			>
				{#if isSubmitting}
					<LineLoader />
				{/if}
				{#if errorMessage}
					<DeletionErrorMessage
						{errorMessage}
						on:handleErrorMessageClose={handleErrorMessageClose}
					/>
				{/if}
				<div class="mb-2">
					<h2 class="heading-L">
						{formMode == 'POST' ? 'Add Configuration' : 'Edit Configuration'}
					</h2>
					<div class="mt-4">
						<InputField
							label="Config Key"
							placeholder="Enter Key"
							name="key"
							bind:value={formObject.key}
							required={true}
							disabled={formMode == 'PUT'}
						/>
					</div>
					<div class="mt-2 sm:mt-4">
						<InputField
							label="Config Value"
							placeholder="Enter Value"
							name="value"
							bind:value={formObject.value}
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
