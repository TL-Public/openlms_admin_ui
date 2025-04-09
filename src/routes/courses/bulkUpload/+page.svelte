<script>
	import { page } from '$app/stores';
	import BulkUpload from '$lib/components/BulkUpload.svelte';
</script>

<BulkUpload
	bulkUploadItemName="courses"
	endPoint="/apis/courses/batchUpload"
	templatePath="/bulk-upload-courses-template.xlsx"
	templateFileName="courses-template.xlsx"
/>
