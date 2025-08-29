<script>
	import InputField from '$lib/components/InputField.svelte';
	import Filter from './Filter.svelte';
	export let readonly = false;
	export let addressLine1 = '';
	export let addressLine2 = '';
	export let cityTown = '';
	export let state = '';
	export let pincode = '';
	export let addressLabel = '';
	export let fieldName = '';
	export let showStateDropDown = true;
	export let stateData;
	export let required = false;

	// Configuration for filter
	const StateOptionListConfigObject = {
		optionNameKey: 'title',
		optionIdKey: 'uuid'
	};

	function handleDropDown(e) {
		if (e.detail.type == 'stateDropdown') {
			state = e.detail.selectedItemName;
		}
	}
	let stateValid = true;
	$: validateSelectedState(state);
	// check that the selected state belongs to in the given option list
	function validateSelectedState(state) {
		if (stateData?.find((data) => data.title === state) || state === '') {
			stateValid = true;
		} else {
			stateValid = false;
		}
	}
</script>

<div class="w-full flex flex-col mb-2 gap-y-2 lg:gap-y-4 relative">
	<!-- Validation check on state -->
	{#if !stateValid}
		<h4 class="text-sm text-red-500 absolute right-0 top-0">
			* Please select a state from the given list
		</h4>
	{/if}
	<div class="w-full">
		<InputField
			{readonly}
			{required}
			label={fieldName}
			name={`${addressLabel}Line1`}
			placeholder={'Address Line 1'}
			bind:value={addressLine1}
		/>
	</div>
	<div class="w-full">
		<InputField
			{readonly}
			{required}
			name={`${addressLabel}Line2`}
			placeholder={'Address Line 2'}
			bind:value={addressLine2}
		/>
	</div>
	<div class="w-full">
		<InputField
			{readonly}
			{required}
			name={`${addressLabel}CityTown`}
			placeholder={'City/Town'}
			bind:value={cityTown}
		/>
	</div>
	{#if showStateDropDown}
		<Filter
			bind:itemSelected={state}
			{required}
            placeholder="State"
			optionListConfigObject={StateOptionListConfigObject}
			optionList={stateData}
			inputBoxClass="bg-white"
			addClass="border rounded-md"
			name={`${addressLabel}State`}
		/>
	{/if}
	<div class="w-full">
		<InputField
			{required}
			{readonly}
			name={`${addressLabel}Pincode`}
			placeholder={'Pincode'}
			bind:value={pincode}
			type="number"
		/>
	</div>
</div>
