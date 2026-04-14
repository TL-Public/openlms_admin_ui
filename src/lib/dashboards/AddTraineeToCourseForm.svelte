<script>
	import { onMount, onDestroy, tick } from 'svelte';
	import { createEventDispatcher } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	import Button from '$lib/components/Button.svelte';
	import LineLoader from '$lib/components/LineLoader.svelte';
	import DeletionErrorMessage from '$lib/components/DeletionErrorMessage.svelte';
	import MultiSelect from '$lib/components/MultiSelect.svelte';
	import { getErrorMessage } from '$lib/utils/helper.js';
	import { resourceNames, userActions } from '$lib/data.js';

	export let rsetiUuid = '';
	export let rsetiCourseUuid = '';
	export let courseTitle = '';
	export let rsetiTitle = '';
	export let traineesList = [];

	const dispatch = createEventDispatcher();

	let selectedTraineeUuids = [];
	let validationErrors = {};
	let isSubmitting = false;
	let errorMessage = '';

	$: filteredTraineesList = (traineesList ?? [])
		.filter((t) => !t?.traineeRsetis?.some((r) => r?.rsetiCourseUuid === rsetiCourseUuid))
		.map((t) => ({
			id: t.uuid,
			name: t.candidateName ?? t.username ?? 'Unnamed Trainee'
		}));

	// ------------------- Submit Handler -------------------

	function handleMultiSelectChange(e) {
		selectedTraineeUuids = e.detail.selectedValues;
		validationErrors = {};
	}
    $:console.log('selectedTraineeUuids', selectedTraineeUuids);

	async function handleSubmit() {
		if (selectedTraineeUuids.length === 0) {
			validationErrors = { selectedTrainee: 'Please select at least one trainee.' };
			return;
		}

		if (filteredTraineesList.length === 0) {
			errorMessage = 'No available trainees to add to this course.';
			return;
		}

		isSubmitting = true;
		errorMessage = '';
		validationErrors = {};

		try {
			const response = await fetch(`/apis/trainingCenters/${rsetiUuid}/courses/${rsetiCourseUuid}/trainees`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify( [...selectedTraineeUuids] )
			});


			if (!response.ok) {
				const { errorMsg, redirectUser } = getErrorMessage({
					status: response.status,
					action: userActions.CREATE,
					module: resourceNames.TRAINEE
				});

				if (redirectUser) {
					const fromUrl = $page.url.pathname + $page.url.search;
					goto(`/login?redirectTo=${fromUrl}`);
					return;
				}

				errorMessage = errorMsg;
				return;
			}

			const result = await response.json();
            console.log('result', result)
			if (result.error) {
				errorMessage = result.message || 'Failed to add trainees. Please try again.';
				return;
			}

			dispatch('traineeAdded', { traineeUuids: selectedTraineeUuids, response: result });
			handleCancel();
		} catch (error) {
			console.error('Error:', error);
			errorMessage = 'Something went wrong. Please try again.';
		} finally {
			isSubmitting = false;
		}
	}

	// ------------------- Lifecycyle Hooks -------------------
	onMount(() => {
		document.body.style.overflow = 'hidden';
	});

	onDestroy(() => {
		document.body.style.overflow = '';
	});

	// --------------------- General --------------------
	function handleOutsideClick() {
		// Prevents any action when clicking outside the modal
		return;
	}

	function handleCancel() {
		dispatch('handleCancelSubmission');
	}
</script>

<div class="relative z-[90]" aria-labelledby="modal-title" role="dialog" aria-modal="true">
	<div
		class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity pointer-events-none"
		aria-hidden="true"
		on:click|stopPropagation={handleOutsideClick}
	></div>

	<div class="fixed inset-0 z-10 w-screen overflow-y-auto" id="form">
		<div class="flex min-h-full justify-center p-4 text-center items-center sm:p-0">
			<div
				class="relative transform overflow-visible rounded-lg bg-gray-10 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6"
			>
				<div class="pb-2">
					{#if isSubmitting}
						<LineLoader />
					{/if}
				</div>

				{#if errorMessage}
					<div class="mb-4">
						<DeletionErrorMessage {errorMessage} />
					</div>
				{/if}

				<div class="text-darkGray">
					<h2 class="font-semibold text-primary mb-2">Add Trainee to Course</h2>

					<hr class="my-2 horizontal-line" />

					<div class="mb-4 text-sm">
						<p class="mb-1"><span class="font-medium">RSETI :</span> {rsetiTitle}</p>
						<p class="mb-3"><span class="font-medium">Course :</span> {courseTitle}</p>
					</div>

					<div class="mb-4">
							<MultiSelect
								title="Select Trainees"
								options={filteredTraineesList}
								selectedValues={selectedTraineeUuids}
								placeholder="Select trainees"
								error={validationErrors.selectedTrainee || ''}
								required={true}
								on:change={handleMultiSelectChange}
							/>
					</div>
				</div>

				<div class="mt-5 sm:mt-4 flex gap-2 justify-end">
					<Button btnType="secondary" disabled={isSubmitting} on:click={handleCancel}>Cancel</Button
					>
					<Button
						on:click={handleSubmit}
						disabled={isSubmitting || filteredTraineesList.length === 0}>Submit</Button
					>
				</div>
			</div>
		</div>
	</div>
</div>
