import { handleRedirection } from '$lib/utils/helper.js';
import { browser } from '$app/environment';
import { userDetails } from '/src/routes/store.js';

export async function load({ fetch, url, params, parent }) {
	if (browser) {
		const { user } = await parent();
		userDetails?.set(user);
	}

	const fetchVideoDetails = async () => {
		const id = params?.videoId;
		let res;
		try {
			res = await fetch(`/apis/videos/details/${id}`);

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
			return data;
		} catch (err) {
			console.log('err', err);
			handleRedirection(res?.status, url?.pathname, url?.search);
			return { status: res?.status, error: err.message };
		}
	};

	const getLinkedQUiz = async () => {
		const id = params?.videoId;
		let res;
		try {
			res = await fetch(`/apis/quizzes/linkedContent/${id}`);

			if (!res.ok) {
				throw new Error('Data not found');
			}
			if (res.status !== 200) {
				throw new Error('Data not found');
			}
			let data = await res.json();

			return data;
		} catch (err) {
			console.log('err', err);
			// handleRedirection(res?.status, url?.pathname, url?.search);
			return { status: res?.status, error: err.message };
		}
	};
		async function fetchAndStoreServiceToken() {
		try {
			const response = await fetch('/apis/serviceToken', {
				method: 'POST',
				credentials: 'include' // Ensures cookies are sent
			});

			
			if (!response.ok) throw new Error('Failed to get service token')
				
				const data = await response.json();
			
			return data.serviceToken; // Return the service token
		} catch (error) {
			console.error('Error fetching service token:', error.message);
			return null;
		}
	}
	

	return {
		serviceToken: await fetchAndStoreServiceToken(),
		videoDetails: await fetchVideoDetails(),
		videoUuid: params.videoId,
		linkedContent: await getLinkedQUiz()
	};
}
