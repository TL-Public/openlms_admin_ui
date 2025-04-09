<script>
	import { enhance } from '$app/forms';
	import { onMount, tick } from 'svelte';
	import Address from '$lib/components/Address.svelte';
	import InputField from '$lib/components/InputField.svelte';
	import BreadCrumbs from '$lib/components/BreadCrumbs.svelte';
	import DropDown from '$lib/components/DropDown.svelte';
	import SubmissionErrorMessage from '$lib/components/SubmissionErrorMessage.svelte';
	import ReviewForm from '$lib/components/ReviewForm.svelte';
	import { goto } from '$app/navigation';
	import TextDescriptionField from '$lib/components/TextDescriptionField.svelte';
	import { message } from '/src/routes/trainingCenters/tcStore.js';
	import { String_Constants } from '/src/config/constants.js';
	import SearchableComboBox from '$lib/components/SearchableComboBox.svelte';
	import Button from '$lib/components/Button.svelte';
	import { page } from '$app/stores';
	import MultiStepProgressComponent from '$lib/components/MultiStepProgressComponent.svelte';


	let saved = false;
	let validationErrors = {};
	let creationError = '';
	let method = 'POST';
	let isSubmitting = false;
	let districtList = [];
	let fullDistrictList = []; // to be used when translation of district need to be entered in Hindi as well
	let steps=[{number:1, text:'Details'},{number:2, text:'Review'}]
	let currentStep = 1

	export let stateData = [];
	export let route;
	export let params;
	export let bankData = [];
	export let isEditMode = false;
	export let tcObject = {
		uuid: '',
		bankId: '',
		bankName: '',
		stateId: 0,
		extId: '',
		rsetiId:'',
		email: '',
		contactNo: '',
		directorContactNo: '',
		nameEnglish: '',
		addressEnglish: '',
		districtEnglish: '',
		directorNameEn: '',
		nameHindi: '',
		// districtHindi: '',
		addressHindi: '',
		directorNameHi: '',
		stateName: '',
		method: '',
		translationIdEnglish: 0,
		translationIdHindi: 0,
		// districtName: '',
		districtId: '',
		districtName: ''
	};

	onMount(() => {
		if (route?.includes('edit')) {
			method = 'PUT';
			popualateDistList(tcObject.stateId);
		} else {
			method = 'POST';
		}
	});

	function handleGoBack() {
		window.history.back();
	}

	async function handlePrevious() {
		saved = false;
		currentStep=1
		tcObject = tcObject;
	}

	function findHindiDistrictName(distId) {
		for (let item of fullDistrictList) {
			if (item.languageCode == 'hi' && item.exitId == distId) return item.name;
		}
		return '';
	}

	function preparePayload(method) {
		const payload = {
			uuid: tcObject.uuid,
			bankId: tcObject.bankId,
			stateId: parseInt(tcObject.stateId),
			extId: tcObject.rsetiId,
			email: tcObject.email,
			contactNo: tcObject.contactNo,
			directorContactNo: tcObject.directorContactNo,
			translations: [
				{
					// id: tcObject.translationIdEnglish ? tcObject.translationIdEnglish : '',
					languageCode: 'en',
					districtId: tcObject.districtId,
					district: tcObject.districtName,
					name: tcObject.nameEnglish,
					address: tcObject.addressEnglish,
					directorName: tcObject.directorNameEn
				},
				{
					// id: tcObject.translationIdHindi ? tcObject.translationIdHindi : '',
					languageCode: 'hi',
					districtId: tcObject.districtId,
					district: findHindiDistrictName(tcObject.districtId),
					name: tcObject.nameHindi,
					address: tcObject.addressHindi,
					directorName: tcObject.directorNameHi
				}
			]
		};

		if (method === 'PUT') {
			payload.uuid = tcObject.uuid;
		}

		return payload;
	}

	function validateEmails(input) {
		// Regular expression for validating emails
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

		const emails = input.split(',').map((email) => email.trim());

		const result = {
			valid: [],
			invalid: []
		};

		emails.forEach((email) => {
			if (emailRegex.test(email)) {
				result.valid.push(email);
			} else if (email !== '') {
				result.invalid.push(email);
			}
		});

		return result;
	}

	function validateForm() {
		validationErrors = {}; // Reset errors

		// Validate SearchableComboBox (Bank)
		if (!tcObject.bankId) {
			validationErrors.bankId = 'Please select a bank.';
		}

		// Validate DropDown (State)
		if (!tcObject.stateId) {
			validationErrors.stateId = 'Please select a state.';
		}
		if (!tcObject.districtId) {
			validationErrors.districtId = 'Please select a district.';
		}

		const { invalid } = validateEmails(tcObject.email);
		``;
		if (invalid.length > 0) {
			validationErrors.email = `Please correct invalid email id(s) : ${invalid.join(', ')}`;
		}

		return Object.keys(validationErrors).length === 0; // Returns true if no errors
	}

	function handleEnhance({ formElement, formData, action, cancel, submitter }) {
		let { search } = action;
		validationErrors = {};

		if (search == '?/review') {
			currentStep=2
		}

		formData.set('method', method);
		if (method === 'PUT') {
			formData.set('uuid', tcObject.uuid);
		}

		if (Object.keys(validationErrors)?.length > 0) {
			saved = false;
			cancel();
			return;
		}
		if (!validateForm()) {
			cancel();
			return;
		}

		// Prepare the payload to match backend expectations
		const payload = preparePayload();

		formData.set('data', JSON.stringify(payload));

		return async ({ result, update }) => {
			await result;
			if (search == '?/review' && result.type === 'success') {
				saved = true;
			}

			if (search == '?/final') {
				isSubmitting = true;
				if (!Object.keys(result?.data)?.includes('error')) {
					if (method === 'POST') {
						goto(`/trainingCenters`, { invalidateAll: true });
						message.set(`Successfully added training center "${tcObject.nameEnglish}"! `);
					}
					if (method === 'PUT') {
						goto(`/trainingCenters`, { invalidateAll: true });
						message.set(`Successfully edited training center "${tcObject.nameEnglish}"!`);
					}
				} else {
					const errorMsg =
						method === 'PUT'
							? 'Failed to update training center. Please try again!'
							: 'Failed to add training center. Please try again!';

					try {
						const { data } = result.data;
						const parseData = JSON.parse(data.data);
						tcObject.stateId = parseData.stateId;
						tcObject.bankId = parseData.bankId;
					} catch (err) {
						console.log('failed to parse data');
					}

					creationError = result?.data?.error ? result?.data?.error : errorMsg;
					isSubmitting = false;
				}
			}
		};
	}

	// let stateFilterOptionList = [
	// 	// { title: String_Constants.ALL_STATES, uuid: 0 },
	// 	...stateData
	// 		.filter((state) => state.languageCode === 'en' && state.name && state.extId) // Filter by languageCode and valid name/extId
	// 		.map((state) => ({
	// 			title: state.name.trim(),
	// 			uuid: state.extId
	// 		}))
	// ];

	let stateFilterOptionList = [];

	stateData.forEach((item) => {
		if (item.languageCode === 'en' && item.name && item.extId) {
			stateFilterOptionList.push({ title: item.name.trim(), uuid: item.extId });
		}
	});

	let bankDataList = [
		// { title: String_Constants.ALL_BANKS, uuid: 0 },
		...bankData
			.filter((bank) => bank.name && bank.uuid) // Filter by languageCode and valid name/extId
			.map((bank) => ({
				title: bank.name,
				uuid: bank.uuid
			}))
	];

	function handleDistrictSelection(event) {
		tcObject.districtName = event.detail.selectedItemName;
		tcObject.districtId = event.detail.selectedItemId;
	}
	function handleDistrictClearFilter(event) {
		tcObject.districtName = '';
		tcObject.districtId = '';
	}
	function handleBankId(event) {
		tcObject.bankName = event.detail.selectedItemName;
		tcObject.bankId = event.detail.selectedItemId;
	}

	function handleBankClearFilter() {
		tcObject.bankName = '';
		tcObject.bankId = '';
	}

	function handleStateId(event) {
		tcObject.stateName = event.detail.selectedItemName; // Or value based on your use case
		tcObject.stateId = event.detail.selectedItemId;
		popualateDistList(tcObject.stateId);
	}

	async function popualateDistList(stateId) {
		if (!tcObject.stateId) return;

		stateData.forEach((state) => {
			if (state.extId == stateId) {
				if (state.languageCode === 'en' && state.districts?.length > 0) {
					districtList = [...state.districts];
				}
				if (state.languageCode === 'hi' && state.districts?.length > 0) {
					//the fullDistrictList will have both english and Hindi dist names.
					// the user need to pick the English name, our prog will handle the Hindi part
					fullDistrictList = [...districtList, ...state.districts];
				}
			}
		});
		districtList = districtList.map((item, index) => {
			return { ...item, uuid: index + 1 };
		});
	}

	function handleStateClearFilter() {
		tcObject.stateName = '';
		tcObject.stateId = '';
		tcObject.districtId = '';
		tcObject.districtName = '';
		districtList = [];
	}
</script>

<div class="my-4 text-primary">
	{#if creationError}
		<div class="mb-2">
			<SubmissionErrorMessage errorMessage={creationError} />
		</div>
	{/if}

	<div class="w-full max-w-80 mx-auto">
		<MultiStepProgressComponent 
		{steps}
		{currentStep}/>
	</div>

	<form method="post" action="?/review" use:enhance={handleEnhance} class="form">
		<div>
			{#if !saved}
				<h2 class=" heading-L">
					1.{method === 'POST' ? 'Add' : 'Edit'} Training Center Details
				</h2>
				<hr class="mt-2 mb-8 horizontal line" />
				<h3 class="my-4 heading-L">Basic Details</h3>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 lg:gap-x-12 gap-y-4 mb-2 md:mb-8">
					<InputField
						label={'RESTI Id'}
						type="text"
						placeholder={'Enter RESTI Id'}
						name={'rsetiId'}
						bind:value={tcObject.rsetiId}
						required
						disabled={isEditMode}
					/>
					<div>
						<SearchableComboBox
							options={bankDataList}
							label={'Select bank'}
							filterCategory={'courseListing'}
							placeholder={'Select sponsor bank'}
							bind:selectedItemName={tcObject.bankName}
							bind:selectedItemId={tcObject.bankId}
							on:handleDispatchComboBoxData={handleBankId}
							on:handleDispatchFilterData={handleBankClearFilter}
						/>
						{#if validationErrors.bankId}
							<p class="text-red-600 text-xs mt-1">{validationErrors.bankId}</p>
						{/if}
					</div>

					<InputField
						label={'Phone Number'}
						type="number"
						name="phoneNumber"
						placeholder={'Enter Phone Number'}
						bind:value={tcObject.contactNo}
						required
					/>

					<div>
						<InputField
							label={'Email'}
							placeholder={'Enter Email'}
							name={'email'}
							bind:value={tcObject.email}
							required
						/>
						{#if validationErrors.email}
							<p class="text-red-600 text-xs mt-1">{validationErrors.email}</p>
						{/if}
					</div>
					<div>
						<SearchableComboBox
							options={stateFilterOptionList}
							label={'Select state'}
							filterCategory={'stateListing'}
							placeholder={'Select state of Training Center'}
							bind:selectedItemName={tcObject.stateName}
							bind:selectedItemId={tcObject.stateId}
							on:handleDispatchComboBoxData={handleStateId}
							on:handleDispatchFilterData={handleStateClearFilter}
						/>
						{#if validationErrors.stateId}
							<p class="text-red-600 text-xs mt-1">{validationErrors.stateId}</p>
						{/if}
					</div>
					<InputField
						label={"Director's phone no."}
						placeholder={"Enter Director's phone no."}
						type="number"
						name={'directorsPhone'}
						bind:value={tcObject.directorContactNo}
					/>
					<div>
						<SearchableComboBox
							options={districtList}
							label={'Select district'}
							filterCategory={'districtList'}
							placeholder={'Select district'}
							bind:selectedItemId={tcObject.districtId}
							bind:selectedItemName={tcObject.districtName}
							on:handleDispatchComboBoxData={handleDistrictSelection}
							on:handleDispatchFilterData={handleDistrictClearFilter}
						/>
						{#if validationErrors.districtId}
							<p class="text-red-600 text-xs mt-1">{validationErrors.districtId}</p>
						{/if}
					</div>
				</div>
				<hr class="my-8 horizontal-line" />
				<h3 class=" heading-L">Language wise Training Center details</h3>
				<h4 class=" helper-text mb-4">
					Language wise details are neccessary for multi-lingual support
				</h4>
				<div class="flex items-center space-x-2 mb-4">
					<div class="flex">
						<h3 class="font-medium">English</h3>
						<span class="text-red-500">*</span>
					</div>
					<span class="text-xs text-gray-90">( Fill the details in English )</span>
				</div>
				<div class="grid grid-cols-2 gap-4 mb-2 lg:mb-4">
					<div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 lg:gap-x-12 gap-y-4 mb-2 col-span-2">
						<InputField
							label={'Name of Training center'}
							type="text"
							placeholder={'Enter Training center name'}
							name={'englishName'}
							required
							bind:value={tcObject.nameEnglish}
						/>
						<InputField
							label={"Director's name"}
							type="text"
							placeholder={"Enter Training center Director's name"}
							name={'directorNameEn'}
							bind:value={tcObject.directorNameEn}
						/>
					</div>
					<div class="col-span-2">
						<TextDescriptionField
							label={'Address'}
							placeholder={'Enter Address'}
							name={'descriptionEn'}
							bind:value={tcObject.addressEnglish}
							required
						/>
					</div>
				</div>

				<hr class="my-8 horizontal-line" />

				<div class="flex items-center space-x-2 mb-4">
					<h3 class="font-medium">Hindi</h3>
					<span class="text-xs text-gray-90">( Fill the details in Hindi )</span>
				</div>
				<div class="grid grid-cols-2 gap-4 mb-2 lg:mb-4">
					<div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 lg:gap-x-12 gap-y-4 mb-2 col-span-2">
						<InputField
							label={'Name of Training center'}
							placeholder={'Enter Training center name'}
							name={'hindiName'}
							bind:value={tcObject.nameHindi}
						/>
						<InputField
							label={"Director's name"}
							type="text"
							placeholder={"Enter Training center Director's name"}
							name={'directorNameHi'}
							bind:value={tcObject.directorNameHi}
						/>
					</div>
					<div class="col-span-2">
						<TextDescriptionField
							label={'Address'}
							placeholder={'Enter Address'}
							name={'descriptionEn'}
							bind:value={tcObject.addressHindi}
						/>
					</div>
				</div>
			{:else}
				<div class="mb-2 lg:mb-4 w-full">
					<ReviewForm>
						<h2 class="heading-L">Training Center Details</h2>
						<hr class="mb-4 mt-2 horizontal-line" />
						<div class="flex flex-col text-darkGray">
							<!-- Section 1: Institution Details -->
							<div class="flex flex-col gap-2 text-sm">
								<div class="text-sm">
									<span class="label">ID : </span>
									{tcObject?.rsetiId}
								</div>
								<div class="text-sm">
									<span class="label">Bank : </span>{tcObject?.bankName}
								</div>
								<div class="text-sm">
									<span class="label">Phone no: </span>{tcObject?.contactNo}
								</div>
								<div class="text-sm">
									<span class="label">Email : </span>{tcObject?.email}
								</div>
								<div class="text-sm">
									<span class="label">State/UT : </span>{tcObject?.stateName}
								</div>
								<div class="text-sm">
									<span class="label">District : </span>{tcObject?.districtName}
								</div>

								<div class="text-sm">
									<span class="label">Director's phone no. : </span>{tcObject?.directorContactNo}
								</div>
							</div>
							<hr class="my-8 horizontal-line" />

							<div class="flex flex-col gap-2 text-sm">
								<h3 class=" heading-L">Language-wise Training center Details</h3>
								<h4 class="heading-L mb-2">English</h4>

								<div class="font-medium text-base">{tcObject?.nameEnglish}</div>
								<div class=""><span class="label">Address : </span>{tcObject?.addressEnglish}</div>
								<div class="">
									<span class="label">Director's name : </span>{tcObject?.directorNameEn}
								</div>

								<hr class="my-4 horizontal-line" />
								<h4 class="heading-L mb-2">Hindi</h4>

								<div class="font-medium text-base {!tcObject?.nameHindi ? 'text-red-600' : ''}">
									{tcObject?.nameHindi ? tcObject?.nameHindi : 'No Hindi title added'}
								</div>

								<div class={!tcObject.addressHindi ? 'text-red-600' : ''}>
									<span class="label">Address : </span>
									<span>
										{tcObject?.addressHindi ? tcObject?.addressHindi : '-'}
									</span>
								</div>
								<div class={!tcObject.addressHindi ? 'text-red-600' : ''}>
									<span class="label">Director's name : </span>
									<span>
										{tcObject?.directorNameHi ? tcObject?.directorNameHi : '-'}
									</span>
								</div>
							</div>
						</div>
					</ReviewForm>
				</div>
			{/if}
		</div>
		<div class="flex justify-end gap-4 flex-wrap my-4">
			<Button
				type="button"
				btnType="secondary"
				customClass={'inline-block w-full bp-420px:w-fit flex justify-center'}
				disabled={isSubmitting}
				on:click={saved ? handlePrevious : handleGoBack}>{saved ? 'Edit' : 'Cancel'}</Button
			>
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
