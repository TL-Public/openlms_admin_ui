<script>
	import { page } from '$app/stores';
	import AddCourseForm from '$lib/courses/addCourse/AddCourseForm.svelte';
	import { onMount } from 'svelte';
	import { getCategoryName } from '$lib/utils/helper.js';
	import ErrorMessage from '$lib/components/ErrorMessage.svelte';

	export let data;

	let { courseDetailsData } = data;
	$: error = courseDetailsData?.error ? courseDetailsData?.error : '';

	let formObject = {};

	$: if (!error) {
		populateFormObject(courseDetailsData);
	}
	// Populate formObject with data for both languages
	function populateFormObject(courseData) {
		if (!courseData?.translations) return;
		const enTranslation = courseData?.translations
			?.filter((t) => t != null) // guard against translations:[null]
			?.find((t) => t?.languageCode?.toLowerCase() === 'en');
		const hiTranslation = courseData.translations.find(
			(t) => t?.languageCode?.toLowerCase() === 'hi'
		);
		let categoryName = '';
		if (courseData?.category) {
			categoryName = getCategoryName(courseData?.category) ?? '';
		}

		formObject = {
			// Common fields
			uuid: courseData?.uuid,
			courseCode: courseData?.courseCode,
			displayCourseCode: courseData?.displayCourseCode,
			duration: courseData?.duration,
			category: courseData?.category,
			categoryName: categoryName,
			image: courseData?.imageUrl,

			// English translation
			titleEn: enTranslation?.title || '',
			descriptionEn: enTranslation?.description || '',
			urlEn: enTranslation?.aboutVideoUrl || '',

			// Hindi translation
			titleHi: hiTranslation?.title || '',
			descriptionHi: hiTranslation?.description || '',
			urlHi: hiTranslation?.aboutVideoUrl || '',

			method: 'PUT'
		};
	}
</script>

{#if !error}
	<AddCourseForm route={$page.route.id} params={$page.params} {formObject} />
{:else}
	<ErrorMessage {error} />
{/if}
