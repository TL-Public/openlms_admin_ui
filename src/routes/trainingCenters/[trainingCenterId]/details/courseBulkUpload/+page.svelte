<!-- Bulk Upload for courses under an RSETI not implemented. This is the sample UI. -->

<script>
	import { page } from '$app/stores';
	import BulkUpload from '$lib/components/BulkUpload.svelte';

	$:id = $page.params.trainingCenterId;
</script>

<div>
	<BulkUpload 
	bulkUploadItemName="courses under a training center"
	endPoint={`/apis/trainingCenters/${id}/bulkUploadCourses`}
	templatePath="/bulk-upload-training-center-courses-template.xlsx"
	templateFileName="training-center-courses-template.xlsx"
	/>
</div>
