<script>
	// NOTES for integrating video player
	// Before playing a video, an auth token and video id have to be generated and passed to the player
	import { onMount, onDestroy, createEventDispatcher, tick } from 'svelte';
	import { browser } from '$app/environment';


	// videoID can be passed as a prop
	export let videoId;
	// token can also be passed as a  prop
	export let token;
	export let muted = false;
	export let autoplay = false;
	export let acceptToken = false;

	const dispatch = createEventDispatcher();
	let videoLoaded = false;
	let player;
	let mounted = false;
	let scriptLoaded = false;
	let divIdPlayer = 'player_' + parseInt(Math.random() * 109999);
	let divIdContainer = 'container_' + parseInt(Math.random() * 109999);
	let videoFailed = false;

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
		let payload = { email: 'public@reaplearn.in', displayName: 'public' };

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

	async function loadPlayer() {
		try {
			videoFailed = false;
			const outerContainer = document.getElementById(divIdContainer);
			if (outerContainer) {
				const targetDiv = outerContainer.querySelector(`#${divIdPlayer}`);
				if (targetDiv) {
					targetDiv.remove();
					await tick();
				}
				divIdPlayer = 'player_' + parseInt(Math.random() * 109999);

				const newDiv = document.createElement('div');
				newDiv.setAttribute('id', divIdPlayer);
				outerContainer.prepend(newDiv);
			}

			player = kPoint.Player(document.getElementById(divIdPlayer), {
				kvideoId: videoId,
				// videoHost: 'nabard.zencite.in',
				videoHost: 'test-nabard.kpoint.com',
				params: { xt: token, muted, autoplay }
			});
			player.addEventListener('error', (error) => {
				if (error.type === 'KAPSULE_ACCESS') {
					videoFailed = true;
				}
			});
		} catch (err) {
			console.log('error is', err);
		}
	}
</script>

<div id={divIdContainer} class="relative" style="width:100%; aspect-ratio: 16/9.5;">
	{#if !videoLoaded}
		<div class="absolute top-0 left-0 w-full bg-gray-50 animate-pulse z-5 h-[95%]"></div>
		<div
			class="w-20 h-20 border-8 border-gray-30 border-t-secondary z-5 absolute top-1/2 left-1/2 rounded-full -translate-x-1/2 -translate-y-1/2 round-loader origin-[0%_0%]"
		></div>
	{:else if videoFailed}
		<div
			class="absolute top-0 left-0 w-full bg-gray-50 z-5 h-[95%] flex items-center justify-center text-primary font-medium"
		>
			'Sorry! Failed to load video'
		</div>
	{/if}

	<div id={divIdPlayer} style="width:100%; "></div>
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