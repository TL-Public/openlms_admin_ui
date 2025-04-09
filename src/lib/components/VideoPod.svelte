<script>
	import { formatDurationHHMM } from '$lib/utils/helper.js';
	import { goto } from '$app/navigation';
	import DeletionModalViaAPI from '$lib/components/DeletionModalViaAPI.svelte';
	import CoursePopUp from '$lib/videos/videoListing/CoursePopUp.svelte';

	export let video;
	export let courseCodeData = '';
	export let showEditIcon = true;
	export let showDeleteIcon = true;

	let showCoursesPopup = false;

	let formObject = {
		courseCode: courseCodeData ? courseCodeData : '',
		title: video?.title,
		topic: video?.topic,
		module: video?.module,
		uuid: video?.uuid,
		videoURL: video?.url,
		description: video?.description

	};

	let showDeletionModal = false;

	function handleGoToEditPage() {
		goto(`/videos/edit?data=${encodeURIComponent(JSON.stringify(formObject))}`);
	}

	function handleDeleteButtonClick(id) {
		showDeletionModal = true;
	}

	function handleCancelDeletion() {
		showDeletionModal = false;
	}

	function handleDeletion(e) {
		let deletedItem = e.detail;
		// Handle deletion logic here
	}

	function handleCoursesClick(event) {
		event.preventDefault();
		event.stopPropagation();
		showCoursesPopup = true;
	}

	function handleCloseCoursesPopup() {
		showCoursesPopup = false;
	}
</script>


<a class="w-full block" href="/videos/{video?.uuid}/details">
	<div class="overflow-hidden bg-white shadow-md rounded-md h-40 hover:cursor-pointer text-darkGray leading-5 flex">

		<img
			src={video?.thumbnail ? video?.thumbnail : '/videoThumbnail.png'}
			alt="thumbnail of the video"
			class="w-1/3 rounded-l-md object-cover"
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
				<div class="flex items-center gap-2">
					{#if showEditIcon}
						<button on:click|stopPropagation|preventDefault={handleGoToEditPage} class="p-1">

							<svg
								width="18"
								height="18"
								viewBox="0 0 18 18"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d="M8.29199 2.19763H6.87533C3.33366 2.19763 1.91699 3.6143 1.91699 7.15597V11.406C1.91699 14.9476 3.33366 16.3643 6.87533 16.3643H11.1253C14.667 16.3643 16.0837 14.9476 16.0837 11.406V9.9893"
									stroke="#565E6C"
									stroke-width="1.5"
									stroke-linecap="round"
									stroke-linejoin="round"
								/>
								<path
									d="M11.8618 2.92023L6.28016 8.5019C6.06766 8.7144 5.85516 9.13231 5.81266 9.4369L5.50808 11.569C5.39474 12.3411 5.94016 12.8794 6.71224 12.7731L8.84432 12.4686C9.14182 12.4261 9.55974 12.2136 9.77933 12.0011L15.361 6.4194C16.3243 5.45606 16.7777 4.3369 15.361 2.92023C13.9443 1.50356 12.8252 1.9569 11.8618 2.92023Z"
									stroke="#565E6C"
									stroke-width="1.5"
									stroke-miterlimit="10"
									stroke-linecap="round"
									stroke-linejoin="round"
								/>
								<path
									d="M11.0615 3.72058C11.5361 5.4135 12.8607 6.73808 14.5607 7.21975"
									stroke="#565E6C"
									stroke-width="1.5"
									stroke-miterlimit="10"
									stroke-linecap="round"
									stroke-linejoin="round"
								/>

							</svg>
						</button>
					{/if}
					{#if showDeleteIcon}
						<button
							on:click|stopPropagation|preventDefault={() => handleDeleteButtonClick(video?.uuid)}
							class="p-1"
						>
							<svg
								width="19"
								height="19"
								viewBox="0 0 19 19"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d="M16.25 5.26636C13.7525 5.01886 11.24 4.89136 8.735 4.89136C7.25 4.89136 5.765 4.96636 4.28 5.11636L2.75 5.26636"
									stroke="#565E6C"
									stroke-width="1.5"
									stroke-linecap="round"
									stroke-linejoin="round"
								/>
								<path
									d="M6.875 4.50851L7.04 3.52601C7.16 2.81351 7.25 2.28101 8.5175 2.28101H10.4825C11.75 2.28101 11.8475 2.84351 11.96 3.53351L12.125 4.50851"
									stroke="#565E6C"
									stroke-width="1.5"
									stroke-linecap="round"
									stroke-linejoin="round"
								/>
								<path
									d="M14.6373 7.63574L14.1498 15.1882C14.0673 16.3657 13.9998 17.2807 11.9073 17.2807H7.0923C4.9998 17.2807 4.9323 16.3657 4.8498 15.1882L4.3623 7.63574"
									stroke="#565E6C"
									stroke-width="1.5"
									stroke-linecap="round"
									stroke-linejoin="round"
								/>
								<path
									d="M8.24805 13.156H10.7455"
									stroke="#565E6C"
									stroke-width="1.5"
									stroke-linecap="round"
									stroke-linejoin="round"
								/>
								<path
									d="M7.625 10.156H11.375"
									stroke="#565E6C"
									stroke-width="1.5"
									stroke-linecap="round"
									stroke-linejoin="round"
								/>

							</svg>
						</button>
					{/if}
				</div>
			</div>
		</div>
	</div>
</a>

{#if showDeletionModal}

	<DeletionModalViaAPI 
		id={video?.uuid} 
		name={video?.title} 
		heading={'Video Deletion'} 
		para={'Are you sure you want to delete Video?'} 
		endPoint={'/apis/videos/delete/'}
		on:handleCancelDeletion={handleCancelDeletion}
		on:handleDeletion={(e) => handleDeletion(e)}
	/>
{/if}

{#if showCoursesPopup}
	<CoursePopUp 
		courses={video?.courses} 
		chapters={video?.chapters} 
		on:close={handleCloseCoursesPopup} 
	/>
{/if}


