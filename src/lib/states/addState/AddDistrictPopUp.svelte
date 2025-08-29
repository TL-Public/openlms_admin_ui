<script>
	import { createEventDispatcher, onMount, onDestroy } from 'svelte';
	import { page } from '$app/stores';
	import { handleRedirection } from '$lib/utils/helper.js';
	import InputField from '$lib/components/InputField.svelte';
	import Button from '$lib/components/Button.svelte';
	import LineLoader from '$lib/components/LineLoader.svelte';
	import DeletionErrorMessage from '$lib/components/DeletionErrorMessage.svelte';

	export let stateDetails = [];
	export let districtExtId = null;
	export let formMode = 'POST';
	export let formObject = {
		nameEn: '',
		nameHi: ''
	};

	let isSubmitting = false;
	let errorMessage = '';
	const dispatch = createEventDispatcher();

	$: stateEn = stateDetails?.find((s) => s.languageCode === 'en');
	$: stateHi = stateDetails?.find((s) => s.languageCode === 'hi');

	async function handleSubmit() {

	isSubmitting = true;
	errorMessage = '';

	const nameEnTrimmed = formObject?.nameEn?.trim()?.toLowerCase();
	const nameHiTrimmed = formObject?.nameHi?.trim()?.toLowerCase();

	const enDuplicate = stateEn?.districts?.some((d) =>
		formMode === 'POST'
			? d.name.trim().toLowerCase() === nameEnTrimmed
			: d.name.trim().toLowerCase() === nameEnTrimmed && d.extId !== districtExtId
	);

	if (enDuplicate) {
		errorMessage = 'District name (English) already exists.';
		isSubmitting = false;
		return;
	}

	const hiDuplicate = formObject?.nameHi?.trim() &&
		stateHi?.districts?.some((d) =>
			formMode === 'POST'
				? d.name.trim().toLowerCase() === nameHiTrimmed
				: d.name.trim().toLowerCase() === nameHiTrimmed && d.extId !== districtExtId
		);

	if (hiDuplicate) {
		errorMessage = 'District name (Hindi) already exists.';
		isSubmitting = false;
		return;
	}


	try {
		let updatedStateDetails = [...stateDetails];

		// Step 1: Submit English district
		const englishPayload = {
			extId: stateEn?.extId,
			languageCode: 'en',
			districts: [
				{
					...(formMode === 'PUT' ? { extId: districtExtId } : {}),
					name: formObject?.nameEn,
					languageCode: 'en'
				}
			]
		};

		const resEn = await fetch(`/apis/states/${stateEn?.extId}`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(englishPayload)
		});

		if (resEn?.status === 401) {
			handleRedirection(resEn.status, $page.url.pathname, $page.url.search);
		}
		if (!resEn?.ok) {
			throw new Error(`Failed to ${formMode=='POST'? 'add' :' edit'} district.`);
		}

		const enResult = await resEn?.json();
		const updatedEnglishState = enResult?.responseData;
		const updatedDistrict = updatedEnglishState?.districts?.find(
			(d) => d.name === formObject?.nameEn
		);
		const newExtId = updatedDistrict?.extId || districtExtId;

		// Replace the English state entry
		updatedStateDetails = updatedStateDetails.map((s) =>
			s.languageCode === 'en' ? updatedEnglishState : s
		);

		// Step 2: Submit Hindi district
		if (formObject?.nameHi) {
			const hindiPayload = {
				extId: stateHi?.extId,
				languageCode: 'hi',
				districts: [
					{
						extId: newExtId,
						name: formObject?.nameHi,
						languageCode: 'hi'
					}
				]
			};

			const resHi = await fetch(`/apis/states/${stateHi?.extId}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(hindiPayload)
			});

			if (resHi?.status === 401) {
				handleRedirection(resHi.status, $page.url.pathname, $page.url.search);
			}
			if (!resHi?.ok) {
				dispatch('handleDistrictSaved', { updatedStateDetails, newExtId, errorInHindi: true  });
				throw new Error(`Suuccessfully  ${formMode=='POST'? 'added' :' edited'} English District. Failed to  ${formMode=='POST'? 'add' :' edit'} Hindi district.`);
			}

			const hiResult = await resHi?.json();
			const updatedHindiState = hiResult?.responseData;

			// Replace the Hindi state entry
			updatedStateDetails = updatedStateDetails.map((s) =>
				s.languageCode === 'hi' ? updatedHindiState : s
			);
		}

		dispatch('handleDistrictSaved', { updatedStateDetails, newExtId, errorInHindi: false });
		handleCancel();
	} catch (err) {
		errorMessage = err.message;
	} finally {
		isSubmitting = false;
	}
}

	function handleCancel() {
		formObject = { nameEn: '', nameHi: '' };
		districtExtId = null;
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
					<h2 class=" heading-L">{formMode ==='POST' ? 'Add': 'Edit'} District Name</h2>
					<div class="mt-4">
						<InputField
							label={'District Name (in English)'}
							placeholder={'Enter District Name'}
							name={'nameEn'}
							bind:value={formObject.nameEn}
							required={true}
						/>
					</div>
					<div class="mt-2 sm:mt-4">
						<InputField
							label={'District Name (in Hindi)'}
							placeholder={'Enter District Name'}
							name={'nameHi'}
							bind:value={formObject.nameHi}
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