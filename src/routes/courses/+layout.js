import { String_Constants } from '/src/config/constants.js';
import { userDetails } from '/src/routes/store.js';
import { browser } from '$app/environment';

export async function load({ fetch, parent }) {

	if (browser) {
		const { user } = await parent();
		userDetails?.set(user);
	}
	const fetchRsetiDetails = async () => {
		try {
			const res = await fetch(`/apis/rsetis`);
			if (!res.ok) {
				throw new Error('Data not found');
			}
			if (res.status !== 200) {
				throw new Error('Data not found');
			}
			let data = await res.json();

			//checking for a length
			if (data?.length === 0 || Object.keys(data)?.length === 0) {
				return [
					{
						title: 'No Rseti Found'
					}
				];
			}
			let rsetiData = data.content;
			// adding all rseti option to the list
			rsetiData = [
				{
					name: String_Constants.ALL_RSETIS,
					uuid: '0'
				},
				...rsetiData
			];
			return rsetiData;
		} catch (err) {
			return { error: err.message };
		}
	};

	const fetchStateList = async () => {
		const res = await fetch(`/apis/states`);
		if (!res.ok) {
			throw new Error('Data not found');
		}
		if (res.status !== 200) {
			throw new Error('Data not found');
		}
		let data = await res.json();

		//checking for a length
		if (data?.length === 0 || Object.keys(data)?.length === 0) {
			return [
				{
					title: 'No State Found'
				}
			];
		}

		// adding all states option to the list
		data = [
			{
				title: String_Constants.ALL_STATES,
				uuid: '0'
			},
			...data
		];
		return data;
	};

	return {
		rsetiData: await fetchRsetiDetails(),
		stateData: await fetchStateList()
	};
}
