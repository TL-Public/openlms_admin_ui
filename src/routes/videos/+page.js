import { handleRedirection } from '$lib/utils/helper.js';
import { browser } from '$app/environment';
import { userDetails } from '/src/routes/store.js'

export async function load({ fetch, url, parent }) {

	if (browser) {
		const {user} = await parent();
		userDetails?.set(user);
			}

	const fetchVideoList = async () => {
		let res;
		try {
			res = await fetch(`/apis/videos`);
			if (!res.ok) {
				throw new Error('Data not found');
			}
			if (res.status !== 200) {
				throw new Error('Data not found');
			}
			let data = await res.json();
			if (data?.length === 0 || Object.keys(data)?.length === 0) {
				throw new Error('Data not found');
			}
			let dataToSend = data?.filter((item) => item?.status?.toLowerCase().trim() !== 'deleted');
			data = dataToSend;
			return data;
		} catch (err) {
			handleRedirection(res.status, url.pathname, url.search);
			return { error: err.message };
		}
	};

	return {
		videoList: await fetchVideoList()
	};
}
