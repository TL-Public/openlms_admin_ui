<script>
	import Edit from '$lib/svgComponents/Edit.svelte';
	import { onMount } from 'svelte';
	import { checkActionPermission } from '$lib/utils/helper.js';
	import { moduleNames, actionNames } from '$lib/data.js';
	import { userDetails } from '/src/routes/store.js';

	export let selectedLanguage = 'en';
	export let stateDetails = {};

	let dataToDisplay = {};
	let permissionsObject = {
		allowEdit: false
	};

	$: if (stateDetails && !stateDetails?.error && Array.isArray(stateDetails)) {
		dataToDisplay =
			stateDetails?.find((state) => state?.languageCode === selectedLanguage) || stateDetails[0];
	}
	function roleBasedAcessSetting() {
		if (!$userDetails?.role) return;

		permissionsObject.allowEdit = checkActionPermission(
			$userDetails.role,
			moduleNames.STATES,
			actionNames.EDIT
		);

	}

	onMount(() => {
		// Run role-based access settings
		const unsubscribe = userDetails?.subscribe((user) => {
			if (user && Object.keys(user)?.length > 0) {
				roleBasedAcessSetting(user);
			}
		});

		return () => unsubscribe();
	});
</script>

<div
	class="flex flex-col text-sm p-6 rounded-lg gap-4 text-darkGray border border-gray-50 bg-white leading-relaxed"
>
	<div class="">
		<div class="flex gap-1 items-center mb-4">
			<div class="text-base font-bold capitalize text-primary">
				{dataToDisplay?.name ?? 'Data not found'}
			</div>
			{#if dataToDisplay?.extId && permissionsObject?.allowEdit}
				<a href={`/states/${dataToDisplay?.extId}/details/edit`}>
					<Edit stroke="#206FC9" />
				</a>
			{/if}
		</div>
		<div class="flex gap-5">
			<div class="flex flex-col gap-2">
				<div>
					<p class="text-sm">
						<span class="label">ISO Code:</span>
						{dataToDisplay?.isoCode ?? '-'}
					</p>
				</div>
				<div>
					<p class="test-sm">
						<span class="label">District count:</span>
						{dataToDisplay?.districts?.length ?? '-'}
					</p>
				</div>
			</div>
		</div>
	</div>
</div>
