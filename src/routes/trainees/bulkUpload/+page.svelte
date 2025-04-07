<script>
	import { page } from '$app/stores';
	import BulkUpload from '$lib/components/BulkUpload.svelte';
</script>

<BulkUpload
	bulkUploadItemName="trainees"
	endPoint="/apis/trainees/batchUpload"
	templatePath="/bulk-upload-trainees-template.xlsx"
	templateFileName="trainee-bulkUpload-template.xlsx"
/>
