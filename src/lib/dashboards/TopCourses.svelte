<script>
	import CardHeader from '$lib/dashboards/CardHeader.svelte';
	import ErrorMessage from '$lib/components/ErrorMessage.svelte';
	import { onMount } from 'svelte';

	import DataTable from '$lib/components/DataTable.svelte';

	export let coursesData = [];
	export let selectedGlobalFilters = {};

	let tableData = [];

	export let tableHeadersDisplay = [
		{
			key: 'title',
			name: 'title',
			width: '75%'
		},
		{
			key: 'views',
			name: 'Views'
		},
		{
			key: 'trainees',
			name: 'Trainees'
		}
	];

	$: createTableData(coursesData);
	function createTableData(coursesData) {
		if (coursesData && !coursesData?.error && coursesData?.length >0) {
			tableData =
				coursesData
					?.slice(0, 10)
					?.map((course) => {
						const translation = course?.translations?.find(
							(t) => t?.languageCode?.toLowerCase().trim() === 'en'
						);

						if (!translation) {
							return null;
						}

						return {
							title: translation?.title || 'N/A',
							views: course?.views ? `${(course.views / 100000).toFixed(2)} lakhs` : '0',
							trainees: course?.trainees ? `${(course.trainees / 100000).toFixed(2)} lakhs` : '0'
						};
					})
					.filter((item) => item !== null) || [];
		} else {
			tableData = [];
		}
	}
</script>

<div class="bg-white w-full flex flex-col p-4 md:p-6 rounded-lg shadow-sm">
	<div class="mb-4">
		<CardHeader title="Top Courses" showFilters={false} {selectedGlobalFilters} />
	</div>

	<div class="">
		{#if coursesData?.error}
			<div class=" text-center text-darkGray text-sm py-8 min-h-40">
				<ErrorMessage error={coursesData?.error|| 'No data found'} />
			</div>
		{:else}
			<DataTable {tableData} {tableHeadersDisplay} showPagination={false} rowHeight={'compact'} />
		{/if}
	</div>
</div>
