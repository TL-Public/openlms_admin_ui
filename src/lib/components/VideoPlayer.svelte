<script>
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';

	let playerContainer;
	let youtubePlayerInstance;
	let playerFailed = false;
	let currentVideoId;

	export let videoId = '';

	let PlayerComponent;

	// Load YouTube Player script
	async function loadYouTubePlayerComponent() {
		if (window.Player) return window.Player;

		return new Promise((resolve) => {
			const tag = document.createElement('script');
			tag.src = '/youtube-player.iife.js';
			tag.onload = () => resolve(window.Player);
			tag.onerror = () => {
				console.error('Failed to load YouTubePlayerComponent script.');
				playerFailed = true;
				resolve(null);
			};
			document.body.appendChild(tag);
		});
	}

	// Create Player
	async function createPlayer(id) {
		if (!browser || !PlayerComponent || !playerContainer) return;

		// Destroy old player if any
		if (youtubePlayerInstance?.$destroy) {
			youtubePlayerInstance.$destroy();
			youtubePlayerInstance = null;
		}

		playerFailed = false;

		youtubePlayerInstance = new PlayerComponent({
			target: playerContainer,
			props: { videoId: id, autoplay: false }
		});

		// Attach listeners
		youtubePlayerInstance.$on('ready', () => console.log('YouTube player ready'));
		youtubePlayerInstance.$on('statechange', (e) => console.log('Player state:', e.detail.state));
		youtubePlayerInstance.$on('error', (e) => console.error('Player error:', e.detail));
		youtubePlayerInstance.$on('like', (e) => console.log('Like event:', e.detail));
		youtubePlayerInstance.$on('metadata', (e) => console.log('Metadata:', e.detail));
	}

	// Load component and create player on mount
	onMount(async () => {
		if (!browser) return;
		PlayerComponent = await loadYouTubePlayerComponent();
		await createPlayer(videoId);
	});

	// Watch for videoId changes and recreate player
	$: if (PlayerComponent && browser && videoId !== currentVideoId) {
		currentVideoId = videoId;
		createPlayer(videoId);
	}

	onDestroy(() => {
		if (youtubePlayerInstance?.$destroy) {
			youtubePlayerInstance.$destroy();
			youtubePlayerInstance = null;
		}
	});
</script>

<div style="width: 100%; aspect-ratio: 16/9;" class="relative">
	{#if playerFailed}
		<div class="absolute inset-0 flex items-center justify-center bg-black text-white text-center px-4">
			<p>Failed to load video player. Please try again later.</p>
		</div>
	{:else}
		<div bind:this={playerContainer} class="w-full h-full bg-black"></div>
	{/if}
</div>

  <!-- <style>
	/* Optional: Add any styles for the container in the parent component */
	#playerContainer {
	  width: 100%;
	  aspect-ratio: 16 / 9; /* Example aspect ratio */
	  background-color: black; /* Placeholder */
	}
  </style> -->