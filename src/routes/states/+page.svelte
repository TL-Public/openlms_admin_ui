<script>
	import { goto } from '$app/navigation';
	import { String_Constants } from '/src/config/constants.js';
	import { message } from '/src/routes/states/stateStore.js';
	import Filters from '$lib/states/statesListing/Filters.svelte';
	import ListingTable from '$lib/components/ListingTable.svelte';
	import SearchBar from '$lib/components/SearchBar.svelte';
	import SuccessMessage from '$lib/components/SuccessMessage.svelte';
	import StateListingOverview from '$lib/states/statesListing/StateListingOverview.svelte';
	import DeletionModalViaAPI from '$lib/components/DeletionModalViaAPI.svelte';
	import BreadCrumbs from '$lib/components/BreadCrumbs.svelte';
	import { page } from '$app/stores';
	import Button from '$lib/components/Button.svelte';
	import RadioButton from '$lib/components/RadioButton.svelte';
	import IndividualStats from '$lib/components/IndividualStats.svelte';
	import { courseStats } from '$lib/data.js';
	import InputField from '$lib/components/InputField.svelte';

	export let data;


	let { statesListData, rsetiData, stateData } = data;
	

	let searchValue = '';
	let viewModal = false;
	let tableActionName = '';
	let stateDeletionUUID = '';
	let stateName = '';
	let phoneNumber = '';
	let email = '';
	let tableData = [];
	let stateFilterValue = String_Constants.ALL_STATES;
	let error = statesListData?.error ? statesListData?.error : '';
	let statesListDataEmpty = statesListData?.length === 0;
	let selectedLanguage = 'en';
	let deleteTextInput = '';
	let deletionConfirmText = 'please delete this state';
	let deleteTextConfirmation = false;
	let ISOCode='';
	let extId;
	let districtCnt='';
	let stateFilterOptions = [
		{ uuid: "0", title: "All States" },
		...(stateData
			?.filter((state) => state.languageCode === "en")
			.map((state) => ({ uuid: state.extId, title: state.name })) || [])
	];

	function sendSearchValueToDatatable(e) {
		searchValue = e.detail;
	}
	const normalizeText = (text) => text?.trim().toLowerCase().replace(/\s+/g, ' ');

$: isTextValid(deleteTextInput);
	function isTextValid() {
		deleteTextConfirmation = normalizeText(deleteTextInput) === normalizeText(deletionConfirmText);
	}
	$: updateTableDataLanguage();

	function updateTableDataLanguage() {
		tableData = [];
		if (!statesListData?.error) {
			statesListData
				.filter((state) => state.languageCode === selectedLanguage)
				.forEach((state) => {
					let districtCount = state?.districts?.length || 0;
					let stateObj = {
						extId: state?.extId,
						name: state?.name,
						isocode: state?.isoCode,
						distictcount: state?.district?.length || '-',
					};
					if (state?.status?.toLowerCase().trim() !== 'deleted') {
						tableData.push(stateObj);
					}
				});
		}
	}

	function handleSuccessMessageClose() {
		message.set('');
	}


	function handleCancel() {
		deleteTextInput = '';
		viewModal = false;
	}

	function handleStateDeletion(e) {
		deleteTextInput = '';
		message.set('State deleted successfully!');
		tableData = tableData.filter((state) => state?.uuid !== e.detail);
	}

	function handleGoToAddState() {
		goto('/states/add');
	}

	function handleBulkUploadStates() {
		goto('/states/bulkUpload');
	}

	async function handleFilter(event) {
		// Placeholder for filter logic
	}

	function handleLanguageSelectionFromRadioButton(e) {
		selectedLanguage = e.detail;
		updateTableDataLanguage();
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
			key: 'name',
			name: 'Name'
		},
		{
			key: 'isoCode',
			name: 'ISO Code'
		},
		{
			key: 'distictCount',
			name: 'District Count'
		}
	];

	// to configure the action tab (see comments of datatable.svelte)
	let actionConfigObject = [
		{
			actionName: 'view',
			actionIconName: 'visibility',
			modal: false
		},
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
		console.log(e.detail.actionData, 'actionData')
		viewModal = e.detail.viewModal;
		tableActionName = e.detail.actionName;
		stateName = e.detail.actionData.name;
		ISOCode = e.detail.actionData.isocode;
		extId = e.detail.actionData.extId;
		districtCnt = e.detail.actionData.distictcount;
		stateDeletionUUID = e.detail.actionData.uuid;

		if(tableActionName==='view'){
			goto(`/states/${extId}/details`)
		}
		if(tableActionName==='view'){
			goto(`/states/${extId}/details/edit`)
		}
	}

</script>

{#if !statesListDataEmpty}
	{#if $message}
		<SuccessMessage
			successMessage={$message}
			on:handleSuccessMessageClose={handleSuccessMessageClose}
		/>
	{/if}

	<!-- <div class="mt-4 mb-4">
		<Filters
			on:handleFilters={handleFilter}
			bind:stateFilterValue
			stateFilterOptionList={stateFilterOptions}
		/>
	</div> -->

	<div class="mb-8 mt-4">
		<h1 class="mb-2 heading-L">States</h1>
		<RadioButton
			languageOptionOne="English"
			languageCodeOne="en"
			languageOptionTwo="Hindi"
			languageCodeTwo="hi"
			on:handleLanguageFromRadioButton={handleLanguageSelectionFromRadioButton}
		/>
		
	</div>
	<StateListingOverview />

	<div class="mt-5">
		<div class="mb-5 flex gap-2 md:flex-nowrap flex-wrap">
			<SearchBar
				on:handleSearchValue={sendSearchValueToDatatable}
				placeholder="Search by name"
				showSearchButton={false}
			/>
			<Button btnType="secondary" on:click={handleBulkUploadStates}>Bulk Upload</Button>
			<Button on:click={handleGoToAddState}>+ State</Button>
		</div>
		<ListingTable 
		{searchValue} 
		{tableData} 
		on:tableActionClick={handleTableAction} 
		{error} 
		{tableHeaderDisplay}
		{actionConfigObject}
		rowHeight={'compact'}
		bind:sortAccordingTo/>
	</div>

	<div>
		{#if viewModal && tableActionName === 'delete'}
		<DeletionModalViaAPI
		id={stateDeletionUUID}
        name={stateName}
		heading={`About to delete the state - ${stateName}`}
		para={'Are you sure you want to delete the state? This action cannot be undone.'}
		endPoint={'/apis/states/delete/'}
		{deleteTextConfirmation}
		on:handleCancelDeletion={handleCancel}
		on:handleDeletion={handleStateDeletion}
	>
		<div
			class=" flex flex-col gap-2 p-6 bg-offwhite rounded-lg mb-4 border border-gray-50 text-darkGray"
		>
			<div>
				<p class="text-sm capitalize">
					<span class="label">Title :</span>
					{stateName}
				</p>
				<p class="text-sm"><span class="label">ISO Code :</span>{ISOCode}</p>
				<p class="text-sm">
					<span class="label">District Count :</span>{districtCnt}
				</p>
				
			</div>
			
			
		</div>

		<div class="">
			<InputField
				label={"Type 'Please delete this state' to confirm"}
				placeholder={" Type 'Please delete this state'"}
				name={'deletion'}
				labelFontWeight={'font-normal'}
				bind:value={deleteTextInput}
				required
			/>
		</div>
	</DeletionModalViaAPI>
		{/if}
	</div>
{/if}
