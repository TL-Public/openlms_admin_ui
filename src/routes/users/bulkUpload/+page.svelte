<script>
	import { page } from '$app/stores';
	import BulkUpload from '$lib/components/BulkUpload.svelte';
	import BreadCrumbs from '$lib/components/BreadCrumbs.svelte';
</script>

<BulkUpload bulkUploadItemName="users" endPoint={`/apis/users/bulkUpload`} />
