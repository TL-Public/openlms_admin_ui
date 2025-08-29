<script>
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { onMount, onDestroy } from 'svelte';
	import { message } from '/src/routes/nar/narStore.js';
	import InputField from '$lib/components/InputField.svelte';
	// import BreadCrumbs from '$lib/components/BreadCrumbs.svelte';
	import SubmissionErrorMessage from '$lib/components/SubmissionErrorMessage.svelte';
	import Address from '$lib/components/Address.svelte';
	import ReviewForm from '$lib/components/ReviewForm.svelte';
	import TextDescriptionField from '$lib/components/TextDescriptionField.svelte';
	import Button from '$lib/components/Button.svelte';
	import MultiStepProgressComponent from '$lib/components/MultiStepProgressComponent.svelte';
	import { handleRedirection } from '$lib/utils/helper.js';
	import { page } from '$app/stores';
	import {showLoadingSpinner} from '/src/routes/store.js'


	export let route;
	export let params;
	export let stateData;
	export let formObject = {
		email1: '',
		email2: '',
		phoneno1: '',
		phoneno2: '',
		address: '',
		languageCode: 'en',
		uuid: '',
		method: ''
	};
	let isSubmitting = false;
	const url = $page.url;

	let saved = false;
	let validationErrors = {};

	let errorMessage = '';
	let method = 'post';
	let steps = [
		{ number: 1, text: 'Details' },
		{ number: 2, text: 'Review' }
	];
	let currentStep = 1;

	$: if (isSubmitting === true){
		showLoadingSpinner.set(true)
	} else {
		showLoadingSpinner.set(false)
	}

	$: phoneno = `${formObject?.phoneno1},${formObject?.phoneno2}`;
	$: email = `${formObject?.email1},${formObject?.email2}`;

	onMount(() => {
		if (route.includes('edit')) {
			method = 'PUT';
		} else {
			method = 'POST';
		}
	});

	function handleEnhance({ formElement, formData, action, cancel, submitter }) {
		let { search } = action;
		validationErrors = {};

		if (search == '?/review') {
			currentStep = 2;
			saved = !saved;
		}
		if (search == '?/final') {
			isSubmitting = true;
		}

		Object.keys(formObject)?.forEach((key) => {
			formData.set(key, formObject[key]);
		});
		formData.set('phoneNumber', `${formObject?.phoneno1};${formObject?.phoneno2}`);
		formData.set('email', `${formObject?.email1};${formObject?.email2}`);
		formData.set('method', method);

		return async ({ result, update }) => {
			await result;

			// `result` is an `ActionResult` object
			if (search == '?/final') {
				isSubmitting = true;

				if (result.type == 'success') {
					if (method === 'POST') {
						goto(`/nar`, { invalidateAll: true });
						message.set('Successfully added NAR Details.');
					}
					if (method === 'PUT') {
						goto(`/nar`, { invalidateAll: true });
						message.set('Successfully edited NAR Details.');
					}
					
				}

				if (result.type == 'failure') {
					isSubmitting = false;

					if (result?.data?.error) {
						errorMessage = result?.data?.error;
						if (result?.status === 401) {
							handleRedirection(result.status, url.pathname, url.search);
						} else {
							//handle other errors
						}
					}
				}
			}
		};
	}

	function handleGoBack() {
		window.history.back();
	}

	function handlePrevious() {
		saved = false;
		currentStep = 1;
		formObject = formObject;
	}

	onDestroy(()=>{
		showLoadingSpinner.set(false)
	})
</script>

<div class="m-4 lg:m-12 text-primary">
	{#if errorMessage}
		<div class="mb-2">
			<SubmissionErrorMessage {errorMessage} />
		</div>
	{/if}

	<div class="w-full max-w-80 mx-auto">
		<MultiStepProgressComponent {steps} {currentStep} />
	</div>

	<form method="post" action="/nar" use:enhance={handleEnhance} class="form">
		<div class="w-full md:w-3/4 mx-auto grid grid-cols-1 gap-4 mb-4">
			{#if !saved}
				<div>
					<h2 class=" heading-L text-center">National Academy for RUDSETI</h2>
				</div>

				<TextDescriptionField
					label={'Address'}
					placeholder={'Enter NAR address'}
					name={'address'}
					bind:value={formObject.address}
					required
				/>

				<InputField
					label={'Phone Number 1'}
					placeholder={'Enter phone number'}
					name={'phoneno1'}
					type="number"
					min="0"
					bind:value={formObject.phoneno1}
					required
				/>

				<InputField
					label={'Phone Number 2'}
					placeholder={'Enter phone number'}
					name={'phoneno2'}
					type="number"
					min="0"
					bind:value={formObject.phoneno2}
					required
				/>

				<InputField
					label={'Email 1'}
					placeholder={'Enter email'}
					name={'email1'}
					type="email"
					bind:value={formObject.email1}
					required
				/>

				<InputField
					label={'Email 2'}
					placeholder={'Enter email'}
					name={'email2'}
					type="email"
					bind:value={formObject.email2}
					required
				/>
			{:else}
				<div>
					<ReviewForm>
						<div class=" text-sm sm:text-base font-semibold mb-4 sm:mb-3">
							National Academy for RUDSETI
						</div>
						<div class="flex flex-col gap-2">
							<p class="w-full md:w-3/4 leading-relaxed text-sm">
								<span class="label">Address</span>: {formObject?.address ?? '-'}
							</p>

							<p class="text-sm">
								<span class="label">Phone</span>: {formObject?.phoneno1 ?? '-'}, {formObject?.phoneno2 ??
									'-'}
							</p>
							<p class="text-sm">
								<span class="label">Email</span>: {formObject?.email1 ?? '-'}, {formObject?.email2 ??
									'-'}
							</p>
						</div>
					</ReviewForm>
				</div>
			{/if}

			<div class="flex justify-end gap-4 flex-wrap">
				{#if saved}
					<Button
						type="button"
						btnType="secondary"
						customClass={'inline-block w-full bp-420px:w-fit'}
						disabled={isSubmitting}
						on:click={handlePrevious}>Edit</Button
					>
				{:else}
					<Button
						type="button"
						btnType="secondary"
						customClass={'inline-block w-full bp-420px:w-fit flex justify-center'}
						disabled={isSubmitting}
						on:click={handleGoBack}>Cancel</Button
					>
				{/if}
				<Button
					btnType="primary"
					type="submit"
					customClass={'inline-block w-full bp-420px:w-fit flex justify-center'}
					disabled={isSubmitting}
					formaction={saved ? '?/final' : '?/review'}>{saved ? 'Submit' : 'Save & Next'}</Button
				>
			</div>
		</div>
	</form>
</div>
