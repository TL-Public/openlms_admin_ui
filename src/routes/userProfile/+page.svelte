<script>
	import { usersWithStateId, usersWithRsetiId } from '$lib/data.js';
	import { rolesList, userTypes } from '$lib/data.js';
	import { userDetails } from '/src/routes/store.js';
	import { onMount, onDestroy } from 'svelte';
	import { checkActionPermission } from '$lib/utils/helper.js';
	import { moduleNames, actionNames, roleIds } from '$lib/data.js';
	import PasswordResetPopUp from '$lib/users/PasswordResetPopUp.svelte';
	import { page } from '$app/stores';
	import { message } from '/src/routes/userProfile/userProfileStore.js';
	import SuccessMessage from '$lib/components/SuccessMessage.svelte';
	import ErrorMessage from '$lib/components/ErrorMessage.svelte';
	

	export let data;

	$: error = userData?.error ? true : false;
	let { userData, stateData, rsetiData } = data;
	let stateName=''
	let rsetiName=''
	
	$:if(!stateData?.error && stateData?.length > 0) {
		stateName = stateData
			?.find((item) => Number(item?.extId) === Number(userData?.stateId) && item.languageCode === 'en')?.name;
		}

	$:if(!rsetiData?.error && rsetiData?.length > 0) {
		rsetiName = rsetiData
		?.find((item) => item?.uuid === userData?.rsetiId)
		?.translations?.find((t) => t?.languageCode === 'en')?.name;
		}

	let showEditIcon = false;
	let showPasswordResetPopup = false;

	const roleName = rolesList?.find((item) => item?.roleId == userData?.roleId)?.name;

	function roleBasedAcessSetting() {

		// if superadmin wants to edit profile then we need to show edit icon, enable edit icon in this code block
		if (!$userDetails?.role) return;
		// if (
		// 	Number(userData?.roleId) === Number(roleIds?.TRAINER) &&
		// 	(Number($userDetails?.role) === Number(roleIds?.STATE_ADMIN) ||
		// 		Number($userDetails?.role) === Number(roleIds?.STATE_STAFF))
		// ) {
		// 	showEditIcon = false;
		// } else {
		// 	if (checkActionPermission($userDetails?.role, moduleNames.USERS, actionNames?.EDIT)) {
		// 		showEditIcon = true;
		// 	} else {
		// 		showEditIcon = false;
		// 	}
		// }
	}

	function handlePasswordReset() {
		showPasswordResetPopup = true;
	}

	function handleCancel() {
		showPasswordResetPopup = false;
	}

	function handleSuccesMessageClose(e) {
		message?.set('');
	}

	onDestroy(() => {
		message?.set('');
	});

	onMount(() => {
		const unsubscribe = userDetails?.subscribe((user) => {
			if (user && Object.keys(user)?.length > 0) {
				roleBasedAcessSetting(user);
			}
		});

		return () => unsubscribe(); 
	});
</script>

<div class="mb-2">
	{#if $message}
		<SuccessMessage
			successMessage={$message}
			on:handleSuccessMessageClose={handleSuccesMessageClose}
		/>
	{/if}
</div>
{#if !error}
	<div class="bg-white p-4 rounded-lg">
		<div class="flex justify-between items-start flex-nowrap">
			<div>
				<h1 class="font-semibold heading-L text-primary">My Profile</h1>
			</div>
		</div>
		<hr class="horizontal-line mt-2 mb-8" />
		<div class=" w-full rounded-lg flex flex-col sm:flex-row text-sm gap-8">
			<div class="flex flex-col items-center sm:items-center min-w-8 lg:w-1/4">
				<img
					class="w-32 rounded-lg border object-cover mb-4"
					src={userData?.photoUrl ? userData?.photoUrl : '/placeholderUserImage.png'}
					alt="uploaded user profile"
				/>
			</div>
			<div class="space-y-2 w-full">
				<h2 class="text-primary text-base capitalize font-bold mb-2 flex items-center gap-4">
					{userData?.name ?? '-'}
				</h2>
				<!-- <h1 class=""><span class="label">Username:</span>{userData.username}</h1> -->
				<p class="break-words"><span class="label">Email: </span>{userData?.email ?? '-'}</p>

				<p><span class="label">Designation: </span>{userData?.designation ?? '-'}</p>
				<p><span class="label">Role: </span>{roleName ?? '-'}</p>

				<div class="space-y-2">
					{#if usersWithStateId.includes(userData?.roleId)}
						<p>
							<span class="label">State : </span>{stateName ?? '-'}
						</p>
					{/if}
					{#if usersWithRsetiId.includes(userData.roleId)}
						<p>
							<span class="label">RSETI : </span>{rsetiName ?? '-'}
						</p>
					{/if}
				</div>

				<div
					class="text-sm mb-4 text-blue-500 underline hover:cursor-pointer hover:text-blue-600"
					on:click={handlePasswordReset}
				>
					Reset Password
				</div>
				<hr class="horizontal-line my-8" />

				<p class="text-sm mb-1 font-bold">Contact Details</p>
				<p><span class="label">Phone: </span>{userData?.contactNumber ?? '-'}</p>
				<p class="mt-2">
					<span class="label">Permanent Address: </span>{userData?.permanentAddr ?? '-'}
				</p>
				<p class="mt-2">
					<span class="label">Current Address: </span>{userData?.currentAddr ?? '-'}
				</p>
			</div>
		</div>
	</div>
{:else}
	<ErrorMessage error={'Error fetching user details'} />
{/if}

{#if showPasswordResetPopup}
	<PasswordResetPopUp
		userUuid={$page.params.id}
		endPoint={`apis/users/${$page.params.id}/passwordReset/ownPassword`}
		resetOwnPassword={true}
		userType={userTypes?.ADMIN_USER}
		on:handleCancelSubmission={handleCancel}
	/>
{/if}
