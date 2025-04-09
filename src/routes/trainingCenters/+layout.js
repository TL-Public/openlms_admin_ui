// For GET API
import { String_Constants } from '/src/config/constants.js';
import { getErrorMessage, handleRedirection } from '$lib/utils/helper.js';
import { resourceNames, userActions } from '$lib/data.js';

export async function load({ fetch, depends, url }) {
	depends('rseti:all-rsetis');

	const fetchTCListDetails = async () => {
		try {
			const res = await fetch(`/apis/trainingCenters`);

			if (!res.ok || res.status != 200) {
				const { errorMsg, redirectUser } = getErrorMessage({
					status: res?.status,
					action: userActions.LIST,
					module: resourceNames.TRAINING_CENTER
				});

				if (redirectUser) {
					handleRedirection(res.status, url.pathname, url.search);
				}

				return { error: errorMsg };
			}

			const data = await res.json();
			if (data?.length === 0 || Object.keys(data)?.length === 0) {
				throw new Error('No Training center found');
			}
			return data;
		} catch (err) {
			return { error: err.message };
		}
	};
	const fetchBankList = async () => {
		try {
			const res = await fetch(`/apis/banks`);

			if (!res.ok || res.status != 200) {
				const { errorMsg, redirectUser } = getErrorMessage({
					status: res?.status,
					action: userActions.LIST,
					module: resourceNames.BANK
				});

				if (redirectUser) {
					handleRedirection(res.status, url.pathname, url.search);
				}

				return { error: errorMsg };
			}

			let data = await res.json();

			//checking for a length
			if (data?.length === 0 || Object.keys(data)?.length === 0) {
				return {
					error: 'No Banks found',
					data: [
						{
							title: 'No Bank Found'
						}
					]
				};
			}

			// adding all banks option to the list
			data = [
				{
					title: String_Constants.ALL_BANKS,
					uuid: '0'
				},
				...data
			];
			return data;
		} catch (err) {
			return {
				error: err.message
			};
		}
	};
	return {
		tcData: await fetchTCListDetails(),
		bankData: await fetchBankList()
	};
}
