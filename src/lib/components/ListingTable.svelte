<script>
	import Datatable from '$lib/components/DataTable.svelte';
	import DatatableSkeleton from '$lib/components/DatatableSkeleton.svelte';
	import { createEventDispatcher } from 'svelte';
	import ErrorMessage from '$lib/components/ErrorMessage.svelte';

	// ---- Props to this components --
	// <ListingTable  sortAccordingTo={sorting_object} tableData={table_data_array} bind:searchValue={search_variable_string} loading={looding_bool} tableHeaderDisplay={array_of_object}  actionConfigObject={array_of_objects}  />
	// import ErrorComponent from '$lib/Components/ErrorComponent.svelte';
	// import DatatableCard from '$lib/Components/DatatableCard.svelte';
	// import NotFound from '$lib/svgComponents/NotFound.svelte';

	const dispatch = createEventDispatcher();

	// this object needs to be in accordance with the datatable sortAccordingTo object
	// Can be used to set to a predefined sortingOrder for a predefined header
	export let sortAccordingTo = {
		header: null,
		entityType: null,
		sortingOrder: null
	};
	export let error = '';

	// get table data
	export let tableData = [];
	export let searchValue = '';
	export let loading = false;

	// define header names for the desired headers to be displayed
	// array(object(key: key_name_in_data|string, name: custom_header_name))
	// OR
	// array(object(key: key_name_in_data|array, name: custom_header_name))
	// the array version of key is for nested data
	export let tableHeaderDisplay = [];

	// card display config object
	// object(
	// title: object( key: key_name_in_data, name: name_of_Header)
	// nonTitleData: array[object(key: key_name_in_data, name: name_of_Header)]
	// )
	export let cardHeaderDisplay = {};

	// to configure the action tab (see comments of datatable.svelte)
	// array(object( actionName: custom_name_for_action, actionIconName: google_material_icon_name  ))
	export let actionConfigObject = [];
	// array(object( actionName: custom_name_for_action ))
	export let actionConfigObjectCard = [];

	function handleTableAction(event) {
		dispatch('tableActionClick', event.detail);
	}
</script>

<!-- <div class="hidden sm:block"> -->
{#if tableData.length !== 0 && !loading}
	<Datatable
		on:tableActionClick={handleTableAction}
		{tableData}
		{searchValue}
		tableHeadersDisplay={tableHeaderDisplay}
		{actionConfigObject}
		bind:sortAccordingTo
		rowHeight="compact"
	/>
{:else if loading}
	<DatatableSkeleton />
{:else if tableData.length == 0}
	<ErrorMessage error={error || 'Data Not Found'} />
{/if}
<!-- </div> -->
<!-- <div class="sm:hidden flex flex-col gap-4"> -->
<!-- <h2 class="text-xl"> Datatable for mobile view in progress...</h2> -->
<!-- {#if tableData.length !== 0}
	<DatatableCard
	on:cardActionClick={handleTableAction}
		cardsData = {tableData}
		{searchValue}
		{cardHeaderDisplay}
		actionConfigObject={actionConfigObjectCard}
	/>
	{:else if tableData.length === 0}
	<ErrorComponent errorMessage={notFoundMessage} />
	{/if} -->

<!-- </div> -->

<!-- Handle case for when no option matches the filter -->
