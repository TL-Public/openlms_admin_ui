<script>
	import { createEventDispatcher } from 'svelte';

	export let languageAvailableForVideos;
	export let selectedLanguage='en'

	let dispatch = createEventDispatcher();

	function handleSelectedLanguage(e) {
		languageAvailableForVideos?.forEach((item) => {
			if (item?.languageName === e.target?.textContent) {
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
				class:bg-white={selectedLanguage !== language.languageCode}>{language.languageName}</button
			>
			
		{/each}
	</div>
</div>

<style>
	.overflow-x-scroll::-webkit-scrollbar {
		display: none;
	}
</style>