<script>
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { courseCategory } from '$lib/data.js';
	import { onDestroy, onMount } from 'svelte';
	import { message } from '/src/routes/courses/courseStore.js';
	import { getCategoryName } from '$lib/utils/helper.js';
	import DropDown from '$lib/components/DropDown.svelte';
	import InputField from '$lib/components/InputField.svelte';
	import TextDescriptionField from '$lib/components/TextDescriptionField.svelte';
	import SubmissionErrorMessage from '$lib/components/SubmissionErrorMessage.svelte';
	import DragAndDrop from '$lib/components/DragAndDrop.svelte';
	import ReviewForm from '$lib/components/ReviewForm.svelte';
	import Button from '$lib/components/Button.svelte';
	import MultiStepProgressComponent from '$lib/components/MultiStepProgressComponent.svelte';
	import { handleRedirection } from '$lib/utils/helper.js';
	import { page } from '$app/stores';
	import {showLoadingSpinner} from '/src/routes/store.js'

	export let route;
	export let params;
	export let formObject = {
		courseCode: '',
		displayCourseCode: '',
		duration: '',
		category: '',
		image: null,
		titleEn: '',
		titleHi: '',
		categoryName: '',
		descriptionEn: '',
		descriptionHi: '',
		urlEn: '',
		urlHi: '',
		uuid: '',
		method: ''
	};

	let saved = false;
	let validationErrors = {};
	let creationError = false;
	let method = 'post';
	let displayImage = null;
	let imageUploadInputRef;
	let sizeErrorMessage = '';
	const maxFileSizeInIntegers = 1;
	const maxFileSize = 1 * 1024 * 1024;
	const url = $page.url;

	let errorMessage = '';
	let isSubmitting = false;
	let steps = [
		{ number: 1, text: 'Course Details' },
		{ number: 2, text: 'Review' }
	];
	let currentStep = 1;

	onMount(() => {
		if (route.includes('edit')) {
			method = 'PUT';
		} else {
			method = 'POST';
		}
	});

	$: if (method === 'PUT') {
		if (typeof formObject?.image == 'string') {
			displayImage = formObject?.image;
			formObject = formObject;
		}
	}

	$: if (isSubmitting === true){
		showLoadingSpinner.set(true)
	} else {
		showLoadingSpinner.set(false)
	}

	function handleDropDown(e) {
		if (e.detail.type == 'categoryDropdown') {
			formObject.category = e.detail.selectedItemId;
		}
	}

	function sizeCheckForFiles(file) {
		if (file.size > maxFileSize) {
			sizeErrorMessage = `File size exceeds the ${maxFileSizeInIntegers} MB limit. The file is ${(file.size / 1024 / 1024).toFixed(2)} MB.`;
			return true;
		}
	}

	//-------------------Image Related Functions-----------------------------
	function handelUploadImage() {
		imageUploadInputRef.click();
	}
	async function handleImageChange(event) {
		sizeErrorMessage = '';
		const imageFile = event.target?.files[0];
		// Reset input to allow selecting the same file again
		event.target.value = null;
		if (!imageFile) return;
		let sizeCheck = sizeCheckForFiles(imageFile);
		if (sizeCheck) return;
		formObject.image = imageFile;
		displayImage = URL.createObjectURL(imageFile);
	}

	//-------------------------------------Enhance function-----------------------------

	function handleEnhance({ formElement, formData, action, cancel, submitter }) {
		let { search } = action;
		validationErrors = {};

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

		// Validation for dropdowns
		formData?.forEach((value, key) => {
			if (key === 'category') {
				if (value?.length === 0) {
					validationErrors[key] = `The field ${key} should not be empty.`;
				}
			}
		});

		// If there are validation errors, cancel the submission and handle errors
		if (Object.keys(validationErrors)?.length > 0) {
			saved = false;
			isSubmitting=false
			cancel();
			return;
		}

		return async ({ result, update }) => {
			await result;
			// `result` is an `ActionResult` object
			console.log('result', result);
			if (search == '?/final') {
				isSubmitting = true;
				if (result.type == 'success') {
					if (method === 'POST') {
						const dataObject = JSON.stringify({ uuid: result?.data?.data?.uuid });
						goto(`/courses/${result?.data?.data?.uuid}/details`, {
							invalidateAll: true
						});
						message.set(`Successfully added course -"${formObject?.titleEn}".`);
					}
					if (method === 'PUT') {
						const dataObject = JSON.stringify({ uuid: result?.data?.data?.uuid });
						goto(`/courses/${result?.data?.data?.uuid}/details`, {
							invalidateAll: true
						});
						message.set(`Successfully edited course -"${formObject?.titleEn}".`);
					}
				}

				if (result.type == 'failure') {
					// repopulating the dropdown placeholder
					isSubmitting = false;
					formObject.category = result?.data?.data?.category;
					formObject = formObject;
					creationError = true;
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

	onDestroy(()=>{
		showLoadingSpinner.set(false)
	})
</script>

<div class="text-darkGray">
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
		action="/courses"
		enctype="multipart/form-data"
		use:enhance={handleEnhance}
		class=" form"
	>
		{#if !saved}
			<div>
				<h2 class="heading-L mb-4">
					1.{method === 'POST' ? 'Add' : 'Edit'} Course Details
				</h2>
				<hr class="my-4 horizontal-line" />
				<h3 class="heading-L mb-2">Basic Details</h3>
				<!-- First Row -->
				<div class="grid grid-cols-1 lg:grid-cols-2 items-end gap-2 lg:gap-20">
					<div class="grid grid-cols-1 items-end gap-2 order-2 lg:order-none">
						<InputField
							label={'Course Code'}
							placeholder={'Enter Course Code'}
							name={'courseCode'}
							bind:value={formObject.courseCode}
							required
							disabled={method === 'PUT' ? true : false}
						/>
						<InputField
							label={'Display Course Code'}
							placeholder={'Enter user facing course Code'}
							name={'displayCourseCode'}
							bind:value={formObject.displayCourseCode}
							required
						/>
						<DropDown
							on:handleDispatchFilterData={handleDropDown}
							bind:selectedItemId={formObject.category}
							bind:selectedItemName={formObject.categoryName}
							validationErrors={validationErrors ? validationErrors?.category : ''}
							options={courseCategory}
							type={'categoryDropdown'}
							title={'category'}
						/>
						<InputField
							label={'Course Duration (in days)'}
							placeholder={'Enter Course Duration'}
							name={'duration'}
							type="number"
							bind:value={formObject.duration}
							required
						/>
					</div>
					<div class="grid grid-cols-1 items-end mt-2 mb-4 gap-2 order-1 lg:order-none">
						<div class="w-full sm:col-span-1 flex flex-col items-center justify-center gap-4">
							<img
								class="w-32 h-32 rounded-lg border object-cover"
								src={displayImage
									? displayImage.startsWith('blob:')
										? displayImage // Blob URL doesn't need a timestamp
										: `${displayImage}?t=${Date.now()}` // Append timestamp for external URLs
									: '/image-preview-icon.jpg'}
								alt="uploaded user profile"
							/>

							<Button
								type="button"
								on:click={handelUploadImage}
								btnType="secondary"
								customClass={'!w-fit text-wrap'}
								><span class="material-icons-outlined text-center">upload_file</span> Upload course thumbnail</Button
							>

							<input
								type="file"
								name={'image'}
								bind:this={imageUploadInputRef}
								on:change={handleImageChange}
								class="hidden"
								accept=".jpg, .jpeg, .png"
							/>
						</div>
						{#if sizeErrorMessage}
							<p class=" text-xs text-center text-red-500">{sizeErrorMessage}</p>
						{/if}
					</div>
				</div>

				<hr class="my-8 horizontal-line" />
				<h3 class="text-base font-semibold text-primary">Language wise course details</h3>
				<h4 class=" text-xs mb-4 text-gray-90">
					Language wise details are necessary for multi-lingual support
				</h4>
				<div class="flex items-center space-x-2 mb-4">
					<div class="flex">
						<h3 class="font-medium">English</h3>
						<span class="text-red-500">*</span>
					</div>
					<span class="text-xs text-gray-90">( Fill the details in English )</span>
				</div>

				<div class="grid grid-cols-1 lg:grid-cols-2 items-end mb-4 gap-2 lg:gap-20">
					<InputField
						label={'Course Name'}
						placeholder={'Enter Course Name'}
						name={'titleEn'}
						bind:value={formObject.titleEn}
						required
					/>
					<InputField
						label={'Course Overview URL'}
						placeholder={'Enter url'}
						name={'urlEn'}
						type="url"
						bind:value={formObject.urlEn}
					/>
				</div>
				<div class="mb-4 lg:mb-4 w-full">
					<TextDescriptionField
						label={'Description'}
						placeholder={'Enter Course Description'}
						name={'descriptionEn'}
						bind:value={formObject.descriptionEn}
						required
					/>
				</div>

				<hr class="my-8 horizontal-line" />
				<div class="flex items-center space-x-2 mb-4">
					<h3 class="font-medium">Hindi</h3>
					<span class="text-xs text-gray-90">( Fill the details in Hindi )</span>
				</div>

				<div class="grid grid-cols-1 lg:grid-cols-2 items-end mb-4 gap-2 lg:gap-20">
					<InputField
						label={'Course Name'}
						placeholder={'Enter Course Name'}
						name={'titleHi'}
						bind:value={formObject.titleHi}
					/>
					<InputField
						label={'Course Overview URL'}
						placeholder={'Enter url'}
						name={'urlHi'}
						type="url"
						bind:value={formObject.urlHi}
					/>
				</div>
				<div class="mb-4 lg:mb-4 w-full">
					<TextDescriptionField
						label={'Description'}
						placeholder={'Enter Course Description'}
						name={'descriptionHi'}
						bind:value={formObject.descriptionHi}
					/>
				</div>
			</div>
		{:else}
			<div class="mb-2 lg:mb-4 w-full">
				<ReviewForm>
					<h2 class="text-base font-semibold mb-4 text-primary">Course Details</h2>
					<hr class="mb-8 horizontal-line" />

					<div class="flex flex-col md:flex-row gap-6">
						<!-- Image Section -->
						<div class="w-fit md:w-1/3 lg:w-1/4 flex-shrink-0">
							<img
								class="w-full h-48 object-contain object-center rounded-lg shadow-sm"
								src={displayImage
									? displayImage.startsWith('blob:')
										? displayImage // Blob URL doesn't need a timestamp
										: `${displayImage}?t=${Date.now()}` // Append timestamp for external URLs
									: '/image-preview-icon.jpg'}
								alt="Course thumbnail"
							/>
						</div>

						<!-- Course Details Section -->
						<div class="flex-grow">
							<div class="grid grid-cols-1 sm:grid-cols-1 gap-1 mb-2 text-sm">
								<p class="">
									<span class="font-medium">Course code:</span>
									{formObject?.courseCode ?? '-'}
								</p>
								<p class="">
									<span class="font-medium">Display course code:</span>
									{formObject?.displayCourseCode ?? '-'}
								</p>
								<p class=" capitalize">
									<span class="font-medium">Category: </span>{formObject?.categoryName ?? '-'}
								</p>
								<p class="">
									<span class="font-medium">Duration: </span>{formObject?.duration ?? '-'}
									{formObject?.duration > 1 ? 'days' : 'day'}
								</p>
							</div>
							<hr class="my-4 horizontal-line" />
							<h3 class=" font-medium mb-4 mt-2 text-primary">Language-wise Course Details</h3>

							<!-- English Details -->
							<div class="mb-2">
								<h4 class="text-base font-semibold mb-2">English</h4>
								<div class="space-y-1">
									<p class="font-medium">{formObject?.titleEn ?? '-'}</p>
									<p class="text-sm text-gray-600">{formObject?.descriptionEn ?? '-'}</p>
									<p class="text-sm text-blue-600 hover:underline">
										<a href={formObject?.urlEn ?? '#'} target="_blank" rel="noopener noreferrer">
											{formObject?.urlEn ?? '-'}
										</a>
									</p>
								</div>
							</div>

							<hr class="my-4 horizontal-line" />
							<!-- Hindi Details -->
							<div>
								<h4 class="text-base font-semibold mb-2 mt-2">Hindi</h4>
								<div class="space-y-1">
									<p class="font-medium">
										{formObject?.titleHi ? formObject?.titleHi : 'Title: -'}
									</p>
									<p class="text-sm text-gray-600">
										{formObject?.descriptionHi ? formObject?.descriptionHi : 'Descrition: -'}
									</p>
									{#if formObject?.urlHi}
										<p class="text-sm text-blue-600 hover:underline">
											<a href={formObject?.urlHi ?? '#'} target="_blank" rel="noopener noreferrer">
												{formObject?.urlHi ?? '-'}
											</a>
										</p>
									{:else}
										<p class="text-sm">
											{formObject?.urlHi ? formObject?.urlHi : 'Course Overview URL: -'}
										</p>
									{/if}
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

<style>
	.dashed-line::before {
		@apply absolute w-20 h-0.5 top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/4 border-t lg:border-t-2 border-darkGray border-dashed;
		content: '';
	}
</style>
