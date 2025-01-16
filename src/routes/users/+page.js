// For GET API
import { String_Constants } from '/src/config/constants.js';

import { error } from '@sveltejs/kit';

export async function load({ fetch, depends }) {
	depends('users:all-users');

	const fetchUsers = async () => {
		try {
			const res = await fetch(`/apis/users`);

			if (!res.ok || res.status !== 200) {
				throw error(404, 'Data not found');
			}

			const data = await res.json();
			if (data?.length === 0 || Object.keys(data)?.length === 0) {
				throw error(404, 'Data not found');
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
