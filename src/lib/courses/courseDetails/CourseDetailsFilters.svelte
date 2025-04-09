<script>
    import Filter from '$lib/components/Filter.svelte';
    import { createEventDispatcher } from 'svelte';
    // Constants for value of select all filter option
    import { String_Constants } from '/src/config/constants.js';
 
    // set default filter values to select all value of that filter
    export let stateFilterValue;
    export let genderFilterValue;
 
    // gets option lists from +page.svelte
    export let stateFilterOptionList = [];
    export let genderFilterOptionList = [];
 
    const dispatch = createEventDispatcher();
 
    // dipatches event when filters are applied or cleared
    function handleApplyFilter() {
        dispatch('handleFilters', { stateFilter: stateFilterValue, genderFilter: genderFilterValue });
    }
 
    function handleClearFilter() {
        stateFilterValue = String_Constants.ALL_STATES;
        genderFilterValue = String_Constants.ALL_GENDERS;
        dispatch('handleFilters', { stateFilter: stateFilterValue, genderFilter: genderFilterValue });
    }
 
    // configures options for filter component
    const stateFilterConfig = {
        optionNameKey: 'title',
        optionIdKey: 'uuid'
    };
 
    const genderFilterConfig = {
        optionNameKey: 'name',
        optionIdKey: 'id'
    };
</script>
 
<div class="relative flex justify-end gap-8">
    <div class=" w-full flex sm:flex-row flex-col sm:gap-5 gap-2 justify-end flex-wrap">
        <Filter
            bind:itemSelected={stateFilterValue}
            optionList={stateFilterOptionList}
            optionListConfigObject={stateFilterConfig}
            addClass="sm:min-w-40 lg:min-w-60"
        />
        <Filter
            bind:itemSelected={genderFilterValue}
            optionList={genderFilterOptionList}
            optionListConfigObject={genderFilterConfig}
            addClass="sm:min-w-40 lg:min-w-60"
        />
        <div class="flex justify-between gap-5">
            <button on:click={handleClearFilter} class="text-sm font-semibold text-secondary"
                >Clear</button
            >
            <button
                on:click={handleApplyFilter}
                class="text-sm rounded-[4px] font-semibold text-white bg-primary px-6 py-2">Apply</button
            >
        </div>
    </div>
</div>