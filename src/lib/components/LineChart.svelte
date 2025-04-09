<script>
	import { onMount, onDestroy, tick } from 'svelte';
	import { browser } from '$app/environment';
	import Spinner from '$lib/components/Spinner.svelte';

	export let labels = [];
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
				pointHoverBorderColor: 'rgb(75, 192, 192)',
			}
		]
	};
	export let chartOptions = {};
	export let chartPlugins = {};

	let Chart;
	let canvas;
	let chartInstance;

	async function createChart() {
		if (!browser) return; 
		await tick(); 

		// Dynamically import Chart.js in the browser, chart.js internally uses document/window object so the import will fail during ssr if written top level
		const { default: ChartJS } = await import('chart.js/auto');
		Chart = ChartJS;

		const ctx = canvas?.getContext('2d');
		if (!ctx) {
			console.error('Canvas context not found.');
			return;
		}

		if (chartInstance) {
			chartInstance.destroy(); // Destroy existing chart
		}

		chartInstance = new Chart(ctx, {
			type: 'line',
			data: chartData,
			options: chartOptions,
			plugins: chartPlugins,
		});
	}


	onMount(() => {
		if (browser) {
			createChart();
		} else {
			console.error('onMount: Running in a non-browser environment');
		}
	});

	$: if (browser && chartInstance) {
		chartInstance.data.labels = [...chartData.labels];
		chartInstance.data.datasets = [...chartData.datasets];
		chartInstance.options = { ...chartOptions };
		chartInstance.update();
	}

	onDestroy(() => {
		if (chartInstance) {
			chartInstance.destroy();
			chartInstance = null;
		}
	});
</script>


<div>
    {#if browser}
        <canvas bind:this={canvas}>
            <p>Chart failed to load. Please refresh the page.</p>
        </canvas>
    {:else}
	<div class="p-4 text-center">
		<Spinner color={'#206FC9'} size={26} />
	</div>
    {/if}
</div>
