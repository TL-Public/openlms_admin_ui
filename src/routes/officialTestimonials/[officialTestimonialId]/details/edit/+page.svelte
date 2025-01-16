<script>
	import { page } from '$app/stores';
	import AddOffTestimonialForm from '$lib/officialTestimonials/AddOffTestimonialForm.svelte';

	export let data;
	const { testimonialDetails } = data;
	let formObject = {};

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
			image:testimonial?.image || null,
			videoUrl:testimonial?.videoUrl || '',

			// English translation
			nameEn: enTranslation?.name || '',
			designationEn: enTranslation?.designation || '',
			testimonialTextEn: enTranslation?.testimonialText || '',

			// Hindi translation
			nameHi: hiTranslation?.name || '',
			designationHi: hiTranslation?.designation || '',
			testimonialTextHi: hiTranslation?.testimonialText || '',
			method: 'PUT'
		};
	}
</script>

<AddOffTestimonialForm route={$page.route.id} params={$page.params} {formObject} />
