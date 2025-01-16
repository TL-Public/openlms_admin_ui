<script>
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { message } from '/src/routes/officialTestimonials/store.js';
	import InputField from '$lib/components/InputField.svelte';
	// import BreadCrumbs from '$lib/components/BreadCrumbs.svelte';
	import TextDescriptionField from '$lib/components/TextDescriptionField.svelte';
	import SubmissionErrorMessage from '$lib/components/SubmissionErrorMessage.svelte';
	import ReviewForm from '$lib/components/ReviewForm.svelte';
	import Button from '$lib/components/Button.svelte';
	import MultiStepProgressComponent from '$lib/components/MultiStepProgressComponent.svelte';

	export let route;
	export let formObject = {
		nameEn: '',
		designationEn: '',
		testimonialTextEn: '',
		nameHi: '',
		designationHi: '',
		testimonialTextHi: '',
		uuid: '',
		image:null,
		videoUrl:'',
		method: '',
		type: 'text' // Default to 'text', can be 'text' or 'video'
	};

	let saved = false;
	let validationErrors = {};
	let creationError = false;
	let method = 'post';
	let displayImage = null;
	let sizeErrorMessage = '';
	let imageUploadInputRef;
	const maxFileSizeInIntegers = 1;
	const maxFileSize = 0.5 * 1024 * 1024;
	let errorMessage = '';
	let isSubmitting=false
	let imageUrl=''
	let steps=[{number:1, text:'Details'},{number:2, text:'Review'}]
	let currentStep = 1

	let testimonialTypes = [
		{ value: 'text', label: 'Text' },
		{ value: 'video', label: 'Video' }
	];

	onMount(() => {
		if (route.includes('edit')) {
			method = 'PUT';
			if (typeof formObject?.image == 'string') {
				imageUrl= formObject?.image;
			}
		} else {
			method = 'POST';
		}

		if (method === 'PUT') {
			if (typeof formObject?.image == 'string') {
				displayImage = formObject?.image;
				formObject = formObject;
			}
		 if(formObject?.videoUrl){
			formObject.type='video'
		 } else{
			formObject.type='text'
		 }
		
		}
	}



);


// --------------------- Functions to handle text/video selection --------------------

		function handleTypeChange(event) {
			if(method==='PUT') return
			const newType = event.target.value;

		// Clear fields depending on the type
		if (newType === 'text') {
			formObject.videoUrl = ''; // Clear video URL if type is changed to text
		} else if (newType === 'video') {
			formObject.testimonialTextEn = '';
			formObject.testimonialTextHi = '';
		}
		formObject.type = newType;
	}

	// Enhance function
	function handleEnhance({ formElement, formData, action, cancel, submitter }) {
		let { search } = action;
		validationErrors = {};

		// This is done becuase enhance function is being triggered when the pdf is opened in another window
		if (search == '?/review') {
			saved = !saved;
			currentStep=2		
		}

		if (search == '?/final') {
			isSubmitting=true;
		}

		Object.keys(formObject)?.forEach((key) => {
			formData.set(key, formObject[key]);
		});

		if (typeof imageUrl == 'string' && method ==='PUT') {
			formData.set('imageUrl', imageUrl);	
			}

		formData.set('method', method);

		// Validation for dropdowns
		// formData?.forEach((value, key) => {
		// 	if (key === 'categoryName') {
		// 		if (value?.length === 0) {
		// 			validationErrors[key] = `The field ${key} should not be empty.`;
		// 		}
		// 	}
		// });

		// If there are validation errors, cancel the submission and handle errors
		if (Object.keys(validationErrors)?.length > 0) {
			saved = false;
			cancel()
			return;
		}

		return async ({ result, update }) => {
			await result;
			// `result` is an `ActionResult` object
			if (search == '?/final') {
				isSubmitting=true;
				if (!Object.keys(result?.data)?.includes('error')) {
					if (method === 'POST') {
						goto(`/officialTestimonials`, { invalidateAll: true });
						message.set(`Successfully added testimonial of '${formObject?.nameEn}'.`);
					}
					if (method === 'PUT') {
						goto(`/officialTestimonials`, { invalidateAll: true });
						message.set(`Successfully edited testimonial of '${formObject?.nameEn}'.`);
					}
				} else {
					isSubmitting=false;
					formObject = formObject;
					creationError = true;
					if (result?.data?.error) {
						errorMessage = result?.data?.error;
					}
				}
			}
		};
	}

	function handelUploadImage() {
		imageUploadInputRef.click();
	}

	function sizeCheckForFiles(file) {
		if (file.size > maxFileSize) {
			sizeErrorMessage = `File size exceeds the ${maxFileSizeInIntegers} MB limit. The file is ${(file.size / 1024 / 1024).toFixed(2)} MB.`;
			return true;
		}
	}

	async function handleImageChange(event) {
		sizeErrorMessage = '';
		const imageFile = event.target?.files[0];
		// Reset input to allow selecting the same file again
		event.target.value = null;
		if (!imageFile) return;
		const sizeCheck = sizeCheckForFiles(imageFile);
		if (sizeCheck) return;
		formObject.image = imageFile;
		displayImage = URL.createObjectURL(imageFile);
	}

	function handleGoBack() {
		window.history.back();
	}

	function handlePrevious() {
		saved = false;
		currentStep=1
		formObject = formObject;
	}
</script>

<div class=" text-darkGray">
	{#if creationError}
		<div class="mb-2">
			<SubmissionErrorMessage {errorMessage} />
		</div>
	{/if}
	
	<div class="w-full max-w-80 mx-auto">
		<MultiStepProgressComponent 
		{steps}
		{currentStep}/>
	</div>

	<form
		method="post"
		action="/officialTestimonials"
		enctype="multipart/form-data"
		use:enhance={handleEnhance}
		class="form"
	>
		{#if !saved}
			<div>
				<h2 class="heading-L mb-4">
					1.{method === 'POST' ? 'Add' : 'Edit'} Testimonial Details
				</h2>
				<hr class="my-4 horizontal-line" />
				<!-- First Row -->
				<div class="grid grid-cols-1 place-items-start mb-4 gap-2 lg:gap-20">
					<!-- <div class="grid grid-cols-1 items-end mb-4 gap-2 order-2 lg:order-none"></div>
					<div class="grid grid-cols-1 items-end mt-2 mb-4 gap-2 order-1 lg:order-none"></div> -->
					<div class=" flex flex-col items-center gap-2">
						<img
							class="w-32 h-32 rounded-lg border object-cover"
							src={
								displayImage
									? displayImage.startsWith('blob:')
										? displayImage // Blob URL doesn't need a timestamp
										: `${displayImage}?t=${Date.now()}` // Append timestamp for external URLs
									: '/image-preview-icon.jpg'
							}
							alt="uploaded user profile"
						/>

						<Button
							btnType="secondary"
							type="button"
							on:click={handelUploadImage}
							><span class="material-icons-outlined text-center">upload_file</span>Display picture</Button
						>
						<input
							type="file"
							name={'image'}
							bind:this={imageUploadInputRef}
							on:change={handleImageChange}
							class="hidden"
						/>
						{#if sizeErrorMessage}
							<p class=" text-xs text-center text-red-500">{sizeErrorMessage}</p>
						{/if}
					</div>
				</div>

				<hr class="my-4 horizontal-line" />

				<div class="mb-4">
					<label class="block text-sm font-medium mb-2">Type of testimonial</label>
					<div class="flex gap-4">
						{#each testimonialTypes as { value, label }}
							<label class="inline-flex items-center">
								<input
									type="radio"
									name="testimonialType"
									value={value}
									bind:group={formObject.type}
									on:change={handleTypeChange}
									class="form-radio text-blue-500"
									disabled={method==='PUT'}
								/>
								<span class="ml-2 text-xs sm:text-sm">{label}</span>
							</label>
						{/each}
					</div>
				</div>
			
				{#if formObject.type === 'video'}
					<div class="grid grid-cols-1 lg:grid-cols-2 items-end mb-4 gap-2 lg:gap-20">
						<InputField
							label="Video URL"
							placeholder="Enter video URL"
							name="videoUrl"
							type="url"
							bind:value={formObject.videoUrl}
							required
						/>
					</div>
				{/if}

				<hr class="my-4 horizontal-line" />
			
				<h3 class=" font-semibold">Language wise testimonial details</h3>
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
					<div class="grid gap-4">
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
				</div>
				{#if formObject.type === 'text'}
				<div class="mb-4 lg:mb-4 w-full">
					<TextDescriptionField
						label={'Testimonial text'}
						placeholder={'Enter testimonial text'}
						name={'testimonialTextEn'}
						bind:value={formObject.testimonialTextEn}
						required
					/>
				</div>
				{/if}

				<hr class="my-4 horizontal-line" />
				<div class="flex items-center space-x-2 mb-4">
					<h3 class="font-semibold">Hindi</h3>
					<span class="text-xs text-gray-400">(Fill the details in Hindi)</span>
				</div>

				<div class="grid grid-cols-1 lg:grid-cols-2 items-end mb-4 gap-2 lg:gap-20">
					<div class="grid gap-4">
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
				</div>
				{#if formObject.type === 'text'}
				<div class="mb-4 lg:mb-4 w-full">
					<TextDescriptionField
						label={'Testimonial text'}
						placeholder={'Enter testimonial text'}
						name={'testimonialTextEn'}
						bind:value={formObject.testimonialTextHi}
					/>
				</div>
				{/if}
			</div>
		{:else}
			<div class="mb-2 lg:mb-4 w-full">
				<ReviewForm>
					<h2 class="heading-L mb-4">Testimonial Details</h2>
					<hr class="mb-6 horizontal-line" />

					<div class="flex flex-col md:flex-row gap-6">
						<div class="w-fit md:w-1/3 lg:w-1/4 flex-shrink-0">
							<img
								class="w-full h-48 object-contain object-center rounded-lg shadow-sm"
								src={
									displayImage
										? displayImage.startsWith('blob:')
											? displayImage // Blob URL doesn't need a timestamp
											: `${displayImage}?t=${Date.now()}` // Append timestamp for external URLs
										: '/image-preview-icon.jpg'
								}
								alt="Display thumbnail"
							/>
						</div>
						<div class="flex-grow">
							<!-- <h3 class=" font-medium mb-4 mt-2">Language-wise testimonial Details</h3> -->
							{#if formObject.type==='video'}
							<!-- <p class="text-sm text-blue-600 hover:underline mb-2">
								<a href={formObject?.videoUrl?? '#'} target="_blank" rel="noopener noreferrer">
									{formObject?.videoUrl?? '-'}
								</a>
							</p> -->
							<div class="flex items-center space-x-2">
								<span class="label">Video URL:</span>
								<p class="text-sm text-blue-600 hover:underline break-words ">
								  <a href={formObject.videoUrl ?? '#'} target="_blank" rel="noopener noreferrer" class="break-all">
									{formObject.videoUrl ?? '-'}
								  </a>
								</p>
							  </div>
							<hr class="my-4 horizontal-line" />
							{/if}

							<!-- English Details -->
							<div class="mb-2">
								<h4 class="text-base font-semibold mb-2">English</h4>
								<div class="space-y-1">
									<p class="font-medium">{formObject?.nameEn ?? '-'}</p>
									<p class="text-sm text-gray-600">{formObject?.designationEn ?? '-'}</p>
									{#if formObject.type ==='text'}
									<p class="text-sm text-gray-600">{formObject?.testimonialTextEn ?? '-'}</p>
									{/if}
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
									{#if formObject.type ==='text'}
									<p class="text-sm text-gray-600">
										{formObject?.testimonialTextHi
											? formObject?.testimonialTextHi
											: 'Testimonial Text: -'}
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
