<script>
	import { page } from '$app/stores';
	import { String_Constants } from '/src/config/constants.js';
	import { genderData } from '$lib/data.js';
	import StateDetailsFilters from '$lib/states/stateDetails/StateDetailsFilters.svelte';
	import StateDetailsOverview from '$lib/states/stateDetails/StateDetailsOverview.svelte';
	import RadioButton from '$lib/components/RadioButton.svelte';
	import SearchBar from '$lib/components/SearchBar.svelte';
	import Button from '$lib/components/Button.svelte';
	import ListingTable from '$lib/components/ListingTable.svelte';
	import ErrorMessage from '$lib/components/ErrorMessage.svelte';
	import AddDistrictPopUp from '$lib/states/addState/AddDistrictPopUp.svelte';
	import { message } from '/src/routes/states/stateStore.js';
	import SuccessMessage from '$lib/components/SuccessMessage.svelte';
	import { onDestroy } from 'svelte';
	import DeletionModalViaAPI from '$lib/components/DeletionModalViaAPI.svelte';
	import InputField from '$lib/components/InputField.svelte';

	export let data;

	let { stateData, stateDetails } = data;

	let selectedLanguage = 'en';
	let searchValue = '';
	let tableData = [];
	let viewModal = false;
	let deleteTextInput = '';
	let tableActionName = '';
	let deletionConfirmText = 'please delete this district';
	let deleteTextConfirmation = false;
	let showDistrictPopUp = false;
	let formMode = 'POST';
	let districtExtId = null;
	let districtToDeleteName = {
		en:'',
		hi:''
	}
	let formObject = {
		nameEn: '',
		nameHi: ''
	};

	$: error = stateDetails?.error ? stateDetails?.error : '';



	// --------------------------- Language Filter ( Radio Button)	---------------------------------
	function handleLanguageSelectionFromRadioButton(e) {
		selectedLanguage = e.detail;
		updateTableDataLanguage();
	}

	$: updateTableDataLanguage();
	function updateTableDataLanguage() {
		tableData = [];

		if (!stateDetails?.error) {
			const districtMap = new Map();

			stateDetails?.forEach((state) => {
				state?.districts?.forEach((district) => {
					const extId = district?.extId;

					if (!districtMap.has(extId)) {
						districtMap.set(extId, {
							districtExtId: extId,
							nameEn: '',
							nameHi: ''
						});
					}

					let existing = districtMap.get(extId);
					if (district?.languageCode === 'en') {
						existing.nameEn = district?.name;
					} else if (district?.languageCode === 'hi') {
						existing.nameHi = district?.name;
					}
				});
			});

			tableData = Array.from(districtMap.values());
		}
	}

	// ------------------------ Listing Table --------------------------
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
			key: 'nameEn',
			name: 'District (en)'
		},
		{
			key: 'nameHi',
			name: 'District (hi)'
		}
	];

	// to configure the action tab (see comments of datatable.svelte)
	let actionConfigObject = [
		// {
		// 	actionName: 'view',
		// 	actionIconName: 'visibility',
		// 	modal: false
		// },
		{
			actionName: 'edit',
			actionIconName: 'edit',
			dispatch: false
		},
		{
			actionName: 'delete',
			actionIconName: 'delete',
			goto: '',
			modal: true
		}
	];

	function handleTableAction(e) {
		message.set('');

		tableActionName = e.detail?.actionName;
		viewModal = e.detail?.viewModal;
		districtExtId = e.detail.actionData?.districtExtId;
		districtToDeleteName ={
			en: e.detail.actionData?.nameEn ||'',
			hi: e.detail.actionData?.nameHi || ''
		}
	

		if (tableActionName === 'edit') {
			showDistrictPopUp = true;
			formMode = 'PUT'; 
			formObject = {
				nameEn: e.detail.actionData?.nameEn || '', 
				nameHi: e.detail.actionData?.nameHi || '' 
			};
			districtExtId; 
		}

	}

	// ------------------------ Deletion ----------------------------------

	const normalizeText = (text) => text?.trim().toLowerCase().replace(/\s+/g, ' ');

	$: isTextValid(deleteTextInput);
	function isTextValid() {
		deleteTextConfirmation = normalizeText(deleteTextInput) === normalizeText(deletionConfirmText);
	}

	function handleDistrictDeletion(e) {
		deleteTextInput = '';
		tableData = tableData?.filter((district) => district?.districtExtId !== e.detail);
		message.set(`Successfully deleted district - "${districtToDeleteName?.en || districtToDeleteName?.hi || '-'}".`);
	}

	function handleCancel() {
		deleteTextInput = '';
		viewModal = false;
	}


	// ---------------------------------------- District Addition -------------------------------------

	function handleGoToAddDistrict() {
		showDistrictPopUp = true;
		formMode = 'POST';
		formObject = {
			nameEn: '',
			nameHi: ''
		};
	}

	function handleCancelSubmission(e) {
		showDistrictPopUp = false;
	}

	// this used for both add/edit district 
	function handleDistrictAddition(e) {
	
		stateDetails = e.detail?.updatedStateDetails;
		let newDistrictExtId = e.detail?.newExtId;

		let enState = e.detail.updatedStateDetails?.find((state) => state?.languageCode === 'en');
		let hiState = e.detail.updatedStateDetails?.find((state) => state?.languageCode === 'hi');

		let enDistrict = enState?.districts?.find(
			(district) => district?.extId === newDistrictExtId && district.languageCode === 'en'
		);

		let hiDistrict = hiState?.districts?.find(
			(district) => district?.extId === newDistrictExtId && district.languageCode === 'hi'
		);

		let districtName = enDistrict?.name || hiDistrict?.name;
		updateTableDataLanguage();
		
		if(e.detail.errorInHindi){
			showDistrictPopUp=true
		} else {
		showDistrictPopUp = false;
		
		message.set(
			`Successfully ${formMode == 'POST' ? 'added' : 'edited'} district - "${districtName}"`
		);
		}
	
	}

	
	// --------------------------- Language Filter ( Radio Button)	---------------------------------

	let stateFilterOptions = [
		{ uuid: '0', title: 'All States' },
		...(!stateData?.error
			? stateData
					?.filter((state) => state.languageCode === 'en')
					.map((state) => ({ uuid: state.extId, title: state.name }))
			: [])
	];

	let stateFilterValue = String_Constants.ALL_STATES;
	let genderFilterValue = String_Constants.ALL_GENDERS;

	async function handleStateFilter(event) {
		// extracting the filter values from the event
		let stateFilter = event.detail.stateFilter;

		let courses = [];
		// The filter logic is not finalised, the code will be added accordingly
		// 	if (rsetiFilter === String_Constants.ALL_COURSES) {
		// 		courses=coursesData;
		// 	} else {
		// 	loading = false;
		// }
	}

    // ------------------------- General -------------------------------------------------

		function handleSuccessMessageClose() {
		message.set('');
	}

	function sendSearchValueToDatatable(e) {
		searchValue = e.detail;
	}


	onDestroy(() => {
		message.set('');
	});
	
</script>

{#if $message}
	<SuccessMessage
		successMessage={$message}
		on:handleSuccessMessageClose={handleSuccessMessageClose}
	/>
{/if}

{#if !stateDetails?.error}
	<div class="mt-2 mb-4 grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-4">
		<StateDetailsFilters
			on:handleFilters={handleStateFilter}
			bind:stateFilterValue
			bind:genderFilterValue
			stateFilterOptionList={stateFilterOptions}
			genderFilterOptionList={genderData}
		/>
	</div>

	<div>
		<h1 class="mb-2 heading-L">State Details</h1>
		<RadioButton
			languageOptionOne={'english'}
			languageCodeOne={'en'}
			languageOptionTwo={'hindi'}
			languageCodeTwo={'hi'}
			on:handleLanguageFromRadioButton={handleLanguageSelectionFromRadioButton}
		/>
	</div>

	<div class="mt-8 mb-4">
		<StateDetailsOverview {stateDetails} {selectedLanguage} />
	</div>

	<hr class="border-t border-darkgray mt-6" />

	<div class="mt-5">
		<div class="mb-5 flex gap-2 md:flex-nowrap flex-wrap">
			<SearchBar
				on:handleSearchValue={sendSearchValueToDatatable}
				placeholder="Search by name"
				showSearchButton={false}
			/>
			<div class="flex gap-2 ml-auto">
				<!-- <Button btnType="secondary" on:click={handleBulkUploadStates}>Bulk Upload</Button> -->
				<Button on:click={handleGoToAddDistrict}>+ District</Button>
			</div>
		</div>

		<ListingTable
			{searchValue}
			{tableData}
			{error}
			{tableHeaderDisplay}
			{actionConfigObject}
			rowHeight={'compact'}
			on:tableActionClick={handleTableAction}
			bind:sortAccordingTo
		/>
	</div>
{:else}
	<ErrorMessage {error} />
{/if}

<!-- This is used for both add/edit -->
{#if showDistrictPopUp}
	<AddDistrictPopUp
		{formMode}
		{stateDetails}
		{selectedLanguage}
		{formObject}
		{districtExtId}
		on:handleCancelSubmission={handleCancelSubmission}
		on:handleDistrictSaved={handleDistrictAddition}
	/>
{/if}

<div>
	{#if viewModal && tableActionName === 'delete'}
		<DeletionModalViaAPI
			id={districtExtId}
			name={districtToDeleteName?.en}
			heading={`About to delete the district - ${districtToDeleteName?.en}`}
			para={'Are you sure you want to delete the district? This action cannot be undone.'}
			endPoint={`/apis/states/delete/${stateDetails[0]?.extId}/districts/`}
			{deleteTextConfirmation}
			on:handleCancelDeletion={handleCancel}
			on:handleDeletion={handleDistrictDeletion}
		>
			<div
				class=" flex flex-col gap-2 p-6 bg-offwhite rounded-lg mb-4 border border-gray-50 text-darkGray"
			>
				<div>
					<p class="text-sm capitalize">
						<span class="label">Title (English) :</span>
						{districtToDeleteName?.en || '-'}
					</p>
					<p class="text-sm"><span class="label">Title (Hindi) :</span>{districtToDeleteName?.hi || '-'}</p>
				</div>
			</div>

			<div class="">
				<InputField
					label={"Type 'Please delete this district' to confirm"}
					placeholder={" Type 'Please delete this district'"}
					name={'deletion'}
					labelFontWeight={'font-normal'}
					bind:value={deleteTextInput}
					required
				/>
			</div>
		</DeletionModalViaAPI>
	{/if}
</div>