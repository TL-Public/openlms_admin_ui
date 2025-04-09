// For GET API
import { String_Constants } from '/src/config/constants.js';

import { error } from '@sveltejs/kit';

export async function load({ fetch, depends }) {
	depends('rseti:all-rsetis');

	const fetchTCListDetails = async () => {
		try {
			const res = await fetch(`/apis/trainingCenters`);

			if (!res.ok || res.status !== 200) {
				throw error(404, 'Data not found');
			}

			const data = await res.json();
			if (data?.length === 0 || Object.keys(data)?.length === 0) {
				throw error(404, 'Data not found');
			}

			return data;
		} catch (err) {
			return { error: err.message };
		}
	};
	const fetchBankList = async () => {
		const res = await fetch(`/apis/banks`);
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
					title: 'No Bank Found'
				}
			];
		}

		// adding all banks option to the list
		data = [
			{
				title: String_Constants.ALL_BANKS,
				uuid: '0'
			},
			...data
		];
		return data;
	};
	return {
		tcData: await fetchTCListDetails(),
		bankData: await fetchBankList()
	};
}
