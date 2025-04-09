<script>
	import { page } from '$app/stores';
	import Add from '$lib/trainingCenters/addTC/AddForm.svelte';
	import { combineErrorMessages } from '$lib/utils/helper.js';
	import SubmissionErrorMessage from '$lib/components/SubmissionErrorMessage.svelte';
	import ErrorMessage from '$lib/components/ErrorMessage.svelte';

	export let data;

	let { stateData, tcData, TCDetails, bankData } = data;
	let tcObject = null;
	let isEditMode = false;

	$: primaryDataError = TCDetails?.error ? TCDetails?.error : '';
	$: secondaryErrors = combineErrorMessages(stateData?.error, tcData?.error, bankData?.error);

	$: if (!primaryDataError) {
		try {
			let formData = tcData?.find((elem) => elem?.uuid === TCDetails?.uuid);

			if (formData && formData.translations) {
				isEditMode = true; // Set edit mode
				const validTranslations = formData?.translations?.filter((t) => t != null);

				let englishTranslation =
					validTranslations?.find((t) => t?.languageCode?.toLowerCase() === 'en') || {};
				let hindiTranslation =
					validTranslations?.find((t) => t?.languageCode?.toLowerCase() === 'hi') || {};

				let bankName =
					formData.bankId && !bankData.error
						? bankData?.find((bank) => bank.uuid === formData.bankId)?.name || ''
						: '';
				let stateTitle =
					formData.stateId && !stateData.error
						? stateData?.find((state) => state.extId === formData.stateId)?.name || ''
						: '';

				tcObject = {
					uuid: formData?.uuid,
					bankId: formData.bankId || '',
					stateId: formData.stateId,
					rsetiId: formData?.extId || '',
					bankName: bankName,
					email: formData?.email || '',
					contactNo: formData?.contactNo || '',
					directorContactNo: formData.directorContactNo || '',
					nameEnglish: englishTranslation?.name || '',
					addressEnglish: englishTranslation?.address?.trim() || '',
					districtName: englishTranslation?.district?.trim() || '',
					districtId: englishTranslation?.districtId || '',
					translationIdEnglish: englishTranslation?.id || '',
					directorNameEn: englishTranslation?.directorName || '',
					nameHindi: hindiTranslation?.name?.trim() || '',
					addressHindi: hindiTranslation?.address?.trim() || '',
					districtHindi: hindiTranslation?.district?.trim() || '',
					directorNameHi: hindiTranslation?.directorName?.trim() || '',
					translationIdHindi: hindiTranslation?.id || '',
					stateName: stateTitle
				};
			}
		} catch (error) {
			console.error('Error parsing query parameters or processing data:', error);
		}
	}
</script>

{#if secondaryErrors}
	<div class=" mb-4">
		<SubmissionErrorMessage errorMessage={secondaryErrors} />
	</div>
{/if}

{#if !primaryDataError}
	<Add
		route={$page.route.id}
		params={$page.params}
		{tcObject}
		{stateData}
		{bankData}
		{isEditMode}
	/>
{:else}
	<ErrorMessage error={primaryDataError} />
{/if}
