<script>
	import { onMount, onDestroy } from "svelte";
	import { createEventDispatcher } from 'svelte';
	import { tick } from 'svelte';
	import DropDown from '$lib/components/DropDown.svelte';
	import DeletionErrorMessage from '$lib/components/DeletionErrorMessage.svelte';
	import LineLoader from '$lib/components/LineLoader.svelte';
	import Button from '$lib/components/Button.svelte';

	

	export let videoTitle;
	export let chapterData;
	export let chaptersList;
	export let videoUuid;
	export let videoToMove


	let dispatch = createEventDispatcher();
	let validationErrors = '';
	let errorMessage=''
	let selectedChapterUuid = null;
	let selectedChapter=null;
	let orderNumberOfLastVideo=null
	let isSubmitting=false
	let failedAPICall=false;
	let selectedChapterVideos
	$: currentChapterName = chapterData?.translations
	?.find((item) => item.languageCode === 'en')?.title;

	$: filteredChapterList = chaptersList?.filter((item) => item?.id != chapterData?.uuid);

	$:dataToSend = {
		url: videoToMove?.url,
		orderNumber: orderNumberOfLastVideo+1,
		languageCode: videoToMove?.languageCode 
	};

	 // Validate fields
	 $:if (filteredChapterList?.length==0) {
                errorMessage = 'This course only has one chapter. ';
            } 

	$:updateVideosDataInAscendingOrder(selectedChapter)
	function updateVideosDataInAscendingOrder(){
		if(!selectedChapterUuid) return
		let videosDataInAscendingOrder=[]
		selectedChapterVideos = filteredChapterList?.find(
  		(item) => item?.id === selectedChapterUuid
		)?.videos || [];
    // Sort the array in ascending order based on orderNumber
    selectedChapterVideos.sort((a, b) => Number(a.orderNumber) - Number(b.orderNumber));

    findOrderNUmberOfLastVideo();
	}

	function findOrderNUmberOfLastVideo(){
		orderNumberOfLastVideo=selectedChapterVideos[selectedChapterVideos?.length-1]?.orderNumber || 0
		dataToSend.orderNumber=orderNumberOfLastVideo +1
	}

	function handleOutsideClick() {
		// Prevents any action when clicking outside the modal
		return;
	}


	function handleCancel() {
		dispatch('handleCancelSubmission');
		selectedChapter = null;
  		selectedChapterUuid = null;
  		selectedChapterVideos = [];
		orderNumberOfLastVideo=null
		validationErrors=''
		failedAPICall=false

	}

	function handleCancelSelectionInDropDown() {
		selectedChapter = null;
		selectedChapterUuid = null;
		selectedChapterVideos = [];
		orderNumberOfLastVideo=null
		validationErrors=''
		failedAPICall=false

	}

	function handleErrorMessageClose(){
		selectedChapter = null;
		selectedChapterUuid = null;
		selectedChapterVideos = [];
		orderNumberOfLastVideo=null
		validationErrors=''
		failedAPICall=false
		errorMessage=''
	}

	function openMoveVideoAcrossCoursesModal(){
		handleCancel()
		dispatch('handleOpenMoveVideoAcrossCoursesModal')
	}

	async function handleSubmit() {
		let result=null
		let resultOfApiCall=null
		try {
			failedAPICall=false
			errorMessage = '';
			isSubmitting = true;
			validationErrors = '';

			// Validate if the URL already exists
			const duplicate = selectedChapterVideos?.some((video) => video?.url === dataToSend?.url)
			 
             if (duplicate) {
                 errorMessage = `Failed to add video. Video already exists in the chapter.`;
			    isSubmitting = false;
                 return;
             }
			
			if (selectedChapter===null) {
				validationErrors = `This field should not be empty.`;
				await tick();
				isSubmitting = false;
				return;
			}
			const response = await fetch(
				`/apis/courses/details/${chapterData?.courseUuid}/chapters/${selectedChapterUuid}/videos?courseUuid=${chapterData?.courseUuid}&&chapterUuid=${selectedChapterUuid}&&videoUuid=${videoToMove?.uuid}`,
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(dataToSend)
				}
			);
			if (!response.ok) {
				errorMessage = `Failed to move video. Please try again!`;
				throw new Error('Failed to move video');
			}
			resultOfApiCall = await response.json();
			if (!resultOfApiCall.error) {
				result = resultOfApiCall.responseData
				if(resultOfApiCall?.status == 201){
					dispatch('handleAddVideoToADifferentChapter', { result, selectedChapterUuid })
				}
				handleDeleteVideoFromCurrentChapter()
				return
			} else {
				if(resultOfApiCall?.status === 409){
                    errorMessage = `Failed to move video. Video already exists in the chapter.`;
                } else {
					errorMessage = `Failed to move video. Please try again.`;
				}
			}
		} catch (error) {
			console.error('Error:', error);
		} finally {
			if (!resultOfApiCall?.error) return
			isSubmitting = false;
			if (!errorMessage && !validationErrors) {
				handleCancel();
			}
		}
	}

	async function handleDeleteVideoFromCurrentChapter() {
		try {
			errorMessage = '';
			isSubmitting = true;
			validationErrors = '';
			if (!selectedChapter) {
				validationErrors = `This field should not be empty.`;
				await tick()
				isSubmitting = false;
				return;
			}
			const response = await fetch(
				`/apis/courses/details/${chapterData?.courseUuid}/chapters/${chapterData?.uuid}/videos/${videoUuid}?courseUuid=${chapterData?.courseUuid}&&chapterUuid=${chapterData?.uuid}&&videoUuid=${videoUuid}`,
				{
					method: 'DELETE',
					headers: { 'Content-Type': 'application/json' },
				}
			);
			if (!response.ok) {
				errorMessage = `Successfully added video to ${selectedChapter} but failed to delete from ${currentChapterName}. Please delete the video from ${currentChapterName}`;
				failedAPICall=true
				throw new Error('Failed to move video');
			}
			const result = await response.json();
			if (!result.error) {
				dispatch('handleVideoDeletionInVideoMoveFunctionality', videoUuid);
			} else {
				errorMessage = `Successfully added video to ${selectedChapter} but failed to delete from ${currentChapterName}. Please delete the video from ${currentChapterName}`;
				throw new Error('Failed to move video');
			}
		} catch (error) {
			console.error('Error:', error);
		} finally {
			isSubmitting = false;
			if (!errorMessage && !validationErrors) {
				handleCancel();
			}
		}
	}

	onMount(() => {
		// Disable scrolling on the main page
		document.body.style.overflow = "hidden";
	});

	onDestroy(() => {
		// Re-enable scrolling when the modal is closed
		document.body.style.overflow = "";
	});

</script>

<div class="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
	<div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity pointer-events-none" aria-hidden="true" on:click|stopPropagation={handleOutsideClick}></div>

	<div class="fixed inset-0 z-10 w-screen overflow-y-auto" id="form">
		<div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
			<div
				class="relative transform rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6"
			>
			<div class="pb-2">
				{#if isSubmitting && !validationErrors}
				<LineLoader />
				{/if}
			</div>
			{#if errorMessage}
			<div class="mb-4">
				<DeletionErrorMessage {errorMessage}
				on:handleErrorMessageClose={handleErrorMessageClose} />
			</div>
			{/if}
				<div>
					<h2 class=" capitalize mb-2 font-semibold">Move - <span class="">"{videoTitle}"</span></h2>
					<hr class="my-4 horizontal-line" />

					<!-- First Row -->

					<div class="flex flex-col gap-3 text-sm">
						<div class="mb-2"><p>Current Chapter: {currentChapterName}</p></div>
						<div class="flex gap-1 items-center">
							<span>To:</span>
							<div class="w-full">
							<DropDown
								on:handleCancelSelection={handleCancelSelectionInDropDown}
								bind:selectedItemName={selectedChapter}
								bind:selectedItemUuid={selectedChapterUuid}
								options={filteredChapterList}
								validationErrors={validationErrors ? validationErrors : ''}
								type={'chapterList'}
								disabled={filteredChapterList?.length===0 || failedAPICall==true}
		
							/>
						</div>
					</div>
					</div>
				</div>
				<div class="mt-2 text-xs text-blue-600"
				on:click={openMoveVideoAcrossCoursesModal}>
					<a href="">Move video to a diffrent course</a>
				</div>
					

					<div class="mt-5 sm:mt-4 flex gap-2 justify-end">
						<Button on:click={() => handleSubmit(true)} 
						disabled={failedAPICall || isSubmitting}>Move</Button>
						<Button btnType="secondary" disabled={isSubmitting} on:click={handleCancel}>Cancel</Button
						>
				</div>
			</div>
		</div>
	</div>
</div>
