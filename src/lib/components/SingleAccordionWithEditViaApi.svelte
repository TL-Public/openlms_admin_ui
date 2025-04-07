<script>
	import { createEventDispatcher } from 'svelte';
	import ChapterMultilingualEditForm from '$lib/courses/courseDetails/ChapterMultilingualEditForm.svelte';
	import Edit from '$lib/svgComponents/Edit.svelte';
	import Delete from '$lib/svgComponents/Delete.svelte';

	export let name;
	export let name2;
	export let description;
	export let description2;
	export let draggable = false;
	export let editIcon = false;
	export let deleteIcon = false;
	export let secondInputField = false;
	export let uuid;
	export let courseUuid;
	export let orderNumber;

	// This function is invoked in parent componeent to control the expanded state of the accordion
	export function handleAccordionOpen() {
		expanded = true;
	}

	let dispatch = createEventDispatcher();
	let viewModal = false;
	let expanded = false;

	function handleClick(e) {
		expanded = !expanded;
	}

	function handleEdit() {
		viewModal = true;
		dispatch('modalOpened');
	}

	function handleDeleteButtonClick() {
		dispatch('handleDeleteChapter', uuid);
	}

	function handleCancelSubmission(e) {
		viewModal = false;
		dispatch('modalClosed');
	}
</script>

<div class=" space-y-6 divide-y divide-gray-900/10" role="button" tabindex="0">
	<div class=" transition-all duration-300 ease-in-out">
		<dt
			class=" border-2 py-1 px-4 rounded-lg text-darkGray bg-offwhite hover:border-primaryBlue-40"
		>
			<!-- Expand/collapse button -->
			<button
				type="button"
				class="accordion flex w-full items-center justify-between text-left"
				aria-controls="accordion-0"
				id="accordion"
				aria-expanded="false"
				on:click={(e) => handleClick(e)}
				on:keydown={(e) => {
					if (e.key !== ' ' || e.key !== 'Enter') return;
					handleClick(e);
				}}
			>
				<div class="flex gap-4 items-center">
					{#if draggable}
						<span>
							<img src="/dragAndDrop.svg" alt="drag and drop icon" />
						</span>
					{/if}
					<span class="text-sm leading-7 text-primary font-semibold">
						<div>
							{name}
						</div>
						{#if secondInputField}
							<div>
								{name2}
							</div>
						{/if}
					</span>
				</div>
				{#if viewModal}
					<div>
						<ChapterMultilingualEditForm
							{name}
							{name2}
							{description}
							{description2}
							{orderNumber}
							{uuid}
							{courseUuid}
							on:handleCancelSubmission={handleCancelSubmission}
							on:handleEditChapter
						/>
					</div>
				{/if}

				<span class=" flex">
					<div class="flex items-center gap-3 mr-8">
						{#if editIcon}
							<button on:click|stopPropagation={handleEdit} class="flex items-center">
								<Edit stroke="#FF6A1F" />
							</button>
						{/if}
						{#if deleteIcon}
							<button on:click|stopPropagation={handleDeleteButtonClick} class="flex items-center">
								<Delete stroke="#FF6A1F" />
							</button>
						{/if}
					</div>

					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="2"
						stroke="#143164"
						class="size-4 lg:size-5 transition-transform duration-300 ease-in-out"
						class:rotate-180={expanded}
					>
						<path stroke-linecap="round" stroke-linejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
					</svg>
				</span>
			</button>
		</dt>
		{#if expanded}
			<dd class="mt-2" id="videoList">
				<div class="text-xs sm:text-sm leading-7 text-darkgray font-normal px-2">
					<slot></slot>
				</div>
			</dd>
		{/if}
	</div>
</div>
