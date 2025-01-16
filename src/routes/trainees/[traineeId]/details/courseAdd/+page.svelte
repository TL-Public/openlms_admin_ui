<script>
    import AddTraineeToACourseForm from "$lib/trainees/addTraineeToACourse/AddTraineeToACourseForm.svelte";
    import { page } from "$app/stores";
	import ErrorMessage from '$lib/components/ErrorMessage.svelte';
	import { onDestroy } from "svelte";
	import { message } from '/src/routes/trainees/traineeStore.js';


    export let data;
    let { coursesData, rsetiData, traineeDetailsData}=data
	let rsetiList=[]
   
    $: if (!rsetiData?.error) {
		rsetiList = rsetiData?.flatMap((rseti) => {
			if (!rseti?.uuid || rseti?.uuid ==="0") return []; // Return early if uuid is missing
			return rseti?.translations
				.filter((translation) => translation?.languageCode === 'en')
				.map((translation) => ({
					name: translation?.name,
					id: rseti?.uuid,
				}));
		});
	}

</script>

{#if !traineeDetailsData?.error}
<AddTraineeToACourseForm {rsetiList} {coursesData} {traineeDetailsData} route={$page.route.id} />
{:else}
<ErrorMessage errorMessage={'Failed to fetch trainee'} />
{/if}