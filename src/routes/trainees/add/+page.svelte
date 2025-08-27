<script>
	import AddTraineeFormNew from '$lib/trainees/addTrainee/AddTraineeFormNew.svelte';
	import { page } from '$app/stores';

	export let data;
	$:stateData = data?.stateData?.filter((_,index)=>{
		return index!=0
	})
	
</script>

<AddTraineeFormNew route={$page.route.id} params={$page.params.id} coursesData={data.coursesData} {stateData}/>