<script>
	import SuperAdminDashboard from '$lib/dashboards/superAdmin/SuperAdminDashboard.svelte';
	import NarAdminDashboard from '$lib/dashboards/narAdmin/NarAdminDashboard.svelte';
	import { onMount } from 'svelte';
	import { roles } from '$lib/config.js';
	import { userDetails } from '/src/routes/store.js';
	import { checkActionPermission } from '$lib/utils/helper.js';
	import { moduleNames, actionNames } from '$lib/data.js';
	import StateAdminDashboard from '$lib/dashboards/stateAdmin/StateAdminDashboard.svelte';
	import RSETIAdminDashboard from '$lib/dashboards/rsetiAdmin/RSETIAdminDashboard.svelte';

	export let data;

	let { coursesData, stateData, rsetiData } = data;
	let userRole = null;
	let minimalCoursesData = [];
	let minimalStatesData = [];
	let minimalRSETIData=[]

	let genderOptions = [
		{ id: 'male', name: 'Male' },
		{ id: 'female', name: 'Female' }
	];

	$: if (coursesData && !coursesData?.error && coursesData?.length > 0) {
		let rsetiArray = coursesData;
		let selectedLanguage = 'en';
		rsetiArray?.forEach((course) => {
			const translation = course?.translations?.find(
				(t) => t?.languageCode?.toLowerCase().trim() === selectedLanguage?.toLowerCase().trim()
			);

			if (!translation) {
				return;
			}

			let courseObj = {
				uuid: course?.uuid,
				id: course?.uuid,
				name: translation?.title,
				description: translation?.description,
				courseCode: course?.courseCode
			};

			minimalCoursesData.push(courseObj);
			minimalCoursesData = minimalCoursesData;
			return minimalCoursesData;
		});
	}

	$: if (stateData && !stateData?.error && stateData?.length > 0) {
		let formattedFilterArray = stateData
			?.filter((item) => item?.languageCode === 'en' && String(item?.extId) !== '0')
			.map((item) => {
				// Find all RSETIs belonging to this state
				const rsetisForState = rsetiData
					?.filter((r) => String(r?.stateId) === String(item?.extId))
					.map((r) => {
						// Find English translation
						const enTranslation = r?.translations?.find(
							(t) => t?.languageCode?.toLowerCase() === 'en'
						);

						return {
							id: String(r.uuid),
							name: enTranslation?.name || r?.name || 'Untitled',
							extId: r?.extId
						};
					});

				return {
					id: String(item.extId),
					name: item.name,
					isoCode: item.isoCode,
					rsetis: rsetisForState
				};
			});

		minimalStatesData = [...formattedFilterArray];
	}
	$: if (rsetiData && !rsetiData?.error && rsetiData?.length > 0) {
		let rsetiArray = rsetiData;
		let selectedLanguage = 'en';
		rsetiArray?.forEach((rseti) => {
			const translation = rseti?.translations?.find(
				(t) => t?.languageCode?.toLowerCase().trim() === selectedLanguage?.toLowerCase().trim()
			);

			if (!translation) {
				return;
			}

			let rsetiObj = {
				uuid: rseti?.uuid,
				id: rseti?.extId,
				name: translation?.name,
				extId: rseti?.extId
			};

			minimalRSETIData.push(rsetiObj);
			minimalRSETIData = minimalRSETIData;
			return minimalRSETIData;
		});
	}

	// ---------------------------------- Role based functions --------------------------------
	function roleBasedAcessSetting() {
		if (!$userDetails?.role) return;
		userRole = $userDetails?.role;
	}
	onMount(() => {
		const unsubscribe = userDetails?.subscribe((user) => {
			if (user && Object.keys(user)?.length > 0) {
				roleBasedAcessSetting(user);
			}
		});

		return () => unsubscribe();
	});
</script>

<div>
	{#if Number(userRole) === 1}
		<SuperAdminDashboard
			{minimalCoursesData}
			{genderOptions}
			{coursesData}
			{minimalStatesData}
			minimalRsetiData={minimalRSETIData}
		/>
	{:else if Number(userRole) === 2 || Number(userRole) === 3}
		<NarAdminDashboard
			{minimalCoursesData}
			{genderOptions}
			{coursesData}
			{minimalStatesData}
			minimalRsetiData={minimalRSETIData}
		/>
	{:else if Number(userRole) === 4 || Number(userRole) === 5}
		<StateAdminDashboard
			{minimalCoursesData}
			{genderOptions}
			{coursesData}
			{minimalRSETIData}
			{minimalStatesData}
		/>
	{:else if Number(userRole) === 6 || Number(userRole) === 7}
		<RSETIAdminDashboard {minimalCoursesData} {genderOptions} {coursesData} {minimalRSETIData} />
	{/if}
</div>
