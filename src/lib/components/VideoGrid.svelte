<script>
	import { createEventDispatcher } from 'svelte';
	import { languageMap } from '/src/config/constants.js';
	import SearchBar from '$lib/components/SearchBar.svelte';
	import VideoPod from '$lib/components/VideoPod.svelte';
	import VideoPodSkeleton from '$lib/components/VideoPodSkeleton.svelte';
	import ErrorMessage from '$lib/components/ErrorMessage.svelte';
	import LanguageSelectionButtons from '$lib/components/LanguageSelectionButtons.svelte';
	import FilterComponent from '$lib/components/FilterComponent.svelte';

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

	let dispatch = createEventDispatcher();
	let filters = {};
	let videosToShow = [];
	let languageAvailableForVideos = [];
	let dummyVideoPodDetails = new Array(4);
	let selectedLanguage = 'en';
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

	videosToShow = videos;

	$: populateLanguageArray(videos);
	$: handleLangugaeSetting(selectedLanguage, videos, videosCopy);
	$: handleSearchAndFilterCombined(searchValue, filters);

	// -------------------------------- Language Related Function ---------------------------------------

	// For populating language array
	function populateLanguageArray() {
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
		}
	}

	// Function to show videos based on selected language
	function handleLangugaeSetting() {
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

	function handleSelectedLanguage(e) {
		selectedLanguage = e.detail.languageCode;
		handleLangugaeSetting();
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
			populateLanguageArray();
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
			populateLanguageArray();

			if (localPage >= totalPages) {
				allVideosLoaded = true;
			}
		} catch (error) {
			console.log('Error fetching videos:', error);

			if (fetchedVideos.length > 0) {
				videosCopy = fetchedVideos;
				videosToShow = fetchedVideos;
				populateLanguageArray();
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

	function handleDeletion() {
		// write logic here
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
</script>

<div>
	<div class="mb-4 grid sm:grid-cols-2 gap-4">
		{#if showSearchBar}
			<SearchBar
				on:handleSearchValue={handleSearchValue}
				placeholder={'Search by title'}
				showSearchButton={false}
			/>
		{/if}
		<div class=" flex justify-end items-end">
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
			<div class="grid sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
				{#each videosToShow as video, index (index)}
					<div class="max-w-[800px]">
						<VideoPod
							{video}
							{params}
							{showEditIcon}
							{showDeleteIcon}
							courseCodeData={dataToSend}
							on:handleDeletion={handleDeletion}
						/>
					</div>
				{/each}
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
		<a class=" text-sm text-blue-500 rounded underline" on:click={fetchRemainingVideos}>
			Click here
		</a>to load remaining videos.
	</p>
{/if}
