<script>
	import { createEventDispatcher } from 'svelte';

	export let languageAvailableForVideos;
	export let selectedLanguage = 'en';
	export let showCount = false; 
	export let videos = []; 

	let dispatch = createEventDispatcher();
	
	// Calculate video counts for each language
	$: videoCounts = showCount ? calculateVideoCounts(videos, languageAvailableForVideos) : {};
	
	function calculateVideoCounts(videos, languages) {
		const counts = {};
		
		// Initialize counts for all available languages
		languages.forEach(lang => {
			counts[lang.languageCode] = 0;
		});
		
		// Count videos for each language
		videos?.forEach(video => {
			const langCode = video?.languageCode?.toLowerCase().trim();
			if (counts[langCode] !== undefined) {
				counts[langCode]++;
			}
		});
		
		return counts;
	}

	function handleSelectedLanguage(e) {
		languageAvailableForVideos?.forEach((item) => {
			// Extract the language name without the count
			const buttonText = e.target?.textContent;
			const languageName = showCount 
				? buttonText.split('(')[0].trim() 
				: buttonText.trim();
				
			if (item?.languageName === languageName) {
				selectedLanguage = item?.languageCode;
				dispatch('handleSelectedLanguage', item);
			}
		});
	}
</script>

<div>
	<p class="text-sm mb-2">AvailableLanguages:</p>
	<div class="flex gap-4 mb-4 md:flex-wrap flex-nowrap items-center snap-x snap-mandatory overflow-x-scroll">
		{#each languageAvailableForVideos as language}
			<button
				class="px-2 py-1 border rounded text-sm min-w-[120px]"
				on:click={handleSelectedLanguage}
				class:bg-primary={selectedLanguage === language.languageCode}
				class:text-white={selectedLanguage === language.languageCode}
				class:bg-white={selectedLanguage !== language.languageCode}
			>
				{language.languageName}
				{#if showCount && videos?.length>0}
					({videoCounts[language.languageCode] || 0})
				{/if}
			</button>
		{/each}
	</div>
</div>

<style>
	.overflow-x-scroll::-webkit-scrollbar {
		display: none;
	}
</style>

<!-- <script>
	import { createEventDispatcher } from 'svelte';

	export let languageAvailableForVideos;
	export let selectedLanguage = 'en';
	export let showCount = false;
	export let videos = [];

	let dispatch = createEventDispatcher();
	
	// Calculate video counts for each language
	$: videoCounts = showCount ? calculateVideoCounts(videos, languageAvailableForVideos) : {};
	
	function calculateVideoCounts(videos, languages) {
		const counts = {};
		
		// Initialize counts for all available languages
		languages.forEach(lang => {
			counts[lang.languageCode] = 0;
		});
		
		// Count videos for each language
		videos?.forEach(video => {
			const langCode = video?.languageCode?.toLowerCase().trim();
			if (counts[langCode] !== undefined) {
				counts[langCode]++;
			}
		});
		
		return counts;
	}

	function handleSelectedLanguage(e) {
		// Get language data from data attributes
		const languageCode = e.currentTarget.dataset.langCode;
		
		if (languageCode) {
			selectedLanguage = languageCode;
			// Find the matching language object to dispatch
			const selectedLang = languageAvailableForVideos.find(
				lang => lang.languageCode === languageCode
			);
			if (selectedLang) {
				dispatch('handleSelectedLanguage', selectedLang);
			}
		}
	}
</script>

<div>
	<p class="text-sm mb-2">AvailableLanguages:</p>
	<div class="flex gap-3 mb-4 md:flex-wrap flex-nowrap items-center snap-x snap-mandatory overflow-x-scroll">
		{#each languageAvailableForVideos as language}
			<button
				class={`
					language-button border rounded text-sm transition-colors duration-150 ease-in-out
					${selectedLanguage === language.languageCode ? 'bg-primary text-white' : 'bg-white hover:bg-gray-50 '}
				`}
				on:click={handleSelectedLanguage}
				data-lang-code={language.languageCode}
				data-lang-name={language.languageName}
			>
				{#if showCount}
					<div class="flex items-center justify-center w-full h-full px-3 py-1.5 gap-2">
						<span class="truncate mr-2">{language.languageName}</span>
						<span class={`
							flex-shrink-0 min-w-[24px] h-6 flex items-center justify-center rounded-full text-xs font-medium
							${selectedLanguage === language.languageCode 
								? 'bg-white text-primary' 
								: 'bg-gray-100 text-gray-700'}
						`}>
							{videoCounts[language.languageCode] || 0}
						</span>
					</div>
				{:else}
					<div class="flex items-center justify-center w-full h-full px-4 py-2">
						<span class="truncate">{language.languageName}</span>
					</div>
				{/if}
			</button>
		{/each}
	</div>
</div>

<style>
	.overflow-x-scroll::-webkit-scrollbar {
		display: none;
	}
	
	/* Fixed width buttons that adjust based on screen size */
	.language-button {
		width: 140px; /* Default width */
	}
	
	/* Responsive adjustments */
	@media (max-width: 768px) {
		.language-button {
			width: 130px;
		}
	}
	
	@media (max-width: 640px) {
		.language-button {
			width: 120px;
		}
	}
	
	@media (max-width: 480px) {
		.language-button {
			width: 110px;
		}
	}
	
	/* For very small screens */
	@media (max-width: 360px) {
		.language-button {
			width: 100px;
		}
	}
</style> -->