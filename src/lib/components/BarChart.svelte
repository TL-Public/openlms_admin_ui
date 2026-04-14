<script>
	import { onMount } from 'svelte';
	import Chart from 'chart.js/auto';

	export let barChartId = 'BarChart-' + Math.random();
	export let labels = [];
	export let chartData = {
		labels: labels,
		datasets: [
			{
				label: 'No Data Found',
				data: [],
				backgroundColor: 'rgba(75, 192, 192, 0.5)',
				borderColor: 'rgba(75, 192, 192, 1)',
				borderWidth: 1
			}
		]
	};
	export let chartOptions = {};
	export let chartPlugins = {};

	let ctx;

	onMount(() => {
		ctx = document.getElementById(barChartId).getContext('2d');
		new Chart(ctx, {
			type: 'bar',
			data: chartData,
			options: chartOptions,
			plugins: chartPlugins
		});
	});

	$: updateChart(chartData);

	function updateChart() {
		if (ctx) {
			// Destroy old chart if exists
			if (Chart.getChart(ctx)) {
				Chart.getChart(ctx).destroy();
			}
			// Draw new chart
			new Chart(ctx, {
				type: 'bar',
				data: chartData,
				options: chartOptions,
				plugins: chartPlugins
			});
		}
	}
</script>

<div class="w-full min-h-80">
	<canvas id={barChartId} >
		<p>Hello Fallback World</p>
	</canvas>
</div>
