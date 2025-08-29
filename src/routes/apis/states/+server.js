import { json } from '@sveltejs/kit';
import { BASE_URL } from '$lib/config';

let res;

// API to get list of all states
export async function GET({ cookies }) {
	const authToken = cookies.get('authToken');

	try {
		const options = {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${authToken}`
			}
		};
		res = await fetch(`${BASE_URL}/apis/v1/states`, options);

		if (!res.ok) {
			throw new Error('Failed to fetch data');
		}

		if (res?.status != 200) {
			throw new Error('Failed to fetch data');
		}
		const data = await res.json();

		if (data?.length === 0 || Object.keys(data)?.length === 0) {
			throw new Error('Data not found');
		}

		// sort data before returning response
		data?.sort(function (a, b) {
			if (a.name < b.name) {
				return -1;
			}
			if (a.name > b.name) {
				return 1;
			}
			return 0;
		});

		return json(data);
	} catch (error) {
		return json({ error: error.message, status: res?.status }, { status: res?.status });
	}
}


export async function POST({ request, params, cookies }) {
	const authToken = cookies.get('authToken');
	let res;
	try {
		const body = await request.json();
		console.log(JSON.stringify(body))

		res = await fetch(`${BASE_URL}/apis/v1/states`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${authToken}`
			},
			body: JSON.stringify(body)
		});

		console.log('res', res)
		if (!res.ok) {
			throw new Error('Failed to add state');
		}

		const responseData = await res.json();
		console.log('responseData', responseData)
		return json({ responseData }, { status: res.status });
	} catch (error) {
		return json({ error: error.message, status: res.status }, { status: res?.status });
	}
}