// import { String_Constants } from '/src/config/constants.js';
import { error } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import { handleRedirection, getErrorMessage } from '$lib/utils/helper.js';
import { resourceNames, userActions } from '$lib/data.js';

export async function load({ fetch, url }) {
	const fetchFaqCategoryList = async () => {
		let res;
		try {
			res = await fetch(`/apis/faqs/faqCategories`);

			if (!res.ok) {
				const { errorMsg, redirectUser } = getErrorMessage({
					status: res?.status,
					action: userActions.LIST,
					module: resourceNames.FAQCategory
				});

				if (redirectUser) {
					handleRedirection(res.status, url.pathname, url.search);
				}

				return { error: errorMsg };
			}

			const data = await res.json();
			if (data?.length === 0 || Object.keys(data)?.length === 0) {
				throw new Error('No FAQ Categories found');
			}

			return data;
		} catch (err) {
			return { status: res.status, error: err.message };
		}
	};

	return {
		faqCategoryListData: await fetchFaqCategoryList()
	};
}
