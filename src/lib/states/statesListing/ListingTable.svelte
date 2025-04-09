<script>
	import { goto } from '$app/navigation';
	import { createEventDispatcher } from 'svelte';
	import Datatable from '$lib/components/DataTable.svelte';
	import ErrorMessage from '$lib/components/ErrorMessage.svelte';

	export let error;
	export let tableData = [];
	export let searchValue = '';
	export let loading = false;

	let dispatch = createEventDispatcher();
	// this object needs to be in accordance with the datatable sortAccordingTo object
	// Can be used to set to a predefined sortingOrder for a predefined header
	let sortAccordingTo = {
		header: null,
		entityType: null,
		sortingOrder: null
	};

	// define header names for the desired headers to be displayed
	let tableHeaderDisplay = [
		{
			key: 'name',
			name: 'Name'
		},
		{
			key: 'isocode',
			name: 'ISO Code'
		},
		{
			key: 'distictcount',
			name: 'District Count'
		}
	];

	// to configure the action tab (see comments of datatable.svelte)
	let actionConfigObject = [
		{
			actionName: 'view',
			actionIconName: 'visibility',
			goto: '/states/details',
			modal: false
		},
		{
			actionName: 'edit',
			actionIconName: 'edit',
			goto: '/states/edit',
			dispatch: false
		},
		{
			actionName: 'delete',
			actionIconName: 'delete',
			goto: '',
			modal: true
		}
	];
</script>

{#if tableData?.length !== 0 && !error}
	<Datatable
		on:tableActionClick
		{tableData}
		{searchValue}
		tableHeadersDisplay={tableHeaderDisplay}
		{actionConfigObject}
		rowHeight={'compact'}
		bind:sortAccordingTo
	/>
{:else}
	<h2>
		<ErrorMessage error={'Failed to fetch states.'} />
	</h2>
{/if}
