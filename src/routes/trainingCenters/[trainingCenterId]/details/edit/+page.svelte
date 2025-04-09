<script>
	import { page } from '$app/stores';
	import Add from '$lib/trainingCenters/addTC/AddForm.svelte';

	export let data;

	let { stateData, tcData, TCDetails, bankData } = data;
	let tcObject = null;
	let isEditMode = false;
	$:error=TCDetails?.error?true:false

	$:if (!error) {
		try {
			let formData = tcData.find((elem) => elem.uuid === TCDetails.uuid);

			if (formData) {
				isEditMode = true; // Set edit mode
				let englishTranslation =
					formData.translations?.find((t) => t.languageCode.toLowerCase() === 'en') || {};
				let hindiTranslation =
					formData.translations?.find((t) => t.languageCode.toLowerCase() === 'hi') || {};

				let bankName = formData.bankId
					? bankData.find((bank) => bank.uuid === formData.bankId)?.name || ''
					: '';
				let stateTitle = formData.stateId
					? stateData.find((state) => state.extId === formData.stateId)?.name || ''
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

<Add route={$page.route.id} params={$page.params} {tcObject} {stateData} {bankData} {isEditMode} />
