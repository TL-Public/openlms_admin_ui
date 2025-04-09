<script>
	import { createEventDispatcher, onMount, afterUpdate } from 'svelte';
	import Button from '$lib/components/Button.svelte';

	export let filterOptions = [];
	export let btnType = '';

	const dispatch = createEventDispatcher();
	let filterButton;
	let filterBox;
	let boxPosition = { right: 'auto', left: 0 };
	let componentNode;
	let isExpanded = false;
	let isLoading = false;
	let selectedFilters = {};

	function toggleExpand() {
		isExpanded = !isExpanded;
	}

	function updateFilter(category, value, id) {
		const selectedItem = filterOptions
			.find((option) => option.filterName === category)
			?.filterValue.find((item) => item.id === id);

		if (selectedItem) {
			if (selectedFilters[category] && selectedFilters[category].id === id) {
				// If the same item is selected again, remove it
				delete selectedFilters[category];
			} else {
				// Otherwise, update or add the new selection
				selectedFilters[category] = selectedItem;
			}
			selectedFilters = { ...selectedFilters };
		}
	}

	function clearFilter(event, category) {
		event.stopPropagation();
		delete selectedFilters[category];
		selectedFilters = { ...selectedFilters };
		// Reset the dropdown
		const dropdown = document.getElementById(category);
		if (dropdown) {
			dropdown.value = '';
		}
	}

	function clearAllFilters() {
		selectedFilters = {};
		// Reset all dropdowns
		filterOptions.forEach((option) => {
			const dropdown = document.getElementById(option.filterName);
			if (dropdown) {
				dropdown.value = '';
			}
		});
	}

	function applyFilters() {
		dispatch('filterApplied', { selectedFilters });
		toggleExpand();
	}

	function positionFilterBox() {
		if (!filterButton || !filterBox) return;

		const buttonRect = filterButton?.getBoundingClientRect();
		const boxRect = filterBox?.getBoundingClientRect();
		const viewportWidth = window.innerWidth;

		if (buttonRect.left + boxRect.width > viewportWidth) {
			boxPosition = { right: 0, left: 'auto' };
		} else {
			boxPosition = { right: 'auto', left: 0 };
		}
	}

	function handleOutsideClick(event) {
		if (componentNode && !componentNode.contains(event.target) && isExpanded) {
			isExpanded = false;
		}
	}

	onMount(() => {
		window.addEventListener('resize', positionFilterBox);
		document.addEventListener('click', handleOutsideClick);
		return () => {
			window.removeEventListener('resize', positionFilterBox);
			document.removeEventListener('click', handleOutsideClick);
		};
	});

	afterUpdate(() => {
		if (isExpanded) {
			positionFilterBox();
		}
	});

	$: if (isExpanded) {
		setTimeout(positionFilterBox, 0);
	}
</script>

<div class="relative inline-block" bind:this={componentNode}>
	<Button bind:btnRef={filterButton} on:click={toggleExpand} {btnType}>
		<slot name="btnContent"></slot>
	</Button>

	{#if isExpanded}
		<div
			bind:this={filterBox}
			class="absolute top-full mt-2 w-64 bg-white border border-gray-200 rounded-md shadow-lg p-4 z-10"
			style="right: {boxPosition.right}; left: {boxPosition.left};"
		>
			{#if Object.keys(selectedFilters).length > 0}
				<div class="mb-4 flex flex-wrap gap-2">
					{#each Object.entries(selectedFilters) as [category, value]}
						<div class="flex items-center bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-sm">
							<span>{category}: {value.name}</span>
							<button
								on:click={(event) => clearFilter(event, category)}
								class="ml-2 text-gray-500 hover:text-gray-700"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="14"
									height="14"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									class="feather feather-x"
									><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"
									></line></svg
								>
							</button>
						</div>
					{/each}
				</div>
			{/if}

			{#each filterOptions as filterOption}
				<div class="mb-4">
					<label for={filterOption.filterName} class="block text-sm text-darkGray mb-1 capitalize"
						>{filterOption.filterName}</label
					>
					<div class="relative">
						<select
							id={filterOption.filterName}
							class="w-full p-2 pr-8 border border-gray-300 rounded-md bg-white text-gray-700 appearance-none text-sm"
							on:change={(e) =>
								updateFilter(
									filterOption.filterName,
									e.target.value,
									e.target.options[e.target.selectedIndex].id
								)}
							value={selectedFilters[filterOption.filterName]?.name || ''}
						>
							<option value="">Select {filterOption.filterName}</option>
							{#each filterOption.filterValue as option}
								<option value={option.name} id={option.id}>{option.name}</option>
							{/each}
						</select>
					</div>
				</div>
			{/each}

			<div class="flex justify-between items-center mt-4">
				<button on:click={clearAllFilters} class="text-gray-500 hover:text-gray-700 text-sm">
					Clear All
				</button>
				<Button on:click={applyFilters} disabled={isLoading}>
					{#if isLoading}
						<svg
							class="animate-spin h-5 w-5 mr-2"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
						>
							<circle
								class="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								stroke-width="4"
							></circle>
							<path
								class="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
							></path>
						</svg>
					{:else}
						Apply
					{/if}
				</Button>
			</div>
		</div>
	{/if}
</div>
