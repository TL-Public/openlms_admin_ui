<script>
	import { goto } from '$app/navigation';
	import { String_Constants } from '/src/config/constants.js';
	import { message } from '/src/routes/courses/courseStore.js';
	import { page } from '$app/stores';
	import { getCategoryName, getStatusName } from '$lib/utils/helper.js';
	import Filters from '$lib/courses/courseListing/Filters.svelte';
	import ListingTable from '$lib/components/ListingTable.svelte';
	import SearchBar from '$lib/components/SearchBar.svelte';
	import SuccessMessage from '$lib/components/SuccessMessage.svelte';
	import CourseListingOverview from '$lib/courses/courseListing/CourseListingOverview.svelte';
	import DeletionModalViaAPI from '$lib/components/DeletionModalViaAPI.svelte';
	import RadioButton from '$lib/components/RadioButton.svelte';
	import InputField from '$lib/components/InputField.svelte';
	import { tokenExpired } from '../../stores/store';
	import { onMount, onDestroy } from 'svelte';
	import Button from '$lib/components/Button.svelte';
	import FilterComponent from '$lib/components/FilterComponent.svelte';
	import ErrorMessage from '$lib/components/ErrorMessage.svelte';


	export let data;
	let { coursesData, rsetiData, stateData } = data;
	let coursesDataEmpty = coursesData?.length === 0 ? true : false;
	let error;
	let tableData = [];
	let viewModal = false;
	let searchValue = '';
	let selectedLanguage = 'en';
	let tableActionName = '';
	let courseDeletionUUID = '';
	let courseName = '';
	let courseCode = '';
	let description = '';
	let duration = null;
	let videosCount = null;
	let deleteTextInput = '';
	let chaptersCount = null;
	let deletionConfirmText = 'please delete this course';
	let deleteTextConfirmation = false;
	let filterOptions = [];

	$: if (coursesData.status == 401) {
		tokenExpired.set(true);
	}

	// Preparing the states data for the filter component
	$: {
		if (stateData) {
			let formattedFilterArray = [];
			let formattedFilterValues = stateData?.map((item) => {
				let object = {
					id: item?.uuid,
					name: item?.title
				};
				if (Number(item?.uuid) !== 0) {
					formattedFilterArray.push(object);
				}
			});
			filterOptions = [
				{
					filterName: 'States',
					filterValue: formattedFilterArray
				}
			];
		}
	}

	// Function to normalize text (removes spaces and ignores case)
	const normalizeText = (text) => text?.trim().toLowerCase().replace(/\s+/g, ' ');

	// Function to check if input matches the required text
	$: isTextValid(deleteTextInput);
	function isTextValid() {
		deleteTextConfirmation = normalizeText(deleteTextInput) === normalizeText(deletionConfirmText);
	}

	$: createTableData(coursesData, selectedLanguage);
	function createTableData() {
		let coursesArray = [];
		error = '';
		tableData = [];

		if (coursesData?.error || !coursesData || coursesData.length === 0) {
			error = 'No courses available';
			return;
		}

		coursesArray = coursesData;
		coursesArray?.forEach((course) => {
			let categoryName = '';
			let statusName = '';
			const translation = course?.translations?.find(
				(t) => t?.languageCode?.toLowerCase().trim() === selectedLanguage?.toLowerCase().trim()
			);

			if (!translation) {
				return;
			}

			if (course?.category) {
				categoryName = getCategoryName(course?.category);
			}

			if (course?.status) {
				statusName = getStatusName(course?.status);
			}

			let courseObj = {
				uuid: course?.uuid,
				name: translation?.title,
				description: translation?.description,
				duration: course?.duration,
				videosCount: course?.numberOfVideos,
				chaptersCount: course?.numberOfChapters,
				status: statusName,
				courseCode: course?.courseCode,
				category: course?.category,
				categoryName: categoryName,
				imageUrl: course?.imageUrl,
				aboutVideoUrl: translation?.aboutVideoUrl
			};

			// Include only courses that are not deleted
			// if (course?.status?.toLowerCase().trim() !== 'deleted') {
			tableData.push(courseObj);
			tableData = tableData;
			// }
		});

		return tableData;
	}

	function handleSuccesMessageClose(e) {
		message.set('');
	}

	function sendSearchValueToDatatable(e) {
		searchValue = e.detail;
	}

	function handleCancel() {
		deleteTextInput = '';
		viewModal = false;
	}

	function handleCourseDeletion(e) {
		deleteTextInput = '';
		message.set('');
		let filteredCoursesData = tableData?.filter((course) => {
			return course?.uuid !== e.detail;
		});
		message.set(`Successully deleted the course - "${courseName}".`);
		tableData = filteredCoursesData;
	}
	function handleGoToCourse() {
		goto('/courses/add');
	}

	function handleGoToBulkUpload() {
		goto(`/courses/bulkUpload`);
	}

	function handleLanguageSelectionFromRadioButton(e) {
		selectedLanguage = e.detail;
	}

	async function handleFilterApplied(event) {
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

	// -------------------- Listing Table ----------------
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
			name: 'Name',
			width: '40%'
		},
		{
			key: 'duration',
			name: 'Duration'
		},
		{
			key: 'chaptersCount',
			name: 'Chapters Count'
		},
		{
			key: 'status',
			name: 'Status',
			width: '10%'
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
			modal: false
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
		courseName = e.detail.actionData.name;
		courseCode = e.detail.actionData.courseCode;
		description = e.detail.actionData.description;
		duration = e.detail.actionData.duration;
		videosCount = e.detail.actionData.videosCount;
		chaptersCount = e.detail.actionData.chaptersCount;
		courseDeletionUUID = e.detail.actionData.uuid;

		if(actionName==='view'){
			goto(`courses/${e.detail.actionData.uuid}/details`)
		}

		if(actionName==='edit'){
			goto(`courses/${e.detail.actionData.uuid}/details/edit`)
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

	<div class="flex justify-between items-start mb-4 gap-4 flex-nowrap">
		<div>
			<h1 class="mb-2 font-semibold text-primary">Courses</h1>
			<div class="">
				<RadioButton
					languageOptionOne={'english'}
					languageCodeOne={'en'}
					languageOptionTwo={'hindi'}
					languageCodeTwo={'hi'}
					on:handleLanguageFromRadioButton={handleLanguageSelectionFromRadioButton}
				/>
			</div>
		</div>

		<FilterComponent on:filterApplied={handleFilterApplied} {filterOptions}>
			<span slot="btnContent" class="flex gap-2 items-center">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="feather feather-filter  w-4 h-4"
					><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg
				> <span class="hidden sm:block text-sm">Stats Filter</span>
			</span>
		</FilterComponent>

	</div>
	<div class="mb-8">
		<CourseListingOverview />
	</div>
	<hr class="horizontal-line my-8" />
	{#if !coursesDataEmpty}
	<div class="mt-5">
		<div class="mb-5 flex gap-2 md:flex-nowrap flex-wrap">
			<SearchBar
				on:handleSearchValue={sendSearchValueToDatatable}
				placeholder={'Search by name'}
				showSearchButton={false}
			/>
			<div class="flex gap-2 ml-auto">
				<Button btnType="secondary" on:click={handleGoToBulkUpload}>Bulk Upload</Button>
				<Button on:click={handleGoToCourse}>+ Course</Button>
			</div>
		</div>
		<ListingTable {searchValue} 
		{tableData} 
		on:tableActionClick={handleTableAction} 
		{error} 
		{tableHeaderDisplay}
		{actionConfigObject}
		rowHeight={'compact'}
		bind:sortAccordingTo/>
		</div>
		{:else}
		<ErrorMessage error={'No courses found'} />
	{/if}
	<div>
		{#if viewModal && tableActionName === 'delete'}
			<DeletionModalViaAPI
				id={courseDeletionUUID}
				name={courseName}
				code={courseCode}
				heading={`About to delete the course - ${courseName}`}
				para={'Are you sure you want to delete the course? This action cannot be undone.'}
				endPoint={'/apis/courses/delete/'}
				{deleteTextConfirmation}
				on:handleCancelDeletion={handleCancel}
				on:handleDeletion={handleCourseDeletion}
			>
				<div
					class=" flex flex-col gap-2 p-6 bg-offwhite rounded-lg mb-4 border border-gray-50 text-darkGray"
				>
					<div>
						<p class="text-sm capitalize">
							<span class="label">Title :</span>
							{courseName}
						</p>
						<p class="text-sm"><span class="font-medium">Code :</span>{courseCode}</p>
						<p class="text-sm">
							<span class="font-medium">Duration :</span>{duration}&nbsp;days
						</p>
						<p class="text-sm">
							<span class="font-medium">Chapters Count :</span>{chaptersCount}
						</p>
					</div>
					<hr class="horizontal-line my-1" />
					<div>
						<p class="text-sm">{description}</p>
					</div>
				</div>

				<div class="">
					<InputField
						label={"Type 'Please delete this course' to confirm"}
						placeholder={" Type 'Please delete this course'"}
						name={'deletion'}
						labelFontWeight={'font-normal'}
						bind:value={deleteTextInput}
						required
					/>
				</div>
			</DeletionModalViaAPI>
		{/if}
	</div>
