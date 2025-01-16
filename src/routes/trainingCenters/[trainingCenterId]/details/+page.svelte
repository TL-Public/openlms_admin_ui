<script>
	import { page } from '$app/stores';
	import { String_Constants } from '/src/config/constants.js';
	import TCDetailsOverview from '$lib/trainingCenters/tcDetails/TcDetailsOverview.svelte';
	import TcDetailsFilters from '$lib/trainingCenters/tcDetails/TcDetailsFilters.svelte';
	import SearchBar from '$lib/components/SearchBar.svelte';
	import ListingTable from '$lib/components/ListingTable.svelte';
	import DeletionModalViaAPI from '$lib/components/DeletionModalViaAPI.svelte';
	import InputField from '$lib/components/InputField.svelte';
	import { goto } from '$app/navigation';
	import SuccessMessage from '$lib/components/SuccessMessage.svelte';
	import { message } from '/src/routes/trainingCenters/tcStore.js';
	import Button from '$lib/components/Button.svelte';
	import { onDestroy } from 'svelte';

	export let data;

	let { tcCourseDetailsData, tcDetailsData, courseList, coursesData } = data;
	// table data for courses under this rseti
	let tableData = [];
	let searchValue = '';
	let viewModal = false;
	let deleteTextConfirmation = false;
	const deletionConfirmText = 'Please delete this course';
	let deleteTextInput = '';
	let courseToDelete = {};
	let langauageSelected = 'en';
	$:error = tcCourseDetailsData?.error ? tcCourseDetailsData?.error : '';
	// create a list of all courses options from the courses list
	// let rsetiFilterList = [
	// 	{ uuid: 0, title: String_Constants.ALL_COURSES },
	// 	...Object.values(courseList)
	// ];
	// let courseFilterValue = String_Constants.ALL_COURSES;

	let formObjectCourse={
		rsetiUuid:tcDetailsData?.uuid,
		tcName: tcDetailsData?.translations?.find((translation)=>translation.languageCode==='en')?.name
	}

	if (tcCourseDetailsData && tcCourseDetailsData.length > 0) {
		let dataMap = {};

		coursesData.forEach((course) => {
			dataMap[course.uuid] = {
				uuid: course.uuid,
				courseCode: course.courseCode,
				duration: course.duration,
				title: course.translations.find((translation) => translation.languageCode === 'en')?.title
			};
		});

		tcCourseDetailsData.forEach((tc) => {
			let courseKey = tc?.courseUuid?.trim()?.toLowerCase() || ''; // Normalize courseKey

			// Convert courseList to an array of values and find the matching course
			let matchingCourse = dataMap[courseKey] ? dataMap[courseKey] : '';

			let tcObj = {
				rsetiCourseUuid: tc.uuid,
				courseUuid: matchingCourse?.uuid,
				name: matchingCourse?.title || '-', // Default to "-" if title is missing
				startDate: `${tc?.startMonth ?? '-'} / ${tc?.startYear ?? '-'}`, // Default to "-" if any data is missing

				// Generate a sort key
				startDate: `${tc?.startMonth ?? '-'} / ${tc?.startYear ?? '-'}`, // Default to "-" if any data is missing
				startDateObj: tc?.startYear && tc?.startMonth ? new Date(`${tc.startYear}-${String(tc.startMonth).padStart(2, '0')}-01`).getTime() : null,
	
				endDate: `${tc?.endMonth ?? '-'} / ${tc?.endYear ?? '-'}`, // Default to "-" if any data is missing
				// status: matchingCourse?.status || '-',
				traineesGraduated: tc?.rseti?.traineesGraduated || '-',
				courseCode: matchingCourse?.courseCode ?? '-',
				rsetiUuid: tc?.rsetiUuid
			};

			tableData.push(tcObj);
		});
	}

	function sendSearchValueToDatatable(e) {
		searchValue = e.detail;
	}
	// -------------------------------Deletion functions---------------------------------
	function handleCancel() {
		deleteTextInput = '';
		viewModal = false;
	}

	function handleCourseDeletion(e) {
		message.set('');
		deleteTextInput = '';
		tableData = tableData.filter((data) => data.rsetiCourseUuid !== courseToDelete.rsetiCourseUuid);
		message.set(`Successfully deleted the course - "${courseToDelete.courseName}".`);
	}

	// Function to check if input matches the required text
	$: isTextValid(deleteTextInput);
	function isTextValid() {
		deleteTextConfirmation =
			deleteTextInput.trim().toLowerCase() === deletionConfirmText.trim().toLowerCase();
	}

	// ------------------------------- Courses Table Config Objects-------------------
	let sortAccordingTo = {
		header: null,
		entityType: null,
		sortingOrder: null
	};


	let tableHeaderDisplay = [
		{
			key: 'name',
			name: 'Name'
		},
		{
			key: 'traineesGraduated',
			name: 'Number of Students'
		},
		{
			key: 'startDate',
			sortKey: 'startDateObj',
			name: 'Planned Date'
		}
	];

	let actionConfigObject = [
		{
			actionName: 'view',
			actionIconName: 'visibility',
			modal: true
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
		message.set('');
		let data = event.detail?.actionData;
		const { actionName, actionData } = event.detail;
		
		if(actionName==='view'){
			goto(`/trainingCenters/${data.rsetiUuid}/details/courseDetails?data=${encodeURIComponent(JSON.stringify(actionData))}`)}

		if(actionName==='edit'){
			let formObject={
				...actionData,
				...formObjectCourse
			}

			goto(`/trainingCenters/${data.rsetiUuid}/details/courseEdit?data=${encodeURIComponent(JSON.stringify(formObject))}`)}

		if (event.detail?.actionName === 'delete') {
			viewModal = true;
			courseToDelete = {
				rsetiUuid: data.rsetiUuid,
				rsetiCourseUuid: data.rsetiCourseUuid,
				courseCode: data.courseCode,
				courseUuid: data.uuid,
				courseName: data.name,
				startDate: data.startDate,
				endDate: data.endDate
			};
		}
	}

	// -------------------------- General Functions------------------
	function handleBulkUploadCoursesUnderTC() {
		goto(`/trainingCenters/${tcDetailsData?.uuid}/details/courseBulkUpload`);
	}
	function handleSuccesMessageClose(e) {
		message.set('');
	}

	async function handleCourseFilter(event) {
		// TODO write logic for filtering statistics
	}

	onDestroy(()=>{
		message.set('')
	})

</script>

{#if $message}
	<SuccessMessage
		successMessage={$message}
		on:handleSuccessMessageClose={handleSuccesMessageClose}
	/>
{/if}

<!-- <div class="mt-4 mb-4">
	<TcDetailsFilters
		courseFilterOptionList={rsetiFilterList}
		on:handleFilters={handleCourseFilter}
		bind:courseFilterValue
	/>
</div> -->
<div class=" mb-4">
	<TCDetailsOverview {tcDetailsData} bind:langauageSelected />
</div>
<div class=" mb-4">
	<h2 class="text-darkGray font-semibold">Courses in Training Center ({tableData?.length ?? 0})</h2>
	<div class="mt-5">
		<div class="mb-5 flex gap-2 md:flex-nowrap flex-wrap">
			<SearchBar
				on:handleSearchValue={sendSearchValueToDatatable}
				placeholder={'Search by course'}
				showSearchButton={false}
			/>
			<div class="flex gap-2 ml-auto md:flex-nowrap flex-wrap">
				<Button btnType="secondary" on:click={handleBulkUploadCoursesUnderTC}>Bulk Upload Courses</Button>
				<Button
				on:click={() =>
					goto(
						`/trainingCenters/${tcDetailsData?.uuid}/details/courseAdd?data=` +
							encodeURIComponent(JSON.stringify(formObjectCourse))
					)}
			>
				+ Add course
			</Button>
			</div>
		</div>
	</div>

	<ListingTable
		{tableHeaderDisplay}
		{actionConfigObject}
		{searchValue}
		{tableData}
		on:tableActionClick={handleTableAction}
		{error} 
		rowHeight={'compact'}
		bind:sortAccordingTo
	/>
</div>
{#if viewModal}
	<DeletionModalViaAPI
		id={''}
		name={courseToDelete.courseName}
		code={courseToDelete.courseCode}
		heading={`About to delete the course - ${courseToDelete.courseName}`}
		para={'Are you sure you want to delete the course? This action cannot be undone.'}
		endPoint={`/apis/trainingCenters/${courseToDelete.rsetiUuid}/courses/${courseToDelete.rsetiCourseUuid}`}
		{deleteTextConfirmation}
		on:handleCancelDeletion={handleCancel}
		on:handleDeletion={handleCourseDeletion}
	>
		<div class=" flex flex-col gap-2 p-6 bg-white rounded-lg mb-2">
			<div>
				<p class="text-sm text-darkGray capitalize">Title : {courseToDelete.courseName}</p>
				<p class="text-sm text-darkGray">ID : {courseToDelete.courseCode}</p>
				<p class="text-sm text-darkGray">Start Date : {courseToDelete.startDate}</p>
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
