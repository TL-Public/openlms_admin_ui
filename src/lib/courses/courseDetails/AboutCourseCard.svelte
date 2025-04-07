<script>
	import VideoPlayer from '$lib/components/VideoPlayer.svelte';
	import RadioButton from '$lib/components/RadioButton.svelte';
	import { getCategoryName } from '$lib/utils/helper.js';
	import Edit from '$lib/svgComponents/Edit.svelte';
	import {roles} from '$lib/config.js'
	import {userDetails} from '/src/routes/store.js'
	import { onMount } from 'svelte';
	import { checkActionPermission } from '$lib/utils/helper.js'
	import {moduleNames, actionNames} from '$lib/data.js'

	export let courseData = {};

	let showEditIcon=false;

	$: categoryName = getCategoryName(courseData?.category);
	// Hardcoded for testing

	let selectedLanguage = 'en'; // Default selected language

	// Track selected translation details
	let selectedTranslation = {};

	// Course object with only the UUID to send to the edit page
	let course = { uuid: courseData?.uuid, method: 'PUT' };

	// Handle language selection from the radio button
	function handleLanguageSelectionFromRadioButton(e) {
		selectedLanguage = e.detail;
		updateSelectedTranslation();
	}

	// Update selected translation based on the selected language
	function updateSelectedTranslation() {
		selectedTranslation =
			courseData?.translations?.find((t) => t?.languageCode === selectedLanguage) || {};
	}

	// Initialize the selected translation
	$: courseData && updateSelectedTranslation();


	function roleBasedAcessSetting(){
		if(!$userDetails?.role) return
		if(checkActionPermission($userDetails?.role, moduleNames.COURSES, actionNames?.EDIT)){
			showEditIcon=true	
		} else {
			showEditIcon=false	

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

<div class=" shadow bg-offwhite rounded-lg p-6">
	<!-- Layout for Image, Details, and Video -->
	<div class="flex flex-col bp-900px:flex-row gap-8 md:gap-10">
		<!-- Image and Details Section (2/3rd Width) -->

		<div class="flex flex-1 bp-900px:w-1/2 gap-4">
			<!-- Course Image -->

			<div class="flex flex-col gap-2">
				<div>
					<div class="flex gap-2 items-center">
						<div class="text-base font-bold capitalize text-primary">
							{selectedTranslation?.title ? selectedTranslation?.title : 'No Title Found'}
						</div>
						{#if showEditIcon}
						<a href={`/courses/${courseData?.uuid}/details/edit`}>
							<!-- <img src="/edit.svg" alt="Edit" class="w-5 h-5" /> -->
							<Edit stroke="#FF6A1F" />
						</a>
						{/if}
					</div>
					<!-- <div class="mb-4">
						<RadioButton
							languageOptionOne="English"
							languageCodeOne="en"
							languageOptionTwo="Hindi"
							languageCodeTwo="hi"
							on:handleLanguageFromRadioButton={handleLanguageSelectionFromRadioButton}
						/>
					</div> -->
				</div>
				<div class="flex gap-4 flex-col bp-420px:flex-row">
					<div class="flex-shrink-0">
						<img
							src={courseData?.imageUrl
								? `${courseData?.imageUrl}?t=${Date.now()}`
								: '/image-preview-icon.jpg'}
							alt="Course Image"
							class=" shadow-md w-40 object-contain mb-4"
						/>
						<!-- Language Selector -->
						<RadioButton
							languageOptionOne="English"
							languageCodeOne="en"
							languageOptionTwo="Hindi"
							languageCodeTwo="hi"
							on:handleLanguageFromRadioButton={handleLanguageSelectionFromRadioButton}
						/>
					</div>

					<!-- Course Details -->
					<div class="flex flex-col text-sm gap-4 text-darkGray leading-relaxed flex-1">
						<div class="space-y-1">
							<div class="text-sm font-semibold">Course code: {courseData?.courseCode ?? '-'}</div>
							<div class="text-sm font-semibold">
								Display Course code: {courseData?.displayCourseCode ?? '-'}
							</div>
							<div class="text-sm font-semibold">Category: {categoryName ?? '-'}</div>
							<div class="font-semibold">Duration: {courseData?.duration ?? '-'} days</div>
							<!-- <div class="font-semibold">Chapters: {courseData?.numberOfChapters?? '-'}</div> -->
							<!-- <div class="font-semibold">Videos: {courseData?.numberOfVideos?? '-'}</div> -->
							<!-- <div class="text-sm font-semibold">
						Approved on: {courseData?.approvedOn ?? '-'}

					</div> -->
							<div class="hidden bp-900px:block">
								<p class="text-sm">{selectedTranslation?.description ?? '-'}</p>
							</div>
						</div>
					</div>
				</div>
				<div class="block bp-900px:hidden">
					<p class="text-sm">{selectedTranslation?.description ?? '-'}</p>
				</div>
			</div>
		</div>

		<!-- Video Player Section (1/3rd Width) -->
		<div class="flex flex-col bp-900px:w-1/2">
			<!-- Video Player -->
			<div class="aspect-video w-full shadow-lg rounded-lg overflow-hidden">
				<VideoPlayer
					videoId={selectedTranslation.aboutVideoExtid
						? selectedTranslation.aboutVideoExtid
						: 'null'}
				/>
			</div>
		</div>
	</div>
</div>
