<script>
	import { onMount } from 'svelte';
	export let addClass = '';
	export let itemSelected = 'Default Option';
	export let name = 'checkbox'
	export let placeholder = ''
	export let required = false
	// optionListConfigObject allows option list with custom key for option name
	// ans custon key for id
	export let optionListConfigObject = {
		optionNameKey: 'name',
		optionIdKey: 'id'
	};
	export let optionList = [
		{ id: 1, name: 'option_1' },
		{ id: 2, name: 'option_2' },
		{ id: 3, name: 'option_3' }
	];
	export let inputBoxClass = 'bg-blue-100'
	
	let filteredOptionList = optionList;
	let selectState = false;
	let dropDownRef;

	function toggleSelectState() {
		selectState = !selectState;
	}

	onMount(() => {
		document.addEventListener('click', handleClickOnDocument);
		function handleClickOnDocument(e) {
			if (dropDownRef && dropDownRef.contains(e.target)) {
				selectState = true;
			} else 
			{
				filteredOptionList = optionList;

				selectState = false;
			}
		}
	});

	// filters the options based on the value in the combo box
	function handleComboBoxChange(event) {
		filteredOptionList = optionList?.filter((element) => {
			return element[optionListConfigObject?.optionNameKey]
				?.toLowerCase()
				.trim()
				.includes(event.target.value?.toLowerCase().trim());
		});
	}
</script>

<div class={addClass} bind:this={dropDownRef}>
	<div class="relative ">
		<div class="relative ">
			<input
			on:input={handleComboBoxChange}
			bind:value={itemSelected}
			on:click={toggleSelectState}
			{required}
			{placeholder}
			name={name}
			class={`relative w-full cursor-default rounded-md py-2.5 sm:py-1.5 pl-3 pr-10 text-left font-semibold text-primary shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 text-xs sm:leading-6 ${inputBoxClass}`}
			aria-haspopup="listbox"
			aria-expanded="true"
			aria-labelledby="listbox-label"
		/>
		<span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
			<svg
				class="h-5 w-5 text-gray-400"
				viewBox="0 0 20 20"
				fill="currentColor"
				aria-hidden="true"
			>
				<path
					fill-rule="evenodd"
					d="M10 3a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02L10 4.852 7.3 7.76a.75.75 0 01-1.1-1.02l3.25-3.5A.75.75 0 0110 3zm-3.76 9.2a.75.75 0 011.06.04l2.7 2.908 2.7-2.908a.75.75 0 111.1 1.02l-3.25 3.5a.75.75 0 01-1.1 0l-3.25-3.5a.75.75 0 01.04-1.06z"
					clip-rule="evenodd"
					/>
				</svg>
		</span>
		</div>
		

		<!--
        Select popover, show/hide based on select state.
  
        Entering: ""
          From: ""
          To: ""
        Leaving: "transition ease-in duration-100"
          From: "opacity-100"
          To: "opacity-0"
      -->
		<ul
			class="{selectState
				? 'block'
				: 'hidden'} absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md  bg-white py-1 text-xs shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
			tabindex="-1"
			role="listbox"
			aria-labelledby="listbox-label"
			aria-activedescendant="listbox-option-3"
		>
			<!--
          Select option, manage highlight styles based on mouseenter/mouseleave and keyboard navigation.
  
          Highlighted: "bg-indigo-600 text-white", Not Highlighted: "text-gray-900"
        -->

			{#each filteredOptionList as option (option[optionListConfigObject?.optionIdKey])}
				<li
					class="relative cursor-default select-none font-semibold text-primary  hover:bg-gray-100"
					id="listbox-option-0"
					role="option"
				>
					<!-- Selected: "font-semibold", Not Selected: "font-normal" -->
					<button
						type="button"
						on:click={() => {
							itemSelected = option[optionListConfigObject?.optionNameKey];
						}}
						class="w-full py-2 pl-3 pr-9 flex justify-start"
					>
						<span class="block truncate font-normal"
							>{option[optionListConfigObject?.optionNameKey]}</span
						>

						<!--
              Checkmark, only display for selected option.
              
              Highlighted: "text-white", Not Highlighted: "text-indigo-600"
              -->
						<span
							class="{itemSelected == option[optionListConfigObject?.optionNameKey]
								? 'flex'
								: 'hidden'} absolute inset-y-0 right-0 items-center pr-4 text-indigo-600"
						>
							<svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
								<path
									fill-rule="evenodd"
									d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
									clip-rule="evenodd"
								/>
							</svg>
						</span>
					</button>
				</li>
			{/each}

			<!-- More items... -->
		</ul>
	</div>
</div>
