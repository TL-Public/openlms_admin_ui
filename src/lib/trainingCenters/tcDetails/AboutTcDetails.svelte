<script>
	import RadioButton from '$lib/components/RadioButton.svelte';
	import Edit from '$lib/svgComponents/Edit.svelte';
	import { page } from '$app/stores';
	import { userDetails } from '/src/routes/store.js';
	import { onMount } from 'svelte';
	import { checkActionPermission } from '$lib/utils/helper.js';
	import { moduleNames, actionNames } from '$lib/data.js';

	export let tcDetailsData = {};

	let showEditIcon = false;

	let languageGroup = [
		{ title: 'English', code: 'en' },
		{ title: 'Hindi', code: 'hi' }
	];
	const bankList = $page.data?.bankData;
	const stateList = $page.data?.stateData;

	let rsetiSponsorBank = '';
	let stateName = '';
	if (Array.isArray(bankList)) {
		rsetiSponsorBank = bankList?.find((t) => t.uuid == tcDetailsData.bankId)?.name;
	}

	if (Array.isArray(stateList)) {
		stateName = stateList?.find(
			(t) => t.extId == tcDetailsData.stateId && t.languageCode == 'en'
		)?.name;
	}

	export let languageSelected = languageGroup[0].code;
	// display data will contain change accordinf to language
	let displayData = {};
	$: setDisplayData(languageSelected);

	function setDisplayData(language) {
		let translatedData =
			tcDetailsData?.translations?.find(
				(t) => t?.languageCode?.trim()?.toLowerCase() === language?.trim()?.toLowerCase()
			) || {};

		displayData = {
			name: translatedData?.name || 'No data found.',
			extId: tcDetailsData?.extId || '-',
			stateName: stateName || '-',
			email: tcDetailsData?.email || '-',
			contactNo: tcDetailsData?.contactNo || '-',
			courseCount: tcDetailsData?.courseCount || '-',
			rsetiSponsorBank: rsetiSponsorBank || '-',
			directorName: translatedData?.directorName || '-',
			district: translatedData?.district || '-',
			address: translatedData?.address || '-',
			directorContactNo: tcDetailsData?.directorContactNo || '-'
		};
	}

	function handleLanguageSelectionFromRadioButton(e) {
		languageSelected = e.detail;

		// setDisplayData(languageSelected);
	}

	function roleBasedAcessSetting() {
		if (!$userDetails?.role) return;
		if (
			checkActionPermission($userDetails?.role, moduleNames.TRAINING_CENTERS, actionNames?.EDIT)
		) {
			showEditIcon = true;
		} else {
			showEditIcon = false;
		}
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
	<div class="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
		<div class="border-accent border rounded-full p-2 flex items-center justify-center">
			<img
				src="/learningCentersIcon.svg"
				alt="Learning Center"
				class="w-7 h-7 sm:w-8 sm:h-8 object-contain"
			/>
		</div>
		<div>
			<div class="flex gap-2 items-center">
				<h1 class="heading-L font-bold capitalize">{displayData?.name}</h1>
				{#if showEditIcon}
					<a href={`/trainingCenters/${tcDetailsData?.uuid}/details/edit`}>
						<Edit stroke="#206FC9" /></a
					>
				{/if}
			</div>
			<div class="mt-1">
				<RadioButton
					languageOptionOne={'english'}
					languageCodeOne={'en'}
					languageOptionTwo={'hindi'}
					languageCodeTwo={'hi'}
					on:handleLanguageFromRadioButton={handleLanguageSelectionFromRadioButton}
				/>
			</div>
		</div>
	</div>
	<div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
		<div class="space-y-1 sm:col-span-1">
			<div>
				<span class="label">RSETI Id:</span> <span>{displayData.extId}</span>
			</div>
			<div>
				<span class="label">Sponsor bank :</span>
				<span>{displayData.rsetiSponsorBank ? displayData.rsetiSponsorBank : '-'}</span>
			</div>
			<div>
				<span class="label">State :</span> <span>{displayData.stateName}</span>
			</div>
			<div>
				<span class="label">Director&apos;s name :</span>
				<span>{displayData.directorName ? displayData.directorName : ''}</span>
			</div>
		</div>
		<div class="space-y-1 sm:col-span-2">
			<div>
				<span class="label">Phone :</span> <span>{displayData.contactNo}</span>
			</div>
			<div>
				<span class="label">Director&apos;s phone no. :</span>
				<span>{displayData.directorContactNo}</span>
			</div>
			<div>
				<span class="label">Email :</span> <span class="break-words">{displayData.email}</span>
			</div>
			<div>
				<span class="label">Address :</span> <span>{displayData.address}</span>
			</div>
		</div>
	</div>
</div>
