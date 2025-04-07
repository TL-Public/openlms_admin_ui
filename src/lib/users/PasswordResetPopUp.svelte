<script>
    import { onMount, onDestroy, tick } from 'svelte';
	import { createEventDispatcher } from 'svelte';
	import InputField from '$lib/components/InputField.svelte';
	import VideoCamera from '$lib/svgComponents/VideoCamera.svelte';
	import DeletionErrorMessage from '$lib/components/DeletionErrorMessage.svelte';
	import LineLoader from '$lib/components/LineLoader.svelte';
	import Button from '$lib/components/Button.svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { message as userDetailsMessage } from '/src/routes/users/userStore.js';
	import { message as userProfileMessage } from '/src/routes/userProfile/userProfileStore.js';
	import GoogleMatrialIcon from '$lib/components/GoogleMatrialIcon.svelte';
	import { rolesList, userTypes } from '$lib/data.js';
    import { message as traineeMessage } from '/src/routes/trainees/traineeStore.js';
    export let userUuid;
    export let endPoint;
    export let resetOwnPassword = false;
    export let userType = userTypes?.ADMIN_USER

    let dispatch = createEventDispatcher();
    let errorMessage = '';
    let isSubmitting = false;
    let formObject = { oldPassword: '', newPassword: '' };
    let confirmPassword = '';

    let showOldPassword = false;
    let showPassword = false;
    let showConfirmPassword = false;

// Determine payload structure
$: dataToSend = resetOwnPassword
        ? { oldPwd: formObject.oldPassword, newPwd: formObject.newPassword } // Self-update
        : formObject.newPassword; // Resetting another user’s password


    function handleCancel() {
        errorMessage = '';
        dispatch('handleCancelSubmission');
    }

    async function handleSubmit() {
        let response;
        try {
            userProfileMessage.set('');
            userDetailsMessage.set('');

            errorMessage = '';
            isSubmitting = true;

            if (resetOwnPassword && !formObject.oldPassword) {
                errorMessage = 'Please enter your current password.';
                return;
            }

            if (!formObject.newPassword || !confirmPassword) {
                errorMessage = 'Please enter and confirm your password.';
                return;
            }

            if (formObject.newPassword.length < 8) {
                errorMessage = 'Password must be at least 8 characters long.';
                return;
            }

            if (formObject.newPassword !== confirmPassword) {
                errorMessage = 'Passwords do not match.';
                return;
            }


            response = await fetch(endPoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSend)
            });


        if (response?.status === 401) {
            const fromUrl = $page.url.pathname + $page.url.search;
            goto(`/login?redirectTo=${fromUrl}`);
            return;
        }

        if (!response.ok) {
            try {
                const errorText = await response?.json(); 
                errorMessage = errorText?.error || 'Failed to reset password. Please try again.';
            } catch (e) {
                errorMessage = 'Failed to reset password. Please try again.';
            }
            return;
        }

        if (response?.status === 200) {
            errorMessage = '';
            if(userType==userTypes?.ADMIN_USER){
                if (resetOwnPassword) {
                    userProfileMessage.set('Password reset successfully');
                } else {
                    userDetailsMessage.set('Password reset successfully');
                }
            }
            if(userType===userTypes?.TRAINEE){
                traineeMessage.set('Password reset successfully');

            }
            handleCancel();
        }
        } catch (error) {
            if (response?.status === 401) {
                const fromUrl = $page.url.pathname + $page.url.search;
                goto(`/login?redirectTo=${fromUrl}`);
            }
        } finally {
            isSubmitting = false;
        }
    }


    onMount(() => {
        document.body.style.overflow = 'hidden';
    });

    onDestroy(() => {
        document.body.style.overflow = '';
    });
</script>

<div class="fixed inset-0 z-10 flex items-center justify-center bg-gray-500 bg-opacity-75 ">
    <form class="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 m-4" on:submit|preventDefault={handleSubmit}>
        
        {#if isSubmitting}
        <div class="mb-4">
            <LineLoader />
        </div>
        {/if}

        {#if errorMessage}
            <div class="mb-4">
                <DeletionErrorMessage {errorMessage} on:handleErrorMessageClose={() => (errorMessage = '')} />
            </div>
        {/if}

        <h2 class="heading-L mb-4">Reset Password</h2>

        <!-- Old Password Field (only for self-update) -->
        {#if resetOwnPassword}
            <div class="relative mb-4">
                <InputField
                    label={'Current Password'}
                    placeholder={'Enter current password'}
                    name={'oldPassword'}
                    bind:value={formObject.oldPassword}
                    required
                    type={showOldPassword ? 'text' : 'password'}
                />
                <span
                    class="absolute top-4 inset-y-0 right-3 flex items-center cursor-pointer text-gray-500"
                    on:click={() => (showOldPassword = !showOldPassword)}
                >
                    <GoogleMatrialIcon iconName={showOldPassword ? "visibility" : "visibility_off"} addClass="text-base" />
                </span>
            </div>
        {/if}


        <!-- New Password Field -->
        <div class="relative mb-4">
            <InputField
                label={'New Password'}
                placeholder={'Enter new password'}
                name={'newPassword'}
                bind:value={formObject.newPassword}
                required
                type={showPassword ? 'text' : 'password'}
            />
            <span
                class="absolute top-4 inset-y-0 right-3 flex items-center cursor-pointer text-gray-500"
                on:click={() => (showPassword = !showPassword)}
            >
            <GoogleMatrialIcon iconName={showConfirmPassword ? "visibility" : "visibility_off"} addClass="text-base" />
        </div>

        <!-- Confirm Password Field -->
        <div class="relative mb-4">
            <InputField
                label={'Confirm New Password'}
                placeholder={'Confirm new password'}
                name={'confirmPassword'}
                bind:value={confirmPassword}
                required
                type={showConfirmPassword ? 'text' : 'password'}
            />
            <span
                class="absolute top-4 inset-y-0 right-3 flex items-center cursor-pointer text-gray-500"
                on:click={() => (showConfirmPassword = !showConfirmPassword)}
            >
            <GoogleMatrialIcon iconName={showConfirmPassword ? "visibility" : "visibility_off"} addClass="text-base" />
            </span>
        </div>

        <div class="flex justify-end gap-2">
            <Button btnType="secondary" disabled={isSubmitting} on:click={handleCancel}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>Submit</Button>
        </div>
    </form>
</div>
