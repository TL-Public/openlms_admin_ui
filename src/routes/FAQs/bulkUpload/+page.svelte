<script>
	import { page } from '$app/stores';
	import BulkUpload from '$lib/components/BulkUpload.svelte';
</script>

<BulkUpload
	bulkUploadItemName="faqs"
	endPoint="/apis/faqs/batchUpload"
	templatePath="/faq_EN_template.xlsx"
	templateFileName="faq_EN_template.xlsx"
/>