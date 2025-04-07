<script>
	import { goto } from '$app/navigation';
	import { message } from '/src/routes/FAQs/faqStore.js';
	import { onDestroy } from 'svelte';
	import ListingTable from '$lib/components/ListingTable.svelte';
	import SearchBar from '$lib/components/SearchBar.svelte';
	import SuccessMessage from '$lib/components/SuccessMessage.svelte';
	import DeletionModalViaAPI from '$lib/components/DeletionModalViaAPI.svelte';
	import InputField from '$lib/components/InputField.svelte';
	import Button from '$lib/components/Button.svelte';

	import AddFaqCategoryPopUp from '$lib/faqs/AddFAQCategoryPopUp.svelte';

	export let data;

	let {faqCategoryList } = data;
	let error;

	let tableData = [];
	let viewModal = false;
	let searchValue = '';
	let tableActionName = '';
	let deleteTextInput = '';
	let deletionConfirmText = 'please delete this faq category';
	let deleteTextConfirmation = false;
	let englishTitle=''
	let hindiTitle=''
	let extId;
	let englishTitleOfNewFAQCategory = '';
	let showAddPopUp=false;
	let method;
	let formObject = {
		titleEn: '',
		titleHi: '',
	};
	$:error=faqCategoryList?.error?true:false;

// --------------------------- Create Table Data ---------------------------

	if (!error && Array.isArray(faqCategoryList) && faqCategoryList.length > 0) {
  	const transformedData = Object.values(
	faqCategoryList?.reduce((acc, item) => {
      const { extId, category, languageCode } = item;

      // Ensure valid data structure
      if (!extId || !category || !languageCode) {
        return acc;
      }

      if (!acc[extId]) acc[extId] = { extId, titleEnglish: null, titleHindi: null };

      if (languageCode === "en") acc[extId].titleEnglish = category;
      if (languageCode === "hi") acc[extId].titleHindi = category;

      return acc;
    }, {})
  	);

	transformedData?.forEach((faqCategory) => {
		if(!faqCategory.extId) return
		let faqCategoryObj = {
		extId: faqCategory?.extId ?? "N/A", // Default extId if missing
		englishTitle: faqCategory?.titleEnglish ?? '', // Default English title
		hindiTitle: faqCategory?.titleHindi ?? '', // Default Hindi title
		};
		tableData.push(faqCategoryObj);
	});
	} else {
	console.warn("No FAQ data available or error occurred.");
	}

	function sendSearchValueToDatatable(e) {
		searchValue = e.detail;
	}
	// ---------------------Addition----------------------
	function handleFAQCategoryAddition(e) {
	message.set('');

	// Extract English and Hindi results
	let newFAQEn = e.detail?.englishResult;
	let newFAQHi = e.detail?.hindiResult;

	// Check for English success
	if (newFAQEn) {
		englishTitleOfNewFAQCategory = newFAQEn?.category;
		// Find if the extId already exists in the table (edge case: Hindi succeeded first, we dont have that design as of now, if english succeed then only call for hindi will be made)
		let existingIndex = tableData?.findIndex(item => item?.extId === newFAQEn?.extId);

		if (existingIndex !== -1) {
			// Update the existing entry with English data
			tableData[existingIndex] = {
				...tableData[existingIndex],
				englishTitle: newFAQEn?.category || '',
			};
		} else {
			// Add a new entry with only English data
			tableData = [
				...tableData,
				{
					extId: newFAQEn?.extId,
					englishTitle: newFAQEn?.category || '',
					hindiTitle: '', // Default empty Hindi title
				},
			];
		}
	}

	// Check for Hindi success
	if (newFAQHi) {
		// Find if the extId already exists in the table
		let existingIndex = tableData?.findIndex(item => item?.extId === newFAQHi?.extId);

		if (existingIndex !== -1) {
			// Update the existing entry with Hindi data
			tableData[existingIndex] = {
				...tableData[existingIndex],
				hindiTitle: newFAQHi?.category || '',
			};
		} else {
			// Add a new entry with only Hindi data (edge case: Hindi succeeded first)
			tableData = [
				...tableData,
				{
					extId: newFAQHi?.extId,
					englishTitle: '', // Default empty English title
					hindiTitle: newFAQHi?.category || '',
				},
			];

			
		}
		let successMessage = `Successfully ${method==='POST'?'added':'updated'} FAQ Category - "${englishTitleOfNewFAQCategory}"`;
		message.set(successMessage);
	}
}

	// --------------------- Deletion----------------------

	// Function to normalize text (removes spaces and ignores case)
		const normalizeText = (text) => text?.trim().toLowerCase().replace(/\s+/g, ' ');

		// Function to check if input matches the required text
		$: isTextValid(deleteTextInput);
		function isTextValid() {
			deleteTextConfirmation = normalizeText(deleteTextInput) === normalizeText(deletionConfirmText);
		}

		function handleCancel() {
		deleteTextInput = '';
		viewModal = false;
	}

	function handleFAQDeletion(e) {
		deleteTextInput = '';
		message.set('');
		let filteredFaqs = tableData?.filter((faq) => {
			return faq?.extId !== e.detail;
		});
		message.set(`Successully deleted the FAQ Category- "${englishTitle}".`);
		tableData = filteredFaqs;
	}


	// --------------------- Listing Table ----------------------
	// this object needs to be in accordance with the datatable sortAccordingTo object
	// Can be used to set to a predefined sortingOrder for a predefined header
	let sortAccordingTo = {
		header: null,
		entityType: null,
		sortingOrder: null
	};

	// define header names for the desired headers to be displayed
	let tableHeaderDisplay = [
		{
			key: 'englishTitle',
			name: 'English Title',
		},
		{
			key: 'hindiTitle',
			name: 'Hindi Title',
		},
	];

	// to configure the action tab (see comments of datatable.svelte)
	let actionConfigObject = [
		{
			actionName: 'edit',
			actionIconName: 'edit',
			dispatch: false
		},
		{
			actionName: 'delete',
			actionIconName: 'delete',
			modal: true
		}
	];

	function handleTableAction(e) {
		const actionName = e.detail.actionName;
		const actionData = e.detail.actionData;
		message.set('');
		viewModal = e.detail.viewModal;
		tableActionName = e.detail.actionName;
		extId = e.detail.actionData.extId;
		englishTitle = e.detail.actionData.englishTitle;
		hindiTitle = e.detail.actionData.hindiTitle;

		if(actionName==='edit'){
			showAddPopUp=true;
			method='PUT'
			formObject = {
				titleEn: englishTitle,
				titleHi: hindiTitle,
			};
		}
	}


	// --------------------- General ----------------------

	function handleCategoryAdditionPopup(){
		showAddPopUp=true;
		method='POST'
		formObject = {
			titleEn: '',
			titleHi: '',
		};
		extId=null;
	}

	function handleSuccesMessageClose(e) {
		message.set('');
	}

	onDestroy(() => {
		message.set('');
	});

</script>

<div class="mb-2">
	{#if $message}
	<SuccessMessage
		successMessage={$message}
		on:handleSuccessMessageClose={handleSuccesMessageClose}
	/>
{/if}
</div>

	<div>
		<h1 class="mb-2 font-semibold text-primary text-base">FAQ Categories</h1>
	</div>

<div class="mt-5">
		<div class="mb-5 flex gap-2 md:flex-nowrap flex-wrap">
			<SearchBar
				on:handleSearchValue={sendSearchValueToDatatable}
				placeholder={'Search by name'}
				showSearchButton={false}
			/>
			<div class="flex gap-2 ml-auto">
				<Button on:click={handleCategoryAdditionPopup}>+ FAQ Category</Button>
			</div>
		</div>
	<ListingTable 
	{searchValue} 
	{tableData} 
	on:tableActionClick={handleTableAction} 
	{error} 
	{tableHeaderDisplay}
	{actionConfigObject}
	rowHeight={'compact'}
	bind:sortAccordingTo />
</div>

<div>
	{#if viewModal && tableActionName === 'delete'}
		<DeletionModalViaAPI
			id={extId}
			name={englishTitle}
			heading={`About to delete the FAQ Category - ${englishTitle}`}
			para={'Are you sure you want to delete this question? This action cannot be undone.'}
			endPoint={'/apis/faqs/faqCategories/'}
			{deleteTextConfirmation}
			on:handleCancelDeletion={handleCancel}
			on:handleDeletion={handleFAQDeletion}
		>
			<hr />
			<div class="flex flex-col gap-2 p-6 bg-offwhite rounded-lg mb-4 border border-gray-50 text-darkGray">
				<div>
					<div class="heading-L mb-2">Category</div>
					<p class="text-sm capitalize">
						
						<span class="label">Title (in English) :</span>
						{englishTitle}
					</p>

					<!-- <p class="text-sm text-darkGray">Answer : {answer}</p> -->
					<p class="text-sm"><span class="font-medium">Title (in Hindi) :</span>{hindiTitle}</p>

				</div>
			</div>
			<hr class="mb-2" />
			<div class="">
				<InputField
					label={"Type 'Please delete this FAQ category' to confirm"}
					placeholder={" Type 'Please delete this FAQ category'"}
					name={'deletion'}
					labelFontWeight={'font-normal'}
					bind:value={deleteTextInput}
					required
				/>
			</div>
		</DeletionModalViaAPI>
	{/if}
</div>


<!-- This componeent is handling both add/edit of FAQ Categories -->
{#if showAddPopUp}
	<AddFaqCategoryPopUp
		on:handleCancelSubmission={()=>showAddPopUp=false}
		on:handleAddFAQCategory={handleFAQCategoryAddition}
		formMode={method}
		formObject={formObject}
		extId={extId}
	/>
{/if}

