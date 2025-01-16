<script>
import SingleAccordion from '$lib/components/SingleAccordion.svelte';
import Datatable from '$lib/components/DataTable.svelte';
import {syllabusData} from '$lib/data.js'
import ErrorMessage from '$lib/components/ErrorMessage.svelte'

export let loading = false;

let error = syllabusData?.length===0?true:false;

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
			key: 'topic',
			name: 'Topic'
		},
		{
			key: 'content',
			name: 'Content'
		},
		{
			key: 'duration',
			name: 'Duration'
		},
	];

	// to configure the action tab (see comments of datatable.svelte)
	let actionConfigObject = [];

</script>
{#if !error}
{#if syllabusData?.length > 0}
	{#each syllabusData as syllabusItem, index (syllabusItem.id)}
		<div
			class="w-full mb-2 lg:mb-4"
			role="listitem"
		>
			<SingleAccordion
				name={syllabusItem?.moduleName}
                draggable={false}
                editIcon={false}
                deleteIcon={false}
				{index}
			>
				<p class="mt-2 text-sm leading-7 text-darkgray font-normal px-2 pb-4 cursor-default" id="innerAccordion">
					<Datatable
                    tableData={syllabusItem?.moduleData}
	                tableHeadersDisplay={tableHeaderDisplay}
	                {actionConfigObject}
	                showPagination={false}

	                bind:sortAccordingTo
					/>
				</p>
			</SingleAccordion>
		</div>
	{/each}
{/if}
{:else}
<ErrorMessage error={'Syllabus not found'} />
{/if}