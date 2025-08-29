<script>
	import { createEventDispatcher, onDestroy, onMount } from 'svelte';
	import { page } from '$app/stores';
	import { showLoadingSpinner } from '/src/routes/store.js';
	import { getErrorMessage, handleRedirection } from '$lib/utils/helper.js';
	import DragAndDrop from '$lib/components/DragAndDrop.svelte';
	import DeletionErrorMessage from '$lib/components/DeletionErrorMessage.svelte';
	import SuccessMessage from '$lib/components/SuccessMessage.svelte';
	import Button from '$lib/components/Button.svelte';
	import TextDescriptionField from '$lib/components/TextDescriptionField.svelte';

	export let bulkUploadItemName = '';
	export let endPoint = '';
	export let templatePath = '';
	export let templateFileName = 'template.xlsx';
	export let usePolling = false;

	let dispatch = createEventDispatcher();
	let fileToUpload = null;
	let errorMessage = '';
	let successMessage = '';
	let isSubmitting = false;
	let errorReportUrl = '';
	let description = null;

	let isPolling = false;
	let jobUuid = '';
	let processingStatus = '';
	let processedRows = 0;
	let successRows = 0;
	let failedRows = 0;
	let totalRows = 0;
	let pollingInterval;
	let resultFile = '';

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
		isPolling = false;
		processingStatus = '';
		jobUuid = '';
		processedRows = 0;
		successRows = 0;
		failedRows = 0;
		totalRows = 0;
		resultFile = '';
		errorReportUrl = '';
		description = null;
		if (pollingInterval) {
			clearInterval(pollingInterval);
			pollingInterval = null;
		}
		showLoadingSpinner.set(false);
	}

	function handleSuccessMessageClose() {
		successMessage = '';
	}

	async function pollJobStatus() {
		let result;
		let response;
		try {
			if (!jobUuid) throw new Error('Bulk upload job uuid is missing. Please try again.');

			response = await fetch(`/apis/jobs/${jobUuid}`, {
				method: 'GET'
			});

			if (!response.ok) {
				if (response.status === 401 || response.status === 403) {
					handleRedirection(response.status, $page.url.pathname, $page.url.search);
				}
				throw new Error('Failed to fetch bulk upload job status. Please try again.');
			}

			result = await response.json();

			// Update status information
			processingStatus = result.status;
			processedRows = result.processedRows;
			successRows = result?.successCount;
			failedRows = result?.failureCount;
			totalRows = result.totalRows;
			resultFile = result?.resultFileUrl;

			// If job is completed, stop polling
			if (result.status === 'COMPLETED') {
				clearInterval(pollingInterval);
				isPolling = false;
				isSubmitting = false;
				// showLoadingSpinner.set(false);

				if (result.failureCount > 0) {
					errorMessage = `Completed with ${result.failureCount} errors. Please check the error report.`;
					if (result.resultFileUrl) errorReportUrl = result.resultFileUrl;
				} else if (result?.errorMessage) {
					errorMessage = `Failed to process ${bulkUploadItemName}. Please try again. Error: ${result?.errorMessage || '-'}`;
				} else {
					successMessage = `Successfully uploaded ${result.successCount} ${bulkUploadItemName}`;
				}
			} else if (result.status === 'FAILED') {
				clearInterval(pollingInterval);
				isPolling = false;
				isSubmitting = false;
				// showLoadingSpinner.set(false);
				errorMessage = `Failed to process ${bulkUploadItemName}. Please try again. Error: ${result?.errorMessage || '-'}`;
				if (result.resultFileUrl) {
					errorReportUrl = result.resultFileUrl;
				}
			}
		} catch (error) {
			console.error('Error polling job status:', error);
			handleCancel();
			errorMessage =
				error?.message ||
				`Unexpected error occured. Please try again. Error:${response?.status || '-'}`;
		}
	}

	async function handleSubmit() {
		try {
			errorMessage = '';
			successMessage = '';
			errorReportUrl = '';
			resultFile = '';
			isSubmitting = true;
			isPolling = false;
			jobUuid = '';
			processingStatus = '';
			processedRows = 0;
			totalRows = 0;
			failedRows = 0;
			totalRows = 0;
			// showLoadingSpinner.set(true);

			if (!fileToUpload) {
				errorMessage = 'Please select a file to continue';
				isSubmitting = false;
				// showLoadingSpinner.set(false);
				return;
			}

			let formData = new FormData();
			formData.append('file', fileToUpload);

			if (usePolling) {
				if (description) formData.append('description', description);
				const response = await fetch(`${endPoint}`, {
					method: 'POST',
					body: formData
				});

				const result = await response.json();

				if (!response.ok) {
					if (response.status === 401 || response.status === 403) {
					handleRedirection(response.status, $page.url.pathname, $page.url.search);
					}
					errorMessage = `Failed to upload ${bulkUploadItemName}. Please try again. (Error: ${result?.error || response?.statusText})`;
					isSubmitting = false;
					// showLoadingSpinner.set(false);
					return;
				}

				jobUuid = result.jobUuid;

				// Start polling
				isPolling = true;
				processingStatus = 'PROCESSING';
				pollingInterval = setInterval(pollJobStatus, 5000);
			} else {
				showLoadingSpinner.set(true);
				// Use the original approach for other bulk uploads
				const response = await fetch(`${endPoint}`, {
					method: 'POST',
					body: formData
				});

				const result = await response?.json();
				if (!response.ok || response.status !== 200) {
				if (response.status === 401 || response.status === 403) {
					handleRedirection(response.status, $page.url.pathname, $page.url.search);
				}

					errorMessage = `Failed to bulk upload ${bulkUploadItemName}. Please try again. (Error: ${result?.error})`;
					errorReportUrl = result?.errorReportUrl || '';
					throw new Error(`Failed to bulk upload ${bulkUploadItemName}.`);
				}

				if (!result.error) {
					successMessage = `Successfully bulk uploaded ${bulkUploadItemName}`;
				} else {
					errorMessage = `Failed to bulk upload ${bulkUploadItemName}. Please try again. (Error: ${result?.error})`;
				}

				isSubmitting = false;
				showLoadingSpinner.set(false);

				if (!errorMessage) {
					handleCancel();
				}
			}
		} catch (error) {
			console.error('Error:', error);
			isSubmitting = false;
			isPolling = false;
			showLoadingSpinner.set(false);
		}
	}

	onDestroy(() => {
		showLoadingSpinner.set(false);
		if (pollingInterval) {
			clearInterval(pollingInterval);
		}
	});
</script>

<h2 class="mb-2 font-semibold capitalize text-primary">Bulk upload {bulkUploadItemName}</h2>
<div class="mb-2">
	{#if errorMessage}
		<DeletionErrorMessage {errorMessage}>
			{#if errorReportUrl}
				<a
					href={errorReportUrl}
					class="text-sm text-red-800 hover:text-red-600 font-medium underline"
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

<section class="flex flex-col">

	{#if isPolling}
		<div class="bg-white border border-blue-100 rounded-md p-2.5 shadow-sm w-full my-2">
			<!-- Header -->
			<div class="flex justify-between items-center mb-1.5">
				<span class="font-semibold text-darkGray text-sm">Processing Bulk Upload</span>
				<span class="text-xs text-gray-500">{processedRows} of {totalRows || 0} rows</span>
			</div>

			<!-- Progress Bar -->
			<div class="mb-1.5">
				<div class="flex justify-between text-xs text-gray-500 mb-1">
					<span>Progress</span>
					<span>{totalRows > 0 ? Math.round((processedRows / totalRows) * 100) : 0}%</span>
				</div>
				<div class="w-full bg-gray-200 rounded-full h-1.5">
					<div
						class="bg-accent h-1.5 rounded-full transition-all duration-300 ease-in-out"
						style="width: {totalRows > 0 ? (processedRows / totalRows) * 100 : 0}%"
					></div>
				</div>
			</div>

			<!-- Status Row -->
			<div class="flex flex-wrap gap-3 text-xs text-gray-600 mt-1">
				<div class="flex items-center gap-1">
					<div class="w-1.5 h-1.5 rounded-full bg-green-500"></div>
					<span>Success: {successRows || 0}</span>
				</div>
				<div class="flex items-center gap-1">
					<div class="w-1.5 h-1.5 rounded-full bg-red-500"></div>
					<span>Failures: {failedRows || 0}</span>
				</div>
				<div class="flex items-center gap-1">
					<div class="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
					<span>Total: {totalRows || 0}</span>
				</div>
			</div>
		</div>
	{/if}

	{#if usePolling}
		<div class="w-full sm:w-3/4 md:w-1/2 mt-2">
			<TextDescriptionField
				label={'Description'}
				placeholder={'Enter Bulk Upload Description'}
				name={'description'}
				bind:value={description}
				rows={1}
			/>
		</div>
	{/if}
	<DragAndDrop
		uploadItemName={bulkUploadItemName}
		on:handleFileUpload={handleFileUpload}
		on:handleFileRemoval={handleFileRemoval}
	/>

	{#if fileToUpload}
		<div class="flex justify-end mb-2">
			<Button disabled={isSubmitting || isPolling} on:click={handleSubmit}>Submit</Button>
		</div>
	{/if}
</section>

<div class="flex pb-2 items-start gap-2">
	<p class="text-sm">Please follow this format for bulk upload:</p>
	<a href={templatePath} download={templateFileName} class="text-primary text-sm hover:underline">
		Download Template
	</a>
</div>
