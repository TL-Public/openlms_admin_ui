import { getErrorMessage, handleRedirection } from '$lib/utils/helper.js';
import { resourceNames, userActions } from '$lib/data.js';
import { browser } from '$app/environment';
import { userDetails } from '/src/routes/store.js';

export async function load({ fetch, url, params, parent }) {
	if (browser) {
		const { user } = await parent();
		userDetails?.set(user);
	}

	const fetchTestimonialDetails = async () => {
		let id = params.officialTestimonialId;
		let res;
		try {
			res = await fetch(`/apis/officialTestimonials/${id}`);

			if (!res.ok || res.status != 200) {
				const { errorMsg, redirectUser } = getErrorMessage({
					status: res?.status,
					action: userActions.DETAILS,
					module: resourceNames.OFFICIAL_TESTIMONIAL
				});

				if (redirectUser) {
					handleRedirection(res.status, url.pathname, url.search);
				}

				return { error: errorMsg };
			}

			const data = await res.json();
			if (data?.length === 0 || Object.keys(data)?.length === 0) {
				throw new Error('Testimonial details not found');
			}
			return data;
		} catch (err) {
			return { error: err.message };
		}
	};

	return {
		testimonialDetails: await fetchTestimonialDetails()
	};
}
