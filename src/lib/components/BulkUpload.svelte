<script>
	import { createEventDispatcher, onDestroy } from 'svelte';
	import DragAndDrop from '$lib/components/DragAndDrop.svelte';
	import DeletionErrorMessage from '$lib/components/DeletionErrorMessage.svelte';
	import SuccessMessage from '$lib/components/SuccessMessage.svelte';
	import Button from '$lib/components/Button.svelte';
	import {showLoadingSpinner} from '/src/routes/store.js'

	export let bulkUploadItemName = '';
	export let endPoint = '';
	export let templatePath = '';
	export let templateFileName = 'template.xlsx';

	let dispatch = createEventDispatcher();
	let fileToUpload = null;
	let errorMessage = '';
	let successMessage = '';
	let isSubmitting = false;
	let errorReportUrl=''

	function handleFileUpload(e) {
		fileToUpload = e.detail;
	}

	function handleFileRemoval(e) {
		handleCancel();
	}

	function handleCancel() {
		fileToUpload = null;
		errorMessage = '';
		isSubmitting = false;
		showLoadingSpinner.set(false)
	}

	function handleSuccessMessageClose() {
		successMessage = '';
	}

	async function handleSubmit() {
		try {
			errorMessage = '';
			successMessage = '';
			errorReportUrl = '';
			isSubmitting = true;
			showLoadingSpinner.set(true)
			if (!fileToUpload) {
				errorMessage = 'Please select a file to continue';
				return;
			}
			let formData = new FormData();
			formData.append('file', fileToUpload);

			const response = await fetch(`${endPoint}`, {
				method: 'POST',
				body: formData
			});
			const result = await response?.json();
			if (!response.ok || !response.status === 200) {
				errorMessage = `Failed to bulk upload ${bulkUploadItemName}. Please try again. ( Error:${result?.error} ) `;
				errorReportUrl = result?.errorReportUrl||'';
				throw new Error(`Failed to bulk upload ${bulkUploadItemName}.`);
			}
			if (!result.error) {
				successMessage = `Succesfully bulk uploaded ${bulkUploadItemName}`;
			} else {
				errorMessage = `Failed to bulk upload ${bulkUploadItemName}. Please try again. ( Error:'${result?.error})`;
			}
		} catch (error) {
			console.error('Error:', error);
		} finally {
			isSubmitting = false;
			showLoadingSpinner.set(false)
			if (!errorMessage) {
				handleCancel();
			}
		}
	}

	onDestroy(()=>{
		showLoadingSpinner.set(false)
	})
</script>

<h2 class="mb-2 font-semibold capitalize text-primary">Bulk upload {bulkUploadItemName}</h2>
<div class="mb-2">

	{#if errorMessage}
	<DeletionErrorMessage
	{errorMessage}
	>
		
		{#if errorReportUrl}
			<a
				href={errorReportUrl}
				class="text-sm  text-red-800 hover:text-red-600 font-medium underline"
				target="_blank"
				rel="noopener noreferrer"
			>
				Click to view error report
			</a>
		{/if}
	</DeletionErrorMessage>
	{/if}
	
	{#if successMessage}
		<SuccessMessage {successMessage} on:handleSuccessMessageClose={handleSuccessMessageClose} />
	{/if}
</div>
<section class="flex flex-col gap-4">
	<DragAndDrop
		uploadItemName={bulkUploadItemName}
		on:handleFileUpload={handleFileUpload}
		on:handleFileRemoval={handleFileRemoval}
	/>
	{#if fileToUpload}
		<div class="flex justify-end mb-4">
			<Button disabled={isSubmitting} on:click={handleSubmit}>Submit</Button>
		</div>
	{/if}
</section>

<div class="flex p-4 items-start gap-2">
	<p class="text-sm">Please follow this format for bulk upload:</p>
	<a href={templatePath} download={templateFileName} class="text-primary text-sm hover:underline">
		Download Template
	</a>
</div>
