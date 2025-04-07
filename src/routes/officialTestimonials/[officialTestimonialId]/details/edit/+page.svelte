<script>
	import { page } from '$app/stores';
	import AddOffTestimonialForm from '$lib/officialTestimonials/AddOffTestimonialForm.svelte';
	import ErrorMessage from '$lib/components/ErrorMessage.svelte';

	export let data;
	const { testimonialDetails } = data;

	let formObject = {};

	// testimonialDetails is the primarry data for this page, without which, there is no meaning in showing the page.
	$: primaryDataError = testimonialDetails?.error ? testimonialDetails?.error : '';

	populateFormObject(testimonialDetails);

	// Populate formObject with data for both languages
	function populateFormObject(testimonial) {
		if (testimonial.error) return;
		const enTranslation = testimonial?.translations?.find(
			(t) => t?.languageCode?.toLowerCase() === 'en'
		);
		const hiTranslation = testimonial.translations?.find(
			(t) => t?.languageCode?.toLowerCase() === 'hi'
		);

		formObject = {
			// Common fields
			uuid: testimonial?.uuid,
			image: testimonial?.image || null,
			videoUrl: testimonial?.videoUrl || '',

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

{#if testimonialDetails.error}
	<ErrorMessage error={primaryDataError} />
{:else}
	<AddOffTestimonialForm route={$page.route.id} params={$page.params} {formObject} />
{/if}
