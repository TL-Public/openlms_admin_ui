<script>
	import { createEventDispatcher } from 'svelte';
	import InputField from '$lib/components/InputField.svelte';
	import Tick from '$lib/svgComponents/Tick.svelte';
	import Cross from '$lib/svgComponents/Cross.svelte';
	import DeletionModalViaUI from '$lib/components/DeletionModalViaUI.svelte';

	export let name;
	export let name2;
	export let index;
	export let draggable = false;
	export let editIcon=false;
	export let deleteIcon=false;
	export let  secondInputField =false;
	export let editViaAPI = false;


	let dispatch = createEventDispatcher();
	let edit = false;
	let expanded = false;
	let showDeleteModal = false;
	
	function handleClick(e) {
		if (edit === true) {
			expanded = true;
			return;
		}
		expanded = !expanded;
	}

	function handleEdit() {
		edit = true;
	}

	function handleDeleteButtonClick() {
		showDeleteModal = true;
	}

	function handleDelete(){
		dispatch('handleDelete', index)
		showDeleteModal=false
	
	}

	function dispatchEditData() {
		dispatch('handleEdit', { index: index, name: name, name2: name2 });
		edit = false;
	}

	function handleClear() {
		name = '';
		name2=''
	}
</script>

<div class=" space-y-6 divide-y divide-gray-900/10" role="button" tabindex="0">
	<div class=" transition-all duration-300 ease-in-out">
		<dt class="border-gray100 border-2 py-1 px-4 rounded-lg hover:bg-blue-100 hover:rounded">
			<!-- Expand/collapse question button -->
			<button
				type="button"
				class="flex w-full items-center justify-between text-left text-gray-900"
				aria-controls="accordioon-0"
				aria-expanded="false"
				on:click={(e) => handleClick(e)}
				on:keydown={(e) => handleClick(e)}
			>
		
			<div class="flex gap-4 items-center">
				{#if draggable}
			<span>
				<img src="/dragAndDrop.svg" alt="drag and drop icon">
			</span>
			{/if}
				<span class="text-sm leading-7 text-darkGray font-semibold">
					{#if edit === false}
					<div>
						{name}
					</div>
						{#if secondInputField}
						<div>
							{name2}
						</div>
						{/if}
					{:else}
						<div class="m-1 flex gap-2">
							<InputField
								placeholder={'Enter module name'}
								name={'duration'}
								bind:value={name}
								required
							/>
							{#if secondInputField}
							<InputField
							placeholder={'Enter second name'}
							name={'name2'}
							bind:value={name2}
							required
						/>
							{/if}

							<button on:click={dispatchEditData}>
								<Tick />
							</button>
							<button on:click={handleClear}>
								<Cross />
							</button>
						</div>
					{/if}</span
				>
				</div>
				<span class="ml-6 flex h-7 items-center gap-6">
					<div class="flex">
						{#if editIcon}
						<button on:click={handleEdit}>
							<img src="/edit.svg" alt="icon for edit" class="px-2" />
						</button>
						{/if}
						{#if deleteIcon}
						<button on:click={handleDeleteButtonClick}>
							<img src="/trash.svg" alt="icon for delete" class="px-2" />
						</button>
						{/if}
					</div>

					{#if expanded}
						<!--
                    Item expanded.
                  -->

						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							class="size-4 lg:size-5"
						>
							<path stroke-linecap="round" stroke-linejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
						</svg>
					{:else}
						<!--
                    Icon when question is collapsed
                  -->

						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							class="size-4 lg:size-5"
						>
							<path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
						</svg>
					{/if}
				</span>
			</button>
		</dt>
		{#if expanded}
			<dd class="mt-2" id="datatable">
				<p class="text-xs sm:text-sm leading-7 text-darkgray font-normal px-2">
					<slot></slot>
				</p>
			</dd>
		{/if}
	</div>
</div>

{#if showDeleteModal}
	<DeletionModalViaUI 
	paraText={'Are you sure you want to delete module. All of your data including topic,contents and duration will be permanently removed. This action cannot be undone.'}
	headingText={'Module Deletion'}
	on:handleDelete={handleDelete}
	bind:showDeleteModal/>
{/if}
