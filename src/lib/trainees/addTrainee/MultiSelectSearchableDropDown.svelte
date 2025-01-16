<script>
  import { createEventDispatcher, onMount } from 'svelte';
  import { fade } from 'svelte/transition';

  export let options = [];  // Array of objects { title: string, uuid: string }
  export let placeholder = 'Select options...';

  let selected = [];
  let isOpen = false;
  let inputValue = '';
  let dropdownRef;
  let inputRef;

  const dispatch = createEventDispatcher();

  // Filter options based on the input value and exclude already selected items
  $: filteredOptions = options.filter(option =>
    option.title?.toLowerCase().includes(inputValue.toLowerCase()) && !selected.some(item => item.uuid === option.uuid)
  );

  // Toggle dropdown visibility
  function toggleDropdown() {
    isOpen = !isOpen;
    if (isOpen) {
      setTimeout(() => inputRef.focus(), 0); // Focus input when dropdown opens
    }
  }

  // Select an option and clear the input value
  function selectOption(option) {
    selected = [...selected, option];
    inputValue = '';
    isOpen = false; // Close dropdown after selecting
    dispatch('handleDispatchFilterData', selected);
  }

  // Remove a selected option
  function removeOption(option) {
    selected = selected.filter(item => item.uuid !== option.uuid);
    selected=selected
    dispatch('handleDispatchFilterData', selected);
  }

  // Handle keyboard interactions
  function handleKeydown(event) {
    if (event.key === 'Escape') {
      isOpen = false;
    }
  }

  // Handle clicks outside the dropdown to close it
  function handleClickOutside(event) {
    if (dropdownRef && !dropdownRef.contains(event.target)) {
      isOpen = false;
    }
  }

  // Add and remove click event listener
  onMount(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  });
</script>
<div class="relative w-full" bind:this={dropdownRef}>
  <div
    class="flex flex-wrap items-center border border-gray-300 rounded-md p-2 cursor-pointer gap-1"
    on:click|stopPropagation={toggleDropdown} 
    role="combobox"
    aria-haspopup="listbox"
    aria-expanded={isOpen}
  >
    <!-- Placeholder text when no options are selected -->
    {#if selected.length === 0}
      <span class="text-gray-400">{placeholder}</span>
    {/if}

    <!-- Render selected options as pills -->
    {#each selected as item (item.uuid)}
      <span
        class=" bg-blue-100 text-blue-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded-full flex items-center"
        transition:fade
      >
        {item.title}
        <!-- Remove button for each selected option -->
        <button
          type="button"
          class="ml-1 text-blue-600 hover:text-blue-800 focus:outline-none"
          on:click|stopPropagation={() => removeOption(item)}
          aria-label={`Remove ${item.title}`}
        >
          &times;
        </button>
      </span>
    {/each}
  </div>

  <!-- Dropdown with filtered options -->
  {#if isOpen}
    <div
      class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg"
      transition:fade
      role="listbox"
    >
      <!-- Input for filtering options -->
      <input
        type="text"
        bind:value={inputValue}
        bind:this={inputRef}
        placeholder="Type to filter..."
        class="w-full p-2 border-b border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        on:keydown={handleKeydown}
      />

      <!-- List of filtered options -->
      <ul class="max-h-60 overflow-y-auto">
        {#each filteredOptions as option (option.uuid)}
          <li
            class="px-4 py-2 hover:bg-gray-100 cursor-pointer"
            role="option"
            aria-selected={selected.some(item => item.uuid === option.uuid)}
            on:click={() => selectOption(option)}
          >
            {option.title}
          </li>
        {/each}
        <!-- Show message if no options match the filter -->
        {#if filteredOptions.length === 0}
          <li class="px-4 py-2 text-gray-500">No options found</li>
        {/if}
      </ul>
    </div>
  {/if}
</div>
