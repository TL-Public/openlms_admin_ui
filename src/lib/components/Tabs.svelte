<script>
	import { createEventDispatcher, onMount } from 'svelte';
	// --- tabs format ---
	// [ {text, textDisplay, icon} ]
	export let tabs;
	export let activeTab = tabs?.[0] ?? [];

	const despatch = createEventDispatcher();

	function handleTab(tab) {
		activeTab = tab;
		despatch('handleActiveTab', activeTab);
	}
</script>

<div class="border-b border-gray-50 w-full rounded-t-lg overflow-hidden">
	<nav class="flex flex-row flex-wrap">
		{#each tabs as tab}
			<button
				aria-current={tab?.text === activeTab.text ? true : false}
				on:click={() => handleTab(tab)}
				class=" whitespace-nowrap cursor-pointer border-b-2 px-4 py-3 text-sm font-medium text-darkGray hover:bg-gray-10 hover:border-orange-40 hover:text-gray-700 {tab?.text ===
				activeTab.text
					? 'border-orange-100  hover:bg-gray-30 bg-gray-30 font-semibold'
					: 'border-transparent bg-sibebarGray highlight last:rounded-tr-lg'}"
			>
				<div class="flex items-center space-x-2">
					{#if tab?.icon}
						<img src={tab?.icon} alt="icon of {tab?.textDisplay}" class="h-5 w-5 lg:h-6 lg:w-6" />
					{/if}
					<span class="text-primary text-xs sm:text-sm">{tab?.textDispaly}</span>
				</div></button
			>
		{/each}
	</nav>
</div>
