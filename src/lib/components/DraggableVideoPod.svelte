<script>
	import { formatDurationHHMM } from '$lib/utils/helper.js';
	import { createEventDispatcher } from 'svelte';
	import VideoPodSkeleton from '$lib/components/VideoPodSkeleton.svelte';
	import Button from '$lib/components/Button.svelte';
	import Delete from '$lib/svgComponents/Delete.svelte';
	import MoveFile from '$lib/svgComponents/MoveFile.svelte';

	export let video;

	let dispatch = createEventDispatcher();
	let isLoading = false;

	function handleDeleteButtonClick(id) {
		dispatch('handleDeletionModal', video);
	}

	function handleMoveModal() {
		dispatch('handleMoveModal', video);
	}
</script>

{#if isLoading}
	<VideoPodSkeleton />
{:else}
	<a
		href="/videos/{video?.uuid}/details"
	>
		<div
			class="overflow-hidden bg-white shadow-md rounded-md h-40 hover:cursor-pointer text-darkGray leading-5 max-w-[800px]"
		>
			<div class=" flex h-full gap-2">
				<img
					src={video?.thumbnail || '/videoThumbnail.png'}
					alt="thumbnail of the video"
					class="w-1/4 rounded-md rounded-r-none object-cover"
					on:error={(e) => (e.target.src = '/videoThumbnail.png')}
				/>
				<div class="flex w-3/4">
					<div class="flex flex-col justify-between gap-1 sm:gap-0.5 p-2 w-3/4">
						<div>
							<span
								class="font-bold flex-wrap text-sm sm:text-base line-clamp-2 mb-2 break-words"
								title={video?.name}>{video?.name}</span
							>
							<span class="text-xs line-clamp-3 break-words" title={video?.description}
								>{video?.description}</span
							>
						</div>
						<span
							class="text-xs rounded-full h-6 border-gray-90 border px-2 py-2 flex flex-nowrap items-center w-fit"
							>{formatDurationHHMM(video?.duration)}</span
						>
					</div>
					<div class="p-4 flex flex-col justify-start space-y-2 w-1/4">
						<Button
							btnType="secondary"
							on:click={(e) => {
								// e.stopPropagation();
								handleMoveModal(video?.uuid, e);
							}}
						>
							<MoveFile stroke="#143164" />
							<span class="text-sm">Move</span>
						</Button>
						<Button btnType="dangerSecondary" on:click={() => handleDeleteButtonClick(video?.uuid)}>
							<Delete stroke="#B91C1C" />
							<span class="text-sm">Delete</span>
						</Button>
					</div>
				</div>
			</div>
		</div></a
	>
{/if}
