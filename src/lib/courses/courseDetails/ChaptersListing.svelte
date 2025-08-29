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
	import { onMount, tick, onDestroy } from 'svelte';
	import Button from '$lib/components/Button.svelte';
	import { roles } from '$lib/config.js';
	import { userDetails } from '/src/routes/store.js';
	import { checkActionPermission } from '$lib/utils/helper.js';
	import { moduleNames, actionNames } from '$lib/data.js';
	import { languageMap, languageOrder } from '/src/config/constants.js';
	import DropDown from '$lib/components/DropDown.svelte';
	import { createEventDispatcher } from 'svelte';

	export let courseCode;
	export let chaptersData = [];
	export let courseUuid;
	export let coursesList = [];
	export let courseTitle;

	let dispatch = createEventDispatcher();
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

	// ----- Bulk Deletion Related Variables ---------

	let languageOptionsForVideoDeletion = [];
	let languageAvailableForVideos = [];
	let videoBulkDeletionModal = false;
	let bulkDeleteConfirmationText = 'Please delete the videos';
	let deleteTextInputBulkVideo = '';
	let bulkVideoDeleteTextConfirmation = false;
	let deleteIntroVideo = false;
	let includeIntroVideoInChapterBulkDeletion  = false;

	let showChapterBulkDeletionModal = false;
	let bulkChapterDeletionApiEndpoint = '';
	let bulkChapterDeletionConfirmationText = 'please delete all chapters';
	let deleteTextInputBulkChapter = '';
	let isBulkChapterDeleteConfirmed = false;
	let videoBulkDeleteSelectionError = '';
	let chapterListForDropdown = [];

	let selectedChapterForVideoDeletion = {
		id: 0,
		name: 'All',
		uuid: 'all'
	};
	let langaugeCodeForDeletion = {
		id: 0,
		name: 'All',
		code: 'all'
	};

	let permissionsObject = {
		showChapterEditIcon: false,
		showChapterDeleteIcon: false,
		showChapterAddIcon: false,
		allowReorderChapter: false
	};

	$: totalVideos = chaptersData?.reduce((total, chapter) => {
		return total + (chapter?.videos?.length || 0);
	}, 0);

	$: chaptersList =
		chaptersData?.flatMap((chapter) => {
			if (!chapter.uuid || !chapter.translations) return []; // Return early if uuid is missing
			return chapter?.translations
				.filter((translation) => translation?.languageCode === 'en')
				.map((translation) => ({
					name: translation?.title,
					id: chapter?.uuid,
					videos: chapter?.videos
				}));
		}) || [];
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
		// chapterErrorMessage.set('');
		// chapterSuccessMessage.set(`Successully moved the video - "${e.detail.newVideo?.name}".`);
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
		isModalOpen = true;
	}

	function handleCancelSubmissionChapterAddition() {
		showAddChapterModal = false;
		isModalOpen = false;
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
		isModalOpen = true;
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
		isModalOpen = false;
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

	// ------------------------ Video Bulk Deletion --------------------------

	$: bulkVideoDeleteTextConfirmation =
		normalizeText(deleteTextInputBulkVideo) === normalizeText(bulkDeleteConfirmationText);

	$: if (chaptersList?.length > 0) {
		chapterListForDropdown = [
			{
				id: 0,
				name: 'All',
				uuid: 'all'
			},
			...chaptersList
		];
	}

	$: if (!chaptersData.error && chaptersData?.length > 0) {
		let videos = chaptersData
			.map((chapter) => chapter?.videos || []) // get videos or empty array
			.flat(); // flatten the array of arrays into a single array
		populateLanguageArray(videos);
	}

	$: languageOptionsForVideoDeletion = [
		{ id: 0, name: 'All', code: 'all' },
		...(languageAvailableForVideos || [])?.map((lang) => ({
			id: lang.id,
			name: lang.name,
			code: lang.code
		}))
	];

	$: bulkDeleteInfoText = (() => {
		const chapterName = selectedChapterForVideoDeletion?.name;
		const chapterId = Number(selectedChapterForVideoDeletion?.id);
		const languageName = langaugeCodeForDeletion?.name
			? langaugeCodeForDeletion.name.charAt(0).toUpperCase() +
				langaugeCodeForDeletion.name.slice(1).toLowerCase()
			: '';
		const languageId = Number(langaugeCodeForDeletion?.id);

		const isAllChapters = chapterId === 0;
		const isAllLanguages = languageId === 0;

		let baseMessage = '';

		if (isAllChapters && isAllLanguages) {
			baseMessage = 'All videos from all chapters will be removed.';
		} else if (isAllChapters && !isAllLanguages) {
			baseMessage = `All ${languageName} videos from all chapters will be removed.`;
		} else if (!isAllChapters && isAllLanguages) {
			baseMessage = `All videos from "${chapterName}" will be removed.`;
		} else if (!isAllChapters && !isAllLanguages) {
			baseMessage = `All ${languageName} videos from "${chapterName}" will be removed.`;
		} else {
			baseMessage = 'Please select chapter and language to proceed with deletion.';
		}

		if (deleteIntroVideo && (selectedChapterForVideoDeletion?.id == 0 ||
     selectedChapterForVideoDeletion?.name?.toLowerCase()?.startsWith('chapter 0') ||
     selectedChapterForVideoDeletion?.name?.toLowerCase()?.startsWith('chapter0'))) {
			baseMessage += ' Note: Introductory video(s) will also be removed, if available.';
		}

		return baseMessage;
	})();

	$: {
		videoBulkDeleteSelectionError = '';
		// Only check if a specific chapter and a specific language are selected
		if (selectedChapterForVideoDeletion?.id !== 0 && langaugeCodeForDeletion?.id !== 0) {
			const chapter = chaptersData?.find((c) => c.uuid === selectedChapterForVideoDeletion.uuid);
			if (chapter) {
				const hasLanguage = chapter.videos?.some(
					(v) => v.languageCode === langaugeCodeForDeletion.code
				);
				if (!hasLanguage) {
					videoBulkDeleteSelectionError = `No videos in "${selectedChapterForVideoDeletion.name}" for language "${langaugeCodeForDeletion.name}".`;
				}
			}
		}
	}

	// Available Languages Array
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
						id: index + 1,
						code: languageCode,
						name: languageMap[languageCode] || 'Unknown'
					};

					languageAvailableForVideos?.push(languageObject);
					languageAvailableForVideos = languageAvailableForVideos;
				}
			});

			// Sort the languages based on the predefined order
			languageAvailableForVideos = languageAvailableForVideos.sort((a, b) => {
				return languageOrder.indexOf(a.languageCode) - languageOrder.indexOf(b.languageCode);
			});
		}
	}

	function openVideoDeletionModal() {
		videoBulkDeletionModal = true;
		isModalOpen = true;
		selectedChapterForVideoDeletion = { id: 0, name: 'All', uuid: 'all' };
		langaugeCodeForDeletion = { id: 0, name: 'All', code: 'all' };
		deleteTextInputBulkVideo = '';
		bulkVideoDeleteTextConfirmation = false;
		deleteIntroVideo = false
	}

	function handleCancelVideoBulkDeletion() {
		videoBulkDeletionModal = false;
		isModalOpen = false;
		deleteTextInputBulkVideo = '';
		selectedChapterForVideoDeletion = { id: 0, name: 'All', uuid: 'all' };
		langaugeCodeForDeletion = { id: 0, name: 'All', code: 'all' };
		deleteIntroVideo = false
	}

	function handleVideoBulkDeletion(e) {
		videoBulkDeletionModal = false;
		isModalOpen = false;
		deleteTextInputBulkVideo = '';

		const targetChapterUuid = selectedChapterForVideoDeletion?.uuid;
		const targetLanguageCode = langaugeCodeForDeletion?.code;

		const isAllChapters = targetChapterUuid === 'all' || selectedChapterForVideoDeletion?.id === 0;
		const isAllLanguages = targetLanguageCode === 'all' || langaugeCodeForDeletion?.id === 0;

		let updatedChaptersData = chaptersData?.map((chapter) => {
			let currentVideos = chapter?.videos ? [...chapter.videos] : [];
			let videosToRemove = [];

			if (isAllChapters) {
				// Affects all chapters
				if (isAllLanguages) {
					// All videos from this chapter
					videosToRemove = [...currentVideos];
				} else {
					// Specific language from this chapter
					videosToRemove = currentVideos?.filter(
						(video) => video?.languageCode === targetLanguageCode
					);
				}
			} else if (chapter?.uuid === targetChapterUuid) {
				// Affects only the selected chapter
				if (isAllLanguages) {
					// All videos from this specific chapter
					videosToRemove = [...currentVideos];
				} else {
					// Specific language from this specific chapter
					videosToRemove = currentVideos.filter(
						(video) => video?.languageCode === targetLanguageCode
					);
				}
			}

			if (deleteIntroVideo) {
				dispatch('introVideoRemoved', {languageCode:langaugeCodeForDeletion?.code});
			}

			if (videosToRemove.length > 0) {
				chapter.videos = currentVideos.filter((video) => !videosToRemove.includes(video));
				if (typeof chapter.numberOfVideos === 'number') {
					chapter.numberOfVideos = chapter.videos.length;
				}
			}
			return chapter;
		});

		chaptersData = updatedChaptersData;

		// Update languageAvailableForVideos
		const activeLanguageCodes = new Set();
		chaptersData?.forEach((chapter) => {
			chapter?.videos?.forEach((video) => {
				if (video.languageCode) {
					activeLanguageCodes?.add(video.languageCode);
				}
			});
		});

		// And the 'code' property matches video.languageCode
		languageAvailableForVideos = (languageAvailableForVideos || []).filter((lang) =>
			activeLanguageCodes.has(lang.code)
		);

		// Reset selections to default "All" after deletion
		selectedChapterForVideoDeletion = { id: 0, name: 'All', uuid: 'all' };
		langaugeCodeForDeletion = { id: 0, name: 'All', code: 'all' };
		deleteIntroVideo=false;

		chapterSuccessMessage.set(e.detail?.message || 'Successfully deleted the selected videos.');
	}

	function handleChapterSelection(e) {
		selectedChapterForVideoDeletion = {
			id: e.detail.selectedItemId - 1,
			name: e.detail.selectedItemName,
			uuid: e.detail.selectedItemUuid
		};
	}

	function handleLanguageCodeForDeletion(e) {
		langaugeCodeForDeletion = {
			id: e.detail.selectedItemId - 1,
			name: e.detail.selectedItemName,
			code: e.detail.selectedOption?.code
		};
	}

	let videoBulkDeletionApiParams = '';
	$: {
		const params = new URLSearchParams();
		if (courseUuid) {
			params.append('courseUuid', courseUuid);
		}

		if (selectedChapterForVideoDeletion?.id !== 0) {
			params.append('chapterUuid', selectedChapterForVideoDeletion.uuid);
		}
		if (langaugeCodeForDeletion?.id !== 'all' && langaugeCodeForDeletion?.id !== undefined) {
			params.append('languageCode', langaugeCodeForDeletion.code);
		}
		if(selectedChapterForVideoDeletion?.id == 0){
			params.append('disassociateAboutVideo', deleteIntroVideo ? 'true' : 'false');
		}

		videoBulkDeletionApiParams = params.toString() ? `?${params.toString()}` : '';
	}

	// Compute the correct API endpoint for video bulk deletion based on user selection
	$: videoBulkDeletionApiEndpoint = (() => {
		const courseId = courseUuid;
		const chapterId = selectedChapterForVideoDeletion?.uuid;
		const languageCode = langaugeCodeForDeletion?.code;
		const isAllChapters = chapterId === 'all' || selectedChapterForVideoDeletion?.id === 0;
		const isAllLanguages = languageCode === 'all' || langaugeCodeForDeletion?.id === 0;

		if (isAllChapters && isAllLanguages) {
			// Delete all videos in all chapters
			return `/apis/courses/details/videos/bulkDelete`;
		}
		if (isAllChapters && !isAllLanguages) {
			// Delete all videos in all chapters by language code
			return `/apis/courses/details/videos/bulkDelete/byLanguageCode`;
		}
		if (!isAllChapters && isAllLanguages) {
			// Delete all videos in a chapter
			return `/apis/courses/details/${courseId}/chapters/${chapterId}/videos/bulkDelete`;
		}
		if (!isAllChapters && !isAllLanguages) {
			// Delete videos in chapter wrt to language code
			return `/apis/courses/details/${courseId}/chapters/${chapterId}/videos/bulkDelete/byLanguageCode`;
		}
		return '';
	})();

	// ------------------------ Chapter Bulk Deletion --------------------------

	$: isBulkChapterDeleteConfirmed =
		normalizeText(deleteTextInputBulkChapter) ===
		normalizeText(bulkChapterDeletionConfirmationText);

		$:if(includeIntroVideoInChapterBulkDeletion){
		bulkChapterDeletionApiEndpoint = `/apis/courses/details/${courseUuid}/chapters/bulkDelete?disassociateAboutVideo=${includeIntroVideoInChapterBulkDeletion === true?'true' : 'false'}`;
		} else{
		bulkChapterDeletionApiEndpoint = `/apis/courses/details/${courseUuid}/chapters/bulkDelete?disassociateAboutVideo=${includeIntroVideoInChapterBulkDeletion === true?'true' : 'false'}`;
		}

	function openChapterBulkDeletionModal() {
		showChapterBulkDeletionModal = true;
		isModalOpen = true;
		deleteTextInputBulkChapter = '';
		includeIntroVideoInChapterBulkDeletion=false
		
	}

	function handleCancelChapterBulkDeletion() {
		showChapterBulkDeletionModal = false;
		isModalOpen = false;
		deleteTextInputBulkChapter = '';
		includeIntroVideoInChapterBulkDeletion=false	
	}

	async function handleConfirmChapterBulkDeletion() {
		showChapterBulkDeletionModal = false;
		isModalOpen = false;
		deleteTextInputBulkChapter = '';

		chaptersData = [];
		languageAvailableForVideos = [];

		if (includeIntroVideoInChapterBulkDeletion) {
			dispatch('introVideoRemoved', {languageCode:'all'});
		}

		includeIntroVideoInChapterBulkDeletion= false
		chapterSuccessMessage.set('Successfully deleted all the chapters.');
	}

	//---------------Drag and drop functions---------------------
	function dragStart(event, index) {
		// If any modal is open the drag events in the background are restricted
		if (isModalOpen) return;
		event.target.style.cursor = 'grab';
		draggedIndex = index;

		// Save the current state before reordering
		originalChaptersData = JSON.parse(JSON.stringify(chaptersData));
	}

	function dragOver(event) {
		if (isModalOpen) return;
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
		if (isModalOpen) return;

		let rearrangedArray = [...chaptersData]; // Clone the array
		const draggedItem = rearrangedArray[draggedIndex];

		// Remove the dragged item
		rearrangedArray.splice(draggedIndex, 1);

		// Insert the dragged item at the target index
		rearrangedArray.splice(index, 0, draggedItem);

		// Update order numbers sequentially
		rearrangedArray.forEach((item, idx) => {
			item.orderNumber = idx + 1; // Assuming orderNumber is 1-based
		});

		chaptersData = rearrangedArray;

		// Prepare reordered data for API
		const reorderedChaptersData = {
			chapters: rearrangedArray.map(({ uuid, orderNumber }) => ({ uuid, orderNumber }))
		};

		try {
			const response = await fetch(`/apis/courses/details/${courseUuid}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(reorderedChaptersData)
			});

			if (!response.ok) throw new Error('Failed to reorder chapters');

			const result = await response.json();

			if (!result.error) {
				chapterSuccessMessage.set('Chapters reordered successfully.');
			} else {
				throw new Error('API error');
			}
		} catch (error) {
			console.error(error);
			chaptersData = [...originalChaptersData]; // Revert on failure
			chapterErrorMessage.set('Failed to reorder chapters.');
		}

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
		goto(`/courses/${courseUuid}/details/videoBulkUpload`);
	}

	function handleBulkUploadChapterTranslations() {
		goto(`/courses/${courseUuid}/details/chapterTranslationBulkUpload`);
	}

	function handleModalOpened() {
		isModalOpen = true;
	}

	function handleModalClosed() {
		isModalOpen = false;
	}

	function roleBasedAcessSetting() {
		if (!$userDetails?.role) return;
		if (
			checkActionPermission($userDetails?.role, moduleNames?.COURSES, actionNames?.EDIT_CHAPTER)
		) {
			permissionsObject.showChapterEditIcon = true;
		} else {
			permissionsObject.showChapterEditIcon = false;
		}
		if (checkActionPermission($userDetails?.role, moduleNames?.COURSES, actionNames?.ADD_CHAPTER)) {
			permissionsObject.showChapterAddIcon = true;
		} else {
			permissionsObject.showChapterAddIcon = false;
		}
		if (
			checkActionPermission($userDetails?.role, moduleNames?.COURSES, actionNames?.DELETE_CHAPTER)
		) {
			permissionsObject.showChapterDeleteIcon = true;
		} else {
			permissionsObject.showChapterDeleteIcon = false;
		}
		if (
			checkActionPermission($userDetails?.role, moduleNames?.COURSES, actionNames?.REORDER_CHAPTER)
		) {
			permissionsObject.allowReorderChapter = true;
		} else {
			permissionsObject.allowReorderChapter = false;
		}
	}

	onMount(() => {
		hashRouteId = $page.url.hash ? $page.url.hash.slice(1) : '';
		if (hashRouteId && accordionRef[hashRouteId]?.handleAccordionOpen) {
			accordionRef[hashRouteId].handleAccordionOpen();
		} else {
			console.error(`AccordionRef for hashRouteId ${hashRouteId} not found.`);
		}

		const unsubscribe = userDetails?.subscribe((user) => {
			if (user && Object.keys(user)?.length > 0) {
				roleBasedAcessSetting(user);
			}
		});

		return () => unsubscribe();
	});

	onDestroy(() => {
		chapterErrorMessage.set('');
		chapterSuccessMessage.set('');
	});
</script>

<h2 class="text-darkGray font-semibold mb-4">
	Chapters ({chaptersData?.length ? chaptersData?.length : 0})
</h2>

<div class="flex flex-col gap-2 sm:gap-0 sm:flex-row sm:justify-between sm:items-center mb-2">
	<h2 class="text-darkGray font-medium text-sm">
		Total Videos: {totalVideos || '-'}
	</h2>
	{#if permissionsObject.showChapterAddIcon}
		<div class="flex gap-2">
			{#if totalVideos > 0}
				<Button btnType="danger" on:click={openVideoDeletionModal}>Delete Videos</Button>
			{/if}
			{#if chaptersData.length > 0}
				<Button btnType="danger" on:click={openChapterBulkDeletionModal}>Delete Chapters</Button>
			{/if}
		</div>
	{/if}
</div>

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
				draggable={!isModalOpen && permissionsObject?.allowReorderChapter}
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
					draggable={!isModalOpen && permissionsObject.allowReorderChapter}
					editIcon={permissionsObject.showChapterEditIcon}
					deleteIcon={permissionsObject.showChapterDeleteIcon}
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
	{#if permissionsObject.showChapterAddIcon}
		<div class="rounded-lg border-dashed border-2 border-gray-70 p-3">
			<div class="flex flex-wrap gap-2">
				<Button btnType="primary" on:click={handleAddChapterModal}>+ Add Chapter</Button>
				<Button btnType="secondary" on:click={handleBulkUploadChapters}>Bulk Upload Videos</Button>
				<Button btnType="secondary" on:click={handleBulkUploadChapterTranslations}
					>Bulk Upload Chapter Translation</Button
				>
			</div>
		</div>
	{/if}
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

{#if videoBulkDeletionModal}
	<DeletionModalViaAPI
		id={''}
		name={courseTitle}
		heading={`About to remove videos from the course`}
		para={'Are you sure you want to remove the videos? This action cannot be undone.'}
		endPoint={videoBulkDeletionApiEndpoint}
		queryParams={videoBulkDeletionApiParams}
		deleteTextConfirmation={bulkVideoDeleteTextConfirmation && !videoBulkDeleteSelectionError}
		on:handleCancelDeletion={handleCancelVideoBulkDeletion}
		on:handleDeletion={handleVideoBulkDeletion}
	>
		<div class="flex flex-col gap-4 p-6 bg-white rounded-lg border border-gray-50 my-4">
			<!-- Course Info -->
			<div>
				<p class="text-sm text-darkGray capitalize mb-1">
					<span class="font-medium">Course Title :</span>
					{courseTitle}
				</p>
			</div>
			<!-- Chapter Selection -->
			<div>
				<DropDown
					on:handleDispatchFilterData={handleChapterSelection}
					on:handleCancelSelection={() => {
						selectedChapterForVideoDeletion = { id: 0, name: 'All', uuid: 'all' };
					}}
					bind:selectedItemId={selectedChapterForVideoDeletion.id}
					bind:selectedItemName={selectedChapterForVideoDeletion.name}
					options={chapterListForDropdown || []}
					type={'chapterDropdown'}
					title={'Select Chapter'}
				/>
			</div>
			<!-- Language Code Selection -->
			<div>
				<DropDown
					on:handleDispatchFilterData={handleLanguageCodeForDeletion}
					on:handleCancelSelection={() => {
						langaugeCodeForDeletion = { id: 0, name: 'All', code: 'all' };
					}}
					bind:selectedItemId={langaugeCodeForDeletion.id}
					bind:selectedItemName={langaugeCodeForDeletion.name}
					options={languageOptionsForVideoDeletion || []}
					type={'language drop down'}
					title={'Select Language'}
				/>
			</div>

			{#if selectedChapterForVideoDeletion?.id == 0}
				<div class="flex items-center gap-2">
					<input
						type="checkbox"
						id="deleteIntro"
						bind:checked={deleteIntroVideo}
						class="accent-red-600 w-3 h-3"
						disabled={selectedChapterForVideoDeletion?.id !== 0 
    }
					/>
					<label for="deleteIntro" class="text-xs text-darkGray">
						Delete Course Introductory Video
					</label>
				</div>
			{/if}

			{#if videoBulkDeleteSelectionError}
				<p class="text-xs italic text-red-600">{videoBulkDeleteSelectionError}</p>
			{:else}
				<p class="text-xs italic text-red-600">{bulkDeleteInfoText}</p>
			{/if}
		</div>
		<!-- Confirmation Input -->
		<div>
			<InputField
				label={`Type '${bulkDeleteConfirmationText}' to confirm`}
				placeholder={`Type '${bulkDeleteConfirmationText}'`}
				name={'deletion'}
				labelFontWeight={'font-normal'}
				bind:value={deleteTextInputBulkVideo}
				required
			/>
		</div>
	</DeletionModalViaAPI>
{/if}

{#if showChapterBulkDeletionModal}
	<DeletionModalViaAPI
		id={``}
		name={`all chapters for ${courseTitle}`}
		heading={`About to delete all chapters for the course - ${courseTitle}`}
		para={'Are you sure you want to delete all the chapters? This action cannot be undone and will remove all associated videos as well.'}
		endPoint={bulkChapterDeletionApiEndpoint}
		queryParams={``}
		deleteTextConfirmation={isBulkChapterDeleteConfirmed}
		on:handleCancelDeletion={handleCancelChapterBulkDeletion}
		on:handleDeletion={handleConfirmChapterBulkDeletion}
	>
		<!-- Scrollable section with better spacing -->
		<div
			class="flex flex-col gap-4 p-6 bg-white rounded-lg border border-gray-50 my-4 max-h-64 overflow-y-auto"
		>
			<p class="text-sm text-darkGray">The following chapters will be permanently deleted:</p>
			{#if chaptersData && chaptersData?.length > 0}
				<ul class="space-y-2 text-sm text-darkGray">
					{#each chaptersData as chapter (chapter.uuid)}
						<li class="flex items-start justify-between p-3 rounded-md border border-gray-200">
							<span class="font-medium truncate text-sm">
								{getTranslation(chapter.translations, 'en') || 'Untitled Chapter'}
							</span>
							<span class="text-gray-500 text-xs whitespace-nowrap">
								({chapter.videos?.length || 0} video{chapter.videos?.length !== 1 ? 's' : ''})
							</span>
						</li>
					{/each}
				</ul>
				<div class="flex items-center gap-2">
					<input
						type="checkbox"
						id="deleteIntro"
						bind:checked={includeIntroVideoInChapterBulkDeletion}
						class="accent-red-600 w-3 h-3"
					/>
					<label for="deleteIntro" class="text-xs text-darkGray">
						Delete Course Introductory Videos
					</label>
				</div>
			{:else}
				<p class="text-sm text-gray-500 italic">No chapters to display.</p>
			{/if}
		</div>
		<div>
			<InputField
				label={`Type '${bulkChapterDeletionConfirmationText}' to confirm`}
				placeholder={`Type '${bulkChapterDeletionConfirmationText}'`}
				name={'bulkChapterDeletionConfirm'}
				labelFontWeight={'font-normal'}
				bind:value={deleteTextInputBulkChapter}
				required
			/>
		</div>
	</DeletionModalViaAPI>
{/if}
