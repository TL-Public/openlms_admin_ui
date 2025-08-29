<script>
	import { onDestroy, onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { languageMap, languageOrder } from '/src/config/constants.js';
	import { message } from '/src/routes/videos/videoStore.js';
	import SearchBar from '$lib/components/SearchBar.svelte';
	import VideoPod from '$lib/components/VideoPod.svelte';
	import VideoPodSkeleton from '$lib/components/VideoPodSkeleton.svelte';
	import ErrorMessage from '$lib/components/ErrorMessage.svelte';
	import LanguageSelectionButtons from '$lib/components/LanguageSelectionButtons.svelte';
	import FilterComponent from '$lib/components/FilterComponent.svelte';
	import ToastMessage from '$lib/components/ToastMessage.svelte';
	import VideoEdit from '$lib/courses/courseDetails/VideoEdit.svelte';
	import Button from '$lib/components/Button.svelte';

	export let params;
	export let showSearchBar = true;
	export let showModuleFilter = true;
	export let showEditIcon = true;
	export let showDeleteIcon = true;
	export let allowBulkUpload = false;
	export let dataToSend = '';
	export let filterOptions;
	export let totalVideos;
	export let languageCounts = [];

	let filters = {};
	let videosToShow = [];
	let languageAvailableForVideos = [];
	let selectedLanguage = 'en';
	let searchValue = '';
	let languageStates = new Map(); // { languageCode: { currentPage, totalPages, videos, allLoaded, loading,  error, remainingVideosCount, loadRemainingVideos, totalCount } }
	let currentLanguageTotal = 0;
	let showEditModal = false;
	let videoToEdit;
	let loadingInVideos = false;
	let errorInVideos = null;
	let previousFilterValue=''
	let previousSearchValue=''

	let dummyVideoPodDetails = new Array(4);
	const itemsPerPage = 20;

	$: initializeLanguageStates(languageCounts);
	$: handleStateChange(selectedLanguage, searchValue, filters);
	$: updateCurrentLanguageCount(selectedLanguage, languageCounts);


	// --------------------------- Language Related Functions -----------------------------------

	async function initializeLanguageStates(languages) {
		if (!languages || languages.length === 0) return;

		languageAvailableForVideos = languages.map((lang) => ({
			languageCode: lang.languageCode,
			languageName: languageMap[lang.languageCode] || 'Unknown'
		}));

		// Sort them based on languageOrder
		languageAvailableForVideos.sort((a, b) => {
			const indexA = languageOrder.indexOf(a.languageCode);
			const indexB = languageOrder.indexOf(b.languageCode);

			// If code not found, put at end
			return (indexA === -1 ? Infinity : indexA) - (indexB === -1 ? Infinity : indexB);
		});

		languages.forEach((lang) => {
			if (!languageStates.has(lang.languageCode)) {
				languageStates.set(lang.languageCode, {
					currentPage: 0,
					totalPages: 1,
					totalCount: lang.count || 0,
					videos: [],
					allLoaded: false,
					loading: false,
					error: null,
					remainingVideosCount: 0,
					loadRemainingVideos: false
				});
			}
		});

		languageStates = new Map(languageStates);
		await handleStateChange(selectedLanguage, searchValue, filters)
	}

	function updateCurrentLanguageCount(lang, counts) {
		if (!counts || counts.length === 0) return;

		const langData = counts?.find((item) => item?.languageCode === lang);
		currentLanguageTotal = langData ? langData?.count : 0;
	}

	async function handleStateChange(language, search, appliedFilters) {
		
		const currentSearchValue = search?.toLowerCase()?.trim() || '';
		const currentFilterValue =
			Object.keys(appliedFilters)?.length > 0
				? appliedFilters?.Course?.name?.toLowerCase()?.trim()
				: '';

		// Check if the actual content of the search or filter has changed.
		if (currentSearchValue !== previousSearchValue || currentFilterValue !== previousFilterValue) {

			// Reset all language states to ensure a fresh fetch
			const newLanguageStates = new Map();
			languageStates.forEach((state, langCode) => {
				newLanguageStates.set(langCode, {
					...state,
					videos: [],
					currentPage: 0,
					allLoaded: false,
					error: null
				});
			});
			languageStates = newLanguageStates;

			// Update the previous values for the next comparison
			previousSearchValue = currentSearchValue;
			previousFilterValue = currentFilterValue;

			// Trigger the new fetch
			await fetchVideosForLanguage(language, true);
		} else {
			// This block handles only language changes when search/filters are static or not applied.
			const langState = languageStates.get(language);
			if (langState && langState.videos.length === 0 && !langState.loading && !langState.error) {
				await fetchVideosForLanguage(language, true);
			} else if (langState) {
				videosToShow = langState.videos;
				errorInVideos = langState.error;
			}
		}
	}

	function onSelectedLanguage(e) {
		selectedLanguage = e.detail.languageCode;
	}

	// -------------------------------- Fetch Videos API Call ------------------------------------

	async function fetchVideosForLanguage(languageCode, resetPagination = false) {
		if (!languageStates.has(languageCode)) return;

		const langState = languageStates.get(languageCode);

		if (langState.loading) return;

		langState.loading = true;
		langState.loadRemainingVideos = false;
		languageStates.set(languageCode, langState); 
		languageStates = new Map(languageStates); 

		if (languageCode === selectedLanguage) {
			loadingInVideos = true;
		}

		try {
			const currentPage = resetPagination ? 0 : langState.currentPage;
			const queryParams = [
				`languageCode=${languageCode}`,
				`page=${currentPage}`,
				`size=${itemsPerPage}`
			];

			if (searchValue) {
				queryParams.push(`videoTitle=${searchValue}`);
			}
			if (filters.Course) {
				if (searchValue) {
					queryParams.push(`courseUuid=${filters.Course.id}`);
				} else {
					queryParams.push(`courseCode=${filters.Course.courseCode}`);
				}
			}

			const endPoint = `apis/videos?${queryParams.join('&')}`;
			const response = await fetch(endPoint);

			if (!response.ok) {
				throw new Error('Error fetching videos');
			}

			const result = await response.json();

			const newVideos = resetPagination ? result.content : [...langState.videos, ...result.content];
			langState.videos = newVideos;
			langState.currentPage = currentPage + 1;
			langState.totalPages = result.page?.totalPages || 1;
			langState.allLoaded = langState.currentPage >= langState.totalPages;
			langState.error = null;
			langState.remainingVideosCount = 0;
			langState.loadRemainingVideos = false;

			languageStates.set(languageCode, langState);
			languageStates = new Map(languageStates);

			if (languageCode === selectedLanguage) {
				videosToShow = newVideos;
				errorInVideos = null;
			}
		} catch (error) {
			console.error(`Error fetching videos for ${languageCode}:`, error);

			// Check if there are remaining videos to load after a partial fetch
			if (langState.currentPage > 0) {

				langState.remainingVideosCount = Math.max(
					0,
					langState.totalCount - langState.videos.length
				);
				langState.loadRemainingVideos = true;
			} else {
				langState.error = 'Failed to fetch videos';
			}

			languageStates.set(languageCode, langState);
			languageStates = new Map(languageStates);

			if (languageCode === selectedLanguage) {
				if (langState.currentPage > 0) {
					errorInVideos = null;
				} else {
					errorInVideos = 'Failed to fetch videos';
				}
			}
		} finally {
			langState.loading = false;
			languageStates.set(languageCode, langState);
			languageStates = new Map(languageStates);

			if (languageCode === selectedLanguage) {
				loadingInVideos = false;
			}
		}
	}

	// ----------------------------- Load More Videos ---------------------------------------------

	async function fetchRemainingVideos(languageCode) {
		if (!languageStates.has(languageCode)) return;

		const langState = languageStates.get(languageCode);
		langState.loadRemainingVideos = false; 
		languageStates.set(languageCode, langState);
		languageStates = new Map(languageStates);

		await fetchVideosForLanguage(languageCode, false);
	}

	async function showMoreVideos() {
		if (!selectedLanguage || !languageStates.has(selectedLanguage)) return;

		const langState = languageStates.get(selectedLanguage);
		if (langState.allLoaded || langState.loading) return;

		await fetchVideosForLanguage(selectedLanguage, false);
	}

	// ------------------------------------------ Search and Filters ----------------------------

	function onSearchValue(e) {
		searchValue = e.detail;
	}

	function onFilterApplied(event) {
		filters = event.detail.selectedFilters;
	}


	// ------------------------------- Edit Video ------------------------------------------------

	function onEditModal(e) {
		showEditModal = true;
		videoToEdit = e.detail;
	}

	function onEditVideo(e) {
		message.set('');
		let index = videosToShow.findIndex((v) => v.uuid === e.detail.result?.uuid);
		if (index !== -1) {
			videosToShow[index] = e.detail.result;

			if (selectedLanguage && languageStates.has(selectedLanguage)) {
				const langState = languageStates.get(selectedLanguage);
				const langIndex = langState.videos.findIndex((v) => v.uuid === e.detail.result?.uuid);
				if (langIndex !== -1) {
					langState.videos[langIndex] = e.detail.result;
					languageStates.set(selectedLanguage, langState);
					languageStates = new Map(languageStates);
				}
			}
		}
		message.set(`Successfully edited the video - "${videoToEdit.name}".`);
		videoToEdit = {};
	}

	function onCancelEditSubmission(e) {
		showEditModal = false;
		videoToEdit = {};
	}

	// ------------------------------------- Video Deletion ---------------------------------------

	function onDeletion(e) {
		message.set('');
		let videoUuid = e.detail;
		const videoToDelete = videosToShow?.find((video) => video.uuid === videoUuid);

		// Remove from current display
		videosToShow = videosToShow?.filter((video) => video.uuid !== videoUuid);

		// Remove from language state
		if (selectedLanguage && languageStates.has(selectedLanguage)) {
			const langState = languageStates.get(selectedLanguage);
			langState.videos = langState.videos.filter((video) => video.uuid !== videoUuid);
			langState.totalCount = langState.totalCount - 1
			languageStates.set(selectedLanguage, langState);
			languageStates = new Map(languageStates);
		}

		// Update language counts when a video is deleted
		if (videoToDelete?.languageCode && languageCounts.length > 0) {
			const langIndex = languageCounts?.findIndex(
				(l) => l.languageCode === videoToDelete.languageCode
			);
			if (langIndex !== -1 && languageCounts[langIndex].count > 0) {
				languageCounts[langIndex].count--;
				languageCounts = [...languageCounts];

				// Update total videos count
				if (totalVideos > 0) {
					totalVideos--;
				}
			}
		}

		message.set(`Successfully deleted the video - "${videoToDelete?.name}".`);
	}

	// ------------------------------------- Life Cycle Functions ---------------------------------
	onDestroy(() => {
		message.set('');
	});

	// ---------------------------------- General Functions -----------------------------------------

	function onSuccessMessageClose(e) {
		message.set('');
	}

	function onGoToBulkUpload() {
		goto(`/videos/bulkUpload`);
	}
</script>

<div>
	{#if $message}
		<div class="mb-2">
			<ToastMessage
				message={$message}
				successMessage={true}
				viewModal={true}
				on:handleToastClose={onSuccessMessageClose}
			/>
		</div>
	{/if}

	<div
		class="flex flex-wrap items-center text-sm text-darkGray mb-4 bg-white p-2 rounded-md border border-gray-50 shadow-sm px-4"
	>
		<span class="font-medium"
			>Total: {totalVideos || 'NA'} {totalVideos === 1 ? 'video' : 'videos'}</span
		>

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

	<div class="mb-5 flex gap-2">
		{#if showSearchBar}
			<SearchBar
				on:handleSearchValue={onSearchValue}
				placeholder={'Search by title'}
				showSearchButton={false}
			/>
		{/if}
		<div class="flex gap-2">
			{#if allowBulkUpload}
				<Button btnType="secondary" on:click={onGoToBulkUpload}>Bulk Upload</Button>
			{/if}
			<FilterComponent on:filterApplied={onFilterApplied} {filterOptions}>
				<span slot="btnContent" class="flex gap-2">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="22"
						height="22"
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

	{#if languageAvailableForVideos?.length > 0}
		<LanguageSelectionButtons
			{languageAvailableForVideos}
			on:handleSelectedLanguage={onSelectedLanguage}
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
							on:handleDeletion={onDeletion}
							on:handleEditModal={onEditModal}
						/>
					</div>
				{/each}
			</div>

			<div class="text-sm text-darkGray mb-4 flex justify-between items-center border-t pt-2">
				<span>
					Showing {videosToShow?.length} of {currentLanguageTotal > 0 ? currentLanguageTotal : 'NA'}
					{languageMap[selectedLanguage] || selectedLanguage} videos
				</span>
				{#if selectedLanguage && languageStates.has(selectedLanguage) && !languageStates.get(selectedLanguage).allLoaded}
					<Button disabled={languageStates.get(selectedLanguage).loading} on:click={showMoreVideos}>
						Show More
					</Button>
				{/if}
			</div>

			{#if selectedLanguage && languageStates.has(selectedLanguage) && languageStates.get(selectedLanguage).allLoaded}
				<div class="flex justify-center mb-8 text-sm">
					<p class="text-darkGray">
						All {languageMap[selectedLanguage] || selectedLanguage} videos have been loaded.
					</p>
				</div>
			{/if}
		{:else}
			<ErrorMessage error={errorInVideos || 'Failed to load videos'} />
		{/if}
	{/if}

	{#if selectedLanguage && languageStates.has(selectedLanguage) && languageStates.get(selectedLanguage).loadRemainingVideos && languageStates.get(selectedLanguage).remainingVideosCount > 0}
		<p class="text-sm text-darkGray mb-4 text-center">
			{languageStates.get(selectedLanguage).remainingVideosCount} videos couldn't be loaded.
			<a
				class="text-sm text-blue-500 rounded underline"
				on:click={() => fetchRemainingVideos(selectedLanguage)}
			>
				Click here
			</a> to load remaining videos.
		</p>
	{/if}
</div>

{#if showEditModal}
	<VideoEdit
		video={videoToEdit}
		on:handleEditVideo={onEditVideo}
		on:handleCancelSubmission={onCancelEditSubmission}
	/>
{/if}
