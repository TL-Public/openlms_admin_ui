<script>
	import { formatDurationHHMM } from '$lib/utils/helper.js';
	import { createEventDispatcher } from 'svelte';
	import VideoPodSkeleton from '$lib/components/VideoPodSkeleton.svelte';
	import Button from '$lib/components/Button.svelte';
	import Delete from '$lib/svgComponents/Delete.svelte';
	import MoveFile from '$lib/svgComponents/MoveFile.svelte';
	import {roles} from '$lib/config.js'
	import {userDetails} from '/src/routes/store.js'
	import { onMount } from 'svelte';
	import { checkActionPermission } from '$lib/utils/helper.js'
	import {moduleNames, actionNames} from '$lib/data.js'
	import Quiz from '$lib/svgComponents/Quiz.svelte';
	import { goto } from '$app/navigation';
	import Edit from '$lib/svgComponents/Edit.svelte'
	export let video;

	let dispatch = createEventDispatcher();
	let isLoading = false;
	let permissionsObject ={
	allowVideoMove : false,
	allowVideoDeletion: false,
	allowVideoEdit:false
	}


	function handleDeleteButtonClick(id) {
		dispatch('handleDeletionModal', video);
	}

	function handleMoveModal() {
		dispatch('handleMoveModal', video);
	}

	function handleEditModal(){
		dispatch('handleEditModal', video);

	}

	function roleBasedAcessSetting(){
		if(!$userDetails?.role) return
		if(checkActionPermission($userDetails?.role, moduleNames?.COURSES,actionNames?.DELETE_VIDEO)){
			permissionsObject.allowVideoDeletion=true	
		} else{
			permissionsObject.allowVideoDeletion=false	

		}
		if(checkActionPermission($userDetails?.role, moduleNames?.COURSES,actionNames?.MOVE_VIDEO)){
			permissionsObject.allowVideoMove=true	
		} else{
			permissionsObject.allowVideoMove=false	

		}
		if(checkActionPermission($userDetails?.role, moduleNames?.COURSES,actionNames?.EDIT_VIDEO)){
			permissionsObject.allowVideoEdit=true	
		} else{
			permissionsObject.allowVideoEdit=false	

		}
		}

		function handleShowQuiz(uuid, e){
			goto(`/videos/${uuid}/details#showAddQuiz=true`)
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

{#if isLoading}
	<VideoPodSkeleton />
{:else}
<a href="/videos/{video?.uuid}/details" class="block">
	<div class="overflow-hidden bg-white shadow-md rounded-md hover:cursor-pointer text-darkGray leading-5 max-w-[800px]">
	  <div class="flex h-full">
		<img
		  src={video?.thumbnail || '/videoThumbnail.png'}
		  alt="thumbnail of the video"
		  class="w-1/4 h-40 rounded-l-md object-cover"
		  on:error={(e) => (e.target.src = '/videoThumbnail.png')}
		/>
		<div class="flex flex-col w-3/4">
		  <div class="flex flex-col sm:flex-row h-full">
			<div class="flex flex-col justify-between gap-1 p-2 w-full sm:w-3/4">
			  <div>
				<span
				  class="font-bold flex-wrap text-sm  line-clamp-2 mb-2 break-words"
				  title={video?.name}>{video?.name}</span
				>
				<span class="text-xs line-clamp-3 break-words mb-2" title={video?.description}
				  >{video?.description}</span
				>
				<div
				class="text-xs line-clamp-1 break-words cursor-pointer text-blue-600 hover:underline"
				title="view quiz"
				on:click|stopPropagation|preventDefault={(e) => handleShowQuiz(video?.uuid, e)}
			> View Quiz
			</div>
			  </div>

			  <div class="flex flex-col gap-2">
			  <div class="flex items-center justify-between sm:justify-start mt-2 sm:mt-0">
				<span
				  class="text-xs rounded-full h-6 border-gray-90 border px-2 py-1 flex flex-wrap items-center"
				>
				  {formatDurationHHMM(video?.duration)}
				</span>
				{#if permissionsObject?.allowVideoDeletion && permissionsObject?.allowVideoMove && permissionsObject?.allowVideoEdit}
				<div class="flex sm:hidden space-x-2">
				  <Button
				  btnType="custom"
					on:click={(e) => handleMoveModal(video?.uuid, e)}
				  >
					<MoveFile size={8} stroke="#143164" />
					<span class="sr-only">Move</span>
				  </Button>
				  <Button
				btnType="custom" 
					on:click={(e) => handleDeleteButtonClick(video?.uuid, e)}
				  >
					<Delete size={8} stroke="#B91C1C" />
					<span class="sr-only">Delete</span>
				  </Button>
				  <Button
				  btnType="custom"
					on:click={(e) => handleEditModal(video?.uuid, e)}
				  >
					<Edit size={8} stroke="#143164" />
					<span class="sr-only">Edit</span>
				  </Button>
				</div>
				{/if}
			  </div>
			</div>
		</div>
			{#if permissionsObject?.allowVideoDeletion && permissionsObject?.allowVideoMove && permissionsObject?.allowVideoEdit}
			<div class="hidden sm:flex flex-col justify-start space-y-2 p-2 sm:p-4 w-full sm:w-1/4">
			  <Button
				btnType="secondary"
				customClass="justify-center items-center"
				on:click={(e) => handleMoveModal(video?.uuid, e)}
			  >
			  <span class=""><MoveFile stroke="#143164" /></span>
				
				<span class="text-sm hidden lg:inline-block">Move</span>
			  </Button>
			  <Button 
				btnType="dangerSecondary"
				customClass="justify-center items-center"
				on:click={(e) => handleDeleteButtonClick(video?.uuid, e)}
			  >
				<span class="">
					<Delete stroke="#B91C1C" />
				</span>

				<span class="hidden lg:inline-block text-sm">Delete</span>
			  </Button>
			  <Button 
				btnType="secondary"
				customClass="justify-center items-center"
				on:click={(e) => handleEditModal(video?.uuid, e)}
			  >
			  <span class="">
				<Edit stroke="#143164" />
			</span>
				<span class="hidden lg:inline-block text-sm">Edit</span>
			  </Button>
			</div>
			{/if}
		  </div>
		</div>
	  </div>
	</div>
  </a>
	{/if}

