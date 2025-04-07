<script>
	import { formatDurationHHMM } from '$lib/utils/helper.js';
	import { goto } from '$app/navigation';
	import DeletionModalViaAPI from '$lib/components/DeletionModalViaAPI.svelte';
	import CoursePopUp from '$lib/videos/videoListing/CoursePopUp.svelte';
	import InputField from '$lib/components/InputField.svelte';
	import { createEventDispatcher } from 'svelte';
	import Button from '$lib/components/Button.svelte';
	import Edit from '$lib/svgComponents/Edit.svelte'
	import Delete from '$lib/svgComponents/Delete.svelte';
	import {userDetails} from '/src/routes/store.js'
	import { onMount } from 'svelte';
	import { checkActionPermission } from '$lib/utils/helper.js'
	import {moduleNames, actionNames} from '$lib/data.js'

	export let video;
	export let courseCodeData = '';
	export let showEditIcon = true;
	export let showDeleteIcon = true;

	let showCoursesPopup = false;
	let deleteTextInput = '';
	let deletionConfirmText = 'please delete this video';
	let deleteTextConfirmation = false;
	let dispatch = createEventDispatcher();

	let formObject = {
		courseCode: courseCodeData ? courseCodeData : '',
		title: video?.title,
		topic: video?.topic,
		module: video?.module,
		uuid: video?.uuid,
		videoURL: video?.url,
		description: video?.description

	};

	let permissionsObject ={
	allowVideoDeletion: false,
	allowVideoEdit:false
	}

	let showDeletionModal = false;

		// Function to normalize text (removes spaces and ignores case)
		const normalizeText = (text) => text?.trim().toLowerCase().replace(/\s+/g, ' ');

		// Function to check if input matches the required text
		$: isTextValid(deleteTextInput);
		function isTextValid() {
		deleteTextConfirmation = normalizeText(deleteTextInput) === normalizeText(deletionConfirmText);
		}

	function handleEditVideo() {
		dispatch('handleEditModal', video);
	}

	function handleDeleteButtonClick(video) {
		showDeletionModal = true;
	}

	function handleCancelDeletion() {
		deleteTextInput = '';
		showDeletionModal = false;
	}

	function handleDeletion(e) {
		let deletedItem = e.detail;
		dispatch('handleDeletion', deletedItem)
	}

	function getCourseUrl(course, video) {
        const chapter = video?.chapters?.find(ch => ch.courseUuid === course?.uuid);
        return `/courses/${course?.uuid}/details${chapter ? `#${chapter?.uuid}` : ''}`;
    }

    function getEnglishTranslations(course) {
        return course?.translations?.filter(t => t?.languageCode === "en") || [];
    }

	function handleCoursesClick(event) {
		event.preventDefault();
		event.stopPropagation();
		showCoursesPopup = true;
	}

	function handleCloseCoursesPopup() {
		showCoursesPopup = false;
	}

	function roleBasedAcessSetting(){
		if(!$userDetails?.role) return
		if(checkActionPermission($userDetails?.role, moduleNames?.COURSES,actionNames?.DELETE_VIDEO)){
			permissionsObject.allowVideoDeletion=true	
		} else{
			permissionsObject.allowVideoDeletion=false	

		}

		if(checkActionPermission($userDetails?.role, moduleNames?.COURSES,actionNames?.EDIT_VIDEO)){
			permissionsObject.allowVideoEdit=true	
		} else{
			permissionsObject.allowVideoEdit=false	

		}
		}

	onMount(() => {
		const unsubscribe = userDetails?.subscribe((user) => {
			if (user && Object.keys(user)?.length > 0) {
				roleBasedAcessSetting(user);
			}
		});

		return () => unsubscribe(); // Cleanup subscription
	});

</script>


<a class="w-full block" href="/videos/{video?.uuid}/details">
	<div class="overflow-hidden bg-white shadow-md rounded-md h-40 hover:cursor-pointer text-darkGray leading-5 flex">

		<img
			src={video?.thumbnail ? video?.thumbnail : '/videoThumbnail.png'}
			alt="thumbnail of the video"
			class="w-1/3 rounded-l-md object-cover"
			on:error={(event) => (event.target.src = '/videoThumbnail.png')}
		/>
		<div class="flex flex-col gap-2 sm:gap-3 p-2 sm:p-4 w-2/3 justify-between overflow-hidden">
			<div class="flex flex-col gap-1 sm:gap-0.5 overflow-hidden">

				<span class="font-bold text-sm sm:text-base line-clamp-2 mb-2 break-words" title={video?.name}>

					{video?.name}
				</span>
		
				<span class="text-xs sm:text-sm line-clamp-1 break-words" title={video?.description}>
					{video?.description}
				</span>
				<span
					class="text-xs sm:text-sm line-clamp-1 break-words cursor-pointer text-blue-600 hover:underline"
					title="Click to view courses"
					on:click|stopPropagation|preventDefault={handleCoursesClick}
				>

					No. of courses: {Array.from(new Set(video?.courses?.map(course => course.uuid))).length}

				</span>
			</div>

			<div class="text-xs flex flex-wrap justify-between items-center mt-auto">
				<span class="text-xs rounded-full h-6 border-gray-90 border px-2 py-1 flex items-center">
					{formatDurationHHMM(video?.duration)}
				</span>
				{#if permissionsObject?.allowVideoDeletion && permissionsObject?.allowVideoEdit}
				<div class="flex items-center ">
					{#if showEditIcon}
					<Button
					btnType="custom"
					  on:click={handleEditVideo} class="p-1"
					>
					  <Edit size={8} stroke="#143164" />
					  <span class="sr-only">Edit</span>
					</Button>
					{/if}
					{#if showDeleteIcon}

					<Button
					on:click={() => handleDeleteButtonClick(video)}
							class="p-1"
					  >
						<Delete size={8} stroke="#B91C1C" />
						<span class="sr-only">Delete</span>
					  </Button>
					{/if}
				</div>
				{/if}
			</div>
		</div>
	</div>
</a>

{#if showDeletionModal}
	<DeletionModalViaAPI 
		id={video?.uuid} 
		name={video?.name} 
		heading={`About to delete the video - "${video?.name}"`} 
		para={'Are you sure you want to delete the video? Deleting this video will also remove it from all associated courses.'} 
		endPoint={'/apis/videos/delete/'}
		on:handleCancelDeletion={handleCancelDeletion}
		on:handleDeletion={(e) => handleDeletion(e)}
	>
			<div
				class=" flex flex-col gap-2 p-6 bg-offwhite rounded-lg mb-4 border border-gray-50 text-darkGray"
			>
				<!-- <div>
					<p class="text-sm capitalize">
						<span class="label">Title :</span>
						{video?.name || '-'}
					</p>
				</div>
				<hr class="horizontal-line my-1" /> -->

				<!-- <p class="text-sm">
					<span class="font-medium">Courses: </span>
					{#if video?.courses?.length > 0}
						{#each video?.courses as course, courseIndex}
							{#each getEnglishTranslations(course) as translation, translationIndex}
								<a href={getCourseUrl(course, video)} class="text-blue-600 hover:underline">
									{translation.title}
								</a>
								{courseIndex < video.courses.length - 1 || translationIndex < getEnglishTranslations(course).length - 1 ? ', ' : ''}
							{/each}
						{/each}
					{:else}
						-
					{/if}
				</p> -->
				<p class="text-sm">
					<span class="font-medium">Courses Affected: </span>
					{#if video?.courses?.length > 0}
						{#each video?.courses as course}
							{#each getEnglishTranslations(course) as translation}
								<a href={getCourseUrl(course, video)} class="text-blue-600 hover:underline">
									{translation?.title || '-'}
								</a>
								<br>
							{/each}
						{/each}
					{:else}
						-
					{/if}
				</p>
				
				<p class="text-sm">
					<span class="font-medium break-all">Description : </span>{video?.description || '-'}
				</p>
			</div>

			<div class="">
				<InputField
					label={"Type 'Please delete this video' to confirm"}
					placeholder={" Type 'Please delete this video'"}
					name={'deletion'}
					labelFontWeight={'font-normal'}
					bind:value={deleteTextInput}
					required
				/>
			</div>
		</DeletionModalViaAPI>
{/if}

{#if showCoursesPopup}
	<CoursePopUp 
		courses={video?.courses} 
		chapters={video?.chapters} 
		on:close={handleCloseCoursesPopup} 
	/>
{/if}


