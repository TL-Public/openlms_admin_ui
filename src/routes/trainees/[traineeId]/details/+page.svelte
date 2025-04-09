<script>
	import { String_Constants } from '/src/config/constants.js';
	import { message } from '/src/routes/trainees/traineeStore.js';
	import { onDestroy } from 'svelte';
	import { goto } from '$app/navigation';
	import ListingTable from '$lib/components/ListingTable.svelte';
	import TraineeStatsFilter from '$lib/trainees/traineeDetails/TraineeStatsFilter.svelte';
	import SearchBar from '$lib/components/SearchBar.svelte';
	import TraineeDetailsOverview from '$lib/trainees/traineeDetails/TraineeDetailsOverview.svelte';
	import SuccessMessage from '$lib/components/SuccessMessage.svelte';
	import Button from '$lib/components/Button.svelte';
	import ErrorMessage from '$lib/components/ErrorMessage.svelte';
	import DeletionModalViaAPI from '$lib/components/DeletionModalViaAPI.svelte';
	import InputField from '$lib/components/InputField.svelte';
	import {getStatusName } from '$lib/utils/helper.js';


	export let data;

	let { coursesData, traineeDetailsData, rsetiData } = data;
	let tableData = []
	let searchValue = ''
	let tableActionName = ''
	let courseFilterValue = String_Constants.ALL_COURSES;
	let deleteTextInput = '';
	let deletionConfirmText = 'please delete this course';
	let deleteTextConfirmation = false;
	let courseFilterList = [];
	let rsetiCourseDeletionUuid = '';
	let rsetiCourseNameForDeletion = '';
	let rsetiNameForDeletion = '';
	let viewModal=false;
	let isLoading = true;
	$: error = traineeDetailsData?.error ? true : false;
			
	$: if (traineeDetailsData.status == 401) {
		tokenExpired.set(true);
	}

	// Function to normalize text (removes spaces and ignores case)
	const normalizeText = (text) => text?.trim().toLowerCase().replace(/\s+/g, ' ');

	// Function to check if input matches the required text
	$: isTextValid(deleteTextInput);
	function isTextValid() {
	deleteTextConfirmation = normalizeText(deleteTextInput) === normalizeText(deletionConfirmText);
	}

	$:if(!coursesData?.error){
		courseFilterList = [
    { uuid: 0, title: courseFilterValue },
    ...coursesData?.map(course => {
        const englishTranslation = course?.translations?.find(t => t?.languageCode === "en");
        return {
            uuid: course?.uuid,
            title: englishTranslation ? englishTranslation.title : "No English Title"
        };
    })
	];
	}

$:console.log('tableData', tableData)

$:{
	if (!error && !rsetiData.error && !coursesData.error) {
		
		const rsetiMap = new Map(
		rsetiData?.map(rseti => [
        rseti.uuid,
        Array.isArray(rseti?.translations)
					? rseti?.translations.find(t => t?.languageCode === 'en')?.name || 'Unknown RSETI'
					: 'Unknown RSETI',
    ])
    );

    	const courseMap = new Map(
        coursesData?.map(course => [
        course.uuid,
        Array.isArray(course?.translations)
            ? course?.translations?.find(t => t?.languageCode === 'en')?.title || 'Unknown Course'
            : 'Unknown Course',
    ])
    );

    // Check if traineeDetailsData contains traineeRsetis and process accordingly
    tableData = traineeDetailsData?.traineeRsetis?.map(rseti => {
        const rsetiName = rsetiMap.get(rseti?.rsetiUuid) || 'Unknown RSETI';
        const courseName = courseMap.get(rseti?.courseUuid) || 'Unknown Course';
        return {
            uuid: traineeDetailsData?.uuid,
            name: traineeDetailsData?.candidateName,
            traineeId: traineeDetailsData?.enrollId,
            username: traineeDetailsData?.username,
            rsetiName,
            courseName,
			rsetiUuid: rseti?.rsetiUuid,
			rsetiCourseUuid: rseti?.rsetiCourseUuid,
            enrolledOn: rseti?.enrolledOn, 
			enrolledOnDate: new Date(rseti?.enrolledOn) || null,
			status: getStatusName(rseti?.status),
        };
    }) || [];
	tableData=tableData
	isLoading = false;
	}
}
	


	

	async function handleCourseFilter(event) {
		// extracting the filter values from the event
		let courseFilter = event.detail.courseFilter;

		let courses = [];
		
	}

	function sendSearchValueToDatatable(e) {
		searchValue = e.detail;
	}

		
	// Courses Table Config Objects

		let sortAccordingTo = {
		header: null,
		entityType: null,
		sortingOrder: null
	    };


		let tableHeaderDisplay = [
		{
			key: 'courseName',
			name: 'course Name',
			width:'40%'
		},
		{
			key: 'rsetiName',
			name: 'RSETI',
			width:'30%'
		},
		{
			key: 'enrolledOn',
			name: 'Enrolled On',
			sortKey: 'enrolledOnDate',
		},
		{
			key: 'status',
			name: 'Status',
			width:'10%'
		},
		
	];

	let actionConfigObject = [
		{
			actionName: 'edit',
			actionIconName: 'edit',
			modal:false,
		},
		{
			actionName: 'delete',
			actionIconName: 'delete',
			modal:true,
			
		}
	];

	function handleTableAction(e){
		const actionName = e.detail.actionName;
		const actionData = e.detail.actionData;

		message.set('');
		viewModal = e.detail.viewModal;
		tableActionName = e.detail.actionName;
		rsetiCourseNameForDeletion = e.detail.actionData.courseName;
		let enrolledOn = e.detail.actionData.enrolledOn;
		let rsetiCourseUuid = e.detail.actionData.rsetiCourseUuid;
		let rsetiUuid = e.detail.actionData.rsetiUuid;
		rsetiCourseDeletionUuid = e.detail.actionData.rsetiCourseUuid;
		rsetiNameForDeletion = e.detail.actionData.rsetiName;

		let data = {
			traineeUuid: traineeDetailsData.uuid,
			rsetiUuid: rsetiUuid,
			rsetiCourseUuid: rsetiCourseUuid,
			// Ensure that enrolledOn is passed as yyyy-mm-dd string
			enrolledOn: formatDate(enrolledOn),
			rsetiName: rsetiNameForDeletion,
			rsetiCourseName: rsetiCourseNameForDeletion,
			method:"PUT"
		}

		if (actionName === 'edit') {
    	const queryString = new URLSearchParams({ data: JSON.stringify(data) }).toString();
    	goto(`/trainees/${traineeDetailsData?.uuid}/details/courseEdit?${queryString}`);
	}
		
	}

	function handleCancel() {
		deleteTextInput = '';
		viewModal = false;
	}

	function handleCourseDeletion(e) {
		deleteTextInput = '';
		message.set('');
		let filteredCoursesData = tableData?.filter((tableData) => {
			return tableData?.rsetiCourseUuid !== rsetiCourseDeletionUuid;
		});
		message.set(`Successully deleted the course - "${rsetiCourseNameForDeletion}".`);
		tableData = filteredCoursesData;
	}

	function handleSuccesMessageClose(e) {
		message.set('');
	}

	function handleGoToCourseAdd() {
		goto(`/trainees/${traineeDetailsData?.uuid}/details/courseAdd`);
	}

	onDestroy(() => {
		message.set('');
	});

	function formatDate(dateString) {
    if (!dateString) return ''; // Ensure the input is valid
    const date = new Date(dateString); // Convert the string to a Date object
    const day = String(date.getDate()).padStart(2, '0'); // Extract the day
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Extract the month
    const year = date.getFullYear(); // Extract the full year
    return `${year}-${month}-${day}`; // Return in yyyy-mm-dd format
}
</script>
{#if $message}
	<SuccessMessage
		successMessage={$message}
		on:handleSuccessMessageClose={handleSuccesMessageClose}
	/>
{/if}
<!-- <div class="mt-2 mb-4 mx-6">
	<TraineeStatsFilter 
	courseFilterOptionList={courseFilterList}
	on:handleFilters={handleCourseFilter}
	bind:courseFilterValue />
</div> -->

{#if !error }
<div class=" mb-4">
	<TraineeDetailsOverview {traineeDetailsData}/>
</div>
<div class="mb-4">
	<h2 class="heading-L mb-4">Courses ({tableData?.length})</h2>
	<div class="mt-5">
		<div class="mb-5 flex gap-2 md:flex-nowrap flex-wrap">
			<SearchBar
			on:handleSearchValue={sendSearchValueToDatatable}
			placeholder={'Search by name'}
			showSearchButton={false}
			/>
			<div class="flex gap-2 ml-auto">
				<Button on:click={handleGoToCourseAdd}>+ Course</Button>
			</div>
		</div>
	</div>
	{#if !isLoading}
		<ListingTable
			{tableHeaderDisplay}
			{actionConfigObject}
			{searchValue}
			{tableData}
			on:tableActionClick={handleTableAction}
			error={error || rsetiData.error || coursesData.error}
			rowHeight={'compact'}
			bind:sortAccordingTo
		/>
		{:else}
			<ErrorMessage error={'Failed to fetch courses'} />
		{/if}
</div>
{:else}
	<ErrorMessage error={'Failed to fetch trainee details'} />
	{/if}

	<div>
		{#if  tableActionName === 'delete' && viewModal}
			<DeletionModalViaAPI
				name={rsetiCourseNameForDeletion}
				queryParams={`?rsetiCourseUuid=${rsetiCourseDeletionUuid}`}
				heading={`About to delete the course of the trainee ${traineeDetailsData?.candidateName} - "${rsetiCourseNameForDeletion}"`}
				para={'Are you sure you want to delete the course? This action cannot be undone.'}
				endPoint={`/apis/trainees/${traineeDetailsData?.uuid}/courseDeletion`}
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
							{rsetiCourseNameForDeletion}
						</p>
						<p class="text-sm"><span class="font-medium">Rseti :</span>{rsetiNameForDeletion}</p>
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
