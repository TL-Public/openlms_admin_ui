<script>
	import { chapterSuccessMessage, chapterErrorMessage } from '/src/routes/courses/courseStore.js';
	import SuccessMessage from '$lib/components/SuccessMessage.svelte';
	import DeletionErrorMessage from '$lib/components/DeletionErrorMessage.svelte';
	import ErrorMessage from '$lib/components/ErrorMessage.svelte';
	import VideoList from '$lib/components/VideoList.svelte';
	import SingleAccordionWithEditViaApi from '$lib/components/SingleAccordionWithEditViaApi.svelte';
	import AddChapterForm from '$lib/courses/courseDetails/AddChapterForm.svelte';
	import DeletionModalViaAPI from '$lib/components/DeletionModalViaAPI.svelte';
	import InputField from '$lib/components/InputField.svelte';
	import { goto } from '$app/navigation';
	import ToastMessage from '$lib/components/ToastMessage.svelte';
	import { page } from '$app/stores';
	import { onMount, tick } from 'svelte';
	import Button from '$lib/components/Button.svelte';

	export let courseCode;
	export let chaptersData = [];
	export let courseUuid;
	export let coursesList = [];
	export let courseTitle;

	let chapterSelectedForDeletionEnglish = '';
	let chapterSelectedForDeletionHindi = '';
	let chapterDeletionUuid = '';
	let showAddChapterModal = false;
	let viewDeleteModal = false;
	let deleteTextInput = '';
	let deletionConfirmText = 'please delete this chapter';
	let deleteTextConfirmation = false;
	let draggedIndex = null;
	let videosCount;
	let chaptersDataAscendingOrder = [];
	let orderNUmberOfLastChapter;
	let originalChaptersData = [];
	let hashRouteId = '';
	let accordionRef = {};
	let isModalOpen = false;

	$: chaptersList = chaptersData?.flatMap((chapter) => {
		if (!chapter.uuid) return []; // Return early if uuid is missing
		return chapter.translations
			.filter((translation) => translation.languageCode === 'en')
			.map((translation) => ({
				name: translation.title,
				id: chapter.uuid,
				videos: chapter?.videos
			}));
	});
	$: error = chaptersData?.error ? true : false;

	// --------Functions to update chapters after manipulations like move, add and delition ----------

	function handleDeleteVideoFromCurrentChaptersAdd(e) {
		let sourceChapterIndex = chaptersData?.findIndex(
			(item) => item?.uuid === e.detail?.sourceChapterId
		);
		let targetChapterIndex = chaptersData?.findIndex(
			(item) => item?.uuid === e.detail?.targetChapterId
		);
		let videoToMove = chaptersData[sourceChapterIndex]?.videos?.find(
			(item) => item?.uuid == e.detail?.videoUuid
		);

		// Remove the video from the source chapter
		chaptersData[sourceChapterIndex].videos = chaptersData[sourceChapterIndex]?.videos?.filter(
			(item) => item?.uuid !== e.detail?.videoUuid
		);

		// Add the video to the target chapter
		if (videoToMove) {
			chaptersData[targetChapterIndex]?.videos?.push(videoToMove);
		}
		chaptersData = chaptersData;
	}

	function handleVideoDeletionInVideoMoveFunctionality(e) {
		let chapterIndex = chaptersData?.findIndex(
			(chapter) => e.detail.chapterData?.uuid == chapter?.uuid
		);
		chaptersData[chapterIndex] = e.detail.chapterData;
		chaptersData = chaptersData;
		chapterErrorMessage.set('');
		chapterSuccessMessage.set(`Successully moved the video - "${e.detail.deletedVideo?.name}".`);
	}

	function handleAddVideoToADifferentChapter(e) {
		let chapterIndex = chaptersData?.findIndex((chapter) => e.detail.chapterUuid == chapter?.uuid);
		let newVideo = e.detail.newVideo;
		chaptersData[chapterIndex]?.videos?.push(newVideo);
		chaptersData = chaptersData;
	}

	function handleChapterUpdationAfterVideoAddition(e) {
		let chapterIndex = chaptersData?.findIndex(
			(chapter) => e.detail.chapterData?.uuid == chapter?.uuid
		);
		chaptersData[chapterIndex] = e.detail.chapterData;
		chaptersData = chaptersData;
		chapterErrorMessage.set('');
		chapterSuccessMessage.set(`Successully added the video - "${e.detail.newVideo?.name}".`);
	}

	function handleChapterAfterVideoDeletion(e) {
		let chapterIndex = chaptersData?.findIndex(
			(chapter) => e.detail.chapterData?.uuid == chapter?.uuid
		);
		chaptersData[chapterIndex] = e.detail.chapterData;
		chaptersData = chaptersData;
		chapterErrorMessage.set('');
		chapterSuccessMessage.set(`Successully deleted the video - "${e.detail.deletedVideo?.name}".`);
	}

	// --------Functions to handle deletion text and comparison-----------
	// Function to normalize text (removes spaces and ignores case)
	const normalizeText = (text) => text.trim().toLowerCase().replace(/\s+/g, ' ');

	$: isTextValid(deleteTextInput);
	function isTextValid() {
		deleteTextConfirmation = normalizeText(deleteTextInput) === normalizeText(deletionConfirmText);
	}

	// ---------- Functions for chapter addition, edit and delete -----------------
	function handleAddChapterModal() {
		showAddChapterModal = true;
		isModalOpen=true
	}

	function handleCancelSubmissionChapterAddition() {
		showAddChapterModal = false;
		isModalOpen=false
	}

	function handleAddChapter(e) {
		chapterSuccessMessage.set('');
		chaptersData = e.detail?.result?.chapters;
		chapterErrorMessage.set('');
		chapterSuccessMessage.set(`Successfully added the chapter - "${e.detail.titleEn}".`);
	}

	function handleEditChapterName(e) {
		chapterSuccessMessage.set('');
		chaptersData = e.detail?.result?.chapters;
		chapterErrorMessage.set('');
		chapterSuccessMessage.set(`Successfully edited the chapter - "${e.detail.previousTitle}".`);
	}

	function handleDeleteChapterModal(e) {
		viewDeleteModal = true;
		isModalOpen=true
		let selectedChapterForDeletion = chaptersData?.find((chapter) => chapter?.uuid === e.detail);

		const englishTranslation = selectedChapterForDeletion?.translations.find(
			(t) => t.languageCode === 'en'
		);
		const hindiTranslation = selectedChapterForDeletion?.translations.find(
			(t) => t.languageCode === 'hi'
		);
		chapterSelectedForDeletionEnglish = englishTranslation?.title || '';
		chapterSelectedForDeletionHindi = hindiTranslation?.title || '';
		chapterDeletionUuid = selectedChapterForDeletion?.uuid || '';
		videosCount = selectedChapterForDeletion?.videos?.length || 0;
	}

	function handleCancelChapterDeletion() {
		deleteTextInput = '';
		viewDeleteModal = false;
		isModalOpen=false
	}

	function handleChapterDeletion(e) {
		deleteTextInput = '';
		chapterSuccessMessage.set('');
		chapterErrorMessage.set('');
		let filteredChaptersData = chaptersData?.filter((chapter) => {
			return chapter?.uuid !== e.detail;
		});
		chapterSuccessMessage.set(
			`Successully deleted the chapter - "${chapterSelectedForDeletionEnglish}".`
		);
		chaptersData = filteredChaptersData;
	}

	//---------------Drag and drop functions---------------------
	function dragStart(event, index) {
		// If any modal is open the drag events in the background are restricted
		if(isModalOpen) return
		event.target.style.cursor = 'grab';
		draggedIndex = index;

		// Save the current state before reordering
		originalChaptersData = JSON.parse(JSON.stringify(chaptersData));
	}

	function dragOver(event) {
		if(isModalOpen) return
		event.preventDefault();
		event.target.style.cursor = 'grab';

		const scrollSpeed = 20; // Speed of scrolling
		const offset = 50; // Distance from the edge to start scrolling

		// Get the mouse Y position relative to the viewport
		const mouseY = event.clientY;
		const viewportHeight = window.innerHeight;

		// Check if we're near the top of the screen
		if (mouseY < offset) {
			window.scrollBy(0, -scrollSpeed); // Scroll up
		}
		// Check if we're near the bottom of the screen
		else if (mouseY > viewportHeight - offset) {
			window.scrollBy(0, scrollSpeed); // Scroll down
		}
	}

	async function drop(event, index) {
		// If any modal is open the drag events in the background are restricted
		if(isModalOpen) return
		const draggedItem = chaptersData[draggedIndex];
		const targetItem = chaptersData[index];
		const targetIndex = index;
		const draggedItemTitle = draggedItem?.translations?.find(
			(item) => item?.languageCode === 'en'
		)?.title;
		const targetItemTitle = targetItem?.translations?.find(
			(item) => item?.languageCode === 'en'
		)?.title;

		// Swap the orderNumbers between dragged and target
		const draggedOrderNumber = draggedItem.orderNumber;
		const targetOrderNumber = targetItem.orderNumber;

		draggedItem.orderNumber = targetOrderNumber;
		targetItem.orderNumber = draggedOrderNumber;

		// Prepare the reordered data for just the two affected chapters
		const reorderedChaptersData = {
			chapters: [
				{
					uuid: draggedItem.uuid,
					orderNumber: draggedItem.orderNumber
				},
				{
					uuid: targetItem.uuid,
					orderNumber: targetItem.orderNumber
				}
			]
		};

		let rearrangedArray = [...chaptersData]; // Create a copy of the original array

		// Remove the dragged item from its original position
		rearrangedArray.splice(draggedIndex, 1); // Remove the dragged item

		// Insert the dragged item at the new target index
		rearrangedArray.splice(targetIndex, 0, draggedItem);

		chaptersData = rearrangedArray;

		// Prepare data to send to the API

		try {
			const response = await fetch(`/apis/courses/details/${courseUuid}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(reorderedChaptersData)
			});
			if (!response.ok) {
				throw new Error('Failed to reorder chapters ');
			}

			let result = await response.json();

			if (!result.error) {
				chapterErrorMessage.set('');
				chapterSuccessMessage.set(
					`Successully reordered chapters - "${draggedItemTitle}" and "${targetItemTitle}".`
				);
			} else {
				chapterSuccessMessage.set('');
				chapterErrorMessage.set(
					`Failed to reorder chapters - "${draggedItemTitle}" and "${targetItemTitle}".`
				);
				throw new Error('Error reordering chapters	');
			}

			// If successful, the state remains as is
		} catch (error) {
			// If API call fails, revert to the original state
			chaptersData = [...originalChaptersData];
		}
		chaptersData = chaptersData;
		draggedIndex = null;
	}

	// ----------------General Functions---------------
	// Helper function to get the title based on language code
	function getTranslation(translations, langCode) {
		if (!translations) return;
		const translation = translations.find((t) => t.languageCode === langCode);
		return translation ? translation.title : '';
	}

	// Helper function to reorder the chapters data
	$: updateChaptersDataInAscendingOrder(chaptersData);
	function updateChaptersDataInAscendingOrder() {
		chaptersDataAscendingOrder = [];
		chaptersData?.forEach((chapter) => {
			if (chapter?.orderNumber) {
				// Check if orderNumber exists
				chaptersDataAscendingOrder.push(chapter);
			}
		});

		// Sort the array in ascending order based on orderNumber
		chaptersDataAscendingOrder.sort((a, b) => a.orderNumber - b.orderNumber);

		chaptersData = chaptersDataAscendingOrder;
		findOrderNUmberOfLastChapter();
	}

	function findOrderNUmberOfLastChapter() {
		orderNUmberOfLastChapter = chaptersData[chaptersData?.length - 1]?.orderNumber ?? 0;
	}

	function handleSuccesMessageClose(e) {
		chapterSuccessMessage.set('');
	}

	function handleErrorMessageClose() {
		chapterErrorMessage.set('');
	}

	function handleBulkUploadChapters() {
		goto(`/courses/${courseUuid}/details/chapterBulkUpload`);
	}

	function handleModalOpened() {
		isModalOpen = true;
	}

	function handleModalClosed() {
		isModalOpen = false;
	}

	onMount(() => {
		hashRouteId = $page.url.hash ? $page.url.hash.slice(1) : '';
		if (hashRouteId && accordionRef[hashRouteId]?.handleAccordionOpen) {
			accordionRef[hashRouteId].handleAccordionOpen();
		} else {
			console.error(`AccordionRef for hashRouteId ${hashRouteId} not found.`);
		}
	});
</script>

<h2 class="text-darkGray font-semibold mb-4">
	Chapters ({chaptersData?.length ? chaptersData?.length : 0})
</h2>
{#if $chapterSuccessMessage}
	<div class="mb-2">
		<!-- <SuccessMessage
			successMessage={$chapterSuccessMessage}
			on:handleSuccessMessageClose={handleSuccesMessageClose}
		/> -->
		<ToastMessage
			message={$chapterSuccessMessage}
			successMessage={true}
			viewModal={true}
			on:handleToastClose={handleSuccesMessageClose}
		/>
	</div>
{/if}
{#if $chapterErrorMessage}
	<div class="mb-2">
		<!-- <DeletionErrorMessage
			errorMessage={$chapterErrorMessage}
			on:handleErrorMessageClose={handleErrorMessageClose}
		/> -->
		<ToastMessage
			message={$chapterErrorMessage}
			errorMessage={true}
			viewModal={true}
			on:handleToastClose={handleErrorMessageClose}
		/>
	</div>
{/if}

{#if !error}
	{#if chaptersData?.length > 0}
		{#each chaptersData as chapterData, index (chapterData?.uuid)}
			<div
				class="w-full mb-2 lg:mb-4"
				draggable={!isModalOpen}
				id={chapterData?.uuid}
				on:dragstart={(event) => dragStart(event, index)}
				on:dragover={dragOver}
				on:drop={(event) => drop(event, index)}
				role="listitem"
				aria-grabbed={draggedIndex === index}
				aria-dropeffect="move"
				aria-label="Draggable accordion item"
				aria-live="polite"
			>
				<SingleAccordionWithEditViaApi
					bind:this={accordionRef[chapterData?.uuid]}
					name={getTranslation(chapterData?.translations, 'en')}
					name2={getTranslation(chapterData?.translations, 'hi')}
					uuid={chapterData?.uuid}
					videosCount={chapterData?.numberOfVideos}
					orderNumber={chapterData?.orderNumber}
					draggable={!isModalOpen}
					editIcon={true}
					deleteIcon={true}
					{courseUuid}
					{index}
					secondInputField={true}
					on:handleEditChapter={handleEditChapterName}
					on:handleDeleteChapter={handleDeleteChapterModal}
					on:modalOpened={handleModalOpened}
					on:modalClosed={handleModalClosed}
				>
					<div
						class="mt-2 flex justify-center mx-auto text-sm leading-7 text-darkgray font-normal pb-4 cursor-default max-w-[960px]"
						id="innerAccordion"
					>
						<VideoList
							on:handleDeleteVideoFromCurrentChaptersAdd={handleDeleteVideoFromCurrentChaptersAdd}
							on:handleChapterUpdationAfterVideoAddition={handleChapterUpdationAfterVideoAddition}
							on:handleChapterAfterVideoDeletion={handleChapterAfterVideoDeletion}
							on:handleVideoDeletionInVideoMoveFunctionality={handleVideoDeletionInVideoMoveFunctionality}
							on:handleAddVideoToADifferentChapter={handleAddVideoToADifferentChapter}
							{chapterData}
							{courseCode}
							showModuleFilter={false}
							showSearchBar={false}
							{chaptersList}
							{coursesList}
							{courseUuid}
							{courseTitle}
							on:modalOpened={handleModalOpened}
							on:modalClosed={handleModalClosed}
						/>
					</div>
				</SingleAccordionWithEditViaApi>
			</div>
		{/each}
	{/if}
	<div class="rounded-lg border-dashed border-2 border-gray-70 p-3">
		<div class="flex gap-2">
			<Button btnType="primary" on:click={handleAddChapterModal}>+ Add Chapter</Button>
			<Button btnType="secondary" on:click={handleBulkUploadChapters}>Bulk Upload</Button>
		</div>
	</div>
{:else}
	<ErrorMessage error={'Chapters not found'} />
{/if}
{#if showAddChapterModal}
	<AddChapterForm
		{courseUuid}
		orderNumber={orderNUmberOfLastChapter + 1}
		on:handleAddChapter={handleAddChapter}
		on:handleCancelSubmission={handleCancelSubmissionChapterAddition}
	/>
{/if}

{#if viewDeleteModal}
	<DeletionModalViaAPI
		id={chapterDeletionUuid}
		name={chapterSelectedForDeletionEnglish}
		heading={`About to delete the chapter - ${chapterSelectedForDeletionEnglish}`}
		para={'Are you sure you want to delete the chapter? This action cannot be undone.'}
		endPoint={`/apis/courses/details/${courseUuid}/chapters/`}
		queryParams={`?courseUuid=${courseUuid}&&uuid=${chapterDeletionUuid}`}
		{deleteTextConfirmation}
		on:handleCancelDeletion={handleCancelChapterDeletion}
		on:handleDeletion={handleChapterDeletion}
	>
		<div class=" flex flex-col gap-2 p-6 bg-white rounded-lg border border-gray-50 my-4">
			<div>
				<p class="text-sm text-darkGray capitalize">
					<span class="font-medium">Title :</span>
					{chapterSelectedForDeletionEnglish}
				</p>
				<p class="text-sm text-darkGray">
					<span class="font-medium">Videos Count :</span>{videosCount}
				</p>
			</div>
			<!-- <hr class="border-t-1 border-darkGray">
				<div>
					<p class="text-sm text-darkGray">{longDescription}</p>
				</div> -->
		</div>

		<div class="">
			<InputField
				label={"Type 'Please delete this chapter' to confirm"}
				placeholder={" Type 'Please delete this chapter'"}
				name={'deletion'}
				labelFontWeight={'font-normal'}
				bind:value={deleteTextInput}
				required
			/>
		</div>
	</DeletionModalViaAPI>
{/if}
