<script>
	import BreadCrumbs from '$lib/components/BreadCrumbs.svelte';
	import GoogleMatrialIcon from '$lib/components/GoogleMatrialIcon.svelte';
	import Edit from '$lib/svgComponents/Edit.svelte';
	import AddUserForm from './addUser/AddUserForm.svelte';
	import { usersWithStateId, usersWithRsetiId } from '$lib/data.js';
	import { rolesList, userTypes } from '$lib/data.js';
	import { userDetails } from '/src/routes/store.js';
	import { onMount } from 'svelte';
	import { checkActionPermission } from '$lib/utils/helper.js';
	import { moduleNames, actionNames, roleIds } from '$lib/data.js';
	import PasswordResetPopUp from '$lib/users/PasswordResetPopUp.svelte'
	import { page } from '$app/stores';

	export let title = 'User Details';
	export let rsetiName = '';
	export let stateName = '';
	export let userData = {};
	export let imageUrl = '';
	export let enableEdit = false

	let showEditIcon = false;
	let showPasswordResetPopup=false

	const roleName = rolesList?.find((item) => item?.roleId == userData?.roleId)?.name;

	function roleBasedAcessSetting() {
		if (!$userDetails?.role) return;
		if (
			Number(userData?.roleId) === Number(roleIds?.TRAINER) &&
			(Number($userDetails?.role) === Number(roleIds?.STATE_ADMIN) ||
				Number($userDetails?.role) === Number(roleIds?.STATE_STAFF))
		) {
			showEditIcon = false;
		} else {
			if (checkActionPermission($userDetails?.role, moduleNames.USERS, actionNames?.EDIT)) {
				showEditIcon = true;
			} else {
				showEditIcon = false;
			}
		}
		}

	function handlePasswordReset(){
		showPasswordResetPopup=true
	}

	function handleCancel(){
		showPasswordResetPopup=false
	}

	onMount(() => {
	
		const unsubscribe = userDetails?.subscribe((user) => {
			if (user && Object.keys(user)?.length > 0) {
				roleBasedAcessSetting(user);
			}
		});

		return () => unsubscribe(); 
	});
</script>

<div class="">
	<div class="flex justify-between items-start flex-nowrap">
		<div>
			<h1 class="font-semibold heading-L text-primary">{title}</h1>
		</div>
	</div>
	<hr class="horizontal-line mt-2 mb-8" />
	<div class=" w-full rounded-lg flex flex-col sm:flex-row text-sm gap-8">
		<div class="flex flex-col items-center sm:items-center min-w-8 lg:w-1/4">
			<img
				class="w-32 rounded-lg border object-cover mb-4"
				src={imageUrl ? imageUrl : '/placeholderUserImage.png'}
				alt="uploaded user profile"
			/>
		</div>
		<div class="space-y-2 w-full">
			<h2 class="text-primary text-base capitalize font-bold mb-2 flex items-center gap-4">
				{userData.name}
				{#if showEditIcon && enableEdit}
					<a href={`/users/${userData.uuid}/details/edit`}>
						<Edit stroke="#206FC9" />
						<!-- <GoogleMatrialIcon iconName='edit' /> -->
					</a>
				{/if}
			</h2>
			<!-- <h1 class=""><span class="label">Username:</span>{userData.username}</h1> -->
			<p class="break-words"><span class="label">Email: </span>{userData.email}</p>

			<p><span class="label">Designation: </span>{userData.designation}</p>
			<p><span class="label">Role: </span>{roleName}</p>


			<div class="my-4">
				{#if usersWithStateId.includes(userData.roleId)}
					<p>
						<span class="label">State : </span>{stateName}
					</p>
				{/if}
				{#if usersWithRsetiId.includes(userData.roleId)}
					<p>
						<span class="label">RSETI : </span>{rsetiName}
					</p>
				{/if}
			</div>

			{#if [Number(roleIds?.SUPER_ADMIN), Number(roleIds?.NAR_ADMIN), Number(roleIds?.NAR_STAFF)].includes(Number($userDetails?.role))}
			<div class="text-sm mb-4 text-blue-500 underline hover:cursor-pointer hover:text-blue-600" on:click={handlePasswordReset}> Reset Password</div>
			{/if}
			<hr class="horizontal-line my-8" />

			<p class="text-sm mb-1 font-bold">Contact Details</p>
			<p><span class="label">Phone: </span>{userData.contactNumber}</p>
			<p class="mt-2"><span class="label">Permanent Address: </span></p>
			<p>
				{userData.permanentAddr ?? ''}
			</p>

			<p class="mt-2"><span class="label">Current Address: </span></p>
			<p>
				{userData.currentAddr ?? ''}
			</p>

			
			</div>
		</div>

		
</div>

{#if showPasswordResetPopup}
	<PasswordResetPopUp 
	userUuid={userData?.uuid}
    endPoint={`/apis/users/${$page.params.id}/passwordReset?userUuid=${userData?.uuid}`}
    resetOwnPassword={false}
	userType={userTypes?.ADMIN_USER}
	on:handleCancelSubmission={handleCancel}/>
{/if}
