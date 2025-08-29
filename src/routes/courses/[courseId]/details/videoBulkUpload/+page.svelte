<script>
	import { page } from '$app/stores';
	import BulkUpload from '$lib/components/BulkUpload.svelte';

	$:id = $page.params.courseId;
</script>

<div>
	<BulkUpload
		bulkUploadItemName="videos"
		endPoint={`/apis/videos/bulkUpload`}
		templatePath="/bulk-upload-chapters-template.xlsx"
		templateFileName="video-template.xlsx"
		usePolling={true}
	/>
</div>
