<script>
	import { page } from '$app/stores';
	import AddTraineeTestimonialForm from '$lib/traineeTestimonials/add/AddTraineeTestimonialForm.svelte';
	import ErrorMessage from '$lib/components/ErrorMessage.svelte';
	import { combineErrorMessages } from '$lib/utils/helper.js';
	import SubmissionErrorMessage from '$lib/components/SubmissionErrorMessage.svelte';

	export let data;
	let { coursesData, testimonialDetails } = data;
	let formObject = {};
	let coursesList = [];

	//primary data is the most important data on the page. Error in loading this data means, the page itself will be shown as an error page
	$: primaryDataError = testimonialDetails?.error ? testimonialDetails?.error : '';

	//data other than primary data is considered secondary errors - shown at top of the page.
	$: secondaryErrors = combineErrorMessages(coursesData?.error);

	$: if (!coursesData?.error) {
		coursesList =
			coursesData?.flatMap((course) => {
				if (!course.uuid || !course.translations) return []; // Return early if uuid is missing
				return course.translations
					.filter((translation) => translation?.languageCode === 'en')
					.map((translation) => ({
						name: translation?.title,
						id: course?.uuid
					}));
			}) || [];
	}

	$: selectedCourse = coursesList?.find(
		(course) => course?.id === testimonialDetails?.courseUuid
	)?.name;

	populateFormObject(testimonialDetails);

	// Populate formObject with data for both languages
	function populateFormObject(testimonial) {
		if (testimonial.error) return;
		const enTranslation = testimonial.translations?.find(
			(t) => t.languageCode.toLowerCase() === 'en'
		);
		const hiTranslation = testimonial.translations?.find(
			(t) => t.languageCode.toLowerCase() === 'hi'
		);

		formObject = {
			// Common fields
			uuid: testimonial?.uuid,
			courseUuid: testimonial?.courseUuid,

			// English translation
			nameEn: enTranslation?.name || '',
			designationEn: enTranslation?.designation || '',
			placeEn: enTranslation?.place || '',
			testimonialTextEn: enTranslation?.testimonialText || '',

			// Hindi translation
			nameHi: hiTranslation?.name || '',
			designationHi: hiTranslation?.designation || '',
			placeHi: hiTranslation?.place || '',
			testimonialTextHi: hiTranslation?.testimonialText || '',
			method: 'PUT'
		};
	}
</script>

{#if secondaryErrors}
	<div class=" mb-4">
		<SubmissionErrorMessage errorMessage={secondaryErrors} />
	</div>
{/if}

{#if primaryDataError}
	<div class=" mb-4">
		<ErrorMessage error={primaryDataError} />
	</div>
{:else}
	<AddTraineeTestimonialForm
		route={$page.route.id}
		params={$page.params}
		{coursesList}
		{formObject}
		selectedCourseUuid={testimonialDetails?.courseUuid}
		{selectedCourse}
	/>
{/if}
