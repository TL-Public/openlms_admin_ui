import { browser } from '$app/environment';
import { userDetails } from '/src/routes/store.js'
import { getErrorMessage, handleRedirection } from '$lib/utils/helper.js';
import { resourceNames, userActions } from '$lib/data.js';
 
export async function load({ parent, params}) {

	let {stateId} = params;

	if (browser) {
		const {user} = await parent();
		userDetails?.set(user);
	}

    const fetchStateDetails = async () => {
		let res;
		try {
			res = await fetch(`/apis/states/${stateId}`);

			console.log('res', res)

			if (!res.ok || res.status != 200) {
				const { errorMsg, redirectUser } = getErrorMessage({
					status: res?.status,
					action: userActions.LIST,
					module: resourceNames.STATE
				});

				if (redirectUser) {
					handleRedirection(res.status, url.pathname, url.search);
				}

				return { error: errorMsg };
			}

			const data = await res.json();

			if (data?.length === 0 || Object.keys(data)?.length === 0) {
				throw new Error('Data not found');
			}
			return data;
		} catch (err) {
			return { status: res?.status, error: err?.message };
		}
	};

    return {
		stateDetails: await fetchStateDetails()
	};

}