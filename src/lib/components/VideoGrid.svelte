<script>
	import { createEventDispatcher, onDestroy } from 'svelte';
	import { languageMap } from '/src/config/constants.js';
	import SearchBar from '$lib/components/SearchBar.svelte';
	import VideoPod from '$lib/components/VideoPod.svelte';
	import VideoPodSkeleton from '$lib/components/VideoPodSkeleton.svelte';
	import ErrorMessage from '$lib/components/ErrorMessage.svelte';
	import LanguageSelectionButtons from '$lib/components/LanguageSelectionButtons.svelte';
	import FilterComponent from '$lib/components/FilterComponent.svelte';
	import ToastMessage from '$lib/components/ToastMessage.svelte';
	import { message } from '/src/routes/videos/videoStore.js';
	import { onMount } from 'svelte';
	import VideoEdit from '$lib/courses/courseDetails/VideoEdit.svelte';

	export let params;
	export let showSearchBar = true;
	export let videos = [];
	export let errorInVideos = null;
	export let loadingInVideos = false;
	export let showModuleFilter = true;
	export let showEditIcon = true;
	export let showDeleteIcon = true;
	export let dataToSend = '';
	export let filterOptions;
	export let totalVideos;
	export let languageCounts = []; 

	let dispatch = createEventDispatcher();
	let filters = {};
	let videosToShow = [];
	let languageAvailableForVideos = [];
	let dummyVideoPodDetails = new Array(4);
	let selectedLanguage='en'
	let searchValue = '';

	let currentPage = 0;
	const itemsPerPage = 20;
	let allVideosLoaded = false;
	let remainingVideosCount = 0;
	let loadRemainingVideos = false;
	let totalPages = 1;
	let isSearching = false;
	let isFiltering = false;
	let videosCopy = [];
	
	let currentLanguageTotal = 0;
	let showEditModal=false
	let videoToEdit;


	videosToShow = videos;

	$: populateLanguageArray(videos);
	$: handleLangugaeSetting(videos);
	$: handleSearchAndFilterCombined(searchValue, filters);
	$: updateCurrentLanguageCount(selectedLanguage, languageCounts);

	// Function to update the current language count
	function updateCurrentLanguageCount(lang, counts) {
		if (!counts || counts.length === 0) return;
		
		const langData = counts.find(item => item.languageCode === lang);
		currentLanguageTotal = langData ? langData.count : 0;
	}

	// -------------------------------- Language Related Function ---------------------------------------

	// For populating language array
	async function populateLanguageArray() {
		let filteredVideos = [];
		if (isSearching || isFiltering) {
			filteredVideos = videosCopy;
		} else {
			filteredVideos = videos;
		}

		// If no videos are available, reset the language array
		if (!filteredVideos || filteredVideos.length === 0) {
			languageAvailableForVideos = [];
			return;
		}

		if (filteredVideos?.length > 0) {
			languageAvailableForVideos = [];
			let languageAvailableForVideosSet = new Set();
			filteredVideos?.forEach((video, index) => {
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

			// Define the desired language order, ensuring 'en' is first
			const languageOrder = ['en', 'hi', 'ta']; 

			// Sort the languages based on predefined order
			languageAvailableForVideos.sort((a, b) => {
				let indexA = languageOrder.indexOf(a.languageCode);
				let indexB = languageOrder.indexOf(b.languageCode);

				// If not found in languageOrder, push them to the end
				indexA = indexA === -1 ? languageOrder.length : indexA;
				indexB = indexB === -1 ? languageOrder.length : indexB;

				return indexA - indexB;
			});

			// Preserve selectedLanguage if it exists in the updated list, otherwise choose a fallback
			if (
				!selectedLanguage ||
				!languageAvailableForVideos.some((lang) => lang.languageCode === selectedLanguage)
			) {
				const englishLanguage = languageAvailableForVideos.find(
					(lang) => lang.languageCode === 'en'
				);
				selectedLanguage = englishLanguage ? 'en' : languageAvailableForVideos[0]?.languageCode;
			}
		}
	}

	// Function to show videos based on selected language
	async function handleLangugaeSetting() {
		let localVideosCopy = [];
		errorInVideos = null;
		if (isSearching || isFiltering) {
			localVideosCopy = videosCopy;
		} else {
			localVideosCopy = videos;
		}

		// Handle case where no videos are found
		if (!localVideosCopy || localVideosCopy.length === 0) {
			if (videosToShow.length === 0) {
				errorInVideos = 'No Video Found';
			}
			videosToShow = [];
			return;
		}

		// Filter videos by selected language
		if (selectedLanguage) {
			localVideosCopy = localVideosCopy.filter(
				(video) =>
					video?.languageCode?.toLowerCase().trim() === selectedLanguage?.toLowerCase().trim()
			);
		}

		// Handle case where no videos match the selected language
		if (localVideosCopy.length === 0) {
			// Update the selected language to the first video's languageCode if videos exist
			const firstVideo = isSearching || isFiltering ? videosCopy[0] : videos[0];
			if (firstVideo?.languageCode) {
				selectedLanguage = firstVideo.languageCode;

				// Re-filter the videos with the updated language
				localVideosCopy = (isSearching || isFiltering ? videosCopy : videos).filter(
					(video) =>
						video?.languageCode?.toLowerCase().trim() === selectedLanguage?.toLowerCase().trim()
				);
			}
		}

		// Update error message or videosToShow
		if (localVideosCopy.length === 0 && videosToShow.length === 0) {
			errorInVideos = 'No Video Found';
		} else {
			errorInVideos = null;
			videosToShow = localVideosCopy;
		}
	}

	async function handleSelectedLanguage(e) {
		selectedLanguage = e.detail.languageCode;
		await handleLangugaeSetting();
	}

	// // ------------------------------- Functions related to filter -----------------

	async function handleSearchAndFilterCombined() {
		// Determine if searching or filtering is active
		isSearching = searchValue?.length > 0 ? true : false;
		isFiltering = Object.keys(filters)?.length > 0;

		// Case 1: No search value and no filters applied, reset to all videos
		if (!isSearching && !isFiltering) {
			videosToShow = videos;
			remainingVideosCount = 0;
			allVideosLoaded = false;
			errorInVideos = null;
			dispatch('handleShowMoreButton', false);
			await populateLanguageArray();
			await handleLangugaeSetting()
			return;
		}

		// Case2: Only Search and No Filters
		if (searchValue && Object.keys(filters)?.length === 0) {
			fetchVideos({ searchValue, filters: {}, resetPagination: true });
		}

		// Case 3: Only filter and No search
		if (Object.keys(filters)?.length !== 0 && !searchValue) {
			fetchVideos({ searchValue: '', filters, resetPagination: true });
		}

		// Case 4: Both search and filter
		if (Object.keys(filters)?.length !== 0 && searchValue) {
			fetchVideos({ searchValue, filters, resetPagination: true });
		}

		// Update UI states for "Show More" button
		if (isSearching || isFiltering) {
			dispatch('handleShowMoreButton', true);
		} else {
			dispatch('handleShowMoreButton', false);
		}
	}

	async function handleSearchValue(e) {
		searchValue = e.detail;
	}

	async function handleFilterApplied(event) {
		filters = event.detail.selectedFilters;
	}

	// ------------------------- Fetch function for handling search and filter API calls--------------

	async function fetchVideos({ searchValue = '', filters = {}, resetPagination = true }) {
		loadingInVideos = true;
		errorInVideos = null;
		remainingVideosCount = 0;
		loadRemainingVideos = false;

		isSearching = searchValue !== '';
		isFiltering = Object.keys(filters)?.length > 0;

		let localPage = resetPagination ? 0 : currentPage;
		const fetchedVideos = resetPagination ? [] : videosCopy;

		// Build base query parameters
		let queryParams = [];
		if (!searchValue && Object.keys(filters)?.length !== 0) {
			queryParams.push(`courseCode=${filters?.Course?.courseCode}`);
		}
		if (searchValue && Object.keys(filters)?.length !== 0) {
			queryParams.push(`courseUuid=${filters.Course.id}`);
			queryParams.push(`videoTitle=${searchValue}`);
		}
		if (searchValue && Object.keys(filters)?.length === 0) {
			queryParams.push(`videoTitle=${searchValue}`);
		}

		queryParams.push(`size=${itemsPerPage}`);

		try {
			while (localPage < totalPages) {
				const endPoint = `apis/videos?${queryParams.join('&')}&page=${localPage}`;
				const response = await fetch(endPoint);
				if (!response?.ok) {
					throw new Error('Error fetching videos');
				}

				const result = await response.json();
				totalPages = result.page?.totalPages || 1;
				remainingVideosCount = result.page?.totalElements - fetchedVideos.length - itemsPerPage;

				if (result.content?.length > 0) {
					fetchedVideos.push(...result.content);
					localPage++;
				} else {
					// Stop the loop if no more videos are available
					if (fetchedVideos.length === 0) {
						errorInVideos = 'No videos found';
					}
					break;
				}
			}

			// Update state variables
			videosCopy = fetchedVideos.length > 0 ? fetchedVideos : [];
			videosToShow = videosCopy;
			await populateLanguageArray();
			await handleLangugaeSetting();

			if (localPage >= totalPages) {
				allVideosLoaded = true;
			}
		} catch (error) {
			console.log('Error fetching videos:', error);

			if (fetchedVideos.length > 0) {
				videosCopy = fetchedVideos;
				videosToShow = fetchedVideos;
				await populateLanguageArray();
				await handleLangugaeSetting();
			} else {
				errorInVideos = `Failed to fetch videos`;
			}

			loadRemainingVideos = true; // Allow retry
		} finally {
			loadingInVideos = false;
			currentPage = localPage;
		}
	}

	async function fetchRemainingVideos() {
		loadRemainingVideos = false; // Hide the retry button while fetching
		await fetchVideos({ searchValue, filters, resetPagination: false });
	}

	// ----------------------------- Video Deletion ----------------------------------

	async function handleDeletion(e) {
		message.set('');
		let videoUuid = e.detail;
		const videoToDelete = videosToShow?.find((video) => video.uuid === videoUuid);
		let filteredVideos = videosToShow?.filter((video) => {
			return video?.uuid !== e.detail;
		});
		message.set(`Successully deleted the video - "${videoToDelete?.name}".`);
		videosToShow = filteredVideos;
		videos = videos?.filter((video) => {
			return video?.uuid !== e.detail;
		});
		videosCopy = videosCopy?.filter((video) => {
			return video?.uuid !== e.detail;
		});
		
		// Update language counts when a video is deleted
		if (videoToDelete?.languageCode && languageCounts.length > 0) {
			const langIndex = languageCounts?.findIndex(l => l.languageCode === videoToDelete.languageCode);
			if (langIndex !== -1 && languageCounts[langIndex].count > 0) {
				languageCounts[langIndex].count--;
				languageCounts = [...languageCounts]; 
				
				// Update total videos count
				if (totalVideos > 0) {
					totalVideos--;
				}
			}
		}
		
		await populateLanguageArray();
		selectedLanguage = videoToDelete?.languageCode;
		await handleLangugaeSetting();
	}

	function handleSuccesMessageClose(e) {
		message.set('');
	}

	// --------------------- Edit Video----------------------------------

		function handleEditModal(e){
		showEditModal = true
		videoToEdit = e.detail
	}

	function handleEditVideo(e){

		message.set('');
		let index = videosToShow.findIndex(v =>v.uuid ===e.detail.result?.uuid)
		videosToShow[index]=e.detail.result
		videos[index]=e.detail.result
		videosCopy[index]=e.detail.result
		message.set(`Successfully edited the video - "${videoToEdit.name}".`);
		videoToEdit={}
	}

	function handleCancelEditSubmission(e){
		showEditModal = false
		videoToEdit = {}
	}


	// ------------------ Global Filter Functions ---------------------
	async function handleVideoFilter(event) {
		// extracting the filter values from the event
		let stateFilter = event.detail.stateFilter;
		let rsetiFilter = event.detail.rsetiFilter;

		let courses = [];
		// The filter logic is not finalised, the code will be added accordingly
		//  if (rsetiFilter === String_Constants.ALL_COURSES) {
		//      courses=coursesData;
		//  } else {
		//  loading = false;
		// }
	}

	onMount(async () => {
		await populateLanguageArray();
		await handleLangugaeSetting();
	});

	onDestroy(() => {
		message.set('');
	});
	
</script>

<div>
	{#if $message}
		<div class="mb-2">
			<ToastMessage
				message={$message}
				successMessage={true}
				viewModal={true}
				on:handleToastClose={handleSuccesMessageClose}
			/>
		</div>
	{/if}

	<div class="flex flex-wrap items-center text-sm text-darkGray mb-4 bg-white p-2 rounded-md border border-gray-50 shadow-sm px-4 ">
		<span class="font-medium">Total: {totalVideos || 'NA'} {totalVideos === 1 ? 'video' : 'videos'}</span>
		
		{#if languageCounts && languageCounts.length > 0}
		  <span class="mx-4 my-1">|</span>
		  {#each languageCounts as langCount, i}
			<span>
			  {languageMap[langCount.languageCode] || langCount.languageCode}: {langCount.count}
			</span>
			{#if i < languageCounts.length - 1}
			  <span class="mx-4 my-1">|</span>
			{/if}
			
		  {/each}
		{/if}
	  </div>


	<div class="mb-4 grid sm:grid-cols-2 gap-4">
		{#if showSearchBar}
			<SearchBar
				on:handleSearchValue={handleSearchValue}
				placeholder={'Search by title'}
				showSearchButton={false}
			/>
		{/if}
		<div class="flex justify-end items-end">
			{#if showModuleFilter && Number(Object.keys(filterOptions)?.length) > 0}
				<FilterComponent on:filterApplied={handleFilterApplied} {filterOptions}>
					<span slot="btnContent" class="flex gap-2">
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
							class="feather feather-filter"
							><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg
						> Filters
					</span>
				</FilterComponent>
			{/if}
		</div>
	</div>

	{#if Number(Object.keys(filters)?.length) > 0}
		<p class="text-sm mb-2">
			Filters applied:
			{#each Object.entries(filters) as [key, value], index}
				<span>{key} - {value?.name}{index < Object.entries(filters).length - 1 ? ', ' : ''}</span>
			{/each}
		</p>
	{/if}

	{#if languageAvailableForVideos?.length !== 0 && errorInVideos === null}
		<LanguageSelectionButtons
			{languageAvailableForVideos}
			on:handleSelectedLanguage={handleSelectedLanguage}
			{selectedLanguage}
			{languageCounts}
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
		{#if videosToShow?.length > 0 && errorInVideos == null}
			<div class="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
				{#each videosToShow as video, index (index)}
					<div class="max-w-[800px]">
						<VideoPod
							{video}
							{params}
							{showEditIcon}
							{showDeleteIcon}
							courseCodeData={dataToSend}
							on:handleDeletion={handleDeletion}
							on:handleEditModal={handleEditModal}
						/>
					</div>
				{/each}
			</div>

			<!-- Enhanced summary line with language-specific counts -->
			<div class="text-sm text-darkGray mb-8 flex justify-between items-center border-t pt-2">
				<span>
					Showing {videosToShow?.length} of {(currentLanguageTotal>0)?currentLanguageTotal : 'NA'} 
					{languageMap[selectedLanguage] || selectedLanguage} videos
				</span>
			</div>
		{:else}
			<ErrorMessage error={errorInVideos} />
		{/if}
	{/if}
</div>

<!-- Show button to load remaining videos if an error occurred -->
{#if allVideosLoaded && !errorInVideos}
	<div class="flex justify-center mb-8 text-sm">
		<p class="text-darkGray">All videos have been fetched.</p>
	</div>
{/if}

{#if loadRemainingVideos && remainingVideosCount > 0}
	<p class="text-sm text-center mb-8">
		{remainingVideosCount} videos couldn't be loaded.
		<a class="text-sm text-blue-500 rounded underline" on:click={fetchRemainingVideos}>
			Click here
		</a> to load remaining videos.
	</p>
{/if}

{#if showEditModal}
	<VideoEdit
		video={videoToEdit}
		on:handleEditVideo={handleEditVideo}
		on:handleCancelSubmission={handleCancelEditSubmission}
	/>
{/if}

