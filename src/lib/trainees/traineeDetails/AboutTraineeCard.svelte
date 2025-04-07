<script>
	import ReviewForm from '$lib/components/ReviewForm.svelte';
	import Edit from '$lib/svgComponents/Edit.svelte';
  import { rolesList, userTypes } from '$lib/data.js';
	import { userDetails } from '/src/routes/store.js';
	import { onMount } from 'svelte';
	import { checkActionPermission } from '$lib/utils/helper.js';
	import { moduleNames, actionNames, roleIds } from '$lib/data.js';
	import PasswordResetPopUp from '$lib/users/PasswordResetPopUp.svelte'
  import { page } from '$app/stores';

	export let traineeDetailsData = {};
  export let displayImage;
  
  let showMore = false;
  let showPasswordResetPopup=false
  $: firstLetter = traineeDetailsData?.candidateName ? traineeDetailsData.candidateName.charAt(0).toUpperCase() : '?';

  function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-UK', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  function formatFieldName(field) {

      // Special case for 'username'
      if (field === 'username') {
        return 'Enrollment ID';
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

function handlePasswordReset(){
		showPasswordResetPopup=true
	}

function handleCancel(){
		showPasswordResetPopup=false
	}

</script>

<div class="flex flex-col text-sm rounded-lg gap-4 shadow bg-offwhite p-6">
    <div class="flex flex-col md:flex-row gap-6 mb-4">
      <!-- <img
        class="w-32 h-32 rounded-lg border object-cover"
        src={displayImage ? displayImage : '/placeholderUserImage.png'}
        alt="Trainee thumbnail"
      /> -->

      <div class="w-32 h-32 rounded-lg border overflow-hidden flex items-center justify-center bg-blue-100 ">
      {#if traineeDetailsData?.displayImage}
        <img
          class="w-full h-full object-cover"
          src={traineeDetailsData.displayImage}
          alt="Trainee thumbnail"
        />
      {:else}
        <span class="text-[80px] font-bold text-white ">{firstLetter}</span>
      {/if}
    </div>
      <div>
        <div class="flex gap-2 items-center mb-2">
          <div class="heading-L ">
            {traineeDetailsData?.candidateName}
          </div>
          <a href={`/trainees/${traineeDetailsData?.uuid}/details/edit`}>
            <Edit stroke="#FF6A1F" />
          </a>
        </div>
        <div class="space-y-1 text-sm">
          {#each ['username',  'dateOfBirth'] as field}
            <div class="flex gap-2">
              <span class="label">{formatFieldName(field)}:</span>
              <span class="font-normal">
                {#if field === 'enrolledOn'}
                  {formatDate(traineeDetailsData[field])}
                {:else}
                  {traineeDetailsData[field] || '-'}
                {/if}
              </span>
            </div>
          {/each}
          {#if Number($userDetails?.role) !== Number(roleIds?.TRAINER)}
			<div class="text-sm mb-4 text-blue-500 underline hover:cursor-pointer hover:text-blue-600" on:click={handlePasswordReset}> Reset Password</div>
			{/if}
        </div>
      </div>
    </div>

    {#if showMore}
      <hr class="horizontal-line" />
  
      <div class="grid md:grid-cols-2 gap-10 md:gap-0 relative">
        <!-- Separator line for md and above -->
        <div class="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gray-200"></div>
  
        <!-- Left Column: Personal and Contact Information -->
        <div class="space-y-10 md:pr-10">
          <!-- Personal Information -->
          <div>
            <h3 class="heading-L mb-4">Personal Information</h3>
            <div class="space-y-3">
              {#each [ 'candidateName', 'age', 'sex', 'fatherNameOrHusbandName',  'maritalStatus', 'religion', 'caste', 'education', 'personWithDisability', 'aadharCardNo'] as field}
                <div class="grid grid-cols-2 gap-2">
                  <div class="flex justify-between">
                    <span class="w-full label">{formatFieldName(field)}</span>
                    <span>:</span>
                  </div>
                  <span class="w-full text-sm break-words">
                    {#if field === 'dateOfBirth'}
                      {formatDate(traineeDetailsData[field])}
                    {:else if field === 'personWithDisability' || field === 'secc'}
                      {traineeDetailsData[field] ? 'Yes' : 'No'}
                    {:else}
                      {traineeDetailsData[field] ? traineeDetailsData[field] : '-'}
                    {/if}
                  </span>
                </div>
              {/each}
            </div>
          </div>
  

        </div>
  
        <!-- Right Column: Employment, Residential, Sponsorship -->
        <div class="space-y-10 md:pl-10">
  
                    <!-- Contact Information -->
                    <div>
                      <h3 class="heading-L mb-4">Contact Information</h3>
                      <div class="space-y-3">
                        {#each [ 'mobileNumber1',  'email'] as field}
                          <div class="grid grid-cols-2 gap-2">
                            <div class="flex justify-between">
                              <span class="w-full label">{formatFieldName(field)}</span>
                              <span>:</span>
                            </div>
                            <span class="w-full text-sm break-words">{traineeDetailsData[field] ? traineeDetailsData[field] : '-'}</span>
                          </div>
                        {/each}
                      </div>
                    </div>
          <!-- Residential Information -->
          <div>
            <h3 class="heading-L mb-4">Residential Information</h3>
            <div class="space-y-3">
              {#each ['candidateAddress',  'district',  'pincode'] as field}
                <div class="grid grid-cols-2 gap-2">
                  <div class="flex justify-between">
                    <span class="w-full label">{formatFieldName(field)}</span>
                    <span>:</span>
                  </div>
                  <span class="w-full text-sm break-words">
                    {#if field === 'residential'}
                      {traineeDetailsData[field] ? 'Yes' : 'No'}
                    {:else}
                      {traineeDetailsData[field] ? traineeDetailsData[field] : '-'}
                    {/if}
                  </span>
                </div>
              {/each}
            </div>
          </div>
  
        </div>
      </div>
    {/if}
  
    <div class="text-right">
      <button
        on:click={() => showMore = !showMore}
        class="text-blue-600 hover:text-blue-800 font-medium"
      >
        {showMore ? 'Show Less' : 'Show More'}
      </button>
    </div>
  </div>

  {#if showPasswordResetPopup}
	<PasswordResetPopUp 
    endPoint={`/apis/trainees/${traineeDetailsData?.uuid}/passwordReset`}
    resetOwnPassword={false}
		userType={userTypes?.TRAINEE}
	on:handleCancelSubmission={handleCancel}/>
{/if}
    