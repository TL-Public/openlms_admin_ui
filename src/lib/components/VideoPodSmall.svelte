<script>
	export let video;
</script>

<a class="w-full block" href="/videos/{video?.uuid}/details">
	<div class="overflow-hidden bg-white shadow-md rounded-md h-24 hover:cursor-pointer text-darkGray leading-5 flex">
		<img
			src={video?.thumbnail ? video?.thumbnail : '/videoThumbnail.png'}
			alt="thumbnail of the video"
			class="w-1/3 rounded-l-md object-cover"
			on:error={(event) => (event.target.src = '/videoThumbnail.png')}
		/>
		<div class="flex flex-col p-2 w-2/3 justify-between overflow-hidden">
			<div class="flex flex-col gap-1 sm:gap-0.5 overflow-hidden">

				<span class="font-bold text-sm line-clamp-1 mb-1 break-words" title={video?.name}>

					{video?.name}
				</span>
		
				<span class="text-xs  line-clamp-1 break-words" title={video?.description}>
					{video?.description}
				</span>
			</div>

			<div class="text-xs flex items-center mt-auto gap-2">
                    <span class="material-icons-outlined text-sm">visibility</span>
                    <span>{video?.totalViews || video?.views || '-'}</span>
			</div>
		</div>
	</div>
</a>





