<script>
	import { onMount } from 'svelte';
	import Chart from 'chart.js/auto';
	export let lineChartId = 'LineChart-'+Math.random()
	export let labels = []
	export let chartData = {
		labels: labels,
		datasets: [
			{
				label: 'No Data Found',
				data: [],
				fill: false,
				borderColor: 'rgb(75, 192, 192)',
				pointBackgroundColor: 'rgb(255, 165, 0)',
				pointBorderColor: '#fff',
				pointHoverBackgroundColor: '#fff',
				pointHoverBorderColor: 'rgb(75, 192, 192)'
			}
		]
	};
	export let chartOptions = {}
	export let chartPlugins = {}
	let ctx;
	onMount(() => {
		ctx = document.getElementById(lineChartId).getContext('2d');
		new Chart(ctx, {
			type: 'line',
			data: chartData,
			options: chartOptions,
			plugins: chartPlugins
		});
	});

	$: updateChart(chartData)

	function updateChart(){
		// clear old chart and draw new one
		if(ctx){
			if (Chart.getChart(ctx)) {
			Chart.getChart(ctx).destroy();
		}

		new Chart(ctx, {
			type: 'line',
			data: chartData,
			options: chartOptions,
			plugins: chartPlugins
		});
		}
		
	}
</script>

<div class="w-full">
	<canvas id={lineChartId} >
		<p>Error in loading chart</p>
	</canvas>
</div>