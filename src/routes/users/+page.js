import { String_Constants } from '/src/config/constants.js';
import { browser } from '$app/environment';
import { userDetails } from '/src/routes/store.js';
import { getErrorMessage, handleRedirection } from '$lib/utils/helper.js';
import { resourceNames, userActions } from '$lib/data.js';

export async function load({ fetch, depends, parent, url }) {
	if (browser) {
		const { user } = await parent();
		userDetails?.set(user);
	}

	depends('users:all-users');

	const fetchUsers = async () => {
		let res;
		try {
			res = await fetch(`/apis/users`);

			if (!res.ok || res.status != 200) {
				const { errorMsg, redirectUser } = getErrorMessage({
					status: res?.status,
					action: userActions.LIST,
					module: resourceNames.USERS
				});

				if (redirectUser) {
					handleRedirection(res.status, url.pathname, url.search);
				}

				return { error: errorMsg };
			}

			const data = await res.json();
			if (data?.length === 0 || Object.keys(data)?.length === 0) {
				throw new Error('No users found');
			}

			return data;
		} catch (err) {
			return { error: err.message };
		}
	};

	return {
		usersList: await fetchUsers()
	};
}
