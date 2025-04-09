import { json } from '@sveltejs/kit';
import { BASE_URL, CLIENT_SECRET } from '$env/static/private';

export async function POST({ params, request, cookies }) {
	let res;
	try {
		const serviceToken = cookies.get('serviceToken');
		const createdBy = cookies.get('uuid');
		// const createdBy = cookies.get('uuid');
		

		let payload = await request.json();
		
		payload = { ...payload, createdBy: createdBy };
		

		if (serviceToken) {
			let endpoint = `http://qmsapi.ap-south-1.elasticbeanstalk.com/apis/v1/content-question-papers`;

			const options = {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Service-Authorization': 'Bearer ' + serviceToken,
					'Service-Key': CLIENT_SECRET
				},
				body: JSON.stringify(payload)
			};

			res = await fetch(endpoint, options);
			console.log('response of LINK------', res);

			if (res.status == 200) {
				const data = await res.json();
				return json(data);
			}

			return json(res, { status: res.status });
		}
	} catch (e) {
		console.error('error in question POST', e.message);
		return json(res, { status: 500 });
	}
}
