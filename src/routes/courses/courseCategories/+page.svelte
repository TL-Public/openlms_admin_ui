<script>
	import { message } from '/src/routes/courses/courseStore.js';
	import { onDestroy } from 'svelte';
	import ListingTable from '$lib/components/ListingTable.svelte';
	import SearchBar from '$lib/components/SearchBar.svelte';
	import SuccessMessage from '$lib/components/SuccessMessage.svelte';
	import DeletionModalViaAPI from '$lib/components/DeletionModalViaAPI.svelte';
	import InputField from '$lib/components/InputField.svelte';
	import Button from '$lib/components/Button.svelte';
	import AddCourseCategoryPopUp from '$lib/courses/addCourse/AddCourseCategoryPopUp.svelte';

	export let data;

	let { courseCategoryList } = data;

	let tableData = [];
	let viewModal = false;
	let searchValue = '';
	let tableActionName = '';
	let deleteTextInput = '';
	let deletionConfirmText = 'please delete this course category';
	let deleteTextConfirmation = false;
	let englishTitle = '';
	let hindiTitle = '';
	let extId;
	let englishTitleOfNewCourseCategory = '';
	let showAddPopUp = false;
	let method;
	let formObject = {
		titleEn: '',
		titleHi: ''
	};

	$: error = courseCategoryList?.error ? courseCategoryList?.error : '';

	// --------------------------- Create Table Data ---------------------------

	if (!error && Array.isArray(courseCategoryList) && courseCategoryList.length > 0) {
		const transformedData = Object.values(
			courseCategoryList?.reduce((acc, item) => {
				const { extId, name, languageCode } = item;

				// Ensure valid data structure
				if (!extId || !name || !languageCode) {
					return acc;
				}

				if (!acc[extId]) acc[extId] = { extId, titleEnglish: null, titleHindi: null };

				if (languageCode === 'en') acc[extId].titleEnglish = name;
				if (languageCode === 'hi') acc[extId].titleHindi = name;

				return acc;
			}, {})
		);

		transformedData?.forEach((courseCategory) => {
			if (!courseCategory.extId) return;
			let CourseCategoryObj = {
				extId: courseCategory?.extId ?? 'N/A', // Default extId if missing
				englishTitle: courseCategory?.titleEnglish ?? '', // Default English title
				hindiTitle: courseCategory?.titleHindi ?? '' // Default Hindi title
			};

			tableData.push(CourseCategoryObj);
		});
	} else {
		console.warn('No Category data available or error occurred.');
	}

	function sendSearchValueToDatatable(e) {
		searchValue = e.detail;
	}
	// ---------------------Addition----------------------
	function handleCourseCategoryAddition(e) {
		message.set('');

		// Extract English and Hindi results
		let newCategoryEn = e.detail?.englishResult;
		let newCategoryHi = e.detail?.hindiResult;

		// Check for English success
		if (newCategoryEn) {
			englishTitleOfNewCourseCategory = newCategoryEn?.name;
			// Find if the extId already exists in the table (edge case: Hindi succeeded first, we dont have that design as of now, if english succeed then only call for hindi will be made)
			let existingIndex = tableData?.findIndex((item) => item?.extId === newCategoryEn?.extId);

			if (existingIndex !== -1) {
				// Update the existing entry with English data
				tableData[existingIndex] = {
					...tableData[existingIndex],
					englishTitle: newCategoryEn?.name || ''
				};
			} else {
				// Add a new entry with only English data
				tableData = [
					...tableData,
					{
						extId: newCategoryEn?.extId,
						englishTitle: newCategoryEn?.name || '',
						hindiTitle: '' // Default empty Hindi title
					}
				];
			}
		}

		// Check for Hindi success
		if (newCategoryHi) {
			// Find if the extId already exists in the table
			let existingIndex = tableData?.findIndex((item) => item?.extId === newCategoryHi?.extId);

			if (existingIndex !== -1) {
				// Update the existing entry with Hindi data
				tableData[existingIndex] = {
					...tableData[existingIndex],
					hindiTitle: newCategoryHi?.name || ''
				};
			} else {
				// Add a new entry with only Hindi data (edge case: Hindi succeeded first)
				tableData = [
					...tableData,
					{
						extId: newCategoryHi?.extId,
						englishTitle: '', // Default empty English title
						hindiTitle: newCategoryHi?.name || ''
					}
				];
			}
			let successMessage = `Successfully ${method === 'POST' ? 'added' : 'updated'} Course Category - "${englishTitleOfNewCourseCategory}"`;
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

	function handleCategoryDeletion(e) {
		deleteTextInput = '';
		message.set('');
		let filteredCategories = tableData?.filter((cat) => {
			return cat?.extId !== e.detail;
		});
		message.set(`Successully deleted the Course Category- "${englishTitle}".`);
		tableData = filteredCategories;
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
			name: 'English Title'
		},
		{
			key: 'hindiTitle',
			name: 'Hindi Title'
		}
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

		if (actionName === 'edit') {
			showAddPopUp = true;
			method = 'PUT';
			formObject = {
				titleEn: englishTitle,
				titleHi: hindiTitle
			};
		}
	}

	// --------------------- General ----------------------

	function handleCategoryAdditionPopup() {
		showAddPopUp = true;
		method = 'POST';
		formObject = {
			titleEn: '',
			titleHi: ''
		};
		extId = null;
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
	<h1 class="mb-2 font-semibold text-primary text-base">Course Categories</h1>
</div>

<div class="mt-5">
	<div class="mb-5 flex gap-2 md:flex-nowrap flex-wrap">
		<SearchBar
			on:handleSearchValue={sendSearchValueToDatatable}
			placeholder={'Search by name'}
			showSearchButton={false}
		/>
		<div class="flex gap-2 ml-auto">
			<Button on:click={handleCategoryAdditionPopup}>+ Category</Button>
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
		bind:sortAccordingTo
	/>
</div>

<div>
	{#if viewModal && tableActionName === 'delete'}
		<DeletionModalViaAPI
			id={extId}
			name={englishTitle}
			heading={`About to delete the Course Category - ${englishTitle}`}
			para={'Are you sure you want to delete this category? This action cannot be undone.'}
			endPoint={'/apis/courses/courseCategories/'}
			{deleteTextConfirmation}
			on:handleCancelDeletion={handleCancel}
			on:handleDeletion={handleCategoryDeletion}
		>
			<hr />
			<div
				class="flex flex-col gap-2 p-6 bg-offwhite rounded-lg mb-4 border border-gray-50 text-darkGray"
			>
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
					label={"Type 'Please delete this course category' to confirm"}
					placeholder={" Type 'Please delete this course category'"}
					name={'deletion'}
					labelFontWeight={'font-normal'}
					bind:value={deleteTextInput}
					required
				/>
			</div>
		</DeletionModalViaAPI>
	{/if}
</div>

<!-- This componeent is handling both add/edit of Categories -->
{#if showAddPopUp}
	<AddCourseCategoryPopUp
		on:handleCancelSubmission={() => (showAddPopUp = false)}
		on:handleAddCourseCategory={handleCourseCategoryAddition}
		formMode={method}
		{formObject}
		{extId}
	/>
{/if}
