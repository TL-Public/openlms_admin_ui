<script>
	import VideoDetails from '$lib/videos/videoDetails/VideoDetails.svelte';
	import BreadCrumbs from '$lib/components/BreadCrumbs.svelte';
	import ErrorMessage from '$lib/components/ErrorMessage.svelte';
	import VideoPlayer from '$lib/components/VideoPlayer.svelte';
	import ViewershipChart from './ViewershipChart.svelte';
	import VideoDetailsSkeleton from '$lib/videos/videoDetails/VideoDetailsSkeleton.svelte';

	export let videoDetails={}

	$: errorInVideos = videoDetails?.error ? true : false;

</script>

<div class="bg-white rounded-lg px-4">
	<div class="flex justify-between items-center pt-4">
		<div class=" mb-2 heading-L">Video Details</div>
	</div>
	<div class="grid sm:grid-cols-2 gap-6 sm:gap-6">
		{#if !errorInVideos}
			<div class="aspect-auto mb-2 sm:mb-10">
				<VideoPlayer videoId={videoDetails?.extId} />
				<!-- <div class="hidden lg:block bg-white h-10">&nbsp</div> -->
						<div>
							<div class="">
								<VideoDetails {videoDetails}  />
							</div>
						</div>
			</div>
		{:else}
			<ErrorMessage error={'Failed to fetch video'} />
		{/if}
		<div class="">
			<ViewershipChart />
		</div>
	</div>
</div>

