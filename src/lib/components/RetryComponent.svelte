<script>
	import Button from '$lib/components/Button.svelte';

	export let message = '';
	export let type = 'error'; // error, warning, info
	export let showRetry = false;
	export let retryLabel = 'Retry';
	export let onRetry = () => {};
	export let onClose = () => {};

	// Determine styles dynamically
	$: bgColor = type === 'error' ? 'bg-red-50' : type === 'warning' ? 'bg-yellow-50' : 'bg-blue-50';

	$: borderColor =
		type === 'error'
			? 'border-red-200'
			: type === 'warning'
				? 'border-yellow-200'
				: 'border-blue-200';

	$: textColor =
		type === 'error' ? 'text-red-800' : type === 'warning' ? 'text-yellow-800' : 'text-blue-800';

	$: buttonColor =
		type === 'error'
			? 'bg-red-600 hover:bg-red-700'
			: type === 'warning'
				? 'bg-yellow-600 hover:bg-yellow-700'
				: 'bg-blue-600 hover:bg-blue-700';
</script>

<div
	class="flex items-center justify-between gap-4 rounded-lg border px-4 py-2 {bgColor} {borderColor} {textColor}"
>
	<!-- Message -->
	<p class="flex-1 text-sm">{message}</p>

	<!-- Retry Button (if applicable) -->
	{#if showRetry}
		<Button
			on:click={onRetry}
			class="px-3 py-1 text-white text-sm rounded-md shadow-sm {buttonColor}"
		>
			{retryLabel}
		</Button>
	{/if}

	<!-- Close Button -->
	<button on:click={onClose} class="hover:opacity-80" aria-label="Close">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="18"
			height="18"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
		>
			<line x1="18" y1="6" x2="6" y2="18" />
			<line x1="6" y1="6" x2="18" y2="18" />
		</svg>
	</button>
</div>
