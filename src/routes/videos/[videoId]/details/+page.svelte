<script>
	import { page } from '$app/stores';
	import VideoDetailspage from '$lib/videos/videoDetails/VideoDetailsPage.svelte';

	export let data;

	let {videoDetails} = data
</script>

<div class="">
	<VideoDetailspage
		token={data.token}
		{videoDetails}
	/>
</div>
