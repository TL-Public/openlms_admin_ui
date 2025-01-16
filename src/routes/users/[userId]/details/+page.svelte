<script>
	import UserDetailsPreview from '$lib/users/UserDetailsPreview.svelte';
	import { page } from '$app/stores';
	import { rolesList } from '$lib/data.js';
	export let data;
	let { userDetails, stateData, rsetiData } = data;

	let stateName = stateData.find(
		(item) => item.languageCode === 'en' && item.extId === userDetails.stateId
	)?.name;

	const rsetiDetails = rsetiData?.find((item) => item?.uuid === userDetails?.rsetiId);

	let rsetiName = rsetiDetails?.translations?.find((item) => item?.languageCode === 'en')?.name;
</script>

<div class="bg-white lg:p-6 p-4 rounded-lg">
	<UserDetailsPreview
		route={$page.route.id}
		params={$page.params}
		userData={userDetails}
		{rolesList}
		{stateName}
		{rsetiName}
		imageUrl={userDetails.photoUrl ? `${userDetails.photoUrl}?t=${Date.now()}` : ''}
	/>
</div>
