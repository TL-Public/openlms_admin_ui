<script>
	import { page } from '$app/stores';
	import BulkUpload from '$lib/components/BulkUpload.svelte';

	$:id = $page.params.courseId;
</script>

<div>
	<BulkUpload
		bulkUploadItemName="chapters"
		endPoint="/apis/courses/details/${id}/chapters/bulkUpload"
		templatePath="/bulk-upload-chapters-template.xlsx"
		templateFileName="chapters-template.xlsx"
	/>
</div>
