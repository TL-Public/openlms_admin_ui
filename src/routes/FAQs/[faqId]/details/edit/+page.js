import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { userDetails } from '/src/routes/store.js';
import { getErrorMessage, handleRedirection } from '$lib/utils/helper.js';
import { resourceNames, userActions } from '$lib/data.js';

export async function load({ fetch, params, url, parent }) {
	if (browser) {
		const { user } = await parent();
		userDetails?.set(user);
	}

	let id = params.faqId;
	const fetchFAQs = async () => {
		let res;
		try {
			res = await fetch(`/apis/faqs/${id}`);
			if (!res.ok) {
				const { errorMsg, redirectUser } = getErrorMessage({
					status: res?.status,
					action: userActions.DETAILS,
					module: resourceNames.FAQ
				});

				if (redirectUser) {
					handleRedirection(res.status, url.pathname, url.search);
				}
				return { error: errorMsg };
			}

			const data = await res.json();
			if (data?.length === 0 || Object.keys(data)?.length === 0) {
				throw new Error('FAQ details not found');
			}
			return data;
		} catch (err) {
			return { error: err.message };
		}
	};

	return {
		FAQData: await fetchFAQs()
	};
}
