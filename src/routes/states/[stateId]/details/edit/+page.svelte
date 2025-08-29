<script>
    import { page } from '$app/stores';
    import AddStateForm from '$lib/states/addState/AddStateForm.svelte';

    export let data

    let {stateDetails} = data
    let formObject={}

    $: if (!stateDetails?.error && Array.isArray(stateDetails)) {
        let englishDetails = stateDetails?.find(state => state?.languageCode === 'en') || {};
        let hindiDetails = stateDetails?.find(state => state?.languageCode === 'hi') || {};

        formObject = {
            nameEn: englishDetails?.name || '',
            nameHi: hindiDetails?.name || '',
            isoCode: englishDetails?.isoCode || hindiDetails?.isoCode || '',
            extId: englishDetails?.extId || hindiDetails?.extId || '',
            method: 'PUT'
        };
    }
 
</script>

<AddStateForm route={$page.route.id} params={$page.params} {formObject} formMode={'PUT'} extId = {formObject?.extId} />