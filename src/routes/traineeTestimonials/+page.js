import { browser } from '$app/environment';
import { userDetails } from '/src/routes/store.js';
import { getErrorMessage, handleRedirection } from '$lib/utils/helper.js';
import { resourceNames, userActions } from '$lib/data.js';

export async function load({ fetch, url, parent }) {
	if (browser) {
		const { user } = await parent();
		userDetails?.set(user);
	}

	const fetchTestimonials = async () => {
		let res;
		try {
			res = await fetch(`/apis/traineeTestimonials`);
			if (!res.ok || res.status != 200) {
				const { errorMsg, redirectUser } = getErrorMessage({
					status: res?.status,
					action: userActions.LIST,
					module: resourceNames.TRAINEE_TESTIMONIAL
				});

				if (redirectUser) {
					handleRedirection(res.status, url.pathname, url.search);
				}

				return { error: errorMsg };
			}

			const data = await res.json();

			if (data?.length === 0 || Object.keys(data)?.length === 0) {
				throw new Error('Trainee testimonial not found.');
			}

			return data;
		} catch (err) {
			return { error: err.message };
		}
	};

	// const fetchCourseListDetails = async () => {
	// 	let res;
	// 	try {
	// 		res = await fetch(`/apis/courses`);
	// 		if (!res.ok || res.status != 200) {
	// 			const { errorMsg, redirectUser } = getErrorMessage({
	// 				status: res?.status,
	// 				action: userActions.LIST,
	// 				module: resourceNames.COURSES
	// 			});

	// 			if (redirectUser) {
	// 				handleRedirection(res.status, url.pathname, url.search);
	// 			}

	// 			return { error: errorMsg };
	// 		}

	// 		const data = await res.json();

	// 		if (data?.length === 0 || Object.keys(data)?.length === 0) {
	// 			throw new Error('Course list not found.');
	// 		}

	// 		return data;
	// 	} catch (err) {

	// 		return {error: err.message };
	// 	}
	// };

	return {
		testimonials: await fetchTestimonials()
		// coursesData: await fetchCourseListDetails()
	};
}
