<script>
	import VideoDetailspage from '$lib/videos/videoDetails/VideoDetailsPage.svelte';

	export let data;

	let { videoDetails, videoUuid, linkedContent, serviceToken } = data;
</script>

<div class="">
	<VideoDetailspage {videoDetails} contentUuid={videoUuid} {linkedContent} {serviceToken} />
</div>
