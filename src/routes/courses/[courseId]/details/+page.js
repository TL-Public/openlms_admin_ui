import { browser } from '$app/environment';
import { userDetails } from '/src/routes/store.js';
import { getErrorMessage, handleRedirection } from '$lib/utils/helper.js';
import { resourceNames, userActions } from '$lib/data.js';

export async function load({ parent, params, url, fetch }) {
	if (browser) {
		const { user } = await parent();
		userDetails?.set(user);
	}

	const fetchDetailsOfACourse = async () => {
		let id = params?.courseId;
		let res;
		try {
			res = await fetch(`/apis/courses/details/${id}`);

			if (!res.ok || res.status != 200) {
				const { errorMsg, redirectUser } = getErrorMessage({
					status: res?.status,
					action: userActions.DETAILS,
					module: resourceNames.COURSE
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
			return { status: res.status, error: err.message };
		}
	};

	const fetchVideosOfACourse = async () => {
		let id = params?.courseId;
		let res;
		try {
			res = await fetch(`/apis/courses/details/videos/${id}`);
			if (!res.ok || res.status != 200) {
				const { errorMsg, redirectUser } = getErrorMessage({
					status: res?.status,
					action: userActions.DETAILS,
					module: resourceNames.VIDEO
				});

				if (redirectUser) {
					handleRedirection(res.status, url.pathname, url.search);
				}

				return { data: [], error: errorMsg };
			}
			const data = await res.json();
			if (data?.length === 0 || Object.keys(data)?.length === 0) {
				throw new Error('Data not found');
			}
			return { data: data, error: null };
		} catch (err) {
			return { data: [], error: err.message };
		}
	};

	const fetchIntroVideosOfACourse = async () => {
		let id = params?.courseId;
		let res;
		try {
			res = await fetch(`/apis/courses/details/${id}/introVideos`);
			if (!res.ok || res.status != 200) {
				const { errorMsg, redirectUser } = getErrorMessage({
					status: res?.status,
					action: userActions.DETAILS,
					module: resourceNames.VIDEO
				});

				if (redirectUser) {
					handleRedirection(res.status, url.pathname, url.search);
				}

				return { error: errorMsg };
			}
			const data = await res.json();
			// if (data?.length === 0 || Object.keys(data)?.length === 0) {
			// 	throw new Error('Data not found');
			// }
			return data
		} catch (err) {
			return { error: err.message, status: res?.status };
		}

	}

	return {
		courseDetailsData: await fetchDetailsOfACourse(),
		videosData: await fetchVideosOfACourse(),
		introVideos: await fetchIntroVideosOfACourse()
	};
}

// export async function load({ fetch, url, params }) {

// }
