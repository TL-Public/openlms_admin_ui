import { actions as parentActions } from '/src/routes/courses/+page.server.js';
import { redirect } from '@sveltejs/kit';

export const actions = parentActions;

export async function load({ fetch, url, params }) {
	// const fetchDetailsOfACourse = async () => {
	// 	let id = params?.courseId;
	// 	let res;
	// 	try {
	// 		res = await fetch(`/apis/courses/details/${id}`);
	// 		if (!res.ok) {
	// 			throw new Error('Data not found');
	// 		}

	// 		if (res.status !== 200) {
	// 			throw new Error('Data not found');
	// 		}
	// 		const data = await res.json();
	// 		if (data?.length === 0 || Object.keys(data)?.length === 0) {
	// 			throw new Error('Data not found');
	// 		}
	// 		return data;
	// 	} catch (err) {
	// 		if (res.status == 401) {
	// 			const fromUrl = url.pathname + url.search;
	// 			throw redirect(302, `/login?redirectTo=${fromUrl}`);
	// 		}
	// 		return { status: res.status, error: err.message };
	// 	}
	// };

	// return {
	// 	courseDetailsData: await fetchDetailsOfACourse()
	// };

	return {};
}
