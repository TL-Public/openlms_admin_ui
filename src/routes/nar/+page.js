import { handleRedirection } from '$lib/utils/helper.js';
import { browser } from '$app/environment';
import { userDetails } from '/src/routes/store.js'

export async function load({ fetch, url, parent }) {

		if (browser) {
			const {user} = await parent();
			userDetails?.set(user);
		}

	const fetchNarDetails = async () => {
		let res;
		try {
			res = await fetch(`/apis/nar/details`);
			if (!res.ok) {
				throw new Error('Data not found');
			}
			if (res.status !== 200) {
				throw new Error('Data not found');
			}
			const data = await res.json();
			if (data?.length === 0 || Object.keys(data)?.length === 0) {
				throw new Error('Data not found');
			}
			return data;
		} catch (err) {
			console.log('err',err)
			handleRedirection(res.status, url.pathname, url.search);
			return { error: err.message };
		}
	};

	return {
		narDetails: await fetchNarDetails()
	};
}
