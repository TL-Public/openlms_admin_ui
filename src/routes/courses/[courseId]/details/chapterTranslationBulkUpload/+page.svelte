<script>
	import { page } from '$app/stores';
	import BulkUpload from '$lib/components/BulkUpload.svelte';

	$:id = $page.params.courseId;
</script>

<BulkUpload
	bulkUploadItemName="chapter translations"
	endPoint={`/apis/courses/details/${id}/chapters/bulkUpload/chapterTranslation`}
	templatePath="/bulk-upload-chapter-translation-template.xlsx"
	templateFileName="chapter-translation-template.xlsx"
/>
