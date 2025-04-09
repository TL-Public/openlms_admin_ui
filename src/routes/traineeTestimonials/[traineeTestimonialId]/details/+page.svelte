<script>
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import ReviewForm from '$lib/components/ReviewForm.svelte';
	import RadioButton from '$lib/components/RadioButton.svelte';
	import ErrorMessage from '$lib/components/ErrorMessage.svelte';
	import Edit from '$lib/svgComponents/Edit.svelte';

	export let data;

	const { testimonialDetails, coursesData } = data;
	let selectedLanguage = 'en';
	let selectedTranslation = {};
	let courseName = '';
	$: error = testimonialDetails?.error ? true : false;

	$: coursesList = coursesData?.flatMap((course) => {
		if (!course.uuid) return []; // Return early if uuid is missing
		const translations = course.translations
			.filter((translation) => ['en', 'hi'].includes(translation.languageCode))
			.reduce((acc, translation) => {
				acc[translation.languageCode] = translation.title;
				return acc;
			}, {});
		return {
			id: course.uuid,
			name_en: translations.en,
			name_hi: translations.hi
		};
	});

	$: {
		const course = coursesList?.find((c) => c.id === testimonialDetails?.courseUuid);
		courseName = selectedLanguage === 'hi' ? course?.name_hi : course?.name_en || '';
	}

	function handleLanguageSelectionFromRadioButton(e) {
		selectedLanguage = e.detail;
		updateSelectedTranslation();
	}

	function updateSelectedTranslation() {
		selectedTranslation =
			testimonialDetails.translations?.find((t) => t.languageCode === selectedLanguage) || {};
	}

	$: testimonialDetails && updateSelectedTranslation();
</script>

{#if !error}
	<div class="">
		<h1 class="mb-2 heading-L">Trainee Testimonial Details</h1>
	</div>

	<!-- <div class="mb-8">
		<ReviewForm>
			<div class="flex flex-col md:flex-row gap-2 shadow bg-offwhite rounded-lg p-6">
				<div class="flex-grow w-full">
					<div class="flex flex-col md:flex-row justify-between items-start mb-2">
						<div>
							<p class="flex gap-2 heading-L md:mb-2">
								{selectedTranslation?.name ?? '-'}
								<a
									href={`/traineeTestimonials/edit?data=` +
										encodeURIComponent(JSON.stringify(testimonialDetails))}
								>
									<Edit stroke="#FF6A1F" />
								</a>
							</p>
						</div>
						<div class="md:mt-0 ">
							<RadioButton
								languageOptionOne="English"
								languageCodeOne="en"
								languageOptionTwo="Hindi"
								languageCodeTwo="hi"
								on:handleLanguageFromRadioButton={handleLanguageSelectionFromRadioButton}
							/>
						</div>
					</div>
					<div class="space-y-2">
						<p class="text-sm">
							<span class="label">Designation</span>: {selectedTranslation?.designation ?? '-'}
						</p>
						<p class="text-sm">
							<span class="label">Place</span>: {selectedTranslation?.place ?? '-'}
						</p>
						<p class="text-sm"><span class="label">Course</span>: {courseName ?? '-'}</p>
					</div>
					<div class="mt-4">
						<p class="">
							<span class="label"> Testimonial Text: </span>
							<span class="text-sm">
								{selectedTranslation?.testimonialText ?? '-'}
							</span>
						</p>
					</div>
				</div>
			</div>
		</ReviewForm>
	</div> -->

	<div class="shadow bg-offwhite rounded-lg p-6">
		<ReviewForm>
			<div class="flex flex-col lg:flex-row gap-3 lg:gap-5">
				<div class="flex-grow w-full lg:w-2/4">
					<div class="mb-2">
						<div class="space-y-1">
							<p class="flex gap-2 heading-L items-center">
								{selectedTranslation?.name ?? '-'}
								<a
									href={`/traineeTestimonials/${testimonialDetails?.uuid}/details/edit`} 
								>
									<Edit stroke="#FF6A1F" />
								</a>
							</p>
						</div>
					</div>
					<div class="grid grid-cols-1  gap-3">
						<div class="flex flex-col gap-1">
						<p class="text-sm">
							<span class="label">Designation</span>: {selectedTranslation?.designation ?? '-'}
						</p>
						<p class="text-sm">
							<span class="label">Place</span>: {selectedTranslation?.place ?? '-'}
						</p>
						<p class="text-sm"><span class="label">Course</span>: {courseName ?? '-'}</p>
					</div>

						<p class="">
							<span class="label"> Testimonial Text: </span>
							<span class="text-sm">
								{selectedTranslation?.testimonialText ?? '-'}
							</span>
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
{:else}
	<ErrorMessage />
{/if}



