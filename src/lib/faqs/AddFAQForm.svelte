<script>
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { message } from '/src/routes/courses/courseStore.js';
	import DropDown from '$lib/components/DropDown.svelte';
	import InputField from '$lib/components/InputField.svelte';
	// import BreadCrumbs from '$lib/components/BreadCrumbs.svelte';
	import TextDescriptionField from '$lib/components/TextDescriptionField.svelte';
	import SubmissionErrorMessage from '$lib/components/SubmissionErrorMessage.svelte';
	import ReviewForm from '$lib/components/ReviewForm.svelte';
	import Button from '$lib/components/Button.svelte';
	import MultiStepProgressComponent from '$lib/components/MultiStepProgressComponent.svelte';


	

	export let route;
	export let params;
	export let formObject = {
		categoryId: '',
		questionEn: '',
		questionHi: '',
		categoryName: '',
		answerEn: '',
		answerHi: '',
		uuid: '',
		method: ''
	};

	let saved = false;
	let validationErrors = {};
	let creationError = false;
	let method = 'post';
	let displayImage = null;
	let errorMessage = '';

	export let faqCategoryListData = [];

	let isSubmitting = false;

	let steps=[{number:1, text:'Details'},{number:2, text:'Review'}]
	let currentStep = 1



	onMount(() => {
		if (route.includes('edit')) {
			method = 'PUT';
		} else {
			method = 'POST';
		}
	});

	function handleDropDown(e) {
		if (e.detail.type == 'categoryDropdown') {
			formObject.categoryId = e.detail.selectedItemId;
		}
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
			isSubmitting = true;
		}
		Object.keys(formObject)?.forEach((key) => {
			formData.set(key, formObject[key]);
		});

		formData.set('method', method);

		if (!formObject.categoryId) {
			validationErrors.categoryId = 'This field should not be empty.';
		}

		
		// Validation for dropdowns
		formData?.forEach((value, key) => {
			if (key === 'categoryName') {
				if (value?.length === 0) {
					validationErrors[key] = `The field ${key} should not be empty.`;
				}
			}
		});

		// If there are validation errors, cancel the submission and handle errors
		if (Object.keys(validationErrors)?.length > 0) {
			saved = false;
			cancel();
			return;
		}

		return async ({ result, update }) => {
			await result;
			// `result` is an `ActionResult` object
			if (search == '?/final') {
				isSubmitting = true;
				if (!Object.keys(result?.data)?.includes('error')) {
					if (method === 'POST') {
						goto(`/FAQs`, { invalidateAll: true });
						message.set('FAQ added successfully!');
					}
					if (method === 'PUT') {
						goto(`/FAQs`, { invalidateAll: true });
						message.set('FAQ edited successfully!');
					}

				} else {
					// repopulating the dropdown placeholder
					isSubmitting = false;
					formObject.categoryId = result?.data?.data?.categoryId;
					formObject = formObject;
					creationError = true;
					if (result?.data?.error) {
						errorMessage = result?.data?.error;
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
		currentStep=1
		formObject = formObject;
	}

	let faqCatFilterOptionList = [];
	faqCategoryListData.forEach((item) => {
		if (item.languageCode === 'en' && item.category && item.extId) {
			faqCatFilterOptionList.push({ title: item.category, uuid: item.extId });
		}
	});
	
	function getMatchingCategory() {
    return faqCategoryListData.find(item => 
      item.languageCode === 'hi' && 
      faqCategoryListData.some(enItem => 
        enItem.languageCode === 'en' && 
        enItem.category.trim().toLowerCase() === formObject.categoryName.trim().toLowerCase() && 
        enItem.extId === item.extId
      )
    );
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
		action="/FAQs"
		enctype="multipart/form-data"
		use:enhance={handleEnhance}
		class="form"
	>
		{#if !saved}
			<div>
				<h2 class="heading-L">1.{method === 'POST' ? 'Add' : 'Edit'} FAQ Details</h2>
				<hr class="my-4 horizontal-line" />
				<h3 class="heading-L mb-2 ">Basic Details</h3>

				<!-- First Row -->
				<!-- <div class="grid grid-cols-1 lg:grid-cols-2 items-end mb-4 gap-2 lg:gap-20">
					<div class="grid grid-cols-1 items-end mb-4 gap-2 order-2 lg:order-none">

						<DropDown
							on:handleDispatchFilterData={handleDropDown}
							bind:selectedItemId={formObject.categoryId}
							bind:selectedItemName={formObject.categoryName}
							validationErrors={validationErrors ? validationErrors?.categoryId : ''}
							options={faqCatFilterOptionList}
							type={'categoryDropdown'}
							title={'FAQ category'}
						/>
						
					</div>

				</div> -->

				<div class="grid grid-cols-1 lg:grid-cols-2 items-end gap-2 lg:gap-20">
					<!-- Dropdown Section -->
					<div class="grid grid-cols-1 items-end gap-2 order-2 lg:order-none">
						<DropDown
							on:handleDispatchFilterData={handleDropDown}
							bind:selectedItemId={formObject.categoryId}
							bind:selectedItemName={formObject.categoryName}
							validationErrors={validationErrors ? validationErrors?.categoryId : ''}
							options={faqCatFilterOptionList}
							type={'categoryDropdown'}
							title={'FAQ category'}
						/>
				
						<!-- "View FAQ Category" Link -->
						<a 
							href="\FAQs\faqCategories"
							class="text-xs text-blue-500 hover:underline mt-2"
						>
							View All FAQ Categories
						</a>
					</div>
				</div>

						<hr class="my-4 horizontal-line" />
				<h3 class=" heading-L">Language wise FAQ details</h3>

				<h4 class=" text-xs mb-4 text-gray-400">
					Language wise details are necessary for multi-lingual support
				</h4>
				<div class="flex items-center space-x-2 mb-4">
					<div class="flex">
						<h3 class="font-semibold">English</h3>
						<span class="text-red-500">*</span>
					</div>
					<span class="text-xs text-gray-400">(Fill the details in english)</span>
				</div>

				<div class="grid grid-cols-1 lg:grid-cols-2 items-end mb-4 gap-2 lg:gap-20">
					<InputField
						label={'Question'}
						placeholder={'Enter question'}
						name={'questionEn'}
						bind:value={formObject.questionEn}
						required
					/>
				</div>
				<div class="mb-4 lg:mb-4 w-full">
					<TextDescriptionField
						label={'Answer'}
						placeholder={'Enter descriptive answer'}
						name={'answerEn'}
						bind:value={formObject.answerEn}
						required
					/>
				</div>

				<hr class="my-4 horizontal-line" />
				<div class="flex items-center space-x-2 mb-4">
					<h3 class="font-semibold">Hindi</h3>
					<span class="text-xs text-gray-400">(Fill the details in hindi)</span>
				</div>

				<div class="grid grid-cols-1 lg:grid-cols-2 items-end mb-4 gap-2 lg:gap-20">
					<InputField
						label={'Question'}
						placeholder={'Enter question'}
						name={'questionHi'}
						bind:value={formObject.questionHi}
					/>
				</div>
				<div class="mb-4 lg:mb-4 w-full">
					<TextDescriptionField
						label={'Answer'}
						placeholder={'Enter descriptive answer'}
						name={'answerHi'}
						bind:value={formObject.answerHi}
					/>
				</div>
			</div>
		{:else}
			<div class="mb-2 lg:mb-4 w-full">
				<ReviewForm>
					<h2 class="heading-L mb-4">FAQ Details</h2>
					<hr class="mb-4 horizontal-line" />

					<div class="flex flex-col md:flex-row gap-6">
						<div class="flex-grow">
							
							<h3 class=" font-medium mb-4 mt-2 text-primary">Language-wise FAQ Details</h3>


							<!-- English Details -->
							<div class="mb-2">
								<h4 class="text-base font-semibold mb-2">English</h4>
								<div class="space-y-1">

									<p class="text-sm font-medium">{formObject?.questionEn ?? '-'}</p>
									<p class="text-sm ">{formObject?.answerEn ?? '-'}</p>
									<p class="text-sm">
										<span class="label">Category Name :</span>
										{formObject?.categoryName ?? '-'}
									</p>
								</div>
							</div>

							<hr class="space-y-4 horizontal-line" />
							<!-- Hindi Details -->
							<div>
								<h4 class="text-base font-semibold mb-2 mt-2">Hindi</h4>
								<div class="space-y-1">

									<p class="text-sm font-medium">

										{formObject?.questionHi ? formObject?.questionHi : 'Question: -'}
									</p>
									<p class="text-sm ">
										{formObject?.answerHi ? formObject?.answerHi : 'Answer: -'}
									</p>

									<!-- <p class="font-medium">
										{#if getMatchingCategory()}
         								Category Name :{getMatchingCategory().category}
        								{/if}
									</p> -->
									{#if getMatchingCategory()}
									<p class="text-sm">
										<span class="label">Category Name :</span>
										{getMatchingCategory().category}
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
