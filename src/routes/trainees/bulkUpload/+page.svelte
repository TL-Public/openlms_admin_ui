<script>
	import { page } from '$app/stores';
	import BulkUpload from '$lib/components/BulkUpload.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import BreadCrumbs from '$lib/components/BreadCrumbs.svelte';
</script>

<div class="mb-2 lg:mb-0 mt-2 mx-12">
	<BreadCrumbs route={$page.route.id} params={$page.params.id} />
</div>
<div class="grid grid-cols-[1fr,1.5fr] w-full p-20 pt-4">
    <div class="border-r border-darkGray pr-2 ">
        <EmptyState heading={'Trainees'} />
    </div>
    <div class="pl-20">
        <BulkUpload bulkUploadItemName="trainee" />
    </div>
</div>
