<script>
	import LineDrawing from '$lib/components/LineDrawing.svelte';
	import InputField from '$lib/components/InputField.svelte';
	import ReapLogo from '$lib/svgComponents/ReapLogo.svelte';
	import ReapLogoMobile from '$lib/svgComponents/ReapLogoMobile.svelte';
	import CheckBox from '$lib/components/CheckBox.svelte';
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { tokenExpired } from '/src/stores/store';

	export let form;
    // extract the form details
	let error = form?.error;
	let formLoginDetails = form?.loginDetails;
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
				goto(`/courses`);
                // tokenExpired.set(true);
			} else {
				error = result?.data?.error;
			}
		};
	}

	function toggleVisibility() {
		showPassword = !showPassword;
	}
</script>

<div class="w-full flex flex-col lg:flex-row min-h-screen">
	<!-- Left side text and decoration -->
	<div class="w-full lg:w-1/2 bg-ivory relative hidden lg:flex lg:flex-col">
		<div class="px-36 flex flex-col flex-1 justify-center">
			<h2 class="text-4xl font-extrabold text-primary mb-4 relative">
				<img
					src="/RSETI-text-decoration.svg"
					alt=""
					class="rotate-[270deg] absolute -top-7 -left-7"
				/> Infinite learning enhanced by diverse digital solutions
			</h2>
			<p class="text-primary">
				Our platform seamlessly blends traditional knowledge with innovative technology, creating a
				unique and effective educational experience for all.
			</p>
		</div>
		<LineDrawing />
	</div>
	<!-- Login Forms -->
	<div class="flex flex-col justify-center items-center lg:justify-start flex-1 px-6 lg:px-36 py-12 lg:py-24 bg-offwhite min-h-screen lg:min-h-0">
		<div class="w-full max-w-md lg:max-w-none">
			<div class="mb-4">
				<span class="sr-only">Reap Logo</span>
				<h2>
					<ReapLogo addClass="w-40 h-28 lg:w-56 lg:h-40 mx-auto" />
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
				{#if error}
					<p class="text-red-500 text-sm mb-2">* {error}</p>
				{/if}
				<button
					class="w-full text-center py-2 text-white bg-primary rounded-md font-semibold"
					type="submit">Log in</button
				>
			</form>
		</div>
	</div>
</div>
