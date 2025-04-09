<script>
	// NOTES for integrating video player
	// Before playing a video, an auth token and video id have to be generated and passed to the player
	import { onMount, onDestroy, createEventDispatcher } from 'svelte';
	import { browser } from '$app/environment';
	import { error } from '@sveltejs/kit';

	// videoID can be passed as a prop
	export let videoId;
	// token can also be passed as a  prop
	export let token;
	export let acceptToken = false;

	const dispatch = createEventDispatcher();
	let videoLoaded = false;
	let player;
	let mounted = false;
	let scriptLoaded = false;

	// inform when mounted
	onMount(() => {
		mounted = true;
	});

	// remove any ongoing players when destroying
	onDestroy(() => {
		if (browser) {
			try {
				//to stop progress api calls when player is destroyed (when user navigates out of the page)
				player?.blockViewProgressCalls();
			} catch (error) {
				console.log('error is', error);
			}
		}
	});

	// generate token for the video
	async function generateToken() {
		let payload = { email: 'sinu.jamal@tensorlogic.ai', displayName: 'Sinu Jamal' };

		//to stop progress api calls of current video when a new video is played.
		if (player) player?.blockViewProgressCalls();
		try {
			const resp = await fetch('/apis/kpoint/token', {
				method: 'POST',
				body: JSON.stringify(payload),
				headers: {
					'Content-Type': 'application/json'
				}
			});
			const { result } = await resp.json();
			return result;
		} catch (err) {
			console.log('token-generation error', err);
		}
	}

	function loadScript(src) {
		return new Promise((resolve, reject) => {
			const existingScript = document?.querySelector(`script[src="${src}"]`);

			if (existingScript) {
				resolve();
				return;
			}
			const script = document?.createElement('script');
			if (script) {
				script.type = 'text/javascript';
				script.src = src;
				script.onload = () => {
					resolve();
				};
				script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
				document.head.appendChild(script);
			}
		});
	}

	$: createPlayer(videoId, mounted);
	async function createPlayer() {
		if (browser && mounted) {
			dispatch('playerLoaded', false);
			videoLoaded = false;
			if (!videoId) return;
			await loadScript('//assets.kpoint.com/orca/media/embed/player-silk.js');
			scriptLoaded = true;
			if (!acceptToken) {
				token = await generateToken();
			}

			try {
				const interval = setInterval(() => {
					if (typeof kPoint != 'undefined') {
						clearInterval(interval);
						loadPlayer();
					}
				}, 150);
			} catch (err) {
				console.log('error is', err);
			} finally {
				dispatch('playerLoaded', true);
				videoLoaded = true;
			}
		}
	}

	function loadPlayer() {
		try {
			const outerContainer = document.getElementById('player-outer-container');
			if (outerContainer) {
				const targetDiv = outerContainer.querySelector('#player-container');
				if (targetDiv) {
					targetDiv.remove();
				}
				const newDiv = document.createElement('div');
				newDiv.setAttribute('id', 'player-container');
				outerContainer.prepend(newDiv);
			}
			// throw error(404, "no found")
			player = kPoint.Player(document.getElementById('player-container'), {
				kvideoId: videoId,
				videoHost: 'test-nabard.kpoint.com',
				params: { xt: token }
			});
		} catch (err) {
			console.log('error is', err);
		}
	}
</script>

<div id="player-outer-container" class="relative" style="width:100%; aspect-ratio: 16/9.5;">
	{#if !videoLoaded}
		<div class="absolute top-0 left-0 w-full bg-gray-50 animate-pulse z-40 h-[95%]"></div>
		<div
			class="w-20 h-20 border-8 border-gray-30 border-t-orange-100 z-50 absolute top-1/2 left-1/2 rounded-full -translate-x-1/2 -translate-y-1/2 round-loader origin-[0%_0%]"
		></div>
	{/if}

	<div id="player-container" style="width:100%; "></div>
</div>

<style>
	.round-loader {
		animation: spin 1s ease-out infinite;
	}

	@keyframes spin {
		0% {
			rotate: 0deg;
		}
		100% {
			rotate: 360deg;
		}
	}
</style>