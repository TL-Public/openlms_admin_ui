<script>
	import { goto, invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';
	import ListingTable from '$lib/components/ListingTable.svelte';
	import SearchBar from '$lib/components/SearchBar.svelte';
	import TCListingOverview from '$lib/trainingCenters/tcListing/TCListingOverview.svelte';
	import DeletionModalViaAPI from '$lib/components/DeletionModalViaAPI.svelte';
	import InputField from '$lib/components/InputField.svelte';
	import TCDetailsFilters from '$lib/trainingCenters/tcListing/TCDetailsFilters.svelte';
	import { String_Constants } from '/src/config/constants.js';
	import { invalidate } from '$app/navigation';
	import RadioButton from '$lib/components/RadioButton.svelte';
	import SuccessMessage from '$lib/components/SuccessMessage.svelte';
	import { message } from '/src/routes/trainingCenters/tcStore.js';
	import Button from '$lib/components/Button.svelte';
	import { onDestroy } from 'svelte';
	import { userDetails } from '/src/routes/store.js';
	import { checkActionPermission, combineErrorMessages } from '$lib/utils/helper.js';
	import { moduleNames, actionNames, resourceNames } from '$lib/data.js';
	import { onMount } from 'svelte';
	import SubmissionErrorMessage from '$lib/components/SubmissionErrorMessage.svelte';

	export let data;

	let { tcData, stateData, bankData } = data;
	let tableData = [];
	let searchValue = '';
	let viewModal = false;
	let rsetiName = '';
	let rsetiId = '';
	let rsetiUUID = '';

	let email = '';
	let tableActionName = '';
	let phone = '';
	let totalCourses = '';
	let traineesGraduated = '';
	let deleteTextInput = '';
	let deletionConfirmText = 'Please delete this rseti';
	let deleteTextConfirmation = false;
	let permissionsObject = {
		allowAddition: false
	};

	let fundingFilterOptionList = [{ title: String_Constants.ALL_FUNDING_GROUPS, uuid: 0 }];
	let stateFilterValue = stateData?.[0]?.title ?? '';

	let fundingFilterValue = fundingFilterOptionList[0].title;
	let selectedLanguage = 'en';

	//primary data is the most important data on the page. Error in loading this data means, the page itself will be shown as an error page
	$: primaryDataError = tcData?.error ? tcData?.error : '';

	//data other than primary data is considered secondary errors - shown at top of the page.
	$: secondaryErrors = combineErrorMessages(stateData?.error, bankData?.error);

	function sendSearchValueToDatatable(e) {
		searchValue = e.detail;
	}

	// ... existing imports and variables

	function updateTableDataLanguage(language) {
		if (tcData.error) return;
		tableData = [];
		tcData?.forEach((tc) => {
			const fundedByBank = bankData?.find((bank) => bank.uuid === tc?.bankId)?.name || '-';
			const translation = tc?.translations?.find(
				(t) => t?.languageCode?.toLowerCase()?.trim() === language?.toLowerCase().trim()
			);

			const stateName = !stateData.error
				? stateData.find(
						(state) => parseInt(state?.extId) === tc?.stateId && state?.languageCode === language
					)?.name
				: '-';

			if (translation) {
				// Ensure we only include translations for the selected language
				tableData.push({
					uuid: tc?.uuid,
					extId: tc?.extId,
					name: translation?.name || '-',
					email: tc?.email,
					stateTitle: stateName,
					contactNo: tc?.contactNo,
					address: translation?.address || '-',
					fundedBy: fundedByBank,
					status: '-',
					totalCourses: tc?.courseCount,
					approvedOn: '-'
				});
			}
		});
	}

	function handleLanguageSelectionFromRadioButton(e) {
		selectedLanguage = e.detail;
		updateTableDataLanguage(selectedLanguage);
	}

	// Initialize table data for the default selected language
	$: updateTableDataLanguage(selectedLanguage);

	// ... remaining code

	function handleTableAction(e) {
		message.set('');
		viewModal = e.detail.viewModal;
		tableActionName = e.detail.actionName;
		rsetiName = e.detail.actionData.name;
		rsetiUUID = e.detail.actionData?.uuid;
		rsetiId = e.detail.actionData?.extId;
		email = e.detail.actionData.email;
		phone = e.detail.actionData.phone;
		totalCourses = e.detail.actionData.totalCourses;
		traineesGraduated = e.detail.actionData.traineesGraduated;

		if (tableActionName === 'view') {
			goto(`trainingCenters/${rsetiUUID}/details`);
		}
		if (tableActionName === 'edit') {
			goto(`trainingCenters/${rsetiUUID}/details/edit`);
		}
	}

	// Function to check if input matches the required text
	$: isTextValid(deleteTextInput);
	function isTextValid() {
		deleteTextConfirmation =
			deleteTextInput.trim().toLowerCase() === deletionConfirmText.trim().toLowerCase();
	}

	function handleCancel() {
		deleteTextInput = '';
		viewModal = false;
	}

	function handleCourseDeletion(e) {
		message.set('');

		// This function will run if deletion is successful
		deleteTextInput = '';

		// remove the data of the deleted entry
		tableData = tableData.filter((data) => data.uuid !== e.detail);
		const deletedTC = tcData.find((tc) => tc.uuid === e.detail);

		if (deletedTC) {
			let deletedRsetiName = '';
			if (deletedTC.translations?.length > 0) {
				deletedRsetiName = deletedTC.translations?.find(
					(item) => item.languageCode == selectedLanguage
				);
			}
			rsetiName = deletedRsetiName.name;
			message.set(`Successfully deleted the training center "${rsetiName}".`);
		}
		invalidate('rseti:all-rsetis');
	}
	let tableHeaderDisplay = [
		{
			key: 'name',
			name: 'Name',
			width: '25%'
		},
		{
			key: 'stateTitle',
			name: 'State',
			width: '25%'
		},
		{
			key: 'fundedBy',
			name: 'Funded by',
			width: '25%'
		},

		{
			key: 'totalCourses',
			name: 'Course Cnt'
		},

		{
			key: 'status',
			name: 'Status'
		}
	];

	let sortAccordingTo = {
		header: null,
		entityType: null,
		sortingOrder: null
	};

	let actionConfigObject = [];

	function handleGoToCourse() {
		goto('/trainingCenters/add');
	}

	function handleFilter(e) {}

	function handleBulkUploadTrainingCenters() {
		goto(`/trainingCenters/bulkUpload`);
	}

	function handleSuccesMessageClose(e) {
		message.set('');
	}

	onDestroy(() => {
		message.set('');
	});

	// ---------------------------------- Role based functions --------------------------------
	function roleBasedAcessSetting() {
		if (!$userDetails?.role) return;
		if (
			checkActionPermission($userDetails?.role, moduleNames?.TRAINING_CENTERS, actionNames?.DETAILS)
		) {
			let tempObj = {
				actionName: 'view',
				actionIconName: 'visibility',
				modal: false
			};
			actionConfigObject.push(tempObj);
		}

		if (
			checkActionPermission($userDetails?.role, moduleNames?.TRAINING_CENTERS, actionNames?.EDIT)
		) {
			let tempObj = {
				actionName: 'edit',
				actionIconName: 'edit',
				modal: false
			};
			actionConfigObject.push(tempObj);
		}

		if (
			checkActionPermission($userDetails?.role, moduleNames?.TRAINING_CENTERS, actionNames?.DELETE)
		) {
			let tempObj = {
				actionName: 'delete',
				actionIconName: 'delete',
				modal: true
			};
			actionConfigObject.push(tempObj);
		}

		if (checkActionPermission($userDetails?.role, moduleNames.TRAINING_CENTERS, actionNames?.ADD)) {
			permissionsObject.allowAddition = true;
		} else {
			permissionsObject.allowAddition = false;
		}
	}

	onMount(() => {
		const unsubscribe = userDetails?.subscribe((user) => {
			if (user && Object.keys(user)?.length > 0) {
				actionConfigObject=[]
				roleBasedAcessSetting(user);
			}
		});

		return () => unsubscribe(); // Cleanup subscription
	});
</script>

{#if $message}
	<SuccessMessage
		successMessage={$message}
		on:handleSuccessMessageClose={handleSuccesMessageClose}
	/>
{/if}

{#if secondaryErrors}
	<div class=" mb-4">
		<SubmissionErrorMessage errorMessage={secondaryErrors} />
	</div>
{/if}

<div class="mb-8 mt-4">
	<!-- <TCDetailsFilters
		{stateFilterOptionList}
		{fundingFilterOptionList}
		on:handleFilters={handleFilter}
		bind:stateFilterValue
		bind:fundingFilterValue
	/> -->
	<div class="mb-8">
		<h1 class="mb-2 heading-L">Training Centers</h1>
		<RadioButton
			languageOptionOne={'english'}
			languageCodeOne={'en'}
			languageOptionTwo={'hindi'}
			languageCodeTwo={'hi'}
			on:handleLanguageFromRadioButton={handleLanguageSelectionFromRadioButton}
		/>
	</div>
	<TCListingOverview />
</div>
<hr class="horizontal-line my-8" />
<div class="mt-5">
	<div class="mb-5 flex gap-2 md:flex-nowrap flex-wrap">
		<SearchBar
			on:handleSearchValue={sendSearchValueToDatatable}
			placeholder={'Search by name or state'}
			showSearchButton={false}
		/>
		{#if permissionsObject?.allowAddition}
			<div class="flex gap-2 ml-auto">
				<Button btnType="secondary" on:click={handleBulkUploadTrainingCenters}>Bulk Upload</Button>
				<Button on:click={handleGoToCourse}>+ Training Center</Button>
			</div>
		{/if}
	</div>
	<ListingTable
		{tableHeaderDisplay}
		{actionConfigObject}
		{searchValue}
		{tableData}
		on:tableActionClick={handleTableAction}
		error={primaryDataError}
		rowHeight={'compact'}
		bind:sortAccordingTo
	/>
	<!-- <ListingTable {searchValue} {tableData} on:tableActionClick={handleTableAction} /> -->
</div>
{#if viewModal}
	<DeletionModalViaAPI
		id={rsetiUUID}
		module={resourceNames.TRAINING_CENTER}
		code={rsetiId}
		heading={`About to delete the rseti - ${rsetiName}`}
		para={'Are you sure you want to delete the rseti? This action cannot be undone.'}
		endPoint={'/apis/trainingCenters/'}
		{deleteTextConfirmation}
		on:handleCancelDeletion={handleCancel}
		on:handleDeletion={handleCourseDeletion}
	>
		<hr />
		<div class=" flex flex-col gap-2 p-6 bg-white rounded-lg border border-gray-50 mb-4">
			<div>
				<p class="text-sm text-darkGray capitalize">
					<span class="label">Title : </span>
					{rsetiName}
				</p>
				<p class="text-sm text-darkGray"><span class="label">RSETI Id :</span> {rsetiId}</p>
			</div>
		</div>

		<div class="">
			<InputField
				label={"Type 'Please delete this rseti' to confirm"}
				placeholder={" Type 'Please delete this rseti'"}
				name={'deletion'}
				labelFontWeight={'font-normal'}
				bind:value={deleteTextInput}
				required
			/>
		</div>
	</DeletionModalViaAPI>
{/if}
