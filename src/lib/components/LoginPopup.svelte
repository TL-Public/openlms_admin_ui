<script>
	import LineDrawing from '$lib/components/LineDrawing.svelte';
	import InputField from '$lib/components/InputField.svelte';
	import ReapLogo from '$lib/svgComponents/ReapLogo.svelte';
	import ReapLogoMobile from '$lib/svgComponents/ReapLogoMobile.svelte';
	import CheckBox from '$lib/components/CheckBox.svelte';
	import { page } from '$app/stores';
	import { enhance } from '$app/forms';
	import { tokenExpired } from '../../stores/store';
	export let form;
	// extract the form details
	let validationError = form?.validationError ? form.validationError : '';
	let formLoginDetails = form?.loginDetails ? form.loginDetails : {};
	let password = '';
	let showPassword = false;
	let formObject = {
		email: formLoginDetails?.email ?? '',
		password: formLoginDetails?.password ?? ''
		// rememberMe: formLoginDetails?.rememberMe ?? false
	};

	function handleFormEnhance({ formData, action, cancel }) {
		return async ({ result, update }) => {
			await result;
			// `result` is an `ActionResult` object

			if (!Object.keys(result?.data)?.includes('error')) {
				tokenExpired.set(false);
			} else {
				error = result?.data?.error;
			}
		};
	}

	function toggleVisibility() {
		showPassword = !showPassword;
	}
</script>

<div class="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
	<div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>

	<div class="fixed inset-0 z-10 w-screen overflow-auto">
		<div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
			<div
				class="relative transform rounded-lg bg-white text-left shadow-xl transition-all sm:w-full sm:max-w-lg sm:p-6 max-h-[90vh] overflow-auto"
			>
				<div class="w-full flex">
					<!-- Login Forms -->
					<div class="flex flex-col items-center flex-1">
						<div class="mb-4">
							<span class="sr-only">Reap Logo</span>
							<h2 class="hidden sm:block">
								<ReapLogo addClass="w-56 h-40" />
							</h2>
							<h2 class="sm:hidden">
								<ReapLogoMobile />
							</h2>
							<h2 class="text-2xl text-center text-primary font-bold leading-[3rem]">Login</h2>
						</div>

						<form method="post" action="/login" class="w-full" use:enhance={handleFormEnhance}>
							<div class="mb-6">
								<InputField
									label={'Username'}
									placeholder={'Enter your email ID'}
									bind:value={formObject.email}
									type="username"
									name="username"
									required={true}
									autocomplete="username"
								/>
							</div>

							<div class="mb-2">
								<InputField
								label="Password"
								placeholder="Enter your password"
								type={showPassword ? 'text' : 'password'}
								bind:value={formObject.password}
								name="password"
								required
								autocomplete="password"
							>
								<!-- Icon Slot -->
								<button
									type="button"
									class="flex items-center justify-center text-gray-500 hover:text-gray-700 focus:outline-none"
									on:click={toggleVisibility}
								>
									{#if showPassword}
										<span class="material-icons text-lg">visibility</span>
									{:else}
										<span class="material-icons text-lg">visibility_off</span>
									{/if}
								</button>
							</InputField>
							</div>
							<div class="flex justify-between mb-4 text-sm">
								<!-- <CheckBox
					bind:checked={formObject.rememberMe}
					checkBoxDiscription="Remember me"
					name="rememberMe"
				/> -->

								<button type="button" class="text-gray-90 ml-auto">Forgot password?</button>
							</div>
							{#if validationError}
								<p class="text-red-500 text-sm mb-2">* {validationError}</p>
							{/if}
							<button
								class="w-full text-center py-2 text-white bg-primary rounded-md font-semibold"
								type="submit">Log in</button
							>
						</form>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
