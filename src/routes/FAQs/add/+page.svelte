<script>
	import { page } from '$app/stores';
	import AddFaqForm from '$lib/faqs/AddFAQForm.svelte';
	import SubmissionErrorMessage from '$lib/components/SubmissionErrorMessage.svelte';
	import { combineErrorMessages } from '$lib/utils/helper.js';

	export let data;
	let { faqCategoryListData } = data;

	$: secondaryErrors = combineErrorMessages(faqCategoryListData?.error);
</script>

{#if secondaryErrors}
	<div class="mb-2">
		<SubmissionErrorMessage errorMessage={secondaryErrors} />
	</div>
{/if}
<AddFaqForm route={$page.route.id} params={$page.params} {faqCategoryListData} />
