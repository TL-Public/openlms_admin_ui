<script>
	import { createEventDispatcher, onMount } from 'svelte';
	export let options = [];
	export let filterCategory;
	export let selectedItemId = '';
	export let selectedItemName = '';
	export let validationErrors;
	export let label;
	export let placeholder;
	export let disabled = false;

	const dispatch = createEventDispatcher();
	let optionsCopy = [...options];
	let showDropdown = false;
	let dropDownRef;
	let searchFilterValue = '';

	// Clear search filter if optionsCopy becomes empty
	$: if (optionsCopy?.length === 0 && searchFilterValue) {
		clearSelection();
	}

	onMount(() => {
		document.addEventListener('click', handleClickOnDocument);
		return () => {
			document.removeEventListener('click', handleClickOnDocument);
		};
	});

	function handleClickOnDocument(e) {
		if (dropDownRef && dropDownRef.contains(e.target)) {
			showDropdown = true;
		} else {
			showDropdown = false;
		}
	}

	$: optionsCopy = searchFilterValue
		? options?.filter((data) =>
				(data?.title || data?.name)?.toLowerCase().includes(searchFilterValue?.toLowerCase())
			)
		: options;

	function handleListItemSelection(e) {
		validationErrors = '';
		const selectedData = e.target.closest('li').dataset;
		selectedItemId = selectedData.id;
		selectedItemName = selectedData.name;
		searchFilterValue = selectedItemName;
		showDropdown = false;
		dispatch('handleDispatchComboBoxData', { selectedItemId, selectedItemName });
	}

	function clearSelection() {
		showDropdown = false;
		selectedItemName = '';
		selectedItemId = '';
		searchFilterValue = '';
		dispatch('handleDispatchFilterData', { selectedItemId, selectedItemName });
	}

	function toggleDropdown() {
		showDropdown = !showDropdown;
	}
</script>

<div>
	{#if label}
		<label for={filterCategory} class="block text-xs sm:text-sm font-medium leading-5 text-darkGray"
			>{label}</label
		>
	{/if}
	<div class="relative" bind:this={dropDownRef}>
		<input
			type="text"
			id={filterCategory}
			class="block w-full rounded-md border-0 py-2 pl-3 pr-12 sm:py-1.5 sm:pl-2 sm:pr-20 text-darkGray shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-darkGray focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 truncate text-xs"
			role="combobox"
			aria-controls="options"
			placeholder={placeholder || ''}
			value={searchFilterValue ? searchFilterValue : selectedItemName}
			class:ring-red-500={validationErrors}
			class:ring-gray-300={!validationErrors}
			{disabled}
			on:click={toggleDropdown}
			on:input={(e) => (searchFilterValue = e.target.value)}
		/>
		{#if selectedItemName && showDropdown}
			<button
				type="button"
				class="absolute inset-y-0 right-0 flex items-center px-2 focus:outline-none"
				on:click={clearSelection}
			>
				<svg
					class="h-4 w-4 self-center"
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
				>
					<path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
				</svg>
			</button>
		{/if}
		{#if validationErrors && !showDropdown}
			<button class="absolute inset-y-0 right-0 flex items-center px-2 focus:outline-none">
				<svg
					class="h-5 w-5 text-red-500"
					viewBox="0 0 20 20"
					fill="currentColor"
					aria-hidden="true"
				>
					<path
						fill-rule="evenodd"
						d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
						clip-rule="evenodd"
					/>
				</svg>
			</button>
		{/if}
		{#if !validationErrors && !showDropdown}
			<button class="absolute inset-y-0 right-0 flex items-center px-2 focus:outline-none">
				<svg
					class="-mr-1 h-4 w-4 sm:h-5 sm:w-5 text-gray-400"
					viewBox="0 0 20 20"
					fill="currentColor"
					aria-hidden="true"
				>
					<path
						fill-rule="evenodd"
						d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
						clip-rule="evenodd"
					/>
				</svg>
			</button>
		{/if}

		{#if showDropdown}
			<ul
				class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
				id="options"
				role="listbox"
				on:click={handleListItemSelection}
			>
				{#each optionsCopy as data (data?.id || data?.uuid)}
					<li
						data-id={data?.uuid || data?.id}
						data-name={data?.title || data?.name}
						class="relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900"
					>
						<span class="block truncate text-xs sm:text-sm" title={data?.title || data?.name}
							>{data?.title || data?.name}</span
						>
						{#if selectedItemId == (data?.uuid || data?.id)}
							<span class="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-600">
								<svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
									<path
										fill-rule="evenodd"
										d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
										clip-rule="evenodd"
									/>
								</svg>
							</span>
						{/if}
					</li>
				{/each}
			</ul>
		{/if}

		{#if validationErrors && !showDropdown}
			<div class="relative mb-4 mt-1">
				<p class=" text-xs text-red-600 absolute w-full right-0">{validationErrors}</p>
			</div>
		{/if}
	</div>
</div>
