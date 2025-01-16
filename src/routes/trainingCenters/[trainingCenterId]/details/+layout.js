import { String_Constants } from '/src/config/constants.js';

export async function load({ fetch, url, parent, params }) {
	const fetchDetailsOfTc = async () => {
		let id = params?.trainingCenterId;

		try {
			const res = await fetch(`/apis/trainingCenters/details/${id}`);
			if (!res.ok) {
				throw new Error('Data not found');
			}
			if (res.status !== 200) {
				throw new Error('Data not found');
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

		try {
			const res = await fetch(`/apis/trainingCenters/courses/${id}`);

			if (!res.ok || res.status !== 200) {
				throw new Error('Data not found');
			}
			const data = await res.json();
			console.log('courses of a TC', data)
			if (data?.length === 0 || Object.keys(data)?.length === 0) {
				throw new Error('Data not found');
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

			let dataMap = {};
			data.forEach((course) => {
				dataMap[course.courseCode] = {
					uuid: course.uuid,
					courseCode: course.courseCode,
					duration: course.duration,
					category: course.category,
					status: course.status,
					numberOfChapters: course.numberOfChapters,
					numberOfVideos: course.numberOfVideos,
					...course.translations.find((translation) => translation.languageCode === 'en')
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
