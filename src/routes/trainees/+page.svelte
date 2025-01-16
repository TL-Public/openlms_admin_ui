<script>
	import { goto } from '$app/navigation';
	import { String_Constants } from '/src/config/constants.js';
	import { message } from '/src/routes/trainees/traineeStore.js';
	import {genderData} from '$lib/data.js'
	import Filters from '$lib/trainees/traineeListing/Filters.svelte';
	import SearchBar from '$lib/components/SearchBar.svelte';
	import SuccessMessage from '$lib/components/SuccessMessage.svelte';
	import TraineeListingOverview from '$lib/trainees/traineeListing/TraineeListingOverview.svelte';
	import { onDestroy } from 'svelte';
	import Button from '$lib/components/Button.svelte';
	import DeletionModalViaAPI from '$lib/components/DeletionModalViaAPI.svelte';
	import InputField from '$lib/components/InputField.svelte';
	import ListingTable from '$lib/components/ListingTable.svelte';
	import ErrorMessage from '$lib/components/ErrorMessage.svelte';



	export let data;

	let searchValue = '';
	let viewModal = false;
	let tableActionName = '';
	let { stateData, traineesData } = data;
	let traineeDeletionUUID = '';
	let traineeName = '';
    let traineeId=''
	let tableData = [];
	let stateFilterValue = String_Constants.ALL_STATES;
	let genderFilterValue = String_Constants.ALL_GENDERS;
	let deletionConfirmText = 'please delete this trainee';
	let deleteTextConfirmation = false;
	let deleteTextInput = '';
	let traineeUsername = '';

	// Function to normalize text (removes spaces and ignores case)
	const normalizeText = (text) => text?.trim().toLowerCase().replace(/\s+/g, ' ');

	// Function to check if input matches the required text
	$: isTextValid(deleteTextInput);
	function isTextValid() {
		deleteTextConfirmation = normalizeText(deleteTextInput) === normalizeText(deletionConfirmText);
	}
	
	$:error = traineesData?.error ? traineesData?.error : '';

	if (!traineesData?.error) {
		traineesData?.forEach((trainee) => {
			let traineeObj = {
				uuid: trainee?.uuid,
				name: trainee?.candidateName,
				traineeId: trainee?.enrollId,
				username: trainee?.username,
			};
				tableData.push(traineeObj);
		});
	}

	function sendSearchValueToDatatable(e) {
		searchValue = e.detail;
	}


	function handleSuccesMessageClose(e) {
		message.set('');
	}


	function handleCancel() {
		deleteTextInput = '';
		viewModal = false;
	}

	function handleTraineeDeletion(e) {
		deleteTextInput = '';
		message.set('');
		let filteredTraineesData = tableData?.filter((trainee) => {
			return trainee?.uuid !== e.detail;
		});
		message.set(`Successully deleted the trainee - "${traineeName}".`);
		tableData = filteredTraineesData;
	}
	function handleGoToAddTrainee() {
		goto('/trainees/add');
	}

	function handleGoToBulkUpload() {
		goto('/trainees/bulkUpload');
	}

	async function handleFilter(event) {
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

	onDestroy(() => {
		message.set('');
	});

// ------------------------ Listing Table ---------------------
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
			key: 'username',
			name: 'Enrollment ID'
		},
		{
			key: 'courseCompletionStatus',
			name: 'Course Completion Status'
		},
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
			modal: false
		},
		{
			actionName: 'delete',
			actionIconName: 'delete',
			modal: true
		}
	];

	function handleTableAction(event) {
		const actionName = event.detail.actionName;
		const actionData = event.detail.actionData;
		message.set('');
		viewModal = event.detail.viewModal;
		tableActionName = event.detail.actionName;
		traineeName = event.detail.actionData.name;
		traineeId = event.detail.actionData.traineeId;
		traineeUsername = event.detail.actionData.username;
		traineeDeletionUUID = event.detail.actionData.uuid;

		if(actionName==='view'){
			goto(`trainees/${event.detail.actionData.uuid}/details`)
		}

		if(actionName==='edit'){
			goto(`trainees/${event.detail.actionData.uuid}/details/edit`)
		}
	}
</script>

<div class="mb-2">
	{#if $message}
		<SuccessMessage
			successMessage={$message}
			on:handleSuccessMessageClose={handleSuccesMessageClose}
		/>
	{/if}
</div>
	<!-- <div class="mt-4 mb-4 mx-6">
		<Filters
			on:handleFilters={handleFilter}
			bind:stateFilterValue
			bind:genderFilterValue
			stateFilterOptionList={stateData}
			genderFilterOptionList={genderData}
		/>
	</div> -->

<div class="mb-8 ">
    <TraineeListingOverview />
</div>
<hr class="horizontal-line my-8" />
	{#if !error}
	<div class="mt-5">
		<div class="mb-5 flex gap-2 md:flex-nowrap flex-wrap">
			<SearchBar
				on:handleSearchValue={sendSearchValueToDatatable}
				placeholder={'Search by name'}
				showSearchButton={false}
			/>
			<div class="flex gap-2 ml-auto">
				<Button btnType="primary" on:click={handleGoToAddTrainee}>+ Trainee</Button>
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
		{:else}
		<ErrorMessage error={'No trainees found'} />
	{/if}
	<div>
		</div>

{#if viewModal && tableActionName === 'delete'}
	<DeletionModalViaAPI
				id={traineeDeletionUUID}
				name={traineeName}
				code={traineeId}
				heading={`About to delete the trainee - ${traineeName}`}
				para={'Are you sure you want to delete the trainee? This action cannot be undone.'}
				endPoint={'/apis/trainees/'}
				{deleteTextConfirmation}
				on:handleCancelDeletion={handleCancel}
				on:handleDeletion={handleTraineeDeletion}
			>
				<div
					class=" flex flex-col gap-2 p-6 bg-offwhite rounded-lg mb-4 border border-gray-50 text-darkGray"
				>
					<div>
						<p class="text-sm capitalize">
							<span class="label">Name :</span>
							{traineeName}
						</p>
						<p class="text-sm"><span class="font-medium">Username : </span>{traineeUsername}</p>
					</div>
				</div>

				<div class="">
					<InputField
						label={"Type 'Please delete this trainee' to confirm"}
						placeholder={" Type 'Please delete this trainee'"}
						name={'deletion'}
						labelFontWeight={'font-normal'}
						bind:value={deleteTextInput}
						required
					/>
				</div>
	</DeletionModalViaAPI>
{/if}


