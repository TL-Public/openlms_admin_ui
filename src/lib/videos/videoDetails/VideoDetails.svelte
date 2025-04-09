<script>
	export let videoDetails;

</script>

<div>
	<h3 class="text-primary text-base font-bold pb-2 leading-6 capitalize">
		{videoDetails.name}
	</h3>
	<div class="flex flex-col gap-4 sm:gap-6">
		<div class="flex flex-col gap-4 sm:gap-6">
			<p class="text-xs leading-loose">
				{videoDetails?.description ?? ''}
			</p>
			<div class="flex justify-between">
			<p class="text-xs">{videoDetails?.views ?? '-'} views</p>
		</div>
		</div>
	</div>
</div>