<script>
	import { createEventDispatcher } from 'svelte';
	export let languageOptionOne = '';
	export let languageOptionTwo = '';
	export let languageCodeOne = '';
	export let languageCodeTwo = '';

	let selectedLanguage = 'en';
	let dispatch = createEventDispatcher();

	function handleLanguageSelection() {
		dispatch('handleLanguageFromRadioButton', selectedLanguage);
	}
</script>

<div class="flex text-sm gap-2 items-start">
	<div>
		<label class="mr-2 text-sm capitalize">
			<input
				type="radio"
				name="language"
				value={languageCodeOne}
				bind:group={selectedLanguage}
				on:change={handleLanguageSelection}
			/>
			<!-- Wrapped in a span so that radio button doesnt interfere with the capitalize style -->
			<span class="capitalize">{languageOptionOne}</span>
		</label>
		<label class="mr-2 text-sm capitalize">
			<input
				type="radio"
				name="language"
				value={languageCodeTwo}
				bind:group={selectedLanguage}
				on:change={handleLanguageSelection}
			/>
			<span class="capitalize">{languageOptionTwo}</span>
		</label>
	</div>
	<!-- <p class="text-xs">(Toggle between English and Hindi to manage courses in each language.) </p> -->
</div>
