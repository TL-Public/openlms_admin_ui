<script>
	import VideoDetails from '$lib/videos/videoDetails/VideoDetails.svelte';
	import ErrorMessage from '$lib/components/ErrorMessage.svelte';
	import VideoPlayer from '$lib/components/VideoPlayer.svelte';
	import ViewershipChart from '$lib/videos/videoDetails/ViewershipChart.svelte';
	import Button from '$lib/components/Button.svelte';
	import { onMount, tick, onDestroy } from 'svelte';
	import { page } from '$app/stores';
	import ToastMessage from '$lib/components/ToastMessage.svelte';
	import { linkContentAndQP, deleteQPFromContent } from '$lib/videos/quizHelper.js';
	import RetryTask from '$lib/components/RetryTask.svelte';
	import RetryComponent from '$lib/components/RetryComponent.svelte';
	import { browser } from '$app/environment';
	import { writable } from 'svelte/store';
	import { userDetails } from '/src/routes/store.js';
	import { HOST_URL } from '$lib/config.js';
	import {  extractYouTubeVideoId } from '$lib/utils/helper.js';
	import KpointPlayer from '$lib/components/KpointPlayer.svelte';

	export let videoDetails = {};
	export let linkedContent = {};
	export let contentUuid = '';
	export let serviceToken = null;
	export let showQuiz = false;
	
	let iframeUrl = '';
	let iframeRef = null;
	const CLIENT_KEY = import.meta.env.VITE_CLIENT_KEY;
	const QMS_FE_URL = import.meta.env.VITE_QMS_FE_URL;

	// const handshakeStatus = writable('initializing');
	let checkReadyInterval;
	let clientST = '';

	let quizLinkStatus = {
		type: 'NEUTRAL',
		retryHandler: () => {},
		message: ''
	};

	// Confirmation dialog state
	let showConfirmationDialog = false;
	let pendingLinkPayload = null;

	let showQuizAddition = false;
	let allowedOriginsInReap = ['http://localhost:5174', QMS_FE_URL];

	$: errorInVideos = videoDetails?.error ? true : false;
	$: isQuizLinkedToContent = linkedContent.uuid ? true : false;
	$: linkedQuestionPaper = linkedContent?.questionPaper;

	$: console.log('linkedContent', linkedContent);

	$: if (contentUuid && !linkedContent.error && serviceToken) {
		if (linkedContent.uuid) {
			iframeUrl = `${QMS_FE_URL}/Quizzes/${linkedContent.questionPaperUuid}/details?linked=true&quizUuid=${linkedContent.questionPaperUuid}&embedded=true&serviceToken=${serviceToken}&clientKey=${CLIENT_KEY}`;
			showQuizAddition = true;
		} else {
			iframeUrl = `${QMS_FE_URL}/Quizzes/add?contentUuid=${contentUuid}&embedded=true&serviceToken=${serviceToken}&clientKey=${CLIENT_KEY}`;
		}
	}

	function handleQuizAddition() {
		showQuizAddition = !showQuizAddition;
	}

	// Function to show the confirmation dialog
	function showReplaceConfirmation(payload) {
		pendingLinkPayload = payload;
		showConfirmationDialog = true;
	}

	// Function to handle confirmation dialog actions
	function handleConfirmationAction(confirmed) {
		showConfirmationDialog = false;

		if (confirmed && pendingLinkPayload) {
			// User confirmed, proceed with unlinking and linking
			proceedWithReplacement(pendingLinkPayload);
		}

		// Reset the pending payload regardless of the action
		pendingLinkPayload = null;
	}

	// Generic function to handle quiz linking
	async function handleQuizLinking(payload, options = {}) {
		const {
			infoMessage = 'Linking quiz...',
			successMessage = 'Successfully linked quiz to the video.',
			errorMessage = 'Failed to link quiz to the video.'
		} = options;

		quizLinkStatus = {
			type: 'INFO',
			message: infoMessage,
			retryHandler: () => {}
		};

		try {
			const linkResponse = await linkContentAndQP(payload);

			if (linkResponse?.isSuccess) {
				quizLinkStatus = {
					type: 'SUCCESS',
					message: successMessage,
					retryHandler: () => {}
				};

				document
					.getElementById('qms-iframe')
					?.contentWindow?.postMessage(
						{ type: 'LINKING_SUCCESS', quizUuid: payload?.questionPaper?.uuid },
						QMS_FE_URL
					);

				isQuizLinkedToContent = true;
				linkedQuestionPaper = payload?.questionPaper;
				return true;
			} else {
				throw new Error(errorMessage);
			}
		} catch (err) {
			const retryHandler = () => handleQuizLinking(payload, options);

			quizLinkStatus = {
				type: 'ERROR',
				message: errorMessage,
				retryHandler
			};
			return false;
		}
	}

	// Generic function to handle quiz unlinking/deletion
	async function handleQuizUnlinking(payload, options = {}) {
		const {
			infoMessage = 'Unlinking quiz...',
			successMessage = 'Successfully unlinked quiz from the video.',
			errorMessage = 'Failed to unlink quiz from the video.'
		} = options;

		quizLinkStatus = {
			type: 'INFO',
			message: infoMessage,
			retryHandler: () => {}
		};

		try {
			const deleteResponse = await deleteQPFromContent(payload);

			if (deleteResponse?.isSuccess) {
				quizLinkStatus = {
					type: 'SUCCESS',
					message: successMessage,
					retryHandler: () => {}
				};

				document
					.getElementById('qms-iframe')
					?.contentWindow?.postMessage(
						{ type: 'DELETION_SUCCESS', quizUuid: payload?.questionPaper?.uuid },
						QMS_FE_URL
					);

				isQuizLinkedToContent = false;
				linkedQuestionPaper = '';
				return true;
			} else {
				throw new Error(errorMessage);
			}
		} catch (err) {
			quizLinkStatus = {
				type: 'ERROR',
				message: errorMessage,
				retryHandler: () => handleQuizUnlinking(payload, options)
			};
			return false;
		}
	}

	// Function to handle the actual replacement process
	async function proceedWithReplacement(payload) {
		// STEP 1: Delete existing question paper
		const unlinkPayload = {
			questionPaper: linkedQuestionPaper,
			contentType: payload.contentType,
			contentUuid
		};

		const unlinkOptions = {
			infoMessage: 'Unlinking the existing quiz...',
			successMessage:
				'Successfully unlinked the existing quiz from the video. Proceeding with the addition of new quiz.',
			errorMessage:
				'Failed to unlink the existing quiz from the video. Unable to proceed with linking of the new quiz.'
		};

		const unlinkSuccess = await handleQuizUnlinking(unlinkPayload, unlinkOptions);

		// STEP 2: Link new quiz if unlinking was successful
		if (unlinkSuccess) {
			const linkOptions = {
				infoMessage: 'Linking the new quiz...',
				successMessage: 'Successfully linked the new quiz to the video.',
				errorMessage:
					'Successfully unlinked the existing quiz from the video, but failed to link the new quiz. Please try again.'
			};

			await handleQuizLinking(payload, linkOptions);
		}
	}

	// Updated function to use custom confirmation UI
	async function replaceLinkedQuiz(payload) {
		if (isQuizLinkedToContent) {
			showReplaceConfirmation(payload);
		} else {
			// If no quiz is linked, proceed directly to linking
			const linkOptions = {
				successMessage: 'Successfully linked the quiz to video.',
				errorMessage: 'Failed to link the quiz to the video. Please try again.'
			};

			await handleQuizLinking(payload, linkOptions);
		}
	}

	async function handleLinkingContent(payload) {
		if (isQuizLinkedToContent) {
			await replaceLinkedQuiz(payload);
			return;
		}

		resetQuizLinkStatus();

		const linkOptions = {
			successMessage: 'Successfully linked quiz to the video.',
			errorMessage: 'Failed to link quiz to the video. Please try again.'
		};

		await handleQuizLinking(payload, linkOptions);
	}

	async function handleContentQPDeletion(payload) {
		resetQuizLinkStatus();

		const unlinkOptions = {
			successMessage: 'Successfully unlinked quiz from video.',
			errorMessage: 'Failed to unlink quiz from video. Please try again.'
		};

		await handleQuizUnlinking(payload, unlinkOptions);
	}

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
			// handshakeStatus.set('failed');
			return null;
		}
	}

	// Send the service token
	function sendToken(serviceToken) {
		console.log('CLIENT_KEY in REAP before sending to QMS', CLIENT_KEY);
		iframeRef?.contentWindow?.postMessage(
			{
				type: 'SERVICE_TOKEN',
				payload: {
					serviceToken: serviceToken,
					clientKey: CLIENT_KEY,
					userUuid: $userDetails?.userUuid ? $userDetails?.userUuid : null,
					hostUrl: HOST_URL
				}
			},
			iframeUrl
		);
	}

	// // Initialize handshake with iframe
	// async function initHandshake() {
	// 	if (!iframeRef) return;

	// 	console.log('serviceToken in init', serviceToken);
	// 	// Get the service token
	// 	if (!serviceToken) {
	// 		const data = await getServiceToken();
	// 		if (!data || !data.serviceToken) {
	// 			console.error('Failed to get service token');
	// 			// handshakeStatus.set('failed');
	// 			return;
	// 		}

	// 		serviceToken = data.serviceToken;
	// 	}

	// 	// Start sending CHECK_READY messages at 1-second intervals
	// 	checkReadyInterval = setInterval(() => {
	// 		clearInterval(checkReadyInterval);
	// 		console.log('Sending CHECK_READY...');
	// 		iframeRef?.contentWindow?.postMessage(
	// 			{ type: 'CHECK_READY', payload: { hostUrl: HOST_URL } },
	// 			iframeUrl
	// 		);
	// 	}, 1000);
	// }

	// function messageHandler(event) {
	// 	// Validate the origin of the message for security

	// 	if (!allowedOriginsInReap.includes(event.origin)) {
	// 		return;
	// 	}
	// 	const { type, payload } = event.data;

	// 	switch (type) {
	// 		case 'QMS_READY':
	// 			console.log('QMS is ready!');
	// 			clearInterval(checkReadyInterval);
	// 			sendToken(serviceToken);
	// 			break;

	// 		case 'HANDSHAKE_COMPLETE':
	// 			console.log('Handshake completed successfully');
	// 			// handshakeStatus.set('complete');
	// 			clearInterval(checkReadyInterval);
	// 			break;

	// 		case 'READY':
	// 			break;

	// 		case 'QUIZ_CREATED':
	// 			handleLinkingContent({
	// 				questionPaper: payload.questionPaper,
	// 				contentType: payload.contentType,
	// 				contentUuid
	// 			});
	// 			break;

	// 		case 'LINK_REQUEST':
	// 			handleLinkingContent({
	// 				questionPaper: payload.questionPaper,
	// 				contentType: payload.contentType,
	// 				contentUuid
	// 			});
	// 			break;

	// 		case 'DELETE_REQUEST':
	// 			handleContentQPDeletion({
	// 				questionPaper: payload.questionPaper,
	// 				contentType: payload.contentType,
	// 				contentUuid
	// 			});
	// 			break;

	// 		default:
	// 		// console.warn(' Unknown message type:', type);
	// 	}
	// }
	let checkReadyTimeout;

	async function initHandshake() {
		if (!iframeRef) return;

		console.log('serviceToken in init', serviceToken);

		// Get the service token
		if (!serviceToken) {
			const data = await getServiceToken();
			if (!data || !data.serviceToken) {
				console.error('Failed to get service token');
				return;
			}
			serviceToken = data.serviceToken;
		}

		// Start sending CHECK_READY messages until QMS_READY is received
		const sendCheckReady = () => {
			console.log('Sending CHECK_READY...');
			iframeRef?.contentWindow?.postMessage(
				{ type: 'CHECK_READY', payload: { hostUrl: HOST_URL } },
				iframeUrl
			);

			// Continue sending every second unless handshake completes
			checkReadyTimeout = setTimeout(sendCheckReady, 1000);
		};

		sendCheckReady();
	}

	function messageHandler(event) {
		// Validate the origin of the message for security
		if (!allowedOriginsInReap.includes(event.origin)) {
			return;
		}

		const { type, payload } = event.data;

		switch (type) {
			case 'QMS_READY':
				console.log('QMS is ready!');
				clearTimeout(checkReadyTimeout);
				sendToken(serviceToken);
				break;

			case 'HANDSHAKE_COMPLETE':
				console.log('Handshake completed successfully');
				clearTimeout(checkReadyTimeout);
				break;

			case 'READY':
				break;

			case 'QUIZ_CREATED':
				handleLinkingContent({
					questionPaper: payload.questionPaper,
					contentType: payload.contentType,
					contentUuid
				});
				break;

			case 'LINK_REQUEST':
				handleLinkingContent({
					questionPaper: payload.questionPaper,
					contentType: payload.contentType,
					contentUuid
				});
				break;

			case 'DELETE_REQUEST':
				handleContentQPDeletion({
					questionPaper: payload.questionPaper,
					contentType: payload.contentType,
					contentUuid
				});
				break;

			default:
				break;
			// console.warn('Unknown message type:', type);
		}
	}

	function resetQuizLinkStatus() {
		quizLinkStatus = {
			type: 'NEUTRAL',
			retryHandler: () => {},
			message: ''
		};
	}

	onMount(async () => {
		const hash = $page.url.hash;
		if (browser) window.addEventListener('message', messageHandler);

		if (hash && hash.includes('showAddQuiz=true')) {
			showQuizAddition = true;

			await tick();

			const quizModal = document.getElementById('quiz-modal');
			if (quizModal) {
				quizModal.scrollIntoView({ behavior: 'smooth' });
			}
		}
	});

	onDestroy(() => {
		if (browser) window.removeEventListener('message', messageHandler);
		clearInterval(checkReadyInterval); // Clean up on unmount
	});
</script>

<div class="bg-white rounded-lg px-4 pb-6">
	<div class="flex justify-between items-center pt-4">
		<div class="mb-2 heading-L">Video Details</div>
	</div>
	<div class="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-6 break-words">
		{#if !errorInVideos}
			<div class="aspect-auto sm:mb-4 ">
				<div class="rounded-md overflow-hidden mb-4">
					<VideoPlayer videoId={extractYouTubeVideoId(videoDetails?.url)} />
					 <!-- <KpointPlayer videoId={videoDetails?.extId} /> -->
				</div>
				<div>
					<div class="">
						<VideoDetails {videoDetails} />
					</div>
				</div>
			</div>
		{:else}
			<ErrorMessage error={'Failed to fetch video'} />
		{/if}
		<div class="mb-4 sm:mb-0">
			<ViewershipChart />
		</div>
	</div>
	{#if showQuiz}
	<div>
		<div class="mb-4">
			<Button customClass="w-fit" on:click={handleQuizAddition}
				>{isQuizLinkedToContent
					? showQuizAddition
						? 'Close quiz'
						: 'View Quiz'
					: 'Add Quiz'}</Button
			>
		</div>

		<!-- Custom Confirmation Dialog -->
		{#if showConfirmationDialog}
			<div class="mb-4 p-4 border border-yellow-300 bg-yellow-50 rounded-lg">
				<div class="flex items-start">
					<div class="flex-shrink-0 mt-0.5">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-5 w-5 text-yellow-600"
							viewBox="0 0 20 20"
							fill="currentColor"
						>
							<path
								fill-rule="evenodd"
								d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
								clip-rule="evenodd"
							/>
						</svg>
					</div>
					<div class="ml-3 flex-1">
						<h3 class="text-sm font-medium text-yellow-800">Confirmation Required</h3>
						<div class="mt-2 text-sm text-yellow-700">
							<p>A quiz is already linked. Do you want to unlink it and link a new one?</p>
						</div>
						<div class="mt-4 flex space-x-3">
							<button
								type="button"
								class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
								on:click={() => handleConfirmationAction(true)}
							>
								Replace
							</button>
							<button
								type="button"
								class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
								on:click={() => handleConfirmationAction(false)}
							>
								Cancel
							</button>
						</div>
					</div>
					<div class="ml-auto pl-3">
						<div class="-mx-1.5 -my-1.5">
							<button
								type="button"
								class="inline-flex bg-yellow-50 rounded-md p-1.5 text-yellow-500 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-600"
								on:click={() => handleConfirmationAction(false)}
							>
								<span class="sr-only">Dismiss</span>
								<svg
									class="h-3 w-3 sm:h-5 sm:w-5"
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 20 20"
									fill="currentColor"
									aria-hidden="true"
								>
									<path
										fill-rule="evenodd"
										d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
										clip-rule="evenodd"
									/>
								</svg>
							</button>
						</div>
					</div>
				</div>
			</div>
		{/if}

		<!-- Status Messages -->
		{#if quizLinkStatus.type === 'SUCCESS'}
			<ToastMessage
				message={quizLinkStatus.message}
				errorMessage={true}
				viewModal={true}
				on:handleToastClose={resetQuizLinkStatus}
			/>
		{:else if quizLinkStatus.type === 'ERROR'}
			<div class="my-2">
				<RetryComponent
					onRetry={quizLinkStatus.retryHandler}
					message={quizLinkStatus.message}
					showRetry={true}
					onClose={resetQuizLinkStatus}
				/>
			</div>
		{:else if quizLinkStatus.type === 'INFO'}
			<div class="my-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
				<div class="flex">
					<div class="flex-shrink-0">
						<svg
							class="h-5 w-5 text-blue-400"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 20 20"
							fill="currentColor"
						>
							<path
								fill-rule="evenodd"
								d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z"
								clip-rule="evenodd"
							/>
						</svg>
					</div>
					<div class="ml-3 flex-1 md:flex md:justify-between">
						<p class="text-sm text-blue-700">{quizLinkStatus.message}</p>
					</div>
				</div>
			</div>
		{/if}

		{#if showQuizAddition}
			<div id="quiz-modal">
				<!-- <div
					class="mb-2 text-sm p-2 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
				>
					Status: {$handshakeStatus === 'complete'
						? '✓ Ready'
						: $handshakeStatus === 'failed'
							? '✗ Connection Error'
							: '⟳ Initializing...'}
				</div> -->
				<iframe
					id="qms-iframe"
					bind:this={iframeRef}
					title="Quiz Creator"
					src={iframeUrl}
					width="100%"
					height="600px"
					style="border: none;"
					class="pb-4 rounded-lg"
					on:load={() => {
						console.log('Iframe loaded');
						initHandshake();
					}}
				></iframe>
			</div>
		{/if}
	</div>
	{/if}
</div>
