<script>
	import { page } from '$app/stores';
	import AddUserForm from '$lib/users/addUser/AddUserForm.svelte';
	let route = $page.route.id;
	let params = $page.params;
	let userData = {};
	export let form;
	export let data;
	let { rsetiData, stateData } = data;

	$: if (!rsetiData?.error) {
		rsetiData = rsetiData?.flatMap((rseti) => {
			if (!rseti?.uuid || rseti?.uuid === '0') return []; // Return early if uuid is missing
			return rseti?.translations
				.filter((translation) => translation?.languageCode === 'en')
				.map((translation) => ({
					name: translation?.name,
					id: rseti?.uuid,
					stateId: rseti?.stateId
				}));
		});
	}

	$: if (!stateData?.error) {
		stateData = stateData?.flatMap((state) => {
			return state.uuid != 0 && state.languageCode === 'en'
				? [{ id: state.extId, name: state.name }]
				: [];
		});
	}
	function handleUserdata(event) {
		userData = event.details;
	}
</script>

<AddUserForm
	{route}
	{params}
	on:userData={handleUserdata}
	{form}
	stateOptionList={stateData}
	rsetiOptionList={rsetiData}
/>
