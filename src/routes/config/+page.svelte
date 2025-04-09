<script>
	import { message } from '/src/routes/config/configStore.js';
	import { onDestroy } from 'svelte';
	import ListingTable from '$lib/components/ListingTable.svelte';
	import SearchBar from '$lib/components/SearchBar.svelte';
	import SuccessMessage from '$lib/components/SuccessMessage.svelte';
	import DeletionModalViaAPI from '$lib/components/DeletionModalViaAPI.svelte';
	import InputField from '$lib/components/InputField.svelte';
	import Button from '$lib/components/Button.svelte';
	import AddConfigPopUp from '$lib/config/AddConfigPopUp.svelte';

	export let data;

	let key = '';
	let value = '';

	let { appConfigList } = data;
	let tableData = [];
	let viewModal = false;
	let searchValue = '';
	let tableActionName = '';
	let deleteTextInput = '';
	let deletionConfirmText = 'please delete this config';
	let deleteTextConfirmation = false;
	let showAddPopUp = false;
	let method;
	let formObject = {
		key: '',
		value: ''
	};
	$: error = appConfigList?.error ? true : false;

	// --------------------------- Create Table Data ---------------------------

	if (!error && Array.isArray(appConfigList) && appConfigList.length > 0) {
		tableData = appConfigList;
	}

	function sendSearchValueToDatatable(e) {
		searchValue = e.detail;
	}

	// ------------------------------ Addition/Edit ----------------------------------

	function handleConfigAddition(e) {
		message.set('');

		let newConfig = e.detail.responseData;

		if (method == 'PUT') {
			let existingIndex = tableData?.findIndex((item) => item?.key === newConfig?.key);
			if (existingIndex !== -1) {
				tableData[existingIndex] = newConfig;
				message.set(`Successfully edited the configuration - "${newConfig?.key}".`);
			}
		} else {
			// Add new config
			tableData = [...tableData, newConfig];
			message.set(`Successfully added the configuration - "${newConfig?.key}".`);
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

	function handleConfigDeletion(e) {
		deleteTextInput = '';
		message.set('');
		let filteredConfigs = tableData?.filter((config) => {
			return config?.key !== e.detail;
		});
		message.set(`Successully deleted the config- "${key}".`);
		tableData = filteredConfigs;
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
			key: 'key',
			name: 'Key'
		},
		{
			key: 'value',
			name: 'Value'
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
		tableActionName = actionName;
		key = actionData.key;
		value = actionData.value;

		if (actionName === 'edit') {
			showAddPopUp = true;
			method = 'PUT';
			formObject = {
				key: key,
				value: value
			};
		}
	}

	// --------------------- General ----------------------

	function handleCategoryAdditionPopup() {
		showAddPopUp = true;
		method = 'POST';
        formObject = {
            key: '',
            value: ''
        };
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
	<h1 class="mb-2 font-semibold text-primary text-base">App Configurations</h1>
</div>

<div class="mt-5">
	<div class="mb-5 flex gap-2 md:flex-nowrap flex-wrap">
		<SearchBar
			on:handleSearchValue={sendSearchValueToDatatable}
			placeholder={'Search by name'}
			showSearchButton={false}
		/>
		<div class="flex gap-2 ml-auto">
			<Button on:click={handleCategoryAdditionPopup}>+ Configuration</Button>
		</div>
	</div>
	<ListingTable
		{searchValue}
		{tableData}
		on:tableActionClick={handleTableAction}
		error={appConfigList?.error}
		{tableHeaderDisplay}
		{actionConfigObject}
		rowHeight={'compact'}
		bind:sortAccordingTo
	/>
</div>

<div>
	{#if viewModal && tableActionName === 'delete'}
		<DeletionModalViaAPI
			id={key}
			name={key}
			heading={`About to delete the config - ${key}`}
			para={'Are you sure you want to delete this config? This action cannot be undone.'}
			endPoint={'/apis/config/'}
			{deleteTextConfirmation}
			on:handleCancelDeletion={handleCancel}
			on:handleDeletion={handleConfigDeletion}
		>
			<hr />
			<div
				class="flex flex-col gap-2 p-6 bg-offwhite rounded-lg mb-4 border border-gray-50 text-darkGray"
			>
				<div>
					<div class="heading-L mb-2">Configuration Details</div>
					<p class="text-sm capitalize">
						<span class="label">Key :</span>
						{key}
					</p>

					<!-- <p class="text-sm text-darkGray">Answer : {answer}</p> -->
					<p class="text-sm"><span class="font-medium">Value :</span>{value}</p>
				</div>
			</div>
			<hr class="mb-2" />
			<div class="">
				<InputField
					label={"Type 'Please delete this config' to confirm"}
					placeholder={" Type 'Please delete this config'"}
					name={'deletion'}
					labelFontWeight={'font-normal'}
					bind:value={deleteTextInput}
					required
				/>
			</div>
		</DeletionModalViaAPI>
	{/if}
</div>

<!-- This componeent is handling both add/edit -->
{#if showAddPopUp}
	<AddConfigPopUp
		on:handleCancelSubmission={() => (showAddPopUp = false)}
		on:handleConfigAddition={handleConfigAddition}
		formMode={method}
		{formObject}
		{key}
	/>
{/if}
