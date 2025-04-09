<script>
	import { page } from '$app/stores';
	import AddFaqForm from '$lib/faqs/AddFAQForm.svelte';

	export let data;
	let {faqCategoryListData}=data
	
	
</script>

<AddFaqForm route={$page.route.id} params={$page.params} {faqCategoryListData}/>
