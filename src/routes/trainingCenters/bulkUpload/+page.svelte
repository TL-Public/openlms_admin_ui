<script>
	import { page } from '$app/stores';
	import BulkUpload from '$lib/components/BulkUpload.svelte';
</script>

<div class="">
	<BulkUpload 
	bulkUploadItemName="training centers"
	endPoint="/apis/trainingCenters/bulkUpload"
	templatePath="/bulk-upload-training-center-template.xlsx"
	templateFileName="training-center-template.xlsx"
	usePolling={true}
	/>
</div>
