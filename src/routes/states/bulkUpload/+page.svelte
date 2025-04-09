<script>
	import { page } from '$app/stores';
	import BulkUpload from '$lib/components/BulkUpload.svelte';
	import BreadCrumbs from '$lib/components/BreadCrumbs.svelte';
</script>

<div class="mb-4 mx-6 mt-2">
	<BreadCrumbs route={$page.route.id} params={$page.params.id} />
</div>

     <div class="mx-6">
        <BulkUpload bulkUploadItemName="states" 
        endPoint={`/apis/states/bulkUpload`}
        />
     </div>
