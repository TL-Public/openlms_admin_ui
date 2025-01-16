import { json } from '@sveltejs/kit';

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
		const res = await fetch(
			`http://read-admin-api-dev.ap-south-1.elasticbeanstalk.com/apis/v1/rsetis`,
			options
		);
		if (!res.ok) {
			throw new Error('Failed to fetch data');
		}

		if (res.status != 200) {
			throw new Error('Failed to fetch data');
		}
		const data = await res.json();

		// console.log("this is rseti data", data)
		if (data?.length === 0 || Object.keys(data)?.length === 0) {
			throw new Error('Data not found');
		}
		return json(data);
	} catch (error) {
		return json({ error: error.message });
	}
}

export async function POST({ request, cookies }) {
	const authToken = cookies.get('authToken');
	let res;
	try {
		const req = await request.json();
		const parsedData = JSON.parse(req.data);
		console.log('parsedData', parsedData);
		res = await fetch(`http://read-admin-api-dev.ap-south-1.elasticbeanstalk.com/apis/v1/rsetis`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${authToken}`
			},
			body: JSON.stringify(parsedData)
		});
		console.log('response of POST', res.status);
		if (res.status === 409) {
			throw new Error('A training center with the same RSETI Id already exists.');
		}
		if (!res.ok) {
			throw new Error('Failed to add training center');
		}
		const responseData = await res.json();

		return json(responseData);
	} catch (error) {
		return json({ error: error.message }, { status: res.status });
	}
}
