<script>
	import { goto } from '$app/navigation';
	import ListingTable from '$lib/components/ListingTable.svelte';
	import SearchBar from '$lib/components/SearchBar.svelte';
	import Tabs from '$lib/components/Tabs.svelte';
	import DeletionModalViaAPI from '$lib/components/DeletionModalViaAPI.svelte';
	import InputField from '$lib/components/InputField.svelte';
	import Button from '$lib/components/Button.svelte';
	import { rolesList } from '$lib/data.js';
	import SuccessMessage from '$lib/components/SuccessMessage.svelte';
	import { onDestroy } from 'svelte';
	import { message } from '/src/routes/users/userStore.js';

	export let data;

	let { usersList } = data;

	let tableActionName = '';
	let userUuidForDeletion = '';
	let deletionConfirmText = 'please delete this user';
	let deleteTextConfirmation = false;
	let viewModal = false;

	// Function to group users by roleId and extract distinct role names
	function groupUsersByRole(users, rolesList) {
		const groupedUsers = {};
		const roleMap = new Map();
		if (users?.error) return { groupedUsers, roleNames: Array.from(roleMap.values()) };

		users?.forEach((user) => {
			// Find the role name from rolesList
			const role = rolesList?.find((r) => r.roleId == user.roleId);
			const roleName = role ? role.name : 'Unknown Role';

			// Add the role name to the roleNames Map
			roleMap.set(user.roleId, { roleId: user.roleId, roleName, order: role.order });

			// Group users by roleId
			if (!groupedUsers[user.roleId]) {
				groupedUsers[user.roleId] = [];
			}
			groupedUsers[user.roleId].push({ ...user, roleName: roleName });
		});
		const roleNames = Array.from(roleMap.values());

		return { groupedUsers, roleNames };
	}

	$: ({ groupedUsers, roleNames } = groupUsersByRole(usersList, rolesList));

	let tabs = [];

	$: if (roleNames?.length > 0) {
		tabs = roleNames
			?.map((item) => {
				return {
					text: item.roleName,
					textDispaly: item.roleName,
					id: item.roleId,
					order: item.order
				};
			})
			.sort((a, b) => a.order - b.order);
	}

	let searchValue = '';
	let tableLoading = false;
	$: tableData = Object.values(groupedUsers)?.length > 0 ? Object.values(groupedUsers)[0] : [];

	let tableHeaderDisplay = [
		{
			key: 'name',
			name: 'Name',
			width: '40%'
		},
		{
			key: 'email',
			name: 'email'
		},

		{
			key: 'designation',
			name: 'Designation'
		}
	];

	let actionConfigObejct = [
		{
			actionName: 'view',
			actionIconName: 'visibility',
			modal: false
		},
		{
			actionName: 'edit',
			actionIconName: 'edit',
			modal: false
		},
		{
			actionName: 'delete',
			actionIconName: 'delete',
			modal: true
		}
	];

	let userName = '';
	let userRole = '';
	let userDesignation = '';
	let deleteTextInput = '';

	// Function to normalize text (removes spaces and ignores case)
	const normalizeText = (text) => text?.trim().toLowerCase().replace(/\s+/g, ' ');

	// Function to check if input matches the required text
	$: isTextValid(deleteTextInput);
	function isTextValid() {
		deleteTextConfirmation = normalizeText(deleteTextInput) === normalizeText(deletionConfirmText);
	}

	function handleActiveTab(e) {
		// --- Change the selected component to the componet of tab ---

		const tabId = e.detail.id;
		tableData = groupedUsers[tabId];
	}

	function handleSearchValue(e) {
		// ---- passing the search tearm to datatable ----
		searchValue = e.detail;
	}

	function handleAddUser() {
		// ---- navigate to add user page ----
		goto('/users/add');
	}

	function handleBulkUploadUsers() {
		goto('/users/bulkUpload');
	}

	function handleTableActionClick(event) {
		const { actionName, actionData } = event.detail;
		tableActionName = actionName;
		if (actionName === 'view') {
			goto(`users/${event.detail.actionData.uuid}/details`);
		}

		if (actionName === 'edit') {
			goto(`users/${event.detail.actionData.uuid}/details/edit`);
		}

		if (actionName === 'delete') {
			userUuidForDeletion = actionData?.uuid;
			viewModal = true;
			userName = actionData?.name;
			userRole = actionData?.roleName;
			userDesignation = actionData?.designation || '-';
		}
	}

	function handleCancel() {
		deleteTextInput = '';
		viewModal = false;
	}

	function handleTraineeDeletion(e) {
		deleteTextInput = '';
		message.set('');

		usersList = usersList.filter((item) => item.uuid !== userUuidForDeletion);

		message.set(`Successfully deleted the user - "${userName}".`);
		viewModal = false;
	}

	function handleSuccesMessageClose(e) {
		message.set('');
	}

	onDestroy(() => {
		message.set('');
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
<div class="flex justify-between items-start mb-4 flex-nowrap">
	<div>
		<h1 class="font-semibold heading-L text-primary">Users</h1>
	</div>
</div>
<div class="mb-4">
	<Tabs {tabs} on:handleActiveTab={handleActiveTab} />
</div>

<div class="mb-5 flex gap-2 md:flex-nowrap flex-wrap">
	<SearchBar
		on:handleSearchValue={handleSearchValue}
		placeholder={'Search by name'}
		showSearchButton={false}
	/>
	<div class="flex gap-2 ml-auto">
		<Button btnType="secondary" on:click={handleBulkUploadUsers}>Bulk Upload</Button>
		<Button on:click={handleAddUser}>+ User</Button>
	</div>
</div>

<!-- <svelte:component  this={selectedComponent} /> -->
<ListingTable
	{tableData}
	bind:searchValue
	loading={tableLoading}
	{tableHeaderDisplay}
	actionConfigObject={actionConfigObejct}
	on:tableActionClick={handleTableActionClick}
/>

<!-- {#if viewDeleteModal}
	<DeletionModalViaAPI
		id={'pass_user_uuid'}
		name={'pass_user_name'}
		code={'pass_code'}
		heading={'Delete User'}
		para={'Are you sure you want to delete the user? This action cannot be undone.'}
		endPoint={'/apis/user/delete/'}
		on:handleCancelDeletion={togglDeleteModal}
		on:handleDeletion={handleUserDeletion}
	>
		<hr />
		<div class=" flex flex-col gap-2 p-6">
			<div>
				<p class="text-sm text-darkGray capitalize">User : {userName}</p>
				<p class="text-sm text-darkGray">Role : {userRole}</p>
				<p class="text-sm text-darkGray">Designation : {userDesignation}</p>
			</div>
		</div>
		<hr class="mb-2" />
		<div class="">
			<InputField
				label={"Type 'Please delete this user' to confirm"}
				placeholder={" Type 'Please delete this user'"}
				name={'deletion'}
				labelFontWeight={'font-normal'}
				bind:value={deleteTextInput}
				required
			/>
		</div>
	</DeletionModalViaAPI>
{/if} -->

{#if viewModal && tableActionName === 'delete'}
	<DeletionModalViaAPI
		name={userName}
		heading={`About to delete the user - ${userName}`}
		para={'Are you sure you want to delete the user? This action cannot be undone.'}
		endPoint={`/apis/users/${userUuidForDeletion}`}
		{deleteTextConfirmation}
		on:handleCancelDeletion={handleCancel}
		on:handleDeletion={handleTraineeDeletion}
	>
		<div
			class=" flex flex-col gap-2 p-6 bg-offwhite rounded-lg mb-4 border border-gray-50 text-darkGray"
		>
			<div>
				<p class="text-sm capitalize">
					<span class="label">Name :</span>
					{userName}
				</p>
				<p class="text-sm"><span class="font-medium">Role :</span>{userRole}</p>
				<p class="text-sm">
					<span class="font-medium">Designation :</span>{userDesignation ? userDesignation : '-'}
				</p>
			</div>
		</div>

		<div class="">
			<InputField
				label={"Type 'Please delete this user' to confirm"}
				placeholder={" Type 'Please delete this user'"}
				name={'deletion'}
				labelFontWeight={'font-normal'}
				bind:value={deleteTextInput}
				required
			/>
		</div>
	</DeletionModalViaAPI>
{/if}
