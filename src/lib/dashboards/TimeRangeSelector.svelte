<script>
	import Tabs from '$lib/components/Tabs.svelte';
	import { createEventDispatcher } from 'svelte';

	export let ranges = ['1W', '1M', '3M', '1Y'];
	export let selected = '1W';

	const dispatch = createEventDispatcher();

	// Convert ranges to tabs format expected by Tabs.svelte
	$: tabs = ranges.map(r => ({
		text: r,
		textDispaly: r   // no custom label
	}));

	// Sync Tabs active state
	$: activeTab = tabs.find(t => t.text === selected.text) || tabs[0];

	function handleActiveTab(e) {
		selected = e.detail;
		dispatch('rangeChange', selected.text);
	}	
</script>

<Tabs {tabs} bind:activeTab on:handleActiveTab={handleActiveTab} />
