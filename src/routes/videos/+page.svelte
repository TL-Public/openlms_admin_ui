<script>
	import { onMount } from 'svelte';
	import { userDetails } from '/src/routes/store.js';
	import { moduleNames, actionNames } from '$lib/data.js';
	import { checkActionPermission } from '$lib/utils/helper.js';
	import Filters from '$lib/states/statesListing/Filters.svelte';
	import VideoListingOverview from '$lib/videos/videoListing/VideoListingOverview.svelte';
	import BreadCrumbs from '$lib/components/BreadCrumbs.svelte';
	import VideoGrid from '$lib/components/VideoGrid.svelte';
	import ErrorMessage from '$lib/components/ErrorMessage.svelte';
	import ErrorMessageComponent from '$lib/components/ErrorMessage.svelte';
	import VideoPodSkeleton from '$lib/components/VideoPodSkeleton.svelte';
	import Button from '$lib/components/Button.svelte';
	import { String_Constants } from '/src/config/constants.js';

	export let data;

	let { rsetiData, stateData, coursesData } = data;
	let rsetiFilterValue = String_Constants.ALL_RSETIS;
	let stateFilterValue = String_Constants.ALL_STATES;
	let errorMessage = '';
	let noVideos = false;
	let videosResult = false;
	let filterOptions = [];
	let dummyVideoPodDetails = new Array(4);
	let loadingInVideos = true;
	let coursesList;
	let totalVideos;
	let languageCounts = [];
	let allLanguages = [];

	let permissionsObject = {
		allowVideoBulkUpload: false,
		allowVideoEdit: false,
		allowVideoDeletion: false
	};

	$: if (coursesData && !coursesData?.error) {
		coursesList = coursesData?.flatMap((course) => {
			if (!course.uuid || !course.translations) return [];
			return course.translations
				.filter((translation) => translation?.languageCode === 'en')
				.map((translation) => ({
					name: translation?.title,
					id: course?.uuid,
					courseCode: course?.courseCode,
					videos: course?.videos,
					chapters: course?.chapters
				}));
		}) || [];
	}

	$: if (coursesList) {
		filterOptions = [
			{
				filterName: 'Course',
				filterValue: coursesList
			}
		];
	}

	function handleFilter(event) {
		let stateFilter = event.detail.stateFilter;
		let rsetiFilter = event.detail.rsetiFilter;
		// Filter logic implementation
	}

	async function fetchInitialData() {
		errorMessage = '';
		noVideos = false;
		videosResult = false;
		loadingInVideos = true;

		try {
			const response = await fetch(`/apis/videos?page=0&size=1`);
			if (!response?.ok) {
				throw new Error('Error fetching initial data');
			}

			const data = await response.json();

			if (data.languageCounts && data.languageCounts.length > 0) {
				languageCounts = data.languageCounts;
				allLanguages = data.languageCounts;
			}

			totalVideos = data.page.totalElements;

			if (totalVideos === 0) {
				noVideos = true;
				errorMessage = 'No videos found.';
			}
		} catch (error) {
			console.error('Error fetching initial data:', error);
			errorMessage = 'Failed to load video data.';
		} finally {
			loadingInVideos = false;
		}
	}

	function roleBasedAcessSetting(user) {
		if (!user?.role) return;
		if (checkActionPermission(user?.role, moduleNames?.VIDEOS, actionNames?.DELETE)) {
			permissionsObject.allowVideoDeletion = true;
		} else {
			permissionsObject.allowVideoDeletion = false;
		}
		if (checkActionPermission(user?.role, moduleNames?.VIDEOS, actionNames?.ADD)) {
			permissionsObject.allowVideoBulkUpload = true;
		} else {
			permissionsObject.allowVideoBulkUpload = false;
		}
		if (checkActionPermission(user?.role, moduleNames?.VIDEOS, actionNames?.EDIT)) {
			permissionsObject.allowVideoEdit = true;
		} else {
			permissionsObject.allowVideoEdit = false;
		}
	}

	onMount(() => {
		fetchInitialData();

		const unsubscribe = userDetails?.subscribe((user) => {
			if (user && Object.keys(user)?.length > 0) {
				roleBasedAcessSetting(user);
			}
		});

		return () => unsubscribe();
	});
</script>

<h1 class="mb-4 font-semibold heading-L">Videos</h1>
<div class="mb-6">
	<VideoListingOverview />
</div>

<hr class="horizontal-line my-8" />

{#if loadingInVideos}
	<div class="grid sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-4 mt-4 mx-6 mb-4">
		{#each dummyVideoPodDetails as videoPod, index (index)}
			<VideoPodSkeleton />
		{/each}
	</div>
{/if}

<div class:hidden={loadingInVideos}>
	<div class="mt-4 mb-4" class:min-h-40={!noVideos}>
		{#if errorMessage}
			<ErrorMessage error={errorMessage} />
		{:else}
			<VideoGrid
				showModuleFilter={noVideos ? false : true}
				searchValue=""
				showSearchBar={noVideos ? false : true}
				showEditIcon={permissionsObject?.allowVideoEdit}
				showDeleteIcon={permissionsObject?.allowVideoDeletion}
				allowBulkUpload={permissionsObject?.allowVideoBulkUpload}
				totalVideos={totalVideos}
				filterOptions={filterOptions}
				languageCounts={languageCounts}
				allLanguages={allLanguages}
			/>
		{/if}
	</div>

	{#if noVideos}
		<ErrorMessageComponent />
	{/if}
</div>