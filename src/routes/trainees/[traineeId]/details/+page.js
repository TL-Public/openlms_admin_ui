import { getErrorMessage, handleRedirection } from '$lib/utils/helper.js';
import { resourceNames, userActions } from '$lib/data.js';
import { browser } from '$app/environment';
import { userDetails } from '/src/routes/store.js';

export async function load({ fetch, url, params, parent }) {
	if (browser) {
		const { user } = await parent();
		userDetails?.set(user);
	}

	const fetchDetailsOfATrainee = async () => {
		let id = params?.traineeId;
		let res;
		try {
			res = await fetch(`/apis/trainees/${id}`);

			if (!res.ok || res.status != 200) {
				const { errorMsg, redirectUser } = getErrorMessage({
					status: res?.status,
					action: userActions.DETAILS,
					module: resourceNames.TRAINEE
				});

				if (redirectUser) {
					handleRedirection(res.status, url.pathname, url.search);
				}

				return { error: errorMsg };
			}

			const data = await res.json();
			if (data?.length === 0 || Object.keys(data)?.length === 0) {
				throw new Error('Trainee details not found');
			}
			return data;
		} catch (err) {
			return { status: res.status, error: err.message };
		}
	};

	return {
		traineeDetailsData: await fetchDetailsOfATrainee()
	};
}
