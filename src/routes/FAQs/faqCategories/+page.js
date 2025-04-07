import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { handleRedirection } from '$lib/utils/helper.js';
import { userDetails } from '/src/routes/store.js'


export async function load({ fetch, url, parent }) {

	if (browser) {
		const {user} = await parent();
		userDetails?.set(user);
	}
	
	const fetchFaqCategoryList = async () => {
		let res;
		try {
			res = await fetch(`/apis/faqs/faqCategories`);

			if (!res.ok || res.status !== 200) {
				throw new Error('Data not found');
			}

			const data = await res.json();
			if (data?.length === 0 || Object.keys(data)?.length === 0) {
				throw new Error('Data not found');
			}

			return data;
		} catch (err) {
			handleRedirection(res.status, url.pathname, url.search);
			return { status: res.status, error: err.message };
		}
	};

	return {
		faqCategoryList: await fetchFaqCategoryList()
	};
}
