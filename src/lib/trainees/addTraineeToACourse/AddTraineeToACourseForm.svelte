<script>
	import InputField from '$lib/components/InputField.svelte';
	import Filter from '$lib/components/Filter.svelte';
	import { page } from '$app/stores';
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { message } from '/src/routes/trainees/traineeStore.js';
	import Button from '$lib/components/Button.svelte';
	import SubmissionErrorMessage from '$lib/components/SubmissionErrorMessage.svelte';
	import SearchableComboBox from '$lib/components/SearchableComboBox.svelte';
	import { handleRedirection } from '$lib/utils/helper.js';
	import { getErrorMessage } from '$lib/utils/helper.js';
	import { resourceNames, userActions } from '$lib/data.js';
	import { onDestroy } from 'svelte';
	import {showLoadingSpinner} from '/src/routes/store.js'

	export let method = 'POST';
	export let rsetiList = [];
	export let coursesData = [];
	export let traineeDetailsData = {};

	export let selectedRsetiName = '';
	export let selectedRsetiUuid = '';
	export let selectedCourseName = '';
	export let selectedCourseUuid = '';
	export let coursesList = [];

	let isSubmitting = false;
	let creationError = '';
	let errorMessage = '';
	let validationErrors = { rseti: false, course: false };
	let validationMessage = {
		course: 'Please select a course',
		rseti: 'Please select an RSETI'
	};
	let traineeUuid = traineeDetailsData?.uuid || '';
	const url = $page.url;

	// Prepare payload for submission
	export let dataToSend = {
		traineeUuid,
		enrollmentDate: ''
	};

	$: if (method === 'PUT') {
		dataToSend.enrollmentDate = dataToSend.enrollmentDate ? dataToSend.enrollmentDate : '';
	}

	$: if (isSubmitting === true){
		showLoadingSpinner.set(true)
	} else {
		showLoadingSpinner.set(false)
	}

	// Fetch courses when RSETI is selected
	$: if (selectedRsetiUuid && method !== 'PUT') {
		handleClearCourseSelection();
		coursesList = [];
		validationErrors = {};
		fetchCourses(selectedRsetiUuid);
	}

	async function fetchCourses(selectedRsetiUuid) {
		try {
			errorMessage = '';
			isSubmitting = true;

			const response = await fetch(`/apis/trainingCenters/${selectedRsetiUuid}/courses`, {
				method: 'GET',
				headers: { 'Content-Type': 'application/json' }
			});

			if (!response.ok) {
				const { errorMsg, redirectUser } = getErrorMessage({
					status: response?.status,
					action: userActions.LIST,
					module: resourceNames.TRAINING_CENTER_COURSE
				});

				if (redirectUser) {
					handleRedirection(response.status, $page.url.pathname, $page.url.search);
				}

				validationErrors.course = errorMsg;
				return;
			}

			const result = await response.json();
			coursesList = result?.map((course) => formatCourse(course)) || [];

			if (coursesList?.length === 0) {
				validationErrors.course = `This RSETI doesn't have any courses added.`;
			}
		} catch (error) {
			validationErrors.course = error.message || 'An error occurred while fetching courses.';
		} finally {
			isSubmitting = false;
		}
	}

	function formatCourse(course) {
		const courseDetails = coursesData.find((c) => c.uuid === course.courseUuid);
		const englishTranslation = courseDetails?.translations.find((t) => t.languageCode === 'en');
		const title = englishTranslation?.title || 'No English Title';

		const formatter = new Intl.DateTimeFormat('en', { month: 'short', year: '2-digit' });
		const from = formatter.format(new Date(course.startYear, course.startMonth - 1));
		const to = formatter.format(new Date(course.endYear, course.endMonth - 1));

		return {
			id: course.uuid,
			title: `${title} (${from} - ${to})`
		};
	}

	function handleClearCourseSelection() {
		selectedCourseName = null;
		selectedCourseUuid = null;
		validationErrors.course = '';
		errorMessage = '';
	}

	function handleClearRsetiSelection() {
		selectedRsetiUuid = '';
		selectedRsetiName = '';
		selectedCourseName = '';
		selectedCourseUuid = '';
		validationErrors = { rseti: false, course: false };
		coursesList = [];
		errorMessage = '';
	}

	function validateForm() {
		validationErrors = {
			rseti: !selectedRsetiUuid,
			course: !selectedCourseUuid
		};
		return !validationErrors.rseti && !validationErrors.course;
	}

	function handleEnhance({ formElement, formData, action, cancel, submitter }) {
		let postData = {};
		errorMessage=''
		const { search } = action;

		if (search == '?/final') {
			isSubmitting = true;
		}

		if (!validateForm()) {
			isSubmitting=false
			cancel();
			return;
		}

		postData = {
			traineeUuid: traineeUuid,
			enrollmentDate: dataToSend.enrollmentDate
		};

		formData.set('method', method);
		formData.set('uuid', selectedCourseUuid);
		formData.set('postData', JSON.stringify(postData));

		return async ({ result, update }) => {
			await result;
			if (search == '?/final') {
				isSubmitting = true;

				if (result.type == 'success') {
					if (method === 'POST') {
						goto(`/trainees/${result?.data?.resultObject?.traineeUuid}/details`, {
							invalidateAll: true
						});
						message.set(
							`Successfully enrolled ${traineeDetailsData?.candidateName} in "${selectedCourseName}" at "${selectedRsetiName}".`
						);
					}
					if (method === 'PUT') {
						goto(`/trainees/${result?.data?.resultObject?.traineeUuid}/details`, {
							invalidateAll: true
						});
						message.set(
							`Successfully updated the course details for ${traineeDetailsData?.candidateName}, enrolled in "${selectedCourseName}" at "${selectedRsetiName}".`
						);
					}
				}

				if (result.type == 'failure') {
					const errorMsg =
						method === 'POST'
							? `Failed to enroll ${traineeDetailsData?.candidateName} in "${selectedCourseName}" at"${selectedRsetiName}". Please try again.`
							: `Failed to update the course details of ${traineeDetailsData?.candidateName} in "${selectedCourseName}" at "${selectedRsetiName}". Please try again.`;

					isSubmitting = false;

					if (result?.data?.error) {
						creationError = result?.data?.error ? result?.data?.error : errorMsg;
						// all errors except 401 are handled in page.server.js - which are shown as message at top of the page.
						if (result?.status === 401) {
							handleRedirection(result.status, url.pathname, url.search);
						}
					}
				}
			}
		};
	}

	function formatDate(date) {
		if (!date) return '';
		const year = date.getFullYear().toString().slice(-2); // Extract last two digits of the year
		const month = String(date.getMonth() + 1).padStart(2, '0'); // Month as 2-digit
		const day = String(date.getDate()).padStart(2, '0'); // Day as 2-digit
		return `${year}-${month}-${day}`;
	}

	function handleDateChange(event) {
		const selectedDate = new Date(event.target.value);
		dataToSend.enrollmentDate = formatDate(selectedDate);
	}

	function handleRsetiDropdown(e) {
		selectedRsetiUuid = e.detail.selectedItemId;
		selectedRsetiName = e.detail.selectedItemName;
	}

	function handleCourseDropdown(e) {
		selectedCourseUuid = e.detail.selectedItemId;
		selectedCourseName = e.detail.selectedItemName;
	}

	onDestroy(()=>{
		showLoadingSpinner.set(false)
	})
</script>

<div>
	{#if creationError}
		<div class="mb-2">
			<SubmissionErrorMessage errorMessage={creationError} />
		</div>
	{/if}

	<form method="post" action="/coursesAdd" class="w-full md:w-1/2 form" use:enhance={handleEnhance}>
		<h1 class="mb-2 heading-L">
			{method === 'POST' ? 'Enroll Trainee in a Course' : 'Update Trainee Course Details'}
		</h1>
		<hr class="horizontal-line mt-1 mb-4" />
		<div class="space-y-6">
			<h2 class="mb-4 heading-L">
				Trainee Name: {traineeDetailsData?.candidateName || '-'}
			</h2>

			<InputField
				label={'Enrollment Date'}
				placeholder={'Enter Enrollemnt Date'}
				name={'enrollmentDate'}
				type="date"
				required
				bind:value={dataToSend.enrollmentDate}
				on:change={handleDateChange}
			/>

			<SearchableComboBox
				options={rsetiList}
				filterCategory="rsetiListing"
				placeholder="Select an RSETI"
				validationErrors={validationErrors.rseti ? validationMessage.rseti : ''}
				selectedItemName={selectedRsetiName}
				selectedItemId={selectedRsetiUuid}
				disabled={method === 'PUT'}
				on:handleDispatchFilterData={handleClearRsetiSelection}
				on:handleDispatchComboBoxData={handleRsetiDropdown}
			/>

			<SearchableComboBox
				options={coursesList}
				filterCategory="courseListing"
				placeholder="Select a Course"
				validationErrors={validationErrors.course ? validationMessage.course : ''}
				selectedItemName={selectedCourseName}
				selectedItemId={selectedCourseUuid}
				disabled={!selectedRsetiUuid || method === 'PUT'}
				on:handleDispatchFilterData={handleClearCourseSelection}
				on:handleDispatchComboBoxData={handleCourseDropdown}

			/>
		</div>

		<div class="flex justify-end gap-4 mt-8 flex-wrap">
			<Button
				type="button"
				btnType="secondary"
				on:click={() => window.history.back()}
				disabled={isSubmitting}>{'Cancel'}</Button
			>
			<Button btnType="primary" type="submit" disabled={isSubmitting} formaction="?/final"
				>{'Submit'}</Button
			>
		</div>
	</form>
</div>
