<script>
	import DataTable from '$lib/components/DataTable.svelte';

	let tableHeadersDisplay = [
		{
			key: 'title',
			name: 'title',
			width: '75%'
		},
		{
			key: 'views',
			name: 'Views'
		}
	];

	let tableData = [
		{
			title: 'Accountancy and book keeping',
			views: '8.30 lakhs'
		},
		{
			title: 'Beauty therapy and hair care',
			views: '8.30 lakhs'
		},
		{
			title: 'Entrepreneurship for Handloom',
			views: '8.30 lakhs'
		},
		{
			title: 'Radio & TV mechanic',
			views: '8.30 lakhs'
		},
		{
			title: 'Accountancy and book keeping',
			views: '8.30 lakhs'
		}
	];
</script>

<DataTable {tableData} {tableHeadersDisplay} showPagination={false} rowHeight={'compact'} />
