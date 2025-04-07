<script>
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let iframeUrl = 'http://localhost:5174'; // Default value for backward compatibility
	const CLIENT_SECRET = import.meta.env.VITE_CLIENT_SECRET;
	const allowedOrigins = ['http://localhost:5174', 'http://qmsapi.ap-south-1.elasticbeanstalk.com'];

	const handshakeStatus = writable('initializing');
	let iframeRef;
	let checkReadyInterval;

	// Fetch the service token from your API
	async function getServiceToken() {
		try {
			const response = await fetch('/apis/serviceToken', {
				method: 'POST',
				credentials: 'include'
			});
			if (!response.ok) throw new Error('Failed to get service token');
			return await response.json();
		} catch (error) {
			console.error('Error fetching service token:', error);
			handshakeStatus.set('failed');
			return null;
		}
	}

	let clientST = '';

	onMount(() => {
		let iframeLoaded = false;

		function handleIframeLoad() {
			iframeLoaded = true;
			console.log('Iframe loaded');
			initHandshake();
		}

		async function initHandshake() {
			if (!iframeRef || !iframeLoaded) return;

			// Get the service token
			const data = await getServiceToken();
			if (!data || !data.serviceToken) {
				console.error('Failed to get service token');
				handshakeStatus.set('failed');
				return;
			}

			clientST = data.serviceToken;

			// Start sending CHECK_READY messages at 1-second intervals
			checkReadyInterval = setInterval(() => {
				console.log('Sending CHECK_READY...');
				iframeRef.contentWindow.postMessage({ type: 'CHECK_READY' }, iframeUrl);
			}, 1000);
		}

		// Handle messages from the iframe
		function handleMessage(event) {
			if (!allowedOrigins.includes(event.origin)) return;

			console.log('Received message:', event.data);

			const { type, payload } = event.data;

			switch (type) {
				case 'QMS_READY':
					console.log('QMS is ready!');
					clearInterval(checkReadyInterval);
					sendToken(clientST);
					break;

				case 'HANDSHAKE_COMPLETE':
					console.log('Handshake completed successfully');
					handshakeStatus.set('complete');
					break;

				case 'QUIZ_CREATED':
				case 'LINK_REQUEST':
				case 'DELETE_REQUEST':
					dispatch('message', { type, payload });
					break;
			}
		}

		// Send the service token
		function sendToken(serviceToken) {
			iframeRef.contentWindow.postMessage(
				{
					type: 'SERVICE_TOKEN',
					payload: { serviceToken: serviceToken, clientKey: CLIENT_SECRET }
				},
				iframeUrl
			);
			console.log('Service token sent:', serviceToken);
		}

		// Add event listeners
		if (iframeRef) {
			iframeRef.addEventListener('load', handleIframeLoad);
		}
		window.addEventListener('message', handleMessage);

		return () => {
			if (iframeRef) {
				iframeRef.removeEventListener('load', handleIframeLoad);
			}
			window.removeEventListener('message', handleMessage);
			clearInterval(checkReadyInterval); // Clean up on unmount
		};
	});

	// Manually send the token via a button click (if needed)
	function manualSendToken() {
		if (clientST) sendToken(clientST);
	}
</script>

<button on:click={manualSendToken}>Send token</button>

<div class="w-full mx-auto my-4">
	<div
		class="mb-2 text-sm p-2 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
	>
		Status: {$handshakeStatus === 'complete'
			? '✓ Ready'
			: $handshakeStatus === 'failed'
				? '✗ Connection Error'
				: '⟳ Initializing...'}
	</div>

	<iframe
		bind:this={iframeRef}
		src={iframeUrl}
		title="Quiz Application"
		class="w-full h-[600px] border border-gray-300 dark:border-gray-700 rounded-md"
	></iframe>
</div>
