import { getErrorMessage, handleRedirection } from '$lib/utils/helper.js';
import { resourceNames, userActions } from '$lib/data.js';
import { browser } from '$app/environment';
import { userDetails } from '/src/routes/store.js';

export async function load({ fetch, url, parent }) {
	if (browser) {
		const { user } = await parent();
		userDetails?.set(user);
	}
	const fetchTraineesData = async () => {
		let res;
		let data;
		try {
			res = await fetch(`/apis/trainees`);

			if (!res.ok || res.status != 200) {
				const { errorMsg, redirectUser } = getErrorMessage({
					status: res?.status,
					action: userActions.LIST,
					module: resourceNames.TRAINEE
				});

				if (redirectUser) {
					handleRedirection(res.status, url.pathname, url.search);
				}

				return { error: errorMsg };
			}

			data = await res.json();
			if (data?.length === 0 || Object.keys(data)?.length === 0) {
				throw new Error('No trainees found');
			}
			return data;
		} catch (err) {
			return { status: data?.status || 500, error: err.message };
		}
	};

	return {
		traineesData: await fetchTraineesData()
	};
}
