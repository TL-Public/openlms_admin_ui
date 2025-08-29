<script>
	import InputField from '$lib/components/InputField.svelte';
	import Button from '$lib/components/Button.svelte';
	import { handleRedirection } from '$lib/utils/helper.js';
	import { page } from '$app/stores';
	import SubmissionErrorMessage from'$lib/components/SubmissionErrorMessage.svelte'
	import { message } from '/src/routes/states/stateStore.js';
	import { goto } from '$app/navigation';
	import {showLoadingSpinner} from '/src/routes/store.js'

	export let formMode = 'POST'; // 'POST' (new state) or 'PUT' (edit state)
	export let extId = null; // Unique identifier from the API
	export let formObject = {
		nameEn: '',
		nameHi: '',
		isoCode: ''
	};

	let errorMessage = '';
	let isSubmitting = false;
	let hindiSubmissionStatus = {
		needsRetry: false,
		attempted: false
	};

	let isNewHindiState = !formObject.nameHi; // True if Hindi was initially empty

	$: if (isSubmitting === true) {
		showLoadingSpinner.set(true);
	} else {
		showLoadingSpinner.set(false);
	}

	// Form validation
	$: isFormValid = formObject?.nameEn.trim() && formObject?.nameHi?.trim() && formObject.isoCode.trim();

	async function handleSubmit() {
		if (!isFormValid) {
			errorMessage = 'Please fill in all required fields';
			return;
		}

		isSubmitting = true;
		errorMessage = '';

		// Prepare API payloads
		let englishPayload =
			formMode === 'POST'
				? { name: formObject.nameEn, isoCode: formObject.isoCode, languageCode: 'en' }
				: { extId, name: formObject.nameEn, isoCode: formObject.isoCode, languageCode: 'en' };

		try {
			// First submit English name
			if (formMode === 'PUT' || !extId) {
				let method = formMode;
				let englishEndpoint = method === 'POST' ? '/apis/states' : `/apis/states/${extId}`;

				try {
					let englishResponse = await fetch(englishEndpoint, {
						method,
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify(englishPayload)
					});

					if (englishResponse?.status === 401) {
						handleRedirection(englishResponse.status, $page.url.pathname, $page.url.search);
						return;
					}
					
					if (englishResponse?.status === 409) {
						throw new Error('The English state name already exists.');
					} else if (!englishResponse.ok) {
						throw new Error(`Failed to ${method === 'POST' ? 'add' : 'update'} the state . Error Code: ${englishResponse.status}`);
					}
					
					let englishResult = await englishResponse?.json();
					extId = englishResult?.responseData?.extId; // Save extId for Hindi submission
					
					if (!extId) {
						throw new Error('Server did not return a valid state ID. Cannot proceed with Hindi submission.');
					}
				} catch (error) {
					if (error.name === 'TypeError' || error.name === 'NetworkError') {
						throw new Error('Failed to add state. Please try again.');
					}
					throw error; // Re-throw other errors
				}
			}

			// Submit Hindi name if applicable
			if (hindiSubmissionStatus.needsRetry || formObject.nameHi) {
				let method = isNewHindiState ? 'POST' : 'PUT';
				let hindiEndpoint = method === 'POST' ? '/apis/states' : `/apis/states/${extId}`;
				let hindiPayload = { 
					extId, 
					name: formObject.nameHi, 
					isoCode: formObject.isoCode, 
					languageCode: 'hi' 
				};

				try {
					hindiSubmissionStatus.attempted = true;
					
					let hindiResponse = await fetch(hindiEndpoint, {
						method,
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify(hindiPayload)
					});

					if (hindiResponse?.status === 401) {
						handleRedirection(hindiResponse.status, $page.url.pathname, $page.url.search);
						return;
					}
					
					if (hindiResponse.status === 409) {
						hindiSubmissionStatus.needsRetry = true;
						throw new Error(`English state was successfully ${formMode === 'POST' ? 'added' : 'updated'}, but the Hindi name conflicts with an existing state name.`);
					} else if (!hindiResponse.ok) {
						hindiSubmissionStatus.needsRetry = true;
						throw new Error(`English state was successfully ${formMode === 'POST' ? 'added' : 'updated'}, but Hindi submission failed. Error Code: ${hindiResponse.status}`);
					}
					
					let hindiResult = await hindiResponse.json();
					hindiSubmissionStatus.needsRetry = false;

					// Both submissions successful
					message.set(`Successfully ${formMode === 'POST' ? 'added' : 'updated'} state details.`);
					goto(`/states/${extId}/details`);
				} catch (error) {

					if (error.name === 'TypeError' || error.name === 'NetworkError') {
						throw new Error('Failed to add Hindi state. Please try again.');
					}
					hindiSubmissionStatus.needsRetry = true;
					throw error; // Re-throw other errors
				}
			} else {
				hindiSubmissionStatus.needsRetry = true
				throw new Error('Successfully added English state name but failed to add Hindi state.');

			}

			// Reset form on success (will only execute if no errors were thrown)
			formObject = { nameEn: '', nameHi: '', isoCode: '' };
			extId = null;
			formMode = 'POST';
		} catch (error) {
			errorMessage = error.message;
		} finally {
			isSubmitting = false;
		}
	}

</script>

<div>
	{#if errorMessage}
		<div class="mb-2">
			<SubmissionErrorMessage
				errorMessage={errorMessage ? errorMessage : 'Failed to submit form data. Please try again!'}
			/>
		</div>
	{/if}

	<form on:submit|preventDefault={handleSubmit} class="w-full md:w-1/2 form">
		<h1 class="mb-2 heading-L">
			{formMode === 'POST' ? 'Add State' : 'Edit State'}
		</h1>
		<hr class="horizontal-line mt-1 mb-4" />
		<div class="space-y-4">
			<InputField
				label={'State/UT (in English)'}
				placeholder={'Enter State/UT name in English'}
				name={'title'}
				bind:value={formObject.nameEn}
				required
			/>

			<InputField
				label={'State/UT (in Hindi)'}
				placeholder={'Enter State/UT name in Hindi'}
				name={'title'}
				bind:value={formObject.nameHi}
				required
			/>

			<InputField
				label={'ISO Code'}
				placeholder={'Enter ISO Code'}
				name={'code'}
				bind:value={formObject.isoCode}
				required
			/>
		</div>

		<div class="flex justify-end gap-4 mt-8 flex-wrap">
			<Button
				type="button"
				btnType="secondary"
				on:click={() => window.history.back()}
				disabled={isSubmitting}>{'Cancel'}</Button
			>
			<Button 
				btnType="primary" 
				type="submit" 
				disabled={isSubmitting || !isFormValid}
			>
			{'Submit'}
			</Button>
		</div>
	</form>
</div>