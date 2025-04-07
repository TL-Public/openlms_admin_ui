import { String_Constants } from '/src/config/constants.js';
import { getErrorMessage, handleRedirection } from '$lib/utils/helper.js';
import { resourceNames, userActions } from '$lib/data.js';

export async function load({ fetch, data, url }) {
	const fetchCourseListDetails = async () => {
		let res;
		try {
			res = await fetch(`/apis/courses`);

			console.log(res, 'res in course list');

			if (!res.ok || res.status != 200) {
				const { errorMsg, redirectUser } = getErrorMessage({
					status: res?.status,
					action: userActions.LIST,
					module: resourceNames.COURSE
				});

				// if (redirectUser) {
				// 	handleRedirection(res.status, url.pathname, url.search);
				// }

				return { error: errorMsg };
			}

			const data = await res.json();

			if (data?.length === 0 || Object.keys(data)?.length === 0) {
				throw new Error('Data not found');
			}

			return data;
		} catch (err) {
			// handleRedirection(res.status, url.pathname, url.search);
			return { error: err.message };
		}
	};

	const fetchRsetiDetails = async () => {
		let res;
		try {
			res = await fetch(`/apis/trainingCenters`);
			if (!res.ok || res.status != 200) {
				const { errorMsg, redirectUser } = getErrorMessage({
					status: res?.status,
					action: userActions.LIST,
					module: resourceNames.TRAINING_CENTER
				});

				// if (redirectUser) {
				// 	handleRedirection(res.status, url.pathname, url.search);
				// }

				return { error: errorMsg };
			}

			const data = await res.json();

			//checking for a length
			if (data?.length === 0 || Object.keys(data)?.length === 0) {
				return [
					{
						title: 'No Rseti Found'
					}
				];
			}
			let rsetiData = data;
			// adding all rseti option to the list
			rsetiData = [
				{
					name: String_Constants.ALL_RSETIS,
					uuid: '0'
				},
				...rsetiData
			];

			return rsetiData;
		} catch (err) {
			// handleRedirection(res.status, url.pathname, url.search);
			return { status: res.status, error: err.message };
		}
	};

	const fetchStateList = async () => {
		let res;
		try {
			const res = await fetch(`/apis/states`);

			if (!res.ok || res.status != 200) {
				const { errorMsg, redirectUser } = getErrorMessage({
					status: res?.status,
					action: userActions.LIST,
					module: resourceNames.STATE
				});

				// if (redirectUser) {
				// 	handleRedirection(res.status, url.pathname, url.search);
				// }

				return { error: errorMsg };
			}

			const data = await res.json();

			//checking for a length
			if (data?.length === 0 || Object.keys(data)?.length === 0) {
				return [
					{
						title: 'No State Found'
					}
				];
			}

			// adding all states option to the list
			// data = [
			// 	{
			// 		title: String_Constants.ALL_STATES,
			// 		uuid: '0'
			// 	},
			// 	...data
			// ];
			return data;
		} catch (err) {
			// handleRedirection(res.status, url.pathname, url.search);
			return { status: res.status, error: err.message };
		}
	};

	return {
		rsetiData: await fetchRsetiDetails(),
		stateData: await fetchStateList(),
		coursesData: await fetchCourseListDetails(),
		user: data?.user || ''
	};
}
