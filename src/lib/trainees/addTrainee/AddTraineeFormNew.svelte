<script>
	import { enhance } from '$app/forms';
	import InputField from '$lib/components/InputField.svelte';
	import DropDown from '$lib/components/DropDown.svelte';
	import TextDescriptionField from '$lib/components/TextDescriptionField.svelte';
	import ReviewForm from '$lib/components/ReviewForm.svelte';
	import SubmissionErrorMessage from '$lib/components/SubmissionErrorMessage.svelte';
	import { onMount, tick } from 'svelte';
	import Button from '$lib/components/Button.svelte';
	import { message } from '/src/routes/trainees/traineeStore.js';
	import { goto } from '$app/navigation';
	import Spinner from '$lib/components/Spinner.svelte';
	import MultiStepProgressComponent from '$lib/components/MultiStepProgressComponent.svelte';

	export let route;
	export let formObject = {
		image: null,
		// Personal Information
		candidateName: '',
		fatherNameOrHusbandName: '',
		maritalStatus: '',
		sex: '',
		dateOfBirth: '',
		age: '',
		religion: '',
		caste: '',
		education: '',
		personWithDisability: false,
		aadharCardNo: '',

		// Contact Information
		mobileNumber1: '',

		// Residential Information
		candidateAddress: '',
		district: '',
		pincode: ''
	};

	const maxFileSizeInIntegers = 1;
	const maxFileSize = 1 * 1024 * 1024;
	const today = new Date().toISOString().split('T')[0];
	let saved = false;
	let validationErrors = {};
	let creationError = false;
	let method = 'post';
	let displayImage = null;
	let imageUploadInputRef;
	let sizeErrorMessage = '';
	let errorMessage = '';
	let isSubmitting = false;
	let usernameError = '';
	let emailError = '';
	let usernameSuccess = '';
	let emailSuccess = '';
	let retryLoading = { username: false, email: false }; // Loader state for retry buttons
	let steps = [
		{ number: 1, text: 'Trainee Details' },
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

	// ------------- Functions to check availability of username and email ---------------
	async function checkAvailability(type, value) {
		// Username field gives the value for both username and enrollment ID
		if (method === 'PUT') return;
		// Avoid API call if the value is an empty string
		if (!value.trim()) {
			if (type === 'username') {
				usernameError = 'Enrollment ID cannot be empty';
				usernameSuccess = '';
			} else {
				emailError = 'Email cannot be empty';
				emailSuccess = '';
			}
			retryLoading[type] = false;
			return;
		}

		// Restrict special characters in username
		if (type === 'username' && /[^a-zA-Z0-9]/.test(value)) {
			usernameError = 'Enrollment ID can only contain letters and numbers';
			usernameSuccess = '';
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
			// Construct API endpoint dynamically
			const url =
				type === 'username'
					? `/apis/trainees/validations/username?username=${value}`
					: `/apis/trainees/validations/email?email=${value}`;

			const response = await fetch(url);
			let data = await response.json();
			if (data?.status === 200) {
				// Username/email is unavailable (trainee exists)
				if (type === 'username') {
					usernameError = `Enrollment ID is already taken`;
					usernameSuccess = '';
				} else {
					emailError = `Email is already taken`;
					emailSuccess = '';
				}
			} else if (data.status === 404) {
				// Username/email is available (no trainee exists)
				if (type === 'username') {
					usernameError = '';
					usernameSuccess = 'Enrollment ID is available';
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
				usernameError = 'An error occurred while checking enrollment ID availability';
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
	// ------------------------------------Enhance Function ------------------------------

	async function handleEnhance({ formElement, formData, action, cancel, submitter }) {
		let { search } = action;
		validationErrors = {};
		errorMessage = '';

		// If there are validation errors, cancel the submission and handle errors
		await checkAvailability('email', formObject.email);
		await checkAvailability('username', formObject.username);
		if (usernameError || emailError) {
			saved = false;
			cancel();
			return;
		}

		// This is done becuase enhance function is being triggered when the pdf is opened in another window
		if (search == '?/review') {
			saved = !saved;
			currentStep = 2;
		}
		if (search == '?/final') {
			isSubmitting = true;
		}

		if (formObject?.dateOfBirth === null) {
			formObject.dateOfBirth = '';
		}

		Object.keys(formObject)?.forEach((key) => {
			formData.set(key, formObject[key]);
		});

		formData.set('method', method);

		return async ({ result, update }) => {
			await result;
			// `result` is an `ActionResult` object
			if (search == '?/final') {
			isSubmitting = true;
				if (!Object.keys(result?.data)?.includes('error')) {
					if (method === 'POST') {
						const dataObject = JSON.stringify({
							uuid: result?.data?.data?.traineeProfileDto?.uuid
						});
						// goto(`/trainees/${result?.data?.data?.traineeProfileDto?.uuid}/details`, {
						// 	invalidateAll: true
						// });
						goto(`/trainees`, {
							invalidateAll: true
						});
						message.set(`Successfully added trainee - "${formObject?.candidateName}".`);
					}
					if (method === 'PUT') {
						const dataObject = JSON.stringify({
							uuid: result?.data?.data?.traineeProfileDto?.uuid
						});
						// goto(`/trainees/${result?.data?.data?.traineeProfileDto?.uuid}/details`, {
						// 	invalidateAll: true
						// });
						goto(`/trainees`, {
							invalidateAll: true
						});
						message.set(`Successfully edited trainee - "${formObject?.candidateName}".`);
					}
				} else {
					// repopulating the dropdown placeholder
					formObject = formObject;
					creationError = true;
					isSubmitting = false;
					if (result?.data?.error) {
						if (result?.data?.status === 409) {
							errorMessage = result?.data?.error + ` Trainee already exists.`;
						} else {
							errorMessage = result?.data?.error;
						}
					}
				}
			}
		};
	}

	// ------------------------------- Image Related Functions ----------------------------

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

	function sizeCheckForFiles(file) {
		if (file.size > maxFileSize) {
			sizeErrorMessage = `File size exceeds the ${maxFileSizeInIntegers} MB limit. The file is ${(file.size / 1024 / 1024).toFixed(2)} MB.`;
			return true;
		}
	}

	// --------------------- Functions Related to Radio Button -------------------------
	function handleRadioChange(field) {
		return (event) => {
			formObject[field] = event.target.value === 'true';
		};
	}

	// ------------------------ General Functions --------------------------

	// Function to handle date changes
	function handleDateChange(event, field) {
		formObject[field] = event.target.value; // Update the specific field with the value
	}

	function formatDate(dateString) {
		if (!dateString) return '-';
		const date = new Date(dateString);
		return date.toLocaleDateString('en-UK', { year: 'numeric', month: 'long', day: 'numeric' });
	}

	function formatFieldName(field) {
		// Special case for 'username'
		if (field === 'username') {
			return 'enrollment ID';
		}

		// Acronyms mapping
		const acronyms = {
			secc: 'SECC',
			sgsy: 'SGSY',
			shg: 'SHG',
			mnerga: 'MNERGA'
		};

		// Replace acronyms with their uppercase equivalents
		let formatted = field.replace(
			new RegExp(Object.keys(acronyms).join('|'), 'gi'),
			(match) => acronyms[match.toLowerCase()]
		);

		// Add a space after acronyms if they are followed by a word
		formatted = formatted.replace(/(SECC|SGSY|SHG|MNERGA)([A-Z][a-z]+)/g, '$1 $2');

		// Remove the last numeral if the field ends with a number
		formatted = formatted.replace(/\d+$/, '');

		// Capitalize the first letter of the string and add spaces before uppercase letters
		formatted = formatted
			.replace(/([a-z])([A-Z])/g, '$1 $2') // Insert spaces between lowercase and uppercase letters
			.replace(/^[a-z]/, (match) => match.toUpperCase()); // Capitalize the first letter

		return formatted;
	}

	// Helper function to validate email format
	function isValidEmail(email) {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	}

	// Dynamic age calculation
	function calculateAge() {
		if (formObject.dateOfBirth) {
			const birthDate = new Date(formObject.dateOfBirth);
			const today = new Date();
			let age = today.getFullYear() - birthDate.getFullYear();
			const monthDiff = today.getMonth() - birthDate.getMonth();
			if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
				age--;
			}
			formObject.age = age;
		}
	}

	$: if (formObject.dateOfBirth) {
		calculateAge();
	}

	function handleDropDown(event) {
		// Your dropdown logic here
	}

	function handleGoBack() {
		window.history.back();
	}

	function handlePrevious() {
		saved = false;
		currentStep = 1;
		formObject = formObject;
	}
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
		action="/trainees"
		enctype="multipart/form-data"
		use:enhance={handleEnhance}
		class="form"
	>
		{#if !saved}
			<div>
				<h2 class="heading-L">1.{method === 'POST' ? 'Add' : 'Edit'} Trainee Details</h2>
				<hr class="mt-2 mb-8 horizontal-line" />
				<div class="grid grid-cols-1 sm:grid-cols-2 sm:gap-x-20 gap-y-3">
					<div>
						<InputField
							bind:value={formObject.username}
							name="enrollmentId"
							label="Enrollment ID"
							placeholder="Enter enrollment ID"
							type="text"
							required
							disabled={method === 'PUT'}
							on:blur={() => checkAvailability('username', formObject.username)}
						/>
						{#if usernameError}
							<p class="text-red-500 text-xs mt-1 flex items-center space-x-2 min-h-5">
								{usernameError}
								{#if retryLoading.username}
									<Spinner size={16} color="#007bff" /> <!-- Loader -->
								{:else}
									<Button
										type="button"
										class="text-blue-500 underline ml-2"
										on:click={() => retryValidation('username')}
									>
										Retry
									</Button>
								{/if}
							</p>
						{:else if usernameSuccess}
							<p class="text-green-500 text-xs mt-1 min-h-5">{usernameSuccess}</p>
						{/if}
					</div>
					<!-- Email Input -->
					<div>
						<InputField
							bind:value={formObject.email}
							name="email"
							label="Email"
							placeholder="Enter email"
							type="email"
							required
							disabled={method === 'PUT'}
							on:blur={() => checkAvailability('email', formObject.email)}
						/>
						{#if emailError}
							<p class="text-red-500 text-xs mt-1 flex items-center space-x-2 min-h-5">
								<span>{emailError}</span>
								{#if retryLoading.email}
									<Spinner size={16} color="#007bff" />
								{:else}
									<Button
										type="button"
										class="text-blue-500 underline"
										on:click={() => retryValidation('email')}
									>
										Retry
									</Button>
								{/if}
							</p>
						{:else if emailSuccess}
							<p class="text-green-500 text-xs mt-1 min-h-5">{emailSuccess}</p>
						{/if}
					</div>
					<InputField
						label="Mobile Number "
						type="number"
						placeholder="Enter Mobile Number "
						bind:value={formObject.mobileNumber1}
						name="mobileNumber"
					/>
				</div>

				<hr class="my-8 horizontal-line" />

				<!-- Personal Information -->
				<h3 class="heading-L mb-4">Personal Information</h3>
				<div class="grid grid-cols-1 sm:grid-cols-2 sm:gap-x-20 gap-y-3">
					<InputField
						label="Candidate Name"
						placeholder="Enter Candidate Name"
						bind:value={formObject.candidateName}
						name="candidateName"
						required
					/>
					<InputField
						label="Father's/Husband's Name"
						placeholder="Enter Father's/Husband's Name"
						bind:value={formObject.fatherNameOrHusbandName}
						name="fatherNameOrHusbandName"
					/>
					<DropDown
						on:handleDispatchFilterData={handleDropDown}
						bind:selectedItemName={formObject.maritalStatus}
						options={[
							{ name: 'Single' },
							{ name: 'Married' },
							{ name: 'Widowed' },
							{ name: 'Divorced' }
						]}
						type={'maritalStatusDropdown'}
						title={'Marital Status'}
						placeholder="Select Marital Status"
					/>
					<DropDown
						on:handleDispatchFilterData={handleDropDown}
						bind:selectedItemName={formObject.sex}
						options={[
							{ name: 'Male' },
							{ name: 'Female' },
							{ name: 'Transgender' },
							{ name: 'Other' }
						]}
						type={'sexDropdown'}
						title={'Gender'}
						placeholder="Select Gender"
					/>
					<InputField
						label="Date of Birth"
						type="date"
						max={today}
						bind:value={formObject.dateOfBirth}
						name="dateOfBirth"
						on:change={(event) => handleDateChange(event, 'dateOfBirth')}
					/>
					<InputField
						label="Age"
						type="number"
						placeholder="Enter Age"
						bind:value={formObject.age}
						name="age"
						readonly
					/>
					<InputField
						label="Religion"
						placeholder="Enter Religion"
						bind:value={formObject.religion}
						name="religion"
					/>
					<InputField
						label="Caste"
						placeholder="Enter Caste"
						bind:value={formObject.caste}
						name="caste"
					/>
					<InputField
						label="Education"
						placeholder="Enter Education"
						bind:value={formObject.education}
						name="education"
					/>
					<InputField
						label="Aadhar Card No"
						placeholder="Enter Aadhar Card No"
						bind:value={formObject.aadharCardNo}
						name="aadharCardNo"
					/>

					<!-- Person with Disability -->
					<div>
						<label class="block text-xs sm:text-sm font-medium text-gray-700 mb-1"
							>Person with Disability</label
						>
						<div class="flex gap-4">
							<label class="inline-flex items-center">
								<input
									type="radio"
									class="form-radio"
									name="personWithDisability"
									value={true}
									bind:group={formObject.personWithDisability}
									on:change={handleRadioChange('personWithDisability')}
								/>
								<span class="ml-2 text-xs sm:text-sm">Yes</span>
							</label>
							<label class="inline-flex items-center">
								<input
									type="radio"
									class="form-radio"
									name="personWithDisability"
									value={false}
									bind:group={formObject.personWithDisability}
									on:change={handleRadioChange('personWithDisability')}
								/>
								<span class="ml-2 text-xs sm:text-sm">No</span>
							</label>
						</div>
					</div>
				</div>

				<!-- Residential Information -->
				<hr class="my-8 horizontal-line" />
				<h3 class="heading-L mb-4">Residential Information</h3>
				<div class="grid grid-cols-1 sm:grid-cols-2 sm:gap-x-20 gap-y-3">
					<div class="col-span-1 sm:col-span-2">
						<TextDescriptionField
							label={'Candidate Address'}
							placeholder={'Enter Candidate Address'}
							name={'candidateAddress'}
							bind:value={formObject.candidateAddress}
						/>
					</div>
					<InputField
						label="District"
						placeholder="Enter District"
						bind:value={formObject.district}
						name="district"
					/>
					<InputField
						label="Pincode"
						type="number"
						placeholder="Enter Pincode"
						bind:value={formObject.pincode}
						name="pincode"
					/>
				</div>
			</div>
		{:else}
			<div class="mb-2 lg:mb-4 w-full">
				<ReviewForm>
					<h2 class="heading-L mb-4">Trainee Details</h2>

					<div class="">
						<!-- Contact Information -->
						<div class="bg-white rounded-lg shadow-sm p-3 md:p-6 border border-gray-200 mb-6">
							<div class="space-y-3">
								{#each ['username', 'email', 'mobileNumber1'] as field}
									<div class="grid grid-cols-2 gap-2">
										<div class="flex justify-between">
											<span class="w-full label break-words">{formatFieldName(field)}</span>
											<span>:</span>
										</div>

										<span class="w-full text-sm break-words">
											{formObject[field] ? formObject[field] : '-'}</span
										>
									</div>
								{/each}
							</div>
						</div>

						<!-- Personal Information -->
						<div class="bg-white rounded-lg shadow-sm p-3 md:p-6 border border-gray-200 mb-6">
							<h3 class="heading-L">Personal Information</h3>
							<hr class="mt-2 mb-4 horizontal-line" />

							<div class="space-y-3">
								{#each ['candidateName', 'fatherNameOrHusbandName', 'dateOfBirth', 'age', 'sex', 'maritalStatus', 'religion', 'caste', 'education', 'familyMember', 'personWithDisability', 'aadharCardNo'] as field}
									<div class="grid grid-cols-2 gap-2">
										<div class="flex justify-between">
											<span class="w-full label break-words">{formatFieldName(field)}</span>
											<span>:</span>
										</div>
										<span class="w-full text-sm break-words">
											{#if field === 'dateOfBirth'}
												{formatDate(formObject[field])}
											{:else if field === 'personWithDisability' || field === 'secc'}
												{formObject[field] ? 'Yes' : 'No'}
											{:else}
												{formObject[field] ? formObject[field] : '-'}
											{/if}
										</span>
									</div>
								{/each}
							</div>
						</div>

						<!-- Residential Information -->
						<div class="bg-white rounded-lg shadow-sm p-3 md:p-6 border border-gray-200 mb-6">
							<h3 class="heading-L">Residential Information</h3>
							<hr class="mt-2 mb-4 horizontal-line" />

							<div class="space-y-3">
								{#each ['candidateAddress', 'district', 'pincode'] as field}
									<div class="grid grid-cols-2 gap-2">
										<div class="flex justify-between">
											<span class="w-full label break-words">{formatFieldName(field)}</span>
											<span>:</span>
										</div>
										<span class="w-full text-sm break-words">
											{#if field === 'residential'}
												{formObject[field] ? 'Yes' : 'No'}
											{:else}
												{formObject[field] ? formObject[field] : '-'}
											{/if}
										</span>
									</div>
								{/each}
							</div>
						</div>
					</div>
				</ReviewForm>
			</div>
		{/if}

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
