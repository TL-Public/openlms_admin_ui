<script>
	import { page } from '$app/stores';
	import AddFAQForm from '$lib/faqs/AddFAQForm.svelte';
	import SubmissionErrorMessage from '$lib/components/SubmissionErrorMessage.svelte';
	import { combineErrorMessages } from '$lib/utils/helper.js';

	export let data;
	const { FAQData, faqCategoryListData } = data;

	let formObject = {};

	$: secondaryErrors = combineErrorMessages(faqCategoryListData?.error);

	populateFormObject(FAQData);

	// Populate formObject with data for both languages
	function populateFormObject(faq) {
		const enTranslation = faq.translations?.find((t) => t?.languageCode?.toLowerCase() === 'en');
		const hiTranslation = faq.translations?.find((t) => t?.languageCode?.toLowerCase() === 'hi');

		let categoryName = '';
		if (!faqCategoryListData.error) {
			categoryName =
				faqCategoryListData?.find(
					(cat) => cat?.languageCode?.toLowerCase() === 'en' && cat?.extId === faq?.categoryId
				)?.category || '';
		}

		formObject = {
			// Common fields
			uuid: faq?.uuid,
			categoryId: faq?.categoryId,
			categoryName: categoryName,
			// English translation
			questionEn: enTranslation?.question || '',
			answerEn: enTranslation?.answer || '',

			// Hindi translation
			questionHi: hiTranslation?.question || '',
			answerHi: hiTranslation?.answer || '',
			method: 'PUT'
		};
	}
</script>

{#if secondaryErrors}
	<div class="mb-2">
		<SubmissionErrorMessage errorMessage={secondaryErrors} />
	</div>
{/if}
<AddFAQForm route={$page.route.id} params={$page.params} {formObject} {faqCategoryListData} />
