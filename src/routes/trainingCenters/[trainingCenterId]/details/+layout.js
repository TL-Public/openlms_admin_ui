import { String_Constants } from '/src/config/constants.js';
import { getErrorMessage, handleRedirection } from '$lib/utils/helper.js';
import { resourceNames, userActions } from '$lib/data.js';

export async function load({ fetch, url, parent, params }) {
	const fetchDetailsOfTc = async () => {
		let id = params?.trainingCenterId;
		let res;

		try {
			res = await fetch(`/apis/trainingCenters/${id}`);

			if (!res.ok || res.status != 200) {
				const { errorMsg, redirectUser } = getErrorMessage({
					status: res?.status,
					action: userActions.DETAILS,
					module: resourceNames.TRAINING_CENTER
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
			return { error: err.message };
		}
	};

	const courseDetailsofTC = async () => {
		let id = params?.trainingCenterId;
		let res;
		try {
			res = await fetch(`/apis/trainingCenters/${id}/courses`);

			if (!res.ok || res.status != 200) {
				const { errorMsg, redirectUser } = getErrorMessage({
					status: res?.status,
					action: userActions.LIST,
					module: resourceNames.TRAINING_CENTER_COURSE
				});

				if (redirectUser) {
					handleRedirection(res.status, url.pathname, url.search);
				}

				return { error: errorMsg };
			}

			const data = await res.json();

			if (data?.length === 0 || Object.keys(data)?.length === 0) {
				throw new Error('Training center courses not found');
			}

			return data;
		} catch (err) {
			return { error: err.message };
		}
	};

	const coursesListing = async () => {
		try {
			const parenData = await parent();
			let data = parenData.coursesData ? parenData.coursesData : [];

			if (data.error) return { error: data.error };

			let dataMap = {};
			data?.forEach((course) => {
				dataMap[course.courseCode] = {
					uuid: course.uuid,
					courseCode: course.courseCode,
					duration: course.duration,
					category: course.category,
					status: course.status,
					numberOfChapters: course.numberOfChapters,
					numberOfVideos: course.numberOfVideos,
					...course?.translations.find((translation) => translation.languageCode === 'en')
				};
			});
			return dataMap;
		} catch (err) {
			return { error: err.message };
		}
	};

	return {
		tcDetailsData: await fetchDetailsOfTc(),
		tcCourseDetailsData: await courseDetailsofTC(),
		courseList: await coursesListing()
	};
}
