<script>
	import { page } from '$app/stores';
    import AddTraineeTestimonialForm from '$lib/traineeTestimonials/add/AddTraineeTestimonialForm.svelte';

	export let data;
    let {coursesData, testimonialDetails} = data
	let formObject = {};

    $: coursesList = coursesData?.flatMap((course) => {
		if (!course.uuid) return []; // Return early if uuid is missing
		return course.translations
			.filter((translation) => translation.languageCode === 'en')
			.map((translation) => ({
				name: translation.title,
				id: course.uuid,

			}));
	});

	$:selectedCourse = coursesList?.find((course)=>course?.id===testimonialDetails?.courseUuid)?.name

	populateFormObject(testimonialDetails);

	// Populate formObject with data for both languages
	function populateFormObject(testimonial) {
		const enTranslation = testimonial.translations?.find(
			(t) => t.languageCode.toLowerCase() === 'en'
		);
		const hiTranslation = testimonial.translations?.find(
			(t) => t.languageCode.toLowerCase() === 'hi'
		);

		formObject = {
			// Common fields
			uuid: testimonial?.uuid,
			courseUuid:testimonial?.courseUuid,

			// English translation
			nameEn: enTranslation?.name || '',
			designationEn: enTranslation?.designation || '',
			placeEn: enTranslation?.place || '',
			testimonialTextEn: enTranslation?.testimonialText || '',

			// Hindi translation
			nameHi: hiTranslation?.name || '',
			designationHi: hiTranslation?.designation || '',
			placeHi: hiTranslation?.place|| '',
			testimonialTextHi: hiTranslation?.testimonialText || '',
			method: 'PUT'
		};
	}

</script>

<AddTraineeTestimonialForm route={$page.route.id} params={$page.params} {coursesList} {formObject} selectedCourseUuid={testimonialDetails?.courseUuid} {selectedCourse}/>