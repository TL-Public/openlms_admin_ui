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
	import { onDestroy, onMount } from 'svelte';
	import { message } from '/src/routes/users/userStore.js';
	import { userDetails } from '/src/routes/store.js';
	import { checkActionPermission } from '$lib/utils/helper.js';
	import { moduleNames, actionNames, roleIds, resourceNames } from '$lib/data.js';

	export let data;

	let { usersList } = data;

	let tableActionName = '';
	let userUuidForDeletion = '';
	let deletionConfirmText = 'please delete this user';
	let deleteTextConfirmation = false;
	let viewModal = false;
	let tabId;
	let tabs = [];
	let permissionsObject = {
		allowAddition: false
	};
	let roleNames
	let groupedUsers
	let tableData=[]

	let searchValue = '';
	let tableLoading = false;
	let actionConfigObject = [];
	let userName = '';
	let userRole = '';
	let userDesignation = '';
	let deleteTextInput = '';

	// Function to normalize text (removes spaces and ignores case)
	const normalizeText = (text) => text?.trim().toLowerCase().replace(/\s+/g, ' ');

	//primary data is the most important data on the page. Error in loading this data means, the page itself will be shown as an error page
	$: primaryDataError = usersList?.error ? usersList?.error : '';

	// Function to check if input matches the required text
	$: isTextValid(deleteTextInput);
	function isTextValid() {
		deleteTextConfirmation = normalizeText(deleteTextInput) === normalizeText(deletionConfirmText);
	}

	// ------------------------ User Grouping -------------------

	// Function to group users by roleId and extract distinct role names
	async function groupUsersByRole(users, rolesList) {

		const groupedUsers = {};
		const roleMap = new Map();
		if (users?.error) return { groupedUsers, roleNames: Array.from(roleMap.values()) };

		users?.forEach((user) => {
			// Find the role name from rolesList
			const role = rolesList?.find((r) => r.roleId == user.roleId);
			const roleName = role ? role.name : 'Unknown Role';

			// Add the role name to the roleNames Map
			roleMap.set(user.roleId, { roleId: user?.roleId, roleName, order: role?.order });

			// Group users by roleId
			if (!groupedUsers[user.roleId]) {
				groupedUsers[user.roleId] = [];
			}
			groupedUsers[user.roleId].push({ ...user, roleName: roleName });
		});
		const roleNames = Array.from(roleMap.values());

		if (roleNames?.length > 0) {
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
		if (!tabId) {
			tabId = tabs[0]?.id;
			tableData=groupedUsers[tabId]
		}
	}
	tableData = groupedUsers[tabId];
	return { groupedUsers, roleNames };
	}

	// -------------------------- Table Data and Related Functions-------------------------


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

	function handleActiveTab(e) {
		// --- Change the selected component to the componet of tab ---
		tabId = e.detail.id;
		tableData = groupedUsers[tabId] || [];
	}

	$: handleTableConfig(tabId);
	function handleTableConfig() {
		actionConfigObject = [];
		// Generally user crud is given for all users below the logged in users hirarchy except for state user, for state user he wont be able to do crud on trainer

		if (
			(Number($userDetails?.role) === Number(roleIds?.STATE_STAFF) ||
				Number($userDetails?.role) === Number(roleIds?.STATE_ADMIN)) &&
			Number(tabId) === Number(roleIds?.TRAINER)
		) {
			if (checkActionPermission($userDetails?.role, moduleNames?.USERS, actionNames?.DETAILS)) {
				let tempObj = {
					actionName: 'view',
					actionIconName: 'visibility',
					modal: false
				};
				actionConfigObject.push(tempObj);
			}
		} else {
			if (checkActionPermission($userDetails?.role, moduleNames?.USERS, actionNames?.DETAILS)) {
				let tempObj = {
					actionName: 'view',
					actionIconName: 'visibility',
					modal: false
				};
				actionConfigObject.push(tempObj);
			}

			if (checkActionPermission($userDetails?.role, moduleNames?.USERS, actionNames?.EDIT)) {
				let tempObj = {
					actionName: 'edit',
					actionIconName: 'edit',
					modal: false
				};
				actionConfigObject.push(tempObj);
			}

			if (checkActionPermission($userDetails?.role, moduleNames?.USERS, actionNames?.DELETE)) {
				let tempObj = {
					actionName: 'delete',
					actionIconName: 'delete',
					modal: true
				};
				actionConfigObject.push(tempObj);
			}
		}
	}

	// -------------------------- General Functions -------------------------------

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

	function handleSuccesMessageClose(e) {
		message.set('');
	}

	// ------------------------------------------- Deletion ----------------------------------
	function handleCancel() {
		deleteTextInput = '';
		viewModal = false;
	}

	function handleTraineeDeletion(e) {
		deleteTextInput = '';
		message.set('');

		usersList = usersList.filter((item) => item.uuid !== userUuidForDeletion);
		groupUsersByRole(usersList, rolesList)
	 
		message.set(`Successfully deleted the user - "${userName}".`);
		viewModal = false;
	}

	// ---------------------------------- Role based functions --------------------------------
	function roleBasedAcessSetting() {
		if (!$userDetails?.role) return;

		if (checkActionPermission($userDetails?.role, moduleNames.USERS, actionNames?.ADD)) {
			permissionsObject.allowAddition = true;
		} else {
			permissionsObject.allowAddition = false;
		}
	}

	onDestroy(() => {
		message.set('');
	});
	onMount(async () => {
		({ groupedUsers, roleNames } = await groupUsersByRole(usersList, rolesList));
		const unsubscribe = userDetails?.subscribe((user) => {
			if (user && Object.keys(user)?.length > 0) {
				roleBasedAcessSetting(user);
			}
		});

		return () => unsubscribe(); // Cleanup subscription
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
	<Tabs {tabs} on:handleActiveTab={handleActiveTab} activeTab={tabs?.find(tab => Number(tab?.id) === Number(tabId))}/>
</div>

<div class="mb-5 flex gap-2 md:flex-nowrap flex-wrap">
	<SearchBar
		on:handleSearchValue={handleSearchValue}
		placeholder={'Search by name'}
		showSearchButton={false}
	/>
	{#if permissionsObject?.allowAddition}
		<div class="flex gap-2 ml-auto">
			<!-- <Button btnType="secondary" on:click={handleBulkUploadUsers}>Bulk Upload</Button> -->
			<Button on:click={handleAddUser}>+ User</Button>
		</div>
	{/if}
</div>

<!-- <svelte:component  this={selectedComponent} /> -->
<ListingTable
	{tableData}
	bind:searchValue
	loading={tableLoading}
	error={primaryDataError}
	{tableHeaderDisplay}
	{actionConfigObject}
	on:tableActionClick={handleTableActionClick}
/>


{#if viewModal && tableActionName === 'delete'}
	<DeletionModalViaAPI
		name={userName}
		module={resourceNames.USERS}
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
