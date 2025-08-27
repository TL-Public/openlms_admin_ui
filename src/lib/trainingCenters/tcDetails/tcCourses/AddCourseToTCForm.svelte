<script>
	import InputField from '$lib/components/InputField.svelte';
	import Filter from '$lib/components/Filter.svelte';
	import { page } from '$app/stores';
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { message } from '/src/routes/trainingCenters/tcStore.js';
	import DropDown from '$lib/components/DropDown.svelte';
	import Button from '$lib/components/Button.svelte';
	import SubmissionErrorMessage from '$lib/components/SubmissionErrorMessage.svelte';
	import { months } from '$lib/data.js';
	import { handleRedirection } from '$lib/utils/helper.js';
	import ErrorMessage from '$lib/components/ErrorMessage.svelte';
	import {showLoadingSpinner} from '/src/routes/store.js'
	import { onDestroy } from 'svelte';
	import { error } from '@sveltejs/kit';
	import SearchableComboBox from '$lib/components/SearchableComboBox.svelte';


	export let data;
	export let method = 'POST';
	const { courseList } = data;
	let tcDataJSON = $page.url.searchParams.get('data');
	let tcData = JSON.parse(tcDataJSON);
	let isSubmitting = false;
	let creationError = '';
	const url = $page.url;

	let errorMessage = '';
	let selectedCourse = { name: tcData?.name || '', uuid: tcData?.courseUuid || '' };
	let validationErrors = { course: false };
	let validationMessage = { course: 'Please select a course' };

	let startDateOfCourse = normalizeDate(tcData?.startDate) || '';
	let endDateOfCourse = normalizeDate(tcData?.endDate) || '';

	let courseOptionsList =
		!courseList.error && Object.values(courseList)?.length > 0
			? Object.values(courseList).map((item) => {
					return { ...item, id: item.uuid };
				})
			: [];

	$: primaryDataError = tcDataJSON
		? ''
		: 'Something went wrong. Please go back and select the Training center again';

		$: if (isSubmitting === true ){
		showLoadingSpinner.set(true)
		} else {
		showLoadingSpinner.set(false)
		}


	function normalizeDate(dateString) {
		if (!dateString || typeof dateString !== 'string') return '';
		const [month, year] = dateString.split(' / ');
		return `${year}-${month.padStart(2, '0')}`;
	}
	function handleGoBack() {
		window.history.back();
	}

	function handleDropDown(e) {
		selectedCourse.uuid = e.detail.selectedItemId;
		selectedCourse.name = e.detail.selectedItemName;
	}
	function handleClearCourseSelection(e) {
		selectedCourse.uuid = '';
		selectedCourse.name = '';
	}

	function validateDropdownValues() {
		if (!selectedCourse.uuid) {
			validationErrors.course = true;
			return false;
		}
		return true;
	}

	function handleEnhance({ formElement, formData, action, cancel, submitter }) {
		let postData = {};
		errorMessage = '';
		const { search } = action;
		const isValid = validateDropdownValues();

		if (search == '?/final') {
			isSubmitting = true;
		}

		if (!isValid) {
			isSubmitting=false
			cancel();
			return;
		}

		const startDate = new Date(startDateOfCourse);
		const endDate = new Date(endDateOfCourse);
		if (endDate < startDate) {
			errorMessage = 'End date cannot be earlier than the start date.';
			isSubmitting=false
			cancel();
			return;
		}
		// POST expects data as an array of object
		if (method === 'POST') {
			postData = [
				{
					rsetiUuid: tcData.uuid,
					courseUuid: selectedCourse.uuid,
					startYear: startDate.getFullYear(),
					startMonth: startDate.getMonth() + 1, // getMonth() is zero-based
					endYear: endDate.getFullYear(),
					endMonth: endDate.getMonth() + 1
				}
			];
		}

		// PUT expects data as a single object
		if (method === 'PUT') {
			postData = {
				courseUuid: selectedCourse.uuid,
				startYear: startDate.getFullYear(),
				startMonth: startDate.getMonth() + 1, // getMonth() is zero-based
				endYear: endDate.getFullYear(),
				endMonth: endDate.getMonth() + 1
			};
		}

		formData.set('method', method);
		if (method === 'PUT') {
			formData.set('uuid', tcData.rsetiCourseUuid);
		}
		formData.set('postData', JSON.stringify(postData));
		formData.set('rsetiUuid', tcData.rsetiUuid);

		return async ({ result, update }) => {
			await result;
			if (search == '?/final') {
				isSubmitting = true;
				const courseName = selectedCourse.name;
				const rsetiName = tcData?.tcName;
				if (result.type == 'success') {
					if (method === 'POST') {
						goto(`/trainingCenters/${result?.data?.resultObject[0]?.rsetiUuid}/details`, {
							invalidateAll: true
						});
						message.set(`Successfully added the course "${courseName}" to "${rsetiName}".`);
					}
					if (method === 'PUT') {
						goto(`/trainingCenters/${result?.data?.resultObject?.rsetiUuid}/details`, {
							invalidateAll: true
						});
						message.set(`Successfully edited the course "${courseName}" in "${rsetiName}".`);
					}
				}

				if (result.type == 'failure') {
					const errorMsg =
						method === 'POST'
							? `Failed to add the course "${courseName}" to "${rsetiName}". Please try again.`
							: `Failed to update the course "${courseName}" in "${rsetiName}". Please try again.`;
					creationError = result?.data?.error ? result?.data?.error : errorMsg;

					if (result?.status === 401) {
						handleRedirection(result.status, url.pathname, url.search);
					} else {
						//handle other errors
					}

					isSubmitting = false;

				}
			}
		};
	}

	onDestroy(()=>{
		showLoadingSpinner.set(false)
	})
</script>

<div class="">
	{#if creationError}
		<div class="mb-2">
			<SubmissionErrorMessage errorMessage={creationError} />
		</div>
	{/if}

	{#if primaryDataError}
		<div class=" mb-4">
			<ErrorMessage error={primaryDataError} />
		</div>
	{:else}
		<form
			method="post"
			action="/coursesAdd"
			class="w-full md:w-1/2 form"
			use:enhance={handleEnhance}
		>
			<h1 class="mb-2 heading-L">
				{method === 'POST' ? 'Add Course to Training Center' : 'Edit course of Training Center'}
			</h1>
			<hr class="horizontal-line mt-1 mb-4" />

			<div class=" flex flex-col gap-4">
				<h2 class=" heading-L">
					Training Center: {tcData?.tcName}
				</h2>
				<!-- <DropDown
					bind:selectedItemId={selectedCourse.uuid}
					bind:selectedItemName={selectedCourse.name}
					on:handleDispatchFilterData={handleDropDown}
					on:handleClearSelection={handleClearCourseSelection}
					options={courseOptionsList}
					type={'categoryDropdown'}
					title={'Select Course'}
					validationErrors={validationErrors.course ? validationMessage.course : ''}
				/> -->
	
					<SearchableComboBox
							options={courseOptionsList}
							label={'Select Course'}
							filterCategory={'courseListing'}
							placeholder={'Select course'}
							selectedItemId={selectedCourse.uuid}
							selectedItemName={selectedCourse.name}
							on:handleDispatchComboBoxData={handleDropDown}
							on:handleDispatchFilterData={handleClearCourseSelection}
							validationErrors={validationErrors.course ? validationMessage.course : ''}
						/>

				<InputField
					label={'Start Date'}
					type="month"
					name={'startDate'}
					required
					bind:value={startDateOfCourse}
				/>

				<InputField
					label={'End Date'}
					type="month"
					name={'endDate'}
					required
					bind:value={endDateOfCourse}
				/>
				{#if errorMessage}
					<p class="text-red-500 text-sm">{errorMessage}</p>
				{/if}
			</div>
			<div class="flex justify-end gap-4 mt-8">
				<Button
					type="button"
					btnType="secondary"
					customClass={'inline-block w-full bp-420px:w-fit flex justify-center'}
					disabled={isSubmitting}
					on:click={handleGoBack}>{'Cancel'}</Button
				>
				<Button
					btnType="primary"
					type="submit"
					customClass={'inline-block w-full bp-420px:w-fit flex justify-center'}
					disabled={isSubmitting}
					formaction={'?/final'}>{'Submit'}</Button
				>
			</div>
		</form>
	{/if}
</div>
