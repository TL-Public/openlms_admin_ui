<script>
	// import BreadCrumbs from '$lib/components/BreadCrumbs.svelte';
	import ReviewForm from '$lib/components/ReviewForm.svelte';
	import RadioButton from '$lib/components/RadioButton.svelte';
	import { getFAQCategoryName } from '$lib/utils/helper.js';
	import Edit from '$lib/svgComponents/Edit.svelte';
	export let data;

	const { testimonialDetails } = data;
	let selectedLanguage = 'en'; // Default selected language
	// Track selected translation details
	let selectedTranslation = {};
	
	// Handle language selection from the radio button
	function handleLanguageSelectionFromRadioButton(e) {
		selectedLanguage = e.detail;
		updateSelectedTranslation();
	}

	// Update selected translation based on the selected language
	function updateSelectedTranslation() {
		selectedTranslation =
			testimonialDetails.translations?.find((t) => t.languageCode === selectedLanguage) || {};
	}

	// Initialize the selected translation
	$: testimonialDetails && updateSelectedTranslation();
</script>

<!-- <div class="mb-4 mt-2">
	<BreadCrumbs route={$page.route.id} params={$page.params} />
</div> -->
<div class="">
	<h1 class="mb-2 heading-L">Official Testimonial Details</h1>
</div>

<div class="shadow bg-offwhite rounded-lg p-6">
	<ReviewForm>
		<div class="flex flex-col md:flex-row gap-3 md:gap-5">
			<div class="w-fit sm:w-1/2 md:w-1/4 flex-shrink-0 order-2 md:order-1">
				<img
					class="w-full h-48 rounded-lg shadow-sm object-contain"
					src={testimonialDetails?.image ? `${testimonialDetails?.image}?t=${Date.now()}` : '/image-preview-icon.jpg'}
					alt="Display thumbnail"
				/>
			</div>
			<div class="flex-grow order-3 md:order-2 w-full md:w-2/4">
				<div class="mb-2">
					<div class="space-y-1">
						<p class="flex gap-2 heading-L items-center">
						{selectedTranslation?.name ?? '-'}

							<a
								href={`/officialTestimonials/${testimonialDetails.uuid}/details/edit`}
							>
								<Edit stroke="#FF6A1F" />
							</a>
						</p>

						<p class="text-sm"><span class="label">Designation</span>: {selectedTranslation?.designation ?? '-'}</p>
					</div>
				</div>
				<div class="grid grid-cols-1 sm:grid-cols-1 gap-1">
					{#if testimonialDetails.videoUrl}
					<div class="flex items-center space-x-2">
						<span class="label">Video URL:</span>
						<p class="text-sm text-blue-600 hover:underline break-words">
						  <a href={testimonialDetails.videoUrl ?? '#'} target="_blank" rel="noopener noreferrer" class="break-all">
							{testimonialDetails.videoUrl ?? '-'}
						  </a>
						</p>
					  </div>
							{:else}
							<p class=" text-sm">
								<span class="label"> Testimonial text: </span>
								{selectedTranslation?.testimonialText ?? '-'}
							</p>
							{/if}
				</div>
			</div>
			<div class="order-1 md:order-3 text-nowrap">
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
