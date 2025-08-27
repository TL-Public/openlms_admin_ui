<script>
	import { roles } from '$lib/config.js';
	import { userDetails } from '/src/routes/store.js';
	import { onDestroy, onMount, createEventDispatcher } from 'svelte';
	import { checkActionPermission, extractYouTubeVideoId } from '$lib/utils/helper.js';
	import { moduleNames, actionNames } from '$lib/data.js';
	import { languageMap, languageArray } from '/src/config/constants.js';
	import VideoPlayer from '$lib/components/VideoPlayer.svelte';
	import AddIntroVideo from '$lib/courses/courseDetails/IntroVideos/AddIntroVideo.svelte';
	import InputField from '$lib/components/InputField.svelte';
	import DeletionModalViaAPI from '$lib/components/DeletionModalViaAPI.svelte';
	import GoogleMatrialIcon from '$lib/components/GoogleMatrialIcon.svelte';
	import Button from '$lib/components/Button.svelte';
	import { chapterSuccessMessage as introVideoMessage } from '/src/routes/courses/courseStore.js';
	import ErrorMessage from '$lib/components/ErrorMessage.svelte';
	import KpointPlayer from '$lib/components/KpointPlayer.svelte';

	export let courseData = {};
	export let introVideos = [];
	export let deletedIntroVideoLanguageCode = null;

	let selectedVideoLanguage = 'en';
	let videoId = 'null';
	let deletionConfirmText = 'please delete this video';
	let deleteTextConfirmation = false;
	let deleteTextInput = '';
	let bulkDeletionConfirmText = 'please delete the videos';
	let bulkDeleteTextConfirmation = false;
	let bulkDeleteTextInput = '';
	let currentModal = null;
	let selectedVideo = {};
	let lastOrderNumber;
	let dispatch = createEventDispatcher();
	let permission = {
		add:false,
		delete:false
	}

	$: availableLanguagesForAdd =
		Array.isArray(languageArray) && Array.isArray(introVideos) && !introVideos.error
			? languageArray?.filter(
					(lang) => !introVideos?.some((video) => video.languageCode === lang.code)
				)
			: [];

	// ------------------------- Video related Functions -----------------------------

	function updateVideoId() {
		const selectedVideo = introVideos?.find((t) => t?.languageCode === selectedVideoLanguage);
		// for kpoint player instead of url we are sending extid, when migrating to VMS Player change this from extId to url
		// videoId = selectedVideo?.videoUrl || selectedVideo?.url || 'null';
		videoId = selectedVideo?.videoExtId || selectedVideo?.extId ||  'null';
	}

	function handleVideoLanguageSelection(languageCode) {
		selectedVideoLanguage = languageCode;
		updateVideoId();
	}

	function getLanguageDisplayName(languageCode) {
		return languageMap[languageCode] || languageCode;
	}

	// --------------------------- Modal Control Functions ------------------------------

	function openModal(modalType, video = {}) {
		currentModal = modalType;
		selectedVideo = video || {};
	}

	function closeModal() {
		currentModal = null;
		deleteTextInput = '';
		deleteTextConfirmation = false;
		bulkDeleteTextConfirmation=false
		bulkDeleteTextInput=''
		deletedIntroVideoLanguageCode = null;
	}

	// -------------------------- Add Video ---------------------------------------------

	function handleAddVideo(e) {
		let newIntroVideo = e.detail;
		let updatedIntroVideosArray = [...introVideos, newIntroVideo];
		introVideos = [...updatedIntroVideosArray];

		introVideoMessage.set(
			`Successfully added introductory video in ${getLanguageDisplayName(newIntroVideo?.languageCode) || '-'}.`
		);
		dispatch('introVideoAdded', introVideos);
		closeModal();
		selectedVideoLanguage = newIntroVideo.languageCode;
		updateVideoId();
	}

	// -------------------------------- Delete Video -------------------------------------------

	const normalizeText = (text) => text?.trim().toLowerCase().replace(/\s+/g, ' ');

	$: isTextValid(deleteTextInput);
	function isTextValid() {
		deleteTextConfirmation = normalizeText(deleteTextInput) === normalizeText(deletionConfirmText);
	}

	$:bulkDeleteTextConfirmation =
		normalizeText(bulkDeleteTextInput) === normalizeText(bulkDeletionConfirmText);

	function handleDeleteVideo(e) {
		let deletedVideo = e.detail;

		let deletedVideoObj = introVideos?.find(
			(video) => video.uuid === deletedVideo || video.videoUuid === deletedVideo
		);

		let updatedIntroVideos = introVideos?.filter((video) => video.uuid !== deletedVideo && video?.videoUuid !== deletedVideo);
		introVideos = [...updatedIntroVideos];
	
		selectedVideoLanguage = introVideos && introVideos[0]?.languageCode;
		updateVideoId();
		dispatch('introVideoDeleted', introVideos);
		introVideoMessage.set(
			`Succesfully removed introductory video in ${getLanguageDisplayName(deletedVideoObj?.languageCode) || '-'}.`
		);
		closeModal();
	}

	function handleDeleteAllVideos() {
		deletedIntroVideoLanguageCode = 'all';
		introVideoMessage.set('Successfully deleted all introductory videos.');
		introVideos = [];
		dispatch('introVideoDeleted', introVideos);
		closeModal();
	}

	// --------------------------- Lifecycle Hooks -------------------------------------------

	onMount(() => {
		if (introVideos && introVideos.length > 0) {
			selectedVideoLanguage = introVideos[0]?.languageCode;
			updateVideoId();
		}

		// Role-based access settings (Placeholder for actual implementation)
		const unsubscribe = userDetails?.subscribe((user) => {
			if (user && Object.keys(user)?.length > 0) {
				if (checkActionPermission(user?.role, moduleNames.VIDEOS, actionNames?.ADD)) {
					permission.add=true;
				} else {
					permission.add=false
				}
			}
		});

		return () => unsubscribe();
	});

	onDestroy(() => {
		introVideoMessage.set('');
	});

	// ------------------------------ General Functions ---------------------------------

	$: if (deletedIntroVideoLanguageCode && introVideos) {
		const deletedLangCode = deletedIntroVideoLanguageCode.toLowerCase();

		if (deletedLangCode === 'all') {
			introVideos = [];
			videoId = 'null';
		} else {
			introVideos = introVideos.filter(
				(video) => video.languageCode.toLowerCase() !== deletedLangCode
			);

			// Check if the currently selected language was removed
			if (selectedVideoLanguage?.toLowerCase() === deletedLangCode) {
				videoId = 'null';
				selectedVideoLanguage = introVideos[0]?.languageCode;
				updateVideoId();
			} else {
				updateVideoId();
			}
		}
		deletedIntroVideoLanguageCode = null;
		dispatch('introVideoDeleted', introVideos);
	}

	$: findOrderNUmberOfLastVideo(introVideos);
	function findOrderNUmberOfLastVideo() {
		lastOrderNumber = introVideos[introVideos?.length - 1]?.orderNumber || 0;
	}

	function getCourseTitle() {
		return courseData?.translations?.find((t) => t?.languageCode === 'en')?.title || '';
	}
</script>

<div class="shadow bg-offwhite rounded-lg p-6 my-4">
	{#if !introVideos?.error}
		<div class="flex flex-col lg:flex-row gap-8 lg:gap-4">
			<div class="w-full sm:w-3/4 lg:w-1/2">
				<h3 class="heading-L mb-2">Introductory Videos</h3>
				<div
					class="aspect-video w-full shadow-lg rounded-lg overflow-hidden bg-black flex items-center justify-center"
				>
					{#if introVideos?.length > 0}
						<VideoPlayer videoId={extractYouTubeVideoId(videoId)} />
						 
						<!-- <KpointPlayer videoId={videoId} /> -->
					{:else if introVideos?.length === 0}
						<div class="text-center bg-black text-white">
							<p class="text-sm">No introductory video added yet.</p>
						</div>
					{/if}
				</div>
			</div>

			<div class="flex flex-col lg:mt-8 lg:w-1/2 justify-start">
				<div class="mb-4">
					{#if introVideos?.length > 0}
						<div class="flex items-center justify-between mb-2">
							<div class="text-xs font-semibold text-gray-600">Available Introductory Videos:</div>
						</div>
						<div class="grid grid-cols-2 bp-420px:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-3 gap-2">
							{#each introVideos as video (video.videoUuid || video?.uuid)}
								<div
									class="flex items-center justify-between px-2 py-1 rounded border-2 transition-all cursor-pointer text-xs {selectedVideoLanguage ===
									video.languageCode
										? 'border-primary bg-primary text-white'
										: 'border-gray-300 bg-white text-gray-700 hover:border-primary'}"
									role="button"
									tabindex="0"
									on:click={() => handleVideoLanguageSelection(video.languageCode)}
									on:keydown={(event) => {
										if (event.key === 'Enter' || event.key === ' ') {
											event.preventDefault();
											handleVideoLanguageSelection(video.languageCode);
										}
									}}
								>
									<span class="font-medium truncate">
										{getLanguageDisplayName(video.languageCode) || '-'}
									</span>
									{#if permission.add}
									<div class="flex items-center gap-1 ml-1">
										<button
											class="p-0.5 rounded hover:bg-black hover:bg-opacity-10 transition-colors"
											on:click={(event) => {
												event.stopPropagation();
												openModal('delete', video);
											}}
											title="Delete video"
											aria-label="Delete Video"
										>
											<GoogleMatrialIcon iconName={'delete'} addClass="text-xs" />
										</button>
									</div>
									{/if}
								</div>
							{/each}
						</div>
					{:else}
						<p class="text-sm text-darkGray leading-relaxed">
							Start by uploading introductory videos for the course.
						</p>
					{/if}
				</div>

				<div class="flex flex-col bp-420px:flex-row gap-2 justify-start lg:justify-end flex-wrap">
					{#if availableLanguagesForAdd && availableLanguagesForAdd?.length > 0 && !introVideos?.error && permission.add}
						<Button on:click={() => openModal('add')} aria-label="Add Intro Video">
							<GoogleMatrialIcon iconName={'add'} addClass="text-xs" />
							<span class="text-sm font-medium">Add Video </span>
						</Button>
					{/if}

					{#if introVideos.length > 0 && permission.add}
						<Button
							btnType="danger"
							on:click={() => openModal('deleteAll')}
							aria-label="Delete All Intro Videos"
						>
							<GoogleMatrialIcon iconName="delete" addClass="text-xs" />
							<span class="text-sm font-medium">Delete All</span>
						</Button>
					{/if}

				
				</div>
					{#if !introVideos?.error && availableLanguagesForAdd && availableLanguagesForAdd?.length === 0}
						<div class="flex items-center mt-2 lg:justify-end">
							<GoogleMatrialIcon iconName="info" addClass="text-sm mr-1 text-blue-500" />
							<span class="text-xs text-blue-700">
								Introductory videos are added for all available languages.
							</span>
						</div>
					{/if}
			</div>
		</div>
	{:else}
		<ErrorMessage error="Failed to load introductory videos" />
	{/if}
</div>

{#if currentModal === 'add'}
	<AddIntroVideo
		mode="add"
		{availableLanguagesForAdd}
		{introVideos}
		orderNumber={lastOrderNumber + 1}
		courseUuid={courseData?.uuid}
		on:handleAddVideo={handleAddVideo}
		on:handleCancelSubmission={closeModal}
	/>
{/if}

{#if currentModal === 'delete'}
	<DeletionModalViaAPI
		id={selectedVideo?.videoUuid || selectedVideo?.uuid}
		name={selectedVideo?.title}
		heading={`About to delete the Introductory Video`}
		para={'Are you sure you want to delete the video? This action cannot be undone.'}
		endPoint={`/apis/courses/details/${courseData?.uuid}/introVideos/`}
		{deleteTextConfirmation}
		queryParams={`{?courseUuid=${courseData?.uuid}&&videoUuid=${selectedVideo?.videoUuid || selectedVideo?.uuid}`}
		on:handleCancelDeletion={closeModal}
		on:handleDeletion={handleDeleteVideo}
	>
		<div
			class=" flex flex-col gap-2 p-6 bg-offwhite rounded-lg mb-4 border border-gray-50 text-darkGray"
		>
			<div class="space-y-1">
				<p class="text-sm capitalize">
					<span class="label">Course :</span>
					{getCourseTitle()}
				</p>

				<p class="text-sm">
					<span class="font-medium">Langauge : </span>
					{getLanguageDisplayName(selectedVideo?.languageCode)}
				</p>
				<p class="text-sm">
					<span class="font-medium">Langauge Code : </span>{selectedVideo?.languageCode || '-'}
				</p>
			</div>
		</div>

		<div class="">
			<InputField
				label={"Type 'Please delete this video' to confirm"}
				placeholder={"Type 'Please delete this video'"}
				name={'deletion'}
				labelFontWeight={'font-normal'}
				bind:value={deleteTextInput}
				required
			/>
		</div>
	</DeletionModalViaAPI>
{/if}

{#if currentModal === 'deleteAll'}
	<DeletionModalViaAPI
		id=""
		heading="Delete All Introductory Videos"
		para="Are you sure you want to delete all introductory videos for this course? This action cannot be undone."
		endPoint={`/apis/courses/details/${courseData?.uuid}/introVideos/`}
		{bulkDeleteTextConfirmation}
		queryParams={`?courseUuid=${courseData?.uuid}`}
		on:handleCancelDeletion={closeModal}
		on:handleDeletion={handleDeleteAllVideos}
	>
		<div
			class="flex flex-col gap-2 p-6 bg-offwhite rounded-lg mb-4 border border-gray-50 text-darkGray"
		>
			<p class="text-sm">
				<span class="font-medium">Course :</span>
				{getCourseTitle()}
			</p>
		</div>

		<InputField
			label={"Type 'Please delete the videos' to confirm"}
			placeholder={"Type 'Please delete the videos'"}
			name={'deletion'}
			labelFontWeight={'font-normal'}
			bind:value={deleteTextInput}
			required
		/>
	</DeletionModalViaAPI>
{/if}
