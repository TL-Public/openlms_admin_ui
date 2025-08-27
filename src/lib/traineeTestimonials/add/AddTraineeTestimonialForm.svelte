<script>
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { onDestroy, onMount } from 'svelte';
	import { message } from '/src/routes/traineeTestimonials/testimonialStore.js';
	import InputField from '$lib/components/InputField.svelte';
	// import BreadCrumbs from '$lib/components/BreadCrumbs.svelte';
	import TextDescriptionField from '$lib/components/TextDescriptionField.svelte';
	import SubmissionErrorMessage from '$lib/components/SubmissionErrorMessage.svelte';
	import ReviewForm from '$lib/components/ReviewForm.svelte';
	import DropDown from '$lib/components/DropDown.svelte';
	import Button from '$lib/components/Button.svelte';
	import SearchableComboBox from '$lib/components/SearchableComboBox.svelte';

	import MultiStepProgressComponent from '$lib/components/MultiStepProgressComponent.svelte';
	import { handleRedirection } from '$lib/utils/helper.js';
	import { page } from '$app/stores';
	import {showLoadingSpinner} from '/src/routes/store.js'

	export let route;
	export let params;
	export let coursesList = [];
	export let formObject = {
		nameEn: '',
		designationEn: '',
		testimonialTextEn: '',
		placeEn: '',
		nameHi: '',
		designationHi: '',
		testimonialTextHi: '',
		courseUuid: '',
		placeHi: '',
		uuid: '',
		method: ''
	};

	let saved = false;
	let validationErrors = '';
	let creationError = false;
	let method = 'post';
	let errorMessage = '';
	let steps = [
		{ number: 1, text: 'Details' },
		{ number: 2, text: 'Review' }
	];
	let currentStep = 1;
	let isSubmitting = false;
	const url = $page.url;

	export let selectedCourse = '';
	export let selectedCourseUuid = '';

	onMount(() => {
		if (route.includes('edit')) {
			method = 'PUT';
		} else {
			method = 'POST';
		}
	});

	
	$: if (isSubmitting === true){
		showLoadingSpinner.set(true)
	} else {
		showLoadingSpinner.set(false)
	}

	function handleCancelSelectionInDropDown() {
		selectedCourse = null;
		selectedCourseUuid = null;
		validationErrors = '';
	}

	// Enhance function

	function handleEnhance({ formElement, formData, action, cancel, submitter }) {
		let { search } = action;
		validationErrors = '';

		// This is done becuase enhance function is being triggered when the pdf is opened in another window
		if (search == '?/review') {
			saved = !saved;
			currentStep = 2;
		}

		if (search == '?/final') {
			isSubmitting = true;
		}

		Object.keys(formObject)?.forEach((key) => {
			formData.set(key, formObject[key]);
		});

		formData.set('method', method);
		formData.set('courseUuid', selectedCourseUuid);

		if (!selectedCourseUuid) {
			validationErrors = 'This field should not be empty.';
		}

		// If there are validation errors, cancel the submission and handle errors
		if (validationErrors) {
			saved = false;
			isSubmitting=false
			cancel();
			return;
		}

		return async ({ result, update }) => {
			await result;
			isSubmitting = false;

			// `result` is an `ActionResult` object
			if (search == '?/final') {
				console.log('result', result);
				isSubmitting = true;
				if (result.type == 'success') {
					if (method === 'POST') {
						goto(`/traineeTestimonials`);
						message.set(`Successfully added trainee testiomonial of "${formObject?.nameEn}".`);
					}
					if (method === 'PUT') {
						goto(`/traineeTestimonials`);
						message.set(`Successfully edited trainee testiomonial of "${formObject?.nameEn}".`);
					}
				}

				if (result.type == 'failure') {
					isSubmitting = false;
					formObject = formObject;
					creationError = true;
					isSubmitting = false;

					if (result?.data?.error) {
						errorMessage = result?.data?.error;
						if (result?.status === 401) {
							handleRedirection(result.status, url.pathname, url.search);
						} else {
							//handle other errors
						}
					}
				}
			}
		};
	}

	function handleGoBack() {
		window.history.back();
	}

	function handlePrevious() {
		saved = false;
		currentStep = 1;
		formObject = formObject;
	}

	function handleCourseDropdown(e){
		selectedCourseUuid = e.detail.selectedItemId;
		selectedCourse = e.detail.selectedItemName;
	}

	onDestroy(()=>{
		showLoadingSpinner.set(false)
	})
</script>

<div class=" text-darkGray">
	{#if creationError}
		<div class="mb-2">
			<SubmissionErrorMessage {errorMessage} />
		</div>
	{/if}

	<div class="w-full max-w-80 mx-auto">
		<MultiStepProgressComponent {steps} {currentStep} />
	</div>

	<form
		method="post"
		action="/traineeTestimonials"
		enctype="multipart/form-data"
		use:enhance={handleEnhance}
		class=" form"
	>
		{#if !saved}
			<div>
				<h2 class="heading-L">
					1.{method === 'POST' ? 'Add' : 'Edit'} Trainee Testimonial Details
				</h2>
				<hr class="my-4 horizontal-line" />
				<h3 class="heading-L mb-2">Basic Details</h3>

				<!-- First Row -->
				<div class="grid grid-cols-1 lg:grid-cols-2 gap-2 lg:gap-20 mb-4">
					<!-- <DropDown
						on:handleCancelSelection={handleCancelSelectionInDropDown}
						bind:selectedItemName={selectedCourse}
						bind:selectedItemUuid={selectedCourseUuid}
						options={coursesList}
						validationErrors={validationErrors || ''}
						placeholder={'Select course'}
						type="courseList"
						disabled={coursesList?.length === 0}
					/> -->

						<SearchableComboBox
						options={coursesList}
						filterCategory="courseListing"
						placeholder="Select a course"
						type="courseList"
						validationErrors={validationErrors || ''}
						selectedItemName={selectedCourse}
						selectedItemId={selectedCourseUuid}
						disabled={coursesList?.length === 0}
						on:handleDispatchFilterData={handleCancelSelectionInDropDown}
						on:handleDispatchComboBoxData={handleCourseDropdown}
						/>
				</div>

				<hr class="my-4 horizontal-line" />
				<h3 class="heading-L">Language wise testimonial details</h3>
				<h4 class=" text-xs mb-4 text-gray-400">
					Language wise details are necessary for multi-lingual support
				</h4>
				<div class="flex items-center space-x-2 mb-4">
					<div class="flex">
						<h3 class="font-semibold">English</h3>
						<span class="text-red-500">*</span>
					</div>
					<span class="text-xs text-gray-400">(Fill the details in English)</span>
				</div>

				<div class="grid grid-cols-1 lg:grid-cols-2 items-end mb-4 gap-2 lg:gap-20">
					<InputField
						label={'Name'}
						placeholder={'Enter name'}
						name={'nameEn'}
						bind:value={formObject.nameEn}
						required
					/>
					<InputField
						label={'Designation'}
						placeholder={'Enter Designation'}
						name={'designationEn'}
						bind:value={formObject.designationEn}
						required
					/>
				</div>
				<div class="grid grid-cols-1 lg:grid-cols-2 items-end mb-4 gap-2 lg:gap-20">
					<div class="grid gap-4">
						<InputField
							label={'Place'}
							placeholder={'Enter place'}
							name={'placeEn'}
							bind:value={formObject.placeEn}
							required
						/>
					</div>
				</div>
				<div class="mb-4 lg:mb-4 w-full">
					<TextDescriptionField
						label={'Testimonial Text'}
						placeholder={'Enter testimonial text'}
						name={'testimonialTextEn'}
						bind:value={formObject.testimonialTextEn}
						required
					/>
				</div>

				<hr class="my-4 horizontal-line" />
				<div class="flex items-center space-x-2 mb-4">
					<h3 class="font-semibold">Hindi</h3>
					<span class="text-xs text-gray-400">(Fill the details in Hindi)</span>
				</div>

				<div class="grid grid-cols-1 lg:grid-cols-2 items-end mb-4 gap-2 lg:gap-20">
					<InputField
						label={'Name'}
						placeholder={'Enter name'}
						name={'nameHi'}
						bind:value={formObject.nameHi}
					/>
					<InputField
						label={'Designation'}
						placeholder={'Enter designation'}
						name={'designationHi'}
						bind:value={formObject.designationHi}
					/>
				</div>
				<div class="grid grid-cols-1 lg:grid-cols-2 items-end mb-4 gap-2 lg:gap-20">
					<div class="grid gap-4">
						<InputField
							label={'Place'}
							placeholder={'Enter place'}
							name={'placeEn'}
							bind:value={formObject.placeHi}
						/>
					</div>
				</div>
				<div class="mb-4 lg:mb-4 w-full">
					<TextDescriptionField
						label={'Testimonial text'}
						placeholder={'Enter testimonial Text'}
						name={'testimonialTextEn'}
						bind:value={formObject.testimonialTextHi}
					/>
				</div>
			</div>
		{:else}
			<div class="mb-2 lg:mb-4 w-full">
				<ReviewForm>
					<h2 class="heading-L">Testimonial Details</h2>
					<hr class="mb-6 horizontal-line" />

					<div class="flex flex-col md:flex-row gap-6">
						<div class="flex-grow">
							<!-- <h3 class=" font-medium mb-4 mt-2">Language-wise testimonial Details</h3> -->

							<!-- English Details -->
							<div class="mb-2">
								<h4 class="text-base font-semibold mb-2">English</h4>
								<div class="space-y-1">
									<p class="font-medium">{formObject?.nameEn ?? '-'}</p>
									<p class="text-sm text-gray-600">{formObject?.designationEn ?? '-'}</p>
									<p class="text-sm text-gray-600">{formObject?.testimonialTextEn ?? '-'}</p>
								</div>
							</div>

							<hr class="space-y-4 horizontal-line" />
							<!-- Hindi Details -->
							<div>
								<h4 class="text-base font-semibold mb-2 mt-2">Hindi</h4>
								<div class="space-y-1">
									<p class="font-medium">
										{formObject?.nameHi ? formObject?.nameHi : 'Title: -'}
									</p>
									<p class="text-sm text-gray-600">
										{formObject?.designationHi ? formObject?.designationHi : 'Designation: -'}
									</p>
									<p class="text-sm text-gray-600">
										{formObject?.testimonialTextHi
											? formObject?.testimonialTextHi
											: 'Testimonial Text: -'}
									</p>
								</div>
							</div>
						</div>
					</div>
				</ReviewForm>
			</div>
		{/if}

		<div class="flex justify-end gap-4 flex-wrap">
			{#if saved}
				<Button
					type="button"
					btnType="secondary"
					customClass={'inline-block w-full bp-420px:w-fit'}
					disabled={isSubmitting}
					on:click={handlePrevious}>Edit</Button
				>
			{:else}
				<Button
					type="button"
					btnType="secondary"
					customClass={'inline-block w-full bp-420px:w-fit flex justify-center'}
					disabled={isSubmitting}
					on:click={handleGoBack}>Cancel</Button
				>
			{/if}
			<Button
				btnType="primary"
				type="submit"
				customClass={'inline-block w-full bp-420px:w-fit flex justify-center'}
				disabled={isSubmitting}
				formaction={saved ? '?/final' : '?/review'}>{saved ? 'Submit' : 'Save & Next'}</Button
			>
		</div>
	</form>
</div>
