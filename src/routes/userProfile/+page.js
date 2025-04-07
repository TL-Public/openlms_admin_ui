
import { browser } from '$app/environment';
import { userDetails } from '/src/routes/store.js'
import { handleRedirection } from '$lib/utils/helper.js';
import { get } from 'svelte/store';

export async function load({ fetch, url, params, parent }) {
	
	if (browser) {
		const {user} = await parent();
		userDetails?.set(user);
	}

	const fetchUserDetails = async () => {
		let id = get(userDetails)?.uuid
		let res;
		try {
			res = await fetch(`/apis/users/userProfile`);

			console.log('res', res)

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
			handleRedirection(res.status, url.pathname, url.search);
			return { status: res?.status, error: err?.message };
		}
	};

	return {
		userData: await fetchUserDetails()
	};
}
