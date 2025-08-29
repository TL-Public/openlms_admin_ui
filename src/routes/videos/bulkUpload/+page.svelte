<script>
	import { page } from '$app/stores';
	import BulkUpload from '$lib/components/BulkUpload.svelte';

	$:id = $page.params.courseId;
</script>

<div>
	<BulkUpload
		bulkUploadItemName="Videos"
		endPoint={`/apis/videos/bulkUpload`}
		templatePath="/bulk-upload-chapters-template.xlsx"
		templateFileName="videos-template.xlsx"
		usePolling={true}
	/>
</div>
