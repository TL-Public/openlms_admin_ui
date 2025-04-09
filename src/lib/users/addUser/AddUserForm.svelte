<script>
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import DropDown from '$lib/components/DropDown.svelte';
	import InputField from '$lib/components/InputField.svelte';
	import Button from '$lib/components/Button.svelte';
	import TextDescriptionField from '$lib/components/TextDescriptionField.svelte';
	import CheckBox from '$lib/components/CheckBox.svelte';
	import { createEventDispatcher } from 'svelte';
	import ReviewForm from '$lib/components/ReviewForm.svelte';
	import Spinner from '$lib/components/Spinner.svelte';
	import SearchableComboBox from '$lib/components/SearchableComboBox.svelte';
	import { rolesList, roleNames } from '$lib/data.js';
	import { message } from '/src/routes/users/userStore.js';
	import SubmissionErrorMessage from '$lib/components/SubmissionErrorMessage.svelte';
	import ReviewUserForm from '$lib/users/UserDetailsPreview.svelte';
	import { onMount } from 'svelte';
	import { usersWithStateId, usersWithRsetiId } from '$lib/data.js';
	import MultiStepProgressComponent from '$lib/components/MultiStepProgressComponent.svelte';

	export let stateOptionList = [];
	export let rsetiOptionList = [];
	export let method = 'POST';
	let rsetiOptionListCopy = [...rsetiOptionList];
	let roleOptions = rolesList;

	let saved = false;
	let displayImage = null;
	let validationError = '';
	let retryLoading = { username: false, email: false };
	let isSubmitting = false;

	let showStateList = false;
	let showRsetiList = false;

	let sizeErrorMessage = '';
	const maxFileSizeInIntegers = 1;
	const maxFileSize = 1 * 1024 * 1024;

	const steps = [
		{ number: 1, text: 'Details' },
		{ number: 2, text: 'Review' }
	];
	let currentStep = 1;

	let usernameError = '';
	let emailError = '';
	let usernameSuccess = '';
	let emailSuccess = '';
	let formErrors = {
		stateId: false,
		rsetiId: false
	};
	let creationError = false;
	let errorMessage = '';
	let imageUploadInputRef;

	export let formObject = {
		username: '',
		name: '',
		email: '',
		designation: '',
		roleId: '',
		userRoleName: '',
		rsetiId: '',
		rsetiName: '',
		stateId: '',
		stateName: '',
		contactNumber: '',

		currentAddr: '',
		permanentAddr: '',
		currentAddressSameAsPermanent: false,
		photoUrl: null
	};

	onMount(() => {
		if (method === 'PUT') {
			if (typeof formObject?.photoUrl == 'string' && formObject?.photoUrl != 'null') {
				displayImage = formObject?.photoUrl;
				formObject = formObject;
			}
			if (formObject?.photoUrl == 'null') {
				formObject.photoUrl = null;
			}

			formObject.userRoleName = roleOptions.find((item) => item.roleId === formObject.roleId)?.name;
			formObject.stateName = stateOptionList.find((item) => item.id === formObject.stateId)?.name;
			formObject.rsetiName = rsetiOptionList.find((item) => item.id === formObject.rsetiId)?.name;
		}
	});

	$: {
		if (formObject.currentAddressSameAsPermanent) {
			formObject.currentAddr = formObject.permanentAddr;
		}
	}

	$: if (formObject.roleId) {
		showStateList = usersWithStateId.includes(formObject.roleId) ? true : false;
	}

	$: if (formObject.stateId) {
		rsetiOptionList = rsetiOptionListCopy.filter((item) => item.stateId == formObject.stateId);
		showRsetiList = usersWithRsetiId.includes(formObject.roleId) ? true : false;
	}

	export function sizeCheckForFiles(file) {
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
		const sizeCheck = sizeCheckForFiles(imageFile);
		if (sizeCheck) return;
		formObject.image = imageFile;
		displayImage = URL.createObjectURL(imageFile);
	}

	function handleGoBack() {
		if (saved) {
			saved = !saved;
		} else {
			window.history.back();
		}
	}

	// ------------------------- Validation Functions -------------------------
	function isValidEmail(email) {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	}

	function validateStateId() {
		// Check if the user role requires a stateId
		const isStateRequired = usersWithStateId.includes(formObject.roleId);
		return !isStateRequired || Boolean(formObject.stateId);
	}

	function validateRsetiId() {
		// Check if the user role requires a stateId
		const isRsetiRequired = usersWithRsetiId.includes(formObject.roleId);
		return !isRsetiRequired || Boolean(formObject.rsetiId);
	}

	async function checkAvailability(type, value) {
		// Avoid API call if the value is an empty string
		if (method === 'PUT') return;
		if (!value.trim()) {
			if (type === 'username') {
				usernameError = 'Username cannot be empty';
				usernameSuccess = '';
			} else {
				emailError = 'Email cannot be empty';
				emailSuccess = '';
			}
			retryLoading[type] = false;
			return;
		}

		// Validate email format if the type is email
		if (type === 'email' && !isValidEmail(value)) {
			emailError = 'Invalid email format';
			emailSuccess = '';
			retryLoading[type] = false;
			return;
		}

		try {
			const url =
				type === 'username'
					? `/apis/users/validations/username?username=${value}`
					: `/apis/users/validations/email?email=${value}`;

			const response = await fetch(url);
			let data = await response.json();
			if (data?.status === 200) {
				// Username/email is unavailable (trainee exists)
				if (type === 'username') {
					usernameError = `Username is already taken`;
					usernameSuccess = '';
				} else {
					emailError = `Email is already taken`;
					emailSuccess = '';
				}
			} else if (data.status === 404) {
				// Username/email is available (no trainee exists)
				if (type === 'username') {
					usernameError = '';
					usernameSuccess = 'Username is available';
				} else {
					emailError = '';
					emailSuccess = 'Email is available';
				}
			} else {
				// Handle unexpected non-200 responses
				throw new Error(`Unexpected response status: ${response.status}`);
			}
		} catch (error) {
			// Handle network or server errors
			if (type === 'username') {
				usernameError = 'An error occurred while checking username availability';
				usernameSuccess = '';
			} else {
				emailError = 'An error occurred while checking email availability';
				emailSuccess = '';
			}
		} finally {
			// Stop loader for the current field
			retryLoading[type] = false;
		}
	}

	const retryValidation = async (field) => {
		retryLoading[field] = true; // Start loader
		await checkAvailability(field, formObject[field]);
	};

	function handleStateSelection(event) {
		formObject.stateName = event.detail.selectedItemName;
		formObject.stateId = event.detail.selectedItemId;

		//rseti is dependent on state
		handleRsetiClearFilter();
	}

	function handleStateClearFilter() {
		formObject.stateName = '';
		formObject.stateId = '';

		//rseti is dependent on state
		handleRsetiClearFilter();
	}

	function handleRsetiSelection(event) {
		formObject.rsetiName = event.detail.selectedItemName;
		formObject.rsetiId = event.detail.selectedItemId;
	}

	function handleRsetiClearFilter() {
		formObject.rsetiName = '';
		formObject.rsetiId = '';
	}

	// drop down controller
	function handleDropDown(e) {
		const dropDownDetails = e.detail;
		if (dropDownDetails?.type === 'Role') {
			const { roleId } = dropDownDetails.selectedOption;
			formObject.roleId = roleId;
			formObject.userRoleName = dropDownDetails.selectedItemName;
		}
	}

	//-------------------------------------Enhance function------------------------------
	async function userFormEnhancement({ formElement, formData, action, cancel, submitter }) {
		let { search } = action;
		errorMessage = '';

		await checkAvailability('email', formObject.email);
		// await checkAvailability('username', formObject.username);

		if (usernameError || emailError) {
			saved = false;
			cancel();
			return;
		}

		formErrors.rsetiId = !validateRsetiId();
		formErrors.stateId = !validateStateId();

		if (Object.values(formErrors).includes(true)) {
			saved = false;
			cancel();
			return;
		}

		formData.set('method', method);

		if (search == '?/review') {
			formObject.currentAddr = formObject.currentAddressSameAsPermanent
				? formObject.permanentAddr
				: formObject.currentAddr;
			saved = !saved;
			formObject.username = formObject.email;
			isSubmitting = false;
			currentStep = 2;
		}

		if (search == '?/final') {
			isSubmitting = true;
		}

		Object.keys(formObject)?.forEach((key) => {
			formData.set(key, formObject[key]);
		});

		return async ({ result, update }) => {
			// `result` is an `ActionResult` object
			// `update` is a function which triggers the default logic that would be triggered if this callback wasn't set
			await result;

			if (search === '?/final') {
				if (!Object.keys(result?.data)?.includes('error')) {
					if (method === 'POST') {
						const dataObject = JSON.stringify({
							uuid: result?.data?.data?.traineeProfileDto?.uuid
						});
						message.set(
							`Successfully added ${formObject?.userRoleName} user - "${formObject?.name}".`
						);

						goto(`/users`, {
							invalidateAll: true
						});
					}
					if (method === 'PUT') {
						const dataObject = JSON.stringify({
							uuid: result?.data?.data?.traineeProfileDto?.uuid
						});
						message.set(
							`Successfully edited ${formObject?.userRoleName} user - "${formObject?.name}".`
						);
						goto(`/users`, {
							invalidateAll: true
						});
					}
				} else {
					formObject = formObject;
					creationError = true;
					isSubmitting = false;

					if (result?.data?.error) {
						if (result?.data?.status === 409) {
							errorMessage = result?.data?.error + ` User already exists.`;
						} else {
							errorMessage = result?.data?.error;
						}
					}
				}
			}
		};
	}

	function handlePrevious() {
		saved = false;
		formObject = formObject;
		currentStep = 1;
	}
</script>

<div class=" text-primary">
	{#if creationError}
		<div class="mb-2">
			<SubmissionErrorMessage {errorMessage} />
		</div>
	{/if}
	<div class="w-full max-w-80 mx-auto">
		<MultiStepProgressComponent {steps} {currentStep} />
	</div>
	<form
		method="POST"
		action="/users/add"
		use:enhance={userFormEnhancement}
		enctype="multipart/form-data"
		class="form"
	>
		<!-- To be used while doing review add course -->
		<div>
			{#if !saved}
				<h2 class="mb-2 font-semibold heading-L">
					{method === 'POST' ? '1. Add User' : '1. Edit User'}
				</h2>
				<!-- First Row -->
				<hr class="horizontal-line mb-8" />
				<div class="grid grid-cols-1 sm:grid-cols-2 sm:gap-x-20 gap-y-3 mb-3 sm:mb-6">
					<div class="flex flex-col gap-6 order-2 sm:order-none">
						<div class="w-full">
							<InputField
								label={'Name'}
								placeholder={'Name'}
								bind:value={formObject.name}
								type="text"
								name="username"
								required
							/>
						</div>

						<div>
							<InputField
								bind:value={formObject.email}
								name="email"
								label="Email"
								placeholder="Enter email"
								type="email"
								disabled={method === 'PUT'}
								required
								on:blur={() => checkAvailability('email', formObject.email)}
							/>
							{#if emailError}
								<p class="text-red-500 text-xs mt-1 flex items-center space-x-2 min-h-5">
									<span>{emailError}</span>
									{#if retryLoading.email}
										<Spinner size={16} color="#007bff" />
									{:else}
										<button
											type="button"
											class="text-blue-500 underline"
											on:click={() => retryValidation('email')}
										>
											Retry
										</button>
									{/if}
								</p>
							{:else if emailSuccess}
								<p class="text-green-500 text-xs mt-1 min-h-5">{emailSuccess}</p>
							{/if}
						</div>
						<div class="w-full">
							<InputField
								name="contactNumber"
								label={'Phone Number'}
								placeholder={'Enter user phone number'}
								bind:value={formObject.contactNumber}
								type="number"
							/>
						</div>
					</div>
					<div class="w-full flex flex-col items-center justify-center gap-4">
						<img
							class="w-32 rounded-lg border object-cover"
							src={displayImage
								? displayImage.startsWith('blob:')
									? displayImage // Blob URL doesn't need a timestamp
									: `${displayImage}?t=${Date.now()}` // Append timestamp for external URLs
								: '/placeholderUserImage.png'}
							alt="uploaded user profile"
						/>

						<Button
							type="button"
							customClass={'!w-fit text-wrap'}
							on:click={handelUploadImage}
							btnType="secondary"
							><span class="material-icons-outlined text-center">upload_file</span> Profile Photo</Button
						>

						<input
							type="file"
							name={'image'}
							bind:this={imageUploadInputRef}
							on:change={handleImageChange}
							class="hidden"
							accept=".jpg, .jpeg, .png"
						/>
						{#if sizeErrorMessage}
							<p class=" text-xs text-center text-red-500">{sizeErrorMessage}</p>
						{/if}
					</div>
				</div>
				<div class="grid grid-cols-1 sm:grid-cols-2 sm:gap-x-20 gap-y-3 sm:gap-y-6">
					<div class="w-full">
						<DropDown
							title="Role"
							options={roleOptions}
							type={'Role'}
							on:handleDispatchFilterData={handleDropDown}
							bind:selectedItemName={formObject.userRoleName}
							bind:selectedItemId={formObject.roleId}
						/>
					</div>
					<div class="w-full">
						<InputField
							label={'Designation'}
							type="text"
							name="designation"
							placeholder={'Enter user desgination'}
							bind:value={formObject.designation}
						/>
					</div>

					<div class="sm:col-span-2 grid sm:grid-cols-2 sm:gap-x-20 gap-y-3 sm:gap-y-6">
						{#if showStateList}
							<div class="w-full">
								<SearchableComboBox
									options={stateOptionList}
									label={'Select state'}
									filterCategory={'stateListing'}
									placeholder={'Select state'}
									bind:selectedItemName={formObject.stateName}
									bind:selectedItemId={formObject.stateId}
									validationErrors={formErrors.stateId ? 'Please select state' : ''}
									on:handleDispatchComboBoxData={handleStateSelection}
									on:handleDispatchFilterData={handleStateClearFilter}
								/>
							</div>
						{/if}
						{#if showRsetiList}
							<div class="w-full">
								<SearchableComboBox
									options={rsetiOptionList}
									label={'Select RSETI'}
									filterCategory={'rsetiListing'}
									placeholder={'Select RSETI'}
									bind:selectedItemName={formObject.rsetiName}
									bind:selectedItemId={formObject.rsetiId}
									validationErrors={formErrors.rsetiId ? 'Please select RSETI' : ''}
									on:handleDispatchComboBoxData={handleRsetiSelection}
									on:handleDispatchFilterData={handleRsetiClearFilter}
								/>
							</div>
						{/if}
					</div>
				</div>
				<div>
					<div class="mb-4 lg:mb-4 w-full">
						<TextDescriptionField
							label={'Permanent address'}
							placeholder={'Enter permanent address'}
							name={'permanentAddr'}
							bind:value={formObject.permanentAddr}
						/>
					</div>
					<div class="mb-4">
						<CheckBox
							bind:checked={formObject.currentAddressSameAsPermanent}
							name="currentAddressSameAsPermanent"
							checkBoxDiscription="Current address same as permanent address"
						/>
					</div>
					{#if !formObject.currentAddressSameAsPermanent}
						<div class="mb-4 lg:mb-4 w-full">
							<TextDescriptionField
								label={'Present Address'}
								placeholder={'Enter present address'}
								name={'currentAddr'}
								bind:value={formObject.currentAddr}
							/>
						</div>
					{/if}
				</div>
			{:else}
				<!-- <ReviewUserForm {saved} userData={form?.formData} /> -->
				<ReviewUserForm
					userData={formObject}
					rsetiName={formObject.rsetiName}
					stateName={formObject.stateName}
					imageUrl={displayImage
						? displayImage.startsWith('blob:')
							? displayImage // Blob URL doesn't need a timestamp
							: `${displayImage}?t=${Date.now()}` // Append timestamp for external URLs
						: '/placeholderUserImage.png'}
					title={'2. User details'}
				></ReviewUserForm>
			{/if}

			<div class="flex justify-end gap-4 flex-wrap mt-8">
				{#if saved}
					<Button
						type="button"
						btnType="secondary"
						customClass={'inline-block w-full bp-420px:w-fit flex justify-center'}
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
					type="submit"
					disabled={isSubmitting}
					customClass={'inline-block w-full bp-420px:w-fit flex justify-center'}
					formaction={saved ? '?/final' : '?/review'}>{saved ? 'Submit' : 'Save & Next'}</Button
				>
			</div>
		</div>
	</form>
</div>
