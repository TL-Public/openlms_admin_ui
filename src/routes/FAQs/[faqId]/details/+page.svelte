<script>
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import ReviewForm from '$lib/components/ReviewForm.svelte';
	import RadioButton from '$lib/components/RadioButton.svelte';
	import { getFAQCategoryName, combineErrorMessages } from '$lib/utils/helper.js';
	import Edit from '$lib/svgComponents/Edit.svelte';
	import SubmissionErrorMessage from '$lib/components/SubmissionErrorMessage.svelte';
	import ErrorMessage from '$lib/components/ErrorMessage.svelte';

	export let data;
	const { faqDetails, faqCategoryListData } = data;
	let selectedLanguage = 'en'; // Default selected language

	// Track selected translation details
	let selectedTranslation = {};
	$: secondaryErrors = combineErrorMessages(faqCategoryListData?.error);

	// Handle language selection from the radio button
	function handleLanguageSelectionFromRadioButton(e) {
		selectedLanguage = e.detail;
		updateSelectedTranslation();
	}

	// Update selected translation based on the selected language
	function updateSelectedTranslation() {
		selectedTranslation =
			faqDetails?.translations?.find((t) => t?.languageCode === selectedLanguage) || {};

		// Find category based on language code
		let category = {};
		if (!faqCategoryListData?.error) {
			category = faqCategoryListData?.find(
				(cat) => cat?.languageCode === selectedLanguage && cat?.extId === faqDetails?.categoryId
			);
		}
		selectedTranslation.categoryName = category?.category || '-';
	}

	// Initialize the selected translation
	$: faqDetails && updateSelectedTranslation();
</script>

<div class="">
	<h1 class="mb-2 heading-L">FAQ Details</h1>
</div>

{#if secondaryErrors}
	<div class="mb-2">
		<SubmissionErrorMessage errorMessage={secondaryErrors} />
	</div>
{/if}

<!-- Primary data of the page is faq details -->
{#if faqDetails.error}
	<ErrorMessage error={faqDetails.error} />
{:else}
	<div class="shadow bg-offwhite rounded-lg p-6">
		<ReviewForm>
			<div class="flex flex-col lg:flex-row gap-3 lg:gap-5">
				<div class="flex-grow w-full lg:w-2/4">
					<div class="mb-2">
						<div class="space-y-1">
							<p class="flex gap-2 heading-L items-center">
								Q: {selectedTranslation?.question ?? '-'}
								<a href={`/FAQs/${faqDetails.uuid}/details/edit`}>
									<Edit stroke="#206FC9" />
								</a>
							</p>
						</div>
					</div>
					<div class="grid grid-cols-1 gap-2">
						<p class=" text-sm">
							<span class="label"> A:</span>
							{selectedTranslation?.answer ?? '-'}
						</p>
						<p class="text-sm">
							<span class="label">FAQ Category:</span>
							{selectedTranslation?.categoryName ?? '-'}
						</p>
					</div>
				</div>
				<div class="text-nowrap">
					<RadioButton
						languageOptionOne="English"
						languageCodeOne="en"
						languageOptionTwo="Hindi"
						languageCodeTwo="hi"
						on:handleLanguageFromRadioButton={handleLanguageSelectionFromRadioButton}
					/>
				</div>
			</div>
		</ReviewForm>
	</div>
{/if}
