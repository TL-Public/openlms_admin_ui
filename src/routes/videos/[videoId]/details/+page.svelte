<script>
	import VideoDetailspage from '$lib/videos/videoDetails/VideoDetailsPage.svelte';
	import { userDetails } from '/src/routes/store.js';
	import { moduleNames, actionNames } from '$lib/data.js';
	import { checkActionPermission } from '$lib/utils/helper.js';
	import { onMount } from 'svelte';

	export let data;

	let { videoDetails, videoUuid, linkedContent, serviceToken } = data;
	let permissionsObject = {
		allowQuizCrud: false
	};

	// --------------------------- RBAC ------------------------
	function roleBasedAcessSetting() {
		if (!$userDetails?.role) return;
		if (checkActionPermission($userDetails?.role, moduleNames?.VIDEOS, actionNames?.ADD)) {
			permissionsObject.allowQuizCrud = true;
		} else {
			permissionsObject.allowQuizCrud = false;
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

<div class="">
	<VideoDetailspage
		{videoDetails}
		contentUuid={videoUuid}
		{linkedContent}
		{serviceToken}
		showQuiz={permissionsObject?.allowQuizCrud}
	/>
</div>
