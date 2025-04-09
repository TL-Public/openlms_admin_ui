<script>
    import { page } from '$app/stores';
	import ErrorMessage from '$lib/components/ErrorMessage.svelte';
	import AddTraineeToACourseForm from '$lib/trainees/addTraineeToACourse/AddTraineeToACourseForm.svelte';

	export let data;
    let { traineeDetailsData}=data
    let formObject = {};
    let method='PUT'

	let traineeDataJSON = $page.url.searchParams.get('data');
	let datafromParams = JSON.parse(traineeDataJSON) || null
	let rsetiCourseUuid;
	let rsetiCourseName;
	let rsetiUuid;
	let rsetiName;

	$:if(datafromParams){
			rsetiCourseUuid=datafromParams?.rsetiCourseUuid||'',
            rsetiUuid=datafromParams?.rsetiUuid||'',
            rsetiName=datafromParams?.rsetiName||'',
            rsetiCourseName=datafromParams?.rsetiCourseName||'',
			formObject={
			traineeUuid:datafromParams?.traineeUuid||'',
			enrollmentDate:datafromParams?.enrolledOn||'',
		}
	}

</script>
{#if datafromParams}
<AddTraineeToACourseForm dataToSend={formObject} selectedCourseUuid={rsetiCourseUuid} selectedRsetiUuid={rsetiUuid} selectedRsetiName={rsetiName} selectedCourseName={rsetiCourseName} {method} {traineeDetailsData} />
{:else}
<ErrorMessage error={'Failed to fetch data'} />
{/if}
