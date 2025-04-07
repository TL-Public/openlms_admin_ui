import { browser } from '$app/environment';
import { userDetails } from '/src/routes/store.js';
import { getErrorMessage, handleRedirection } from '$lib/utils/helper.js';
import { resourceNames, userActions } from '$lib/data.js';

export async function load({ fetch, params, url, parent }) {
	if (browser) {
		const { user } = await parent();
		userDetails?.set(user);
	}

	let id = params?.trainingCenterId;
	const fetchTCDetails = async () => {
		try {
			const res = await fetch(`/apis/trainingCenters/${id}`);

			if (!res.ok || res.status != 200) {
				const { errorMsg, redirectUser } = getErrorMessage({
					status: res?.status,
					action: userActions.DETAILS,
					module: resourceNames.TRAINING_CENTER
				});

				if (redirectUser) {
					handleRedirection(res.status, url.pathname, url.search);
				}

				return { error: errorMsg };
			}

			const data = await res.json();

			if (data?.length === 0 || Object.keys(data)?.length === 0) {
				throw new Error('Training center details not found');
			}

			return data;
		} catch (err) {
			return { error: err.message };
		}
	};
	return {
		TCDetails: await fetchTCDetails()
	};
}
