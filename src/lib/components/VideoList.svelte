<script>
	import { goto } from '$app/navigation';
	import { String_Constants } from '/src/config/constants.js';
	import { languageMap } from '/src/config/constants.js';
	import { createEventDispatcher } from 'svelte';
	import { chapterSuccessMessage, chapterErrorMessage } from '/src/routes/courses/courseStore.js';
	import SearchBar from '$lib/components/SearchBar.svelte';
	import VideoPodSkeleton from '$lib/components/VideoPodSkeleton.svelte';
	import ErrorMessage from '$lib/components/ErrorMessage.svelte';
	import VideoDetailsFilters from '$lib/courses/courseDetails/VideoDetailsFilters.svelte';
	import LanguageSelectionButtons from '$lib/components/LanguageSelectionButtons.svelte';
	import DraggableVideoPod from '$lib/components/DraggableVideoPod.svelte';
	import AddVideoForm from '$lib/courses/courseDetails/AddVideoForm.svelte';
	import DeletionModalViaAPI from '$lib/components/DeletionModalViaAPI.svelte';
	import InputField from '$lib/components/InputField.svelte';
	import MoveVideoAcrossChaptersForm from '$lib/courses/courseDetails/MoveVideoAcrossChaptersForm.svelte';
	import MoveVideoAcrossCourses from '$lib/courses/courseDetails/MoveVideoAcrossCourses.svelte';
	import Button from './Button.svelte';

	export let params;
	export let showSearchBar = true;
	export let showAddButton = false;
	export let errorInVideos = null;
	export let loadingInVideos = false;
	export let showModuleFilter = true;
	export let dataToSend = '';
	export let urlToRoute = '';
	export let chapterData = {};
	export let chaptersList;
	export let coursesList;
	export let courseTitle;
	export let courseUuid;

	let dispatch = createEventDispatcher();
	const languageOrder = ['en', 'hi', 'ta'];
	let moduleData = [{}];
	let languageAvailableForVideos = [];
	let videosDataInAscendingOrder = [];
	let originalVideosData = [];
	let dummyVideoPodDetails = new Array(4);
	let moduleFilterValue = String_Constants.ALL_MODULES;
	let deletionConfirmText = 'please delete this video';
	let deleteTextInput = '';
	let searchValue = '';
	let errorInSearch = null;
	let draggedIndex = null;
	let draggedVideo = null;
	let deleteTextConfirmation = false;
	let showAddVideoModal = false;
	let showDeletionModal = false;
	let showMoveModal = false;
	let showMoveVideosAcrossCoursesModal = false;
	let videoToDelete;
	let videoToMove;
	let orderNumberOfLastVideo;
	let selectedLanguage;
	let modalOpen=false;

	$: videos = updateVideosDataInAscendingOrder(chapterData?.videos);
	$: videosCopy = videos ? videos : [];
	$: handleSearchAndLangugaeSetting(searchValue, selectedLanguage, videos);
	$: populateLanguageArray(chapterData?.videos);

	//  --------Functions to handle deletion text and comparison-----------

	const normalizeText = (text) => text?.trim().toLowerCase().replace(/\s+/g, ' ');
	$: isTextValid(deleteTextInput);
	function isTextValid() {
		deleteTextConfirmation = normalizeText(deleteTextInput) === normalizeText(deletionConfirmText);
	}

	// -------- Grouping videos based on language --------------

	// Group videos by their language code
	$: groupVideosByLanguage(videosCopy);
	function groupVideosByLanguage(videosCopy) {
		const groupedVideos = videosCopy.reduce((acc, video) => {
			const languageCode = video.languageCode?.toLowerCase().trim();
			if (!acc[languageCode]) acc[languageCode] = [];
			acc[languageCode].push(video);
			return acc;
		}, {});
		videosCopy = Object.values(groupedVideos).flat();
	}

	function populateLanguageArray(videos) {
		if (videos?.length === 0) {
			languageAvailableForVideos = [];
		}
		if (videos?.length > 0) {
			languageAvailableForVideos = [];
			let languageAvailableForVideosSet = new Set();
			videos?.forEach((video, index) => {
				const languageCode = video?.languageCode;

				if (!languageAvailableForVideosSet?.has(video?.languageCode?.toLowerCase().trim())) {
					languageAvailableForVideosSet.add(video?.languageCode?.toLowerCase().trim());
					// Create an object with both language code and name
					const languageObject = {
						languageCode: languageCode,
						languageName: languageMap[languageCode] || 'Unknown'
					};

					languageAvailableForVideos?.push(languageObject);
					languageAvailableForVideos = languageAvailableForVideos;
				}
			});

			// Sort the languages based on the predefined order
			languageAvailableForVideos = languageAvailableForVideos.sort((a, b) => {
				return languageOrder.indexOf(a.languageCode) - languageOrder.indexOf(b.languageCode);
			});

			// Prioritize: 1) Retain selectedLanguage if valid, 2) 'en' if available, 3) first language in array
			if (!languageAvailableForVideos.some((lang) => lang.languageCode === selectedLanguage)) {
				const englishLanguage = languageAvailableForVideos.find(
					(lang) => lang.languageCode === 'en'
				);

				selectedLanguage = englishLanguage ? 'en' : languageAvailableForVideos[0]?.languageCode;
			}
		}
	}

	$: if (selectedLanguage) {
		handleSearchAndLangugaeSetting(selectedLanguage);
	}

	// --------- Search functionalities -----------

	function handleSearchValue(e) {
		searchValue = e.detail;
	}

	function handleSelectedLanguage(e) {
		selectedLanguage = e.detail.languageCode;
	}

	function handleSearchAndLangugaeSetting() {
		if (videos?.length === 0) return;
		errorInSearch = null;
		let localVideosCopy = videos;

		// Check for selected language filtering
		if (selectedLanguage) {
			localVideosCopy = videos?.filter((video) => {
				const videoLanguageCode = video?.languageCode?.toLowerCase().trim();
				const selectedLang = selectedLanguage?.toLowerCase().trim();
				return videoLanguageCode === selectedLang;
			});
		}
		if (localVideosCopy?.length === 0) {
			errorInSearch = 'No Video Found';
		}

		videosCopy = localVideosCopy;
	}

	function handleGoToPage() {
		goto(`${urlToRoute}?data=${encodeURIComponent(dataToSend)}`);
	}

	// ------------------------ Video Deletion ----------------------

	function handleDeletionModal(e) {
		showDeletionModal = true;
		videoToDelete = e.detail;
		modalOpen=true;
		dispatch('modalOpened');

	}

	function handleCancelVideoDeletion(e) {
		showDeletionModal = false;
		modalOpen=false;
		dispatch('modalClosed');

	}

	function handleVideoDeletion(e) {
		let filteredVideosList = chapterData?.videos.filter((video) => video?.uuid != e.detail);
		let [deletedVideo] = chapterData?.videos.filter((video) => video?.uuid == e.detail);
		chapterData.videos = filteredVideosList;
		chapterData = chapterData;
		if (languageAvailableForVideos?.length > 0) {
			selectedLanguage = languageAvailableForVideos[0]?.languageCode
				? languageAvailableForVideos[0]?.languageCode
				: 'en';
		}
		dispatch('handleChapterAfterVideoDeletion', { chapterData, deletedVideo });
	}

	function handleVideoDeletionInVideoMoveFunctionality(e) {
		let filteredVideosList = chapterData?.videos.filter((video) => video?.uuid != e.detail);
		let [deletedVideo] = chapterData?.videos.filter((video) => video?.uuid == e.detail);
		chapterData.videos = filteredVideosList;
		chapterData = chapterData;
		if (languageAvailableForVideos?.length > 0) {
			selectedLanguage = languageAvailableForVideos[0]?.languageCode
				? languageAvailableForVideos[0]?.languageCode
				: 'en';
		}
		dispatch('handleVideoDeletionInVideoMoveFunctionality', { chapterData, deletedVideo });
	}

	// -------------------- Video Addition --------------------------------

	function handleAddVideoModal() {
		showAddVideoModal = true;
		modalOpen=true;
		dispatch('modalOpened');


	}

	function handleCancelSubmission() {
		showAddVideoModal = false;
		modalOpen=false;
		dispatch('modalClosed');

	}

	function handleAddVideo(e) {
		let newVideo = e.detail?.result;
		chapterData?.videos?.push(newVideo);
		chapterData = chapterData;
		selectedLanguage = e.detail?.result?.languageCode;
		dispatch('handleChapterUpdationAfterVideoAddition', { chapterData, newVideo });
	}

	function handleAddVideoToADifferentChapter(e) {
		let newVideo = e.detail?.result;
		let chapterUuid = e.detail?.selectedChapterUuid;
		dispatch('handleAddVideoToADifferentChapter', { chapterUuid, newVideo });
	}

	// --------------- Move Videos Across Chapter -------------------------

	function handleMoveModal(e) {
		showMoveModal = true;
		chapterSuccessMessage.set('');
		videoToMove = e.detail;
		modalOpen=true;
		dispatch('modalOpened');

	}

	function handleMoveVideosModalCancelSubmission(e) {
		showMoveModal = false;
		modalOpen=false;
		dispatch('modalClosed');

	}

	// -------------------Move video across courses ------------------------
	function handleOpenMoveVideoAcrossCoursesModal() {
		showMoveModal = false;
		showMoveVideosAcrossCoursesModal = true;
		modalOpen=true;
		dispatch('modalOpened');

	}

	function handleCancelSubmissionMoveVideosAcrossCourses() {
		showMoveVideosAcrossCoursesModal = false;
		modalOpen=false;
		dispatch('modalClosed');

	}

	// -------------------- Video Filters -----------------------------------
	async function handleVideoFilter(event) {
		// extracting the filter values from the event
		let stateFilter = event.detail.stateFilter;
		let rsetiFilter = event.detail.rsetiFilter;

		let courses = [];
	}

	// ---------------------Drag and Drop Functions -----------------------------

	function dragStart(event, index, video) {
		// If any modal is open the drag events in the background are restricted
		if(modalOpen) return
		let videoIndex = videosCopy.findIndex((item) => item.uuid === video.uuid);

		if (videoIndex === -1) {
			console.error(`Video with UUID ${video.uuid} not found in videos array`, videosCopy);
			return; // Exit if not found
		}

		draggedIndex = videoIndex;
		draggedVideo = video;
		originalVideosData = JSON.parse(JSON.stringify(videosCopy)); // Backup original data

		event.target.style.cursor = 'grab';
	}
	function dragOver(event) {
		if(modalOpen) return
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

	async function drop(event, index, video) {
		// If any modal is open the drag events in the background are restricted
		if(modalOpen || !draggedVideo ) return

		try {
			let targetIndex = videosCopy.findIndex((item) => item?.uuid === video?.uuid);
			if (targetIndex === -1 || draggedIndex === targetIndex) return;

			const draggedItem = videosCopy[draggedIndex];
			const targetItem = videosCopy[targetIndex];

			if (targetItem.languageCode !== draggedItem.languageCode) {
				resetDraggedState();
				return; // Exit early if languages don't match
			}

			// Swap orderNumbers and prepare data for API
			[draggedItem.orderNumber, targetItem.orderNumber] = [
				targetItem.orderNumber,
				draggedItem.orderNumber
			];
			const reorderedVideosData = {
				videos: [
					{ uuid: draggedItem.uuid, orderNumber: draggedItem.orderNumber },
					{ uuid: targetItem.uuid, orderNumber: targetItem.orderNumber }
				]
			};

			let rearrangedArray = [...videosCopy];
			rearrangedArray.splice(draggedIndex, 1); // Remove dragged item
			rearrangedArray.splice(targetIndex, 0, draggedItem); // Insert at new position

			videosCopy = rearrangedArray; // Update state reactively for UI

			// API Call to save order
			const response = await fetch(
				`/apis/courses/details/${chapterData?.courseUuid}/chapters/${chapterData?.uuid}?courseUuid=${chapterData?.courseUuid}&&uuid=${chapterData?.uuid}`,
				{
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(reorderedVideosData)
				}
			);

			if (response.ok) {
				const result = await response.json();
				if (!result.error) {
					chapterSuccessMessage.set(
						`Successfully reordered videos - "${draggedItem.name}" and "${targetItem.name}".`
					);
				} else {
					throw new Error('API error');
				}
			} else {
				throw new Error('Network response error');
			}
		} catch (error) {
			console.error('Reordering failed:', error);
			videosCopy = [...originalVideosData]; // Revert on failure
			chapterErrorMessage.set('Failed to reorder videos.');
		} finally {
			resetDraggedState();
		}
	}

	function resetDraggedState() {
		draggedIndex = null;
		draggedVideo = null;
	}

	// --------------------General Functions---------------------------

	// Helper function to reorder the chapters data

	function updateVideosDataInAscendingOrder() {
		videosDataInAscendingOrder = [];
		chapterData?.videos?.forEach((video) => {
			if (video?.orderNumber) {
				// Check if orderNumber exists
				videosDataInAscendingOrder.push(video);
			}
		});

		// Sort the array in ascending order based on orderNumber
		videosDataInAscendingOrder.sort((a, b) => a.orderNumber - b.orderNumber);

		// findOrderNUmberOfLastVideo();

		return videosDataInAscendingOrder;
	}

	$: findOrderNUmberOfLastVideo(videos);
	function findOrderNUmberOfLastVideo() {
		orderNumberOfLastVideo = videos[videos?.length - 1]?.orderNumber || 0;
	}
</script>

<div class="bg-blue-10 p-4 px-8 rounded-lg border-gray-50 border w-full mx-auto">
	<div class="w-full mx-auto max-w-[800px]">
		<div class="mb-4 grid sm:grid-cols-2 gap-4">
			{#if showSearchBar}
				<SearchBar
					on:handleSearchValue={handleSearchValue}
					placeholder={'Search by title'}
					showSearchButton={false}
				/>
			{/if}

			{#if showAddButton}
				<button
					class="px-6 py-2 font-semibold text-white bg-primary rounded-[4px] capitalize text-sm text-nowrap w-fit"
					on:click={handleGoToPage}
				>
					+ New Video
				</button>
			{/if}

			{#if showModuleFilter}
				<VideoDetailsFilters
					on:handleFilters={handleVideoFilter}
					bind:moduleFilterValue
					moduleFilterOptionList={moduleData}
				/>
			{/if}
		</div>

		{#if languageAvailableForVideos?.length !== 0}
			<LanguageSelectionButtons
				{languageAvailableForVideos}
				on:handleSelectedLanguage={handleSelectedLanguage}
				{selectedLanguage}
			/>
		{/if}

		{#if loadingInVideos}
			<div class="grid sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-4">
				{#each dummyVideoPodDetails as videoPod, index (index)}
					<VideoPodSkeleton />
				{/each}
			</div>
		{/if}

		{#if !loadingInVideos}
			{#if videosCopy?.length > 0 && errorInVideos == null}
				<div class="grid sm:grid-cols-1 gap-4">
					{#each videosCopy as video, index (index)}
						<div
							class="max-w-[800px]"
							draggable={!modalOpen}
							on:dragstart|stopPropagation={(event) => dragStart(event, index, video)}
							on:dragover|stopPropagation={dragOver}
							on:drop|stopPropagation={(event) => drop(event, index, video)}
							role="listitem"
							aria-grabbed={draggedIndex === index}
							aria-dropeffect="move"
							aria-label="Draggable accordion item"
							aria-live="polite"
						>
							<DraggableVideoPod
								{video}
								{params}
								{chapterData}
								{chaptersList}
								courseCodeData={dataToSend}
								on:handleDeletionModal={handleDeletionModal}
								on:handleAddVideoFromCurrentChapter
								on:handleMoveModal={handleMoveModal}
							/>
						</div>
					{/each}
				</div>
			{:else if errorInVideos}
				<ErrorMessage error={errorInVideos} />
			{:else if errorInSearch}
				<ErrorMessage error={errorInSearch} />
			{/if}
			<div class="max-w-[800px] flex justify-end items-end gap-4">
				{#if videosCopy?.length == 0}
					<div>No videos added. Start by adding videos.</div>
				{/if}
				<div class="mt-4">
					<Button on:click={handleAddVideoModal}>+ Add Video</Button>
				</div>
			</div>
		{/if}
	</div>
</div>

{#if showAddVideoModal}
	<AddVideoForm
		chapterUuid={chapterData?.uuid}
		courseUuid={chapterData?.courseUuid}
		orderNumber={orderNumberOfLastVideo + 1}
		{selectedLanguage}
		{chapterData}
		on:handleAddVideo={handleAddVideo}
		on:handleCancelSubmission={handleCancelSubmission}
	/>
{/if}

{#if showDeletionModal}
	<DeletionModalViaAPI
		id={videoToDelete?.uuid}
		name={videoToDelete?.name}
		heading={`About to delete the video - ${videoToDelete?.name}`}
		para={'Are you sure you want to delete the video? This action cannot be undone.'}
		endPoint={'/apis/courses/details/${courseUuid}/chapters/${chapterUuid}/videos/'}
		queryParams={`?courseUuid=${chapterData?.courseUuid}&&chapterUuid=${chapterData?.uuid}&&videoUuid=${videoToDelete?.uuid}`}
		{deleteTextConfirmation}
		on:handleCancelDeletion={handleCancelVideoDeletion}
		on:handleDeletion={handleVideoDeletion}
	>
		<hr />
		<div class=" flex flex-col gap-2 p-6 border border-gray-50 bg-offwhite rounded-lg">
			<div>
				<p class="text-sm text-darkGray capitalize mb-2">
					<span class="font-semibold">Title : </span>
					{videoToDelete?.name}
				</p>
				<p class="text-sm text-darkGray mb-2 line-clamp-2">
					<span class="font-semibold" title={videoToDelete?.description}>Description : </span>
					<span class="break-words">{videoToDelete?.description}</span>
				</p>

				<p class="text-sm text-darkGray">
					<span class="font-semibold">Video URL : </span>
					<a
						class="text-blue-600 hover:underline"
						href={videoToDelete?.url}
						target="_blank"
						rel="noopener noreferrer"
					>
						{videoToDelete?.url}
					</a>
				</p>
			</div>
			<!-- <hr class="border-t-1 border-darkGray">
				<div>
					<p class="text-sm text-darkGray">{longDescription}</p>
				</div> -->
		</div>
		<hr class="mb-2" />
		<div class="">
			<InputField
				label={'Type "Please delete this video" to confirm'}
				placeholder={'Type "Please delete this video"'}
				name={'deletion'}
				labelFontWeight={'font-normal'}
				bind:value={deleteTextInput}
				required
			/>
		</div>
	</DeletionModalViaAPI>
{/if}

{#if showMoveModal}
	<MoveVideoAcrossChaptersForm
		on:handleCancelSubmission={handleMoveVideosModalCancelSubmission}
		on:handleDeleteVideoFromCurrentChapter={handleVideoDeletion}
		on:handleOpenMoveVideoAcrossCoursesModal={handleOpenMoveVideoAcrossCoursesModal}
		on:handleAddVideoToADifferentChapter={handleAddVideoToADifferentChapter}
		on:handleVideoDeletionInVideoMoveFunctionality={handleVideoDeletionInVideoMoveFunctionality}
		videoTitle={videoToMove?.name}
		{chapterData}
		{chaptersList}
		orderNumber={orderNumberOfLastVideo + 1}
		langaugeCode={videoToMove?.langaugeCode}
		url={videoToMove?.url}
		videoUuid={videoToMove?.uuid}
		{videoToMove}
	/>
{/if}

{#if showMoveVideosAcrossCoursesModal}
	<MoveVideoAcrossCourses
		on:handleCancelSubmission={handleCancelSubmissionMoveVideosAcrossCourses}
		on:handleAddVideoToADifferentChapter={handleAddVideoToADifferentChapter}
		on:handleDeleteVideoFromCurrentChapter={handleVideoDeletion}
		on:handleVideoDeletionInVideoMoveFunctionality={handleVideoDeletionInVideoMoveFunctionality}
		videoTitle={videoToMove?.name}
		{chapterData}
		{chaptersList}
		videoUuid={videoToMove?.uuid}
		{coursesList}
		{courseTitle}
		video={videoToMove}
		{courseUuid}
	/>
{/if}
