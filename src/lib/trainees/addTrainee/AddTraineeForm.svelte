<script>
	import { enhance } from '$app/forms';
	import InputField from '$lib/components/InputField.svelte';
	import DropDown from '$lib/components/DropDown.svelte';
	import TextDescriptionField from '$lib/components/TextDescriptionField.svelte';
	import ReviewForm from '$lib/components/ReviewForm.svelte';
	import SubmissionErrorMessage from '$lib/components/SubmissionErrorMessage.svelte';
	import { onDestroy, onMount, tick } from 'svelte';
	import Button from '$lib/components/Button.svelte';
	import { message } from '/src/routes/trainees/traineeStore.js';
	import { goto } from '$app/navigation';
	import {showLoadingSpinner} from '/src/routes/store.js'

	export let route;
	export let formObject = {
	image:null,
	  // Enrollment Details
	  enrollId: '',
	  enrolledOn: '',
	  status: '',
	  batchNo: '',
  
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
	  familyMember: '',
	  personWithDisability: false,
	  povertyLine: '',
	  povertyLineNumberOrRationCardNumber: '',
	  secc: '',
	  seccNo: '',
	  panNumber: '',
	  aadharCardNo: '',
  
	  // Contact Information
	  landlineStd: '',
	  landlineNumber: '',
	  mobileNumber1: '',
	  mobileNumber2: '',
	  email: '',
  
	  // Residential Information
	  residential: '',
	  candidateAddress: '',
	  village: '',
	  hobli: '',
	  district: '',
	  taluk: '',
	  pincode: '',
  
	  // Employment Details
	  sgsyCandidate: true,
	  candidatePresentOccupation: '',
	  familyOccupation: '',
	  nativityArea: '',
	  relevantExperience: '',
	  nameOfShg: '',
	  mnergaCardNo: '',
  
	  // Sponsorship Details
	  candidateSponsoredByBank: true,
	  sponsoredBankName: '',
	  sponsoredBankBranch: '',
	  sponsoredBankCity: '',
	  sponsorName: '',
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


	// ------------------------------------Enhance Function ------------------------------
  
	 async function handleEnhance({ formElement, formData, action, cancel, submitter }) {

		let { search } = action;
		validationErrors = {};
		errorMessage=''

		// This is done becuase enhance function is being triggered when the pdf is opened in another window
		if (search == '?/review') {
			saved = !saved;
			isSubmitting = false;
		}
		if (search == '?/final') {
			isSubmitting = true;
		}

		if(formObject?.dateOfBirth===null){
			formObject.dateOfBirth=''
		}
		if(formObject?.enrolledOn === null){
			formObject.enrolledOn=''

		}
		
		Object.keys(formObject)?.forEach((key) => {
			formData.set(key, formObject[key]);
		});

		formData.set('method', method);


		return async ({ result, update }) => {
			await result;
			// `result` is an `ActionResult` object
			if (search == '?/final') {
				if (!Object.keys(result?.data)?.includes('error')) {
					if (method === 'POST') {
						const dataObject = JSON.stringify({ uuid: result?.data?.data?.uuid });
						goto(`/trainees/${result?.data?.data?.uuid}/details`, {
							invalidateAll: true
						});
						message.set(`Successfully added trainee - "${formObject?.candidateName}".`);
					}
					if (method === 'PUT') {
						const dataObject = JSON.stringify({ uuid: result?.data?.data?.uuid });
						goto(`/trainees/${result?.data?.data?.uuid}/details`, {
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
    }
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
        match => acronyms[match.toLowerCase()]
    );

    // Add a space after acronyms if they are followed by a word
    formatted = formatted.replace(/(SECC|SGSY|SHG|MNERGA)([A-Z][a-z]+)/g, '$1 $2');

    // Add a space before the last numeral if the field ends with a number
    formatted = formatted.replace(/(\d+)$/, ' $1');

    // Capitalize the first letter of the string and add spaces before uppercase letters
    formatted = formatted
        .replace(/([a-z])([A-Z])/g, '$1 $2') // Insert spaces between lowercase and uppercase letters
        .replace(/^[a-z]/, match => match.toUpperCase()); // Capitalize the first letter

    return formatted;
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
  
	<form method="post" action="/trainees" enctype="multipart/form-data" use:enhance={handleEnhance} class="form">
		{#if !saved}
		  <div>
			<h2 class="heading-L mb-4">1.{method === 'POST' ? 'Add' : 'Edit'} Trainee Details</h2>
			<hr class="my-4 horizontal-line" />
			
			<!-- Image Upload -->
			<div class="w-full flex flex-col items-center justify-center gap-4 mb-8">
			  <img
				class="w-32 h-32 rounded-lg border object-cover"
				src={displayImage ? displayImage : '/placeholderUserImage.png'}
				alt="uploaded user profile"
			  />
			  <Button
								type="button"
								on:click={handelUploadImage}
								btnType="secondary"
								customClass={'!w-fit text-wrap'}
								><span class="material-icons-outlined text-center">upload_file</span> Upload profile image</Button
							>
			  <input type="file" name="image" bind:this={imageUploadInputRef} on:change={handleImageChange} class="hidden" />
			</div>
	  
			<!-- Enrollment Details -->
			<hr class="my-8 horizontal-line" />
			<h3 class="text-base font-semibold text-primary mb-4">Enrollment Details</h3>
			<div class="grid grid-cols-1 sm:grid-cols-2 sm:gap-x-20 gap-y-3 mb-8">
			  <InputField label="Enroll ID" placeholder="Enter Enroll ID" bind:value={formObject.enrollId} name="enrollId" 
			  required
			  disabled={method === 'PUT' ? true : false}
			  />
			  <InputField label="Enrolled On" type="date" max={today} 
			  bind:value={formObject.enrolledOn} name="enrolledOn" on:change={(event) => handleDateChange(event, "enrolledOn")} />
			  <InputField label="Batch No" placeholder="Enter Batch No" bind:value={formObject.batchNo} name="batchNo" />
			</div>
			
	  
			<!-- Personal Information -->
			<hr class="my-8 horizontal-line" />
			<h3 class="text-base font-semibold text-primary mb-4">Personal Information</h3>
			<div class="grid grid-cols-1 sm:grid-cols-2 sm:gap-x-20 gap-y-3 mb-8">
			  <InputField label="Candidate Name" placeholder="Enter Candidate Name" bind:value={formObject.candidateName} name="candidateName" required />
			  <InputField label="Father's/Husband's Name" placeholder="Enter Father's/Husband's Name" bind:value={formObject.fatherNameOrHusbandName} name="fatherNameOrHusbandName" />
			  <DropDown
			  on:handleDispatchFilterData={handleDropDown}
			  bind:selectedItemName={formObject.maritalStatus}
			  options={[{name: 'Single'}, {name: 'Married'}, {name: 'Widowed'}, {name: 'Divorced'}]}
			  type={'maritalStatusDropdown'}
			  title={'Marital Status'}
			  placeholder="Select Marital Status"
			/>	  
			  <DropDown
			  on:handleDispatchFilterData={handleDropDown}
			  bind:selectedItemName={formObject.sex}
			  options={[{name: 'Male'}, {name: 'Female'}, {name: 'Transgender'}, {name: 'Other'}]}
			  type={'sexDropdown'}
			  title={'Gender'}
			  placeholder="Select Gender"
			/>	
			  <InputField label="Date of Birth" type="date" max={today} bind:value={formObject.dateOfBirth} name="dateOfBirth" on:change={(event) => handleDateChange(event, "dateOfBirth")} />
			  <InputField label="Age" type="number" placeholder="Enter Age" bind:value={formObject.age} name="age" readonly />
			  <InputField label="Religion" placeholder="Enter Religion" bind:value={formObject.religion} name="religion" />
			  <InputField label="Caste" placeholder="Enter Caste" bind:value={formObject.caste} name="caste" />
			  <InputField label="Education" placeholder="Enter Education" bind:value={formObject.education} name="education" />
			  <InputField label="Family Members" type="number" placeholder="Enter Family Members" bind:value={formObject.familyMember} name="familyMember" />
			  
			  <DropDown
			  on:handleDispatchFilterData={handleDropDown}
			  bind:selectedItemName={formObject.povertyLine}
			  options={[{id:1, name: 'APL'}, {id:2,name: 'BPL'}]}
			  type={'povertyLineDropdown'}
			  title={'Poverty Line'}
			  placeholder="Select APL/BPL"
			/>
  
			  <InputField label="Poverty Line Number/Ration Card Number" placeholder="Enter Number" bind:value={formObject.povertyLineNumberOrRationCardNumber} name="povertyLineNumberOrRationCardNumber" />
			  
			  <InputField label="PAN Number" placeholder="Enter PAN Number" bind:value={formObject.panNumber} name="panNumber" />
			  <InputField label="Aadhar Card No" placeholder="Enter Aadhar Card No" bind:value={formObject.aadharCardNo} name="aadharCardNo" />

			  			 
			<!-- SECC -->
			<InputField label="SECC" placeholder="Enter SECC" bind:value={formObject.secc} name="secc" />
			  
			  <!-- {#if formObject.secc === true} -->
			<InputField label="SECC No" placeholder="Enter SECC No" bind:value={formObject.seccNo} name="seccNo" />
			  <!-- {/if} -->

			   <!-- Person with Disability -->
			   <div>
				<label class="block text-sm font-medium text-gray-700 mb-1">Person with Disability</label>
				<div class="flex gap-4">
				  <label class="inline-flex items-center">
				<input type="radio" class="form-radio" name="personWithDisability" value={true} bind:group={formObject.personWithDisability} on:change={handleRadioChange('personWithDisability')}
					>
					<span class="ml-2">Yes</span>
				  </label>
				  <label class="inline-flex items-center">
					<input type="radio" class="form-radio" name="personWithDisability" value={false} bind:group={formObject.personWithDisability} on:change={handleRadioChange('personWithDisability')}>
					<span class="ml-2">No</span>
				  </label>
				</div>
			  </div>
			</div>
	  
			<!-- Contact Information -->
			<hr class="my-8 horizontal-line" />
			<h3 class="text-base font-semibold text-primary mb-4">Contact Information</h3>
			<div class="grid grid-cols-1 sm:grid-cols-2 sm:gap-x-20 gap-y-3 mb-8">
			  <InputField label="Landline STD" type="number" placeholder="Enter Landline STD" bind:value={formObject.landlineStd} name="landlineStd" />
			  <InputField label="Landline Number" type="number" placeholder="Enter Landline Number" bind:value={formObject.landlineNumber} name="landlineNumber" />
			  <InputField label="Mobile Number 1" type="number" placeholder="Enter Mobile Number 1" bind:value={formObject.mobileNumber1} name="mobileNumber1" />
			  <InputField label="Mobile Number 2" type="number" placeholder="Enter Mobile Number 2" bind:value={formObject.mobileNumber2} name="mobileNumber2" />
			  <InputField label="Email"  placeholder="Enter Email" bind:value={formObject.email} name="email" type="email" />
			</div>
	  
			<!-- Residential Information -->
			<hr class="my-8 horizontal-line" />
			<h3 class="text-base font-semibold text-primary mb-4">Residential Information</h3>
			<div class="grid grid-cols-1 sm:grid-cols-2 sm:gap-x-20 gap-y-3 mb-8">

			  <div class="col-span-1 sm:col-span-2">
				<TextDescriptionField
				label={'Candidate Address'}
				placeholder={'Enter Candidate Address'}
				name={'candidateAddress'}
				bind:value={formObject.candidateAddress}
			  />
			  </div>
			  <InputField label="Village" placeholder="Enter Village" bind:value={formObject.village} name="village" />
			  <InputField label="Hobli" placeholder="Enter Hobli" bind:value={formObject.hobli} name="hobli" />
			  <InputField label="District" placeholder="Enter District" bind:value={formObject.district} name="district" />
			  <InputField label="Taluk" placeholder="Enter Taluk" bind:value={formObject.taluk} name="taluk" />
			  <InputField label="Pincode" type="number" placeholder="Enter Pincode" bind:value={formObject.pincode} name="pincode" />
			</div>
	  
			<!-- Employment Details -->
			<hr class="my-8 horizontal-line" />
			<h3 class="text-base font-semibold text-primary mb-4">Employment Details</h3>
			<div class="grid grid-cols-1 sm:grid-cols-2 sm:gap-x-20 gap-y-3 mb-8">
			  <InputField label="Candidate Present Occupation" placeholder="Enter Occupation" bind:value={formObject.candidatePresentOccupation} name="candidatePresentOccupation" />
			  <InputField label="Family Occupation" placeholder="Enter Family Occupation" bind:value={formObject.familyOccupation} name="familyOccupation" />
			  <InputField label="Nativity Area" placeholder="Enter Nativity Area" bind:value={formObject.nativityArea} name="nativityArea" />
			  <InputField label="Relevant Experience" placeholder="Enter Experience" bind:value={formObject.relevantExperience} name="relevantExperience" />
			  <InputField label="Name of SHG" placeholder="Enter SHG Name" bind:value={formObject.nameOfShg} name="nameOfShg" />
			  <InputField label="MNERGA Card No" placeholder="Enter MNERGA Card No" bind:value={formObject.mnergaCardNo} name="mnergaCardNo" />
			  <div>
				<label class="block text-sm font-medium text-gray-700 mb-1">SGSY Candidate</label>
				<div class="flex gap-4">
				  <label class="inline-flex items-center">
					<input type="radio" class="form-radio" name="sgsyCandidate" value={true} bind:group={formObject.sgsyCandidate} on:change={handleRadioChange('sgsyCandidate')}>
					<span class="ml-2">Yes</span>
				  </label>
				  <label class="inline-flex items-center">
					<input type="radio" class="form-radio" name="sgsyCandidate" value={false} bind:group={formObject.sgsyCandidate} on:change={handleRadioChange('sgsyCandidate')}>
					<span class="ml-2">No</span>
				  </label>
				</div>
			  </div>
			</div>
	  
			<!-- Sponsorship Details -->
			<hr class="my-8 horizontal-line" />
			<h3 class="text-base font-semibold text-primary mb-4">Sponsorship Details</h3>
			<div class="grid grid-cols-1 sm:grid-cols-2 sm:gap-x-20 gap-y-3 mb-8">
			  <div>
				<label class="block text-sm font-medium text-gray-700 mb-1">Candidate Sponsored by Bank</label>
				<div class="flex gap-4">
				  <label class="inline-flex items-center">
					<input type="radio" class="form-radio" name="candidateSponsoredByBank" value={true} bind:group={formObject.candidateSponsoredByBank} on:change={handleRadioChange('candidateSponsoredByBank')}>
					<span class="ml-2">Yes</span>
				  </label>
				  <label class="inline-flex items-center">
					<input type="radio" class="form-radio" name="candidateSponsoredByBank" value={false} bind:group={formObject.candidateSponsoredByBank} on:change={handleRadioChange('candidateSponsoredByBank')}>
					<span class="ml-2">No</span>
				  </label>
				</div>
			  </div>
			  
			  {#if formObject.candidateSponsoredByBank === true}
				<InputField label="Sponsored Bank Name" placeholder="Enter Bank Name" bind:value={formObject.sponsoredBankName} name="sponsoredBankName" />
				<InputField label="Sponsored Bank Branch" placeholder="Enter Bank Branch" bind:value={formObject.sponsoredBankBranch} name="sponsoredBankBranch" />
				<InputField label="Sponsored Bank City" placeholder="Enter Bank City" bind:value={formObject.sponsoredBankCity} name="sponsoredBankCity" />
				<InputField label="Sponsor Name" placeholder="Enter Sponsor Name" bind:value={formObject.sponsorName} name="sponsorName" />
			  {/if}
			</div>
	  
		  </div>
		{:else}
		  <div class="mb-2 lg:mb-4 w-full">
			<ReviewForm>
					<h2 class="text-base font-semibold text-primary mb-4">Trainee Details</h2>
				  
					<div class="">
					  <div class="flex flex-col lg:flex-row gap-6 lg:gap-8">
						<!-- Left Column: Image, Course, and Enrollment Details -->
						<div class="lg:w-1/3">
						  <div class="bg-white rounded-lg shadow-sm p-6 border border-gray-200 lg:mb-6">
							<div class="flex justify-start mb-6">
							  <img
								class="w-32 h-32 rounded-lg border object-cover"
								src={displayImage ? displayImage : '/image-preview-icon.jpg'}
								alt="Trainee thumbnail"
							  />
							</div>
				  
							<!-- Enrollment Details -->
							<div>
							  <h3 class="text-base font-semibold text-primary ">Enrollment Details</h3>
							<hr class="mt-2 mb-4 horizontal-line" />

							  <div class="space-y-3">
								{#each ['enrollId',  'enrolledOn', 'batchNo'] as field}
								  <div class="grid grid-cols-2 gap-2">
									<div class="flex justify-between">
										<span class="w-full label">{formatFieldName(field)}</span>
										<span>:</span>
									</div>
									<span class="w-full text-sm break-words">
									  {#if field === 'enrolledOn'}
										{formatDate(formObject[field])}
									  {:else}
									  {formObject[field] ?formObject[field] :'-'}
									  {/if}
									</span>
								  </div>
								{/each}
							  </div>
							</div>
						  </div>
						</div>
				  
						<!-- Right Column: Personal, Contact, Employment, Residential, Sponsorship -->
						<div class="lg:w-2/3">
						  <!-- Personal Information -->
						  <div class="bg-white rounded-lg shadow-sm p-6 border border-gray-200 mb-6">
							<h3 class="text-base font-semibold text-primary ">Personal Information</h3>
							<hr class="mt-2 mb-4 horizontal-line" />

							<div class="space-y-3">
							  {#each ['candidateName', 'fatherNameOrHusbandName', 'dateOfBirth', 'age', 'sex', 'maritalStatus', 'religion', 'caste', 'education', 'familyMember', 'personWithDisability', 'povertyLine', 'povertyLineNumberOrRationCardNumber', 'secc', 'seccNo', 'panNumber', 'aadharCardNo'] as field}
								<div class="grid grid-cols-2 gap-2">
									<div class="flex justify-between">
								  <span class="w-full  label">{formatFieldName(field)}</span>
								  <span>:</span>
								</div>
								  <span class="w-full text-sm break-words  ">
									{#if field === 'dateOfBirth'}
									  {formatDate(formObject[field])}
									{:else if field === 'personWithDisability' || field === 'secc'}
									  {formObject[field] ? 'Yes' : 'No'}
									{:else}
									{formObject[field] ?formObject[field] :'-'}
									{/if}
								  </span>
								</div>
							  {/each}
							</div>
						  </div>
				  
						  <!-- Contact Information -->
						  <div class="bg-white rounded-lg shadow-sm p-6 border border-gray-200 mb-6">
							<h3 class="text-base font-semibold text-primary ">Contact Information</h3>
							<hr class="mt-2 mb-4 horizontal-line" />

							<div class="space-y-3">
							  {#each ['landlineStd', 'landlineNumber', 'mobileNumber1', 'mobileNumber2', 'email'] as field}
								<div class="grid grid-cols-2 gap-2">
									<div class="flex justify-between">
										<span class="w-full label">{formatFieldName(field)}</span>
										<span>:</span>
									</div>
									
								  <span class="w-full text-sm break-words">  {formObject[field] ?formObject[field] :'-'}</span>
								</div>
							  {/each}
							</div>
						  </div>
				  
						  <!-- Employment Information -->
						  <div class="bg-white rounded-lg shadow-sm p-6 border border-gray-200 mb-6">
							<h3 class="text-base font-semibold text-primary ">Employment Information</h3>
							<hr class="mt-2 mb-4 horizontal-line" />
							

							<div class="space-y-3">
							  {#each ['sgsyCandidate', 'candidatePresentOccupation', 'familyOccupation', 'nativityArea', 'relevantExperience', 'nameOfShg', 'mnergaCardNo'] as field}
								<div class="grid grid-cols-2 gap-2">
									<div class="flex justify-between">
										<span class="w-full label">{formatFieldName(field)}</span>
										<span>:</span>
									</div>
								  <span class="w-full text-sm break-words  ">
									{#if field === 'sgsyCandidate'}
									  {formObject[field] ? 'Yes' : 'No'}
									{:else}
									{formObject[field] ?formObject[field] :'-'}
									  
									{/if}
								  </span>
								</div>
							  {/each}
							</div>
						  </div>
				  
						  <!-- Residential Information -->
						  <div class="bg-white rounded-lg shadow-sm p-6 border border-gray-200 mb-6">
							<h3 class="text-base font-semibold text-primary">Residential Information</h3>
							<hr class="mt-2 mb-4 horizontal-line" />
							

							<div class="space-y-3">
							  {#each ['residential', 'candidateAddress', 'village', 'hobli', 'district', 'taluk', 'pincode'] as field}
								<div class="grid grid-cols-2 gap-2">
									<div class="flex justify-between">
										<span class="w-full  label">{formatFieldName(field)}</span>
										<span>:</span>
									</div>
								  <span class="w-full text-sm break-words ">
									{#if field === 'residential'}
									  {formObject[field] ? 'Yes' : 'No'}
									{:else}
									  {formObject[field] ?formObject[field] :'-'}
									{/if}
								  </span>
								</div>
							  {/each}
							</div>
						  </div>
				  
						  <!-- Sponsorship Details -->
						  <div class="bg-white rounded-lg shadow-sm p-6 border border-gray-200 mb-6">
							<h3 class="text-base font-semibold text-primary">Sponsorship Details</h3>
							<hr class="mt-2 mb-4 horizontal-line" />
							

							<div class="space-y-3">
							  {#each ['candidateSponsoredByBank', 'sponsoredBankName', 'sponsoredBankBranch', 'sponsoredBankCity', 'sponsorName'] as field}
								<div class="grid grid-cols-2 gap-2">
									<div class="flex justify-between">
										<span class="w-full label">{formatFieldName(field)}</span>
										<span>:</span>
									</div>
								  <span class="w-full text-sm break-words ">
									{#if field === 'candidateSponsoredByBank'}
									  {formObject[field] ? 'Yes' : 'No'}
									{:else}
									{formObject[field] ?formObject[field] :'-'}
									{/if}
								  </span>
								</div>
							  {/each}
							</div>
						  </div>
						</div>
					  </div>
					</div>				  
			  </ReviewForm>
	
		  </div>
		{/if}
	  
		<div class="flex justify-end gap-4">
		  {#if saved}
			<button
			  type="button"
			  class="rounded-md bg-white px-4 py-2 text-sm font-semibold text-darkgray border-2 shadow-sm"
			  on:click={handlePrevious}>Previous</button
			>
		  {:else}
			<button
			  type="button"
			  class="rounded-md bg-white px-4 py-2 text-sm font-semibold text-darkgray border-2 shadow-sm disabled:bg-gray-90 disabled:cursor-not-allowed"
				disabled={isSubmitting}
			  on:click={handleGoBack}>Cancel</button
			>
		  {/if}
		  <button
			class="rounded-md bg-darkGray px-4 py-2 text-sm font-semibold text-white shadow-sm disabled:bg-gray-90 disabled:cursor-not-allowed"
			type="submit"
			disabled={isSubmitting}
			formaction={saved ? '?/final' : '?/review'}>{saved ? 'Submit' : 'Save & Next'}</button
		  >
		</div>
	  </form>
	  
	  
  </div>